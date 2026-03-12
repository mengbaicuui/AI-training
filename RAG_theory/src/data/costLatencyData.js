export const costSections = [
  {
    id: 'cost-breakdown',
    title: '成本拆解',
    icon: '💰',
    subsections: [
      {
        title: '每次请求的成本组成',
        content: `要优化成本，首先要知道钱花在哪。一次 RAG 请求涉及多个计费环节，各环节占比因架构而异。`,
        components: [
          {
            step: 'Embedding Query',
            desc: '将用户 query 向量化',
            costRange: '$0.00002 - $0.0001 / query',
            note: '极低，通常可忽略；但 query 改写可能调用多次',
            percentage: '< 1%'
          },
          {
            step: 'Retrieval（向量库/ES）',
            desc: '向量检索 + 可能的 BM25 检索',
            costRange: '按基础设施分摊：$0.0001 - $0.001 / query',
            note: '托管服务按 RU/QPS 计费；自建按 GPU/CPU 成本分摊',
            percentage: '5-15%'
          },
          {
            step: 'Rerank（Cross-encoder）',
            desc: '对 top-k 候选重新打分',
            costRange: '$0.0002 - $0.002 / query（取决于候选数和模型）',
            note: 'Cohere Rerank API 按 search unit 计费；自建用 GPU 推理',
            percentage: '5-10%'
          },
          {
            step: 'LLM 生成（Input tokens）',
            desc: 'System prompt + 检索 context + 用户 query',
            costRange: '$0.001 - $0.05 / query（取决于 context 长度和模型）',
            note: '最大变量！context 长度直接决定 input token 成本',
            percentage: '40-60%'
          },
          {
            step: 'LLM 生成（Output tokens）',
            desc: '生成的回答 + 引用',
            costRange: '$0.002 - $0.03 / query',
            note: 'Output token 单价通常是 input 的 2-4 倍',
            percentage: '25-40%'
          }
        ]
      },
      {
        title: '成本估算模型',
        content: `以典型企业 RAG 为例，估算日/月成本。`,
        scenarios: [
          {
            name: '轻量级（内部知识库）',
            qps: '100 queries/天',
            model: 'GPT-4o-mini',
            contextLength: '~2000 tokens',
            dailyCost: '~$1-3',
            monthlyCost: '~$30-90'
          },
          {
            name: '中等规模（客服系统）',
            qps: '5,000 queries/天',
            model: 'GPT-4o / Claude Sonnet',
            contextLength: '~4000 tokens',
            dailyCost: '~$50-150',
            monthlyCost: '~$1,500-4,500'
          },
          {
            name: '高流量（面向用户产品）',
            qps: '100,000 queries/天',
            model: 'GPT-4o / Claude Opus',
            contextLength: '~6000 tokens',
            dailyCost: '~$2,000-8,000',
            monthlyCost: '~$60,000-240,000'
          }
        ]
      },
      {
        title: '隐性成本',
        content: `除了直接 API 调用费用，还有一些容易忽视的成本。`,
        hiddenCosts: [
          'Ingestion pipeline 成本：文档解析、chunking、embedding 生成（大批量时不可忽视）',
          '向量库存储成本：随文档量增长线性增加，高维向量存储不便宜',
          '评估成本：LLM-as-judge 每条评估也要消耗 token（每月评估预算可能 $100-500）',
          '重试成本：API 失败重试、timeout 重试导致的额外调用',
          '人力成本：标注、评估集维护、系统调优的工程师时间'
        ]
      }
    ]
  },
  {
    id: 'caching',
    title: '缓存策略',
    icon: '🗄️',
    subsections: [
      {
        title: '缓存层次',
        content: `缓存是降低成本最直接的手段，但 RAG 场景下的缓存比传统 web 缓存更复杂——因为语义相似的 query 应该命中同一个缓存。`,
        layers: [
          {
            name: '语义缓存（Semantic Cache）',
            mechanism: '将 query embedding 化，在缓存中搜索语义相似的历史 query（余弦相似度 > 阈值），命中则返回缓存的回答',
            hitRate: '20-40%（取决于 query 重复度）',
            pros: ['大幅减少 LLM 调用', '"怎么退货" 和 "退货流程是什么" 可以命中同一缓存'],
            cons: ['相似度阈值难以调优——太松导致错误命中，太紧导致命中率低', '不适合时效性强的查询'],
            tools: 'GPTCache（开源）、Redis + 向量搜索、Momento（商业）',
            implementation: '建议初始阈值 0.95，根据错误命中率逐步调低'
          },
          {
            name: '检索缓存（Retrieval Cache）',
            mechanism: '缓存 query + metadata filter 的组合 → 检索结果（doc IDs + scores），避免重复的向量检索',
            hitRate: '30-50%（相同 query 不同用户可能命中）',
            pros: ['减少向量库查询压力', '对于 rerank 后的结果缓存价值更高'],
            cons: ['知识库更新后需要失效', '不同用户 ACL 不同需要考虑权限'],
            tools: 'Redis / Memcached + hash(query+filter) 作为 key',
            implementation: '注意 cache key 必须包含 ACL 相关参数，否则可能跨权限命中'
          },
          {
            name: '答案缓存（Exact Answer Cache）',
            mechanism: '完全相同的 query 直接返回缓存的回答',
            hitRate: '10-20%（取决于 query 重复度）',
            pros: ['零延迟、零成本', '最简单可靠'],
            cons: ['只能精确匹配', '知识库更新后必须失效'],
            tools: '任何 KV 存储',
            implementation: 'cache key = hash(query + user_role + filter_params)'
          }
        ]
      },
      {
        title: '缓存失效策略',
        content: `缓存失效是分布式系统中"两大难题之一"，在 RAG 中尤其重要——过期数据比没有数据更危险。`,
        strategies: [
          {
            strategy: 'TTL（Time-To-Live）',
            desc: '设置固定过期时间',
            bestFor: '时效性不强的内容（如政策文档），TTL 设 24-72 小时',
            risk: 'TTL 内如果文档更新了，用户会看到过时回答'
          },
          {
            strategy: '事件驱动失效',
            desc: '文档更新/删除时主动清除相关缓存',
            bestFor: '时效性要求高的场景',
            risk: '需要维护"文档→缓存"的反向索引，实现复杂'
          },
          {
            strategy: '版本标记',
            desc: 'Cache key 包含知识库版本号，知识库更新时版本号递增',
            bestFor: '批量更新的场景（如每日同步）',
            risk: '粒度粗——一个文档更新导致全部缓存失效'
          },
          {
            strategy: '混合策略（推荐）',
            desc: '短 TTL（如 4 小时）+ 文档变更时主动失效',
            bestFor: '平衡一致性和命中率',
            risk: '系统复杂度增加'
          }
        ]
      }
    ]
  },
  {
    id: 'model-routing',
    title: '分层模型路由',
    icon: '🔀',
    subsections: [
      {
        title: '核心思路',
        content: `不是所有 query 都需要调用最强（最贵）的模型。简单问题用小模型甚至直接走 FAQ 匹配，复杂问题才上大模型。这可以降低 40-70% 的 LLM 成本。`,
        tiers: [
          {
            tier: 'Tier 0: FAQ 直接匹配',
            desc: 'Query 与预设 FAQ 语义匹配，直接返回预编写答案，零 LLM 成本',
            suitable: '高频重复问题（"公司地址在哪"、"如何重置密码"）',
            cost: '$0',
            coverage: '10-30% 的查询'
          },
          {
            tier: 'Tier 1: 小模型 / 快速模型',
            desc: '使用 GPT-4o-mini / Claude Haiku / Gemini Flash 等低成本模型',
            suitable: '事实型简单查询、单文档检索即可回答的问题',
            cost: '大模型的 1/10 - 1/5',
            coverage: '40-50% 的查询'
          },
          {
            tier: 'Tier 2: 大模型',
            desc: '使用 GPT-4o / Claude Sonnet / Gemini Pro 等主力模型',
            suitable: '需要多文档综合、推理、对比分析的复杂问题',
            cost: '标准成本',
            coverage: '20-30% 的查询'
          },
          {
            tier: 'Tier 3: 最强模型 + 长 context',
            desc: '使用 Claude Opus / GPT-4o-max 等顶级模型',
            suitable: '极复杂的多跳推理、需要全面分析的高价值问题',
            cost: '标准成本的 3-5x',
            coverage: '< 5% 的查询'
          }
        ]
      },
      {
        title: 'Query 分类器设计',
        content: `模型路由的核心是一个高效的 query 分类器——决定每个 query 走哪条路线。`,
        approaches: [
          {
            approach: '基于规则',
            desc: 'Query 长度、关键词匹配、是否匹配 FAQ 库',
            pros: '快速、零成本、可解释',
            cons: '覆盖有限、无法处理复杂意图',
            recommendation: '作为第一层（Tier 0 判断）'
          },
          {
            approach: '轻量分类模型',
            desc: '训练一个小型分类器（BERT-tiny / distilbert），判断 query 复杂度',
            pros: '推理快（< 5ms）、准确度不错',
            cons: '需要标注数据训练',
            recommendation: '主力方案——在 Tier 1/2 之间做决策'
          },
          {
            approach: 'LLM 自判断',
            desc: '用小模型先判断"这个问题需要多复杂的处理"',
            pros: '灵活、无需训练',
            cons: '引入额外 LLM 调用的延迟和成本',
            recommendation: '在分类器不确定时作为兜底'
          }
        ],
        costSavings: '典型节省：如果 50% 的 query 走 Tier 1（成本 1/10），20% 走 Tier 0（成本 0），总 LLM 成本可降低 50-60%'
      }
    ]
  },
  {
    id: 'retrieval-opt',
    title: '检索侧优化',
    icon: '🔍',
    subsections: [
      {
        title: 'Top-k 调优',
        content: `Top-k 是最容易调但影响最大的参数之一。k 太大浪费 token（context 过长）和检索时间，k 太小可能遗漏相关文档。`,
        guidelines: [
          '初始检索 top-k（送入 reranker 前）：通常 20-50',
          'Rerank 后截断 k：通常 3-8，取决于平均 chunk 大小和 LLM context window',
          '黄金法则：初始 k ÷ rerank 后 k ≈ 3-5x 的缩比',
          '动态 k：根据 query 复杂度调整——简单问题 k=3，复杂问题 k=8',
          '验证方法：在评估集上逐步增大 k，画 Recall@k 曲线，找到拐点（recall 增速明显放缓的点）'
        ]
      },
      {
        title: 'Embedding 维度压缩',
        content: `高维 embedding 存储成本高、检索慢。Matryoshka Representation Learning（MRL）让你在精度和效率间灵活取舍。`,
        details: [
          'Matryoshka Embedding：训练时让前 N 维也具有良好的检索能力',
          '典型维度选择：1536d → 512d（精度损失 < 2%）→ 256d（精度损失 < 5%）',
          '存储节省：维度从 1536 降到 512，存储和检索成本降为 1/3',
          '支持的模型：OpenAI text-embedding-3-*（原生支持）、Cohere embed-v4、GTE-Qwen2.5（fine-tune 后支持）',
          '二进制量化：将 float32 → binary（1bit），存储降 32x，用于第一阶段粗筛'
        ]
      },
      {
        title: 'ANN 索引参数调优',
        content: `ANN（Approximate Nearest Neighbor）索引的参数直接影响检索速度和精度的 trade-off。`,
        params: [
          {
            index: 'HNSW（主流选择）',
            param: 'ef_construction',
            desc: '建索引时的搜索范围——越大索引质量越高但建索引越慢',
            recommendation: '128-256（建索引时间不敏感可以设更高）'
          },
          {
            index: 'HNSW',
            param: 'ef_search',
            desc: '查询时的搜索范围——越大精度越高但延迟越大',
            recommendation: '64-128 日常；需要高 recall 时设 256+'
          },
          {
            index: 'HNSW',
            param: 'M',
            desc: '每个节点的连接数——影响图结构质量',
            recommendation: '16-32（M=16 通常够用，大数据集可用 32）'
          },
          {
            index: 'IVF（Faiss）',
            param: 'nlist / nprobe',
            desc: 'nlist=聚类数，nprobe=查询时搜索的聚类数',
            recommendation: 'nlist=sqrt(n)，nprobe=nlist/10（调整以平衡精度和速度）'
          }
        ]
      },
      {
        title: '预计算与延迟索引',
        content: `将耗时操作前移到离线阶段，降低在线延迟。`,
        techniques: [
          '预计算 embedding：文档入库时就完成 embedding，不在查询时计算',
          '预计算 rerank score：对高频 query 预先计算 rerank 结果并缓存',
          '延迟索引更新：不要每入库一条就 rebuild 索引，批量积累后统一更新',
          'Warm-up 缓存：系统启动时预热高频 query 的检索缓存',
          '增量索引：支持实时插入而非全量 rebuild（HNSW 天然支持，IVF 需要特殊处理）'
        ]
      }
    ]
  },
  {
    id: 'generation-opt',
    title: '生成侧优化',
    icon: '⚡',
    subsections: [
      {
        title: 'Context Window 精简',
        content: `送入 LLM 的 context 越短，成本越低、延迟越小、生成质量可能反而更好（less noise）。`,
        techniques: [
          {
            technique: '严格 Rerank + 截断',
            desc: '只保留 reranker 打分最高的 3-5 个 chunk',
            saving: '减少 50-70% input tokens',
            risk: '可能丢失多文档综合场景的相关信息'
          },
          {
            technique: 'Chunk 摘要',
            desc: '对检索到的 chunk 先用小模型做摘要，只放摘要进 context',
            saving: '减少 60-80% input tokens',
            risk: '摘要可能丢失细节，增加一次 LLM 调用'
          },
          {
            technique: '动态 Context 预算',
            desc: '根据 query 复杂度动态分配 context 长度——简单问题给 1000 tokens，复杂问题给 4000 tokens',
            saving: '平均减少 30-50% input tokens',
            risk: '需要 query 分类器支持'
          },
          {
            technique: 'Sentence-level extraction',
            desc: '从 chunk 中只提取与 query 最相关的句子，而非整个 chunk',
            saving: '减少 40-60% input tokens',
            risk: '可能丢失上下文连贯性'
          }
        ]
      },
      {
        title: 'Streaming 与并行化',
        content: `延迟优化的两大利器：让用户更早看到结果，以及让多个步骤并行执行。`,
        strategies: [
          {
            strategy: 'Streaming Response',
            desc: 'LLM 生成结果流式返回，用户无需等待完整回答',
            benefit: '感知延迟大幅降低（TTFT 通常 < 500ms）',
            implementation: 'SSE / WebSocket + 前端流式渲染'
          },
          {
            strategy: '多路召回并行',
            desc: 'BM25 检索和向量检索并行执行，而非串行',
            benefit: '检索延迟从 t(bm25) + t(vector) 降为 max(t(bm25), t(vector))',
            implementation: 'asyncio.gather / Promise.all'
          },
          {
            strategy: 'Query 改写并行',
            desc: '原始 query 和改写 query 同时检索，合并结果',
            benefit: '不增加延迟的情况下提升 recall',
            implementation: '改写和检索 pipeline 并行化'
          },
          {
            strategy: 'Speculative execution',
            desc: '在等待 rerank 的同时，先用 top-1 结果启动 LLM 生成',
            benefit: '复杂场景下减少 200-500ms',
            implementation: '需要支持 context 追加或做好 fallback'
          }
        ]
      },
      {
        title: '预算化控制',
        content: `设定每请求的资源上限，防止长尾请求失控。`,
        budgets: [
          {
            dimension: 'Max Input Tokens',
            typical: '4000-8000 tokens',
            enforcement: '超出则截断最低分的 chunk',
            why: '控制成本、防止 "lost in the middle"'
          },
          {
            dimension: 'Max Output Tokens',
            typical: '500-1500 tokens',
            enforcement: 'LLM API 参数控制',
            why: '防止冗长回答浪费 token'
          },
          {
            dimension: 'Max Tool Calls（Agentic 场景）',
            typical: '3-5 次',
            enforcement: 'Agent 框架的循环限制',
            why: '防止 agent 陷入无限循环'
          },
          {
            dimension: 'Max Latency',
            typical: 'p95 < 8s',
            enforcement: 'timeout 后返回部分结果或 fallback',
            why: '保证用户体验'
          },
          {
            dimension: 'Max Cost Per Request',
            typical: '$0.05-0.20',
            enforcement: '超出预算时降级到小模型',
            why: '防止异常请求拖高成本'
          }
        ]
      }
    ]
  },
  {
    id: 'slo',
    title: 'SLO 设定与监控',
    icon: '📊',
    subsections: [
      {
        title: '关键 SLO 定义',
        content: `SLO（Service Level Objective）是你向用户（内部或外部）承诺的服务质量目标。没有 SLO 的系统永远"差不多就行"。`,
        slos: [
          {
            metric: 'E2E 延迟',
            p50: '< 2s',
            p95: '< 5s',
            p99: '< 10s',
            note: '包含网络传输；Streaming 场景以 TTFT（Time To First Token）为准'
          },
          {
            metric: '可用性',
            target: '99.9%（每月 < 44 分钟不可用）',
            note: '包括依赖服务（LLM API / 向量库）的可用性'
          },
          {
            metric: '每请求成本',
            target: '< $0.05（p95）',
            note: '不含基础设施分摊'
          },
          {
            metric: '吞吐量',
            target: '根据业务峰值的 2x 设定',
            note: '需要做压力测试验证'
          },
          {
            metric: 'Faithfulness',
            target: '≥ 0.90（p95 按日统计）',
            note: '核心质量 SLO，低于此值触发告警'
          }
        ]
      },
      {
        title: '告警阈值设定',
        content: `告警要分级——不是所有问题都需要半夜把人叫起来。`,
        levels: [
          {
            level: 'P1（Critical）',
            criteria: '可用性 < 99%、Faithfulness < 0.80、任何安全事件',
            response: '15 分钟内响应，立即回滚/修复',
            notify: 'PagerDuty + 电话'
          },
          {
            level: 'P2（High）',
            criteria: 'p95 延迟 > 10s、负反馈率 > 20%、成本异常飙升',
            response: '1 小时内响应',
            notify: 'Slack 告警频道'
          },
          {
            level: 'P3（Medium）',
            criteria: 'p50 延迟 > 3s、Recall 下降 > 5%、缓存命中率下降',
            response: '下一个工作日处理',
            notify: '日报邮件'
          },
          {
            level: 'P4（Low）',
            criteria: '非核心指标轻微波动',
            response: '在下次迭代中评估',
            notify: '看板/仪表盘'
          }
        ]
      },
      {
        title: '容量规划',
        content: `容量规划帮你回答"还能扛多少流量"和"什么时候需要扩容"。`,
        planningItems: [
          '向量库容量：当前文档数/向量数 vs 最大容量，按增长速率估算何时需要扩容',
          'QPS 余量：当前峰值 QPS vs 系统极限（压测得出），保持 50% 余量',
          'LLM API 配额：当前用量 vs Rate Limit，提前申请提额',
          '存储增长：向量存储 + 审计日志 + 缓存，按月增长率估算',
          '成本线性推演：流量翻倍时成本是否也翻倍？有没有非线性的成本陡增点？',
          '预案：流量突增 3x 时的降级方案（切小模型、关 rerank、增大缓存 TTL）'
        ]
      }
    ]
  }
];

export const costWarmupQuestions = [
  {
    question: '如果你的 RAG 系统每天处理 10 万次查询，你能估算出月账单吗？哪个环节占了大头？',
    hook: '大多数人低估了 LLM input tokens 的成本——context 越长越贵'
  },
  {
    question: '在不降低回答质量的前提下，你能把每请求成本降低 50% 吗？',
    hook: '缓存 + 模型路由 + context 精简，三板斧组合拳'
  }
];

export const costQuestions = [
  {
    question: '语义缓存的相似度阈值如何调优？太松和太紧分别有什么问题？',
    hint: '考虑命中率、错误命中率、以及不同类型 query 的差异',
    answer: '阈值太松（如 0.85）：语义不同的 query 被错误命中，返回无关回答——这比没有缓存更糟。阈值太紧（如 0.99）：几乎只有完全相同的 query 才能命中，与精确匹配缓存无异，失去了语义缓存的价值。调优方法：1）收集线上 query 日志，聚类分析相似 query 的余弦相似度分布；2）从 0.95 开始，逐步降低到 0.92/0.90，监控错误命中率（用人工抽样或 LLM-as-judge）；3）按 query 类型设不同阈值——事实型问题可以松一些（0.90），分析型问题要紧一些（0.95+）；4）对高风险场景（金融/医疗），宁可命中率低也不要错误命中。'
  },
  {
    question: '分层模型路由中，query 分类器的错误（把复杂问题路由到小模型）如何检测和修复？',
    hint: '思考分类错误的影响和监控手段',
    answer: '检测方法：1）对小模型回答做 Faithfulness 和 Relevancy 评估——如果低于阈值，说明该 query 被错误降级了；2）监控各 tier 的用户负反馈率——如果 Tier 1 的负反馈率明显高于 Tier 2，说明有误分类；3）定期从 Tier 1 抽样 query 送入 Tier 2 对比——如果大模型结果明显更好，这些 query 应该被升级。修复方法：1）将误分类样本加入训练集重新训练分类器；2）增加"不确定"类别——分类器不够自信时默认走大模型（宁可多花钱也不砸质量）；3）online learning：根据用户反馈实时调整分类边界。关键原则：模型路由的目标是"省钱但不降质"，一旦检测到质量下降，应该立即放宽降级条件。'
  },
  {
    question: '如何设计 RAG 系统的容量规划？什么信号预示着你需要扩容？',
    hint: '从延迟、成本、质量三个维度考虑',
    answer: '扩容信号：1）延迟：p95 延迟持续上升，趋近 SLO 上限的 80%——说明系统接近饱和；2）向量库：检索延迟增加 + ANN recall 下降——数据量增长导致索引效率下降；3）QPS 余量 < 30%——峰值流量离系统极限太近；4）缓存命中率下降——query 多样性增加，缓存失效。规划方法：a）每月绘制关键指标趋势图（QPS增长、延迟变化、成本增长）；b）根据业务计划预估未来 3-6 个月的流量增长；c）做分级扩容预案：Tier 1（增加副本/缓存）→ Tier 2（升级向量库规格）→ Tier 3（架构变更/分片）；d）成本非线性预警：当流量增长 20% 但成本增长 50% 时，优先做效率优化而非简单扩容。'
  }
];

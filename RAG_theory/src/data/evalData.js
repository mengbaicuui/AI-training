export const evalSections = [
  {
    id: 'metrics',
    title: '分层指标体系',
    icon: '📏',
    subsections: [
      {
        title: '检索层指标',
        content: `检索质量是 RAG 成败的基石。如果检索到的内容就是错的，后面再强的 LLM 也救不回来。检索层指标直接衡量"给 LLM 的食材好不好"。`,
        metrics: [
          {
            name: 'Recall@k',
            formula: '在 top-k 结果中命中的相关文档数 / 全部相关文档数',
            interpretation: '衡量"该找到的找到了多少"，k 通常取 5/10/20',
            pitfall: '纯 recall 不考虑排序——即使相关文档排在最后也算命中',
            target: 'Recall@10 ≥ 0.85 是基本要求，≥ 0.95 是优秀'
          },
          {
            name: 'MRR（Mean Reciprocal Rank）',
            formula: '1/|Q| × Σ(1/rank_i)，rank_i 是第一个相关文档的排名',
            interpretation: '衡量"最相关的文档排多靠前"，对排序质量敏感',
            pitfall: '只关注第一个相关结果的位置，忽略了后续的',
            target: 'MRR ≥ 0.7 是及格线'
          },
          {
            name: 'nDCG（Normalized Discounted Cumulative Gain）',
            formula: '考虑文档的分级相关性（0/1/2/3），位置越靠前权重越高',
            interpretation: '最全面的检索指标：同时考虑相关性等级和排序位置',
            pitfall: '需要人工标注分级相关性，构建成本高',
            target: 'nDCG@10 ≥ 0.6'
          },
          {
            name: '有效召回率（Effective Recall after ACL）',
            formula: 'ACL 过滤后实际可用的相关文档数 / 全部相关文档数',
            interpretation: '在权限过滤后，用户实际能看到的 recall 是多少',
            pitfall: '这个指标在安全 Tab 提到的 pre-filter 场景下尤其重要',
            target: '应该与无 ACL 的 Recall 差距 < 10%'
          }
        ]
      },
      {
        title: '生成层指标',
        content: `生成层指标衡量 LLM 基于检索内容产出回答的质量。这是用户直接感知的部分。`,
        metrics: [
          {
            name: 'Faithfulness（忠实度）',
            formula: '回答中有检索 context 支撑的 claim 数 / 回答中总 claim 数',
            interpretation: '衡量"LLM 是不是只说了有据可依的话"——幻觉检测的核心指标',
            howToMeasure: '用 LLM-as-judge：先拆解回答中的 claims，再逐条验证是否有 context 支撑',
            target: 'Faithfulness ≥ 0.90，金融/医疗场景要求 ≥ 0.95'
          },
          {
            name: 'Answer Relevancy（回答相关性）',
            formula: '回答与原始问题的语义相关度评分',
            interpretation: '衡量"回答是否真正在答用户的问题"——防止答非所问',
            howToMeasure: '生成多个假设问题，计算与原始问题的余弦相似度均值',
            target: 'Answer Relevancy ≥ 0.85'
          },
          {
            name: 'Citation Correctness（引用正确性）',
            formula: '正确引用数 / 总引用数',
            interpretation: '引用指向的文档确实支撑了对应的 claim',
            howToMeasure: '逐条验证引用与 claim 的对应关系',
            target: '≥ 0.95——错误引用比没有引用更糟糕'
          },
          {
            name: 'Citation Coverage（引用覆盖度）',
            formula: '有引用支撑的 claim 数 / 总 claim 数',
            interpretation: '回答中每个论断是否都标注了来源',
            howToMeasure: '逐 claim 检查是否关联了引用',
            target: '≥ 0.85——允许一些常识性论断不标注引用'
          }
        ]
      },
      {
        title: '运营层指标',
        content: `运营指标让你知道系统在真实环境中的表现——不仅是"对不对"，还有"好不好用"。`,
        metrics: [
          {
            name: '失败类型分布',
            desc: '将所有失败案例归类：没召回 / 召回错 / 生成幻觉 / 引用错 / 格式错 / 拒绝回答',
            actionable: '是改进的方向盘——如果 60% 的失败是"没召回"，优先优化检索'
          },
          {
            name: 'E2E Latency（端到端延迟）',
            desc: 'p50 / p95 / p99 延迟分布，按环节拆解：embedding + retrieval + rerank + generation',
            actionable: '找到瓶颈环节，针对性优化'
          },
          {
            name: '每请求成本',
            desc: 'embedding API + retrieval infra + reranker + LLM tokens 的总成本',
            actionable: '成本优化的基线（详见"成本/延迟"Tab）'
          },
          {
            name: '用户满意度',
            desc: 'Thumbs up/down 比率、CSAT 评分、follow-up 问题比率',
            actionable: '最终的北极星指标——但需要足够的数据量才有统计意义'
          }
        ]
      }
    ]
  },
  {
    id: 'rag-triad',
    title: 'RAG Triad',
    icon: '🔺',
    subsections: [
      {
        title: '三角关系',
        content: `RAG Triad 是评估 RAG 系统的三个核心维度：Context Relevance、Groundedness、Answer Relevance。这三个指标形成一个闭环——任何一个失败，用户体验就崩溃。`,
        triad: [
          {
            name: 'Context Relevance（上下文相关性）',
            question: '检索到的 context 与用户的 query 相关吗？',
            failure: '检索了一堆不相关的 chunk → LLM 要么被噪声干扰产生幻觉，要么给出泛泛的回答',
            measurement: '对每个 retrieved chunk 评估与 query 的相关度，取均值',
            improveBy: '优化 embedding 模型、改善 chunking 策略、引入 reranker'
          },
          {
            name: 'Groundedness（有据可依度）',
            question: '生成的回答是否有 context 支撑？',
            failure: 'LLM 编造了 context 中没有的内容 → 幻觉！用户可能做出错误决策',
            measurement: '拆解回答中的 claims，逐条检查是否在 context 中有依据',
            improveBy: '更强的 system prompt 约束、few-shot 示例、structured output、选择 faithfulness 更好的模型'
          },
          {
            name: 'Answer Relevance（回答相关性）',
            question: '最终回答是否针对用户的问题？',
            failure: '回答虽然有据可依但答非所问 → 用户得不到想要的信息',
            measurement: '从回答反推可能的问题，与原始问题比较语义相似度',
            improveBy: '改善 query 理解、优化 prompt template、确保 context 包含答案'
          }
        ]
      },
      {
        title: 'RAGAS 三指标',
        content: `如果说 RAG Triad 是概念框架，那么 **RAGAS** 就是更工程化、可直接落地到代码里的指标集合。课堂里最常用的三项是：**Context Precision**（给到模型的上下文是否真的相关）、**Faithfulness**（回答是否有据可依）、**Answer Relevancy**（回答是否真正回答了问题）。它们和 Triad 一一对应，但更适合直接做离线评估和 CI 回归。`,
        triad: [
          {
            name: 'Context Precision（上下文精度）',
            question: 'retrieved contexts 里真正有用、对回答有贡献的内容占比高吗？',
            failure: '召回里混进太多噪声 chunk，模型虽然有材料可用，但被无关上下文稀释，回答质量下降。',
            measurement: '给定 query、reference 和 retrieved contexts，逐条判断上下文是否对最终回答有帮助。',
            improveBy: '提升检索排序质量、加入 reranker、优化 chunking 与 metadata filter。'
          },
          {
            name: 'Faithfulness（忠实度）',
            question: '最终回答中的论断，是否都能被检索到的 context 支撑？',
            failure: '模型看起来回答得很完整，但混入了 context 中没有的推断或编造内容。',
            measurement: '拆解回答里的 claims，逐条验证是否能从 retrieved contexts 中直接推出。',
            improveBy: '加强 grounding prompt、减少噪声上下文、选择更忠实的模型。'
          },
          {
            name: 'Answer Relevancy（回答相关性）',
            question: '最终回答是否真正对准了用户问题，而不是泛泛而谈？',
            failure: '回答有依据，但答偏了重点，或者只覆盖了问题的一部分。',
            measurement: '从回答反推潜在问题，与原始用户问题做语义相似度比较。',
            improveBy: '改进 query 理解、优化 prompt 模板、确保 context 中确实含有目标答案。'
          }
        ]
      },
      {
        title: '失败模式矩阵',
        content: `不同的 triad 指标失败组合指向不同的根因：`,
        failureMatrix: [
          {
            scenario: 'Context 不相关 + Groundedness 高 + Answer 不相关',
            diagnosis: '检索出了错误内容，LLM 忠实地基于错误内容回答',
            fix: '修检索：embedding/chunking/reranker'
          },
          {
            scenario: 'Context 相关 + Groundedness 低 + Answer 相关',
            diagnosis: 'LLM 忽略了 context 自己发挥，但恰好答对了',
            fix: '加强 grounding 约束：更好的 prompt/选择更忠实的模型'
          },
          {
            scenario: 'Context 相关 + Groundedness 高 + Answer 不相关',
            diagnosis: 'LLM 忠实地引用了 context 但理解错了用户意图',
            fix: '改善 query 理解和 prompt 设计'
          },
          {
            scenario: '三个都低',
            diagnosis: '系统性失败——检索、生成、理解全线崩溃',
            fix: '从 query 理解开始逐层 debug，可能需要架构级调整'
          }
        ]
      }
    ]
  },
  {
    id: 'failure-tree',
    title: '失败归因树',
    icon: '🌳',
    subsections: [
      {
        title: '系统性分类框架',
        content: `当 RAG 系统给出错误回答时，需要系统性地定位根因。失败归因树帮助你从"结果不对"回溯到"哪一步出了问题"。这是从 demo 走向生产的关键能力。`,
        tree: [
          {
            level1: '没召回（相关文档未出现在 top-k 中）',
            causes: [
              {
                level2: 'Query 理解错误',
                details: '用户意图被误解、缩略语/专业术语未识别、多义词消歧失败',
                fix: 'Query 改写、术语词典、intent detection'
              },
              {
                level2: 'Embedding 质量差',
                details: '语义相似但 embedding 距离远（如：问"退货政策"但文档标题是"售后服务流程"）',
                fix: '换更好的 embedding 模型（2026推荐：GTE-Qwen2.5、NV-Embed-v2）、fine-tune embedding'
              },
              {
                level2: 'Metadata filter 过严',
                details: 'Pre-filter 的 ACL/时间/类型 filter 把相关文档过滤掉了',
                fix: '检查 filter 逻辑、放宽 filter 条件、用 hybrid（先不 filter 对比结果）'
              },
              {
                level2: '文档没入库',
                details: 'Ingestion pipeline 失败、文档格式不支持、新文档还没同步',
                fix: 'Ingestion 监控与告警、覆盖率检查、增量同步机制'
              },
              {
                level2: 'Chunking 不当',
                details: '关键信息被切断在两个 chunk 之间，或被稀释在过大的 chunk 中',
                fix: '调整 chunk 策略（大小/overlap/语义切分）、parent-child chunking'
              }
            ]
          },
          {
            level1: '召回错（top-k 中相关文档不够或被噪声淹没）',
            causes: [
              {
                level2: '噪声 chunk 占比高',
                details: '大量部分相关或表面相似但实质不同的 chunk 排在前面',
                fix: 'Reranker（cross-encoder）、提高 embedding 质量、negative mining'
              },
              {
                level2: '排序质量差',
                details: '相关文档在候选池中但排名靠后，被 top-k 截断',
                fix: '增加初始 top-k → rerank → 截断、hybrid retrieval 融合多路信号'
              },
              {
                level2: '相似度分布平坦',
                details: '所有候选文档的得分都差不多，模型区分不出好坏',
                fix: '更强的 embedding 模型、对比学习 fine-tune、引入 BM25 等稀疏信号'
              }
            ]
          },
          {
            level1: '生成错（检索对了但 LLM 回答错）',
            causes: [
              {
                level2: '上下文过长 / 信息过载',
                details: '塞了太多 chunk 导致 LLM "lost in the middle"，忽略关键信息',
                fix: '减少 top-k、用 reranker 精选最相关内容、map-reduce 策略'
              },
              {
                level2: '冲突证据',
                details: '多个 chunk 之间信息矛盾，LLM 不知道该信谁',
                fix: '增加时间戳/版本优先级、在 prompt 中指导 LLM 处理冲突、冲突检测后提示用户'
              },
              {
                level2: '幻觉',
                details: 'LLM 脱离 context 自行发挥，生成看似合理但无依据的内容',
                fix: '更强的 grounding prompt、structured output、faithfulness 更高的模型、输出验证器'
              },
              {
                level2: '指令遵循失败',
                details: 'LLM 没按要求的格式/范围/语气回答',
                fix: '优化 system prompt、few-shot 示例、强制 JSON output 再解析'
              }
            ]
          },
          {
            level1: '引用错（回答本身可能对但引用指向有问题）',
            causes: [
              {
                level2: '引用格式/映射问题',
                details: '文档 ID 被搞混、引用指向了错误的文档、URL 失效',
                fix: '在 prompt 中用明确的标记区分不同 source、post-processing 校验引用有效性'
              },
              {
                level2: '引用张冠李戴',
                details: '某个 claim 引用了来源 A 但实际支撑该 claim 的是来源 B',
                fix: '逐 claim 验证引用对应关系（自动化 + 抽样人工检查）'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'eval-dataset',
    title: '离线评估集构建',
    icon: '🗂️',
    subsections: [
      {
        title: '评估集结构',
        content: `一个高质量的离线评估集是所有评估工作的基础。没有评估集，一切优化都是"拍脑袋"。`,
        structure: {
          fields: [
            { field: 'query', desc: '用户问题', example: '"公司的年假政策是什么？"' },
            { field: 'gold_docs', desc: '标准答案应该引用的文档 ID 列表', example: '["HR-Policy-2026-v3.pdf#chunk_12", "HR-Policy-2026-v3.pdf#chunk_13"]' },
            { field: 'gold_answer', desc: '标准参考答案', example: '"根据公司政策，入职满1年可享受10天年假..."' },
            { field: 'gold_citations', desc: '标准答案中每个 claim 对应的引用', example: '[{"claim": "10天年假", "source": "HR-Policy-2026-v3.pdf#chunk_12"}]' },
            { field: 'metadata', desc: '分类标签：难度/领域/query类型', example: '{"difficulty": "easy", "domain": "HR", "type": "factual"}' }
          ]
        }
      },
      {
        title: '构建方法',
        content: `评估集的构建是一个持续过程，不是一次性工作。`,
        methods: [
          {
            method: '人工标注',
            process: '领域专家撰写 query，标注 gold_docs 和 gold_answer',
            pros: '质量最高、覆盖边界情况',
            cons: '成本高、速度慢、规模受限',
            recommendation: '必须有，至少 100-200 条核心评估样本'
          },
          {
            method: 'LLM 辅助生成',
            process: '给 LLM 一批文档，让它生成 query + answer 对，人工审核',
            pros: '速度快、成本低、容易扩大规模',
            cons: '可能分布不自然、缺少真实用户的困惑点',
            recommendation: '用于扩充评估集到 500-1000 条，但需严格审核'
          },
          {
            method: '线上日志回收',
            process: '从审计日志中收集真实 query → 人工标注 gold_docs/answer → 加入评估集',
            pros: '最真实的分布、能发现"意想不到"的 query',
            cons: '需要系统已上线运行一段时间',
            recommendation: '上线后的主力数据来源，持续回收、持续迭代'
          }
        ]
      },
      {
        title: '规模与版本管理',
        content: `评估集不是越大越好，关键是覆盖度和代表性。`,
        guidelines: [
          'MVP 阶段：50-100 条高质量人工标注，覆盖核心场景',
          '生产阶段：500-1000 条混合来源，按领域/难度/类型分层',
          '成熟阶段：2000+ 条，含边界 case、对抗样本、多语言等',
          '版本管理：每次评估集变更打版本号（eval-set-v1.2），记录变更日志',
          '回归兼容：新版评估集必须包含旧版所有样本（可标记"deprecated"但不删除）',
          '存储：Git LFS / DVC / HuggingFace Datasets，支持版本回溯',
          '分片策略：按领域/难度分 split，支持部分回归（PR 级只跑核心 split）'
        ]
      }
    ]
  },
  {
    id: 'eval-tools',
    title: '评估工具链',
    icon: '🛠️',
    subsections: [
      {
        title: '2026 工具全景',
        content: `RAG 评估工具链在 2025-2026 年经历了爆发式发展。以下是主流选择及其定位。`,
        tools: [
          {
            name: 'RAGAS',
            type: '开源指标库',
            desc: '专为 RAG 设计的评估指标库，提供 Faithfulness、Answer Relevancy、Context Precision/Recall 等开箱即用的指标',
            strengths: ['RAG 评估的事实标准', '指标设计严谨', '社区活跃', '支持自定义指标'],
            weaknesses: ['需要自己搭 pipeline', '不提供 UI', 'LLM-as-judge 成本不低'],
            bestFor: '需要严谨 RAG 指标评估的团队',
            maturity: '成熟'
          },
          {
            name: 'DeepEval',
            type: 'CI Pipeline 集成',
            desc: 'pytest 风格的 LLM 评估框架，将 RAG 评估集成到 CI/CD 中像写单元测试一样写评估用例',
            strengths: ['pytest 集成零学习成本', 'CI/CD friendly', '指标丰富', '内置 benchmark 数据集'],
            weaknesses: ['商业版功能更完整', '社区相对较小'],
            bestFor: '需要将评估融入 CI/CD 的工程团队',
            maturity: '成熟'
          },
          {
            name: 'LangSmith',
            type: '开发调试平台',
            desc: 'LangChain 团队的全链路观测平台，提供 tracing、evaluation、dataset 管理、prompt playground',
            strengths: ['与 LangChain/LangGraph 深度集成', 'UI 优秀', 'trace 可视化强大', 'few-shot 管理'],
            weaknesses: ['绑定 LangChain 生态', '商业定价', '非 LangChain 用户集成成本高'],
            bestFor: 'LangChain 生态用户、需要强大 UI 的团队',
            maturity: '成熟'
          },
          {
            name: 'Langfuse',
            type: '开源观测平台',
            desc: '开源的 LLM 观测与评估平台，提供 tracing、scoring、prompt 管理、cost tracking',
            strengths: ['开源可自托管', 'SDK 轻量不绑定框架', 'trace 质量高', '支持人工标注'],
            weaknesses: ['UI 相对 LangSmith 简洁', '社区驱动更新节奏不一'],
            bestFor: '需要开源自托管、不想绑定框架的团队',
            maturity: '成熟'
          },
          {
            name: 'Arize Phoenix',
            type: 'Tracing + 评估',
            desc: '开源的 LLM observability 工具，特别强调 tracing 可视化和检索质量分析',
            strengths: ['检索质量可视化强大', 'Embedding 可视化', '开源', '支持 OpenTelemetry'],
            weaknesses: ['评估指标不如 RAGAS 全面', '更偏 observability 而非 evaluation'],
            bestFor: '需要深入分析检索行为和 embedding 质量的团队',
            maturity: '成长期'
          },
          {
            name: 'MLflow',
            type: '实验管理集成',
            desc: '传统 ML 实验管理平台，2025-2026 增加了 LLM evaluation 和 RAG 评估能力',
            strengths: ['企业级成熟度', '实验对比强大', '与 Databricks 生态集成', '指标版本管理'],
            weaknesses: ['LLM/RAG 功能相对新', '不够"原生"'],
            bestFor: '已有 MLflow 基础设施的企业',
            maturity: '成熟（LLM功能成长期）'
          }
        ]
      },
      {
        title: '选型建议',
        content: `没有"最好"的工具，只有最适合你阶段的组合。`,
        recommendations: [
          {
            stage: 'MVP / 原型验证',
            combo: 'RAGAS + Langfuse',
            reason: '开源免费、快速启动、核心指标全覆盖'
          },
          {
            stage: '团队协作开发',
            combo: 'DeepEval（CI）+ LangSmith/Langfuse（调试）',
            reason: 'CI 回归保障 + 可视化调试，开发体验好'
          },
          {
            stage: '生产级运维',
            combo: 'RAGAS（指标）+ DeepEval（CI）+ Arize Phoenix（线上观测）+ Langfuse（成本追踪）',
            reason: '全覆盖：离线评估 + CI 回归 + 线上监控 + 成本管理'
          },
          {
            stage: '大企业 / Databricks 体系',
            combo: 'MLflow（实验管理）+ RAGAS（指标）+ 自建告警',
            reason: '企业级基础设施复用、统一实验管理'
          }
        ]
      }
    ]
  },
  {
    id: 'cicd',
    title: 'CI/CD 回归门禁',
    icon: '🚦',
    subsections: [
      {
        title: 'Nightly Eval Sweep',
        content: `每晚自动运行全量评估集，生成指标报告并与基线对比。这是你发现"系统默默变差"的第一道防线。`,
        pipeline: [
          '触发：cron job 每日凌晨 / 知识库更新后自动触发',
          '范围：全量评估集（所有 split）',
          '指标：检索层（Recall@10, MRR, nDCG）+ 生成层（Faithfulness, Answer Relevancy）+ 引用（Citation Correctness）',
          '对比：与上次 nightly 结果和固定基线对比',
          '产出：指标报告 + 回归 diff + 失败案例列表',
          '告警：任何核心指标下降超过阈值（如 Faithfulness 下降 > 2%）自动通知团队'
        ]
      },
      {
        title: 'PR 级回归测试',
        content: `每个 PR（修改了 prompt/检索逻辑/chunking 策略/模型版本）都应触发一轮轻量评估。`,
        details: [
          '范围：只跑核心 split（50-100 条高优先级样本），控制在 10-15 分钟内',
          '工具：DeepEval pytest 插件，失败则 PR 无法合并',
          '展示：在 PR comment 中自动贴评估结果摘要',
          '阈值示例：Faithfulness ≥ 0.90 AND Recall@10 ≥ 0.85 AND Answer Relevancy ≥ 0.80',
          'Fast-fail：先跑最关键的 10 条 smoke test，失败直接终止'
        ],
        codeExample: `# deepeval_test.py 示例
import pytest
from deepeval import assert_test
from deepeval.metrics import (
    FaithfulnessMetric,
    AnswerRelevancyMetric,
    ContextualRecallMetric,
)
from deepeval.test_case import LLMTestCase

faithfulness = FaithfulnessMetric(threshold=0.9)
relevancy = AnswerRelevancyMetric(threshold=0.8)
recall = ContextualRecallMetric(threshold=0.85)

@pytest.mark.parametrize("test_case", load_eval_dataset("core_split"))
def test_rag_quality(test_case):
    result = rag_pipeline.query(test_case["query"])
    tc = LLMTestCase(
        input=test_case["query"],
        actual_output=result.answer,
        expected_output=test_case["gold_answer"],
        retrieval_context=result.contexts,
    )
    assert_test(tc, [faithfulness, relevancy, recall])`
      },
      {
        title: '指标基线与阈值管理',
        content: `基线不是一成不变的——随着系统改进应该逐步提高。`,
        practices: [
          '初始基线：系统上线时的指标快照，作为"不能更差"的底线',
          '动态基线：每次 nightly sweep 的 rolling average（过去 7 天），检测渐变衰退',
          '目标基线：下一个迭代周期的目标指标，用于衡量改进是否达标',
          '阈值分级：Warning（下降 1-2%）→ Error（下降 2-5%）→ Critical（下降 > 5%）',
          '基线存储：版本化存储在 Git 中（如 baselines/v1.3.json），与代码版本关联'
        ]
      }
    ]
  },
  {
    id: 'online-monitoring',
    title: '线上监控与数据闭环',
    icon: '🔄',
    subsections: [
      {
        title: '用户反馈收集',
        content: `用户反馈是最直接的质量信号，但需要设计低摩擦的收集机制。`,
        methods: [
          {
            type: '显式反馈',
            desc: 'Thumbs up/down、星级评分、"回答有帮助吗？"',
            pros: '信号清晰',
            cons: '参与率低（通常 < 5%），有幸存者偏差',
            tips: '尽量减少操作步骤，一次点击即可提交'
          },
          {
            type: '隐式反馈',
            desc: 'Follow-up 问题（说明首次回答不够好）、复制行为（说明内容有用）、会话时长',
            pros: '无额外操作、数据量大',
            cons: '信号有噪声，需要建模',
            tips: '结合多个信号综合判断，不要依赖单一信号'
          },
          {
            type: '主动反馈',
            desc: '定期抽样用户做深度访谈、发送满意度调查',
            pros: '深度洞察',
            cons: '成本高、规模有限',
            tips: '每月一次、聚焦特定场景'
          }
        ]
      },
      {
        title: '数据闭环',
        content: `线上监控的终极目标是形成"数据→改进→上线→监控→数据"的自驱动闭环。`,
        loop: [
          {
            step: '1. 日志收集',
            desc: '审计日志 + 用户反馈 → 数据湖',
            output: '原始数据'
          },
          {
            step: '2. 标注/合成评测集',
            desc: '从负反馈和失败案例中提取 → 人工标注 gold answer → 加入评估集',
            output: '更新的评估集 v(n+1)'
          },
          {
            step: '3. 回归测试',
            desc: '新评估集跑全量回归，定位系统短板',
            output: '改进方向和优先级'
          },
          {
            step: '4. 优化迭代',
            desc: '针对短板改进（换模型/优化 prompt/改 chunking/加文档）',
            output: '新版本候选'
          },
          {
            step: '5. 灰度上线',
            desc: '新版本先灰度 5-10% 流量，对比核心指标',
            output: 'A/B 测试结果'
          },
          {
            step: '6. 全量发布 + 监控',
            desc: '通过灰度后全量上线，持续监控指标',
            output: '回到步骤 1'
          }
        ]
      },
      {
        title: 'A/B 测试框架',
        content: `RAG 系统的 A/B 测试与传统 web 产品有不同之处。`,
        considerations: [
          '分流粒度：按用户/session 分流（而非按请求），避免同一用户看到不一致的回答',
          '评估维度：不只看 CTR，还要看 faithfulness/relevancy 等 RAG 特有指标',
          '样本量：RAG 的方差大，通常需要更大的样本量才能达到统计显著性',
          '时间窗口：至少运行 1-2 周，覆盖不同工作日和查询模式',
          '工具推荐：LaunchDarkly（feature flag）+ 自建指标对比 pipeline',
          '注意事项：同时测试的变量不宜超过 2-3 个，否则无法归因'
        ]
      },
      {
        title: '告警与值班',
        content: `监控没有告警 = 没有监控。`,
        alerts: [
          { metric: 'Faithfulness 均值', threshold: '< 0.85 连续 1 小时', severity: 'P1（Critical）', action: '立即回滚到上一稳定版本' },
          { metric: 'Recall@10 均值', threshold: '< 0.80 连续 2 小时', severity: 'P1', action: '检查向量库状态和 ingestion pipeline' },
          { metric: '用户负反馈率', threshold: '> 20% 连续 4 小时', severity: 'P2（High）', action: '抽样分析失败案例' },
          { metric: 'E2E p95 延迟', threshold: '> 10s 连续 30 分钟', severity: 'P2', action: '检查基础设施和依赖服务' },
          { metric: '每请求成本', threshold: '比基线高 50%', severity: 'P3（Medium）', action: '检查是否有异常的 retry/长 context' }
        ]
      }
    ]
  }
];

export const evalWarmupQuestions = [
  {
    question: '你的 RAG 系统准确率从 demo 阶段的 70% 提升到生产的 95%，靠的是什么？',
    hook: '答案不是换更大的模型——是系统性的评估体系和数据驱动的迭代闭环'
  },
  {
    question: '用户说"回答不对"，你怎么在 5 分钟内定位到底是检索的问题、生成的问题、还是引用的问题？',
    hook: '没有分层指标和 tracing，你只能瞎猜'
  }
];

export const evalQuestions = [
  {
    question: 'Faithfulness 和 Answer Relevancy 的区别是什么？一个高一个低分别意味着什么问题？',
    hint: '考虑 RAG Triad 的三角关系',
    answer: 'Faithfulness 衡量"回答有没有胡说"（是否有 context 支撑），Answer Relevancy 衡量"回答有没有跑题"（是否在回答用户的问题）。Faithfulness 高 + Relevancy 低 = LLM 忠实地引用了 context 但答非所问（可能是 query 理解问题或 context 本身偏离主题）。Faithfulness 低 + Relevancy 高 = LLM 给了一个看似正确的回答但内容是编造的（幻觉！最危险的情况，因为用户可能相信了错误的信息）。两者同时高才是理想状态。'
  },
  {
    question: '如何构建一个高质量的离线评估集？从 0 开始到稳定运行，分几步走？',
    hint: '考虑不同阶段的数据来源、规模和维护策略',
    answer: '阶段一（冷启动）：由领域专家人工撰写 50-100 条核心 query + gold answer，覆盖最重要的场景，用于验证系统基本能力。阶段二（扩充）：用 LLM 辅助从现有文档生成 query-answer 对，人工审核后扩充到 500 条，按领域/难度分层。阶段三（线上回收）：系统上线后从审计日志中回收真实 query，特别是负反馈案例，人工标注后加入评估集。阶段四（持续迭代）：建立评估集版本管理（DVC/Git LFS），每月审核和更新，淘汰过时样本、补充新场景。关键实践：评估集要按 split 管理（core/extended/adversarial），CI 跑 core split，nightly 跑全量。'
  },
  {
    question: 'RAGAS、DeepEval、LangSmith、Arize Phoenix 分别适合什么场景？你会怎么组合使用？',
    hint: '考虑离线评估 vs 在线监控 vs CI/CD 集成 vs 开发调试',
    answer: 'RAGAS 是指标库，核心价值是提供标准化的 RAG 评估指标（Faithfulness、Context Precision 等），适合所有需要量化 RAG 质量的场景。DeepEval 是 CI 集成工具，pytest 风格让评估像写单元测试，适合工程团队在 CI pipeline 中做回归门禁。LangSmith 是开发调试平台，trace 可视化和 prompt playground 适合开发期快速迭代。Arize Phoenix 偏线上 observability，embedding 分析和检索质量可视化适合定位线上问题。推荐组合：RAGAS（定义指标标准）+ DeepEval（CI 回归，用 RAGAS 指标）+ Langfuse/LangSmith（开发调试）+ Arize Phoenix（线上检索分析）。'
  },
  {
    question: '失败归因树中"没召回"这个根因下有 5 个子原因。你怎么快速判断当前系统是哪个子原因导致的？',
    hint: '想象你面前有一个失败 case，你会做哪些诊断步骤',
    answer: '诊断流程：1）先看 gold_doc 是否在向量库中 → 不在说明是"文档没入库"（检查 ingestion pipeline）。2）在向量库中直接用 gold_doc 的 embedding 搜索 → 搜到了说明 embedding 没问题，可能是 query 问题；搜不到说明 embedding 质量差。3）用原始 query 搜索但移除所有 metadata filter → 搜到了说明是"filter 过严"；搜不到说明是 query 或 embedding 问题。4）查看 query 改写结果 → 改写后能搜到说明原始 query 表达有问题。5）查看 gold_doc 的 chunk 边界 → 关键信息被切断说明是"chunking 不当"。这个诊断流程可以自动化为一个 debug 脚本。'
  },
  {
    question: 'CI/CD 中的 RAG 评估与传统软件测试有哪些根本区别？你会如何设定阈值？',
    hint: '思考 LLM 输出的不确定性、评估成本、以及"通过"的含义',
    answer: '核心区别：1）传统测试是确定性的（相同输入 → 相同输出），RAG 评估有随机性（LLM 输出可能不同），需要多次运行取均值或设置容忍区间。2）评估成本高——每条 case 需要 LLM-as-judge 调用，100 条评估可能花费数美元和数分钟。3）"通过"不是 0/1 而是阈值——Faithfulness 0.89 还是 0.91 的差异需要统计显著性判断。阈值设定策略：先用当前系统跑 3-5 次获取基线均值和标准差，设阈值 = 基线均值 - 2σ。Warning 和 Error 分级：Warning = 低于基线 1σ，Error = 低于基线 2σ，Critical = 低于硬性底线（如 Faithfulness < 0.8）。阈值应该随系统改进逐步提高（ratchet up）。'
  },
  {
    question: '线上监控发现 Faithfulness 从 0.92 缓慢下降到 0.85（2 周内），可能的原因有哪些？你会怎么排查？',
    hint: '渐进式衰退通常不是代码 bug，而是数据或环境的变化',
    answer: '渐进式衰退的常见原因：1）知识库内容变化——新文档质量差/格式不统一/重复内容增多，稀释了检索质量。2）用户查询分布漂移——新功能上线吸引了新类型的用户/查询，现有系统未覆盖。3）依赖服务变化——embedding API 版本更新、LLM 版本静默更新导致行为变化。4）数据膨胀——向量库体积增大导致 ANN 精度下降。排查步骤：a）对比 2 周前后的失败案例分布，看新增的失败类型是什么。b）检查 ingestion 日志，是否有大批量新文档入库。c）检查 embedding/LLM API 版本是否有变更。d）抽样对比老 query 在新旧系统上的检索结果差异。e）检查向量库性能指标（recall vs latency trade-off 是否劣化）。'
  }
];

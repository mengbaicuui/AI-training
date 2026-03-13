export const graphSections = [
  {
    id: 'definition',
    icon: '📖',
    title: 'GraphRAG 是什么',
    content: [
      {
        type: 'text',
        value: '**GraphRAG** 是在传统 RAG 的基础上，把文档中的**实体与关系**显式建模为图结构，再通过图遍历或社区分析来增强检索的方法。它的出发点很简单：向量相似度只能找"语义相近"的段落，但它找不到"A 和 B 之间跨文档的关联链路"。'
      },
      {
        type: 'image',
        title: 'GraphRAG 分类体系：普通 RAG / KG-GraphRAG / Community-based GraphRAG',
        src: '/graphrag-taxonomy.png',
        alt: 'GraphRAG taxonomy diagram',
        caption: '三条路线的根本区别在于索引结构：普通 RAG 只建向量索引；KG-GraphRAG 在向量之上增加三元组图；Community-based GraphRAG 进一步做层级社区检测与摘要，支持 Global 和 Local 两种搜索模式。'
      },
      {
        type: 'compare',
        title: 'RAG vs GraphRAG：各自擅长什么',
        items: [
          {
            name: '传统 RAG 擅长',
            desc: '**单跳查询**：找具体细节、事实、段落。查询与答案在同一文档或相邻段落内。Embedding 相似度能直接命中。'
          },
          {
            name: 'GraphRAG 擅长',
            desc: '**多跳查询**：需要跨文档连接信息、理解复杂关系链、生成概括性全局洞察。图结构能保留跨段落的实体关联。'
          }
        ]
      },
      {
        type: 'highlight',
        value: '一句话总结：**RAG 擅长"点对点"的细节查找，GraphRAG 擅长"点对线"和"线对面"的复杂关联与全局总结。**（来源：《RAG vs. GraphRAG: A Systematic Evaluation》，Han et al.）'
      },
      {
        type: 'list',
        title: '两大 GraphRAG 实现路线',
        items: [
          '**KG-GraphRAG（三元组路线）**：从文本中提取实体-关系-实体三元组，查询时通过实体匹配在图上做路径遍历。代表方案：HippoRAG、传统 KGQA。优点：推理链路透明；缺点：三元组抽取质量参差不齐，关系类型爆炸难以维护。',
          '**Community-based GraphRAG（社区摘要路线）**：在三元组基础上用图聚类算法（如 Leiden）划分社区，对每个社区生成 LLM 摘要，查询时分 Global Search（读社区摘要）和 Local Search（读实体邻居）两模式。代表方案：微软 GraphRAG、LazyGraphRAG。优点：全局理解能力强；缺点：建图成本极高。'
        ]
      },
      {
        type: 'list',
        title: '微软 GraphRAG = Community-based，其核心四步',
        items: [
          '**① 图提取**：用 LLM 把文档里的实体（人、事、地）和关系找出来，建成一张大图',
          '**② 社区检测**：用 Leiden 算法把紧密相关的实体划分为"社区"（Community）',
          '**③ 层级化摘要**：对每个社区生成摘要——底层小社区有摘要，高层大社区也有摘要，形成"摘要树"',
          '**④ 双模式查询**：Global Search 读高层社区摘要（宏观问题）；Local Search 聚焦实体邻居节点（具体问题）'
        ]
      },
      {
        type: 'table',
        title: 'RAPTOR vs 微软 GraphRAG：同样做层级摘要，路径不同',
        columns: ['特性', 'RAPTOR', '微软 GraphRAG'],
        rows: [
          ['基础单元', '纯文本块（Text Chunks）', '图节点与关系（Entities & Relations）'],
          ['聚类方式', '向量嵌入 + GMM 聚类', '图算法（Leiden 社区检测）'],
          ['理解深度', '基于语义相似度', '基于实体间逻辑链接'],
          ['适用场景', '叙事性、长文档层级理解', '关系复杂、信息高度关联的知识库'],
        ]
      },
      {
        type: 'text',
        value: '**没有万能方案**：GraphRAG 在复杂关系推理上很强，但简单事实检索上不如 RAG 高效。研究也发现两种优化路线：**选择策略**（事实问题走 RAG、推理问题走 GraphRAG）和**整合策略**（两路并行再融合），这正是后面讨论各轻量方案的工程出发点。'
      }
    ]
  },
  {
    id: 'why-expensive',
    icon: '💸',
    title: 'GraphRAG 为什么贵',
    content: [
      {
        type: 'text',
        value: 'Microsoft GraphRAG（2024）的核心思路很强大：用 LLM 从文档中抽取实体和关系构建知识图谱，再做社区检测和社区摘要，查询时聚合社区报告生成答案。但**每一步都在烧 LLM token**，这让它在生产环境中代价惊人。'
      },
      {
        type: 'list',
        title: '成本来源拆解',
        items: [
          '**索引期 — 实体/关系抽取** — 每个文本 chunk 都要过 LLM 提取实体和关系，一个 10 万字的文档库轻松消耗数百万 token',
          '**索引期 — 社区摘要** — 对图做 Leiden 社区检测后，每个社区要用 LLM 生成摘要。社区越多，成本越高',
          '**查询期 — Global Search** — 读取所有（或大量）社区报告，map 阶段对每个社区报告打分，reduce 阶段汇总。单次查询平均消耗 ~610K tokens',
          '**增量更新困难** — 新增文档需要重新抽取实体、更新图、重新做社区检测和摘要，几乎等于重建索引'
        ]
      },
      {
        type: 'danger',
        value: '算一笔账：GPT-4o 输入价 $2.5/1M tokens，单次 Global Search 约 610K tokens → 单次查询成本约 $1.5。日均 1 万次查询 → 月成本 $450,000+。这还不算索引构建成本。对大多数企业来说，这是不可接受的。'
      },
      {
        type: 'table',
        title: '为什么 GraphRAG 会在生产里变贵',
        columns: ['环节', '为什么贵', '典型风险'],
        rows: [
          ['实体/关系抽取', '每个 chunk 都要过 LLM', '语料一大索引成本立刻爆炸'],
          ['社区摘要', '每个社区再做摘要', '结构不稳定，重跑结果可能不同'],
          ['Global Search', '要读大量社区报告', '单次 query token 极高'],
          ['增量更新', '图和社区很难只局部更新', '稍有变更就接近重建'],
        ],
      },
      {
        type: 'list',
        title: '其他痛点',
        items: [
          '**延迟高** — Global Search 需要读大量社区报告，延迟通常 30-60 秒，用户体验差',
          '**质量不稳定** — 社区摘要的质量取决于 LLM，不同 run 可能产出不同的图结构，影响可复现性',
          '**调试困难** — 链路太长（chunk → 实体 → 关系 → 社区 → 摘要 → 查询），出了问题很难定位'
        ]
      }
    ]
  },
  {
    id: 'internal-optimization',
    icon: '⚙️',
    title: 'GraphRAG 内部降本',
    content: [
      {
        type: 'text',
        value: '微软团队也意识到了成本问题，在 GraphRAG 框架内部推出了几个降本方案。这些方案保留了图结构的优势，但大幅减少了 LLM 调用。'
      },
      {
        type: 'list',
        title: 'LazyGraphRAG（微软官方，2024-2025）',
        items: [
          '**核心思想** — "延迟 LLM 使用"。索引阶段不用 LLM 做实体抽取和社区摘要，而是用轻量 NLP（NER + 句法分析）构建初始图，**只在查询时才按需调用 LLM**',
          '**索引成本** — 降至与普通向量 RAG 相当（不需要 LLM 参与索引构建）',
          '**查询成本** — 相比 full GraphRAG 降至 **0.1%—4%**，取决于查询复杂度。简单查询走 local search 只查相关子图，复杂查询才触发社区级分析',
          '**Best-first search** — 查询时用 BM25+embedding 双路检索先找到最相关的子图区域，然后逐步扩展，而不是一次性读所有社区报告',
          '**质量** — 在 local 和 global 查询上的答案质量都达到或超过 full GraphRAG'
        ]
      },
      {
        type: 'highlight',
        value: 'LazyGraphRAG 可以理解为"用普通 RAG 的成本获得 GraphRAG 的全局理解能力"。如果你已经投入了 GraphRAG 但被成本困扰，这是第一个应该评估的方案。'
      },
      {
        type: 'list',
        title: 'DRIFT Search（Dynamic Reasoning and Inference with Flexible Traversal）',
        items: [
          '**思路** — 先粗看顶层社区报告（global context），锁定相关社区后，再精查局部子图（local details）',
          '**优势** — 结合了 global search 的全局视野和 local search 的精确度，同时大幅减少需要处理的社区报告数量',
          '**适用场景** — 需要一些全局上下文但不需要遍历所有社区的查询（占实际查询的 70-80%）'
        ]
      },
      {
        type: 'list',
        title: 'Dynamic Community Selection',
        items: [
          '根据查询自动选择需要读取的社区层级和数量，而不是固定读所有社区',
          '用 embedding 相似度对社区报告排序，只读 top-K 相关社区',
          '进一步降低 map 阶段的 token 消耗'
        ]
      },
      {
        type: 'compare',
        title: 'GraphRAG 内部降本路线怎么理解',
        items: [
          {
            name: 'LazyGraphRAG',
            desc: '把 LLM 从索引期拿掉，查询时再按需用，优先解决“建图太贵”的问题。'
          },
          {
            name: 'DRIFT / Dynamic Selection',
            desc: '减少查询时要看的社区数量，优先解决“每个查询都太贵”的问题。'
          }
        ]
      }
    ]
  },
  {
    id: 'lightrag',
    icon: '💡',
    title: 'LightRAG',
    content: [
      {
        type: 'text',
        value: 'LightRAG（香港大学，arxiv:2410.05779，EMNLP 2025 Findings）是目前最务实的 GraphRAG 轻量替代方案之一。它用**双层检索**（实体层+主题层）+ 图向量混合检索，实现了 GraphRAG 的全局理解能力，但查询成本降低了几个数量级。'
      },
      {
        type: 'image',
        title: 'LightRAG 整体架构：Graph-based Text Indexing + Dual-level Retrieval Paradigm',
        src: '/lightrag-architecture.png',
        alt: 'LightRAG overall architecture diagram',
        caption: '左侧索引阶段：对原始文本做实体与关系抽取（D/P/R 三类），去重后构建 Index Graph，每个节点存储 Entity Name、Type、Description 及原始 Chunk ID。右侧检索阶段：Query 同时触发 Low-level Keys（具体实体）和 High-level Keys（主题/关系），通过 Query + LLM 融合后召回实体、关系和原始文本，完成 Dual-level 双路检索。'
      },
      {
        type: 'list',
        title: '核心设计',
        items: [
          '**双层知识表示** — 低层（Low-level）：具体实体和关系（如"张三→属于→研发部"）；高层（High-level）：主题和概念（如"员工管理""薪酬制度"）',
          '**图 + 向量混合检索** — 图结构用于多跳关系推理，向量用于语义匹配。查询时两路并行，结果融合',
          '**增量更新** — 新增文档只需要提取新的实体/关系并插入现有图，不需要重建整个索引',
          '**轻量索引** — 实体抽取用一次 LLM 调用（不需要社区检测和社区摘要）'
        ]
      },
      {
        type: 'highlight',
        value: '关键数据：LightRAG 单次查询消耗 <100 tokens（对比 GraphRAG 的 ~610K tokens），成本差距超过 6000 倍。在多个 benchmark 上答案质量与 GraphRAG 相当甚至更好（综合性、多样性评分领先）。'
      },
      {
        type: 'list',
        title: '适用场景',
        items: [
          '需要一定的图结构推理但预算有限',
          '文档更新频繁，需要增量索引能力',
          '查询以"局部关系"为主（某个人/某个部门/某个流程），偶尔需要主题级概览',
          '中小规模知识库（数万到数十万 chunks）'
        ]
      },
      {
        type: 'warning',
        value: '局限：LightRAG 的高层主题检索不如 GraphRAG 的社区摘要精细，对于"概述整个组织架构的变迁"这类需要深度全局洞察的查询，效果可能不如 GraphRAG/LazyGraphRAG。'
      },
      {
        type: 'code',
        lang: 'python',
        title: 'LightRAG 风格：图检索和向量检索并行',
        value: `entity_hits = entity_graph_search(query, top_k=10)
vector_hits = dense_search(query, top_k=10)

merged = fuse(entity_hits, vector_hits)
top_context = rerank(merged)[:6]
answer = llm.generate(query, top_context)

return answer`
      }
    ]
  },
  {
    id: 'hipporag',
    icon: '🧠',
    title: 'HippoRAG',
    content: [
      {
        type: 'text',
        value: 'HippoRAG（俄亥俄州立大学，arxiv:2405.14831，NeurIPS 2024）从认知科学中的**海马体记忆理论**获得灵感：人类大脑通过海马体将新信息与已有记忆建立关联，并通过 pattern completion 快速检索相关记忆。HippoRAG 模拟这个过程，用 KG + Personalized PageRank 实现高效的多跳检索。'
      },
      {
        type: 'list',
        title: '核心机制',
        items: [
          '**知识图谱 = 皮层索引** — 用 LLM 从文档中提取三元组（头实体，关系，尾实体），构建类似大脑皮层长期记忆的知识图谱',
          '**Personalized PageRank = 海马体检索** — 查询时先识别查询中的关键实体，以这些实体为种子节点跑 PPR，通过图传播找到多跳关联的段落',
          '**单步多跳** — 传统多跳检索（如 IRCoT）需要 LLM 逐步推理每一跳，HippoRAG 通过 PPR 在图上一次性传播，把多跳压缩成"单步"操作',
          '**在线学习** — 新文档可以直接提取三元组插入 KG，不需要重建索引'
        ]
      },
      {
        type: 'highlight',
        value: '性能对比（论文数据）：在 MuSiQue、2WikiMultihopQA 等多跳 QA benchmark 上，HippoRAG 比 IRCoT 便宜 10-30 倍、快 6-13 倍，同时答案质量相当或更好。'
      },
      {
        type: 'list',
        title: '适用场景与局限',
        items: [
          '**最适合** — 多跳推理查询（"A 的上级的项目经理负责的产品是什么？"），需要在知识图谱上走 2-5 跳链路',
          '**优势** — 不需要社区检测/摘要，索引成本低；PPR 计算高效（毫秒级）；天然支持增量更新',
          '**局限** — 依赖 LLM 提取的三元组质量；对于不需要多跳推理的简单查询没有优势；不擅长全局性的主题概览查询'
        ]
      }
    ]
  },
  {
    id: 'linearrag',
    icon: '📏',
    title: 'LinearRAG',
    content: [
      {
        type: 'text',
        value: 'LinearRAG（2025，ICLR 2026）代表的是另一条轻量知识增强路线：**尽量避免昂贵且不稳定的关系抽取**，改用更轻量的实体抽取 + 语义连接来构建层级图结构。它的目标不是做“最完整的知识图谱”，而是做一个能线性扩展、适合大规模语料的 graph retrieval 框架。'
      },
      {
      {
        type: 'image',
        title: 'Naive RAG / GraphRAG / LinearRAG 流程对比',
        src: '/linearrag-architecture.png',
        alt: 'LinearRAG vs GraphRAG vs Naive RAG pipeline comparison',
        caption: 'a) Naive RAG：Chunk → Embedding → 向量检索；b) GraphRAG：NER → 关系抓取 → Knowledge Graph → 子图检索；c) LinearRAG：NER → Semantic Linking → Tri-Graph → Passage 检索。LinearRAG 跳过了 b) 中昂贵的关系抓取步骤，用语义连接构建轻量 Tri-Graph，检索结果仍为 Passage，与普通 RAG 兼容。',
      },
        type: 'list',
        title: '核心设计',
        items: [
          '**Tri-Graph / 分层图结构** — 不强依赖精细关系类型，而是通过实体、语义桥接和层级组织建立检索图',
          '**relation-free 倾向** — 减少传统 GraphRAG 中最贵、最不稳定的关系抽取环节',
          '**两阶段检索** — 先激活相关实体，再做全局重要性聚合，最后回到 passage 检索',
          '**线性扩展** — 设计目标是随着语料规模增长仍保持可扩展，不把成本炸在图构建上'
        ]
      },
      {
        type: 'highlight',
        value: 'LinearRAG 的价值在于：它试图回答一个现实问题——如果团队要图结构带来的跨文档关联能力，但又不想承担 GraphRAG 那种重关系抽取和高 token 成本，能不能走一条更线性的路线？'
      },
      {
        type: 'list',
        title: '适用场景与定位',
        items: [
          '**大规模语料** — 图构建必须可扩展，不能随着 corpus 增长急剧恶化',
          '**需要跨文档关联，但不想做重型 KG 工程**',
          '**比 LightRAG 更强调“规模扩展性”**，比 HippoRAG 更少依赖精细关系链路'
        ]
      },
      {
        type: 'warning',
        value: '课上可以这样讲它和其他轻量路线的区别：LightRAG 更像“图 + 向量混合检索”的工程折中； HippoRAG 更像“多跳链路推理”的高效方案； LinearRAG 更像“面向大规模语料、尽量线性扩展的图检索框架”。'
      },
      {
        type: 'table',
        title: 'LinearRAG 的定位',
        columns: ['问题', 'LinearRAG 的回答'],
        rows: [
          ['图一定要做重关系抽取吗？', '不一定，先做实体和语义连接就能得到更轻的路线'],
          ['大语料图检索最怕什么？', '最怕索引成本不线性增长、更新时接近全量重建'],
          ['适合谁？', '语料大、想要跨文档关联、但不愿承担重型 KG 工程的团队'],
        ],
      }
    ]
  },
  {
    id: 'raptor',
    icon: '🦅',
    title: 'RAPTOR',
    content: [
      {
        type: 'text',
        value: 'RAPTOR（斯坦福大学，arxiv:2401.18059，ICLR 2024）走了一条与图完全不同的路——**树状分层摘要**。它不构建知识图谱，而是对文本做递归聚类和摘要，形成一棵从细节到概括的多层树，检索时可以跨层取信息。'
      },
      {
        type: 'list',
        title: '核心设计',
        items: [
          '**递归聚类** — 先把原始 chunks 做 embedding，然后用 GMM/K-means 聚类。相似的 chunks 归为一组',
          '**分层摘要** — 对每个聚类用 LLM 生成摘要，摘要作为上一层的节点。再对摘要做聚类和摘要，递归直到顶层',
          '**跨层检索** — 查询时不只搜索叶子节点（原始 chunks），也搜索中间层和顶层的摘要节点。这让系统既能回答细节问题也能回答概括性问题',
          '**不是图！** — RAPTOR 的结构是树（tree），不是图（graph）。没有实体/关系/社区，只有层级化的摘要'
        ]
      },
      {
        type: 'highlight',
        value: '为什么 RAPTOR 值得关注：它用相对简单的机制（聚类 + 摘要）解决了"RAG 只能找到局部信息、无法理解文档整体结构"的问题。对于长文档（制度手册、研究报告、法规汇编），这正是痛点。'
      },
      {
        type: 'list',
        title: '适用场景',
        items: [
          '**长文档理解** — 公司制度手册（几万字）、行业研究报告、法规文件。用户既可能问"第三章第二节说了什么"也可能问"这个制度的核心要点是什么"',
          '**层级性知识** — 内容本身有从细节到总结的天然层次（章→节→段→句），RAPTOR 的树结构能很好地对应',
          '**Q&A 系统** — 在 QASPER、NarrativeQA 等 benchmark 上，RAPTOR 在长文档 QA 任务中表现优异'
        ]
      },
      {
        type: 'warning',
        value: '局限：索引期仍需要 LLM 生成每层摘要（但只是摘要，不像 GraphRAG 还要做实体抽取和社区分析）。对于需要实体间关系推理的查询（"A 和 B 之间的关系链"），树结构帮不上忙——那是 KG 的领域。'
      }
    ]
  },
  {
    id: 'decision-framework',
    icon: '🗺️',
    title: '选型决策框架',
    content: [
      {
        type: 'text',
        value: '不同方案各有所长，选型不是"哪个最好"而是"哪个最适合你的场景"。以下框架帮助你快速定位。'
      },
      {
        type: 'highlight',
        value: '黄金原则：**先做 Hybrid + Rerank + Query Decomposition**。80% 的企业 RAG 场景用这套组合就能达到生产可用的效果。只有当它明确不够时，再考虑图/树方案。不要为了技术亮点引入不必要的复杂度。'
      },
      {
        type: 'list',
        title: '按核心需求选型',
        items: [
          '**大多数场景** → Hybrid（BM25 + Dense）+ Rerank + Query Decomposition。简单、成熟、成本低、效果好',
          '**需要图但要轻量** → LightRAG。图 + 向量混合，增量更新，查询成本极低（<100 tokens/次）',
          '**需要图且语料很大** → LinearRAG。更强调线性扩展和轻关系建模，适合不想做重型 GraphRAG 的大规模场景',
          '**多跳链路推理** → HippoRAG。KG + PPR 把多跳压缩成单步，比迭代式多跳检索便宜 10-30 倍',
          '**长文档层级理解** → RAPTOR。树状分层摘要，支持从细节到概括的跨层检索',
          '**全局主题/跨全集洞察** → GraphRAG 或 LazyGraphRAG。需要"纵观全局"的能力时才值得上，优先用 LazyGraphRAG 降本',
          '**已有知识图谱** → SubgraphRAG / Walk&Retrieve。在已有 KG 上做子图检索或随机游走，不需要从头构建'
        ]
      },
      {
        type: 'text',
        value: '选型流程建议：'
      },
      {
        type: 'list',
        title: '决策流程',
        items: [
          '**Step 1** — 你的查询需要跨文档/跨主题的全局理解吗？\n  → 是：考虑 LazyGraphRAG / GraphRAG\n  → 否：往下看',
          '**Step 2** — 你的查询涉及多跳关系推理（A→B→C）吗？\n  → 是：考虑 HippoRAG\n  → 否：往下看',
          '**Step 3** — 你的文档很长且有层级结构，用户会问不同粒度的问题吗？\n  → 是：考虑 RAPTOR\n  → 否：往下看',
          '**Step 4** — 你需要图结构但预算有限、需要增量更新？\n  → 是：考虑 LightRAG / LinearRAG\n  → 否：Hybrid + Rerank 就够了'
        ]
      },
      {
        type: 'warning',
        value: '避坑提醒：不要同时上多个方案！先用 Hybrid + Rerank 建立 baseline，然后在 eval 数据集上证明某个进阶方案确实有显著提升（如 >5% 的 faithfulness 或 recall 提升），再考虑替换或叠加。技术选型必须由评估数据驱动，不能靠论文结论。'
      },
      {
        type: 'code',
        lang: 'python',
        title: '知识增强路线的最小 PoC 思路',
        value: `baseline = run_eval("hybrid_rerank")
candidate = run_eval("lightrag")

delta = candidate["faithfulness"] - baseline["faithfulness"]
cost_ratio = candidate["cost_per_query"] / baseline["cost_per_query"]

if delta > 0.05 and cost_ratio < 3:
    print("值得继续投入")
else:
    print("先维持 baseline")`
      }
    ]
  }
];

export const graphComparisonData = [
  {
    name: 'GraphRAG',
    paper: 'Microsoft 2024',
    indexCost: '极高（LLM 抽实体 + 社区摘要）',
    indexCostLevel: 'bad',
    queryCost: '极高（~610K tokens/次）',
    queryCostLevel: 'bad',
    multiHop: '中等（通过社区间接支持）',
    multiHopLevel: 'warn',
    globalUnderstanding: '最强（社区摘要覆盖全局）',
    globalLevel: 'good',
    incrementalUpdate: '困难（需重建社区）',
    incrementalLevel: 'bad',
    maturity: '高（微软官方维护）',
    maturityLevel: 'good'
  },
  {
    name: 'LazyGraphRAG',
    paper: '微软 2024-2025',
    indexCost: '低（≈向量 RAG）',
    indexCostLevel: 'good',
    queryCost: '低（full 的 0.1%-4%）',
    queryCostLevel: 'good',
    multiHop: '中等',
    multiHopLevel: 'warn',
    globalUnderstanding: '强（按需触发社区分析）',
    globalLevel: 'good',
    incrementalUpdate: '较易',
    incrementalLevel: 'good',
    maturity: '中（官方但较新）',
    maturityLevel: 'warn'
  },
  {
    name: 'LightRAG',
    paper: 'arxiv:2410.05779',
    indexCost: '低（一次 LLM 实体抽取）',
    indexCostLevel: 'good',
    queryCost: '极低（<100 tokens/次）',
    queryCostLevel: 'good',
    multiHop: '中等（图传播）',
    multiHopLevel: 'warn',
    globalUnderstanding: '中等（高层主题检索）',
    globalLevel: 'warn',
    incrementalUpdate: '支持',
    incrementalLevel: 'good',
    maturity: '中（EMNLP 2025）',
    maturityLevel: 'warn'
  },
  {
    name: 'HippoRAG',
    paper: 'arxiv:2405.14831',
    indexCost: '低（LLM 三元组抽取）',
    indexCostLevel: 'good',
    queryCost: '低（PPR 毫秒级）',
    queryCostLevel: 'good',
    multiHop: '最强（PPR 单步多跳）',
    multiHopLevel: 'good',
    globalUnderstanding: '弱（无全局摘要）',
    globalLevel: 'bad',
    incrementalUpdate: '支持',
    incrementalLevel: 'good',
    maturity: '中（NeurIPS 2024）',
    maturityLevel: 'warn'
  },
  {
    name: 'LinearRAG',
    paper: 'arxiv:2510.10114',
    indexCost: '低-中（轻量实体抽取 + 语义连接）',
    indexCostLevel: 'good',
    queryCost: '低（两阶段图检索）',
    queryCostLevel: 'good',
    multiHop: '中等（图激活 + 重要性聚合）',
    multiHopLevel: 'warn',
    globalUnderstanding: '中等',
    globalLevel: 'warn',
    incrementalUpdate: '较易',
    incrementalLevel: 'good',
    maturity: '中（ICLR 2026）',
    maturityLevel: 'warn'
  },
  {
    name: 'RAPTOR',
    paper: 'arxiv:2401.18059',
    indexCost: '中（递归摘要）',
    indexCostLevel: 'warn',
    queryCost: '低（向量检索）',
    queryCostLevel: 'good',
    multiHop: '弱（树结构无图路径）',
    multiHopLevel: 'bad',
    globalUnderstanding: '强（顶层摘要）',
    globalLevel: 'good',
    incrementalUpdate: '困难（需重建树）',
    incrementalLevel: 'bad',
    maturity: '中（ICLR 2024）',
    maturityLevel: 'warn'
  },
  {
    name: 'Hybrid+Rerank',
    paper: '工程最佳实践',
    indexCost: '最低（向量 + BM25）',
    indexCostLevel: 'good',
    queryCost: '最低',
    queryCostLevel: 'good',
    multiHop: '弱（需 Query Decompose 补充）',
    multiHopLevel: 'bad',
    globalUnderstanding: '弱（无全局视野）',
    globalLevel: 'bad',
    incrementalUpdate: '容易',
    incrementalLevel: 'good',
    maturity: '最高（生产验证）',
    maturityLevel: 'good'
  }
];

export const graphWarmupQuestions = [
  {
    question: '你的 GraphRAG 每次查询消耗 60 万 token，日均 1 万次查询，月成本是多少？（按 GPT-4o $2.5/1M tokens 算）',
    hook: '算完这笔账你就知道为什么需要替代方案——月成本 $450,000+，年成本超 500 万美元'
  },
  {
    question: '如果老板说"我要图谱增强的 RAG，但预算只有向量 RAG 的 3 倍"，你选哪个方案？',
    hook: 'LightRAG 查询成本 <100 tokens/次，是 GraphRAG 的 1/6000。这才是务实的选择'
  }
];

export const graphQuestions = [
  {
    question: 'LazyGraphRAG 号称"索引成本≈向量 RAG"，它是怎么做到不用 LLM 构建索引的？会不会牺牲图的质量？',
    hint: '想想"延迟 LLM 使用"的具体含义——索引时不调 LLM，那图是怎么建的？',
    answer: 'LazyGraphRAG 在索引期用轻量 NLP 工具（NER、依存句法分析、共指消解）而非 LLM 来抽取实体和关系，成本极低。图的质量确实不如 LLM 抽取的精细（尤其是隐含关系的识别），但关键是——查询时 LazyGraphRAG 会按需调用 LLM 来理解和补充上下文。这是一种"需要时再精细化"的策略。实测表明，由于查询时 LLM 有了完整的查询上下文，它对关系的理解反而比索引期盲目抽取更准确。'
  },
  {
    question: 'HippoRAG 用 Personalized PageRank 实现"单步多跳"，但 PPR 不是无监督算法吗？它怎么保证找到的是语义上正确的推理链路？',
    hint: '想想 PPR 的"Personalization vector"是怎么初始化的',
    answer: 'PPR 的关键在于 Personalization Vector 的设置。HippoRAG 用 LLM 从查询中提取关键实体，然后用这些实体对应的 KG 节点作为种子节点（teleport probability 集中在这些节点上）。这样 PPR 的传播方向是由查询语义引导的，而不是随机的。同时，KG 中的边（关系）本身承载了语义信息，PPR 沿着有意义的关系传播。局限是：如果 KG 中缺少关键的边（LLM 抽取三元组时遗漏），PPR 就找不到正确的路径。解决方案是同时用向量检索做 fallback——图找不到的，向量来补。'
  },
  {
    question: 'RAPTOR 用递归聚类+摘要构建树，但摘要会丢失细节。如果用户问的恰好是被摘要"抽象掉"的细节怎么办？',
    hint: '想想 RAPTOR 的检索是在哪些层上做的',
    answer: 'RAPTOR 的检索是跨层的——它不只搜索顶层摘要，也搜索叶子节点（原始 chunks）。查询时，embedding 相似度会自动匹配到最合适的层级：细节问题匹配叶子节点，概括问题匹配上层摘要。这是 RAPTOR 设计的精妙之处：树结构不是为了替代原始文本，而是为了增加"不同抽象层级"的检索入口。当然，如果某个细节在叶子节点里的 embedding 和查询不够相似（语义漂移），可能还是会被遗漏——但这是所有向量检索的通病，不是 RAPTOR 特有的。'
  },
  {
    question: '如果你的业务场景同时需要多跳推理和全局概览能力，应该怎么组合这些方案？一个系统能同时用两种吗？',
    hint: '想想 RAG 系统的 query routing',
    answer: '完全可以组合，关键是做好 query routing。实践方案：1) 用一个轻量分类器（或 LLM）判断查询类型：简单事实查询 → Hybrid+Rerank；多跳关系查询 → HippoRAG；全局概览查询 → LazyGraphRAG；长文档层级查询 → RAPTOR。2) 共享底层文档存储和 embedding，不同方案只是在此基础上构建不同的索引结构（KG / 树 / 社区图）。3) 索引可以并行构建，查询时按路由结果选择检索路径。成本控制：只对高频查询类型构建专用索引，低频类型 fallback 到 Hybrid+Rerank。'
  },
  {
    question: '从工程可维护性角度，这些方案的上线和运维复杂度差异大吗？团队应该怎么评估自己"Hold 得住"哪个方案？',
    hint: '想想图数据库运维、LLM pipeline 复杂度、增量更新的工程难度',
    answer: '差异很大。按运维复杂度排序：Hybrid+Rerank（最低，标准向量数据库 + BM25）< RAPTOR（中低，需维护树结构和摘要更新）< LightRAG（中，需要图数据库 + 向量数据库 + 增量更新 pipeline）< HippoRAG（中高，KG + PPR 计算 + 三元组抽取 pipeline）< GraphRAG/LazyGraphRAG（最高，完整的图构建 + 社区检测 + 多阶段查询 pipeline）。评估标准：1) 团队有没有图数据库（Neo4j/TigerGraph）运维经验？没有就别上 KG 方案；2) 有没有 LLM pipeline 的监控和 tracing 能力？没有就先补基建；3) 数据更新频率——月更还是日更？日更必须支持增量索引。建议：先跑 PoC（1-2 周），在真实数据上评估效果和运维开销，再做决策。'
  }
];

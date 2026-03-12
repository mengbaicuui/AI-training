// RAG 全链路 Pipeline 数据
// 面向有经验的开发团队，聚焦 2026 企业级最佳实践

export const pipelineWarmupQuestions = [
    {
        question: '你的 RAG 系统上线后，用户反馈"答案不对"，你的 debug 路径是什么？',
        hook: '没有 tracing 就没法迭代——你需要知道是检索没召回、rerank 排错、还是 LLM 幻觉'
    },
    {
        question: '离线 ingestion 和在线 query-time 哪个更容易成为瓶颈？',
        hook: '答案取决于你的更新频率——日更和实时更新是完全不同的架构'
    },
    {
        question: 'Embedding 模型换了一版，你的整个 pipeline 需要重建吗？',
        hook: '这取决于你的索引架构设计——是否预留了 embedding_model_version 字段'
    },
    {
        question: '用户问了一个需要跨三个文档才能回答的问题，你的系统能处理吗？',
        hook: '单跳 vs 多跳检索是核心设计选择，决定了你需要 Naive RAG 还是 Agentic RAG'
    }
];

export const pipelineStages = [
    {
        id: 'offline',
        name: '离线 Ingestion',
        nameEn: 'Offline Ingestion',
        description: '从异构数据源到可检索知识库的完整离线处理链路',
        highlightNodes: ['collect', 'chunk', 'embed', 'index', 'metadata'],
        details: {
            goal: '将企业异构文档（PDF/HTML/DB/API）转化为高质量、可检索的知识索引',
            pipeline: '采集清洗 → 智能切分 → 向量化 → 混合索引 → 元数据/ACL 绑定',
            challenges: [
                { name: '文档解析', desc: 'PDF 表格/图片/公式提取仍是 2026 的难题，推荐 MinerU / Marker + VLM (GPT-4o) 兜底' },
                { name: '切分策略', desc: '固定 token vs 语义边界 vs 文档结构切分，直接影响下游召回质量；chunk 太小丢上下文，太大引入噪声' },
                { name: '增量更新', desc: '全量重建 vs 增量 upsert，需要设计 document_id → chunk_id 的映射关系和版本管理' },
                { name: 'Embedding 选型', desc: '2026 主流: text-embedding-3-large / BGE-M3 / GTE-Qwen2；需评估多语言能力、长文本截断、维度 vs 延迟 trade-off' }
            ],
            bestPractices: [
                '每个 chunk 保留 source_doc、page_no、section_title 等 metadata，方便溯源和过滤',
                'Embedding 维度越高不代表越好，要在延迟和质量之间权衡（Matryoshka Embedding 可按需截断维度）',
                '混合索引（Vector + BM25）是 2026 标配，别只用 dense——专有名词和编号靠 BM25 救命',
                '预留 chunk_version 和 embedding_model_version 字段，为模型升级做准备',
                '文档更新时按 document_id 做 cascade delete + re-insert，避免 zombie chunks'
            ],
            questions: [
                {
                    question: '你的文档里有大量表格和流程图，纯文本 chunking 丢失了结构信息，怎么办？',
                    hint: '想想 multimodal embedding 和 structured chunk',
                    answer: '方案一：用 VLM (如 GPT-4o) 将表格/图转为结构化文本描述再 embed；方案二：保留原始 HTML/Markdown 结构作为 chunk 的一部分，检索时呈现原始格式；方案三：表格单独存储为 structured data，检索时走 NL2SQL 路径。2026 最佳实践是混合方案——纯文本走 embedding，结构化数据走专用索引。'
                },
                {
                    question: 'Embedding 模型从 v2 升级到 v3，必须全量重建索引吗？有没有渐进迁移方案？',
                    answer: '技术上必须重建，因为不同模型的向量空间不兼容，余弦相似度无意义。渐进方案：1) 双索引并行（新文档用新模型，旧文档保留旧索引，query 同时查两个）；2) 后台异步重建 + 灰度切换（先迁移 10% 流量验证效果）；3) 用 Matryoshka embedding 降低重建成本。关键：设计之初就预留 embedding_model_version 字段。'
                }
            ]
        }
    },
    {
        id: 'online',
        name: '在线 Query-time',
        nameEn: 'Online Query-time',
        description: '从用户 Query 到最终 Response 的实时处理链路',
        highlightNodes: ['query-understand', 'retrieve', 'rerank', 'context', 'generate', 'feedback'],
        details: {
            goal: '在严格延迟预算内（通常 P95 < 3s）完成高质量的检索增强生成',
            pipeline: 'Query 理解 → 混合检索 → 重排 → 上下文组装 → 生成(+引用) → 反馈日志',
            challenges: [
                { name: '延迟分配', desc: '3s 预算内分配：Query 理解 ~100ms, 检索 ~200ms, Rerank ~300ms, LLM 生成 ~2s, 其余 ~400ms' },
                { name: '上下文窗口', desc: '128K context 不代表你应该塞 128K，实测超过 16K tokens 后 LLM 准确率显著下降（Lost in the Middle）' },
                { name: '幻觉控制', desc: '即使检索到了正确内容，LLM 仍可能忽略或曲解；需要 grounding prompt + 引用标注双重保障' },
                { name: 'Query 改写', desc: '用户原始 query 通常不适合直接检索，需要 HyDE / Step-back / 多路改写 + 子问题分解' }
            ],
            bestPractices: [
                '每个环节的输入/输出都要关联 trace_id + span_id，否则无法定位问题',
                'Rerank 是性价比最高的优化：加一层 cross-encoder 通常能提升 10-20% 准确率，延迟仅增 200-300ms',
                '上下文组装时做 dedup + 按相关性排序，重要信息放开头和结尾（避免 Lost in the Middle 效应）',
                '生成时强制引用来源 chunk_id，既方便用户验证，也为反馈闭环提供 ground truth',
                '对相同/相似 query 做语义缓存（Semantic Cache），命中率通常能到 20-30%'
            ],
            questions: [
                {
                    question: '用户问"去年 Q3 营收同比增长多少"，你的 RAG 系统如何处理这种需要计算的问题？',
                    hint: '纯文本检索 + LLM 生成够吗？',
                    answer: '纯 RAG 难以可靠处理数值计算。推荐方案：1) Query 理解阶段识别"计算意图"，路由到 NL2SQL / Code Interpreter；2) 如果数据在文档中，检索到包含数字的 chunk 后让 LLM 做 chain-of-thought 计算并验证；3) Agentic RAG 模式下，agent 自主决定走检索还是工具调用。关键是 query 理解阶段的意图分类。'
                },
                {
                    question: 'LLM 生成时明明检索到了正确 chunk，但输出的答案还是错的，可能的原因有哪些？',
                    answer: '常见原因：1) Lost in the Middle — 正确 chunk 排在上下文中间位置被 LLM 忽略；2) 上下文总长度过大导致注意力分散；3) 干扰 chunk（语义相关但内容矛盾）误导了 LLM 选择错误信息；4) Prompt 没有明确指示"仅基于以下内容回答，不要使用先验知识"。解决方案：Rerank 提升精度、控制 context 长度在 8-16K、优化 grounding prompt、对关键信息做高亮标注。'
                }
            ]
        }
    }
];

// ReactFlow 节点定义
export const pipelineNodes = [
    // ── 离线 Ingestion 节点 (y=50) ──
    {
        id: 'collect',
        position: { x: 50, y: 50 },
        data: { label: '采集 / 清洗\n(Ingest)' },
        type: 'default',
        stage: 'offline'
    },
    {
        id: 'chunk',
        position: { x: 280, y: 50 },
        data: { label: '切分\n(Chunking)' },
        type: 'default',
        stage: 'offline'
    },
    {
        id: 'embed',
        position: { x: 510, y: 50 },
        data: { label: 'Embedding\n(向量化)' },
        type: 'default',
        stage: 'offline'
    },
    {
        id: 'index',
        position: { x: 740, y: 50 },
        data: { label: '索引构建\n(Vec + BM25)' },
        type: 'default',
        stage: 'offline'
    },
    {
        id: 'metadata',
        position: { x: 990, y: 50 },
        data: { label: '元数据 / ACL\n(Tag & Filter)' },
        type: 'default',
        stage: 'offline'
    },

    // ── 在线 Query-time 节点 (y=300) ──
    {
        id: 'query-understand',
        position: { x: 20, y: 300 },
        data: { label: 'Query 理解\n(Rewrite/Expand)' },
        type: 'default',
        stage: 'online'
    },
    {
        id: 'retrieve',
        position: { x: 220, y: 300 },
        data: { label: '检索\n(Hybrid Retrieval)' },
        type: 'default',
        stage: 'online'
    },
    {
        id: 'rerank',
        position: { x: 430, y: 300 },
        data: { label: '重排\n(Rerank)' },
        type: 'default',
        stage: 'online'
    },
    {
        id: 'context',
        position: { x: 640, y: 300 },
        data: { label: '上下文组装\n(Context Assembly)' },
        type: 'default',
        stage: 'online'
    },
    {
        id: 'generate',
        position: { x: 860, y: 300 },
        data: { label: '生成 + 引用\n(Generate)' },
        type: 'default',
        stage: 'online'
    },
    {
        id: 'feedback',
        position: { x: 1090, y: 300 },
        data: { label: '反馈 / 日志\n(Trace & Log)' },
        type: 'default',
        stage: 'online'
    }
];

// ReactFlow 边定义
export const pipelineEdges = [
    // ── 离线流 ──
    { id: 'e-collect-chunk', source: 'collect', target: 'chunk', type: 'smoothstep' },
    { id: 'e-chunk-embed', source: 'chunk', target: 'embed', type: 'smoothstep' },
    { id: 'e-embed-index', source: 'embed', target: 'index', type: 'smoothstep' },
    { id: 'e-index-meta', source: 'index', target: 'metadata', type: 'smoothstep' },

    // ── 在线主流 ──
    { id: 'e-query-retrieve', source: 'query-understand', target: 'retrieve', type: 'smoothstep' },
    { id: 'e-retrieve-rerank', source: 'retrieve', target: 'rerank', type: 'smoothstep' },
    { id: 'e-rerank-context', source: 'rerank', target: 'context', type: 'smoothstep' },
    { id: 'e-context-generate', source: 'context', target: 'generate', type: 'smoothstep' },
    { id: 'e-generate-feedback', source: 'generate', target: 'feedback', type: 'smoothstep' },

    // ── 离线 → 在线 跨链路 ──
    { id: 'e-index-retrieve', source: 'index', target: 'retrieve', type: 'smoothstep' },
    { id: 'e-meta-context', source: 'metadata', target: 'context', type: 'smoothstep' },

    // ── 捷径/变体路径 (用于不同范式高亮) ──
    { id: 'e-retrieve-generate', source: 'retrieve', target: 'generate', type: 'default', style: { strokeDasharray: '8,4' } },
    { id: 'e-retrieve-context', source: 'retrieve', target: 'context', type: 'default', style: { strokeDasharray: '8,4' } },

    // ── 反馈闭环 ──
    { id: 'e-feedback-query', source: 'feedback', target: 'query-understand', type: 'smoothstep', style: { strokeDasharray: '5,5' } }
];

// RAG 范式定义
export const paradigms = [
    {
        id: 'naive',
        name: 'Naive RAG',
        flow: 'Query → Vec Search → Generate',
        scenario: '内部知识库 MVP、原型验证',
        details: [
            '最简单的 RAG 架构：直接 embed query → top-k 向量召回 → 拼接进 prompt → 生成。',
            '2023 年的 "Hello World"，但令人惊讶的是，很多生产系统 <strong>仍在用</strong>这个架构。',
            '<strong>致命缺陷</strong>：没有 query 改写（同义词/缩写不匹配）、没有 rerank（top-k 顺序不优）、没有 context 优化（直接拼接浪费 token）。',
            '典型症状：用户换个说法就找不到答案；检索到了正确 chunk 但 LLM 答非所问。',
            '⚠️ 如果你的系统还是 Naive RAG，<strong>最低成本的改进就是加 Rerank</strong>（通常能提升 10-20% 准确率）。'
        ],
        highlightNodes: ['query-understand', 'retrieve', 'generate'],
        highlightEdges: ['e-query-retrieve', 'e-retrieve-generate'],
        questions: [
            {
                question: 'Naive RAG 最常见的三个失败模式是什么？你的线上系统有没有类似的 case？',
                answer: '三大失败模式：1) 词汇鸿沟 — 用户 query 和文档措辞不同（如"退款"vs"申请取消订单返还金额"），没有 query 改写导致召回失败；2) 排序噪声 — embedding 相似度 top-k 不等于最相关 top-k，没有 rerank 导致噪声 chunk 被优先喂给 LLM；3) Lost in the Middle — 正确 chunk 被排在中间位置，LLM 注意力集中在上下文首尾，忽略了中间的关键信息。任何一个都说明需要升级。'
            }
        ],
        nodeDetails: {
            'query-understand': {
                title: 'Query Embedding',
                role: '直接将用户原始 query 通过 embedding 模型编码为向量，不做任何改写',
                data: '用户原始 query 文本',
                output: 'query 向量 (d 维)',
                keyPoint: '没有 query 改写、扩展或分解，query 质量完全取决于用户表达'
            },
            'retrieve': {
                title: '向量检索 (Top-K)',
                role: '在向量索引中通过 ANN 找到与 query 最近的 K 个 chunk',
                data: 'query 向量 + Vector Index (HNSW/IVF)',
                output: 'Top-K chunks（通常 K=3~5）',
                keyPoint: '只用 dense retrieval，无 BM25 辅助；长尾词/精确编号/专有名词容易漏召回'
            },
            'generate': {
                title: '直接拼接生成',
                role: '将检索到的 chunk 原样拼接进 system prompt，让 LLM 直接回答',
                data: 'system prompt + retrieved chunks(未优化排序) + user query',
                output: '最终回答（无引用标注、无置信度评估）',
                keyPoint: '上下文质量完全依赖检索排序，无 rerank 纠错机会，无法溯源验证'
            }
        }
    },
    {
        id: 'hybrid',
        name: 'Hybrid RAG',
        flow: 'Query → BM25 + Dense → RRF → Generate',
        scenario: '包含专有名词、编号的企业知识库',
        details: [
            '核心改进：<strong>BM25（精确关键词匹配）+ Dense Embedding（语义理解）</strong>双路检索。',
            '用 <strong>RRF (Reciprocal Rank Fusion)</strong> 合并两路结果，公式：score = Σ 1/(k + rank_i)，k=60 是常用默认值。',
            '典型收益：长尾 query、专有名词（合同编号、产品型号）、技术术语的召回率显著提升。',
            '2026 年标配 — Elasticsearch、Milvus、Qdrant、Weaviate 都已原生支持 hybrid search。',
            '💡 进阶：用 <strong>Learned Sparse Encoder</strong>（SPLADE / BGE-M3 sparse 输出）替代传统 BM25，效果更好。'
        ],
        highlightNodes: ['query-understand', 'index', 'retrieve', 'context', 'generate'],
        highlightEdges: ['e-query-retrieve', 'e-index-retrieve', 'e-retrieve-context', 'e-context-generate'],
        questions: [
            {
                question: 'BM25 和 Dense Retrieval 各自的盲区是什么？能举出具体的失败 case 吗？',
                answer: 'BM25 盲区：语义相同但措辞不同的 query（如"怎么退款" vs "申请取消订单返还金额"），因为没有关键词重叠，BM25 得分为 0。Dense 盲区：包含精确 ID/编号/专有名词的 query（如"查看合同编号 A20240315 的条款"），因为 embedding 模型会将 ID 压缩为语义向量，丢失精确匹配信息。Hybrid 的核心价值就是互补这两个盲区。'
            },
            {
                question: 'RRF 的 k 值选多少？k=60 是经验值还是有理论依据？',
                answer: 'k=60 来自 2009 年 Cormack 等人的原始论文，是在多个 TREC 数据集上网格搜索后的最优值。直觉理解：k 越大，高排名和低排名的分数差距越小（更平均）；k 越小，高排名的权重越大。实践中 k=40~80 差别不大，建议用你自己的评估集做 grid search。替代方案：Convex Combination（加权平均）需要归一化分数，调参更复杂但上限更高。'
            }
        ],
        nodeDetails: {
            'query-understand': {
                title: 'Query 双路分析',
                role: '同时提取语义意图（生成 embedding）和关键词信号（提取实体/关键词）',
                data: '用户 query',
                output: 'query embedding + 关键词列表/实体',
                keyPoint: '关键词提取服务 BM25 路径，语义编码服务 Dense 路径，两路并行'
            },
            'index': {
                title: '双索引架构',
                role: '同时维护 Vector Index（HNSW/IVF）和 BM25 倒排索引',
                data: 'chunk embeddings + chunk 原文分词',
                output: '可供并行查询的双索引',
                keyPoint: 'BM25 擅长精确匹配和稀有词，Dense 擅长语义泛化和同义词；两者互补'
            },
            'retrieve': {
                title: '混合检索 + RRF 融合',
                role: '并行执行 BM25 和向量检索，通过 RRF 公式合并排序',
                data: 'query embedding + 关键词 + 双索引',
                output: '融合排序后的 Top-K chunks',
                keyPoint: 'RRF(k=60) 是最常用融合策略：score = Σ 1/(k+rank)，不依赖原始分数归一化'
            },
            'context': {
                title: '上下文拼接',
                role: '将融合后的 Top-K chunks 按 RRF 分数排序后拼接',
                data: 'RRF 排序后的 chunks + metadata',
                output: '拼接好的上下文文本'
            },
            'generate': {
                title: '生成回答',
                role: '基于混合检索结果生成回答',
                data: 'grounding prompt + 混合检索上下文',
                output: '回答文本',
                keyPoint: '相比 Naive RAG 输入质量提升，但仍缺少 rerank 精排——排名前 5 不等于最相关前 5'
            }
        }
    },
    {
        id: 'rerank',
        name: 'Rerank RAG',
        flow: 'Query → Hybrid → Rerank → Context → Generate',
        scenario: '大多数企业 RAG 系统应达到的标准',
        details: [
            '在 Hybrid 检索基础上加一层 <strong>Cross-Encoder 精排</strong>，是大多数企业 RAG 的推荐基线。',
            '核心思路：<strong>Bi-Encoder</strong> 高召回（fast & cheap，top-50~100）→ <strong>Cross-Encoder</strong> 高精度（slow & expensive，精排到 top-5~10）。',
            '上下文组装不再是简单拼接：考虑 <strong>token budget 分配</strong>、<strong>去重</strong>、<strong>排序优化</strong>（重要信息放首尾）。',
            '2026 推荐 Reranker：<strong>BGE-Reranker-v2-m3 / Cohere Rerank 3 / 自训练 cross-encoder</strong>（基于线上反馈数据）。',
            '生成阶段加 <strong>引用标注</strong>：每句话标注来源 chunk_id，方便用户验证和系统评估。',
            '💡 这是性价比最高的 RAG 升级路径 — 加 Rerank 比换更大的 LLM 效果更好且更便宜。'
        ],
        highlightNodes: ['query-understand', 'retrieve', 'rerank', 'context', 'generate'],
        highlightEdges: ['e-query-retrieve', 'e-retrieve-rerank', 'e-rerank-context', 'e-context-generate'],
        questions: [
            {
                question: 'Rerank 为什么是性价比最高的 RAG 优化？它解决了什么根本问题？',
                answer: '根本问题：Bi-Encoder（embedding 模型）为了检索效率，query 和 doc 独立编码，无法做 token 级别的细粒度交互，导致相似度排序不够精确。Cross-Encoder 让 query 和每个 chunk 做 full cross-attention，精度远高于 Bi-Encoder。折中方案：先用 Bi-Encoder 大范围召回 top-50（cheap），再用 Cross-Encoder 精排出 top-5（expensive but small scale）。典型效果：+10-20% 准确率，延迟仅增加 200-300ms，不需要换 LLM 或重建索引。'
            },
            {
                question: '上下文组装时，chunk 的排列顺序对 LLM 输出有多大影响？',
                hint: '想想 Lost in the Middle 现象',
                answer: '影响非常大。2023 年 Stanford 的研究 "Lost in the Middle" 证明：LLM 对上下文首部和尾部的信息利用率最高，中间位置的信息经常被忽略。实践建议：1) 最相关的 chunk 放在开头；2) 次相关的放在结尾；3) 中间放补充信息或直接截掉；4) 控制总 token 数在 8-16K 范围（即使模型支持 128K）。这就是为什么上下文组装是一个独立的工程步骤，而不是简单的字符串拼接。'
            }
        ],
        nodeDetails: {
            'query-understand': {
                title: 'Query 深度理解',
                role: '完整的 query 分析流程：意图识别 + 改写 + 扩展',
                data: '用户 query + 对话历史（多轮场景）',
                output: '改写后的 query / 多路 query 候选',
                keyPoint: '2026 推荐：HyDE（生成假设答案再检索）+ Step-back（抽象化 query）+ 多路改写并行'
            },
            'retrieve': {
                title: '过召回 (Over-retrieval)',
                role: '用宽松条件检索大量候选（top-50~100），确保高召回率',
                data: '改写后的 query + 混合索引',
                output: '大量候选 chunks（50-100 条）',
                keyPoint: '这一步追求召回率而非精度，宁多勿少——精度由下游 Rerank 保证'
            },
            'rerank': {
                title: 'Cross-Encoder 精排',
                role: '对每个 (query, chunk) pair 用 Cross-Encoder 逐一打分，重新排序',
                data: 'query 文本 + 50-100 个候选 chunks',
                output: '精排后的 Top-K chunks（通常 K=5~10）+ rerank 分数',
                keyPoint: 'Cross-Encoder 精度远高于 Bi-Encoder，但延迟 ~200-300ms（50 条 chunk）；是 Bi-Encoder 和 LLM 之间的"精度桥梁"'
            },
            'context': {
                title: '智能上下文组装',
                role: 'Token budget 分配、去重、排序优化、metadata 注入',
                data: '精排后的 chunks + chunk metadata（source、page、section）',
                output: '优化过的上下文窗口（8-16K tokens）',
                keyPoint: '重要 chunk 放首尾（避免 Lost in the Middle）、去除重叠内容、注入 source 标识供引用'
            },
            'generate': {
                title: '引用感知生成',
                role: '生成回答的同时标注每个论述的来源 chunk_id',
                data: 'grounding prompt + 组装好的上下文（含 [chunk-1] [chunk-2] 标识）',
                output: '带引用标注的回答（如：根据 [chunk-2]，...）',
                keyPoint: '引用标注让用户可验证、系统可评估（citation precision/recall），也为反馈闭环提供 ground truth'
            }
        }
    },
    {
        id: 'agentic',
        name: 'Agentic RAG',
        flow: 'Query → Plan → Multi-step → Reflect → Generate',
        scenario: '复杂问答：多跳推理、跨文档对比、需要工具调用',
        details: [
            'LLM 作为 <strong>orchestrator</strong>：自主决定检索策略、工具调用、迭代轮次。',
            '典型流程：Query → <strong>Plan</strong>（分解子问题）→ <strong>多步检索/工具调用</strong> → <strong>Self-Reflection</strong>（证据够了吗？）→ 生成。',
            '适合复杂问题：多跳推理（"A 的供应商的竞争对手有哪些？"）、跨文档对比、需要计算或 API 调用的 query。',
            '延迟显著增加（3-10s），<strong>必须</strong>用流式输出 + 路由策略（简单 query 走 Rerank RAG，复杂 query 才触发 Agent）。',
            '⚠️ <strong>必须有 Trace & Observability</strong>，否则多步 Agent 出错时完全无法 debug。',
            '💡 不要所有 query 都走 Agent — 80% 的 query 用 Rerank RAG 就够了，Agent 只处理 20% 的复杂 case。'
        ],
        highlightNodes: ['query-understand', 'retrieve', 'rerank', 'context', 'generate', 'feedback'],
        highlightEdges: ['e-query-retrieve', 'e-retrieve-rerank', 'e-rerank-context', 'e-context-generate', 'e-generate-feedback', 'e-feedback-query'],
        questions: [
            {
                question: 'Agentic RAG 相比 Rerank RAG 延迟高 3-5 倍，如何在体验和成本之间取得平衡？',
                answer: '四个策略：1) 路由分流：用轻量分类器（或 LLM 一次判断）将 query 分为简单/复杂，简单走 Rerank RAG（<2s），复杂才触发 Agent（3-10s）；2) 流式输出：Agent 每步结果实时 stream 给用户，体验上不是"等 8 秒"而是"看 AI 一步步分析"；3) 语义缓存：对相似 query 复用 Agent 的检索计划和中间结果；4) 预算控制：设最大步数（如 5 步）和超时（如 15s），避免 Agent 陷入无限循环。'
            },
            {
                question: 'Agentic RAG 的 self-reflection 具体是怎么实现的？什么时候该停止迭代？',
                answer: '实现方式：每轮检索后，让 LLM 评估已收集证据的充分性，prompt 类似"基于以上证据，你能完整回答用户问题吗？如果不能，还需要查什么？"。停止条件：1) LLM 判断证据充分；2) 达到最大步数限制；3) 连续两轮检索没有获得新信息（收敛）。实践中常见问题：Agent 过度自信（早停）或过度保守（无限检索），需要通过 prompt 工程和评估数据调优。'
            }
        ],
        nodeDetails: {
            'query-understand': {
                title: 'LLM Query Planner',
                role: '用 LLM 分析 query 复杂度，制定检索计划（子问题分解、工具选择、执行顺序）',
                data: '用户 query + 对话历史 + 可用工具列表',
                output: '检索执行计划（sub-queries + tool selection + execution order）',
                keyPoint: 'Agent 在此决定：直接检索 / 多步分解 / 调用外部工具（SQL/API/Calculator）'
            },
            'retrieve': {
                title: '多步自适应检索',
                role: '根据计划执行多轮检索 + 工具调用，中间结果驱动下一步策略',
                data: '检索计划 + 知识索引 + 外部工具 API',
                output: '多来源证据集合（向量检索结果 + 工具返回值）',
                keyPoint: 'Agent 根据中间结果动态调整策略——如果第一轮没找到，换个 query 再试'
            },
            'rerank': {
                title: '证据评估 (Self-Reflection)',
                role: 'Agent 评估已收集证据的充分性、一致性，决定是否继续检索',
                data: '多轮检索结果 + 原始 query',
                output: '经过验证的证据集 + 充分性判断 + 置信度评分',
                keyPoint: '关键决策点：证据不够则继续检索，证据矛盾则交叉验证，证据充分则进入生成'
            },
            'context': {
                title: '多源上下文编排',
                role: '整合多轮检索和工具调用的结果，消除冗余和矛盾',
                data: '多来源证据 + 工具返回值 + 推理链记录',
                output: '结构化的多源上下文（含来源标注和置信度）',
                keyPoint: '需要处理信息冲突（不同文档说法不一）和冗余（多轮检索的重复内容）'
            },
            'generate': {
                title: '综合推理生成',
                role: '基于多源证据进行推理并生成最终回答，附推理链和引用',
                data: '多源上下文 + 推理链',
                output: '带推理过程、多源引用和置信度的完整回答',
                keyPoint: '可输出 confidence score 和 reasoning chain，支持用户验证和下游评估'
            },
            'feedback': {
                title: '全链路 Trace & Logging',
                role: '记录 Agent 完整执行轨迹：每一步的输入/输出/耗时/决策理由',
                data: 'trace_id + 每步 span（plan/retrieve/reflect/generate）',
                output: '结构化 Trace 日志 + 用户反馈 + 自动评估分数',
                keyPoint: '2026 必备：没有 trace 就没法 debug Agentic RAG——你需要知道 Agent 为什么做了这个决策'
            }
        }
    },
    {
        id: 'graph',
        name: 'GraphRAG',
        flow: 'Query → Entity → Graph Traverse → Evidence Chain → Generate',
        scenario: '多跳关系推理、全局摘要、因果链追溯',
        details: [
            '用 <strong>知识图谱</strong> 替代/增强向量检索，适合关系型问题和全局理解。',
            '离线阶段：从文档中 <strong>提取实体 + 关系</strong> → 构建 Knowledge Graph → <strong>社区检测</strong>（Leiden 算法）→ 社区摘要。',
            '在线阶段：Query → <strong>实体识别</strong> → <strong>图遍历</strong>（多跳路径搜索）→ <strong>证据链构建</strong> → 生成。',
            '适合：多跳关系推理（"张三的导师的合作者有哪些？"）、全局摘要（"这个领域的主要研究方向？"）、因果链追溯。',
            '不适合：简单事实查询（向量检索更快）、实时性要求高的场景（图更新延迟大）。',
            '💡 2026 实践：<strong>Graph + Vector 混合</strong>才是最优解，不是非此即彼 — 简单 query 走向量，关系 query 走图。'
        ],
        highlightNodes: ['query-understand', 'retrieve', 'context', 'generate'],
        highlightEdges: ['e-query-retrieve', 'e-retrieve-context', 'e-context-generate'],
        questions: [
            {
                question: '什么样的问题适合 GraphRAG？什么样的不适合？判断标准是什么？',
                answer: '判断标准：你的问题是否需要跨多个实体的关系推理？适合：1) 多跳关系推理（"A 的供应商的竞争对手有哪些？"需要 A→supplier→competitor 的图路径）；2) 全局摘要（"这个行业的主要玩家和竞争格局？"需要社区检测和全局视图）；3) 因果链追溯（"事件 A 如何间接导致了事件 C？"需要路径搜索）。不适合：1) 简单事实查询（"公司成立时间"——向量检索 10ms 搞定）；2) 开放式问答——图结构限制了答案范围；3) 数据实时性要求高——知识图谱构建和更新延迟大。'
            },
            {
                question: 'GraphRAG 的知识图谱构建成本如何？离线建图阶段有哪些坑？',
                answer: '成本高昂：1) NER + 关系抽取需要 LLM 逐文档处理，1000 篇文档可能需要数万次 API 调用；2) 实体消歧（"苹果"是公司还是水果？）是 NLP 经典难题，错误会传播到下游；3) 关系类型需要预定义 schema 或用 open IE（开放信息抽取），前者受限于 schema 覆盖率，后者噪声大；4) 图更新时需要增量更新实体和关系，处理实体合并/拆分很复杂。建议：先用 Microsoft GraphRAG 或 LightRAG 的开源工具验证可行性，再决定是否投入自建。'
            }
        ],
        nodeDetails: {
            'query-understand': {
                title: '实体 / 关系提取',
                role: '从 query 中提取关键实体和期望的关系类型，构建子图查询',
                data: '用户 query',
                output: '实体列表 + 关系类型 + 子图查询条件',
                keyPoint: 'NER + 关系分类的准确率直接决定了图遍历的起点是否正确'
            },
            'retrieve': {
                title: '图遍历 + 社区检测',
                role: '在知识图谱中找到相关子图：多跳路径搜索 + 社区摘要检索',
                data: '实体查询 + Knowledge Graph（含社区结构）',
                output: '相关子图路径、实体属性、社区摘要',
                keyPoint: '不是向量检索！是基于图拓扑结构的结构化检索——路径长度、节点度、社区归属'
            },
            'context': {
                title: '证据链构建',
                role: '将图路径和社区摘要转化为自然语言证据链，保持逻辑结构',
                data: '子图路径 + 节点/边属性 + 社区摘要',
                output: '结构化的证据链文本（保留实体关系）',
                keyPoint: '证据链保持了实体间的逻辑关系，比纯文本 chunk 更有推理支撑力'
            },
            'generate': {
                title: '图增强生成',
                role: '基于结构化证据链和社区摘要生成回答，支持多跳推理',
                data: '证据链 + 社区摘要 + query + 关系上下文',
                output: '带关系推理链的结构化回答',
                keyPoint: '适合需要推理"为什么"和"怎么关联"的问题，但建图成本高、更新延迟大'
            }
        }
    }
];

export const pipelineSummary = {
    title: '核心认知：RAG 是系统工程',
    points: [
        { key: '离线质量', desc: '决定了在线效果的**上限** — 垃圾进垃圾出，再好的 Rerank 也救不了' },
        { key: 'Rerank', desc: '是**性价比最高**的单点改进 — 比换 LLM 便宜、比重建索引快' },
        { key: 'Observability', desc: '没有 Trace 就不要谈优化 — 你需要知道每个 query 在哪个环节丢了分' },
        { key: '范式选择', desc: '80% 的 query 用 **Rerank RAG** 就够，Agent/Graph 只处理剩下的 20%' },
        { key: '2026 趋势', desc: '**Agentic RAG + 端到端评估 + Semantic Cache** 是企业级落地的三驾马车' }
    ]
};

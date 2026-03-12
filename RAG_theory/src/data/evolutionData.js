// RAG 技术演进 — 从朴素到知识增强
// 内容综合自课程 PDF 材料

export const evolutionSections = [
  { id: 'timeline', icon: '🕒', title: '时间轴（里程碑）' },
  { id: 'naive', icon: '🟢', title: '朴素 RAG 的局限' },
  { id: 'advanced', icon: '🔵', title: '高级 RAG 跃迁' },
  { id: 'agentic', icon: '🟣', title: '智能体 RAG' },
  { id: 'knowledge', icon: '🟠', title: '知识增强 RAG' },
  { id: 'comparison', icon: '📊', title: '技术代际对比' },
  { id: 'selection', icon: '🎯', title: '技术选型策略' },
];

export const evolutionTimeline = [
  {
    date: '2020',
    title: 'Naive RAG 基础范式形成',
    highlight: '这一阶段确立了“检索 → 拼接上下文 → 生成”的基本管线，RAG 从预训练增强走向独立系统范式。',
    knowledgePoints: ['Dense Retrieval', 'Retrieve-then-Read', '基础 RAG pipeline'],
    papers: [
      'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (2020)',
      'REALM: Retrieval-Augmented Language Model Pre-Training (2020)',
      'Dense Passage Retrieval for Open-Domain Question Answering (2020)',
      'FiD: Leveraging Passage Retrieval with Generative Models for Open Domain Question Answering (2020)',
    ],
  },
  {
    date: '2022',
    title: '训练期与推理期检索增强继续深化',
    highlight: 'RAG 不再只是“接一个向量库”，而开始探索 few-shot、黑盒 LLM 增强、检索型预训练等更系统的结合方式。',
    knowledgePoints: ['Few-shot RAG', 'Black-box LLM augmentation', 'Retrieval-oriented pretraining'],
    papers: [
      'Atlas: Few-shot Learning with Retrieval Augmented Language Models (2022)',
      'RePlug: Retrieval-Augmented Black-Box Language Models (2023)',
      'Improving Language Models by Retrieving from Trillions of Tokens (2022)',
      'RetroMAE: Pre-Training Retrieval-oriented Language Models Via Masked Auto-Encoder (2022)',
    ],
  },
  {
    date: '2023',
    title: '从“能检索”走向“检得准”',
    highlight: '业界开始系统补齐 query 变换、融合检索、重排序、长上下文组织，Advanced RAG 成为默认升级路线。',
    knowledgePoints: ['HyDE', 'RAG-Fusion', 'Rerank', 'Long-context RAG'],
    papers: [
      'HyDE: Precise Zero-Shot Dense Retrieval without Relevance Labels (2023)',
      'RAG-Fusion: A New Take on Retrieval Augmented Generation (2024)',
      'RankRAG: Unifying Context Ranking with Retrieval-Augmented Generation (2024)',
      'LongRAG: Enhancing Retrieval-Augmented Generation with Long-context LLMs (2024)',
    ],
  },
  {
    date: '2023-10',
    title: 'Self-RAG：自反思式 RAG',
    highlight: 'Self-RAG 把“是否检索、何时检索、生成后如何 critique”合并进一个自反思框架，是 Agentic RAG 的关键转折点。',
    knowledgePoints: ['Self-reflection', 'Adaptive retrieval', 'Critique tokens', 'Factuality'],
    papers: [
      'Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection (2023/2024)',
    ],
  },
  {
    date: '2024-01',
    title: 'CRAG：Corrective RAG（检索纠错）',
    highlight: '核心思想不是“盲信检索结果”，而是先判断检索质量。如果证据不够好，就补检索、改写、外部搜索或过滤噪声。',
    knowledgePoints: ['Retrieval evaluator', 'Corrective retrieval', 'Decompose-then-recompose', 'Fallback search'],
    papers: [
      'Corrective Retrieval Augmented Generation (CRAG) (2024)',
      'Adaptive-RAG: Learning to Adapt Retrieval-Augmented Large Language Models through Question Complexity (2024)',
      'Active Retrieval Augmented Generation (2024)',
    ],
  },
  {
    date: '2024',
    title: 'Graph / Structured RAG 爆发',
    highlight: 'RAG 从“chunk 排序”升级为“知识组织”。图、树、社区与结构化推理进入主线，用来解决多跳、跨文档关联与全局问题。',
    knowledgePoints: ['GraphRAG', 'Entity-relation graph', 'Global/local retrieval', 'Tree retrieval'],
    papers: [
      'GraphRAG: Unlocking LLM Discovery on Narrative Private Data (2024)',
      'StructRAG: Boosting Knowledge Intensive Reasoning of LLMs via Inference-time Hybrid Information Structurization (2024)',
      'HippoRAG: Neurobiologically Inspired Long-Term Memory for Large Language Models (2024)',
      'RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval (2024)',
    ],
  },
  {
    date: '2025',
    title: 'LightRAG：轻量知识增强成为务实路线',
    highlight: '团队开始从“重 GraphRAG”转向“轻量图增强”。LightRAG 与后续的 LinearRAG 代表了一类更可落地的路径：尽量减少关系抽取、社区摘要和重型图构建，用更低成本换取跨文档关联与全局理解。',
    knowledgePoints: ['LightRAG', 'LinearRAG', 'Lightweight Graph RAG', 'Incremental update', 'Graph + vector hybrid retrieval'],
    papers: [
      'LightRAG: Simple and Fast Retrieval-Augmented Generation (2024/2025)',
      'HippoRAG: Neurobiologically Inspired Long-Term Memory for Large Language Models (2024)',
      'LinearRAG: Linear Graph Retrieval Augmented Generation on Large-scale Corpora (2025 / ICLR 2026)',
    ],
  },
  {
    date: '2025',
    title: '多模态 RAG 从“可做”走向“文档理解主线”',
    highlight: '当企业知识源本身包含版面、表格、截图、扫描件和图纸时，Multimodal RAG 不应只在最后兜底，而应尽早考虑把这些非文本信息转成可检索的摘要、caption 或结构化表示。',
    knowledgePoints: ['Multimodal parsing', 'OCR + VLM', 'Document understanding', '图文联合检索'],
    papers: [
      'Ask in Any Modality: A Comprehensive Survey on Multimodal Retrieval-Augmented Generation (2025)',
      'Scaling Beyond Context: A Survey of Multimodal Retrieval-Augmented Generation for Document Understanding (2025)',
    ],
  },
  {
    date: '2026',
    title: 'Agentic RAG 进入“诊断式评测”阶段',
    highlight: '评测重点从最终答案转向“过程诊断”：不仅要知道答得对不对，还要知道哪一跳检索错了、哪一步路由错了、轨迹是否失真。',
    knowledgePoints: ['Hop-aware evaluation', 'Trace-level diagnosis', 'Adaptive routing benchmark', 'Trajectory quality'],
    papers: [
      'AgenticRAGTracer: A Hop-Aware Benchmark for Diagnosing Multi-Step Retrieval Reasoning in Agentic RAG (2026)',
      'RAGRouter-Bench: A Dataset and Benchmark for Adaptive RAG Routing (2026)',
    ],
  },
  {
    date: '2024-2026',
    title: 'Benchmark / Evaluation / System Engineering 成为默认配置',
    highlight: 'RAG 不再只比“回答像不像”，而是开始系统评估噪声鲁棒性、负例拒绝、信息整合、轨迹质量、线上回归和成本延迟。',
    knowledgePoints: ['RAGBench', 'CRUD-RAG', 'ARES', 'RGB', 'System-level evaluation'],
    papers: [
      'RAGBench: Explainable Benchmark for Retrieval-Augmented Generation Systems (2024)',
      'CRUD-RAG: A Comprehensive Chinese Benchmark for Retrieval-Augmented Generation of Large Language Models (2024)',
      'ARES: An Automated Evaluation Framework for Retrieval-Augmented Generation Systems (2024)',
      'Benchmarking Large Language Models in Retrieval-Augmented Generation (RGB) (2023)',
    ],
  },
];

export const evolutionKnowledgePointDetails = {
  'Dense Retrieval': {
    name: 'Dense Retrieval',
    summary: 'Dense Retrieval 指把 query 和文档编码到同一个向量空间，通过语义相似度而不是关键词重合来做检索。',
    whyItMatters: '它让 RAG 具备了同义表达、语义改写和模糊问法的召回能力，是现代 RAG 的基础检索能力之一。',
  },
  'Retrieve-then-Read': {
    name: 'Retrieve-then-Read',
    summary: '先检索候选文档，再把候选文档交给阅读器或生成模型回答，这是最经典的 RAG 两阶段范式。',
    whyItMatters: '它把“找资料”和“用资料回答”分开，使系统能在外部知识更新时不必重训大模型。',
  },
  '基础 RAG pipeline': {
    name: '基础 RAG pipeline',
    summary: '典型流程是切分文档、建立索引、检索 top-k、拼接上下文、再生成答案。',
    whyItMatters: '后面所有进阶路线，本质上都是在这个 pipeline 的某个环节上做增强。',
  },
  'Few-shot RAG': {
    name: 'Few-shot RAG',
    summary: '在检索和生成阶段引入少量示例，帮助模型更稳定地理解任务形式和回答风格。',
    whyItMatters: '它说明 RAG 不只是“加文档”，还可以通过示例检索改善任务适配。',
  },
  'Black-box LLM augmentation': {
    name: 'Black-box LLM augmentation',
    summary: '面向不可训练、不可改权重的闭源大模型，通过外部检索来增强能力。',
    whyItMatters: '这条路线非常贴近企业现实，因为很多生产系统接的是 API 模型而不是自训练模型。',
  },
  'Retrieval-oriented pretraining': {
    name: 'Retrieval-oriented pretraining',
    summary: '在预训练阶段就让模型适应“检索再利用”的范式，而不只是在推理期外挂检索。',
    whyItMatters: '它代表了训练期增强路线，说明 RAG 能力可以内生到模型里。',
  },
  HyDE: {
    name: 'HyDE',
    summary: 'HyDE 会先让模型生成一个“假设答案”，再用这个答案的 embedding 去检索真实文档。',
    whyItMatters: '它特别适合短 query、模糊 query 或用户表达很不标准的情况，常作为 query 优化手段。',
  },
  'RAG-Fusion': {
    name: 'RAG-Fusion',
    summary: '把同一问题改写成多个 query 并分别检索，再做融合排序。',
    whyItMatters: '它解决“用户只用一种问法提问，但文档可能用另一种表述”的问题。',
  },
  Rerank: {
    name: 'Rerank',
    summary: '先广泛召回，再用更强的精排模型把真正最相关的证据提到前面。',
    whyItMatters: '很多系统从 demo 到生产，最大的质量提升往往就来自 rerank，而不是换更大的生成模型。',
  },
  'Long-context RAG': {
    name: 'Long-context RAG',
    summary: '利用长上下文模型承载更多检索结果，减少因截断导致的信息缺失。',
    whyItMatters: '它不是替代检索，而是改变“检多少、怎么组装”的上下文策略。',
  },
  'Self-reflection': {
    name: 'Self-reflection',
    summary: '模型在生成过程中反思自己当前证据是否足够、答案是否可靠。',
    whyItMatters: '这是 Agentic RAG 的核心控制能力之一，让系统不再只是单向流水线。',
  },
  'Adaptive retrieval': {
    name: 'Adaptive retrieval',
    summary: '系统根据 query 难度和当前证据状态，动态决定是否继续检索、补检索或停止。',
    whyItMatters: '它把检索从固定动作变成可控动作，能兼顾质量、成本和延迟。',
  },
  'Critique tokens': {
    name: 'Critique tokens',
    summary: 'Self-RAG 一类方法里，会显式生成用于自我批评和选择的中间控制信号。',
    whyItMatters: '它让“判断答案靠不靠谱”成为模型可学习的一部分，而不是外部硬编码规则。',
  },
  Factuality: {
    name: 'Factuality',
    summary: 'Factuality 指回答是否忠于事实和证据，是否没有编造。',
    whyItMatters: '它是高风险场景里最重要的生成质量指标之一。',
  },
  'Retrieval evaluator': {
    name: 'Retrieval evaluator',
    summary: '先判断当前检索结果质量够不够，再决定是否纠错、补检索或改写 query。',
    whyItMatters: '它是 CRAG 这类方法的核心，让系统不再默认盲信 top-k。',
  },
  'Corrective retrieval': {
    name: 'Corrective retrieval',
    summary: '当第一次检索不好时，通过重写 query、过滤噪声或引入其他数据源做补救。',
    whyItMatters: '它把“检索失败”显式纳入系统控制逻辑，是从静态 RAG 到动态 RAG 的重要一步。',
  },
  'Decompose-then-recompose': {
    name: 'Decompose-then-recompose',
    summary: '先把复杂问题或复杂证据拆开处理，再重新组织成最终上下文或答案。',
    whyItMatters: '这能减少噪声干扰，也能让系统更好地处理复杂检索结果。',
  },
  'Fallback search': {
    name: 'Fallback search',
    summary: '当主路径失败时，系统自动切换到 web search、备用索引或其他工具。',
    whyItMatters: '它体现了生产系统的鲁棒性，而不是把所有希望压在一次检索上。',
  },
  GraphRAG: {
    name: 'GraphRAG',
    summary: 'GraphRAG 通过实体、关系、社区和摘要把知识组织成图结构，再支持更强的全局分析与多跳推理。',
    whyItMatters: '它把 RAG 从“chunk 排序”升级为“知识组织”，但工程成本也明显上升。',
  },
  'Entity-relation graph': {
    name: 'Entity-relation graph',
    summary: '把文档中的实体和它们的关系抽出来，形成结构化知识图。',
    whyItMatters: '这类结构特别适合跨文档关联、路径推理和显式关系查询。',
  },
  'Global/local retrieval': {
    name: 'Global/local retrieval',
    summary: '既能做全局主题级检索，也能做局部实体或段落级检索。',
    whyItMatters: '这是 GraphRAG 和 LightRAG 类路线的重要优势，能同时服务概览问题和细节问题。',
  },
  'Tree retrieval': {
    name: 'Tree retrieval',
    summary: '把文档组织成树状层级，如 RAPTOR 那样支持跨层摘要与跨层检索。',
    whyItMatters: '它适合长文档、多粒度问题，而不必一定走知识图谱路线。',
  },
  LightRAG: {
    name: 'LightRAG',
    summary: 'LightRAG 试图用更低的建图和查询成本，保留部分图增强 RAG 的好处。',
    whyItMatters: '它代表 2025 之后更务实的知识增强路线，适合预算敏感团队。',
  },
  LinearRAG: {
    name: 'LinearRAG',
    summary: 'LinearRAG 强调图检索框架应尽量线性扩展，避免重型关系抽取的高成本。',
    whyItMatters: '它适合大规模语料场景，是“要图结构但不想做重 GraphRAG”的代表方案。',
  },
  'Lightweight Graph RAG': {
    name: 'Lightweight Graph RAG',
    summary: '指一类轻量图增强方案，用较低的图构建成本换取跨文档关联和全局理解能力。',
    whyItMatters: '它体现了行业从“重图”向“轻图”的趋势转变。',
  },
  'Incremental update': {
    name: 'Incremental update',
    summary: '知识库更新时只更新受影响的图节点、chunk 或索引，而不是整库重建。',
    whyItMatters: '这是知识增强路线能否进入生产的关键工程能力。',
  },
  'Graph + vector hybrid retrieval': {
    name: 'Graph + vector hybrid retrieval',
    summary: '同时利用图结构关系和向量语义相似度来做联合检索。',
    whyItMatters: '它兼顾了语义召回和结构化推理，是很多轻量图路线的核心设计。',
  },
  'Multimodal parsing': {
    name: 'Multimodal parsing',
    summary: '不只解析正文，还要解析表格、图像、版面、扫描件和截图等多模态内容。',
    whyItMatters: '如果数据源中大量关键信息不在纯文本里，就应尽早把这些非文本内容转成可检索对象，而不是只做纯文本管线。',
  },
  'OCR + VLM': {
    name: 'OCR + VLM',
    summary: '先用 OCR 提取文本，再用视觉语言模型理解图像、版面和图文关系。',
    whyItMatters: '这是多模态文档理解里最常见也最实用的技术组合。',
  },
  'Document understanding': {
    name: 'Document understanding',
    summary: '不仅把文档读成文字，还要理解结构、区域、元素类型及其关系。',
    whyItMatters: '当文档里的关键信息分布在表格、版面和图像区域时，它会直接决定后续 chunking、引用、表格处理和图文检索的上限。',
  },
  '图文联合检索': {
    name: '图文联合检索',
    summary: '文本 query 可以召回图像、表格和示意图，反过来图像内容也能辅助文本问答。',
    whyItMatters: '这让 RAG 能真正覆盖复杂企业文档，而不只是段落文本。',
  },
  'Hop-aware evaluation': {
    name: 'Hop-aware evaluation',
    summary: '评估时不只看最后答对没答对，还要看多跳检索和推理的每一跳是否正确。',
    whyItMatters: '这是 Agentic RAG 时代评估体系升级的重要标志。',
  },
  'Trace-level diagnosis': {
    name: 'Trace-level diagnosis',
    summary: '基于完整执行轨迹来诊断系统问题，而不是只看最终输出文本。',
    whyItMatters: '没有 trace，就很难知道是路由错、工具错、还是证据错。',
  },
  'Adaptive routing benchmark': {
    name: 'Adaptive routing benchmark',
    summary: '专门评估系统是否把不同复杂度的 query 路由到合适路径。',
    whyItMatters: '随着系统分流越来越复杂，路由本身也成了独立评估对象。',
  },
  'Trajectory quality': {
    name: 'Trajectory quality',
    summary: '评估 agent 轨迹是否合理、是否有多余步骤、是否选错工具。',
    whyItMatters: 'Agentic RAG 不能只看答案文本，过程本身也要评。',
  },
  RAGBench: {
    name: 'RAGBench',
    summary: 'RAGBench 是面向 RAG 系统的综合评测基准，强调可解释和可分析的评估方式。',
    whyItMatters: '它代表评估从“只比答案”走向“系统级诊断”。',
  },
  'CRUD-RAG': {
    name: 'CRUD-RAG',
    summary: '中文 RAG 评估基准之一，覆盖更贴近中文场景的数据与问题。',
    whyItMatters: '中文业务场景不能只看英文 benchmark，必须有本地化评估。',
  },
  ARES: {
    name: 'ARES',
    summary: 'ARES 是自动化 RAG 评估框架，强调从多个维度系统地判断 RAG 质量。',
    whyItMatters: '它说明评估工具链已经开始成为独立基础设施。',
  },
  RGB: {
    name: 'RGB',
    summary: 'RGB 关注大模型在 RAG 场景下的综合表现，是较早的 RAG benchmark 代表之一。',
    whyItMatters: '它帮助行业建立了“RAG 需要专门 benchmark”的共识。',
  },
  'System-level evaluation': {
    name: 'System-level evaluation',
    summary: '不是只评模型，而是评整个系统：数据、检索、重排、生成、引用、延迟和成本。',
    whyItMatters: '生产系统要优化的是整条链路，而不是只优化某个单点模型分数。',
  },
};

export const evolutionContent = {
  timeline: {
    title: '时间轴（里程碑）',
    content: [
      '这页用一条时间轴把 RAG 的关键“能力跃迁”串起来。重点不是年份本身，而是你应该在系统里补齐哪些能力：检索质量 → 排序与改写 → 纠错与路由 → 结构化组织（图/树）→ 多模态 → 系统级评估与可观测。',
      '2025-2026 的主线尤其明显：重 GraphRAG 转向更务实的 LightRAG / LinearRAG / HippoRAG 路线；多模态 RAG 从“可做”升级为文档理解默认能力；Agentic RAG 开始出现 trace-level / hop-level 的专门 benchmark。',
      '建议用法：把时间轴当作“升级 checklist”。如果你当前系统只停留在 2021 的 Retrieve-then-Read，请优先补齐 2023-2024 的 Hybrid + Rerank + Query 优化，再考虑 Agentic / Graph / Multimodal。',
    ],
  },
  naive: {
    title: '朴素 RAG 的局限',
    content: [
      '朴素 RAG 采用线性流程：文档切块（Chunk）→ 向量化（Embed）→ 向量存储 → 余弦相似度检索 → 将 Top-K 结果喂给 LLM 生成。这种架构实现简单，适合简单问答场景。',
      '但在领域特定场景下，朴素 RAG 会暴露出严重短板。以汽车维修手册为例：电路图被不当切分后，跨 chunk 的电路连接信息丢失；具体故障码（如 P0301）仅靠向量相似度难以精准匹配，因为 embedding 模型会将这类编号压缩为模糊的语义向量。',
      '"Garbage in, garbage out" 是朴素 RAG 的典型写照。若 Top-5 召回结果中有 3 条无关文档，LLM 的注意力会被严重分散，导致幻觉率升高、答案质量下降。',
      '朴素 RAG 在复杂文档处理、跨文档推理、多跳问答等场景下表现较弱，幻觉率较高，难以满足生产级需求。',
    ],
  },
  advanced: {
    title: '高级 RAG 跃迁',
    content: [
      '高级 RAG 在检索前后引入多级优化。检索前（Pre-retrieval）：Query Rewriting 将口语化表达转为专业术语；HyDE 生成假设答案再检索；RAG Fusion 通过多路 query 变体提升召回覆盖。',
      '检索后（Post-retrieval）：引入 Reranker（Cross-encoder）对初排结果做二次精排，显著提升 Top-K 精度；Context Compression 压缩冗余上下文，控制 token 消耗。',
      'Hybrid Search 是高级 RAG 的核心能力：BM25 + Dense 向量 + RRF 融合，对故障码、专有名词、精确编号等关键词类 query 的匹配能力远超纯向量检索。',
      'Self-Query 可自动从 query 中解析过滤条件（如「2023 款大众途观空调故障」→ { year: 2023, brand: "VW" }），结合语义检索实现更精准的召回。',
      '需注意「Lost in the Middle」现象：上下文中间位置的关键信息往往获得较少注意力，重要内容应尽量放在首尾。',
    ],
  },
  agentic: {
    title: '智能体 RAG',
    content: [
      '智能体 RAG 赋予 LLM 决策权：由模型自主决定是检索手册、调用 OBD 接口，还是查询召回数据库，实现多源、多步的灵活推理。',
      '采用 Plan-Act-Observe 循环：先制定检索计划，执行检索或工具调用，观察结果后决定是否继续迭代，直至获得足够证据再生成最终答案。',
      '支持动态工具集成：可接入网页搜索、API 调用、多知识源，适应复杂业务场景。',
      '代价是推理延迟更高、成本管理更复杂。典型技术栈包括 LangGraph、Tool Calling 等。',
    ],
  },
  knowledge: {
    title: '知识增强 RAG',
    content: [
      'GraphRAG 从文档中抽取实体与关系，构建知识图谱，通过多跳推理连接纯文本 embedding 难以捕捉的隐性关联。',
      '建图成本高、技术门槛高。2025 之后的趋势不是“一股脑上重 GraphRAG”，而是优先评估更轻量的替代方案：LazyGraphRAG、LightRAG、LinearRAG、HippoRAG、RAPTOR 等，在成本、增量更新与效果间提供不同折中。',
      '多模态 RAG：使用 VLM 直接理解电路图等图像，Voyage-multimodal-3 等模型可将文本 query 映射到图像 embedding，实现图文联合检索。',
    ],
  },
  comparison: {
    title: '技术代际对比',
    content: [
      '下表概括了五类 RAG 技术路线的核心特征、典型技术栈与主要局限，便于快速定位当前系统所处阶段及升级方向。',
    ],
  },
  selection: {
    title: '技术选型策略',
    content: [
      '简单 FAQ 场景：朴素 RAG 即可满足需求，无需过度设计。',
      '领域知识库：推荐高级 RAG，重点配置 Hybrid Search + Reranker，性价比最高。',
      '复杂多步推理：需要智能体 RAG，由 LLM 自主规划检索与工具调用。',
      '跨文档关联推理：适合知识增强 RAG（GraphRAG 或轻量替代方案）。2025-2026 更推荐先从 LightRAG / LinearRAG / HippoRAG 这类务实路线验证收益，再决定是否投入重型 GraphRAG。',
      '生产实践中，混合搭配（Mix-and-match）很常见：多数 query 走高级 RAG，少数复杂 query 路由到智能体或图增强路径。',
    ],
  },
};

// 技术代际对比表数据
export const evolutionComparisonTable = [
  {
    stage: 'Naive RAG',
    coreFeature: '简单余弦相似度',
    typicalStack: 'LangChain, Chroma',
    limitations: '幻觉率高，复杂文档处理弱',
  },
  {
    stage: 'Advanced RAG',
    coreFeature: 'Pre-process + Rerank + Hybrid',
    typicalStack: 'BGE-Reranker, Hybrid Search',
    limitations: '推理深度有限，无跨文档能力',
  },
  {
    stage: 'Agentic RAG',
    coreFeature: '自主规划 + 多步 + 工具',
    typicalStack: 'LangGraph, Tool Calling',
    limitations: '延迟更高，成本管理复杂',
  },
  {
    stage: 'Knowledge RAG',
    coreFeature: '图结构组织 + 关系推理',
    typicalStack: 'Neo4j, GraphRAG, LightRAG, LinearRAG, HippoRAG',
    limitations: '构建成本高，技术门槛高',
  },
  {
    stage: 'Multimodal RAG',
    coreFeature: '图文表统一解析 + 联合检索',
    typicalStack: 'MinerU, PaddleOCR-VL, VLM, Multimodal Embedding',
    limitations: '解析链路复杂，索引与评估成本更高',
  },
];

export const evolutionQuestions = {
  warmUp: [
    {
      question: '你的 RAG 系统目前处于哪个演进阶段？遇到了什么瓶颈？',
      hook: '先识别当前阶段和瓶颈，再规划升级路径',
    },
    {
      question: '朴素 RAG 在处理哪些类型的查询时最容易失败？',
      hook: '故障码、跨文档、模糊 query 是典型盲区',
    },
    {
      question: 'Hybrid Search 解决了向量搜索的什么核心缺陷？',
      hook: '关键词精确匹配：编号、专有名词、术语',
    },
  ],
  deepThinking: [
    {
      question: '从朴素 RAG 直接跳到 Agentic RAG 是否可行？为什么大多数团队选择渐进式演进？',
      hint: '考虑复杂度、成本、可观测性',
      answer: '技术上可行，但实践中多数团队选择渐进式演进。原因包括：1) 复杂度跃迁大，Agentic RAG 的 Plan-Act-Observe 循环、工具编排、多步 trace 对工程和运维要求高；2) 成本与延迟显著增加，需路由策略和预算控制；3) 可观测性挑战：多步 Agent 出错时若无完整 trace 难以定位问题；4) 80% 的 query 用高级 RAG 即可满足，直接上 Agent 性价比低。渐进式路径（Naive → Hybrid+Rerank → Agentic）能逐步验证效果并控制风险。',
    },
    {
      question: 'Knowledge-Enhanced RAG 的构建成本如何与其收益平衡？什么场景值得投入？',
      hint: '多跳推理、跨文档关联',
      answer: 'Knowledge-Enhanced RAG 的建图成本高（NER、关系抽取、实体消歧、增量更新），需评估投入产出比。值得投入的场景包括：1) 多跳关系推理（如「A 的供应商的竞争对手有哪些？」需沿图路径遍历）；2) 跨文档关联推理，纯文本 chunk 难以建立实体间的显式关系；3) 全局主题洞察、因果链追溯等需要结构化关系的任务。若仅做简单事实查询，向量检索已足够，不必上 GraphRAG。可先用 LightRAG、LazyGraphRAG 等轻量方案验证。',
    },
    {
      question: '如果预算有限，你会如何设计一个「80分」的 RAG 系统？哪些组件优先级最高？',
      hint: 'ROI 最高的单点改进',
      answer: '预算有限时，优先投入 ROI 最高的组件：1) Hybrid Search（BM25 + Dense + RRF）— 解决编号、专有名词召回，成本低、收益高；2) Reranker（Cross-encoder 精排）— 在初排 top-50 上精排到 top-5，通常可提升 10–20% 准确率，延迟仅增 200–300ms；3) Query Rewriting / HyDE — 改善 query 与文档的语义对齐。可暂缓 Agentic、GraphRAG 等复杂架构，待核心检索质量稳定后再按需扩展。',
    },
  ],
};

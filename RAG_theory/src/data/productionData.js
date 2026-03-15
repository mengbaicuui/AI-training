export const productionSections = [
  { id: 'rbac', icon: '🔐', title: 'ACL 与权限控制' },
  { id: 'deployment', icon: '🏗️', title: '部署策略' },
  { id: 'cost', icon: '💰', title: '成本优化' },
  { id: 'latency', icon: '⚡', title: '延迟优化' },
  { id: 'monitoring', icon: '📡', title: '监控与可观测' },
  { id: 'lifecycle', icon: '🔄', title: '知识库生命周期' },
  { id: 'checklist', icon: '✅', title: '上线检查清单' },
];

export const productionContent = {
  rbac: {
    challenge: '维修手册有权限分级——初级技师无法通过 RAG 访问高级/受保护的操作规程。',
    principle: '权限控制的核心原则不是“回答时再遮一层”，而是 **从检索阶段就不让未授权 chunk 进入候选集**。只要模型看到了，就存在泄露风险。',
    solution: '在向量库层基于 metadata 的权限隔离。',
    approach: '在查询时动态注入 user_role_id 过滤器 → 模型永远不会看到未授权的 chunk。',
    enforcementPoints: [
      { point: 'Doc-level ACL', desc: 'Ingestion 阶段打标签' },
      { point: 'Chunk-level ACL', desc: '继承自 doc + 可选覆盖' },
      { point: 'Query-level ACL', desc: '运行时 filter 注入' },
    ],
    designPattern: '每个 chunk metadata 包含 access_roles: ["senior_tech", "manager"]',
    multiTenant: '多租户隔离：独立 collection 或严格的 metadata 过滤 per tenant',
    auditLogging: '审计日志：记录每次 query + 检索到的 chunks + 回答，供合规审查',
    checkpoints: [
      '权限标签必须在 ingestion 时落到 document / chunk metadata，而不是临时拼接在 prompt 里',
      'ACL 与 metadata filter 要做回归测试，验证“该看的能看到，不该看的绝对看不到”',
      '上线前要专门测“跨角色、跨租户、跨版本”的越权 case',
    ],
    codeExample: `def search_with_acl(query_vec, user_ctx):
    filters = {
        "tenant_id": user_ctx["tenant_id"],
        "access_roles": {"$in": user_ctx["roles"]},
        "doc_status": "active"
    }

    return vectordb.search(
        query_vector=query_vec,
        top_k=8,
        filters=filters
    )`,
  },
  deployment: {
    decisionMatrix: [
      { dimension: '上线速度', managed: '几天', openSource: '1-2 周', diy: '数周至数月' },
      { dimension: '定制深度', managed: '低（受限于 API）', openSource: '中（可改源码但有框架约束）', diy: '极高（全栈可控）' },
      { dimension: '运维压力', managed: '零运维', openSource: '中（需维护 Docker/DB/模型）', diy: '高（需专门 DevOps/MLOps）' },
      { dimension: '数据安全', managed: '依赖供应商合规', openSource: '可私有部署，完全隔离', diy: '完全物理隔离' },
      { dimension: '长期 TCO', managed: '可预测，线性增长', openSource: '中（基建 + 少量运维人力）', diy: '初期低，后期人力成本高' },
      { dimension: '检索管线控制', managed: '黑盒', openSource: '可调（解析/切分/检索策略）', diy: '完全自定义' },
    ],
    managedPlatforms: [
      { name: 'Vectara', note: '端到端托管，内置幻觉检测(HHEM)，API 驱动' },
      { name: 'AWS Bedrock', note: 'Knowledge Bases 功能，与 AWS 生态深度集成' },
      { name: 'Azure AI Search', note: '向量+语义+关键词混合检索，企业合规' },
    ],
    openSourcePlatforms: [
      { name: 'RAGFlow', note: 'InfiniFlow 开源，深度文档解析(DeepDoc)，可视化编排，支持多种 LLM/Embedding' },
      { name: 'Dify', note: '可视化 LLM 应用开发平台，内置 RAG 管线，社区活跃' },
      { name: 'FastGPT', note: '知识库问答平台，支持工作流编排，对中文场景优化好' },
      { name: 'MaxKB', note: '开箱即用的知识库问答系统，1Panel 团队出品' },
    ],
    diyFrameworks: [
      { name: 'LangChain', note: '生态最大，组件丰富，适合快速原型' },
      { name: 'LlamaIndex', note: '数据索引优先，结构化数据支持好' },
      { name: 'Haystack', note: 'deepset 出品，Pipeline 设计清晰' },
    ],
    layeredStrategy: '分层策略建议：快速验证 → 开源平台(RAGFlow/Dify)；非核心场景(FAQ) → 托管平台；核心业务逻辑 → 代码自研以保护 IP。',
    smoothLaunch: '平稳上线：培训用户、前两周密切监控、准备回滚方案',
  },
  cost: {
    breakdown: [
      { area: 'Storage', items: 'raw + chunks + vectors + trace / audit logs' },
      { area: 'Compute', items: 'embedding, indexing, query, rerank, LLM inference' },
      { area: 'API fees', items: 'embedding API, rerank API, LLM API' },
    ],
    caching: [
      'Semantic cache：相似 query → 缓存回答',
      'FAQ 预计算：高频问题直接命中，不走完整 RAG',
      'Redis / GPTCache',
      '检索结果缓存：query rewrite 后的 top-k 也可以缓存，减少向量检索压力',
    ],
    tieredRouting: '分层模型路由：简单 query → 小/便宜模型；复杂 → 强模型',
    embeddingReduction: [
      'Matryoshka 降维',
      '批量处理',
      '本地模型 vs API',
      '只对新增/变更文档增量 embedding，而不是全量重跑',
    ],
    vectorDbOpt: [
      '压缩、量化',
      '索引类型选择（HNSW vs IVF）',
      '冷热分层：热门知识走高性能索引，冷数据走低成本存储',
    ],
    costHeuristics: [
      '先看请求分布，再做成本优化。高频 FAQ 与长尾复杂查询的优化策略完全不同。',
      '生产里的大头通常不是 embedding，而是 generation token + rerank + 长 context。',
      '很多系统“成本高”不是模型太贵，而是没有缓存、没有路由、没有 context budget。'
    ],
    codeExample: `def route_model(query_type, risk_level):
    if query_type == "faq":
        return "small-fast-model"
    if risk_level == "high":
        return "strong-grounded-model"
    return "mid-tier-model"`,
  },
  latency: {
    budget: [
      { stage: 'Query preprocessing', range: '10-50ms', color: 'var(--accent-info)' },
      { stage: 'Retrieval', range: '50-200ms', color: 'var(--accent-primary)' },
      { stage: 'Reranking', range: '100-300ms', color: 'var(--accent-secondary)' },
      { stage: 'LLM generation', range: '500-3000ms', color: 'var(--accent-danger)' },
    ],
    retrievalOpt: [
      'Metadata 预过滤后再向量检索',
      'ANN 索引调优',
      'Hybrid 双路并行 + RRF 融合，避免串行等待',
    ],
    generationOpt: ['Streaming 响应', '异步处理', '严格控制 context token 预算'],
    parallelExec: '并行执行：Hybrid 场景下 BM25 和 dense search 同时跑',
    slo: 'SLO 定义：各阶段 P50/P95/P99 目标',
    latencyHeuristics: [
      '优先优化 TTFT（首 token 时间）而不是只看总时长，用户更在意“多久开始看到答案”。',
      '如果 p95 异常高，先查外部依赖抖动和 retry，而不是先换模型。',
      '大多数情况下 rerank 值得保留，因为它带来的质量收益通常高于 100-300ms 的额外延迟。'
    ],
    codeExample: `async def rag_query(query):
    bm25_task = sparse_search(query)
    dense_task = dense_search(query)
    bm25_res, dense_res = await gather(bm25_task, dense_task)

    merged = rrf_merge(bm25_res, dense_res)
    top_chunks = rerank(merged[:30])[:6]

    return stream_generate(query, top_chunks)`,
  },
  monitoring: {
    metrics: [
      'QPS',
      'Latency percentiles',
      'Retrieval relevance scores',
      'Faithfulness scores',
      'User satisfaction (thumbs up/down)',
    ],
    tools: [
      { name: 'LangSmith', desc: 'traces' },
      { name: 'Langfuse', desc: '开源可观测' },
      { name: 'Arize Phoenix', desc: 'drift detection' },
      { name: 'MLflow', desc: 'experiment tracking' },
    ],
    alerts: [
      'Faithfulness 下降',
      'Latency 突增',
      'Retrieval relevance 退化',
    ],
    abTesting: '组件升级 A/B 测试（新 embedding、新 reranker）',
    observabilityNotes: [
      '至少要把 query、rewrite、retrieved docs、rerank 后 docs、prompt、answer、citations 打进 trace。',
      '没有 trace 的评分几乎无法定位问题，只能看到“分低了”。',
      '线上监控不仅服务于报警，也服务于评估集回收和数据飞轮。'
    ],
    observabilityImage: {
      src: '/llm-observability-metrics.png',
      alt: 'LLM 应用可观测指标体系图',
      title: 'LLM 应用可观测指标体系',
      caption: '从生产视角看，可观测不只是 trace 和日志，还应覆盖四类指标：系统与资源监控、服务质量与可靠性、模型效果与评估、用户体验与业务价值。这样才能把“模型表现差”进一步拆成延迟、失败率、幻觉、用户反馈、业务转化等可定位的问题。'
    },
    codeExample: `trace = langfuse.trace(name="rag-request", input={"query": query})
trace.span(name="retrieval", input={"query": query}, output={"doc_ids": top_doc_ids})
trace.span(name="generation", input={"prompt": prompt}, output={"answer": answer})
trace.score(name="faithfulness", value=0.91)`,
  },
  lifecycle: {
    layers: [
      { name: 'Core Layer', desc: '官方手册，高权威，低更新频率', color: 'var(--accent-primary)' },
      { name: 'Frequent Layer', desc: '案例库、技师反馈，高迭代', color: 'var(--accent-secondary)' },
      { name: 'Cache Layer', desc: 'FAQ 结果缓存', color: 'var(--accent-success)' },
    ],
    humanInLoop: [
      '反馈机制（thumbs up/down）',
      '失败案例 pipeline',
      '定期失败归因分析',
    ],
    dataVersionControl: [
      'ingestion_batch_id 支持回滚',
      '向量库 snapshot 支持',
    ],
    componentUpgrades: [
      '新 embedding → 全量 re-index + A/B 测试',
      '新 LLM → 测试 prompt 兼容性',
      '新 reranker → 量化质量 delta',
    ],
    flywheel: '持续改进：monitor → identify issues → fix → deploy → monitor（数据飞轮）',
    lifecycleNotes: [
      '知识库生命周期管理的重点是“删、改、回滚”，不是只会新增。',
      '更新链路必须能区分文档级更新和 chunk 级更新，避免全量重建带来的成本爆炸。',
      '模型升级、索引升级、知识库升级都应该有各自的版本号与回滚点。'
    ],
    codeExample: `def update_document(doc_id, new_blocks):
    changed = diff_blocks(doc_id, new_blocks)
    delete_vectors(doc_id, changed.old_chunk_ids)
    new_chunks = chunk_blocks(changed.new_blocks)
    upsert_vectors(doc_id, new_chunks)
    save_version(doc_id, ingestion_batch_id="2026-03-12-002")`,
  },
  checklist: {
    categories: [
      {
        category: 'Data',
        items: [
          '所有文档解析完成且无乱码',
          '分块质量抽检通过',
          '元数据标签完整(权限/版本/来源)',
          '增量更新管线测试通过',
        ],
      },
      {
        category: 'Retrieval',
        items: [
          'Hybrid 检索 A/B 测试完成',
          'Rerank 提升已量化',
          '元数据过滤验证通过',
        ],
      },
      {
        category: 'Generation',
        items: [
          '幻觉检测阈值已设定',
          '护栏规则已配置',
          'Prompt 模板已审核',
        ],
      },
      {
        category: 'Evaluation',
        items: [
          '离线评估集≥200条',
          'RAG Triad 各指标达标',
          'CI/CD 门禁已接入',
        ],
      },
      {
        category: 'Security',
        items: [
          'ACL 权限隔离已测试',
          '提示注入防御已验证',
          '审计日志已启用',
        ],
      },
      {
        category: 'Operations',
        items: [
          '监控仪表盘已部署',
          '告警规则已配置',
          '回滚方案已演练',
          'SLO 已定义',
        ],
      },
    ],
  },
};

export const productionQuestions = {
  warmUp: [
    {
      question: '你的 RAG 系统有几层权限控制? 是在哪个环节实施的?',
      hook: '理想情况：doc + chunk + query 三层',
    },
    {
      question: '你的 RAG 系统的端到端延迟是多少? 瓶颈在哪里?',
      hook: '通常 LLM 生成是主要瓶颈',
    },
    {
      question: '上线后前两周需要重点关注哪些指标?',
      hook: 'QPS 趋势、faithfulness、用户满意度、延迟',
    },
  ],
  deepThinking: [
    {
      question: '如果知识库需要支持实时更新(分钟级), 你的架构会做哪些改动?',
      hint: '考虑数据同步、索引更新、版本控制',
      answer: 'CDC + 即时索引 + 异步 pipeline + 版本控制。需要变更数据捕获（CDC）监听源系统变更，增量索引而非全量重建，异步 ingestion pipeline 避免阻塞查询，以及 ingestion_batch_id 等版本控制支持回滚。',
    },
    {
      question: '平台方案和 DIY 方案的长期 TCO 拐点大约在什么规模?',
      hint: '从人力成本、定制需求、数据规模角度分析',
      answer: '约 10-20 名工程师、百万级文档、需要自定义解析逻辑时，DIY 的长期 TCO 可能更优。平台方案在早期和小规模时更省心，但随规模增长 API 费用线性上升；DIY 初期投入高（人力、基建），但边际成本低，且能完全掌控数据流和 IP。',
    },
    {
      question: '如何设计一个自动化的"数据飞轮"让 RAG 系统越用越好?',
      hint: '思考反馈闭环、失败案例、迭代机制',
      answer: 'feedback → failed case analysis → data/prompt tuning → re-evaluate → deploy。用户反馈（thumbs up/down）驱动失败案例收集，定期归因分析识别知识库缺口或 prompt 问题，针对性优化后重新评估，通过 CI/CD 门禁后部署，形成持续改进闭环。',
    },
  ],
};

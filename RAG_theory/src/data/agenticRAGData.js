export const agenticSections = [
  {
    id: 'overview',
    icon: '🧭',
    title: 'Agentic RAG 概览',
    content: [
      {
        type: 'text',
        value: 'Agentic RAG 指的是：系统不再固定执行“检索一次 -> 拼接上下文 -> 生成答案”这条流水线，而是由模型根据中间结果动态决定下一步动作，例如**是否检索、是否补检索、是否纠错、是否切换工具、是否停止生成**。'
      },
      {
        type: 'highlight',
        value: '一句话理解：**普通 RAG 是固定流水线，Agentic RAG 是带控制闭环的系统。**'
      },
      {
        type: 'image',
        title: 'Agentic RAG 总体结构图',
        src: '/agentic-rag-overview.png',
        alt: 'Agentic RAG overview diagram',
        caption: '图中概括了 Agentic RAG 的核心组成：agent、planning、tools、memory，以及常见 workflow pattern、taxonomy 和技术栈。适合先建立整体认知，再进入 Self-RAG / CRAG / Adaptive-RAG 等具体方法。'
      },
      {
        type: 'list',
        title: '这页重点讲的 4 条代表路线',
        items: [
          '**Self-RAG**：需要时再检索，并对生成结果做自我 critique',
          '**CRAG**：先检查检索结果质量，不够好就纠错或补救',
          '**Adaptive-RAG**：不同复杂度的 query 走不同 RAG 路径，本质是 routing',
          '**MemoRAG**：把 memory 引入 RAG，让系统不必每次从零开始检索'
        ]
      },
      {
        type: 'table',
        title: '四条路线先有一个全局判断',
        columns: ['路线', '核心动作', '更像在解决什么问题'],
        rows: [
          ['Self-RAG', '按需检索 + critique', '生成阶段如何更忠于证据'],
          ['CRAG', '先评估 retrieval 再纠错', '检索质量不稳定时如何补救'],
          ['Adaptive-RAG', '先分流再走不同路径', '简单 query 不要走重链路'],
          ['MemoRAG', '把已发现知识沉淀成 memory', '多轮/长任务不要重复检索'],
        ],
      },
      {
        type: 'compare',
        title: '什么时候值得上 Agentic',
        items: [
          {
            name: '值得上',
            desc: '多步推理、证据质量不稳定、需要动态补检索、需要工具协作、query 难度差异巨大。'
          },
          {
            name: '先别上',
            desc: 'FAQ、单跳问答、制度检索、基础客服。先把 Hybrid + Rerank + Query 优化做好，收益更稳。'
          }
        ]
      },
      {
        type: 'warning',
        value: '不是所有问题都需要 Agentic。简单 FAQ、政策问答、单跳检索类问题，优先用 Hybrid + Rerank；只有当“是否检索 / 如何检索 / 何时停止”本身变成问题时，才需要 Agentic。'
      }
    ]
  },
  {
    id: 'self-rag',
    icon: '🪞',
    title: 'Self-RAG',
    content: [
      {
        type: 'text',
        value: '**Paper**：Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection（Asai et al., 2023 / ICLR 2024）。这是 Agentic RAG 中最有代表性的“自反思”路线。'
      },
      {
        type: 'image',
        title: 'Self-RAG 原理图',
        src: '/self-rag-diagram.png',
        alt: 'Self-RAG diagram',
        caption: '左：传统 RAG 固定检索 K 个文档再统一生成；右：Self-RAG 按需检索、并行生成片段，再通过 critique 选择更可靠的输出。'
      },
      {
        type: 'list',
        title: '原理',
        items: [
          '**Retrieve on demand**：不是所有 query 都先检索，系统会先判断“要不要检索”',
          '**Generate in segments**：拿到不同证据后，可以并行生成多个候选片段',
          '**Critique and select**：用反思 token / critique 机制给结果打分，选更可靠的输出'
        ]
      },
      {
        type: 'list',
        title: '它解决什么问题',
        items: [
          '**固定 Top-K 检索浪费**：传统 RAG 对所有问题都检索，Self-RAG 可以按需检索',
          '**检索后盲信证据**：Self-RAG 会检查证据是否支持生成结果',
          '**长答案容易夹杂幻觉**：通过 critique 机制提升 factuality 和 citation quality'
        ]
      },
      {
        type: 'list',
        title: '代价：延时与 token',
        items: [
          '**延时**：通常高于普通 RAG，因为多了 critique / 反思 / 候选选择步骤',
          '**token 消耗**：显著高于固定 retrieve-then-read，尤其在长答案或多段生成时更明显',
          '**适用场景**：高价值、高 factuality 要求的 query；不建议默认全量开启'
        ]
      },
      {
        type: 'code',
        lang: 'python',
        title: 'Self-RAG 风格的最小控制逻辑',
        value: `state = {"need_retrieve": False, "draft": None}

if should_retrieve(query):
    state["need_retrieve"] = True
    docs = retrieve(query)
    draft = generate_with_context(query, docs)
else:
    draft = generate_without_retrieval(query)

critique = critique_answer(query, draft, docs if state["need_retrieve"] else [])
if critique["supported"] is False:
    docs = retrieve(rewrite_query(query))
    draft = generate_with_context(query, docs)

return draft`
      }
    ]
  },
  {
    id: 'crag',
    icon: '🛠️',
    title: 'CRAG',
    content: [
      {
        type: 'text',
        value: '**Paper**：Corrective Retrieval Augmented Generation（Yan et al., 2024）。CRAG 的核心不是让模型更会“思考”，而是先解决一个更现实的问题：**如果检索本身错了怎么办？**'
      },
      {
        type: 'image',
        title: 'CRAG 框架：Retrieval → Knowledge Correction → Generation',
        src: '/crag-framework.png',
        alt: 'CRAG 框架流程图：检索评估、知识纠错、生成三阶段',
        caption: 'Retrieval Evaluator 将检索结果分为 Correct / Ambiguous / Incorrect，分别触发 Knowledge Refinement（Decompose-Filter-Recompose）或 Knowledge Searching（Rewrite-Web Search-Select），再送入 Generator 生成回答。'
      },
      {
        type: 'list',
        title: '原理',
        items: [
          '**Retrieval evaluator**：先评估检索结果质量，而不是直接把 top-k 喂给 LLM',
          '**Corrective action**：如果结果不够好，就做过滤、补检索、外部搜索或重新组织上下文',
          '**Decompose-then-recompose**：把噪声较大的检索结果拆开清洗，再重组给生成模型'
        ]
      },
      {
        type: 'list',
        title: '它解决什么问题',
        items: [
          '**检索结果质量不稳定**：尤其是企业知识库里噪声多、chunk 质量参差不齐',
          '**回答错误其实根源在 retrieval**：CRAG 把“检索失败”显式建模出来',
          '**需要 fallback 路线**：例如 web search、补检索、过滤低置信证据'
        ]
      },
      {
        type: 'list',
        title: '代价：延时与 token',
        items: [
          '**延时**：比普通 RAG 略高到明显更高，取决于是否触发 corrective step',
          '**token 消耗**：主要增加在 evaluator / fallback retrieval / recomposition 上',
          '**适用场景**：检索质量波动大的企业数据；通常比“直接换更大模型”更划算'
        ]
      },
      {
        type: 'code',
        lang: 'python',
        title: 'CRAG 风格：先判 retrieval 质量再决定补救',
        value: `docs = retrieve(query)
quality = retrieval_evaluator(query, docs)

if quality < 0.6:
    docs = retrieve(rewrite_query(query))
    if not docs:
        docs = web_search(query)

clean_docs = filter_noise(docs)
return generate_with_context(query, clean_docs)`
      }
    ]
  },
  {
    id: 'adaptive-rag',
    icon: '🧩',
    title: 'Adaptive-RAG',
    content: [
      {
        type: 'text',
        value: '**Paper**：Adaptive-RAG: Learning to Adapt Retrieval-Augmented Large Language Models through Question Complexity（Jeong et al., 2024）。它回答的是另一个关键问题：**不同问题，为什么一定要走同一条 RAG 路径？**'
      },
      {
        type: 'image',
        title: 'Single-Step vs Multi-Step vs Adaptive 对比',
        src: '/adaptive-rag-comparison.png',
        alt: 'Adaptive-RAG 三种路径对比：单步、多步、自适应',
        caption: '(A) 单步 RAG：简单 query 够用，复杂 query 易出错；(B) 多步 RAG：复杂 query 能答对，简单 query 浪费；(C) Adaptive：Classifier 按难度分流，简单走轻路径、复杂走多步，兼顾准确与效率。'
      },
      {
        type: 'list',
        title: '原理',
        items: [
          '**Complexity-aware routing**：先判断 query 难度，再决定走轻路径还是重路径',
          '**Simple query -> cheap path**：简单事实问答走普通 RAG 或少量检索',
          '**Complex query -> heavy path**：复杂推理、多跳、歧义大时才触发更重的流程'
        ]
      },
      {
        type: 'list',
        title: '它解决什么问题',
        items: [
          '**所有 query 走重流程太贵**：Adaptive-RAG 的本质是省钱和控延时',
          '**同一系统要兼顾简单问答和复杂推理**：通过 routing 做路径分流',
          '**系统资源有限**：把昂贵的 agentic / multi-step 能力留给真正需要的请求'
        ]
      },
      {
        type: 'list',
        title: '代价：延时与 token',
        items: [
          '**延时**：平均延时更可控，因为简单 query 不再走重路径',
          '**token 消耗**：总体更省，但会额外引入 router / classifier 成本',
          '**适用场景**：在线系统、对 P95 延时敏感的问答产品，ROI 很高'
        ]
      },
      {
        type: 'code',
        lang: 'python',
        title: 'Adaptive-RAG 路由示意',
        value: `complexity = route_query(query)

if complexity == "simple":
    return hybrid_rag(query)
if complexity == "medium":
    return hybrid_rag_with_rerank(query)
return agentic_rag(query, max_steps=5, max_tool_calls=3)`
      }
    ]
  },
  {
    id: 'memo-rag',
    icon: '🧠',
    title: 'MemoRAG',
    content: [
      {
        type: 'text',
        value: '**Paper**：MemoRAG: Moving towards Next-Gen RAG via Memory-Inspired Knowledge Discovery（2024）。MemoRAG 的价值在于：把 memory 引入 RAG，减少重复检索，并为后续多轮、多任务工作流提供状态积累。'
      },
      {
        type: 'image',
        title: 'Standard RAG vs MemoRAG 对比',
        src: '/memorag-comparison.png',
        alt: 'Standard RAG 与 MemoRAG 架构对比：Inferior Evidence vs Answer Clues + Memory Model',
        caption: '左：Standard RAG 直接检索 → 证据碎片化 → 回答浅显；右：MemoRAG 先生成 Answer Clues 与 Memory Model 的 Draft Answer，再送入 Retriever/Generator，得到更全面、 nuanced 的回答。'
      },
      {
        type: 'list',
        title: '原理',
        items: [
          '**Memory-augmented retrieval**：把过去检索/推理得到的高价值信息沉淀下来',
          '**Knowledge discovery**：不是每一轮都重新从整个语料里搜，而是先利用已有记忆',
          '**Workflow continuity**：适合多轮任务、长期任务、跨步骤推理'
        ]
      },
      {
        type: 'list',
        title: '它解决什么问题',
        items: [
          '**重复检索浪费**：多轮对话/长任务里经常反复搜同一类信息',
          '**系统没有状态连续性**：上一轮得到的证据无法沉淀到下一轮',
          '**复杂工作流缺少长期记忆**：MemoRAG 代表向“memory-aware agent”迈进的一步'
        ]
      },
      {
        type: 'list',
        title: '代价：延时与 token',
        items: [
          '**首次任务成本更高**：需要构建和维护 memory',
          '**后续任务可能更快**：因为可以复用已发现知识',
          '**适用场景**：多轮 / 长期任务；不适合只做单轮 FAQ 的轻系统'
        ]
      }
    ]
  },
  {
    id: 'engineering',
    icon: '🔧',
    title: '工程化：延时、成本、工具与路由',
    content: [
      {
        type: 'text',
        value: 'Agentic RAG 不能只讲“原理”，还必须讲工程代价。真实系统里，Self-RAG、CRAG、Adaptive-RAG、MemoRAG 的核心 trade-off 都落在四件事上：**延时、token、工具调用、可观测性**。'
      },
      {
        type: 'list',
        title: '最关键的工程约束',
        items: [
          '**步数上限**：通常 3-8 步，防止无穷补检索',
          '**预算控制**：token / latency / tool-call count 都要有限额',
          '**结构化工具返回**：否则 Observe 很难可靠执行',
          '**router 先行**：不要所有 query 默认走重工作流'
        ]
      },
      {
        type: 'code',
        lang: 'json',
        title: '推荐的工具返回格式',
        value: `{
  "ok": true,
  "data": {
    "chunks": [
      { "text": "...", "score": 0.92, "source": "policy_v3.pdf" }
    ]
  },
  "error": null,
  "meta": {
    "tool": "vector_search",
    "latency_ms": 120,
    "retries": 0
  }
}`
      },
      {
        type: 'warning',
        value: '工作流引擎（如 LangGraph）只是基础设施。真正决定系统质量的，是路由规则、退出条件、预算约束、失败降级和 trace 质量。'
      },
      {
        type: 'table',
        title: '工程上最该管住的 4 件事',
        columns: ['维度', '建议', '为什么'],
        rows: [
          ['步数', '3-8 步封顶', '防止 agent 无意义循环'],
          ['工具调用', '每类工具设上限', '避免 web search / DB query 失控'],
          ['token 预算', '每请求 hard cap', '防止复杂 case 成本爆炸'],
          ['降级策略', '失败后退回普通 RAG', '保证系统稳定而不是一直重试'],
        ],
      },
      {
        type: 'code',
        lang: 'python',
        title: 'Agentic 预算控制伪代码',
        value: `budget = {"steps": 5, "tool_calls": 3, "tokens": 12000}

while budget["steps"] > 0:
    action = planner(state)
    if action == "stop":
        break

    if action.startswith("tool:"):
        if budget["tool_calls"] <= 0:
            return fallback_to_standard_rag(query)
        result = call_tool(action, state)
        budget["tool_calls"] -= 1
        budget["tokens"] -= result.get("tokens", 0)

    budget["steps"] -= 1
    if budget["tokens"] <= 0:
        return fallback_to_standard_rag(query)`
      }
    ]
  },
  {
    id: 'evaluation',
    icon: '📊',
    title: '评估与可观测',
    content: [
      {
        type: 'text',
        value: 'Agentic RAG 的评估不能只看最终答案，因为“蒙对”并不代表系统可靠。真正需要评的是**轨迹、路由、工具选择、步数效率**。'
      },
      {
        type: 'list',
        title: 'Agentic RAG 应该多看哪些指标',
        items: [
          '**trajectory correctness**：每一步 action 是否合理，是否存在多余步骤或漏步骤',
          '**tool selection accuracy**：该用 rerank / search / SQL / calculator 时有没有选错',
          '**routing quality**：简单 query 有没有被错误送进重工作流，复杂 query 有没有被错误简化',
          '**answer + cost joint evaluation**：质量提升值不值得额外 token / latency'
        ]
      },
      {
        type: 'highlight',
        value: '最新趋势是专门为 Agentic / Adaptive RAG 设计 benchmark，例如 **AgenticRAGTracer**（多跳轨迹诊断）和 **RAGRouter-Bench**（动态路由评测）。这意味着评估对象已经从“答案文本”转向“控制过程”。'
      },
      {
        type: 'list',
        title: '为什么 tracing 是必选项',
        items: [
          '**你需要知道是哪一步错了**：检索错、路由错、工具错，还是 Observe 没发现证据不足',
          '**需要按 trace/span 看输入输出**：否则无法回放和做失败分析',
          '**没有 tracing，就没有 Agentic RAG 的迭代能力**'
        ]
      },
      {
        type: 'compare',
        title: 'Agentic RAG 评估和普通 RAG 的区别',
        items: [
          {
            name: '普通 RAG',
            desc: '更强调最终 answer quality，例如 faithfulness、answer relevancy、citation correctness。'
          },
          {
            name: 'Agentic RAG',
            desc: '除了最终答案，还必须评 route 是否正确、工具是否选对、轨迹是否冗余、预算是否合理。'
          }
        ]
      },
      {
        type: 'code',
        lang: 'json',
        title: '建议记录的 Agent Trace 结构',
        value: `{
  "query": "对比研发部和市场部的加班补贴政策",
  "route": "agentic_compare",
  "steps": [
    {"action": "retrieve", "tool": "vector_search", "latency_ms": 121},
    {"action": "retrieve", "tool": "vector_search", "latency_ms": 118},
    {"action": "synthesize", "latency_ms": 860}
  ],
  "final_metrics": {
    "tool_calls": 2,
    "total_tokens": 2180,
    "trajectory_correct": true
  }
}`
      }
    ]
  }
];

export const agenticTimelineDemo = {
  query: '对比研发部和市场部的加班补贴政策',
  steps: [
    {
      id: 1,
      phase: 'Plan',
      phaseColor: '#6366f1',
      title: '分析 & 拆解查询',
      description: '识别到"对比"类问题，需要分别检索两个部门的政策，再做对比分析',
      detail: '将原始查询拆解为 2 个子查询：\n① 检索研发部加班补贴政策\n② 检索市场部加班补贴政策\n最后合并对比',
      evidence: '子查询规划完成',
      tokens: 280,
      time: '0.8s',
      status: 'complete'
    },
    {
      id: 2,
      phase: 'Act',
      phaseColor: '#10b981',
      title: '检索研发部加班补贴政策',
      description: '调用 vector_search 工具，查询 "研发部 加班补贴 政策标准"',
      detail: 'tool: vector_search\nquery: "研发部加班补贴政策标准"\ntop_k: 5\n\n返回 3 条相关 chunks:\n1. 《研发中心薪酬管理办法》第 12 条 (score: 0.94)\n2. 《加班管理制度 v3》第 5.2 节 (score: 0.89)\n3. 《2024年薪酬调整通知》(score: 0.72)',
      evidence: '研发部加班补贴：工作日 1.5x，周末 2x，法定假日 3x，月上限 40 小时',
      tokens: 520,
      time: '1.2s',
      status: 'complete'
    },
    {
      id: 3,
      phase: 'Act',
      phaseColor: '#10b981',
      title: '检索市场部加班补贴政策',
      description: '调用 vector_search 工具，查询 "市场部 加班补贴 政策标准"',
      detail: 'tool: vector_search\nquery: "市场部加班补贴政策标准"\ntop_k: 5\n\n返回 2 条相关 chunks:\n1. 《市场营销部管理规定》第 8 条 (score: 0.91)\n2. 《加班管理制度 v3》第 5.3 节 (score: 0.87)',
      evidence: '市场部加班补贴：工作日 1.5x，周末 2x，法定假日 3x，月上限 60 小时，外出拜访另计差旅补贴',
      tokens: 480,
      time: '1.1s',
      status: 'complete'
    },
    {
      id: 4,
      phase: 'Observe',
      phaseColor: '#f59e0b',
      title: '对比分析 & 生成答案',
      description: '两个部门的政策都已检索到，进行结构化对比并生成最终答案',
      detail: '对比发现：\n• 倍率相同（1.5x/2x/3x）\n• 月上限不同（研发 40h vs 市场 60h）\n• 市场部有额外差旅补贴\n• 研发部有技术攻关特批通道\n\n信息充分，生成最终对比表格。',
      evidence: '核心差异：月上限（研发 40h < 市场 60h）、市场部有差旅补贴、研发部有特批通道',
      tokens: 650,
      time: '1.5s',
      status: 'complete'
    }
  ],
  totalTokens: 1930,
  totalTime: '4.6s',
  stepsCount: 4
};

export const agenticWarmupQuestions = [
  {
    question: '你们当前系统里，是否会根据中间结果决定“补检索 / 改检索 / 换工具 / 停止回答”？',
    hook: '这道题用来区分“固定流水线”与“带控制闭环的 Agentic RAG”'
  },
  {
    question: '如果一个系统只是把 query 拆成 3 个子问题并行检索，它一定算 Agentic RAG 吗？',
    hook: '关键不是“有多步”，而是“下一步是否由中间状态动态决定”'
  }
];

export const agenticQuestions = [
  {
    question: 'Self-RAG、CRAG、Adaptive-RAG 三者的核心区别是什么？它们分别把“控制权”放在哪一层？',
    hint: '想想自反思、纠错、路由三种控制对象',
    answer: 'Self-RAG 把控制权放在“生成过程是否需要检索、如何 critique 输出”这一层；CRAG 把控制权放在“检索结果是否可靠、是否需要纠错或补救”这一层；Adaptive-RAG 把控制权放在“不同复杂度 query 该走哪条路径”这一层。三者都属于 Agentic 范畴，但控制对象不同。'
  },
  {
    question: 'Agentic RAG 和 Query Decomposition + 多次检索有什么本质区别？什么时候后者就够了？',
    hint: '想想"自主决策"和"预设流程"的区别',
    answer: 'Query Decomposition 是预设的静态拆分——把查询拆成子查询然后并行检索，流程是固定的。Agentic RAG 的区别在于：1) Agent 根据每步结果动态决定下一步做什么（可能追问、换工具、放弃某条线索）；2) 有条件分支能力（如果检索结果不满意可以换策略）；3) 可以调用非检索类工具。如果你的问题拆分逻辑是确定的（如"对比 A 和 B"→总是拆成查 A + 查 B），Query Decomposition 就够了，而且更快更便宜。'
  },
  {
    question: '为什么说"没有 tracing 就没法迭代 Agentic RAG"？普通 RAG 的评估方法为什么不够用了？',
    hint: '想想多步决策中"错误传播"的问题',
    answer: '普通 RAG 评估看最终答案就行——答案对就是对。但 Agentic RAG 的多步循环中，一个正确的最终答案可能建立在错误的中间步骤上（比如选错了工具但碰巧拿到了对的结果），这样的系统在其他输入下就会崩。Tracing 让你看到每一步的 decision/action/result，才能定位问题。常见发现：Agent 在第 2 步选错了工具（用 BM25 该用向量检索），但第 3 步的 Observe 没有意识到信息不够就直接输出了。没有 trace 你只会看到"答案差"，不知道是哪步出的问题。'
  },
  {
    question: '如何设计一个合理的 Agent 失败降级策略？直接返回"我不知道"是好做法吗？',
    hint: '想想用户体验和信息完整性之间的平衡',
    answer: '直接返回"我不知道"是最差的策略。推荐三级降级：1) 降级到普通 RAG——把原始查询做一次普通检索+生成，给出"尽力而为"的答案，标注"以下回答可能不完整"；2) 返回部分结果——Agent 在中间步骤已经获得了一些有用信息，把这些信息组织好返回，告知用户"我找到了 A 部分的信息，B 部分还在处理中"；3) 引导人工——给出已收集的证据和缺失的信息点，建议用户联系特定部门或人员。关键是不要让用户感觉"白等了"。'
  },
  {
    question: '你在工具调用中强制 JSON Schema 校验会不会导致 LLM 因为格式错误而频繁失败？如何平衡严格性和容错性？',
    hint: '想想"校验层"和"修复层"的分离',
    answer: '会的，特别是开源模型的 function calling 能力不稳定时。解决方案：1) 校验失败不直接报错，先做一轮"自动修复"（如补全缺失字段、类型转换），修复后再校验；2) 给 LLM 的 tool schema 尽量简单，减少必填字段，用默认值兜底；3) 保留 2 次 retry 机会，第二次把校验错误信息喂给 LLM 让它修正；4) 记录所有校验失败的 case，定期分析是 schema 设计问题还是模型能力问题。经验数据：好的 schema 设计 + 1 次 retry，成功率能到 98% 以上（GPT-4o/Claude 3.5 级别模型）。'
  }
];

export const queryRewriteSections = [
  {
    id: 'why-rewrite',
    icon: '✍️',
    title: '为什么用户问的 ≠ 该搜的',
    content: [
      'Query 改写的本质不是“把用户问题润色得更好看”，而是把**用户表达**转换成**检索系统更容易处理的形式**。用户问的，往往并不是最适合直接检索的。',
      '在真实 RAG 系统里，failure mode 往往来自四类问题：**结果太重复**、**query 里藏着 metadata 约束**、**一个 query 同时包含多个子意图**、以及**query 太短太模糊**。这四类问题，恰好对应 MMR、Self-Query、Multi-Query、HyDE 这几类经典技巧。',
      '所以这里更好的视角不是“有哪些 query rewrite 技术”，而是：**遇到什么失败模式，应该优先用哪种技巧补救**。'
    ],
    concepts: [
      { term: 'Rewrite', desc: '把原始 query 改写成更适合检索的表达，例如补全术语、换一种措辞、拆解复杂问题。' },
      { term: 'Route', desc: '不是所有 query 都要改写。很多时候更重要的是先判断它该走哪条链路，例如 FAQ、Self-Query、HyDE 或直接检索。' },
      { term: 'Failure Mode First', desc: '最有效的方法不是记技术名词，而是先识别失败模式：**重复、缺 filter、多意图、过短过模糊**。' },
    ],
    keyPoints: [
      'Query 改写的目标是提升检索，不是美化用户问题',
      '同一个 query 问题，不一定该用同一种技巧解决',
      '先判断 failure mode，再选 MMR / Self-Query / Multi-Query / HyDE',
      'Query Processing 最终应该是一条可路由、可回退、可观测的 pipeline',
    ],
    engineeringPractice: [
      '先分析真实 query 日志，把失败样本按“重复结果 / 缺 metadata / 多子意图 / 模糊短问”分桶。',
      '不要默认所有 query 都做改写；简单 query 直接检索常常更快也更稳。',
      '把每种技巧的触发条件写成明确规则或分类器，而不是依赖人工感觉。'
    ],
    codeExamples: [
      {
        title: '按 failure mode 选择 query processing 技巧',
        description: '先分类，再决定是否需要 MMR / Self-Query / Multi-Query / HyDE。',
        code: `def route_query_strategy(query: str, signals: dict) -> str:
    if signals["has_hidden_metadata"]:
        return "self_query"
    if signals["has_multiple_intents"]:
        return "multi_query"
    if signals["is_short_or_vague"]:
        return "hyde"
    if signals["retrieval_results_are_redundant"]:
        return "mmr"
    return "direct_retrieval"`,
      },
    ],
    extensions: [
      {
        question: '为什么“所有 query 都走 Multi-Query / HyDE”通常不是好主意？',
        approach: '因为这些技巧都有成本和副作用。Multi-Query 会增加调用和融合复杂度，HyDE 会增加一次 LLM 生成并可能跑偏。只有在对应 failure mode 出现时，它们才真正有价值。'
      },
      {
        question: 'Query rewrite 和 retrieval optimization 的边界在哪里？',
        approach: '边界并不绝对。像 Self-Query、MMR 更像“检索策略增强”，HyDE、Multi-Query 更像“query processing”。实际工程里通常把它们统一放进 query processing pipeline 来看。'
      }
    ],
  },
  {
    id: 'mmr',
    icon: '🎯',
    title: 'MMR：结果太重复时',
    content: [
      'MMR（Maximal Marginal Relevance）不是传统意义上的“query 改写”，但在 failure-mode 视角下，它解决的是一个非常典型的问题：**相似度检索会把很多彼此相似的 chunk 一起拿回来**。',
      '在 deck 里的例子里，用户问 “Tell me about the party that night.”，纯 similarity retrieval 会把大量“看起来都像派对”的片段塞满 context window，导致真正有区别的信息进不来。这类问题的本质不是 query 表达错了，而是**结果缺少多样性**。',
      '这时候最适合的技巧不是继续改 query，而是用 MMR 在相关性和差异性之间做平衡：先多取一些候选（`fetch_k`），再从中挑出既相关、又不彼此重复的 top-k。'
    ],
    concepts: [
      { term: 'Redundancy', desc: '最常见的 failure mode 之一：top-k 结果都高度相似，浪费上下文窗口。' },
      { term: 'MMR', desc: '每次选一个结果时，同时考虑“和 query 有多相关”以及“和已选结果有多不相似”。' },
      { term: 'fetch_k vs k', desc: 'MMR 通常先取更大的候选集 `fetch_k`，再从里面选出最终进入上下文的 `k` 条。' },
    ],
    illustrations: [
      {
        title: 'Failure mode：相似检索把上下文塞满重复片段',
        description: '这页图展示了纯 similarity retrieval 的典型问题：window limit 固定时，top-k 很容易被风格相近、内容重复的片段占满。',
        src: '/query-rewrite-mmr-failure.png',
      },
      {
        title: 'MMR：在相关性之外，显式引入多样性',
        description: 'MMR 的思路不是“换个问法”，而是对候选结果做二次选择：保留相关内容，同时避免 top-k 彼此过于相似。',
        src: '/query-rewrite-mmr-solution.png',
      },
    ],
    keyPoints: [
      'failure mode：top-k 结果太像，浪费上下文窗口',
      'MMR 解决的是“重复结果”，不是“用户问错了”',
      '工程上常见配置是 `fetch_k > k`，先放大候选池，再做多样性选择',
      'MMR 特别适合长文、多段落、故事型或高度重复语料',
    ],
    engineeringPractice: [
      '当你发现 top-k 经常来自同一文档的相邻段落，优先考虑 MMR。',
      'MMR 不是越强越好，多样性不能压过相关性；通常 `lambda=0.5~0.7` 是比较稳的起点。',
      '对高冗余语料，先做 MMR 往往比继续加大 top-k 更有效。'
    ],
    codeExamples: [
      {
        title: 'MMR 检索示例',
        description: '先拿到更大的候选池，再从中挑出相关但不重复的 top-k。',
        code: `retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={
        "k": 3,
        "fetch_k": 8,
        "lambda_mult": 0.6,
    },
)

docs = retriever.invoke("Tell me about the party that night.")`,
      },
    ],
    extensions: [
      {
        question: '什么时候不该优先用 MMR？',
        approach: '如果问题本身就是极窄的精确查找，例如错误码、条款号、某个固定实体的唯一答案，过度强调多样性反而会把不必要的结果带进来。'
      },
      {
        question: '为什么 MMR 明明不改 query，也适合放进 query processing pipeline？',
        approach: '因为从系统行为上看，它是在响应某类 query failure mode。用户没变，输入没变，但为了修复“重复结果”这个失败模式，我们改变了 query 的处理方式。'
      }
    ],
  },
  {
    id: 'self-query',
    icon: '🧭',
    title: 'Self-Query：query 里藏着 filter 时',
    content: [
      'Self-Query Retrieval 的典型场景是：**用户的问题里其实包含了结构化约束，但系统如果不把它提出来，就会用纯语义检索把无关文档一起召回**。',
      'deck 里的例子是：“What talk about machine learning in the first lecture?” 如果系统只看语义相似度，它可能召回所有提到 machine learning 的 lecture；但真正关键的约束是 **first lecture**，这应该被转成 metadata filter，例如 `source == lecture_1`。',
      '所以 Self-Query 的核心不是重写成一句更好听的话，而是：**把自然语言里的约束翻译成结构化 filter**，再和检索 query 一起送给向量库。'
    ],
    concepts: [
      { term: 'Structured Filter', desc: '时间、来源、部门、文档类型、版本等约束，应该从 query 里抽出来，而不是只留在自然语言里。' },
      { term: 'Hidden Metadata', desc: '用户经常不会显式说“请加 filter”，但会在句子里隐含这些约束。' },
      { term: 'Semantic + Filter', desc: 'Self-Query 的价值在于把“语义检索”和“结构化约束”组合起来，而不是只靠其中一路。' },
    ],
    illustrations: [
      {
        title: 'Self-Query Retrieval：把自然语言约束翻译成 filter',
        description: '这页图最适合讲 Self-Query 的核心：不是只检索 “machine learning”，而是同时抽出 `source eq lecture_1` 这样的结构化条件。',
        src: '/query-rewrite-self-query.png',
      },
    ],
    keyPoints: [
      'failure mode：query 里有隐藏约束，但系统没提出来',
      '最常见的约束类型：时间、来源、部门、文档类型、版本、地域',
      'Self-Query 的目标不是替换原 query，而是补上一层 metadata filter',
      '这类技巧对企业知识库尤其重要，因为企业文档天然 metadata 丰富',
    ],
    engineeringPractice: [
      '只要你的知识库有稳定 metadata，就应该优先考虑 Self-Query。',
      '把 filter 抽取结果记录到日志里，方便排查“为什么召回错文档”。',
      'filter 要区分 hard constraint 和 soft preference，避免过度限制导致召回过窄。'
    ],
    codeExamples: [
      {
        title: 'Self-Query Retrieval 示例',
        description: '从自然语言问题中同时生成 query 和 filter，再一起检索。',
        code: `from langchain.retrievers.self_query.base import SelfQueryRetriever

retriever = SelfQueryRetriever.from_llm(
    llm=llm,
    vectorstore=vectorstore,
    document_contents="lecture transcript",
    metadata_field_info=[
        AttributeInfo(name="source", description="lecture source", type="string"),
    ],
)

docs = retriever.invoke(
    "What talk about machine learning in the first lecture?"
)`,
      },
    ],
    extensions: [
      {
        question: '什么时候 Self-Query 会失败？',
        approach: '最常见的失败方式是 metadata schema 本身不稳定，或者用户说的约束无法和现有 metadata 对齐。比如用户说“上次那场分享”，但你的索引里根本没有“上次”可映射的字段。'
      },
      {
        question: '为什么不能把所有时间/来源约束都留给 reranker 再判断？',
        approach: '因为那样做得太晚了。候选池如果一开始就被错误范围的文档污染，后续 rerank 再强也只能在错误候选里做更精细排序。'
      }
    ],
  },
  {
    id: 'multi-query',
    icon: '🔀',
    title: 'Multi-Query：一个问题里有多个子意图时',
    content: [
      'Multi-Query 适合解决的 failure mode 是：**同一个 query 里同时包含多个维度或多个子意图，单一路查询很难兼顾全部方面**。',
      'deck 里的例子是：“What about the technical and application of machine learning?” 这个问题同时包含 `technical` 和 `application` 两个方面。直接相似检索时，系统很可能只命中其中一个角度；而 Multi-Query 会把它拆成多个语义等价但关注点不同的 query，再分别检索。',
      '因此，Multi-Query 不是把一个复合问题拆成严谨步骤式子任务，而是**为同一意图生成多个检索视角**。最后再用 RRF 等方法把多个查询的结果融合起来。'
    ],
    concepts: [
      { term: 'Coverage Expansion', desc: '同一个 query 可能只有一种表述，但相关文档在语料里可能分散在不同表达方式下。Multi-Query 用多个变体扩大覆盖面。' },
      { term: 'Sub-intent Coverage', desc: '当 query 同时包含多个方面时，多路检索往往比单路更容易兼顾完整答案。' },
      { term: 'RRF Merge', desc: '多查询结果常常要通过 RRF 合并，既去重，又让多路都排前的结果获得更高权重。' },
    ],
    illustrations: [
      {
        title: 'Multi-Query：为同一意图生成多个检索视角',
        description: '这页图很适合讲 Multi-Query 的 failure mode：原 query 同时问 `technical` 和 `application`，单一路检索很容易只覆盖一个面向。',
        src: '/query-rewrite-multi-query.png',
      },
    ],
    keyPoints: [
      'failure mode：一个 query 同时包含多个方面，单路表达覆盖不全',
      'Multi-Query 生成的是多个视角，不是严格的步骤式 decomposition',
      '多路结果通常要做去重和融合，RRF 是默认首选',
      '特别适合表述多样、同义词多、答案分散在不同文档里的场景',
    ],
    engineeringPractice: [
      '变体数量通常控制在 3-4 个，太多会增加成本且容易引入跑偏 query。',
      '始终保留原始 query，不要只依赖生成变体。',
      '如果多个变体的结果重叠率极低，要警惕生成方向已经跑偏。'
    ],
    codeExamples: [
      {
        title: 'Multi-Query + RRF 示例',
        description: '先生成多个视角的 query，再分别检索，最后用 RRF 融合结果。',
        code: `def generate_multi_queries(query: str) -> list[str]:
    prompt = f"""为以下查询生成 3 个不同角度的等价查询：
{query}"""
    variants = llm.invoke(prompt).content.strip().split("\\n")
    return [query] + [v.strip() for v in variants if v.strip()]

queries = generate_multi_queries(
    "What about the technical and application of machine learning?"
)
result_lists = [retriever.invoke(q) for q in queries]
final_docs = reciprocal_rank_fusion(result_lists, k=60)`,
      },
    ],
    extensions: [
      {
        question: 'Multi-Query 和 Decomposition 最容易混淆的地方是什么？',
        approach: '两者都看起来像“一变多”，但目标不同。Decomposition 是把复合问题拆成可独立完成的子任务；Multi-Query 是围绕同一意图扩展多个检索表述。'
      },
      {
        question: '什么时候 Multi-Query 会适得其反？',
        approach: '当原问题已经非常精确，或者生成的变体太发散时，Multi-Query 反而会把噪声带进候选池。此时更好的策略通常是 Self-Query 或直接检索。'
      }
    ],
  },
  {
    id: 'hyde',
    icon: '💡',
    title: 'HyDE：query 太短太模糊时',
    content: [
      'HyDE（Hypothetical Document Embeddings）最适合的 failure mode 是：**query 太短、太抽象、信息量太低，直接 embedding 后很难和真实文档落在同一语义区域**。',
      '它的做法是先让 LLM 根据 query 写一段“假想答案”或“假想文档”，再对这段更像文档的话做 embedding 检索。这样做的核心直觉是：真实语料库里的对象通常是文档风格文本，而不是用户那种很短的自然语言问句。',
      '从 deck 的内容看，HyDE 之所以能容忍少量幻觉，是因为它真正被拿去做的是 **embedding 表示**，不是直接把这段假想答案当最终回答。即使细节上有一点漂移，只要整体语义方向对了，检索仍可能变好。'
    ],
    concepts: [
      { term: 'Hypothetical Document', desc: '先生成一个“像答案的文档”，再拿它去检索，而不是直接用短 query。' },
      { term: 'Query-Document Gap', desc: '用户问题往往很短，但知识库里的对象是长文档。HyDE 解决的是这两种文本形态不匹配的问题。' },
      { term: 'Semantic Robustness', desc: 'HyDE 看重的是整体语义方向，而不是每个细节都完全真实。' },
    ],
    illustrations: [
      {
        title: 'HyDE 的动机',
        description: 'deck 里 HyDE 的出发点很明确：query 本身太短时，先生成一个更像文档的中间表示，再做检索，往往比直接拿短 query 去 embedding 更有效。',
        src: '/query-rewrite-hyde.png',
      },
    ],
    keyPoints: [
      'failure mode：query 过短、过模糊、信息量不足',
      'HyDE 不是直接回答用户，而是先生成一个“更像文档”的检索代理',
      '它适合探索性查询，不适合特别精确的编号/条款类查询',
      '生产里通常会把原始 query 结果和 HyDE 结果一起融合，避免单路跑偏',
    ],
    engineeringPractice: [
      'HyDE 最好作为可选策略，而不是默认对所有 query 开启。',
      '推荐同时保留原始 query 检索，并和 HyDE 结果做融合或兜底。',
      '如果 query 本身已经很精确，HyDE 往往只会增加延迟和噪声。'
    ],
    codeExamples: [
      {
        title: 'HyDE 检索示例',
        description: '先生成假设性答案，再用这段“更像文档”的文本去检索。',
        code: `HYDE_PROMPT = """请针对以下问题，撰写一段可能的答案（约 200 字）。
不要求完全真实，但要尽量贴近相关文档的风格。

问题: {query}
"""

def hyde_retrieval(query: str, retriever, top_k=5):
    hypothetical_doc = llm.invoke(
        HYDE_PROMPT.format(query=query)
    ).content

    hyde_results = retriever.search(hypothetical_doc, top_k=top_k)
    orig_results = retriever.search(query, top_k=top_k)
    return reciprocal_rank_fusion([hyde_results, orig_results])`,
      },
    ],
    extensions: [
      {
        question: 'HyDE 为什么不会因为“生成里有一点幻觉”就立刻失效？',
        approach: '因为被拿去检索的是 embedding 表示，而 embedding 更关心整体语义方向是否接近，而不是每个具体细节都字字属实。'
      },
      {
        question: '什么时候应该主动禁用 HyDE？',
        approach: '当 query 已经是精确术语、编号、条款号、版本号或明确 filter 条件时，HyDE 通常不会带来好处，反而可能把语义方向拉偏。'
      }
    ],
  },
  {
    id: 'router-guardrails',
    icon: '🛡️',
    title: 'Router、护栏与验收',
    content: [
      '当你手里已经有 MMR、Self-Query、Multi-Query、HyDE 这些技巧后，真正的工程问题就变成：**谁该在什么情况下触发**。这就是 Query Router 的职责。',
      'Query Router 的目标不是分类得多精细，而是尽快判断这个 query 最可能的 failure mode 是什么，从而把它送到合适的处理路径。简单 query 直接检索，隐藏 filter 走 Self-Query，多意图走 Multi-Query，模糊短问走 HyDE，结果冗余时再叠加 MMR。',
      '与此同时，query processing 也必须有护栏。改写和扩展如果导致意图漂移、实体丢失、时间约束消失，检索质量可能会比不改还差。'
    ],
    concepts: [
      { term: 'Router', desc: '根据 query 的 failure mode 选择处理策略，而不是让所有 query 走一条统一流水线。' },
      { term: 'Guardrails', desc: '检查改写后是否仍然保留原始意图、实体和关键约束，防止“改写把问题改坏了”。' },
      { term: 'A/B Validation', desc: '任何 query processing 技巧都应该和 baseline 对照评估，而不是只看少量 demo case。' },
    ],
    keyPoints: [
      'Router 决定“什么 query 用什么技巧”',
      '护栏决定“改写后有没有把原始意图搞丢”',
      'Query processing 必须可回退、可观测、可对照评估',
      '最佳实践通常是多策略组合，而不是单一银弹',
    ],
    engineeringPractice: [
      '给每条 query 记录：原始 query、触发策略、生成变体、最终 filter、最终候选池质量。',
      '先做小而稳的 router 规则，再逐步引入 LLM 分类，不要一上来就全交给模型判断。',
      '每种策略都保留 fallback：例如 Multi-Query 失败可回退原始 query，HyDE 失败可与原始检索做融合。'
    ],
    codeExamples: [
      {
        title: 'Query Router 示例',
        description: '按 failure mode 选择最合适的 query processing 技巧。',
        code: `def route_query(query: str, signals: dict) -> dict:
    if signals["has_hidden_metadata"]:
        return {"strategy": "self_query"}
    if signals["has_multiple_intents"]:
        return {"strategy": "multi_query"}
    if signals["is_short_or_vague"]:
        return {"strategy": "hyde"}
    return {"strategy": "direct_retrieval", "post_process": "mmr"}`,
      },
      {
        title: '改写质量校验',
        description: '检查改写后是否保持原始意图，避免 strategy 本身把 query 带偏。',
        code: `def validate_rewrite(original: str, rewritten: list[str], embedder) -> bool:
    orig_emb = embedder.encode(original)
    for rq in rewritten:
        sim = cosine_sim(orig_emb, embedder.encode(rq))
        if sim < 0.65:
            return False
    return True`,
      },
    ],
    extensions: [
      {
        question: '为什么 query processing pipeline 必须支持回退？',
        approach: '因为任何增强策略都有适用边界。没有回退，一旦某条策略在某类 query 上系统性失效，就会直接拖垮线上体验。'
      },
      {
        question: '最值得先做的评估是什么？',
        approach: '最值得先做的是 failure mode 分桶评估：按“重复、缺 filter、多意图、模糊短问”分别统计有无策略时的 Recall@k 和 answer quality，看看每种技巧到底帮到了哪一类问题。'
      }
    ],
  }
];

export const queryRewriteWarmupQuestions = [
  {
    question: '找一个你们业务中的真实 query（用户实际提过的问题），分析它有哪些"不适合直接检索"的特征（省略、歧义、复合、指代等），并设计你会怎么改写它。',
    hook: '每个企业场景都有独特的 query 模式——通用方法论必须结合你的真实数据才有意义。'
  },
  {
    question: '假设你对一个 query 做了 decomposition，拆成了 3 个子查询分别检索。最终要把 3 组检索结果合并后喂给 LLM，你会怎么处理重复和冲突？',
    hook: '这里涉及 RRF、去重、token 预算分配、冲突证据标注——上一节"上下文组装"的知识会被复用。'
  }
];

export const queryRewriteQuestions = [
  {
    question: 'HyDE 在什么情况下可能比直接用 query 检索效果更差？如何设计一个自动化机制来检测并规避这种情况？',
    hint: '想想 LLM 生成的假设答案可能跑偏到什么方向。',
    answer: 'HyDE 可能更差的情况：① 精确查询（"条款4.2的内容"），LLM 生成的假设答案可能添加错误细节，导致 embedding 偏离真实文档；② 专业领域术语密集的 query，LLM 不熟悉领域知识会生成错误术语；③ 带时间/版本约束的 query，假设答案可能混入过时信息。自动检测：比较 HyDE 检索结果和原始 query 检索结果的 overlap——如果 overlap 极低（如 < 20%），说明 HyDE 可能跑偏。可以设计 fallback：同时用原始 query 和 HyDE 检索，用 RRF 融合，这样即使 HyDE 跑偏也有原始结果兜底。'
  },
  {
    question: 'Query Decomposition 时，如何确保子查询之间的"全局约束继承"不会导致检索效率下降？',
    hint: '每个子查询都带全部 filter，可能导致某些 filter 矛盾或过度限制。',
    answer: '全局约束继承的问题：如果原始 query 有 3 个约束（时间+部门+主题），每个子查询都继承全部约束，某些约束可能跟子查询不相关（如"对比A和B"拆出的两个子查询分别关注 A 和 B，但都被限制在同一时间范围，而 B 的信息可能在不同时间发布）。解决方案：① 让 LLM 在 decomposition 时为每个子查询标注"适用的 filter"（而非全部继承）；② 设置 filter 的 soft/hard 模式——hard filter 必须满足，soft filter 作为加分项；③ 当带 filter 检索结果过少（< 3 条）时，自动放宽 filter 重试。这平衡了约束精确性和召回率。'
  },
  {
    question: 'Multi-Query 生成的多个变体如果质量参差不齐（某个变体跑偏），对最终 RRF 融合结果有多大影响？如何降低这种风险？',
    hint: '想想 RRF 的数学特性——一个跑偏的查询会怎么影响融合排名？',
    answer: 'RRF 的鲁棒性分析：RRF 公式为 score(d) = Σ 1/(k+rank_i)，一个跑偏的查询最多给无关文档贡献 1/(k+1) 的分数（k 通常为 60，即 ≈0.016）。如果其他 3 个查询都把正确文档排在前列，正确文档的 RRF 分数远超噪声文档。所以 RRF 对单个跑偏查询天然鲁棒。但如果多个变体同时跑偏（方向一致），噪声文档可能累积高分。降低风险：① 限制变体数量（3-4 个）；② 用 embedding 相似度验证变体与原始 query 的语义一致性，过滤掉偏差过大的变体；③ 给原始 query 的检索结果更高权重（如 RRF 权重 ×2）。'
  },
  {
    question: '设计一个完整的 Query Processing Pipeline，说明对于不同类型的 query，分别走什么路径（Router → 改写 → 检索），并分析每条路径的延迟预算。',
    hint: '考虑 FAQ、简单检索、复杂检索、Agent 四条路径。',
    answer: 'Pipeline 设计：① Router（<100ms，GPT-4o-mini 或分类模型）判断 query 类型 → ② FAQ 路径：embedding 匹配 FAQ 库，命中则直接返回（总延迟 <200ms）→ ③ 简单 RAG 路径：原始 query 直接检索 + rerank + LLM 生成（总延迟 ~2s）→ ④ 复杂 RAG 路径：Decomposition/Multi-Query 改写（300ms）→ 多路检索并行（500ms）→ RRF 融合 + rerank（300ms）→ LLM 生成（1s）（总延迟 ~3s）→ ⑤ Agent 路径：根据意图调用 tool chain，可能多步循环（总延迟 5-30s）。延迟预算分配原则：改写环节不应超过总延迟的 20%；检索环节可并行化缩短延迟；rerank 是固定成本约 200-500ms。对于 P95 延迟目标 3s 的系统，复杂查询需要积极做并行化和缓存。'
  }
];

export const queryDecomposeDemo = {
  originalQuery: '去年Q3财务部发布的差旅报销新规定中，海外出差的住宿标准是多少？',
  analysis: {
    timeConstraint: {
      raw: '去年Q3',
      parsed: '2025年7月-9月',
      filterValue: '2025-Q3',
      color: '#f59e0b'
    },
    deptConstraint: {
      raw: '财务部',
      parsed: '财务部（发布部门）',
      filterValue: '财务部',
      color: '#06b6d4'
    },
    topicConstraint: {
      raw: '差旅报销新规定',
      parsed: '差旅报销管理制度（最新版）',
      filterValue: '差旅报销',
      color: '#8b5cf6'
    },
    specificQuestion: {
      raw: '海外出差的住宿标准是多少',
      parsed: '海外差旅住宿费用上限金额',
      filterValue: null,
      color: '#10b981'
    }
  },
  subQueries: [
    {
      id: 1,
      query: '2025年Q3 财务部发布 差旅报销管理制度 最新版本',
      intent: '定位目标文档',
      filters: { date: '2025-Q3', department: '财务部' },
      results: [
        { doc: '差旅管理制度_v3.pdf（2025年8月发布）', score: 0.94, relevant: true },
        { doc: '差旅管理制度_v2.pdf（2024年3月发布）', score: 0.71, relevant: false },
        { doc: '财务部2025年Q3政策汇总.pdf', score: 0.68, relevant: true },
      ]
    },
    {
      id: 2,
      query: '海外出差 住宿标准 报销上限 金额',
      intent: '提取具体信息',
      filters: { scope: '海外', topic: '住宿标准' },
      results: [
        { doc: '差旅管理制度_v3.pdf — §4.2 海外住宿标准', score: 0.96, relevant: true },
        { doc: '差旅管理制度_v3.pdf — §4.1 国内住宿标准', score: 0.78, relevant: false },
        { doc: 'HR政策FAQ — 海外出差住宿相关', score: 0.72, relevant: true },
      ]
    }
  ],
  finalAnswer: '根据差旅管理制度 v3（2025年8月财务部发布），海外出差住宿标准为：一线城市（纽约、伦敦、东京）每晚不超过 2000 元，其他城市每晚不超过 1500 元。[来源1: 差旅管理制度_v3.pdf §4.2]'
};

export const rerankSections = [
  {
    id: 'why-rerank',
    icon: '🎯',
    title: '为什么需要 Reranker',
    content: [
      'RAG 检索本质上是两阶段问题：**召回** 负责从大规模语料里快速拉出候选，**重排序** 负责在这批候选里挑出真正最相关的证据。第一阶段追求 recall，第二阶段追求 precision，所以它们天然不是同一个优化目标。',
      '很多团队在向量检索上已经做了不少工作，但最后 LLM 还是会拿到“看起来有点像、实际上不够准”的 chunk。Reranker 的价值就是把这层模糊性压下去，让送给模型的上下文更干净、更贴题。',
      '从工程角度看，rerank 不只是“再排一次序”，而是**把 query-doc 交互显式建模**。这也是为什么它通常能显著提升引用准确率、减少旧版文档混入、降低噪声 chunk 对生成的干扰。'
    ],
    concepts: [
      { term: 'Retrieval vs Reranking', desc: '向量检索擅长做**大规模粗召回**，重排序擅长做**小规模精排**。前者先把候选拉进来，后者决定谁真的值得进入上下文。' },
      { term: 'Bi-Encoder', desc: 'Query 和文档分别编码，再算向量相似度。优点是快、能建 ANN 索引；缺点是**看不到 query 和 doc 的细粒度交互**。' },
      { term: 'Cross-Encoder / Late Interaction', desc: '把 query 和 doc 放到同一个相关性判断过程中。精度通常更高，但代价是延迟、吞吐和工程复杂度也更高。' },
    ],
    keyPoints: [
      '召回和重排序是两个不同目标：前者追求不漏，后者追求更准',
      'Bi-encoder 快，但无法直接判断 query 和 doc 的细粒度匹配关系',
      'Reranker 的核心价值是把“像相关”变成“真的相关”',
      '在企业场景里，rerank 往往直接对应更高的引用准确率和更低的噪声干扰',
    ],
    engineeringPractice: [
      '不要把 rerank 当成“后期优化项”，而要把它当成检索链路里的标准环节。',
      '推荐默认链路：`retrieval top-50 -> rerank top-5/top-8 -> context assembly`。',
      '如果你线上经常出现“召回池里有答案，但回答还是偏掉”，优先检查 rerank，而不是先怪生成模型。'
    ],
    codeExamples: [
      {
        title: '两阶段检索管线伪代码',
        description: '先用向量检索拉候选，再用 reranker 精排，是最常见也最稳妥的生产模式。',
        code: `def retrieve_then_rerank(query, vectordb, reranker, top_n=50, top_k=5):
    # 1) 粗召回：速度优先
    candidates = vectordb.search(query, top_k=top_n)

    # 2) 精排：精度优先
    pairs = [[query, c["text"]] for c in candidates]
    scores = reranker.compute_score(pairs, normalize=True)

    ranked = sorted(
        zip(candidates, scores),
        key=lambda x: x[1],
        reverse=True,
    )
    return ranked[:top_k]`,
      },
    ],
    extensions: [
      {
        question: '什么时候可以先不上 reranker？',
        approach: '只有在你的 query 很简单、候选池很小、向量召回已经非常干净，而且评估证明 rerank 基本不带来提升时，才可以暂时不上。否则，多数生产场景里 rerank 都是高性价比组件。'
      },
      {
        question: '为什么“向量检索效果已经不错”仍然不等于“不需要重排序”？',
        approach: '因为“召回到了”不代表“排在前面了”。只要 top-k 里仍混着旧版文档、噪声段落、相似但不精确的内容，最终交给 LLM 的上下文质量就还不够好。'
      }
    ],
  },
  {
    id: 'cross-encoder',
    icon: '🔄',
    title: 'Cross-Encoder 与 ColBERT',
    content: [
      'Cross-Encoder 的核心做法是把 query 和每个候选文档拼成一个输入，交给 Transformer 联合编码，再输出一个相关性分数。因为 query token 和 doc token 之间能直接做 attention，所以它能捕捉非常细的匹配关系。',
      '但 Cross-Encoder 的代价也非常明显：它**不能预先把文档一次编码完就结束**，而是每次 query 来了都要对 query-doc pair 逐个计算。所以它适合对 top-20 / top-50 候选做精排，不适合直接拿来做百万级第一阶段检索。',
      'ColBERT（late interaction）提供了一条中间路线：它不像 bi-encoder 那样只保留整段文本的一个向量，也不像 cross-encoder 那样每次都做完整联合编码，而是保留更细粒度的 token-level 表示，再通过 MaxSim 等机制做匹配。因此它常被看作“比 bi-encoder 更准、比 cross-encoder 更快”的折中方案。'
    ],
    concepts: [
      { term: 'Cross-Encoder', desc: '把 query 和 doc 拼在一起联合编码，直接学习“这一对是否相关”。优点是最准，缺点是最慢。' },
      { term: 'Late Interaction', desc: '保留更细粒度的表示，在 query 和 doc 之间做延迟交互。典型代表是 ColBERT。' },
      { term: 'Precision-Latency Tradeoff', desc: 'Reranker 的核心不是“谁最准”，而是**在你的延迟预算下谁最值得**。同一个模型，放在全检索和放在 top-10 精排里，价值完全不同。' },
    ],
    illustrations: [
      {
        title: '有哪些判断相关性的方式？',
        description: '图里从左到右正好对应三类主流机制：`Dual Encoder` 适合召回，`Cross Encoder` 适合高精度精排，`ColBERT` 通过 late interaction 在速度和效果之间找平衡。',
        src: '/reranker-mechanism-comparison.png',
      },
      {
        title: 'ColBERT：质量与延迟的折中',
        description: '这张图很适合讲工程 tradeoff：ColBERT 的效果明显逼近更重的深度语言模型，但延迟控制在百毫秒量级，因此很适合“对效果要求高，但又扛不住 full cross-encoder 成本”的场景。',
        src: '/colbert-latency-quality.png',
      },
    ],
    keyPoints: [
      'Cross-Encoder 通常是精度天花板，但吞吐最低',
      'ColBERT 不是免费午餐，但常常是工程上很值得的折中',
      '真正的选型问题不是“哪个最好”，而是“你的延迟预算支持哪种相关性判断方式”',
      '很多团队的默认落地顺序是：Cross-Encoder 先上线，ColBERT 视规模和预算再升级',
    ],
    engineeringPractice: [
      '如果你现在还没有 reranker，先上成熟的 Cross-Encoder，是收益最稳定的路线。',
      '如果 top-50 rerank 延迟已经成瓶颈，可以考虑：减少候选数、批量推理、量化模型，或评估 ColBERT 类方案。',
      'ColBERT 更适合高价值检索或中等规模知识库，不一定适合所有团队作为第一步。'
    ],
    codeExamples: [
      {
        title: 'Cross-Encoder Rerank 示例',
        description: '这是当前企业 RAG 里最常见的 rerank 形态：`query-doc pair -> relevance score`。',
        code: `from FlagEmbedding import FlagReranker

reranker = FlagReranker(
    "BAAI/bge-reranker-v2.5-gemma2-lightweight",
    use_fp16=True,
)

pairs = [[query, chunk.text] for chunk in candidate_chunks]
scores = reranker.compute_score(pairs, normalize=True)

ranked = sorted(
    zip(candidate_chunks, scores),
    key=lambda x: x[1],
    reverse=True,
)
top_k = ranked[:5]`,
      },
      {
        title: 'ColBERT 风格打分伪代码',
        description: 'ColBERT 不直接输出一个整段 embedding，而是保留 token-level 表示，再通过 MaxSim 聚合分数。',
        code: `def colbert_score(query_token_embs, doc_token_embs):
    # 每个 query token 与 doc token 做最大相似度匹配
    max_sims = []
    for q in query_token_embs:
        sims = [cosine_sim(q, d) for d in doc_token_embs]
        max_sims.append(max(sims))
    return sum(max_sims)

# 生产里通常会先离线编码文档 token 向量，再在线做 late interaction`,
      },
    ],
    extensions: [
      {
        question: '为什么 Cross-Encoder 不能直接替代第一阶段向量检索？',
        approach: '因为它要对 query 和每个 doc 成对计算，无法像 bi-encoder 那样预计算文档向量并建 ANN 索引。问题不在“能不能更准”，而在“算不算得起”。'
      },
      {
        question: 'ColBERT 最适合解决什么问题？',
        approach: '最适合“纯向量不够准、纯 cross-encoder 又太慢”的中间地带。也就是你已经知道精排很重要，但延迟预算又不允许每次都做重型 pairwise 计算。'
      }
    ],
  },
  {
    id: 'llm-reranker',
    icon: '🤖',
    title: 'LLM-based Reranker',
    content: [
      'LLM-based rerank 的思路是：不再依赖专门训练的 reranker 模型，而是直接让通用 LLM 按相关性给候选文档排序。它的最大优势是**零样本迁移能力**，尤其适合领域复杂、排序标准经常变化的场景。',
      '从实现方式看，最常见的有两类：`pointwise` 是逐条给候选打分，简单但调用次数多；`listwise` 是把多个候选一起放进 prompt，让模型直接输出排序结果，调用次数少但更容易受到位置偏差和上下文长度限制影响。',
      '实战上，LLM rerank 并不一定要替代 cross-encoder。更常见的用法是：先用 cross-encoder 把 top-50 压到 top-10，再用 LLM 做最后一轮高价值排序，或者加入业务规则（例如优先最新、优先官方来源、优先政策正文而不是 FAQ 摘要）。'
    ],
    concepts: [
      { term: 'Pointwise', desc: '逐条判断一个候选是否相关。优点是简单稳，缺点是调用次数和候选数线性增长。' },
      { term: 'Listwise', desc: '让模型一次看多个候选并直接输出排序。优点是更像“真正排序”，缺点是更容易受 prompt 排列和位置偏差影响。' },
      { term: 'Custom Ranking Policy', desc: 'LLM rerank 的真正价值之一，是可以把“最新优先、官方优先、条例正文优先”等业务规则直接写进排序标准。' },
    ],
    keyPoints: [
      'LLM rerank 的核心优势不是更快，而是更灵活、更能迁移',
      'Pointwise 更稳，Listwise 更省调用次数但更敏感',
      '高价值场景里，LLM rerank 更像最后一道“裁判”',
      '别把 LLM rerank 当默认全量方案，它通常适合小候选集精排',
    ],
    engineeringPractice: [
      '默认不要让 LLM 直接排 top-50，先缩到 top-10 或 top-8 再做。',
      '如果排序规则里包含时间、新旧版本、官方来源等复杂偏好，LLM rerank 特别有价值。',
      '使用 `temperature=0`，并固定输出格式，否则 rerank 本身会引入不必要波动。'
    ],
    codeExamples: [
      {
        title: 'LLM Listwise Rerank（RankGPT 风格）',
        description: '把多个候选一次性交给 LLM 排序，更适合候选数较小但排序标准较复杂的场景。',
        code: `import openai

def llm_rerank(query: str, docs: list[str], top_k: int = 5) -> list[int]:
    numbered = "\\n".join(
        f"[{i+1}] {d[:300]}" for i, d in enumerate(docs)
    )
    prompt = f"""给定查询和候选文档，按相关性从高到低排序。
只输出文档编号，用 > 分隔。

查询: {query}

候选文档:
{numbered}

排序结果:"""

    resp = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )
    ranking = resp.choices[0].message.content.strip()
    indices = [int(x.strip()) - 1 for x in ranking.split(">")]
    return indices[:top_k]`,
      },
    ],
    extensions: [
      {
        question: '为什么很多团队会先上 Cross-Encoder，再考虑 LLM rerank？',
        approach: '因为 Cross-Encoder 的行为更稳定、成本更可控、延迟更可预测。LLM rerank 更适合用在“排序规则真的复杂到普通 reranker 不够表达”的地方。'
      },
      {
        question: 'Listwise 排序时最大的工程风险是什么？',
        approach: '最大的风险不是模型不会排，而是输入顺序、文档截断和位置偏差会悄悄影响结果。所以要控制候选数、随机打乱做抽检，并观察不同输入顺序下的稳定性。'
      }
    ],
  },
  {
    id: 'context-assembly',
    icon: '🧩',
    title: '上下文组装与去重',
    content: [
      '拿到 rerank 结果后，还不能直接把 top-k 原封不动塞给 LLM。真正决定回答质量的最后一步，是如何把这些 chunk **组装成一个既完整、又不冗余、还能引用回溯** 的上下文。',
      '常见问题是：top-k 全来自同一篇文档的相邻段落，信息高度重复；或者多个 chunk 都对，但拼在一起后 token 太多、噪声太大；又或者同一问题同时命中了新旧版本文档，结果把冲突证据一起送给模型却没有做说明。',
      '所以这一步通常要同时做三件事：**去重/多样性控制、parent-child 扩展、token 预算管理**。它不只是 prompt 工程，更是检索工程的一部分。'
    ],
    illustrations: [
      {
        title: 'MMR 公式解读',
        description: 'MMR 每次迭代选一个文档，同时最大化与 Query 的相关性（Sim₁）、最小化与已选文档的相似度（Sim₂），λ 控制二者平衡。',
        src: '/mmr-formula-explained.png',
      },
      {
        title: 'MMR 检索流程',
        description: '先从 Vector Store 做 Similarity Retrieval 取 fetch_k=5 个候选，再经 MMR 多样性筛选，最终输出 k=3 个不重复的上下文片段。',
        src: '/mmr-retrieval-pipeline.png',
      },
    ],
    concepts: [
      { term: 'MMR', desc: '在相关性和多样性之间做平衡，避免 top-k 全是同一篇文档的相邻段落。' },
      { term: 'Parent-Child Expansion', desc: '小 chunk 用来检索，大 chunk 用来喂给 LLM。这样既保留检索精度，又补足生成所需上下文。' },
      { term: 'Conflict Handling', desc: '当新旧版本、FAQ 与正式制度冲突时，要么在组装阶段裁决，要么明确把冲突显式暴露给模型。' },
    ],
    keyPoints: [
      'rerank 只是排序更准，不等于上下文天然就更适合生成',
      '多样性和去重的目标是减少冗余，不是故意加入不相关信息',
      '小 chunk 检索、大 chunk 喂模型，是最常见也最稳妥的 parent-child 策略',
      '上下文组装时要显式考虑版本冲突、token 预算和引用格式',
    ],
    engineeringPractice: [
      '给同一 source 设上限，例如“同一文档最多进 2-3 个 chunk”。',
      '如果多个相邻 chunk 同时命中，优先合并成一个连续段落，而不是重复喂多个碎片。',
      '正式文档和 FAQ 冲突时，优先策略要在代码里写死，不要完全交给 LLM 临场判断。'
    ],
    codeExamples: [
      {
        title: 'MMR 选择算法',
        description: '用相关性 + 差异性联合挑选上下文，避免 top-k 高度重复。',
        code: `def mmr_select(query_emb, doc_embs, scores, k=5, lambda_=0.6):
    selected, remaining = [], list(range(len(scores)))
    for _ in range(k):
        best_idx, best_score = -1, -float("inf")
        for idx in remaining:
            relevance = scores[idx]
            redundancy = max(
                cosine_sim(doc_embs[idx], doc_embs[s])
                for s in selected
            ) if selected else 0
            mmr = lambda_ * relevance - (1 - lambda_) * redundancy
            if mmr > best_score:
                best_score, best_idx = mmr, idx
        selected.append(best_idx)
        remaining.remove(best_idx)
    return selected`,
      },
      {
        title: '上下文组装 + 引用格式',
        description: '拿到精排结果后，再扩展 parent chunk、控制 token 预算，并统一引用格式。',
        code: `def assemble_context(ranked_chunks, max_tokens=8000):
    context_parts = []
    used_tokens = 0

    for i, chunk in enumerate(ranked_chunks):
        expanded = expand_to_parent(chunk)
        chunk_tokens = count_tokens(expanded.text)

        if used_tokens + chunk_tokens > max_tokens:
            break

        context_parts.append(
            f"[来源{i+1}] {expanded.metadata['source']}"
            f" (更新: {expanded.metadata['date']})\\n"
            f"{expanded.text}"
        )
        used_tokens += chunk_tokens

    return "\\n\\n---\\n\\n".join(context_parts)`,
      },
    ],
    extensions: [
      {
        question: '为什么“有 rerank”不等于“上下文就一定干净”？',
        approach: '因为 rerank 只是把候选排出相对顺序，并不会自动帮你去重、扩展 parent、控制预算，也不会帮你处理新旧版本冲突。上下文组装仍然需要单独设计。'
      },
      {
        question: '多样性为什么不能简单理解成“尽量选不同来源”？',
        approach: '因为多样性的前提仍然是相关性。对同一个问题，如果不同来源本身都不够相关，硬拉多样性只会把噪声带进上下文。'
      }
    ],
  },
  {
    id: 'evaluation',
    icon: '✅',
    title: '验收与调参',
    content: [
      'Reranking 不能只看“感觉更准了没有”，而要拆成可度量的指标。最常见的做法是比较 **有 rerank vs 无 rerank** 时，top-k 质量、引用正确率、faithfulness 和最终回答质量是否真的提升。',
      '如果想定位问题到底出在召回、rerank 还是上下文组装，就要做 ablation：固定同一批候选，只改变排序或组装策略，然后比较输出差异。否则你很难知道提升到底来自哪一层。',
      '另一个很实用的测试是**噪声敏感度测试**：故意往 top-k 里插入 1-3 个不相关 chunk，观察模型是否还能稳定回答。这个测试对验证 rerank + context assembly 的鲁棒性特别有效。'
    ],
    concepts: [
      { term: 'Citation Correctness', desc: '引用真的能在对应 chunk 里找到支撑内容吗？这是检验 rerank 和上下文组装价值的关键指标。' },
      { term: 'Noise Sensitivity', desc: '加入少量噪声后系统是否明显退化，能直接反映上下文选择是否足够稳健。' },
      { term: 'Ablation', desc: '固定其他环节，只替换 rerank 或 context assembly，才能知道哪一步真正带来了提升。' },
    ],
    keyPoints: [
      '评估 rerank 时，不要只看最终回答主观好不好',
      '必须做有 rerank / 无 rerank 的对照实验',
      '噪声敏感度测试是验证鲁棒性的高价值手段',
      '每次换 reranker、改参数或改 prompt，都应该做回归测试',
    ],
    engineeringPractice: [
      '准备一批 50-100 条黄金 query，覆盖编号类、事实类、复杂问句和多跳问句。',
      '评估时固定候选集，只比较排序和上下文组装，不要把变量混在一起。',
      '上线后持续抽样真实 query，避免只靠离线黄金集判断。'
    ],
    codeExamples: [
      {
        title: '噪声敏感度测试',
        description: '验证加入噪声 chunk 后，回答质量是否明显下降。',
        code: `def noise_sensitivity_test(query, relevant_chunks, noise_chunks, llm):
    clean_ctx = assemble_context(relevant_chunks)
    clean_answer = llm.generate(query, clean_ctx)

    mixed = relevant_chunks + noise_chunks
    random.shuffle(mixed)
    noisy_ctx = assemble_context(mixed)
    noisy_answer = llm.generate(query, noisy_ctx)

    clean_score = evaluate_faithfulness(clean_answer, clean_ctx)
    noisy_score = evaluate_faithfulness(noisy_answer, noisy_ctx)

    degradation = clean_score - noisy_score
    print(f"噪声敏感度: {degradation:.2%} 下降")
    return degradation < 0.05`,
      },
    ],
    extensions: [
      {
        question: '如果 rerank 后指标提升不明显，第一反应应该是什么？',
        approach: '先不要急着换 reranker。先确认候选池里本来有没有答案、评估集够不够难、以及当前 top-n 是否设置合理。很多时候问题不是 rerank 模型差，而是召回池本身就不行。'
      },
      {
        question: '为什么“引用对了”仍然不代表 rerank 做得足够好？',
        approach: '因为引用对只是最低标准。真正好的 rerank 还应该让答案更聚焦、减少噪声干扰、降低旧版文档混入，并提升上下文的整体可用性。'
      }
    ],
  },
];

export const rerankWarmupQuestions = [
  {
    question: '你们当前的 RAG 系统有没有加 reranker？如果有，你观察到 rerank 前后 top-5 的文档顺序变化大不大？如果变化不大，可能说明什么？',
    hook: '如果 rerank 前后变化很小，可能说明你的召回质量已经很高（好事），也可能说明 reranker 没选对或 query 太简单——需要用困难 case 验证。'
  },
  {
    question: '假设你的 LLM 回答中出现了"根据文档，差旅标准为XXX"但用户反馈这个数字是旧版的。你的上下文组装流程哪个环节可能出了问题？你会怎么排查和修复？',
    hook: '涉及时间维度的冲突处理、metadata filter、chunk 优先级排序——上下文组装中最容易忽略的坑。'
  }
];

export const rerankQuestions = [
  {
    question: 'Cross-Encoder Reranker 为什么不能直接替代 bi-encoder 做第一阶段检索？从计算复杂度、索引结构、在线延迟三个角度分析。',
    hint: '想想 cross-encoder 需要对 query 和每个 doc 做 pair-wise 计算。',
    answer: 'Cross-encoder 对每个 query-doc pair 都需要完整前向传播（O(N) 次推理，N=语料库大小），无法预计算文档表示，因此不能构建 ANN 索引做亚线性检索。对百万文档，即使 GPU 推理每对 5ms，也需要 5000 秒。而 bi-encoder 的文档向量可以离线预计算并建索引，在线只需编码 query + ANN 搜索，延迟 <50ms。所以两阶段架构是必需的：bi-encoder 做粗召回，cross-encoder 做精排。'
  },
  {
    question: '在 LLM-based listwise rerank 中，如果候选文档超过 20 个，可能遇到什么问题？你会怎么解决？',
    hint: '考虑 context window 限制、position bias、成本。',
    answer: '问题：① context window 可能放不下所有文档；② LLM 对列表中间位置的文档关注度下降（lost-in-the-middle）；③ 文档展示顺序影响排序结果（position bias）；④ 输入 token 多导致成本和延迟飙升。解决方案：先用 cross-encoder 或 bi-encoder 分数筛到 top-10-15 再做 LLM rerank；使用 sliding window（每次排 5-8 个文档，多轮汇总）；随机打乱输入顺序消除 position bias；或改用 pointwise 打分避免列表效应。'
  },
  {
    question: 'Parent-Child chunk 索引策略中，"小 chunk 检索、大 chunk 喂 LLM"的逻辑是什么？如果不这样做，会有什么问题？',
    hint: '想想 embedding 的有效语义密度和 LLM 需要的上下文完整性。',
    answer: '小 chunk（128-256 token）语义密度高，embedding 表示更精确，不会被无关内容稀释，检索精度更好。但小 chunk 送给 LLM 时缺乏上下文（一句话可能看不出前因后果），导致回答不完整或产生幻觉。大 chunk（512-1024 token）提供充足上下文让 LLM 理解全貌。如果直接用大 chunk 检索，embedding 容易被噪声稀释导致召回精度下降；如果直接用小 chunk 喂 LLM，上下文不够导致回答碎片化。所以 parent-child 策略用小 chunk 的精度做检索，用大 chunk 的完整性做生成，两全其美。'
  },
  {
    question: '如何设计一个自动化测试来验证"rerank 对你的 RAG 系统确实有正向贡献"？需要考虑哪些 confounding factors？',
    hint: '想想 A/B 实验设计、评估指标、数据泄露。',
    answer: '设计：准备 golden set（100+ 条 query + 标注的 ideal answer），分别跑"有 rerank"和"无 rerank"两条 pipeline，对比 answer relevancy、faithfulness、citation correctness。Confounding factors：① LLM 随机性——需要 temperature=0 或多次采样取均值；② query 难度分布——确保两组用完全相同的 query 集；③ 召回池差异——确保 rerank 和非 rerank 组的候选集相同（只改变排序，不改变召回）；④ 时间因素——如果 API 模型更新了，两组需要在相近时间跑；⑤ 评估者 bias——用自动化指标 + 人工评估交叉验证。统计显著性：用 paired t-test 或 bootstrap 检验。'
  }
];

export const rerankDemoChunks = [
  {
    id: 1,
    source: '差旅管理制度_v3.pdf — §4.2',
    text: '海外出差住宿标准：一线城市（纽约、伦敦、东京）每晚不超过 2000 元；其他城市每晚不超过 1500 元。需提前通过 OA 系统提交申请。',
    relevance: 'high',
    biEncoderScore: 0.82,
    crossEncoderScore: 0.97,
  },
  {
    id: 2,
    source: '差旅管理制度_v3.pdf — §4.1',
    text: '国内出差住宿标准：北上广深每晚不超过 800 元，其他省会城市每晚不超过 600 元，其他地级市每晚不超过 400 元。',
    relevance: 'medium',
    biEncoderScore: 0.88,
    crossEncoderScore: 0.71,
  },
  {
    id: 3,
    source: '2023年度差旅费用统计.xlsx',
    text: '2023 年全公司差旅总支出 1.2 亿元，同比增长 15%。其中海外差旅占比 35%，住宿费用占差旅总费用的 42%。',
    relevance: 'low',
    biEncoderScore: 0.79,
    crossEncoderScore: 0.35,
  },
  {
    id: 4,
    source: '差旅管理制度_v2.pdf — §4.2',
    text: '海外出差住宿标准：一线城市每晚不超过 1800 元；其他城市每晚不超过 1200 元。（已废止，参见 v3 版）',
    relevance: 'noise',
    biEncoderScore: 0.85,
    crossEncoderScore: 0.52,
  },
  {
    id: 5,
    source: '差旅管理制度_v3.pdf — §5.1',
    text: '差旅报销流程：出差结束后 5 个工作日内提交报销申请，需附上机票/火车票、住宿发票、餐饮发票原件或电子件。',
    relevance: 'medium',
    biEncoderScore: 0.76,
    crossEncoderScore: 0.63,
  },
  {
    id: 6,
    source: 'HR政策FAQ.md',
    text: 'Q: 出差期间的餐饮补贴标准是多少？A: 国内出差每天餐补 150 元，海外出差每天餐补 300 元，实报实销但不超过上限。',
    relevance: 'low',
    biEncoderScore: 0.73,
    crossEncoderScore: 0.28,
  },
  {
    id: 7,
    source: '差旅管理制度_v3.pdf — §4.3',
    text: '海外出差机票标准：经济舱为默认舱位，飞行时间超过 8 小时可申请商务舱，需部门总监审批。',
    relevance: 'medium',
    biEncoderScore: 0.71,
    crossEncoderScore: 0.58,
  },
  {
    id: 8,
    source: '年度员工手册2024.pdf — 第12章',
    text: '公司鼓励员工使用协议酒店，已与全球 200+ 酒店集团签订协议价。使用协议酒店可享受额外 10% 报销额度提升。',
    relevance: 'medium',
    biEncoderScore: 0.68,
    crossEncoderScore: 0.61,
  },
  {
    id: 9,
    source: '行政通知_20240315.md',
    text: '关于调整办公区空调温度的通知：为响应节能减排号召，夏季空调温度不低于 26℃，冬季不高于 20℃。',
    relevance: 'noise',
    biEncoderScore: 0.42,
    crossEncoderScore: 0.05,
  },
  {
    id: 10,
    source: '差旅管理制度_v3.pdf — §6.1',
    text: '差旅审批权限：3 天以内由直属经理审批，3-7 天需部门总监审批，7 天以上需 VP 审批。海外出差一律需 VP 审批。',
    relevance: 'low',
    biEncoderScore: 0.65,
    crossEncoderScore: 0.41,
  }
];

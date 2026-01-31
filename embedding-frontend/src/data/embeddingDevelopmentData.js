
/**
 * Embedding 发展史数据
 * 包含每个阶段的详细信息、技术点、案例和计算演示数据
 */

export const embeddingDevelopmentData = [
    {
        id: 'stage1',
        name: '第一阶段：离散符号时代',
        year: 'Pre-2013',
        description: 'NLP 的"前神经网络时代"，文本主要依赖离散符号匹配和频率统计。',
        color: '#64748b', // Slate
        technologies: [
            {
                id: 'onehot',
                name: 'One-Hot 编码 (独热编码)',
                description: '将每个词表示为只有一个元素为 1，其余全为 0 的长向量。维度等于词表大小。',
                analogy: '像一个巨大的开关面板。十万个词就是十万个开关，表示"猫"时，只有"猫"的开关打开，其他全关。',
                limitations: ['语义鸿沟：无法衡量词之间的相似度', '维度灾难：词表越大向量越长', '稀疏性：绝大多数位置是 0'],
                realCase: {
                    type: 'description',
                    content: '在垃圾邮件过滤的早期，系统会将邮件转化为 One-Hot 向量。如果在第 4582 位（代表"中奖"）和第 9021 位（代表"汇款"）上有值，则判定为垃圾邮件。但如果骗子换成"领奖"，系统就失效了，因为"领奖"是另一个完全独立的维度。'
                },
                derivationId: 'OneHot_Orthogonality'
            },
            {
                id: 'tfidf',
                name: 'TF-IDF',
                description: '衡量一个词在文档中的重要程度。由词频 (TF) 和逆文档频率 (IDF) 组成。',
                analogy: '在一堆关于"原子能"的文章里，"的"虽然出现最多但没用（IDF低）；"原子能"出现多且独特，所以权重最高。',
                limitations: ['仍然基于字面匹配', '无法处理同义词（如"如厕"和"上厕所"）'],
                realCase: {
                    type: 'table',
                    headers: ['文档', '词汇', 'TF (词频)', 'IDF (稀缺度)', 'TF-IDF 权重'],
                    rows: [
                        ['D1: 苹果发布会', '苹果', 'High (0.1)', 'Medium (3.0)', 'High (0.3)'],
                        ['D1: 苹果发布会', '的', 'High (0.2)', 'Low (0.1)', 'Low (0.02)'],
                        ['D2: 种植技术', '苹果', 'High (0.15)', 'Medium (3.0)', 'High (0.45)'],
                        ['D3: 量子力学', '量子', 'High (0.1)', 'High (10.0)', 'Very High (1.0)']
                    ],
                    note: 'TF-IDF 能有效过滤停用词，提取关键词，但无法区分"水果苹果"和"科技苹果"。'
                },
                derivationId: 'TFIDF_Calc'
            }
        ]
    },
    {
        id: 'stage2',
        name: '第二阶段：静态稠密向量',
        year: '2013 - 2017',
        description: 'Word2Vec 的诞生标志着 NLP 进入分布式表示时代。词被映射为低维稠密向量，具备了数学意义上的语义。',
        color: '#0ea5e9', // Sky Blue
        technologies: [
            {
                id: 'word2vec',
                name: 'Word2Vec',
                description: '利用神经网络（CBOW 或 Skip-Gram）学习词向量。基于"分布假说"：上下文相似的词，语义也相似。',
                analogy: '完形填空高手。通过只有"____"（填空）前后是什么词，来猜中间应该是哪个词，猜对了就学到了语义。',
                limitations: ['静态向量：无法解决多义词（"Bank" 既是银行也是河岸）', 'OOV 问题：无法处理未登录词'],
                realCase: {
                    type: 'description',
                    content: '在电商推荐中，通过用户点击序列训练 Item2Vec（Word2Vec 的变体）。如果用户常买"可乐"和"雪碧"，它们的向量就会很近。当用户看了"可乐"，系统就能推荐"雪碧"，即使它们属于不同类目。'
                },
                derivationId: 'Word2Vec_Analogy'
            },
            {
                id: 'glove',
                name: 'GloVe',
                description: '结合了全局矩阵分解和局部上下文窗口。利用词共现概率的比率来编码语义。',
                analogy: '统计学家。先通读整个图书馆，统计好所有词两两出现的次数，然后用数学方法还原这个关系网。',
                realCase: {
                    type: 'multi-part',
                    parts: [
                        {
                            name: '共现概率比率示例',
                            example: 'P(solid | ice) / P(solid | steam) ≈ Large (冰是固体)\nP(gas | ice) / P(gas | steam) ≈ Small (蒸汽是气体)\nP(water | ice) / P(water | steam) ≈ 1 (都是水)'
                        }
                    ]
                },
                derivationId: null // No derivation for GloVe for now simple description is enough
            }
        ]
    },
    {
        id: 'stage3',
        name: '第三阶段：上下文感知 (BERT)',
        year: '2018 - 2022',
        description: 'Transformer 和 BERT 引入了动态向量。同一个词在不同语境下有不同的向量表示。基于 BERT 衍生出了三种主流的语义相似度计算架构。',
        color: '#8b5cf6', // Violet
        technologies: [
            {
                id: 'bert',
                name: 'BERT & Contextual Embedding',
                description: '基于 Transformer Encoder，利用自注意力机制捕获双向上下文。同一个词在不同句子中会有不同的向量表示。',
                analogy: '精通语言的阅读者。读到"Apple"时，会看后面是"Pie"还是"Inc"，从而决定把它理解为水果还是公司。',
                limitations: ['原生 BERT 不适合直接做检索（计算量大），需要改进架构'],
                realCase: {
                    type: 'description',
                    content: '谷歌搜索使用 BERT 后，能理解 "can you get medicine for someone pharmacy" 中的 "for someone" 是指"为别人买药"，而不是"别人买药"。'
                },
                derivationId: 'SelfAttention_Matrix'
            },
            {
                id: 'biencoder',
                name: 'Bi-Encoder (双塔模型)',
                description: '使用孪生/双塔网络结构，Query 和 Document 各自独立通过一个 Encoder 生成向量，然后通过余弦相似度计算匹配分数。支持离线预计算文档向量，检索时只需计算 Query 向量并在向量库中搜索。',
                analogy: '给每个句子拍一张"身份证照片"（向量）。找相似句子时，只要比对照片（计算余弦相似度），不用每次都把两个人拉到一起面试。可以预先给所有文档拍好照存档。',
                limitations: ['Query 和 Document 独立编码，无法捕捉细粒度交互', '精度略低于 Cross-Encoder'],
                realCase: {
                    type: 'table',
                    headers: ['架构', '编码方式', '检索 100万文档耗时', '精度'],
                    rows: [
                        ['Bi-Encoder', 'Query/Doc 独立编码', '~10 毫秒 (向量库)', '较高'],
                        ['Cross-Encoder', 'Query+Doc 联合编码', '~60 小时 (不可行)', '最高']
                    ],
                    note: 'Bi-Encoder 是 RAG 的基石，通过牺牲少量精度换取巨大的速度提升。代表模型：Sentence-BERT、BGE、E5。'
                },
                derivationId: 'BiEncoder_Cosine'
            },
            {
                id: 'colbert',
                name: 'ColBERT (晚期交互模型)',
                description: 'Contextualized Late Interaction over BERT。保留 Query 和 Document 中每个 Token 的向量（而非压缩成单一向量），在检索阶段计算 Token 级别的细粒度相似度，然后通过 MaxSim 操作聚合得分。',
                analogy: '像一场多人相亲。Query 的每个词（一群人）都和 Document 的所有词逐一见面，每个人记录自己最投缘的对象分数，最后把所有人的"最高分"加起来作为总分。',
                limitations: ['存储成本高（每个文档需存多个向量）', '计算比 Bi-Encoder 复杂'],
                realCase: {
                    type: 'multi-part',
                    parts: [
                        {
                            name: 'ColBERT vs Bi-Encoder 对比',
                            example: 'Bi-Encoder: "机器学习入门" → 单一向量 [0.8, 0.3, ...]\n\nColBERT: "机器学习入门" → 4个向量\n  "机器" → [0.9, 0.1, ...]\n  "学习" → [0.2, 0.8, ...]\n  "入门" → [0.3, 0.3, ...]\n  [MASK] → [0.1, 0.5, ...]\n\n检索时：Query 每个 token 找 Doc 中最相似的 token，求和得总分'
                        }
                    ]
                },
                derivationId: 'ColBERT_MaxSim'
            },
            {
                id: 'crossencoder',
                name: 'Cross-Encoder (交叉编码器)',
                description: '将 Query 和 Document 拼接成一个序列 [CLS] Query [SEP] Doc [SEP]，整体送入 Transformer 进行联合编码。Query 和 Doc 的每个 token 都能互相 Attend，捕捉最细粒度的语义交互，最后取 [CLS] 向量通过分类头输出相似度分数。',
                analogy: '像专家面试官。把两份简历（Query + Doc）放在一起逐字对比阅读，仔细分析每处关联，最后给出一个精确的匹配分数。但不能提前准备，每对都要重新面试。',
                limitations: ['无法预计算，每次检索都要重新推理', '速度极慢，只适合重排序阶段', '无法用于大规模检索'],
                realCase: {
                    type: 'table',
                    headers: ['使用场景', 'Bi-Encoder', 'Cross-Encoder'],
                    rows: [
                        ['初筛 100 万 → Top 100', '✅ 毫秒级完成', '❌ 需要 60 小时'],
                        ['重排 Top 100 → Top 10', '精度不够', '✅ 精度最高'],
                        ['是否可预计算文档向量', '✅ 可以', '❌ 不可以']
                    ],
                    note: '实际 RAG 系统常用"粗排 + 精排"流水线：Bi-Encoder 负责从百万文档召回 Top100，Cross-Encoder 精排出 Top10。'
                },
                derivationId: 'CrossEncoder_Forward'
            }
        ]
    },
    {
        id: 'stage4',
        name: '第四阶段：大模型与生成式时代',
        year: '2023 - Present',
        description: '基于 Decoder-only 架构（如 GPT/LLaMA）的大模型开始用于 Embedding，带来更强的指令遵循和长文本能力。',
        color: '#f59e0b', // Amber
        technologies: [
            {
                id: 'llm_embed',
                name: 'LLM as Embedder (NV-Embed)',
                description: '利用 LLM 强大的理解能力，通过特定的 Prompt 或微调（如 LLM2Vec）生成高质量向量。支持超长上下文。',
                analogy: '让爱因斯坦（大模型）来读文章并写摘要（向量），比让小学生（BERT）读，理解得更深刻。',
                realCase: {
                    type: 'description',
                    content: '处理法律合同时，合同可能长达 2 万字。传统的 BERT (512 token) 只能看头尾。现在的 LLM Embedding 可以一次性读完整个合同，生成精准的语义向量。'
                },
                derivationId: null
            },
            {
                id: 'matryoshka',
                name: 'Matryoshka (俄罗斯套娃) Embedding',
                description: '训练时强制向量的前 k 维包含主要信息。允许在推理时截断向量，灵活平衡精度和存储成本。',
                analogy: '像渐进式加载的图片。先看模糊的缩略图（前 64 维），大概知道是什么；需要细节时再加载全图（1536 维）。',
                realCase: {
                    type: 'table',
                    headers: ['维度', '存储 (1M 文档)', '检索精度 (MTEB)', '用途'],
                    rows: [
                        ['1536 维', '6GB', '64.5%', '高精度重排'],
                        ['256 维', '1GB', '64.2% (-0.3%)', '快速初筛'],
                        ['64 维', '256MB', '62.0%', '端侧/移动端']
                    ],
                    note: 'OpenAI text-embedding-3 就使用了此技术。'
                },
                derivationId: 'Matryoshka_Truncation'
            }
        ]
    }
];

export const embeddingDerivationData = {
    'OneHot_Orthogonality': {
        formulaLatex: 'A · B = Σ(aᵢ × bᵢ) = 0 (当 i≠j)',
        example: {
            title: 'One-Hot 正交性演示',
            scenario: '词表：["猫", "狗", "人"]',
            steps: [
                {
                    name: '构建向量',
                    detail: '词表大小为 3\n猫 = [1, 0, 0]\n狗 = [0, 1, 0]',
                    values: ['v_cat = [1, 0, 0]', 'v_dog = [0, 1, 0]']
                },
                {
                    name: '计算点积 (相似度)',
                    detail: '逐位同位相乘再相加',
                    calculation: '1×0 + 0×1 + 0×0 = 0',
                    result: 0
                },
                {
                    name: '计算欧几里得距离',
                    calculation: '√[(1-0)² + (0-1)² + (0-0)²] = √2',
                    result: 1.414
                }
            ],
            interpretation: '无论两个词（如猫和狗）在现实中多么相似，在 One-Hot 空间中它们的距离永远是 √2，相似度（点积）永远是 0。计算机认为它们毫无关系。'
        }
    },
    'TFIDF_Calc': {
        formulaLatex: 'TF-IDF = (count / length) × log(N / df)',
        example: {
            title: 'TF-IDF 计算过程',
            scenario: '语料库有 1000 篇文档 (N=1000)。当前文档 D 有 100 个词。',
            steps: [
                {
                    name: '计算 TF (词频)',
                    detail: '词 "原子能" 在文档 D 中出现了 3 次',
                    calculation: 'TF = 3 / 100',
                    result: 0.03
                },
                {
                    name: '计算 IDF (逆文档频率)',
                    detail: '词 "原子能" 在 1000 篇文档中，只有 10 篇提到 (df=10)',
                    calculation: 'IDF = log₁₀(1000 / 10) = log₁₀(100) = 2',
                    result: 2.0
                },
                {
                    name: '计算最终权重',
                    calculation: '0.03 × 2.0',
                    result: 0.06
                }
            ],
            interpretation: '如果是常用词"的" (TF=50/100=0.5, df=999, IDF≈0)，权重会非常接近 0。'
        }
    },
    'Word2Vec_Analogy': {
        formulaLatex: 'v(King) - v(Man) + v(Woman) ≈ v(Queen)',
        example: {
            title: '向量算术与类比推理',
            scenario: '假设在 2D 简化空间中 (Gender, Royalty)',
            steps: [
                {
                    name: '定义基准向量',
                    values: [
                        'King  = [0.9, 0.9] (男性, 皇室)',
                        'Man   = [0.9, 0.1] (男性, 平民)',
                        'Woman = [0.1, 0.1] (女性, 平民)'
                    ],
                    detail: '维度 1 代表"男性化程度"，维度 2 代表"皇室程度"'
                },
                {
                    name: '执行减法：King - Man',
                    calculation: '[0.9-0.9, 0.9-0.1] = [0.0, 0.8]',
                    detail: '得到了纯粹的"皇室"属性向量'
                },
                {
                    name: '执行加法：+ Woman',
                    calculation: '[0.0, 0.8] + [0.1, 0.1] = [0.1, 0.9]',
                    result: '[0.1, 0.9]'
                },
                {
                    name: '比对结果',
                    detail: 'Queen 的理想向量应为 [0.1, 0.9] (女性, 皇室)',
                    calculation: '计算结果完全匹配 Queen',
                    result: 'Match!'
                }
            ],
            interpretation: '这证明了 Word2Vec 这种稠密向量不仅仅是数字，还线性地编码了语义概念。'
        }
    },
    'SelfAttention_Matrix': {
        formulaLatex: 'Attention(Q, K, V) = softmax(QKᵀ / √d)V',
        example: {
            title: '自注意力机制简化演示',
            scenario: '输入句子: "I am" (简化为 2 个 token)',
            steps: [
                {
                    name: '生成 Q, K, V',
                    detail: '假设 Embedding 维度为 2。',
                    values: [
                        'Token "I": q1=[1,0], k1=[1,0], v1=[2,0]',
                        'Token "am": q2=[0,1], k2=[0,1], v2=[0,2]'
                    ]
                },
                {
                    name: '计算相关性分数 (QKᵀ)',
                    detail: 'Token "I" 对所有 Token 的关注度',
                    calculation: 'Score_11 = q1·k1 = 1; Score_12 = q1·k2 = 0',
                    result: 'I 关注 I: 1, I 关注 am: 0'
                },
                {
                    name: 'Softmax 归一化',
                    detail: '假设很简单，不除以 √d',
                    calculation: 'Softmax([1, 0]) ≈ [0.73, 0.27]',
                    result: '权重: [0.73, 0.27]'
                },
                {
                    name: '加权求和得到 "I" 的新向量',
                    calculation: '0.73×v1 + 0.27×v2 = 0.73×[2,0] + 0.27×[0,2]',
                    result: '[1.46, 0.54]'
                }
            ],
            interpretation: 'Token "I" 的新向量不再只是它自己，而是融合了上下文 "am" 的信息（0.54 的分量）。这就是上下文感知的原理。'
        }
    },
    'Matryoshka_Truncation': {
        formulaLatex: 'Sim(u_{1:k}, v_{1:k}) ≈ Sim(u, v)',
        example: {
            title: '套娃嵌入截断演示',
            scenario: '比较两个 4 维向量的相似度',
            steps: [
                {
                    name: '原始长向量',
                    values: [
                        'u = [0.9, 0.1, 0.05, 0.02]',
                        'v = [0.8, 0.2, 0.04, 0.01]'
                    ],
                    detail: '训练时强制主要信息集中在前两维'
                },
                {
                    name: '全维度相似度 (4维)',
                    calculation: '0.9×0.8 + 0.1×0.2 + ... ≈ 0.74',
                    result: 0.74
                },
                {
                    name: '截断后相似度 (2维)',
                    calculation: '0.9×0.8 + 0.1×0.2 = 0.72 + 0.02',
                    result: 0.74
                }
            ],
            interpretation: '截断一半维度后，相似度得分几乎不变！这意味着我们可以只存前几个维度，依然能保持检索效果。'
        }
    },
    'BiEncoder_Cosine': {
        formulaLatex: 'Cosine(A, B) = (A · B) / (||A|| × ||B||)',
        subFormulas: [
            { name: '点积', formula: 'A · B = Σ(aᵢ × bᵢ)' },
            { name: '向量模', formula: '||A|| = √(Σaᵢ²)' }
        ],
        example: {
            title: 'Bi-Encoder 余弦相似度计算',
            scenario: 'Query: "如何学习机器学习？"\nDocument: "机器学习入门指南"',
            steps: [
                {
                    name: '独立编码 (双塔结构)',
                    detail: 'Query 和 Document 分别通过各自的 Encoder (可共享权重)',
                    values: [
                        'Query 向量 A = [0.8, 0.3, 0.5]',
                        'Document 向量 B = [0.7, 0.4, 0.6]'
                    ]
                },
                {
                    name: '计算点积 (A · B)',
                    detail: '对应位置相乘然后求和',
                    calculation: '0.8×0.7 + 0.3×0.4 + 0.5×0.6 = 0.56 + 0.12 + 0.30',
                    result: 0.98
                },
                {
                    name: '计算向量模',
                    detail: '每个向量的长度（欧几里得范数）',
                    calculation: '||A|| = √(0.64+0.09+0.25) = √0.98 ≈ 0.99\n||B|| = √(0.49+0.16+0.36) = √1.01 ≈ 1.00',
                    values: ['||A|| ≈ 0.99', '||B|| ≈ 1.00']
                },
                {
                    name: '计算余弦相似度',
                    calculation: 'Cosine = 0.98 / (0.99 × 1.00) ≈ 0.99',
                    result: 0.99
                }
            ],
            interpretation: '余弦相似度 0.99 非常接近 1，说明这两个文本语义高度相关。Bi-Encoder 可以预先计算所有文档向量存入向量库，检索时只需在线计算 Query 向量，毫秒级完成百万级检索。'
        }
    },
    'ColBERT_MaxSim': {
        formulaLatex: 'Score = Σᵢ maxⱼ(qᵢ · dⱼ)',
        subFormulas: [
            { name: 'MaxSim', formula: '每个 Query token 找 Doc tokens 中最相似的一个' },
            { name: '最终分数', formula: '所有 Query token 的 MaxSim 之和' }
        ],
        example: {
            title: 'ColBERT MaxSim 相似度计算',
            scenario: 'Query: "机器 学习" (2 tokens)\nDocument: "深度 学习 入门" (3 tokens)',
            steps: [
                {
                    name: '保留所有 Token 向量',
                    detail: '与 Bi-Encoder 压缩成单向量不同，ColBERT 保留每个 token 的向量',
                    values: [
                        'q₁("机器") = [0.9, 0.1]',
                        'q₂("学习") = [0.2, 0.8]',
                        'd₁("深度") = [0.8, 0.2]',
                        'd₂("学习") = [0.1, 0.9]',
                        'd₃("入门") = [0.3, 0.3]'
                    ]
                },
                {
                    name: '计算 q₁ 与所有 d 的相似度',
                    detail: '"机器" 分别和 "深度"、"学习"、"入门" 计算点积',
                    calculation: 'q₁·d₁ = 0.9×0.8 + 0.1×0.2 = 0.74\nq₁·d₂ = 0.9×0.1 + 0.1×0.9 = 0.18\nq₁·d₃ = 0.9×0.3 + 0.1×0.3 = 0.30',
                    result: 'MaxSim(q₁) = max(0.74, 0.18, 0.30) = 0.74'
                },
                {
                    name: '计算 q₂ 与所有 d 的相似度',
                    detail: '"学习" 分别和 "深度"、"学习"、"入门" 计算点积',
                    calculation: 'q₂·d₁ = 0.2×0.8 + 0.8×0.2 = 0.32\nq₂·d₂ = 0.2×0.1 + 0.8×0.9 = 0.74\nq₂·d₃ = 0.2×0.3 + 0.8×0.3 = 0.30',
                    result: 'MaxSim(q₂) = max(0.32, 0.74, 0.30) = 0.74'
                },
                {
                    name: '求和得到最终分数',
                    detail: '将每个 Query token 的 MaxSim 相加',
                    calculation: 'Score = MaxSim(q₁) + MaxSim(q₂) = 0.74 + 0.74',
                    result: 1.48
                }
            ],
            interpretation: 'ColBERT 的优势在于保留了 token 级别的信息。"机器"找到了与"深度"的关联(0.74)，"学习"找到了与"学习"的精确匹配(0.74)。这种细粒度交互比 Bi-Encoder 压缩成单向量更精确，但存储成本更高。'
        }
    },
    'CrossEncoder_Forward': {
        formulaLatex: 'Score = σ(W · BERT([CLS] Q [SEP] D [SEP]))',
        subFormulas: [
            { name: '拼接', formula: '[CLS] Query [SEP] Document [SEP]' },
            { name: '联合编码', formula: 'Query 和 Doc 每个 token 互相 Attend' },
            { name: '分类头', formula: 'Linear + Sigmoid → 0~1 分数' }
        ],
        example: {
            title: 'Cross-Encoder 联合编码计算',
            scenario: 'Query: "如何学习机器学习"\nDocument: "机器学习入门指南"',
            steps: [
                {
                    name: '拼接输入序列',
                    detail: '将 Query 和 Document 拼接成一个完整序列',
                    calculation: '[CLS] 如何 学习 机器 学习 [SEP] 机器 学习 入门 指南 [SEP]',
                    values: ['共 11 个 tokens']
                },
                {
                    name: '联合编码 (Self-Attention)',
                    detail: 'Query 中的"学习"可以直接 Attend 到 Doc 中的"学习"！\n这是 Cross-Encoder 精度高的核心原因。',
                    values: [
                        '"学习"(Query) ←→ "学习"(Doc): 高注意力权重',
                        '"机器"(Query) ←→ "机器"(Doc): 高注意力权重',
                        '"如何"(Query) ←→ "入门"(Doc): 中等注意力权重'
                    ]
                },
                {
                    name: '提取 [CLS] 向量',
                    detail: '[CLS] token 聚合了整个序列的语义信息',
                    calculation: 'CLS_vector = [0.92, 0.15, 0.88, 0.73, ...]',
                    values: ['维度: 768 (BERT-base)']
                },
                {
                    name: '通过分类头输出分数',
                    detail: 'Linear 层 + Sigmoid 激活',
                    calculation: 'Score = Sigmoid(W · CLS + b) = Sigmoid(2.05) ≈ 0.89',
                    result: 0.89
                }
            ],
            interpretation: 'Cross-Encoder 通过联合编码让 Query 和 Doc 深度交互，精度最高。但代价是无法预计算——每对 (Query, Doc) 都需要重新过一遍 Transformer。适合作为 Bi-Encoder 召回后的精排阶段。'
        }
    }
};


/**
 * MTEB Embedding 任务类型数据
 * 包含 8 种核心任务类型的定义、示例和评估指标
 */

export const taskTypesData = [
    {
        id: 'retrieval',
        name: 'Retrieval',
        nameCn: '检索',
        icon: '🔍',
        color: '#6366f1',
        description: '从海量文档库中找出与查询最相关的文档',
        analogy: '想象你在一个藏书千万的图书馆里。检索任务就是你对图书管理员说："我想找关于二战经济影响的书。"管理员需要瞬间跑遍所有书架，从一千万本书中挑出最相关的 10 本放到你面前。',
        useCase: 'RAG 系统中最基础、最核心的环节。无论是企业知识库问答、法律文书检索，还是电商平台的商品搜索，本质上都是 Retrieval 任务。',
        dataStructure: {
            type: 'multi-part',
            parts: [
                {
                    name: 'Corpus (文档库)',
                    format: 'json',
                    example: `{
  "doc_id_1": {
    "title": "PHENAKI: VARIABLE LENGTH VIDEO GENERATION",
    "text": "We present Phenaki, a model capable of realistic video synthesis..."
  },
  "doc_id_2": {
    "title": "MODE REGULARIZED GENERATIVE ADVERSARIAL NETWORKS",
    "text": "Although Generative Adversarial Networks achieve state-of-the-art..."
  }
}`
                },
                {
                    name: 'Queries (查询集)',
                    format: 'json',
                    example: `{
  "q_1": "text to video generation models",
  "q_2": "stability of GAN training"
}`
                },
                {
                    name: 'Qrels (答案映射)',
                    format: 'json',
                    example: `{
  "q_1": {"doc_id_1": 1},  // 1 表示相关
  "q_2": {"doc_id_2": 1}
}`
                }
            ]
        },
        metrics: [
            {
                name: 'nDCG@k',
                fullName: 'Normalized Discounted Cumulative Gain',
                description: '归一化折损累计增益，衡量排序质量的黄金标准',
                explanation: '位置越靠前，分数越高。第 1 位满分，第 10 位打骨折，第 11 位直接 0 分。',
                formula: 'NDCG = DCG / IDCG',
                importance: 'primary'
            },
            {
                name: 'MAP@k',
                fullName: 'Mean Average Precision',
                description: '平均精度均值，关注检索出所有相关文档的能力',
                formula: 'AP = Σ(P@k × rel(k)) / 相关文档数',
                importance: 'secondary'
            },
            {
                name: 'Recall@k',
                fullName: 'Recall at k',
                description: '召回率，前 k 个结果中检索到的相关文档占总相关文档的比例',
                formula: 'Recall@k = 前k个相关数 / 总相关数',
                importance: 'secondary'
            },
            {
                name: 'MRR@k',
                fullName: 'Mean Reciprocal Rank',
                description: '平均倒数排名，衡量第一个正确答案出现的位置',
                formula: 'MRR = 1 / rank_first',
                importance: 'secondary'
            }
        ]
    },
    {
        id: 'classification',
        name: 'Classification',
        nameCn: '分类',
        icon: '🏷️',
        color: '#22d3ee',
        description: '将文本分配到预定义的类别中',
        analogy: '这就像是一个自动分拣机。传送带上运来各种各样的水果（文本），分拣机需要根据它们的外观特征（向量），把它们准确地踢进贴有"苹果"、"香蕉"、"橘子"标签的篮子里。',
        useCase: 'RAG 预处理阶段的意图识别。当用户输入"我的订单怎么还没发货？"时，系统将其归类为"物流投诉"，从而调用物流查询 API，而不是去检索公司的"文化价值观"文档。',
        dataStructure: {
            type: 'table',
            headers: ['文本 (Text)', '标签 (Label)', '类别含义'],
            rows: [
                ['"This screen cracked after one day of use."', '0', 'Negative (差评)'],
                ['"The battery life is amazing, lasts all day."', '1', 'Positive (好评)'],
                ['"It\'s okay, nothing special."', '2', 'Neutral (中评)']
            ]
        },
        metrics: [
            {
                name: 'Accuracy',
                fullName: 'Accuracy',
                description: '准确率，答对的题数 / 总题数',
                formula: 'Accuracy = 正确预测数 / 总样本数',
                importance: 'primary'
            },
            {
                name: 'F1-Score',
                fullName: 'F1 Score',
                description: '精确率和召回率的调和平均，惩罚"无脑猜大类"的行为',
                explanation: '如果 100 条数据里只有 1 条是欺诈，模型全预测"正常"，准确率 99%，但 F1 会很低。',
                formula: 'F1 = 2 × (P × R) / (P + R)',
                importance: 'primary'
            }
        ]
    },
    {
        id: 'clustering',
        name: 'Clustering',
        nameCn: '聚类',
        icon: '🎯',
        color: '#f59e0b',
        description: '在没有标签的情况下发现数据的内在结构',
        analogy: '给你一堆散落在地上的乐高积木，没有说明书，也不告诉你有哪些种类。你需要凭直觉把形状、颜色相似的积木堆在一起。',
        useCase: 'RAG 系统的知识库整理和话题发现。如果导入了 10 万条历史客服记录，通过 Embedding 聚类，你会发现有一大堆向量聚在一起，分析后发现它们都是关于"登录验证码收不到"的问题。',
        dataStructure: {
            type: 'table',
            headers: ['标题 (Text)', '隐藏标签 (Label)'],
            rows: [
                ['"Attention Is All You Need"', 'NLP'],
                ['"Deep Residual Learning for Image Recognition"', 'CV (计算机视觉)'],
                ['"BERT: Pre-training of Deep Bidirectional Transformers"', 'NLP'],
                ['"YOLO: You Only Look Once"', 'CV']
            ],
            note: '隐藏标签仅用于评估，模型训练时不可见'
        },
        metrics: [
            {
                name: 'V-Measure',
                fullName: 'V-Measure',
                description: '同质性和完整性的加权平均',
                explanation: 'Homogeneity (纯度): 每个簇里是不是只有一种类型？\nCompleteness (完整性): 同一类型是否都在同一个簇里？',
                formula: 'V = 2 × (H × C) / (H + C)',
                importance: 'primary'
            }
        ]
    },
    {
        id: 'pair-classification',
        name: 'Pair Classification',
        nameCn: '成对分类',
        icon: '🔗',
        color: '#ec4899',
        description: '判断两个文本是否语义相同',
        analogy: '这是个"找茬"游戏。给你两句话，你只需要回答：YES（它们意思一样）或 NO（它们意思不同）。这比检索简单，因为是一对一的比对，但要求极高的辨识度。',
        useCase: 'RAG 中的数据清洗与去重。在构建向量数据库时，企业文档中往往包含大量重复内容。Pair Classification 能够识别出这些语义重复的文本，进行合并或剔除。',
        dataStructure: {
            type: 'table',
            headers: ['句子 A', '句子 B', '标签 (Label)'],
            rows: [
                ['"The train was late." (火车晚点了)', '"The train was not late." (火车没晚点)', '0 (不同)'],
                ['"How to install Python?"', '"Python installation guide."', '1 (相同)']
            ],
            note: '劣质模型使用"词袋模型"思维，看到两个句子单词重合度很高就认为相似。优秀模型能捕捉到 "not" 带来的语义翻转。'
        },
        metrics: [
            {
                name: 'AP',
                fullName: 'Average Precision',
                description: '平均精度，衡量模型分数分布是否合理',
                explanation: '模型输出相似度分数（如 0.85），AP 衡量的是：无论阈值设在 0.9 还是 0.5，正样本的分数是否总比负样本高？',
                formula: 'AP = ∫ P(r) dr',
                importance: 'primary'
            },
            {
                name: 'F1',
                fullName: 'F1 Score at Best Threshold',
                description: '最佳阈值下的 F1 分数',
                importance: 'secondary'
            }
        ]
    },
    {
        id: 'sts',
        name: 'STS',
        nameCn: '语义文本相似度',
        icon: '📏',
        color: '#8b5cf6',
        description: '预测两个句子的语义相似程度（0-5 分）',
        analogy: '如果说 Pair Classification 是"非黑即白"的开关，STS 就是一个"调光器"。它不只问"是否相似"，而是问"有多相似？"通常采用 0 到 5 分的连续打分制。',
        useCase: '幻觉检测与质量评估。在 RAG 生成答案后，可以计算"检索到的原文"与"LLM 生成的答案"之间的 STS 分数。如果分数过低（例如 1.5/5.0），说明 LLM 生成的内容可能脱离了依据，存在幻觉风险。',
        dataStructure: {
            type: 'table',
            headers: ['句子 A', '句子 B', '分数 (0-5)'],
            rows: [
                ['"A man is playing a guitar."', '"A man is playing a flute."', '2.5 (动作相似，物体不同)'],
                ['"A man is playing a guitar."', '"A person is strumming an instrument."', '4.2 (语义高度重合)'],
                ['"A man is playing a guitar."', '"A dog eats food."', '0.0 (无关)']
            ]
        },
        metrics: [
            {
                name: 'Spearman',
                fullName: 'Spearman Rank Correlation',
                description: '斯皮尔曼等级相关系数，衡量排名的一致性',
                explanation: '我们不要求模型输出的绝对分数与人类打分完全一致，看重的是排名顺序。如果人类认为 A-B 相似度 > C-D，模型也必须如此。',
                formula: 'ρ = 1 - (6Σd²) / (n(n²-1))',
                importance: 'primary'
            },
            {
                name: 'Pearson',
                fullName: 'Pearson Correlation',
                description: '皮尔逊相关系数，衡量线性相关性',
                importance: 'secondary'
            }
        ]
    },
    {
        id: 'summarization',
        name: 'Summarization',
        nameCn: '摘要评估',
        icon: '📝',
        color: '#14b8a6',
        description: '评估摘要是否准确覆盖了原文的核心信息',
        analogy: '这是一种特殊的 STS 任务。它的目的是衡量"浓缩后的汁"是否还保留着"水果的原味"。给定一篇长文和一个摘要，Embedding 模型需要判断摘要是否准确覆盖了长文的核心信息。',
        useCase: '长文档处理。在 RAG 中，如果文档太长（如 50 页的财报），我们通常会先对其进行摘要，然后对摘要进行 Embedding 索引（Small-to-Big 检索策略）。如果 Embedding 模型认为摘要与原文的语义距离过远，说明信息丢失严重。',
        dataStructure: {
            type: 'description',
            content: '数据集包含：\n• 原始长文档\n• 机器生成的摘要\n• 人类写的黄金摘要\n\n模型计算 Vector(机器摘要) 与 Vector(人类摘要) 或 Vector(原文) 之间的相似度。'
        },
        metrics: [
            {
                name: 'Spearman',
                fullName: 'Spearman Correlation',
                description: '通过对比 Embedding 相似度与人类对摘要质量的打分，验证模型是否能像人一样感知内容的完整性',
                importance: 'primary'
            }
        ]
    },
    {
        id: 'multilabel',
        name: 'Multilabel Classification',
        nameCn: '多标签分类',
        icon: '🏷️🏷️',
        color: '#f472b6',
        description: '为文本分配多个标签（多选题）',
        analogy: '普通分类是"单选题"，多标签分类是"多选题"。一篇文章可以同时属于"财经"、"科技"和"突发新闻"。',
        useCase: '元数据自动标记。在 RAG 入库环节，为了增强混合检索的效果，我们往往需要给文档打上各种 Tag。利用 Embedding 进行多标签分类，可以自动化地给海量文档打标，比如给一条用户评论同时打上 Urgent（紧急）、Bug Report（故障）和 UI/UX（界面相关）的标签。',
        dataStructure: {
            type: 'table',
            headers: ['文本', '标签集'],
            rows: [
                ['"You are stupid and I hate this app!"', '["toxic", "insult", "negative"]'],
                ['"Great product, highly recommend!"', '["positive"]'],
                ['"The app crashes on startup, very frustrating!"', '["bug_report", "negative", "urgent"]']
            ]
        },
        metrics: [
            {
                name: 'LRAP',
                fullName: 'Label Ranking Average Precision',
                description: '标签排序平均精度，要求正确标签的置信度排在错误标签前面',
                importance: 'primary'
            },
            {
                name: 'F1 Macro',
                fullName: 'Macro F1 Score',
                description: '所有标签 F1 分数的宏平均',
                importance: 'secondary'
            }
        ]
    },
    {
        id: 'reranking',
        name: 'Reranking',
        nameCn: '重排序',
        icon: '🥇',
        color: '#ef4444',
        description: '对检索召回的候选列表进行二次精排',
        analogy: '如果 Retrieval 是"海选"，Reranking 就是"决赛"。Retrieval 使用双编码器（Bi-Encoder），只能独立看 Query 和 Document，虽快但不够精细。Reranking 使用交叉编码器（Cross-Encoder），把 Query 和 Document 拼在一起逐字逐句地读，能捕捉到非常微妙的逻辑关系，但速度很慢。',
        useCase: '提升 RAG 最终精度。通常流程是：先用 Retrieval 快速捞出前 100 个文档，再用 Reranking 模型精细打分，选出前 3 个给 LLM。这是提升 RAG 效果最立竿见影的手段（通常能提升 10% 以上的准确率）。',
        dataStructure: {
            type: 'description',
            content: '数据结构与 Retrieval 类似，但评估时模型不是对整个语料库排序，而是重点对 Retrieval 阶段召回的"候选列表"进行二次排序。\n\n输入：Query + 候选文档列表 [Doc1, Doc2, ..., Doc100]\n输出：重新排序的列表'
        },
        metrics: [
            {
                name: 'MAP',
                fullName: 'Mean Average Precision',
                description: '关注整个列表的质量，奖励那些把所有相关文档都排在列表顶部的模型',
                explanation: '在 Reranking 阶段，我们对 MAP 的要求比 Retrieval 阶段更苛刻，因为这是最后一道关卡。',
                importance: 'primary'
            },
            {
                name: 'nDCG@10',
                fullName: 'Normalized DCG at 10',
                description: '前 10 个结果的归一化 DCG',
                importance: 'secondary'
            }
        ]
    }
];

export default taskTypesData;

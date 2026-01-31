/**
 * 评估指标动态计算演示数据
 * 每个指标包含完整的公式、计算步骤和交互式示例
 */

export const metricCalculationsData = {
    // nDCG@k 计算演示
    'nDCG@k': {
        formulaLatex: 'nDCG@k = DCG@k / IDCG@k',
        subFormulas: [
            { name: 'DCG@k', formula: 'DCG@k = Σᵢ₌₁ᵏ (relᵢ / log₂(i+1))' },
            { name: 'IDCG@k', formula: 'IDCG@k = DCG of ideal ranking' }
        ],
        example: {
            title: '检索结果排序评估',
            scenario: '用户查询: "机器学习入门教程"',
            k: 5,
            // 模型返回的结果及其相关性分数 (0-3 scale)
            modelResults: [
                { rank: 1, doc: 'Python 机器学习实战', relevance: 3, isRelevant: true },
                { rank: 2, doc: 'Web 开发指南', relevance: 0, isRelevant: false },
                { rank: 3, doc: '深度学习基础', relevance: 2, isRelevant: true },
                { rank: 4, doc: 'JavaScript 教程', relevance: 0, isRelevant: false },
                { rank: 5, doc: 'AI 概论', relevance: 1, isRelevant: true }
            ],
            // 理想排序
            idealResults: [
                { rank: 1, doc: 'Python 机器学习实战', relevance: 3 },
                { rank: 2, doc: '深度学习基础', relevance: 2 },
                { rank: 3, doc: 'AI 概论', relevance: 1 },
                { rank: 4, doc: 'Web 开发指南', relevance: 0 },
                { rank: 5, doc: 'JavaScript 教程', relevance: 0 }
            ],
            steps: [
                {
                    name: '计算 DCG@5',
                    calculation: '3/log₂(2) + 0/log₂(3) + 2/log₂(4) + 0/log₂(5) + 1/log₂(6)',
                    values: ['3/1 = 3.00', '0/1.58 = 0', '2/2 = 1.00', '0/2.32 = 0', '1/2.58 = 0.39'],
                    result: 4.39
                },
                {
                    name: '计算 IDCG@5 (理想排序)',
                    calculation: '3/log₂(2) + 2/log₂(3) + 1/log₂(4) + 0/log₂(5) + 0/log₂(6)',
                    values: ['3/1 = 3.00', '2/1.58 = 1.26', '1/2 = 0.50', '0/2.32 = 0', '0/2.58 = 0'],
                    result: 4.76
                },
                {
                    name: '计算 nDCG@5',
                    calculation: 'DCG@5 / IDCG@5 = 4.39 / 4.76',
                    result: 0.92
                }
            ]
        }
    },

    // MAP@k 计算演示
    'MAP@k': {
        formulaLatex: 'MAP@k = (1/|Q|) × Σq∈Q AP(q)',
        subFormulas: [
            { name: 'AP', formula: 'AP = Σᵢ₌₁ᵏ (P@i × rel(i)) / min(k, R)' },
            { name: 'P@i', formula: 'P@i = 前i个结果中相关文档数 / i' }
        ],
        example: {
            title: '多查询平均精度',
            scenario: '评估模型在 2 个查询上的表现',
            queries: [
                {
                    query: 'Q1: Python 教程',
                    totalRelevant: 3,
                    results: [
                        { rank: 1, doc: 'Doc A', relevant: true },
                        { rank: 2, doc: 'Doc B', relevant: false },
                        { rank: 3, doc: 'Doc C', relevant: true },
                        { rank: 4, doc: 'Doc D', relevant: false },
                        { rank: 5, doc: 'Doc E', relevant: true }
                    ],
                    precisions: [
                        { rank: 1, precision: 1.0, isRelevant: true, included: true },
                        { rank: 2, precision: 0.5, isRelevant: false, included: false },
                        { rank: 3, precision: 0.67, isRelevant: true, included: true },
                        { rank: 4, precision: 0.5, isRelevant: false, included: false },
                        { rank: 5, precision: 0.6, isRelevant: true, included: true }
                    ],
                    ap: 0.76
                },
                {
                    query: 'Q2: 深度学习',
                    totalRelevant: 2,
                    results: [
                        { rank: 1, doc: 'Doc F', relevant: true },
                        { rank: 2, doc: 'Doc G', relevant: true },
                        { rank: 3, doc: 'Doc H', relevant: false },
                        { rank: 4, doc: 'Doc I', relevant: false },
                        { rank: 5, doc: 'Doc J', relevant: false }
                    ],
                    precisions: [
                        { rank: 1, precision: 1.0, isRelevant: true, included: true },
                        { rank: 2, precision: 1.0, isRelevant: true, included: true },
                        { rank: 3, precision: 0.67, isRelevant: false, included: false },
                        { rank: 4, precision: 0.5, isRelevant: false, included: false },
                        { rank: 5, precision: 0.4, isRelevant: false, included: false }
                    ],
                    ap: 1.0
                }
            ],
            steps: [
                {
                    name: 'Q1 的 AP 计算',
                    calculation: 'AP = (1.0 + 0.67 + 0.6) / 3',
                    detail: '只在相关文档位置计算 P@k: 位置1、3、5',
                    result: 0.76
                },
                {
                    name: 'Q2 的 AP 计算',
                    calculation: 'AP = (1.0 + 1.0) / 2',
                    detail: '相关文档都在前两位，完美！',
                    result: 1.0
                },
                {
                    name: '计算 MAP',
                    calculation: 'MAP = (0.76 + 1.0) / 2',
                    result: 0.88
                }
            ]
        }
    },

    // Recall@k 计算演示
    'Recall@k': {
        formulaLatex: 'Recall@k = |检索到的相关文档| / |所有相关文档|',
        example: {
            title: '召回率计算',
            scenario: '数据库中共有 10 个相关文档',
            totalRelevant: 10,
            k: 5,
            retrievedDocs: [
                { rank: 1, doc: 'Doc A', relevant: true },
                { rank: 2, doc: 'Doc B', relevant: true },
                { rank: 3, doc: 'Doc C', relevant: false },
                { rank: 4, doc: 'Doc D', relevant: true },
                { rank: 5, doc: 'Doc E', relevant: false }
            ],
            steps: [
                {
                    name: '统计 Top-5 中的相关文档',
                    calculation: '位置 1, 2, 4 的文档相关',
                    result: 3
                },
                {
                    name: '计算 Recall@5',
                    calculation: '3 / 10',
                    result: 0.30
                }
            ],
            interpretation: '模型在前 5 个结果中找到了 30% 的相关文档'
        }
    },

    // MRR 计算演示
    'MRR@k': {
        formulaLatex: 'MRR = (1/|Q|) × Σq∈Q (1/rankq)',
        example: {
            title: '平均倒数排名计算',
            scenario: '评估模型在 3 个查询上的表现',
            queries: [
                { query: 'Q1', firstRelevantRank: 1, reciprocal: 1.0 },
                { query: 'Q2', firstRelevantRank: 3, reciprocal: 0.33 },
                { query: 'Q3', firstRelevantRank: 2, reciprocal: 0.5 }
            ],
            steps: [
                {
                    name: '计算每个查询的倒数排名',
                    values: ['Q1: 1/1 = 1.0', 'Q2: 1/3 = 0.33', 'Q3: 1/2 = 0.5']
                },
                {
                    name: '计算 MRR',
                    calculation: '(1.0 + 0.33 + 0.5) / 3',
                    result: 0.61
                }
            ]
        }
    },

    // Accuracy 计算演示
    'Accuracy': {
        formulaLatex: 'Accuracy = (TP + TN) / (TP + TN + FP + FN)',
        example: {
            title: '分类准确率计算',
            scenario: '情感分类任务：10 条评论',
            predictions: [
                { text: '产品很棒', actual: 'Positive', predicted: 'Positive', correct: true },
                { text: '质量太差', actual: 'Negative', predicted: 'Negative', correct: true },
                { text: '一般般吧', actual: 'Neutral', predicted: 'Positive', correct: false },
                { text: '超级喜欢', actual: 'Positive', predicted: 'Positive', correct: true },
                { text: '退货了', actual: 'Negative', predicted: 'Negative', correct: true },
                { text: '还行', actual: 'Neutral', predicted: 'Neutral', correct: true },
                { text: '垃圾', actual: 'Negative', predicted: 'Positive', correct: false },
                { text: '好用', actual: 'Positive', predicted: 'Positive', correct: true },
                { text: '不推荐', actual: 'Negative', predicted: 'Negative', correct: true },
                { text: '太棒了', actual: 'Positive', predicted: 'Positive', correct: true }
            ],
            steps: [
                {
                    name: '统计正确预测数',
                    calculation: '8 个正确 (✓)',
                    result: 8
                },
                {
                    name: '计算 Accuracy',
                    calculation: '8 / 10',
                    result: 0.80
                }
            ]
        }
    },

    // F1-Score 计算演示
    'F1-Score': {
        formulaLatex: 'F1 = 2 × (Precision × Recall) / (Precision + Recall)',
        subFormulas: [
            { name: 'Precision', formula: 'P = TP / (TP + FP)' },
            { name: 'Recall', formula: 'R = TP / (TP + FN)' }
        ],
        example: {
            title: '欺诈检测 F1 计算',
            scenario: '100 条交易记录，其中 5 条是欺诈',
            confusionMatrix: {
                tp: 4,  // 正确检测的欺诈
                fp: 6,  // 误报（正常被判为欺诈）
                fn: 1,  // 漏报（欺诈被判为正常）
                tn: 89  // 正确判断的正常交易
            },
            steps: [
                {
                    name: '计算 Precision',
                    calculation: 'TP / (TP + FP) = 4 / (4 + 6)',
                    detail: '模型预测为欺诈的 10 条中，4 条真的是欺诈',
                    result: 0.40
                },
                {
                    name: '计算 Recall',
                    calculation: 'TP / (TP + FN) = 4 / (4 + 1)',
                    detail: '5 条真正的欺诈中，模型抓到了 4 条',
                    result: 0.80
                },
                {
                    name: '计算 F1',
                    calculation: '2 × (0.40 × 0.80) / (0.40 + 0.80)',
                    result: 0.53
                }
            ],
            comparison: {
                accuracy: 0.93,
                f1: 0.53,
                note: 'Accuracy 高达 93%，但 F1 只有 53%！这说明模型对少数类（欺诈）的识别能力很差。'
            }
        }
    },

    // V-Measure 计算演示
    'V-Measure': {
        formulaLatex: 'V = 2 × (H × C) / (H + C)',
        subFormulas: [
            { name: 'Homogeneity (H)', formula: 'H = 1 - H(C|K) / H(C)，衡量每个簇的纯度' },
            { name: 'Completeness (C)', formula: 'C = 1 - H(K|C) / H(K)，衡量同类样本的聚集度' },
            { name: 'H(X)', formula: 'H(X) = -Σ P(x) × log(P(x))，熵函数' }
        ],
        example: {
            title: '论文聚类评估 (高纯度但过度拆分)',
            scenario: '6 篇论文 (3 NLP, 3 CV) 被分成了 4 个簇',
            clusters: [
                {
                    name: 'Cluster A',
                    papers: [
                        { title: 'BERT 论文', trueLabel: 'NLP' },
                        { title: 'GPT 论文', trueLabel: 'NLP' }
                    ]
                },
                {
                    name: 'Cluster B',
                    papers: [
                        { title: 'T5 论文', trueLabel: 'NLP' }
                    ]
                },
                {
                    name: 'Cluster C',
                    papers: [
                        { title: 'ResNet 论文', trueLabel: 'CV' },
                        { title: 'ViT 论文', trueLabel: 'CV' }
                    ]
                },
                {
                    name: 'Cluster D',
                    papers: [
                        { title: 'YOLO 论文', trueLabel: 'CV' }
                    ]
                }
            ],
            contingencyTable: {
                headers: ['', 'Cluster A', 'Cluster B', 'Cluster C', 'Cluster D', '总计'],
                rows: [
                    ['NLP', 2, 1, 0, 0, 3],
                    ['CV', 0, 0, 2, 1, 3],
                    ['簇总计', 2, 1, 2, 1, 6]
                ]
            },
            steps: [
                {
                    name: '分析聚类分布',
                    detail: 'Cluster A, B 全是 NLP；Cluster C, D 全是 CV。\n每个簇都很纯，但同类文章被拆散了。',
                    calculation: '列联表展示了"纯而不全"的现象'
                },
                {
                    name: '计算类别熵 H(C)',
                    detail: 'NLP 占 0.5, CV 占 0.5',
                    calculation: 'H(C) = -0.5log(0.5) - 0.5log(0.5) = 1.0',
                    result: 1.0
                },
                {
                    name: '计算 Homogeneity (H)',
                    detail: '所有簇的条件熵 H(C|Ki) 均为 0 (因为每个簇只包含一种类别)',
                    calculation: 'H = 1 - 0 / 1.0 = 1.0 (完美纯度)',
                    result: 1.0
                },
                {
                    name: '计算 Completeness (C)',
                    detail: '需计算 H(K)≈1.92 和 H(K|C)≈0.92\n类被拆分导致 H(K|C) 较高',
                    calculation: 'C = 1 - 0.92 / 1.92 ≈ 0.52',
                    result: 0.52
                },
                {
                    name: '计算 V-Measure',
                    detail: 'H=1.0, C=0.52',
                    calculation: 'V = 2 × (1.0 × 0.52) / (1.0 + 0.52) = 1.04 / 1.52',
                    result: 0.68
                }
            ],
            interpretation: 'V = 0.68。此例清晰展示了差异：Homogeneity=1.0 说明没有"混淆"，但 Completeness=0.52 说明严重"碎片化"。'
        }
    },

    // AP (Pair Classification) 计算演示
    'AP': {
        formulaLatex: 'AP = Σ (Rn - Rn-1) × Pn',
        example: {
            title: '句对相似度 AP 计算',
            scenario: '5 对句子，按相似度分数排序',
            pairs: [
                { pairId: 1, score: 0.95, actualLabel: 1, prediction: '相似' },
                { pairId: 2, score: 0.82, actualLabel: 1, prediction: '相似' },
                { pairId: 3, score: 0.75, actualLabel: 0, prediction: '相似' },
                { pairId: 4, score: 0.60, actualLabel: 1, prediction: '相似' },
                { pairId: 5, score: 0.30, actualLabel: 0, prediction: '不相似' }
            ],
            steps: [
                {
                    name: '按分数排序后计算 Precision',
                    values: [
                        { rank: 1, precision: 1.0, recall: 0.33, isPositive: true },
                        { rank: 2, precision: 1.0, recall: 0.67, isPositive: true },
                        { rank: 3, precision: 0.67, recall: 0.67, isPositive: false },
                        { rank: 4, precision: 0.75, recall: 1.0, isPositive: true },
                        { rank: 5, precision: 0.6, recall: 1.0, isPositive: false }
                    ]
                },
                {
                    name: '计算 AP (只在正样本位置累加)',
                    calculation: '(1.0 + 1.0 + 0.75) / 3',
                    result: 0.92
                }
            ],
            interpretation: 'AP = 0.92 表示正样本的分数整体高于负样本，模型分数分布合理'
        }
    },

    // Spearman 计算演示
    'Spearman': {
        formulaLatex: 'ρ = 1 - (6 × Σdᵢ²) / (n × (n² - 1))',
        example: {
            title: '语义相似度排名相关性',
            scenario: '5 对句子的相似度评分',
            pairs: [
                { pairId: 'A-B', humanScore: 4.5, modelScore: 0.92, humanRank: 1, modelRank: 1 },
                { pairId: 'C-D', humanScore: 3.2, modelScore: 0.78, humanRank: 2, modelRank: 2 },
                { pairId: 'E-F', humanScore: 2.8, modelScore: 0.65, humanRank: 3, modelRank: 4 },
                { pairId: 'G-H', humanScore: 1.5, modelScore: 0.70, humanRank: 4, modelRank: 3 },
                { pairId: 'I-J', humanScore: 0.5, modelScore: 0.20, humanRank: 5, modelRank: 5 }
            ],
            steps: [
                {
                    name: '计算排名差 d',
                    values: [
                        { pair: 'A-B', d: 0, dSquared: 0 },
                        { pair: 'C-D', d: 0, dSquared: 0 },
                        { pair: 'E-F', d: -1, dSquared: 1 },
                        { pair: 'G-H', d: 1, dSquared: 1 },
                        { pair: 'I-J', d: 0, dSquared: 0 }
                    ]
                },
                {
                    name: '计算 Σd²',
                    calculation: '0 + 0 + 1 + 1 + 0 = 2',
                    result: 2
                },
                {
                    name: '计算 Spearman ρ',
                    calculation: '1 - (6 × 2) / (5 × (25 - 1)) = 1 - 12/120',
                    result: 0.90
                }
            ],
            interpretation: 'ρ = 0.90 表示模型排名与人类排名高度一致'
        }
    },

    // LRAP 计算演示
    'LRAP': {
        formulaLatex: 'LRAP = (1/n) × Σᵢ (1/|Yᵢ|) × Σⱼ∈Yᵢ (|Lᵢⱼ| / rankᵢⱼ)',
        example: {
            title: '多标签分类排序精度',
            scenario: '3 条评论的多标签分类',
            samples: [
                {
                    text: '"产品很好但物流太慢"',
                    trueLabels: ['positive', 'logistics'],
                    predictions: [
                        { label: 'positive', score: 0.9, rank: 1, isTrue: true },
                        { label: 'logistics', score: 0.7, rank: 2, isTrue: true },
                        { label: 'quality', score: 0.3, rank: 3, isTrue: false }
                    ],
                    lrap: 1.0
                },
                {
                    text: '"界面丑，又卡"',
                    trueLabels: ['ui', 'performance'],
                    predictions: [
                        { label: 'performance', score: 0.8, rank: 1, isTrue: true },
                        { label: 'quality', score: 0.6, rank: 2, isTrue: false },
                        { label: 'ui', score: 0.5, rank: 3, isTrue: true }
                    ],
                    lrap: 0.67
                }
            ],
            steps: [
                {
                    name: '样本 1 的 LRAP',
                    calculation: '(1/2) × (1/1 + 2/2) = 0.5 × 2 = 1.0',
                    detail: '两个真标签都排在错误标签前面'
                },
                {
                    name: '样本 2 的 LRAP',
                    calculation: '(1/2) × (1/1 + 2/3) ≈ 0.67',
                    detail: 'ui 标签排在 quality 后面，扣分'
                },
                {
                    name: '计算总 LRAP',
                    calculation: '(1.0 + 0.67) / 2',
                    result: 0.83
                }
            ]
        }
    },

    // MAP (Reranking) - 使用与 MAP@k 相同的逻辑
    'MAP': {
        formulaLatex: 'MAP = (1/|Q|) × Σq∈Q AP(q)',
        subFormulas: [
            { name: 'AP', formula: 'AP = Σᵢ (P@i × rel(i)) / R' }
        ],
        example: {
            title: '重排序 MAP 计算',
            scenario: 'Retrieval 召回 5 个文档，Reranker 重新排序',
            originalRanking: [
                { rank: 1, doc: 'Doc A', relevant: false, score: 0.9 },
                { rank: 2, doc: 'Doc B', relevant: true, score: 0.85 },
                { rank: 3, doc: 'Doc C', relevant: true, score: 0.8 },
                { rank: 4, doc: 'Doc D', relevant: false, score: 0.7 },
                { rank: 5, doc: 'Doc E', relevant: true, score: 0.6 }
            ],
            rerankedResult: [
                { rank: 1, doc: 'Doc B', relevant: true, score: 0.95 },
                { rank: 2, doc: 'Doc C', relevant: true, score: 0.88 },
                { rank: 3, doc: 'Doc E', relevant: true, score: 0.82 },
                { rank: 4, doc: 'Doc A', relevant: false, score: 0.5 },
                { rank: 5, doc: 'Doc D', relevant: false, score: 0.3 }
            ],
            steps: [
                {
                    name: 'Rerank 前的 AP',
                    calculation: 'P@2×1 + P@3×1 + P@5×1 = 0.5 + 0.67 + 0.6 / 3',
                    result: 0.59
                },
                {
                    name: 'Rerank 后的 AP',
                    calculation: 'P@1×1 + P@2×1 + P@3×1 = 1.0 + 1.0 + 1.0 / 3',
                    result: 1.0
                },
                {
                    name: '提升效果',
                    calculation: '(1.0 - 0.59) / 0.59 × 100%',
                    result: '69.5% 提升'
                }
            ]
        }
    },

    // Pearson 相关系数计算演示
    'Pearson': {
        formulaLatex: 'r = Σ(xᵢ - x̄)(yᵢ - ȳ) / √[Σ(xᵢ - x̄)² × Σ(yᵢ - ȳ)²]',
        subFormulas: [
            { name: 'x̄, ȳ', formula: '分别为人类评分和模型评分的均值' },
            { name: 'r 范围', formula: '-1 ≤ r ≤ 1，越接近 1 表示正相关越强' }
        ],
        example: {
            title: '语义相似度线性相关性',
            scenario: '5 对句子的相似度评分',
            pairs: [
                { pairId: 'A-B', humanScore: 4.5, modelScore: 0.92, humanRank: 1, modelRank: 1 },
                { pairId: 'C-D', humanScore: 3.2, modelScore: 0.78, humanRank: 2, modelRank: 2 },
                { pairId: 'E-F', humanScore: 2.8, modelScore: 0.65, humanRank: 3, modelRank: 4 },
                { pairId: 'G-H', humanScore: 1.5, modelScore: 0.70, humanRank: 4, modelRank: 3 },
                { pairId: 'I-J', humanScore: 0.5, modelScore: 0.20, humanRank: 5, modelRank: 5 }
            ],
            steps: [
                {
                    name: '计算均值',
                    calculation: 'x̄ = (4.5+3.2+2.8+1.5+0.5)/5 = 2.5\nȳ = (0.92+0.78+0.65+0.70+0.20)/5 = 0.65',
                    values: ['x̄ = 2.5', 'ȳ = 0.65']
                },
                {
                    name: '计算偏差乘积',
                    detail: '(xᵢ - x̄)(yᵢ - ȳ) 对每一对',
                    values: [
                        '(4.5-2.5)(0.92-0.65) = 0.54',
                        '(3.2-2.5)(0.78-0.65) = 0.09',
                        '(2.8-2.5)(0.65-0.65) = 0',
                        '(1.5-2.5)(0.70-0.65) = -0.05',
                        '(0.5-2.5)(0.20-0.65) = 0.90'
                    ],
                    calculation: 'Σ(xᵢ - x̄)(yᵢ - ȳ) = 0.54 + 0.09 + 0 - 0.05 + 0.90 = 1.48'
                },
                {
                    name: '计算标准差乘积',
                    calculation: '√[Σ(xᵢ - x̄)²] = √[4+0.49+0.09+1+4] = √9.58 = 3.10\n√[Σ(yᵢ - ȳ)²] = √[0.073+0.017+0+0.003+0.203] = √0.296 = 0.54',
                    result: '3.10 × 0.54 = 1.67'
                },
                {
                    name: '计算 Pearson r',
                    calculation: 'r = 1.48 / 1.67',
                    result: 0.89
                }
            ],
            interpretation: 'r = 0.89 表示模型评分与人类评分有很强的线性正相关关系'
        }
    },

    // F1 Score (Pair Classification) 计算演示
    'F1': {
        formulaLatex: 'F1 = 2 × (Precision × Recall) / (Precision + Recall)',
        subFormulas: [
            { name: 'Precision', formula: 'P = TP / (TP + FP)' },
            { name: 'Recall', formula: 'R = TP / (TP + FN)' }
        ],
        example: {
            title: '句对相似度分类 F1',
            scenario: '10 对句子，判断是否语义相同（阈值 = 0.7）',
            confusionMatrix: {
                tp: 4,  // 正确识别为相似
                fp: 1,  // 错误识别为相似（实际不相似）
                fn: 1,  // 错误识别为不相似（实际相似）
                tn: 4   // 正确识别为不相似
            },
            steps: [
                {
                    name: '统计混淆矩阵',
                    detail: '以阈值 0.7 进行二分类：\nTP=4: 正确预测为"相似"\nFP=1: 错误预测为"相似"\nFN=1: 遗漏的"相似"对\nTN=4: 正确预测为"不相似"'
                },
                {
                    name: '计算 Precision',
                    calculation: 'P = TP / (TP + FP) = 4 / (4 + 1) = 0.80',
                    detail: '预测为"相似"的 5 对中，4 对真的相似',
                    result: 0.80
                },
                {
                    name: '计算 Recall',
                    calculation: 'R = TP / (TP + FN) = 4 / (4 + 1) = 0.80',
                    detail: '5 对真正相似的句对中，模型找出了 4 对',
                    result: 0.80
                },
                {
                    name: '计算 F1',
                    calculation: 'F1 = 2 × (0.80 × 0.80) / (0.80 + 0.80) = 1.28 / 1.60',
                    result: 0.80
                }
            ],
            interpretation: 'F1 = 0.80 表示模型在精确率和召回率之间取得了良好的平衡'
        }
    },

    // F1 Macro 计算演示
    'F1 Macro': {
        formulaLatex: 'F1_Macro = (1/L) × Σₗ F1ₗ',
        subFormulas: [
            { name: 'L', formula: '标签总数' },
            { name: 'F1ₗ', formula: '第 l 个标签的 F1 分数' }
        ],
        example: {
            title: '多标签分类 F1 Macro',
            scenario: '5 条评论，3 个可能的标签',
            labels: ['bug_report', 'feature_request', 'positive'],
            samples: [
                { text: '登录崩溃了', trueLabels: ['bug_report'], predLabels: ['bug_report'] },
                { text: '希望加个夜间模式', trueLabels: ['feature_request'], predLabels: ['feature_request'] },
                { text: '很好用！希望加更多功能', trueLabels: ['positive', 'feature_request'], predLabels: ['positive'] },
                { text: '闪退问题', trueLabels: ['bug_report'], predLabels: ['bug_report', 'feature_request'] },
                { text: '界面漂亮', trueLabels: ['positive'], predLabels: ['positive'] }
            ],
            steps: [
                {
                    name: 'bug_report 的 F1',
                    detail: 'TP=2, FP=0, FN=0\nP = 2/2 = 1.0, R = 2/2 = 1.0',
                    calculation: 'F1 = 2×(1.0×1.0)/(1.0+1.0)',
                    result: 1.0
                },
                {
                    name: 'feature_request 的 F1',
                    detail: 'TP=1, FP=1, FN=1\nP = 1/2 = 0.5, R = 1/2 = 0.5',
                    calculation: 'F1 = 2×(0.5×0.5)/(0.5+0.5)',
                    result: 0.50
                },
                {
                    name: 'positive 的 F1',
                    detail: 'TP=2, FP=0, FN=0\nP = 2/2 = 1.0, R = 2/2 = 1.0',
                    calculation: 'F1 = 2×(1.0×1.0)/(1.0+1.0)',
                    result: 1.0
                },
                {
                    name: '计算 F1 Macro',
                    calculation: 'F1_Macro = (1.0 + 0.50 + 1.0) / 3',
                    result: 0.83
                }
            ],
            interpretation: 'F1 Macro = 0.83，feature_request 标签表现较差拉低了整体分数'
        }
    }
};

export default metricCalculationsData;

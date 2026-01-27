// Transformer 原理各章节的问题
// 用于 TransformerTab 组件

export const transformerQuestions = {
    tokenization: {
        title: 'Tokenization (分词)',
        // 学习前的兴趣引导问题
        warmupQuestions: [
            {
                question: '你觉得 ChatGPT 看到的"苹果"和你看到的"苹果"是一样的吗？',
                hook: '剧透：它看到的是一串神秘数字...'
            },
            {
                question: '为什么同样一句话，在不同的 AI 模型里可能被切成不同数量的"块"？',
                hook: '这直接影响了你的 API 账单！'
            }
        ],
        questions: [
            {
                question: '为什么模型不直接按"字"来切分，而要用 BPE 这样的算法？',
                hint: '想想词表大小和未知词的问题',
                answer: '按字切分会导致序列太长（效率低），按词切分会有大量未登录词（OOV）。BPE 是折中方案：常见词保持完整，罕见词拆成子词。这样词表大小可控，又能处理任意新词。'
            },
            {
                question: '同一个词在不同模型中的 Token ID 一样吗？为什么？',
                answer: '不一样。每个模型有自己的词表（Vocabulary），是在特定数据上训练出来的。GPT 和 LLaMA 的词表不同，所以同一个词的 ID 也不同。这就是为什么不能混用不同模型的 tokenizer。'
            },
            {
                question: '"苹果"这个词可能被切成几个 token？这取决于什么？',
                answer: '取决于 tokenizer 的词表。如果"苹果"作为整体出现在词表中，就是 1 个 token；如果词表中只有"苹"和"果"，就是 2 个 token；如果是字节级别的，可能更多。中文模型通常会把常见词作为整体。'
            }
        ]
    },

    embedding: {
        title: 'Embedding (词嵌入)',
        warmupQuestions: [
            {
                question: '如果让你用 3 个数字来描述"苹果"这个词，你会怎么选？',
                hook: 'AI 用的是 4096 个数字！'
            },
            {
                question: '为什么 AI 能知道"国王"和"王后"有关系，而和"香蕉"没关系？',
                hook: '秘密藏在向量空间里...'
            }
        ],
        questions: [
            {
                question: 'Token ID 是数字，Embedding 也是数字（向量），为什么需要 Embedding 这一步？',
                hint: '想想 Token ID 15329 和 15330 之间有什么关系',
                answer: 'Token ID 只是编号，15329 和 15330 之间没有语义关系。但 Embedding 向量可以编码语义：相似的词在向量空间中距离近。Embedding 把离散的 ID 转换成连续的、有语义的向量表示。'
            },
            {
                question: 'Embedding 的维度（如 4096）是怎么决定的？维度越大越好吗？',
                answer: '维度是超参数，需要在表达能力和计算成本之间权衡。维度太小，表达能力不足；维度太大，计算成本高且容易过拟合。通常大模型用更高维度（如 4096），小模型用较低维度（如 768）。'
            },
            {
                question: '两个词的 Embedding 向量"距离近"是什么意思？怎么度量？',
                answer: '常用余弦相似度来度量：计算两个向量夹角的余弦值。值越接近 1 表示越相似，越接近 0 表示无关，负数表示相反。例如"国王"和"王后"的余弦相似度会很高，和"苹果"的相似度会很低。'
            }
        ]
    },

    position: {
        title: 'Position (位置编码)',
        warmupQuestions: [
            {
                question: '"我爱你"和"你爱我"对 AI 来说有区别吗？如果有，它是怎么区分的？',
                hook: '提示：和"座位号"有关...'
            },
            {
                question: '为什么 Transformer 需要额外告诉模型"这个词在第几位"？RNN 不需要啊？',
                hook: '这是 Transformer 能并行计算的代价'
            }
        ],
        questions: [
            {
                question: 'Self-Attention 本身为什么不包含位置信息？',
                hint: '看看 Attention 的计算公式',
                answer: 'Attention 计算的是 Q 和 K 的点积，只关心"内容相关性"，不关心位置。把序列打乱后，Attention 的计算结果完全相同（只是顺序变了）。这和 RNN 不同，RNN 天然有位置信息（按顺序处理）。'
            },
            {
                question: 'RoPE（旋转位置编码）和原始 Transformer 的正弦位置编码有什么区别？',
                answer: '原始正弦编码是绝对位置（每个位置一个固定向量，加到 embedding 上）；RoPE 编码的是相对位置（通过旋转 Q 和 K 向量）。RoPE 的优势是：1）相对位置更符合语言理解；2）理论上可以外推到更长的序列。'
            },
            {
                question: '如果训练时最长是 4096 tokens，推理时能处理 8192 tokens 吗？',
                hint: '想想位置编码在超出训练范围时会怎样',
                answer: '原始正弦编码可以，因为公式可以计算任意位置。但效果可能下降，因为模型没见过长距离的注意力模式。RoPE 需要特殊处理（如 NTK 缩放、YaRN）才能较好地外推。这是长上下文研究的热点问题。'
            }
        ]
    },

    attention: {
        title: 'Self Attention (自注意力)',
        warmupQuestions: [
            {
                question: '当你读"他把苹果放在桌子上，因为它太重了"时，你怎么知道"它"指的是苹果而不是桌子？',
                hook: 'Attention 机制就是在模拟这个过程！'
            },
            {
                question: '为什么这个机制叫"注意力"？它和人类的注意力有什么相似之处？',
                hook: '想想你读书时眼睛是怎么"跳"的...'
            }
        ],
        questions: [
            {
                question: '在翻译"我是学生"为"I am a student"时，生成"student"这个词时，模型应该主要关注源句子中的哪些词？为什么？',
                answer: '应该主要关注"学"和"生"（因为它们组成"学生"）。这就是 Attention 的 Alignment（对齐）作用：让生成的目标词能够找到并关注源句子中语义相关的部分。'
            },
            {
                question: '为什么 Attention 的计算公式中要除以 √d_k（缩放因子）？如果不除会怎样？',
                hint: '想想 Softmax 对极端值的反应',
                answer: '当 d_k 较大时，Q 和 K 的点积结果会变得很大，导致 Softmax 后的分布非常尖锐（接近 one-hot）。这会使梯度变得很小，训练困难。除以 √d_k 是为了让点积结果保持在合理范围内，使 Softmax 输出更平滑。'
            },
            {
                question: '多头注意力（Multi-Head Attention）的"多头"有什么好处？',
                answer: '不同的头可以关注不同类型的关系：有的头关注语法关系，有的关注语义关系，有的关注位置关系。这就像多个专家从不同角度分析同一个问题，最后综合意见。比单头 Attention 的表达能力更强。'
            }
        ]
    },

    encoderDecoder: {
        title: 'Encoder vs Decoder',
        warmupQuestions: [
            {
                question: 'ChatGPT 只用了 Decoder，BERT 只用了 Encoder，它们各自放弃了什么能力？',
                hook: '这决定了它们擅长做什么任务'
            },
            {
                question: '为什么说 Decoder "不能偷看未来"？如果偷看了会怎样？',
                hook: '想想考试时提前知道答案...'
            }
        ],
        questions: [
            {
                question: 'Encoder 的注意力矩阵是"满的"，Decoder 的是"三角形的"，这是为什么？',
                hint: '想想 Encoder 和 Decoder 的任务有什么不同',
                answer: 'Encoder 做理解任务，需要看完整个句子才能理解，所以每个位置都能看到所有其他位置（双向）。Decoder 做生成任务，不能偷看未来要生成的词，所以只能看到之前的位置（因果遮罩，单向），形成下三角矩阵。'
            },
            {
                question: '为什么现代 LLM（如 GPT、LLaMA）都选择 Decoder-only 架构，而不是 Encoder-Decoder？',
                answer: '1）生成任务统一了理解和生成，生成能力隐含了理解能力；2）Decoder-only 结构更简单，易于扩展；3）KV Cache 优化在 Decoder 上更自然高效。Encoder-Decoder 在翻译等特定任务上仍有优势，但通用性不如 Decoder-only。'
            },
            {
                question: 'BERT 用的是 Encoder，GPT 用的是 Decoder，它们各自擅长什么任务？',
                answer: 'BERT（Encoder）擅长理解任务：情感分析、命名实体识别、问答抽取等，因为它能双向看上下文。GPT（Decoder）擅长生成任务：写作、对话、翻译等，因为它天然支持自回归生成。不过大规模 GPT 在理解任务上也表现很好。'
            }
        ]
    },

    output: {
        title: 'Output (输出)',
        warmupQuestions: [
            {
                question: 'AI 写作时，下一个字是"算"出来的还是"猜"出来的？',
                hook: '答案可能让你意外：两者都是！'
            },
            {
                question: '为什么同一个问题问 ChatGPT 两次，回答可能不一样？',
                hook: '秘密在于 Temperature 这个参数...'
            }
        ],
        questions: [
            {
                question: '模型输出的是一个概率分布（151936 个数），怎么从中选择最终的词？',
                hint: '想想贪婪采样和随机采样的区别',
                answer: '常见策略：1）贪婪采样（Greedy）：直接选概率最高的；2）随机采样：按概率随机选，可用 temperature 控制随机程度；3）Top-k/Top-p：只从前 k 个或累积概率达到 p 的候选中选。贪婪确定但可能无聊，随机多样但可能不通顺。'
            },
            {
                question: 'Temperature 参数是怎么影响生成结果的？温度高和温度低分别是什么效果？',
                answer: 'Temperature 缩放 logits：温度低（如 0.1）使分布更尖锐，倾向于选概率最高的词（更确定、更保守）；温度高（如 1.5）使分布更平坦，各词被选中的概率更均匀（更随机、更有创意）。温度 = 1 是原始分布。'
            },
            {
                question: 'LM Head 的权重可以和 Embedding 层共享（Tie Weights），这是为什么？有什么好处？',
                answer: 'Embedding 把 token 映射到向量，LM Head 把向量映射回 token，是互逆操作。共享权重强制两个方向的映射一致，减少参数量（对于大词表，这个层很大），还能起到正则化作用，通常能略微提升效果。'
            }
        ]
    }
};

export default transformerQuestions;

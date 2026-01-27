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
                question: '如果让你用 3 个维度来描述"苹果"这个词，你会怎么选？',
                hook: 'AI 用的是几千个（维度）数字！'
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
                question: '两个词的 Embedding 向量"距离近"是什么意思？怎么度量？',
                answer: '常用余弦相似度来度量：计算两个向量夹角的余弦值。值越接近 1 表示越相似，越接近 0 表示无关，负数表示相反。例如"国王"和"王后"的余弦相似度会很高，和"苹果"的相似度会很低。'
            }
        ]
    },

    position: {
        title: 'Position (位置编码)',
        warmupQuestions: [
            {
                question: '前面通过embedding，AI已经知道了一个词的语义，那么对于一句话，"我爱你"和"你爱我"对 AI 来说有区别吗？如果有，它是怎么区分的？',
                hook: '提示：和"座位号"有关...'
            },
        ],
        questions: [
            {
                question: '如果训练时最长是 4096 tokens，推理时能处理 8192 tokens 吗？效果怎么样？',
                hint: '想想位置编码在超出训练范围时会怎样',
                answer: '原始正弦编码可以，因为公式可以计算相对位置。但效果可能下降，因为模型没见过长距离的注意力模式。RoPE 需要特殊处理（如 NTK 缩放、YaRN）才能较好地外推。这是长上下文研究的热点问题。'
            }
        ]
    },

    attention: {
        title: 'Self Attention (自注意力)',
        warmupQuestions: [
            {
                question: '当你读"小明是个学术，他喜欢编程"时，你怎么知道"他"指的是小明？',
                hook: 'Attention 机制就是在模拟这个过程！'
            },
        ],
        questions: [
            {
                question: 'Q、K、V 三者之间是怎么交互的？用去图书馆图书馆找书的过程来模拟一下',
                answer: `用"图书馆找书"来类比：

**场景**：你想找一本关于"机器学习"的书

• **Q（Query，查询）**= 你的需求："我想找机器学习的书"
• **K（Key，键）**= 每本书的标签：["Python编程", "深度学习入门", "机器学习实战", "做菜指南"]
• **V（Value，值）**= 每本书的实际内容

**交互过程**：
1. **匹配**：Q 和每个 K 做点积，计算相关性分数
   - Q·K₁(Python编程) = 0.3（有点相关）
   - Q·K₂(深度学习入门) = 0.8（很相关）
   - Q·K₃(机器学习实战) = 0.95（非常相关）
   - Q·K₄(做菜指南) = 0.01（不相关）

2. **归一化**：Softmax 把分数变成权重（总和为1）
   - [0.1, 0.3, 0.55, 0.05]

3. **加权求和**：用权重对 V 求加权和
   - Output = 0.1×V₁ + 0.3×V₂ + 0.55×V₃ + 0.05×V₄

**结果**：输出主要包含"机器学习实战"的内容，也融合了一些"深度学习入门"的内容，这就是 Attention 的本质——根据相关性动态聚合信息！`
            }
        ]
    },

    encoderDecoder: {
        title: 'Encoder vs Decoder',
        warmupQuestions: [
            {
                question: 'GPT 只用了 Decoder，BERT 只用了 Encoder，它们各自放弃了什么能力？',
                hook: '这决定了它们擅长做什么任务'
            },
        ],
        questions: [
            {
                question: '为什么现代 LLM（如 GPT、LLaMA）都选择 Decoder-only 架构，而不是 Encoder-Decoder？',
                answer: '1）生成任务统一了理解和生成，生成能力隐含了理解能力；2）Decoder-only 结构更简单，易于扩展；3）KV Cache 优化在 Decoder 上更自然高效。Encoder-Decoder 在翻译等特定任务上仍有优势，但通用性不如 Decoder-only。'
            },
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
                hook: '秘密在于结果采样...'
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

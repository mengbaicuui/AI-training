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
                question: '同样一句话，在不同的模型里，表示的token数量一样多么？',
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
        ],
        questions: [
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
                answer: '绝对位置编码不行，相对位置编码可以。但效果可能下降，因为模型没见过长距离的注意力模式。RoPE这种现在最常用的位置编码需要通过（NTK 缩放、YaRN）才能较好地外推。'
            }
        ]
    },

    attention: {
        title: 'Self Attention (自注意力)',
        warmupQuestions: [
            {
                question: '当你读"小明是个学生，他喜欢编程"时，你怎么知道"他"指的是小明？',
                hook: 'Attention 机制就是在模拟这个过程！'
            },
        ],
        questions: [
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
                question: 'SFT阶段，指令部分是否需要在训练的时候计算loss',
                answer: '不需要，如果对指令部分也算loss，模型就会把精力花在背诵问题上，而不是学习如何回答问题。'
            },

        ]
    }
};

export default transformerQuestions;

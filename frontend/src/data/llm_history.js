// LLM 发展史的学前热身问题
export const llmHistoryWarmupQuestions = [
    {
        question: 'ChatGPT 是突然"蹦"出来的吗？还是有什么技术铺垫了它的诞生？',
        hook: '其实从 2015 年就开始埋伏笔了...'
    },
    {
        question: '为什么 2017 年的一篇论文标题敢叫"Attention Is All You Need"？它凭什么这么自信？',
        hook: '这篇论文改变了整个 AI 行业的走向'
    }
];

export const llmHistoryData = [
    {
        id: 'resnet',
        year: '2015',
        date: '2015-12',
        title: 'ResNet',
        subtitle: '深度学习的基石',
        icon: '🏔️',
        details: {
            description: '微软亚洲研究院何恺明团队提出残差网络 (ResNet)，通过跳跃连接 (Skip Connections) 解决了深层神经网络的梯度消失与退化问题，使得训练成百上千层的网络成为可能。',
            keyPoints: [
                '彻底解决了深度退化问题 (Degradation Problem)',
                '引入残差学习 (Residual Learning) 和跳跃连接',
                '为后来的 Transformer 架构奠定了深层网络训练的基础',
                'ImageNet 比赛冠军，验证了"越深越好"'
            ],
            impact: '确立了"残差连接"作为深度神经网络的标准组件，没有它就没有今天的万亿参数大模型。',
            questions: [
                {
                    question: '如果没有残差连接，为什么训练一个 100 层的网络反而可能比 50 层的效果更差？',
                    hint: '想想梯度在反向传播时会发生什么',
                    answer: '因为深度网络存在梯度消失和退化问题。没有残差连接时，梯度在反向传播过程中会逐层衰减，导致底层参数无法有效更新。残差连接提供了一条"高速公路"让梯度可以直接传递。'
                },
                {
                    question: 'ResNet 的 Skip Connection 和 Transformer 的 Residual Connection 有什么相似之处？它们解决的是同一个问题吗？',
                    answer: '是的，它们本质上是同一种技术。都是通过将输入直接加到输出上（x + F(x)），来解决深层网络的梯度消失和训练困难问题。Transformer 的每个子层都使用了这种残差连接。'
                }
            ]
        }
    },
    {
        id: 'transformer',
        year: '2017',
        date: '2017-06',
        title: 'Transformer',
        subtitle: 'Attention Is All You Need',
        icon: '⚡',
        details: {
            description: 'Google Brain 团队发表划时代论文，彻底抛弃了循环 (RNN) 和卷积 (CNN)，提出了完全基于注意力机制 (Attention Mechanism) 的 Transformer 架构。',
            keyPoints: [
                '实现了训练的大规模并行化',
                '自注意力 (Self-Attention) 机制有效捕捉长程依赖',
                '多头注意力 (Multi-Head Attention) 丰富了特征表达',
                '引入位置编码 (Positional Encoding) 解决序列顺序问题'
            ],
            impact: 'LLM 发展史上的"奇点"，提供了一种可无限扩展 (Scalable) 的计算范式，是所有现代大模型的鼻祖。',
            questions: [
                {
                    question: '为什么说 Transformer 实现了"大规模并行化"，而 RNN 做不到？',
                    hint: '想想 RNN 处理序列时的依赖关系',
                    answer: 'RNN 必须按顺序处理序列，第 t 个位置的输出依赖于第 t-1 个位置的隐状态，无法并行。而 Transformer 的 Self-Attention 可以同时计算所有位置之间的关系，不存在时序依赖，因此可以在 GPU 上高度并行。'
                },
                {
                    question: '如果 Transformer 没有位置编码，模型还能区分"我爱你"和"你爱我"吗？为什么？',
                    answer: '不能。Self-Attention 计算的是所有 token 之间的相关性，但它本身不包含任何位置信息。如果没有位置编码，"我爱你"和"你爱我"对于模型来说是完全相同的（因为 token 集合相同）。位置编码为每个 token 添加了"座位号"。'
                },
                {
                    question: '论文标题"Attention Is All You Need"是什么意思？真的只需要 Attention 吗？',
                    answer: '标题强调的是抛弃了 RNN/CNN，只用 Attention 作为核心计算单元。但实际上 Transformer 还需要 FFN（前馈网络）、残差连接、Layer Norm 等组件。Attention 负责"信息交互"，FFN 负责"特征变换"，两者缺一不可。'
                }
            ]
        }
    },
    {
        id: 'bert_gpt',
        year: '2018',
        date: '2018-10',
        title: 'BERT & GPT',
        subtitle: '路线之争：理解 vs 生成',
        icon: '🛤️',
        details: {
            description: 'NLP 领域分化为编码器 (BERT) 和解码器 (GPT) 两条路线。BERT 通过掩码语言建模 (MLM) 刷新了理解任务榜单，而 GPT 坚持自回归生成 (CLM) 路线。',
            keyPoints: [
                'BERT: 双向编码器，擅长理解任务 (如情感分析、NER)',
                'GPT: 单向解码器，坚持"下一个词预测"的生成范式',
                'BERT 在当时横扫 GLUE 榜单，成为 NLP 标准范式',
                'OpenAI 押注生成模型，认为生成包含理解'
            ],
            impact: '决定了 AI 发展的早期格局，虽然 BERT 曾短暂辉煌，但 GPT 的解码器路线最终在扩展性上胜出。',
            questions: [
                {
                    question: 'BERT 是"双向"的，GPT 是"单向"的，这里的"方向"指的是什么？',
                    hint: '想想模型在预测时能看到哪些信息',
                    answer: '方向指的是模型在处理某个位置时能看到的上下文范围。BERT 能同时看到左边和右边的词（双向），而 GPT 只能看到左边已经出现的词（单向/因果）。这是因为 GPT 要做生成任务，不能"偷看"未来。'
                },
                {
                    question: 'OpenAI 当时押注 GPT 路线，认为"生成包含理解"，这个判断对吗？为什么最终 GPT 路线胜出了？',
                    answer: '这个判断被证明是正确的。要生成连贯、有意义的文本，模型必须先理解上下文。而且 GPT 的自回归方式天然支持无限扩展：只要预测下一个词，就能处理任意长度。BERT 的 MLM 任务在扩展性上有天然限制。'
                }
            ]
        }
    },
    {
        id: 'gpt3',
        year: '2020',
        date: '2020-05',
        title: 'GPT-3',
        subtitle: 'In-Context Learning 范式转移',
        icon: '🧠',
        details: {
            description: 'OpenAI 发布 1750 亿参数的 GPT-3，展示了惊人的零样本/少样本学习能力，无需微调即可执行多种任务。验证了 Scaling Laws。',
            keyPoints: [
                '引入 In-Context Learning (ICL)，无需梯度更新即可学习',
                '催生了"提示工程" (Prompt Engineering) 新职业',
                '验证了模型性能与算力、数据、参数量的幂律关系',
                '展示了模型规模增大后的能力涌现'
            ],
            impact: '将 AI 开发模式从"微调"转变为"提示"，引发了全球大模型军备竞赛。',
            questions: [
                {
                    question: 'In-Context Learning（上下文学习）和传统的 Fine-tuning（微调）有什么本质区别？',
                    hint: '想想模型参数有没有改变',
                    answer: '微调会更新模型参数，需要梯度下降和反向传播；而 In-Context Learning 不改变模型参数，只是在输入中给几个示例，模型通过"阅读"这些示例来理解任务。这意味着 ICL 可以即时切换任务，无需重新训练。'
                },
                {
                    question: '什么是"能力涌现"（Emergent Abilities）？为什么小模型没有而大模型突然就有了？',
                    answer: '能力涌现是指某些能力在模型规模达到某个阈值之前几乎不存在，但一旦超过阈值就突然出现。比如 GPT-3 能做算术，但 GPT-2 不行。这可能是因为某些能力需要模型内部形成特定的"电路"或"子网络"，只有足够大的模型才能容纳这些结构。'
                },
                {
                    question: 'Scaling Laws（缩放定律）说的是什么？它对大模型发展有什么指导意义？',
                    answer: 'Scaling Laws 指出模型性能与参数量、数据量、计算量之间存在可预测的幂律关系。这意味着只要有足够的资源，就可以预测更大模型的性能。这给了各大公司"无脑堆算力"的信心，引发了大模型军备竞赛。'
                }
            ]
        }
    },
    {
        id: 'chatgpt',
        year: '2022',
        date: '2022-11',
        title: 'ChatGPT',
        subtitle: 'RLHF 与 AI 的引爆点',
        icon: '💬',
        details: {
            description: '基于 InstructGPT 的对话模型，利用 RLHF (人类反馈强化学习) 技术将模型与人类意图对齐，解决了胡言乱语和有害输出问题。',
            keyPoints: [
                'RLHF 三阶段：SFT、奖励模型、PPO 强化学习',
                '对话式交互界面极大地降低了使用门槛',
                '展现了惊人的通用能力，从写代码到写诗',
                '彻底确立了 Decoder-only 架构的统治地位'
            ],
            impact: 'AI 历史的分水岭，让大模型真正走进大众视野，不仅是技术突破，更是产品形态的胜利。',
            questions: [
                {
                    question: 'RLHF 的三个阶段（SFT → 奖励模型 → PPO）分别在做什么？为什么需要这三步？',
                    hint: '想想每一步解决了什么问题',
                    answer: 'SFT（有监督微调）让模型学会对话格式；奖励模型学习人类偏好，给回答打分；PPO 用这个打分信号来优化模型。三步缺一不可：SFT 给格式，奖励模型给标准，PPO 做优化。'
                },
                {
                    question: 'GPT-3 和 ChatGPT 的基座模型差不多，为什么 ChatGPT 的用户体验好这么多？',
                    answer: '关键在于 RLHF 对齐。GPT-3 只是预测下一个词，不理解用户意图；ChatGPT 通过 RLHF 学会了"听话"、"有帮助"、"安全"。同样的智力，但 ChatGPT 知道如何运用这个智力来帮助用户。'
                },
                {
                    question: 'ChatGPT 为什么是"产品形态的胜利"？技术上有什么突破吗？',
                    answer: '技术上 ChatGPT 并没有革命性突破（RLHF 在 InstructGPT 中已提出）。但它用对话界面让普通人也能使用 AI，极大降低了门槛。之前的 AI 需要写代码调用 API，现在只需要聊天。这是产品设计的胜利。'
                }
            ]
        }
    },
    {
        id: 'gpt4_moe',
        year: '2023',
        date: '2023-03',
        title: 'GPT-4 & MoE',
        subtitle: '混合专家架构时代',
        icon: '🎭',
        details: {
            description: '随着模型规模逼近万亿参数，单纯稠密模型不可持续。GPT-4 开启了混合专家 (MoE) 时代，实现了参数量与计算量的解耦。',
            keyPoints: [
                '稀疏激活：每次推理仅激活一小部分专家',
                '在保持万亿级知识容量的同时显著降低推理成本',
                '引入复杂的路由 (Router) 和负载均衡机制',
                '多模态能力的初步整合'
            ],
            impact: '解决了超大模型的经济性问题，使万亿参数模型的大规模商用部署成为可能。',
            questions: [
                {
                    question: 'MoE 的"稀疏激活"是什么意思？它如何实现"参数量与计算量的解耦"？',
                    hint: '想想总参数和每次推理用到的参数的区别',
                    answer: '稀疏激活指每次推理只激活一部分专家（如 128 选 8）。模型拥有万亿参数（知识容量大），但每次推理只用几十亿参数（计算成本低）。这样就实现了"存得多，算得少"的效果。'
                },
                {
                    question: '为什么 MoE 需要"负载均衡"？如果不做负载均衡会怎样？',
                    answer: '如果没有负载均衡，路由器可能总是选择同样几个"明星专家"，导致其他专家没人用（路由崩塌）。这浪费了模型容量，效果退化成小模型。负载均衡损失强制 token 均匀分配给各专家。'
                }
            ]
        }
    },
    {
        id: 'o1',
        year: '2024',
        date: '2024-09',
        title: 'OpenAI o1',
        subtitle: 'Test-Time Scaling 新范式',
        icon: '🤔',
        details: {
            description: 'OpenAI o1 模拟了人类的"系统2"慢思考，开启了 Test-Time Scaling (测试时扩展) 的新增长维度。',
            keyPoints: [
                '隐式思维链 (Latent Chain of Thought)',
                '推理能力与测试时消耗的算力成正比',
                '引入强化学习训练模型"如何思考"、拆解和纠错',
                '在数学和编程竞赛 (AIME, Codeforces) 上表现卓越'
            ],
            impact: '打破了预训练数据的天花板，证明了通过增加推理时间可以换取更高的智能上限。',
            questions: [
                {
                    question: '"系统1"和"系统2"思考是什么意思？o1 模拟的是哪种？',
                    hint: '想想快速直觉反应和深思熟虑的区别',
                    answer: '系统1 是快速、直觉的思考（如识别人脸）；系统2 是慢速、刻意的思考（如做数学题）。传统 LLM 更像系统1（快速输出），o1 通过长思维链模拟系统2（慢慢推理、反复验证）。'
                },
                {
                    question: 'Test-Time Scaling 和传统的 Train-Time Scaling 有什么区别？',
                    answer: 'Train-Time Scaling 是训练时投入更多算力（更大模型、更多数据）；Test-Time Scaling 是推理时投入更多算力（更长的思考时间）。前者是一次性投资，后者是按需付费。o1 证明了后者也能显著提升能力。'
                },
                {
                    question: '为什么 o1 在数学和编程上特别强，但在创意写作上提升不明显？',
                    answer: '数学和编程有明确的对错标准，可以通过 RL 给出清晰的奖励信号。而创意写作没有标准答案，很难定义什么是"更好的思考"。o1 的强化学习方法更适合有明确验证方式的任务。'
                }
            ]
        }
    },
    {
        id: 'deepseek_r1',
        year: '2025',
        date: '2025-01',
        title: 'DeepSeek R1',
        subtitle: '开源推理模型的顿悟',
        icon: '🐋',
        details: {
            description: 'DeepSeek R1 以完全开源和极低成本打破垄断，证明了纯强化学习 (Pure RL) 可以自发涌现出推理能力。',
            keyPoints: [
                'R1-Zero: 纯 RL 训练，无 SFT 数据也能涌现思维链',
                '通过蒸馏 (Distillation) 极大提升了小模型的推理能力',
                '采用 GRPO 算法替代 PPO，降低训练成本',
                '性能对标 o1，但完全开源 (Open Weights)'
            ],
            impact: '彻底改变了 AI 成本结构，让顶级智能变得极其廉价，推动了端侧推理的普及。',
            questions: [
                {
                    question: 'R1-Zero 没有用 SFT 数据，只用纯 RL 训练，为什么思维链能力会"自发涌现"？',
                    hint: '想想 RL 的奖励信号是什么',
                    answer: 'RL 的奖励只看最终答案对不对。模型发现"先想清楚再回答"能提高正确率，于是自发学会了输出思考过程。这说明思维链不是必须人工教的，只要有正确的激励机制，模型会自己发明这种策略。'
                },
                {
                    question: '蒸馏（Distillation）是如何让小模型获得大模型的推理能力的？',
                    answer: '蒸馏是让小模型学习大模型的输出（包括思维链过程），而不是从头学习。大模型相当于"名师"，小模型相当于"学生"。学生不需要自己摸索，直接模仿老师的解题过程，就能快速获得相似的能力。'
                },
                {
                    question: 'GRPO 相比 PPO 有什么优势？为什么能降低训练成本？',
                    answer: 'PPO 需要训练一个单独的 Critic 网络来估计价值函数，增加了复杂度和显存占用。GRPO（Group Relative Policy Optimization）通过组内相对比较来计算优势函数，省去了 Critic，简化了训练流程。'
                }
            ]
        }
    },
    {
        id: '2026_agents',
        year: '2026',
        date: '2026-01',
        title: '百模齐放',
        subtitle: '代理智能与极致效率',
        icon: '🤖',
        details: {
            description: '2026 年 AI 进化为智能体 (Agents)，Test-Time Scaling 深入人心。各大模型在特定赛道构建护城河，从聊天机器人跃迁为数字劳动力。',
            keyPoints: [
                'DeepSeek 3.2: 极致性价比 ($0.02/1M)',
                'GLM-4.7: 软件工程师代理，深度集成终端',
                'MiniMax 2.1: Vibe Coding 与多模态交互',
                'Qwen 3: 动态思考预算，可控推理深度',
                'Kimi K2: 万亿参数长程代理，科研全流程自动化'
            ],
            impact: '智能体不仅回答问题，更能规划、使用工具、自主纠错。算力即权力，效率即生存。',
            questions: [
                {
                    question: 'Agent（智能体）和普通的 LLM 有什么本质区别？',
                    hint: '想想 Agent 能做什么 LLM 做不了的事',
                    answer: '普通 LLM 只能对话，Agent 能"行动"。Agent 可以使用工具（搜索、写代码、调 API）、规划多步任务、根据环境反馈调整策略、自主纠错。它是 LLM + 工具 + 规划能力的组合。'
                },
                {
                    question: '"动态思考预算"是什么意思？为什么需要可控的推理深度？',
                    answer: '动态思考预算指模型根据问题难度自动调整思考时间。简单问题快速回答，复杂问题深度思考。这很重要因为：1）节省算力成本；2）提升用户体验（简单问题不需要等待）；3）在有限资源下最大化整体效率。'
                },
                {
                    question: '为什么 2026 年的 AI 竞争变成了"效率即生存"？',
                    answer: '因为模型能力趋于同质化（大家都很强），竞争焦点从"谁更聪明"转向"谁更便宜更快"。DeepSeek 以极低成本提供顶级能力，迫使所有玩家都必须提升效率。能力相同时，成本决定生死。'
                }
            ]
        }
    }
];

export default llmHistoryData;

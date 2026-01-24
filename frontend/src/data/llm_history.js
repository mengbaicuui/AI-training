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
            impact: '确立了"残差连接"作为深度神经网络的标准组件，没有它就没有今天的万亿参数大模型。'
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
            impact: 'LLM 发展史上的"奇点"，提供了一种可无限扩展 (Scalable) 的计算范式，是所有现代大模型的鼻祖。'
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
            impact: '决定了 AI 发展的早期格局，虽然 BERT 曾短暂辉煌，但 GPT 的解码器路线最终在扩展性上胜出。'
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
            impact: '将 AI 开发模式从"微调"转变为"提示"，引发了全球大模型军备竞赛。'
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
            impact: 'AI 历史的分水岭，让大模型真正走进大众视野，不仅是技术突破，更是产品形态的胜利。'
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
            impact: '解决了超大模型的经济性问题，使万亿参数模型的大规模商用部署成为可能。'
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
            impact: '打破了预训练数据的天花板，证明了通过增加推理时间可以换取更高的智能上限。'
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
            impact: '彻底改变了 AI 成本结构，让顶级智能变得极其廉价，推动了端侧推理的普及。'
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
            impact: '智能体不仅回答问题，更能规划、使用工具、自主纠错。算力即权力，效率即生存。'
        }
    }
];

export default llmHistoryData;

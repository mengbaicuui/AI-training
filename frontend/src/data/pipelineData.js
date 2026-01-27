// LLM 训练范式的学前热身问题
export const pipelineWarmupQuestions = [
    {
        question: 'ChatGPT 读了那么多书，为什么还需要人类来"调教"它？',
        hook: '预训练只是开始，后训练才是灵魂...'
    },
    {
        question: '为什么有些 AI 回答很专业但容易"胡说八道"，有些则很靠谱？训练方式有什么不同？',
        hook: '秘密在于 SFT 和 RLHF 的配合'
    }
];

// Stages: Pre-training and Post-training
export const stages = [
    {
        id: 'pretraining',
        name: '预训练',
        nameEn: 'Pre-training',
        description: '预训练阶段是模型学习世界知识的基础阶段',
        highlightNodes: ['pt', 'cpt'],
        details: {
            goal: '通过大规模无监督学习，让模型习得语言规律和世界知识',
            data: {
                type: '海量无标注文本数据',
                sources: ['网页文本', '图书', '代码库', '学术论文', '社交媒体'],
                scale: '通常数万亿 tokens',
                quality: '需要去重、过滤低质量内容'
            },
            method: '自回归语言建模（预测下一个词）',
            cost: '计算成本极高，需要数千张GPU，训练数周到数月',
            variants: [
                { name: 'PT', desc: '基础预训练，从零开始训练' },
                { name: 'CPT', desc: '持续预训练，在已有模型基础上注入特定领域知识' }
            ],
            questions: [
                {
                    question: '为什么预训练使用的是"预测下一个词"这种看似简单的任务，而不是更复杂的任务？',
                    answer: '因为这个任务可以利用海量无标注文本进行自监督学习，不需要人工标注。而且这个任务隐含地要求模型理解语法、语义、常识甚至推理能力，才能准确预测下一个词。简单的目标，复杂的学习。'
                },
                {
                    question: '如果预训练数据中 90% 是英文，10% 是中文，模型的中文能力会怎样？这说明了什么？',
                    answer: '模型的中文能力会明显弱于英文。这说明预训练数据的分布直接决定了模型的能力分布。数据即偏见，数据即能力边界。'
                },
                {
                    question: '为什么预训练需要"去重"？重复数据会带来什么问题？',
                    hint: '想想模型会怎么对待经常见到的内容',
                    answer: '重复数据会导致模型过度记忆这些内容，在生成时倾向于复制而非理解。这会降低模型的泛化能力，还可能导致隐私泄露（如果重复内容包含敏感信息）。'
                }
            ]
        }
    },
    {
        id: 'posttraining',
        name: '后训练',
        nameEn: 'Post-training',
        description: '后训练阶段将预训练模型调整为可用的助手',
        highlightNodes: ['sft', 'sft-special', 'rl', 'synthetic-data', 'student-sft'],
        details: {
            goal: '让模型学会理解指令、遵循人类偏好、完成特定任务',
            data: {
                type: '高质量标注数据',
                sources: ['人工编写的问答对', '人类偏好标注', '特定任务数据', '合成数据'],
                scale: '通常几万到几十万条',
                quality: '质量>数量，需要专业标注员或领域专家'
            },
            method: '有监督微调（SFT）+ 强化学习（RL）',
            cost: '相对预训练成本较低，但数据标注成本高',
            variants: [
                { name: 'SFT', desc: '有监督微调，教会模型对话格式和指令理解' },
                { name: 'RL', desc: '强化学习，通过奖励信号优化模型行为' }
            ],
            questions: [
                {
                    question: 'SFT 数据只有几万条，预训练数据有几万亿 tokens，为什么少量 SFT 数据就能改变模型行为？',
                    hint: '想想 SFT 改变的是什么',
                    answer: 'SFT 不是教模型新知识，而是教模型"如何表达"已有的知识。预训练已经让模型具备了能力，SFT 只是调整输出格式和风格。这就像一个学者学会用通俗语言解释专业知识，知识没变，表达方式变了。'
                },
                {
                    question: '为什么说后训练数据"质量>数量"？低质量数据会带来什么问题？',
                    answer: '低质量的 SFT 数据会教模型错误的行为模式（如敷衍回答、格式混乱）。由于 SFT 数据量小，每条数据对模型的影响都很大。一条错误示例可能让模型学会一个坏习惯。'
                }
            ]
        }
    }
];

// Unified flow - all nodes in the complete pipeline
export const unifiedNodes = [
    // Pre-training stage
    {
        id: 'pt',
        position: { x: 100, y: 150 },
        data: { label: 'PT\n(预训练)' },
        type: 'input',
        stage: 'pretraining'
    },
    {
        id: 'cpt',
        position: { x: 100, y: 50 },
        data: { label: 'CPT\n(持续预训练)' },
        type: 'default',
        stage: 'pretraining'
    },

    // Post-training stage
    {
        id: 'sft',
        position: { x: 350, y: 150 },
        data: { label: 'SFT\n(有监督微调)' },
        type: 'default',
        stage: 'posttraining'
    },
    {
        id: 'sft-special',
        position: { x: 350, y: 250 },
        data: { label: 'SFT\n(推理/领域强化)' },
        type: 'default',
        stage: 'posttraining'
    },
    {
        id: 'rl',
        position: { x: 650, y: 150 },
        data: { label: 'RL\n(强化学习)' },
        type: 'default',
        stage: 'posttraining'
    },

    // Distillation path
    {
        id: 'synthetic-data',
        position: { x: 850, y: 150 },
        data: { label: '合成数据' },
        type: 'default',
        stage: 'posttraining'
    },
    {
        id: 'student-sft',
        position: { x: 1050, y: 150 },
        data: { label: 'Student SFT\n(蒸馏)' },
        type: 'output',
        stage: 'posttraining'
    }
];

export const unifiedEdges = [
    // Main flow
    { id: 'e-pt-sft', source: 'pt', target: 'sft', type: 'smoothstep' },
    { id: 'e-sft-rl', source: 'sft', target: 'rl', type: 'smoothstep' },

    // CPT branch
    { id: 'e-pt-cpt', source: 'pt', target: 'cpt', type: 'smoothstep' },
    { id: 'e-cpt-sft', source: 'cpt', target: 'sft', type: 'smoothstep' },

    // Special SFT branch
    { id: 'e-sft-special', source: 'sft', target: 'sft-special', type: 'smoothstep' },
    { id: 'e-special-rl', source: 'sft-special', target: 'rl', type: 'smoothstep' },

    // Distillation path
    { id: 'e-rl-synthetic', source: 'rl', target: 'synthetic-data', type: 'smoothstep' },
    { id: 'e-synthetic-student', source: 'synthetic-data', target: 'student-sft', type: 'smoothstep' },
    { id: 'e-student-rl', source: 'student-sft', target: 'rl', type: 'smoothstep', animated: true, style: { strokeDasharray: '5,5' } }
];

// Paradigms with detailed information
export const paradigms = [
    {
        id: 'standard',
        name: '标准指令对齐',
        nameEn: 'Standard Instruct',
        scenario: '通用对话助手',
        examples: '早期的 ChatGPT, Llama-Chat, Claude',
        flow: 'PT → SFT → RL',
        description: '最经典的"三步走"流程，适用于构建通用对话助手。',
        details: [
            '**PT (预训练)**: 阅读海量文本，通过预测下一个词习得世界知识。',
            '**SFT (有监督微调)**: 通过问答对数据，学会"对话格式"和听懂指令。',
            '**RL (强化/对齐)**: 通过人类偏好数据，让回答更安全、更有用、符合人类价值观。'
        ],
        questions: [
            {
                question: '为什么标准流程是 PT → SFT → RL 这个顺序，而不是其他顺序？',
                hint: '想想每一步的前置条件是什么',
                answer: 'PT 提供知识基座（没知识就没法对话）；SFT 需要基座模型才能微调；RL 需要模型已经会对话才能比较好坏。每一步都依赖前一步的输出，顺序不能乱。'
            },
            {
                question: '如果跳过 SFT 直接做 RL，会发生什么？',
                answer: '预训练模型不懂对话格式，输出可能是续写文章而非回答问题。RL 需要比较"哪个回答更好"，但如果模型连回答都不会生成，就没法比较。SFT 是"冷启动"，让模型先学会基本的对话能力。'
            }
        ],
        highlightNodes: ['pt', 'sft', 'rl'],
        highlightEdges: ['e-pt-sft', 'e-sft-rl'],
        nodeDetails: {
            'pt': {
                title: 'PT - 预训练',
                role: '构建知识基座',
                data: '通用网页文本、图书、代码等',
                output: '具备基础语言能力的基座模型'
            },
            'sft': {
                title: 'SFT - 有监督微调',
                role: '学习对话格式和指令理解',
                data: '通用问答对（如用户问题+助手回答）',
                output: '能够理解指令并以对话形式回答的模型'
            },
            'rl': {
                title: 'RL - 强化学习对齐',
                role: '对齐人类偏好和价值观',
                data: '人类偏好标注（如RLHF中的排序数据）',
                output: '安全、有用、符合人类价值观的对话助手'
            }
        }
    },
    {
        id: 'domain',
        name: '领域增量范式',
        nameEn: 'Domain Adaptation',
        scenario: '垂直行业模型',
        examples: '法律、医疗、金融、代码大模型',
        flow: 'PT → CPT → SFT → RL',
        description: '通过持续预训练注入特定领域知识，避免直接微调产生幻觉。',
        details: [
            '**核心在于 CPT (Continual Pre-Training)**：通用模型不懂行业黑话。',
            '在 SFT 之前，先用行业书籍/代码库进行"二次预训练"（CPT），注入特定领域知识。',
            '然后再进行常规的指令微调。',
            '⚠️ 如果不做 CPT 直接做 SFT，模型容易产生幻觉。'
        ],
        questions: [
            {
                question: '为什么直接用医疗问答数据做 SFT（跳过 CPT）容易产生幻觉？',
                hint: '想想模型在回答专业问题时，知识从哪里来',
                answer: '因为基座模型在预训练时可能没有见过足够的医疗专业知识。SFT 只教会了模型"如何回答"的格式，但没有注入"回答什么"的知识。模型会用流利的格式编造它不知道的内容，产生幻觉。CPT 先注入领域知识，再做 SFT 学格式。'
            },
            {
                question: 'CPT 和 SFT 都是在已有模型上继续训练，它们的区别是什么？',
                answer: 'CPT 用的是无标注的领域文本（如医学教材），目标还是"预测下一个词"，注入的是知识；SFT 用的是标注的问答对，目标是学会对话格式，改变的是行为。CPT 扩充知识库，SFT 调整表达方式。'
            }
        ],
        highlightNodes: ['pt', 'cpt', 'sft', 'rl'],
        highlightEdges: ['e-pt-cpt', 'e-cpt-sft', 'e-sft-rl'],
        nodeDetails: {
            'pt': {
                title: 'PT - 基础预训练',
                role: '通用知识基座',
                data: '通用文本数据',
                output: '通用语言模型'
            },
            'cpt': {
                title: 'CPT - 持续预训练',
                role: '注入领域知识',
                data: '领域专有数据（如医学教材、法律文书、代码库）',
                output: '具备领域知识的专业基座模型',
                keyPoint: '这一步是关键！直接跳过会导致模型幻觉'
            },
            'sft': {
                title: 'SFT - 领域指令微调',
                role: '学习领域任务',
                data: '领域问答对（如医疗咨询、法律咨询）',
                output: '能够完成领域任务的专业助手'
            },
            'rl': {
                title: 'RL - 领域对齐',
                role: '符合行业规范',
                data: '领域专家的偏好标注',
                output: '符合行业标准和伦理的专业模型'
            }
        }
    },
    {
        id: 'curriculum',
        name: '多阶段微调范式',
        nameEn: 'Curriculum SFT',
        scenario: '特定任务专家 / Agent',
        examples: '擅长解题的模型、擅长调用工具的 Agent',
        flow: 'PT → SFT(通用) → SFT(特定) → RL',
        description: '"由博转专"的学习路径，先学通用能力再强化特定技能。',
        details: [
            '1. 先用海量通用指令数据（如 FLAN）让模型学会听懂各种人话。',
            '2. 再用少量的、高质量的特定数据（如奥数题步骤、API 调用格式）进行第二轮 SFT。',
            '3. 强化特定能力的同时避免基础能力退化。',
            '💡 课程学习的思想：循序渐进，避免一开始就学太难'
        ],
        questions: [
            {
                question: '为什么要先做通用 SFT 再做特定 SFT，而不是直接用特定数据训练？',
                hint: '想想"通才"和"专才"的培养路径',
                answer: '直接用特定数据训练可能导致模型只会这一件事（过拟合）。先学通用能力建立广泛的指令理解基础，再专攻特定任务，既保留了通用能力又获得了专业技能。就像医生先学基础医学再选专科。'
            },
            {
                question: '多阶段 SFT 如何避免"灾难性遗忘"（学了新的忘了旧的）？',
                answer: '常用方法包括：1）在特定数据中混入部分通用数据；2）使用较小的学习率；3）冻结部分底层参数。核心思想是让模型"温故知新"，不要完全被新数据带偏。'
            }
        ],
        highlightNodes: ['pt', 'sft', 'sft-special', 'rl'],
        highlightEdges: ['e-pt-sft', 'e-sft-special', 'e-special-rl'],
        nodeDetails: {
            'pt': {
                title: 'PT - 预训练',
                role: '知识基座',
                data: '通用文本',
                output: '基座模型'
            },
            'sft': {
                title: 'SFT - 通用能力',
                role: '学习广泛的指令理解',
                data: '多样化的通用指令数据（如FLAN、T0）',
                output: '具备广泛指令理解能力的模型'
            },
            'sft-special': {
                title: 'SFT - 特定能力',
                role: '强化目标技能',
                data: '高质量的特定任务数据（如数学推理、工具调用）',
                output: '在特定任务上表现优异的专家模型',
                keyPoint: '数据量少但质量高，避免遗忘通用能力'
            },
            'rl': {
                title: 'RL - 任务优化',
                role: '进一步优化任务表现',
                data: '任务成功/失败的反馈信号',
                output: '高度优化的任务专家'
            }
        }
    },
    {
        id: 'reasoning',
        name: '推理强化范式',
        nameEn: 'Reasoning / System 2',
        scenario: '高智商/推理模型',
        examples: 'OpenAI o1, DeepSeek-R1',
        flow: 'PT → SFT(冷启动) → RL(推理)',
        description: '侧重于"怎么思考"而非"怎么说话"，通过RL学会深度推理。',
        details: [
            '**SFT 阶段**：数据量很少，只是为了让模型学会输出格式（冷启动）。',
            '**核心在于 RL 阶段**：通过长思维链（CoT）的自我博弈和搜索。',
            '奖励模型给出正确答案的**过程**，而不仅仅是答案本身。',
            '🧠 模型在 RL 中学会自我反思和纠错，发展出"慢思考"能力'
        ],
        questions: [
            {
                question: '推理强化范式中的 SFT 为什么数据量很少？这和标准范式的 SFT 有什么区别？',
                answer: '标准范式的 SFT 教模型"怎么回答各种问题"，需要大量多样化数据；推理范式的 SFT 只教模型"思维链的输出格式"（如 <think>...</think>），格式简单统一，少量示例就够了。真正的推理能力是在 RL 阶段学的。'
            },
            {
                question: '为什么推理模型的 RL 奖励的是"过程"而不仅是"答案"？',
                hint: '想想只看答案会导致什么问题',
                answer: '如果只奖励正确答案，模型可能学会"蒙对"——用错误的推理碰巧得到正确答案。奖励过程确保模型学会正确的推理方法，这样在新问题上也能用正确的方法得到正确答案。过程对了，答案自然对。'
            },
            {
                question: '什么是"自我博弈"？模型和谁在博弈？',
                answer: '模型和自己博弈：生成多个不同的推理路径，比较哪个更好。这类似于人类思考时"自我辩论"——想出一个方案，再想反例，再改进。模型通过大量的自我尝试和比较，发现什么样的思考方式更容易得到正确答案。'
            }
        ],
        highlightNodes: ['pt', 'sft', 'sft-special', 'rl'],
        highlightEdges: ['e-pt-sft', 'e-sft', 'e-sft-special', 'e-special-rl'],
        nodeDetails: {
            'pt': {
                title: 'PT - 预训练',
                role: '知识和推理基础',
                data: '通用文本（包含推理示例）',
                output: '具备初步推理能力的基座'
            },
            'sft': {
                title: 'SFT - 通用能力',
                role: '学习广泛的指令理解',
                data: '多样化的通用指令数据（如FLAN、T0）',
                output: '具备广泛指令理解能力的模型'
            },
            'sft-special': {
                title: 'SFT - 冷启动',
                role: '学习思维链格式',
                data: '少量的CoT（思维链）示例',
                output: '能够输出推理过程的模型',
                keyPoint: '数据量极少，仅为格式启动'
            },
            'rl': {
                title: 'RL - 推理强化',
                role: '优化推理质量',
                data: '推理任务的正确性反馈 + 搜索/自我博弈',
                output: '具备深度推理和自我纠错能力的智能模型',
                keyPoint: '这是核心！通过RL发展出"慢思考"能力'
            }
        }
    },
    {
        id: 'distillation',
        name: '知识蒸馏范式',
        nameEn: 'Knowledge Distillation',
        scenario: '端侧模型 / 专有小模型',
        examples: '手机端 LLM, 极速版模型',
        flow: 'Teacher → 合成数据 → Student SFT',
        description: '"站在巨人的肩膀上"，用大模型生成数据训练小模型。',
        details: [
            '**不进行昂贵的 PT**：小模型通常从已有checkpoint开始。',
            '使用一个超强的教师模型（如 GPT-4）生成高质量的合成数据。',
            '合成数据包含复杂的推理步骤，让小模型学习大模型的"思考过程"。',
            '💡 让小模型模仿大模型，以更低成本获得更高能力'
        ],
        questions: [
            {
                question: '为什么小模型学习大模型的"思考过程"（思维链）比只学最终答案效果更好？',
                hint: '想想老师教学生解题时会怎么做',
                answer: '只给答案，学生不知道怎么得出的，只能死记硬背；给出解题步骤，学生能理解方法，举一反三。小模型学习大模型的思维链，相当于学习"解题方法"而非"答案"，在新问题上也能应用。'
            },
            {
                question: '蒸馏出来的小模型能超过教师模型吗？为什么？',
                answer: '理论上不能，因为学生学的是老师的输出，上限就是老师的水平。但在特定任务上，由于小模型专注学习这个任务，可能比通用大模型表现更好。另外，蒸馏 + 额外的 RL 训练有时能略微超过老师。'
            },
            {
                question: '合成数据和人工标注数据相比，各有什么优缺点？',
                answer: '合成数据：优点是成本低、规模大、可快速生成；缺点是质量上限受限于教师模型，可能放大教师的偏见和错误。人工标注：优点是质量可控、可纠正模型错误；缺点是成本高、速度慢、标注员也会犯错。实践中常混合使用。'
            }
        ],
        highlightNodes: ['rl', 'synthetic-data', 'student-sft'],
        highlightEdges: ['e-rl-synthetic', 'e-synthetic-student'],
        nodeDetails: {
            'rl': {
                title: '教师模型',
                role: '生成高质量数据',
                data: '教师模型通常是经过充分训练的大模型',
                output: '合成的高质量训练数据',
                keyPoint: '教师模型越强，蒸馏效果越好'
            },
            'synthetic-data': {
                title: '合成数据',
                role: '知识传递的载体',
                data: '教师模型生成的问答对 + 推理过程',
                output: '用于训练学生模型的数据集',
                keyPoint: '质量>数量，要包含复杂推理'
            },
            'student-sft': {
                title: 'Student SFT',
                role: '学习教师的能力',
                data: '合成数据',
                output: '轻量级但能力强的学生模型',
                keyPoint: '模型参数小，可部署在端侧设备'
            }
        }
    }
];

// Summary for comparison
export const summary = {
    title: '核心总结：这些范式的本质区别',
    points: [
        { key: 'PT', desc: '决定了模型的**知识上限**（智商基座）' },
        { key: 'CPT', desc: '决定了模型的**专业深度**（行业专家）' },
        { key: 'SFT', desc: '决定了模型的**服从性**（听话程度）' },
        { key: 'RL', desc: '决定了模型的**价值观**（标准对齐）或 **深度思考能力**（推理强化）' }
    ]
};

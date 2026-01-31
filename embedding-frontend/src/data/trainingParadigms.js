// 训练范式数据
export const trainingParadigms = {
  staticEmbeddings: {
    title: '静态词嵌入',
    description: '每个词有一个固定的向量表示，不随上下文变化',
    methods: [
      {
        id: 'cbow',
        name: 'CBOW',
        fullName: 'Continuous Bag of Words',
        description: '用上下文词预测中心词',
        analogy: '完形填空：根据周围的词猜中间是什么词',
        example: {
          context: ['我', '喜欢', '___', '水果'],
          target: '吃',
          explanation: '给定"我喜欢___水果"，模型学习预测中间的"吃"'
        },
        pros: ['训练速度快', '适合高频词', '内存效率高'],
        cons: ['对低频词效果差', '忽略词序信息']
      },
      {
        id: 'skipgram',
        name: 'Skip-gram',
        fullName: 'Skip-gram with Negative Sampling',
        description: '用中心词预测上下文词',
        analogy: '联想游戏：看到一个词，想象它周围可能有什么词',
        example: {
          center: '苹果',
          context: ['红色', '水果', '好吃', '营养'],
          explanation: '给定"苹果"，模型学习预测周围可能出现的词'
        },
        pros: ['低频词效果好', '语义捕捉能力强'],
        cons: ['训练速度较慢', '需要更多计算']
      },
      {
        id: 'glove',
        name: 'GloVe',
        fullName: 'Global Vectors',
        description: '基于全局词共现矩阵的矩阵分解',
        analogy: '统计分析：统计所有词对的共同出现次数，找出规律',
        example: {
          matrix: '词-词共现矩阵',
          explanation: '如果"冰"和"冷"经常一起出现，它们的向量应该相近'
        },
        pros: ['利用全局统计信息', '训练效率高', '效果稳定'],
        cons: ['需要预计算共现矩阵', '内存需求大']
      }
    ]
  },
  contextualEmbeddings: {
    title: '上下文词嵌入',
    description: '同一个词在不同上下文中有不同的向量表示',
    methods: [
      {
        id: 'elmo',
        name: 'ELMo',
        fullName: 'Embeddings from Language Models',
        description: '双向 LSTM 语言模型产生的动态嵌入',
        analogy: '察言观色：同一个词，根据前后文理解不同含义',
        example: {
          word: '苹果',
          contexts: [
            { sentence: '我买了一个苹果手机', meaning: '品牌' },
            { sentence: '我吃了一个苹果', meaning: '水果' }
          ]
        },
        architecture: 'BiLSTM'
      },
      {
        id: 'bert',
        name: 'BERT',
        fullName: 'Bidirectional Encoder Representations from Transformers',
        description: '基于 Transformer 的双向预训练模型',
        analogy: '深度理解：同时看完整个句子，真正理解每个词的含义',
        trainingTasks: [
          {
            name: 'MLM (Masked Language Model)',
            description: '随机遮盖 15% 的词，让模型预测',
            example: '我 [MASK] 自然语言处理 → 我 爱 自然语言处理'
          },
          {
            name: 'NSP (Next Sentence Prediction)',
            description: '判断两个句子是否连续',
            example: '[CLS] 句子A [SEP] 句子B [SEP] → 是/否'
          }
        ],
        architecture: 'Transformer Encoder'
      },
      {
        id: 'gpt',
        name: 'GPT',
        fullName: 'Generative Pre-trained Transformer',
        description: '自回归语言模型，从左到右生成',
        analogy: '续写故事：根据前文预测下一个词',
        trainingTask: {
          name: 'CLM (Causal Language Modeling)',
          description: '根据前面的词预测下一个词',
          example: '今天天气 → 很好'
        },
        architecture: 'Transformer Decoder'
      }
    ]
  }
};

export const trainingSteps = [
  {
    id: 'corpus',
    title: '准备语料',
    description: '收集大量文本数据作为训练素材',
    icon: '📚'
  },
  {
    id: 'preprocess',
    title: '预处理',
    description: '分词、清洗、构建词表',
    icon: '🔧'
  },
  {
    id: 'context',
    title: '构建训练样本',
    description: '根据窗口大小生成(context, target)对',
    icon: '🎯'
  },
  {
    id: 'train',
    title: '训练模型',
    description: '优化目标函数，更新词向量',
    icon: '⚡'
  },
  {
    id: 'evaluate',
    title: '评估效果',
    description: '词类比、相似度等内在评估',
    icon: '📊'
  }
];

export default trainingParadigms;

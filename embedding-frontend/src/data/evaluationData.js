// 评估指标数据
export const evaluationData = {
  intrinsicEvaluation: {
    title: '内在评估',
    description: '直接评估词向量的质量，不依赖下游任务',
    methods: [
      {
        id: 'analogy',
        name: '词类比任务',
        nameEn: 'Word Analogy',
        description: '测试向量运算是否能捕捉语义关系',
        examples: [
          { a: '国王', b: '男人', c: '女人', result: '王后', type: '性别' },
          { a: '北京', b: '中国', c: '日本', result: '东京', type: '首都' },
          { a: '好', b: '更好', c: '坏', result: '更坏', type: '比较级' },
          { a: '走', b: '走路', c: '跑', result: '跑步', type: '词形' }
        ],
        formula: 'vec(B) - vec(A) + vec(C) ≈ vec(D)',
        datasets: ['Google Analogy', 'MSR Word Relationship']
      },
      {
        id: 'similarity',
        name: '词相似度',
        nameEn: 'Word Similarity',
        description: '评估模型计算的相似度与人类判断的相关性',
        metrics: ['皮尔逊相关系数', '斯皮尔曼相关系数'],
        datasets: [
          { name: 'WordSim-353', pairs: 353, description: '经典相似度数据集' },
          { name: 'SimLex-999', pairs: 999, description: '区分相似性和相关性' },
          { name: 'MEN', pairs: 3000, description: '大规模评估数据集' }
        ]
      },
      {
        id: 'clustering',
        name: '词聚类',
        nameEn: 'Word Clustering',
        description: '验证语义相近的词是否在向量空间中聚集',
        example: {
          clusters: [
            { name: '水果', words: ['苹果', '香蕉', '橙子', '葡萄'] },
            { name: '动物', words: ['猫', '狗', '鸟', '鱼'] },
            { name: '颜色', words: ['红', '蓝', '绿', '黄'] }
          ]
        }
      }
    ]
  },
  extrinsicEvaluation: {
    title: '外在评估',
    description: '通过下游任务表现间接评估词向量质量',
    tasks: [
      {
        name: '情感分析',
        nameEn: 'Sentiment Analysis',
        description: '判断文本的情感倾向（正面/负面）',
        metrics: ['准确率', 'F1分数'],
        icon: '😊'
      },
      {
        name: '命名实体识别',
        nameEn: 'Named Entity Recognition',
        description: '识别文本中的人名、地名、机构名等',
        metrics: ['精确率', '召回率', 'F1分数'],
        icon: '🏷️'
      },
      {
        name: '文本分类',
        nameEn: 'Text Classification',
        description: '将文本分到预定义的类别中',
        metrics: ['准确率', '宏F1', '微F1'],
        icon: '📂'
      },
      {
        name: '问答系统',
        nameEn: 'Question Answering',
        description: '根据问题从文档中找到答案',
        metrics: ['EM', 'F1'],
        icon: '❓'
      }
    ]
  },
  similarityMeasures: {
    title: '相似度度量',
    measures: [
      {
        name: '余弦相似度',
        nameEn: 'Cosine Similarity',
        formula: 'cos(θ) = (A·B) / (||A|| × ||B||)',
        range: '[-1, 1]',
        description: '衡量两个向量的方向相似性，与长度无关',
        interpretation: {
          '1': '完全相同方向',
          '0': '正交（无关）',
          '-1': '完全相反方向'
        }
      },
      {
        name: '欧几里得距离',
        nameEn: 'Euclidean Distance',
        formula: 'd = √(Σ(ai - bi)²)',
        range: '[0, ∞)',
        description: '衡量两点在空间中的直线距离',
        interpretation: {
          '0': '完全相同',
          '越大': '差异越大'
        }
      },
      {
        name: '曼哈顿距离',
        nameEn: 'Manhattan Distance',
        formula: 'd = Σ|ai - bi|',
        range: '[0, ∞)',
        description: '各维度差值绝对值之和',
        useCase: '高维空间中计算效率更高'
      }
    ]
  }
};

// 词类比演示数据
export const analogyDemos = [
  {
    id: 1,
    category: '性别关系',
    a: '国王',
    b: '男人',
    c: '女人',
    result: '王后',
    explanation: '国王之于男人，正如王后之于女人'
  },
  {
    id: 2,
    category: '国家-首都',
    a: '法国',
    b: '巴黎',
    c: '德国',
    result: '柏林',
    explanation: '法国的首都是巴黎，德国的首都是柏林'
  },
  {
    id: 3,
    category: '时态变化',
    a: '走',
    b: '走了',
    c: '吃',
    result: '吃了',
    explanation: '动词的过去时变化规律'
  },
  {
    id: 4,
    category: '职业关系',
    a: '医生',
    b: '医院',
    c: '教师',
    result: '学校',
    explanation: '医生在医院工作，教师在学校工作'
  }
];

export default evaluationData;

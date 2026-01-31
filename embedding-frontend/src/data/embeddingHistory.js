// Embedding 发展历史数据
export const embeddingHistory = [
  {
    id: 'one-hot',
    year: '1950s-1980s',
    title: 'One-Hot Encoding',
    subtitle: '最原始的词表示方法',
    description: '将每个词表示为一个稀疏向量，只有对应位置为1，其余为0。',
    details: `One-Hot 编码是最简单的词表示方法。假设词表大小为 V，则每个词用一个 V 维向量表示，只有该词对应的位置为 1，其余全为 0。

**优点**：简单直观，易于实现
**缺点**：
- 维度灾难：词表越大，向量越稀疏
- 语义缺失：无法表达词与词之间的关系
- "国王"和"王后"的距离与"国王"和"香蕉"一样远`,
    tags: ['稀疏表示', '离散', '基础'],
    icon: '📍'
  },
  {
    id: 'distributed',
    year: '1986',
    title: '分布式表示',
    subtitle: 'Hinton 提出分布式表示概念',
    description: 'Geoffrey Hinton 在论文中首次提出用低维稠密向量表示符号的思想。',
    details: `Hinton 在 1986 年的论文 "Learning Distributed Representations of Concepts" 中提出了分布式表示的概念。

核心思想是：用一组神经元的激活模式来表示一个概念，而不是单个神经元。这为后来的词嵌入奠定了理论基础。

这一思想突破了符号 AI 的局限，开启了连接主义表示学习的新时代。`,
    tags: ['理论奠基', 'Hinton', '连接主义'],
    icon: '🧠'
  },
  {
    id: 'nnlm',
    year: '2003',
    title: '神经网络语言模型',
    subtitle: 'Bengio et al. - NNLM',
    description: 'Yoshua Bengio 等人提出神经网络语言模型，首次将词嵌入作为模型的副产品。',
    details: `Bengio 等人在 2003 年发表的 "A Neural Probabilistic Language Model" 是里程碑式的工作。

**核心创新**：
- 使用前馈神经网络预测下一个词
- 词嵌入矩阵作为模型参数被学习
- 证明了神经网络可以学习词的语义表示

这篇论文为后续的 Word2Vec、GloVe 等工作铺平了道路。`,
    tags: ['NNLM', 'Bengio', '语言模型'],
    icon: '📚'
  },
  {
    id: 'word2vec',
    year: '2013',
    title: 'Word2Vec',
    subtitle: 'Mikolov et al. (Google)',
    description: '革命性的词嵌入方法，提出 CBOW 和 Skip-gram 两种训练范式。',
    details: `Tomas Mikolov 等人在 Google 发布的 Word2Vec 彻底改变了 NLP 领域。

**两种训练方式**：
- **CBOW (Continuous Bag of Words)**：用上下文预测中心词
- **Skip-gram**：用中心词预测上下文

**关键技术**：
- 负采样 (Negative Sampling)
- 层次化 Softmax (Hierarchical Softmax)

**惊人发现**：
向量运算可以捕捉语义关系！
\`King - Man + Woman ≈ Queen\``,
    tags: ['Word2Vec', 'CBOW', 'Skip-gram', '里程碑'],
    icon: '🚀'
  },
  {
    id: 'glove',
    year: '2014',
    title: 'GloVe',
    subtitle: 'Stanford NLP - 全局向量表示',
    description: '结合全局统计信息和局部上下文，通过矩阵分解学习词向量。',
    details: `斯坦福 NLP 组提出的 GloVe (Global Vectors for Word Representation) 结合了两种思路：

**核心思想**：
- 利用全局词-词共现矩阵
- 通过矩阵分解学习词向量
- 结合了 LSA 的全局统计和 Word2Vec 的局部窗口优势

**训练目标**：
使得词向量的点积近似于共现概率的对数

GloVe 在多个基准测试上取得了优异效果，至今仍被广泛使用。`,
    tags: ['GloVe', 'Stanford', '矩阵分解'],
    icon: '💎'
  },
  {
    id: 'fasttext',
    year: '2016',
    title: 'FastText',
    subtitle: 'Facebook AI - 子词嵌入',
    description: '引入子词 (subword) 信息，能够处理 OOV 问题和形态丰富的语言。',
    details: `Facebook AI Research 发布的 FastText 在 Word2Vec 基础上做了重要改进：

**核心创新**：
- 将每个词拆分为字符 n-gram
- 词向量 = 子词向量之和
- 例如："where" = "<wh" + "whe" + "her" + "ere" + "re>"

**优势**：
- 能处理未登录词 (OOV)
- 对形态丰富的语言（如德语、土耳其语）效果好
- 能捕捉词缀信息

FastText 开源库至今仍被广泛使用。`,
    tags: ['FastText', 'Facebook', '子词', 'OOV'],
    icon: '⚡'
  },
  {
    id: 'elmo',
    year: '2018',
    title: 'ELMo',
    subtitle: 'Allen AI - 上下文相关嵌入',
    description: '首个上下文相关的词嵌入，同一个词在不同语境下有不同的表示。',
    details: `ELMo (Embeddings from Language Models) 由 Allen AI 提出，开启了上下文嵌入的时代。

**革命性突破**：
- 同一个词在不同句子中有不同的向量！
- "苹果手机" vs "吃苹果" 中的"苹果"不再相同

**技术实现**：
- 双向 LSTM 语言模型
- 融合各层的隐藏状态
- 使用加权组合

ELMo 的出现标志着 NLP 从"静态嵌入"迈向"动态嵌入"。`,
    tags: ['ELMo', 'Allen AI', '上下文嵌入', 'BiLSTM'],
    icon: '🌊'
  },
  {
    id: 'bert',
    year: '2018',
    title: 'BERT Embeddings',
    subtitle: 'Google - 预训练语言模型',
    description: 'Transformer 架构的双向预训练，产生的嵌入成为 NLP 新标准。',
    details: `BERT (Bidirectional Encoder Representations from Transformers) 由 Google 发布，彻底改变了 NLP。

**核心创新**：
- 基于 Transformer Encoder
- 双向上下文建模
- Masked Language Model 预训练

**BERT 嵌入特点**：
- 768 维或 1024 维向量
- 真正的深度上下文理解
- 可微调适应下游任务

BERT 开启了"预训练+微调"的新范式，其嵌入质量远超之前的方法。`,
    tags: ['BERT', 'Google', 'Transformer', '预训练'],
    icon: '🏆'
  },
  {
    id: 'llm-era',
    year: '2020+',
    title: '大模型时代',
    subtitle: 'GPT-3, LLaMA, Qwen 等',
    description: '超大规模语言模型，嵌入维度和质量达到新高度。',
    details: `2020 年后，大语言模型 (LLM) 时代来临：

**代表模型**：
- GPT-3/4 (OpenAI)
- LLaMA (Meta)
- Qwen (阿里)
- Claude (Anthropic)

**嵌入特点**：
- 更高维度 (4096+)
- 更强的语义理解
- 涌现能力

**新趋势**：
- Sentence Embedding (句子级嵌入)
- 多模态嵌入 (文本+图像)
- 专门的 Embedding 模型

嵌入已成为 AI 应用的基础设施。`,
    tags: ['LLM', 'GPT', 'LLaMA', '多模态'],
    icon: '🌟'
  }
];

export default embeddingHistory;

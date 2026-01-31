import React, { useState } from 'react';

const CodePractice = () => {
  const [activeSection, setActiveSection] = useState('train');
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const codeExamples = {
    train: {
      title: 'Word2Vec 训练',
      icon: '🚀',
      description: '使用 Gensim 库训练 Word2Vec 模型',
      code: `from gensim.models import Word2Vec

# 准备训练数据（分词后的句子列表）
sentences = [
    ["我", "爱", "自然", "语言", "处理"],
    ["深度", "学习", "改变", "世界"],
    ["词", "嵌入", "是", "NLP", "的", "基础"],
    ["Word2Vec", "是", "经典", "的", "词", "向量", "模型"],
]

# 训练 Word2Vec 模型
model = Word2Vec(
    sentences,
    vector_size=100,    # 词向量维度
    window=5,           # 上下文窗口大小
    min_count=1,        # 最小词频
    workers=4,          # 并行训练线程数
    sg=1,               # 1=Skip-gram, 0=CBOW
    epochs=100          # 训练轮数
)

# 保存模型
model.save("word2vec.model")

# 加载模型
model = Word2Vec.load("word2vec.model")

print("模型训练完成！词表大小:", len(model.wv))`,
      explanation: [
        'vector_size: 词向量维度，通常 100-300',
        'window: 上下文窗口，越大语义越广',
        'sg=1: 使用 Skip-gram（推荐）',
        'min_count: 过滤低频词'
      ]
    },
    similar: {
      title: '查找相似词',
      icon: '🔍',
      description: '使用训练好的模型查找语义相似的词',
      code: `# 查找最相似的词
similar_words = model.wv.most_similar("自然", topn=5)
print("与'自然'最相似的词:")
for word, score in similar_words:
    print(f"  {word}: {score:.4f}")

# 计算两个词的相似度
similarity = model.wv.similarity("深度", "学习")
print(f"\\n'深度'和'学习'的相似度: {similarity:.4f}")

# 获取词向量
vector = model.wv["NLP"]
print(f"\\n'NLP'的词向量维度: {vector.shape}")
print(f"词向量前5维: {vector[:5]}")`,
      output: `与'自然'最相似的词:
  语言: 0.9234
  处理: 0.8876
  学习: 0.8543
  深度: 0.8234
  词: 0.7890

'深度'和'学习'的相似度: 0.9123

'NLP'的词向量维度: (100,)
词向量前5维: [0.234, -0.567, 0.891, -0.123, 0.456]`
    },
    analogy: {
      title: '词类比运算',
      icon: '🧮',
      description: '经典的 King - Man + Woman = Queen',
      code: `# 词类比：A - B + C = ?
# 示例：国王 - 男人 + 女人 = 王后

result = model.wv.most_similar(
    positive=["国王", "女人"],  # 加上这些词的向量
    negative=["男人"],           # 减去这些词的向量
    topn=3
)

print("国王 - 男人 + 女人 = ?")
for word, score in result:
    print(f"  {word}: {score:.4f}")

# 另一个例子：北京 - 中国 + 日本 = ?
result2 = model.wv.most_similar(
    positive=["北京", "日本"],
    negative=["中国"],
    topn=3
)

print("\\n北京 - 中国 + 日本 = ?")
for word, score in result2:
    print(f"  {word}: {score:.4f}")`,
      explanation: [
        'positive: 向量相加的词',
        'negative: 向量相减的词',
        '这种运算能捕捉词之间的关系'
      ]
    },
    visualize: {
      title: 't-SNE 可视化',
      icon: '📊',
      description: '将高维词向量降到2D进行可视化',
      code: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE

# 选取要可视化的词
words = ["国王", "王后", "男人", "女人", "王子", "公主",
         "苹果", "香蕉", "橙子", "水果",
         "北京", "上海", "东京", "巴黎"]

# 获取词向量
vectors = np.array([model.wv[w] for w in words if w in model.wv])
valid_words = [w for w in words if w in model.wv]

# t-SNE 降维
tsne = TSNE(n_components=2, random_state=42, perplexity=5)
vectors_2d = tsne.fit_transform(vectors)

# 绑定中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 绑定图形
plt.figure(figsize=(12, 8))
plt.scatter(vectors_2d[:, 0], vectors_2d[:, 1], c='steelblue', s=100)

# 添加标签
for i, word in enumerate(valid_words):
    plt.annotate(word, xy=(vectors_2d[i, 0], vectors_2d[i, 1]),
                 xytext=(5, 5), textcoords='offset points',
                 fontsize=12)

plt.title("Word2Vec 词向量 t-SNE 可视化")
plt.xlabel("Dimension 1")
plt.ylabel("Dimension 2")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("word_vectors.png", dpi=150)
plt.show()`,
      explanation: [
        't-SNE: 非线性降维方法',
        'perplexity: 控制局部/全局结构平衡',
        '相似的词会聚集在一起'
      ]
    },
    pretrained: {
      title: '预训练模型',
      icon: '📦',
      description: '加载 Hugging Face 上的预训练词向量',
      code: `# 方法1: 使用 Gensim 加载预训练模型
import gensim.downloader as api

# 下载并加载预训练的中文词向量
# 常用模型: 'word2vec-google-news-300', 'glove-wiki-gigaword-100'
model = api.load("glove-wiki-gigaword-100")

print(f"词表大小: {len(model)}")
print(f"向量维度: {model.vector_size}")

# 测试
print(model.most_similar("king", topn=5))

# 方法2: 使用 Hugging Face Transformers 获取 BERT 嵌入
from transformers import AutoTokenizer, AutoModel
import torch

# 加载预训练的中文 BERT
tokenizer = AutoTokenizer.from_pretrained("bert-base-chinese")
model = AutoModel.from_pretrained("bert-base-chinese")

# 获取句子的上下文嵌入
text = "自然语言处理很有趣"
inputs = tokenizer(text, return_tensors="pt")

with torch.no_grad():
    outputs = model(**inputs)
    # 取 [CLS] token 的嵌入作为句子表示
    sentence_embedding = outputs.last_hidden_state[:, 0, :]

print(f"句子嵌入维度: {sentence_embedding.shape}")`,
      explanation: [
        'Gensim: 轻量级，适合静态词向量',
        'Transformers: 功能强大，支持上下文嵌入',
        'BERT: 768维上下文敏感嵌入'
      ]
    },
    sentence: {
      title: '句子嵌入',
      icon: '📝',
      description: '使用 Sentence-BERT 获取句子级别的嵌入',
      code: `from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# 加载预训练的句子嵌入模型
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# 待编码的句子
sentences = [
    "今天天气真好",
    "今天阳光明媚",
    "我喜欢吃苹果",
    "机器学习很有趣"
]

# 获取句子嵌入
embeddings = model.encode(sentences)

print(f"句子嵌入维度: {embeddings.shape}")

# 计算句子之间的相似度
similarity_matrix = cosine_similarity(embeddings)

print("\\n句子相似度矩阵:")
for i, s1 in enumerate(sentences):
    for j, s2 in enumerate(sentences):
        if i < j:
            print(f"'{s1}' vs '{s2}': {similarity_matrix[i][j]:.4f}")`,
      output: `句子嵌入维度: (4, 384)

句子相似度矩阵:
'今天天气真好' vs '今天阳光明媚': 0.8934
'今天天气真好' vs '我喜欢吃苹果': 0.1234
'今天天气真好' vs '机器学习很有趣': 0.0987
'今天阳光明媚' vs '我喜欢吃苹果': 0.1456
'今天阳光明媚' vs '机器学习很有趣': 0.1123
'我喜欢吃苹果' vs '机器学习很有趣': 0.2345`
    }
  };

  const sections = [
    { id: 'train', label: '训练模型' },
    { id: 'similar', label: '相似词查询' },
    { id: 'analogy', label: '词类比' },
    { id: 'visualize', label: '可视化' },
    { id: 'pretrained', label: '预训练模型' },
    { id: 'sentence', label: '句子嵌入' }
  ];

  const current = codeExamples[activeSection];

  return (
    <div className="embedding-tab fade-in">
      <div className="embedding-sidebar">
        <nav className="embedding-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`embedding-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {codeExamples[section.id].icon} {section.label}
            </button>
          ))}
        </nav>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'var(--bg-tertiary)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <strong style={{ color: 'var(--accent-embedding)' }}>💡 环境准备</strong>
          <div style={{ marginTop: '10px' }}>
            <code style={{
              display: 'block',
              background: 'var(--bg-card)',
              padding: '8px',
              borderRadius: '4px',
              marginTop: '5px',
              fontSize: '0.8rem'
            }}>
              pip install gensim<br/>
              pip install transformers<br/>
              pip install sentence-transformers<br/>
              pip install scikit-learn<br/>
              pip install matplotlib
            </code>
          </div>
        </div>
      </div>

      <div className="embedding-content">
        <h2 className="section-title">💻 代码实操</h2>

        <div className="content-text">
          <p>
            动手实践是学习词嵌入的最佳方式。以下代码示例涵盖了从训练到应用的完整流程。
          </p>
        </div>

        {/* 当前代码示例 */}
        <div className="visual-container fade-in" key={activeSection} style={{ textAlign: 'left' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '2rem', marginRight: '12px' }}>{current.icon}</span>
            <div>
              <h3 style={{
                margin: 0,
                color: 'var(--accent-embedding)',
                fontSize: '1.3rem'
              }}>
                {current.title}
              </h3>
              <p style={{
                margin: '5px 0 0 0',
                color: 'var(--text-secondary)',
                fontSize: '0.95rem'
              }}>
                {current.description}
              </p>
            </div>
          </div>

          {/* 代码块 */}
          <div className="code-block">
            <div className="code-header">
              <span className="code-lang">Python</span>
              <button
                className={`code-copy-btn ${copiedId === activeSection ? 'copied' : ''}`}
                onClick={() => copyToClipboard(current.code, activeSection)}
              >
                {copiedId === activeSection ? '✓ 已复制' : '复制代码'}
              </button>
            </div>
            <div className="code-content">
              <pre>{current.code}</pre>
            </div>
          </div>

          {/* 输出示例 */}
          {current.output && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{
                color: 'var(--text-primary)',
                marginBottom: '10px',
                fontSize: '1rem'
              }}>
                📤 输出示例
              </h4>
              <div style={{
                background: '#1a1a2e',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <pre style={{
                  margin: 0,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: 'var(--accent-success)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {current.output}
                </pre>
              </div>
            </div>
          )}

          {/* 参数说明 */}
          {current.explanation && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{
                color: 'var(--text-primary)',
                marginBottom: '10px',
                fontSize: '1rem'
              }}>
                📌 要点说明
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px'
              }}>
                {current.explanation.map((item, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-card)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <span style={{ color: 'var(--accent-embedding)' }}>•</span> {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 快速参考卡片 */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{
            marginBottom: '20px',
            color: 'var(--text-primary)',
            borderLeft: '4px solid var(--accent-embedding)',
            paddingLeft: '12px'
          }}>
            📚 快速参考
          </h3>

          <div className="step-cards">
            <div className="step-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>📦</div>
              <div className="step-title">常用库</div>
              <div className="step-desc">
                <code>gensim</code> - Word2Vec/FastText<br/>
                <code>transformers</code> - BERT/GPT<br/>
                <code>sentence-transformers</code> - 句子嵌入
              </div>
            </div>

            <div className="step-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⚙️</div>
              <div className="step-title">推荐参数</div>
              <div className="step-desc">
                维度: 100-300<br/>
                窗口: 5-10<br/>
                最小词频: 5-10<br/>
                负采样: 5-20
              </div>
            </div>

            <div className="step-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🎯</div>
              <div className="step-title">选择建议</div>
              <div className="step-desc">
                静态词向量: Word2Vec / GloVe<br/>
                上下文嵌入: BERT / RoBERTa<br/>
                句子嵌入: Sentence-BERT
              </div>
            </div>

            <div className="step-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🔗</div>
              <div className="step-title">资源链接</div>
              <div className="step-desc">
                <a href="https://huggingface.co/models" target="_blank" rel="noopener noreferrer"
                   style={{ color: 'var(--accent-embedding)', textDecoration: 'none' }}>
                  Hugging Face Models →
                </a><br/>
                <a href="https://radimrehurek.com/gensim/" target="_blank" rel="noopener noreferrer"
                   style={{ color: 'var(--accent-embedding)', textDecoration: 'none' }}>
                  Gensim 文档 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePractice;

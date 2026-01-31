import React, { useState } from 'react';

const DataPreparation = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'corpus',
      title: '语料收集',
      icon: '📚',
      description: '收集大规模文本数据作为训练素材',
      details: {
        sources: [
          { name: 'Wikipedia', desc: '结构化的百科知识', size: '~20GB+' },
          { name: 'Common Crawl', desc: '网页爬虫数据', size: '~PB级' },
          { name: 'Books Corpus', desc: '电子书籍', size: '~5GB' },
          { name: '领域数据', desc: '特定行业的专业文档', size: '视情况' }
        ],
        tips: [
          '数据量越大，嵌入质量通常越好',
          '数据质量比数量更重要',
          '领域特定任务需要领域数据'
        ]
      }
    },
    {
      id: 'clean',
      title: '文本清洗',
      icon: '🧹',
      description: '去除噪声，标准化文本格式',
      details: {
        operations: [
          { name: '去除HTML标签', example: '<p>文本</p> → 文本' },
          { name: '去除特殊字符', example: '文本@#$ → 文本' },
          { name: '统一大小写', example: 'Hello → hello' },
          { name: '去除多余空格', example: '文  本 → 文本' },
          { name: '处理编码问题', example: 'UTF-8 统一' }
        ],
        tips: [
          '保留有意义的标点符号',
          '注意中英文混合处理',
          '低频词可考虑过滤'
        ]
      }
    },
    {
      id: 'tokenize',
      title: '分词处理',
      icon: '✂️',
      description: '将文本切分为词或子词单元',
      details: {
        methods: [
          { name: '空格分词（英文）', example: '"I love NLP" → ["I", "love", "NLP"]' },
          { name: '中文分词工具', example: 'jieba, pkuseg, LTP' },
          { name: 'BPE 子词', example: '"playing" → ["play", "##ing"]' },
          { name: 'WordPiece', example: 'BERT 使用的方法' }
        ],
        code: `import jieba

text = "我爱自然语言处理"
tokens = jieba.lcut(text)
# ['我', '爱', '自然', '语言', '处理']`
      }
    },
    {
      id: 'vocab',
      title: '构建词表',
      icon: '📖',
      description: '统计词频，建立词到索引的映射',
      details: {
        parameters: [
          { name: 'min_count', desc: '最小词频阈值', typical: '5-10' },
          { name: 'vocab_size', desc: '词表大小限制', typical: '30000-100000' }
        ],
        structure: {
          word2idx: '{ "国王": 0, "王后": 1, ... }',
          idx2word: '{ 0: "国王", 1: "王后", ... }'
        },
        code: `from collections import Counter

word_freq = Counter(all_tokens)
vocab = [w for w, c in word_freq.items() if c >= min_count]
word2idx = {w: i for i, w in enumerate(vocab)}`
      }
    },
    {
      id: 'window',
      title: '窗口采样',
      icon: '🔲',
      description: '根据窗口大小生成训练样本',
      details: {
        explanation: '窗口大小决定了上下文范围。例如窗口=2时，中心词的前后各2个词作为上下文。',
        example: {
          sentence: '我 爱 自然 语言 处理',
          center: '自然',
          window: 2,
          context: ['爱', '语言'],
          samples: [
            { type: 'Skip-gram', pairs: [('自然', '爱'), ('自然', '语言')] },
            { type: 'CBOW', pair: (['爱', '语言'], '自然') }
          ]
        },
        tips: [
          '窗口越大，捕捉的语义关系越广',
          '窗口越小，捕捉的语法关系越强',
          '通常取 5-10'
        ]
      }
    },
    {
      id: 'negative',
      title: '负采样',
      icon: '⚖️',
      description: '高效训练的关键技术',
      details: {
        problem: '如果词表有 10 万个词，每次训练都要计算 10 万个 Softmax，太慢了！',
        solution: '负采样：每次只采样 k 个"负样本"来对比，而不是全部词表。',
        example: {
          positive: '("苹果", "红色") → 正样本，应该相关',
          negative: '("苹果", "汽车") → 负样本，应该不相关'
        },
        formula: '采样概率 P(w) ∝ freq(w)^0.75',
        reason: '0.75 次幂是为了让低频词也有机会被采样',
        code: `# Gensim 中的负采样
model = Word2Vec(sentences,
                 negative=5,  # 采样5个负样本
                 sg=1)        # Skip-gram`
      }
    }
  ];

  const currentStep = steps[activeStep];

  return (
    <div className="embedding-tab fade-in">
      <div className="embedding-sidebar">
        <nav className="embedding-nav">
          {steps.map((step, i) => (
            <button
              key={step.id}
              className={`embedding-nav-item ${activeStep === i ? 'active' : ''}`}
              onClick={() => setActiveStep(i)}
            >
              <span style={{ marginRight: '8px' }}>{step.icon}</span>
              {step.title}
            </button>
          ))}
        </nav>
      </div>

      <div className="embedding-content">
        <h2 className="section-title">📁 数据准备</h2>

        <div className="content-text">
          <p>
            高质量的词嵌入离不开精心的数据准备。从语料收集到负采样，每一步都影响最终效果。
          </p>
        </div>

        {/* 进度指示器 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '30px',
          padding: '0 20px'
        }}>
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              <div
                onClick={() => setActiveStep(i)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: i <= activeStep ? 'var(--accent-embedding)' : 'var(--bg-tertiary)',
                  color: i <= activeStep ? 'var(--bg-primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}>
                  {step.icon}
                </div>
                <span style={{
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  color: i === activeStep ? 'var(--accent-embedding)' : 'var(--text-muted)'
                }}>
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  background: i < activeStep ? 'var(--accent-embedding)' : 'var(--bg-tertiary)',
                  margin: '0 10px',
                  marginBottom: '30px',
                  transition: 'all 0.3s'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 当前步骤详情 */}
        <div className="visual-container fade-in" key={activeStep}>
          <h3 style={{
            marginBottom: '20px',
            color: 'var(--accent-embedding)',
            fontSize: '1.3rem'
          }}>
            {currentStep.icon} {currentStep.title}
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '25px',
            fontSize: '1.05rem'
          }}>
            {currentStep.description}
          </p>

          {/* 语料收集 */}
          {currentStep.id === 'corpus' && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '25px'
              }}>
                {currentStep.details.sources.map((source, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-card)',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    textAlign: 'left'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '5px'
                    }}>
                      {source.name}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px'
                    }}>
                      {source.desc}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--accent-embedding)'
                    }}>
                      规模：{source.size}
                    </div>
                  </div>
                ))}
              </div>
              <div className="analogy-box" style={{ textAlign: 'left' }}>
                <strong>💡 Tips:</strong>
                <ul style={{ margin: '10px 0 0 20px' }}>
                  {currentStep.details.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* 文本清洗 */}
          {currentStep.id === 'clean' && (
            <>
              <div style={{ marginBottom: '25px' }}>
                {currentStep.details.operations.map((op, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 15px',
                    background: i % 2 === 0 ? 'var(--bg-card)' : 'transparent',
                    borderRadius: '8px',
                    marginBottom: '5px'
                  }}>
                    <span style={{ color: 'var(--text-primary)' }}>{op.name}</span>
                    <code style={{
                      background: 'var(--bg-tertiary)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: 'var(--accent-success)'
                    }}>
                      {op.example}
                    </code>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 分词处理 */}
          {currentStep.id === 'tokenize' && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px',
                marginBottom: '25px'
              }}>
                {currentStep.details.methods.map((method, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-card)',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    textAlign: 'left'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: 'var(--accent-embedding)',
                      marginBottom: '8px'
                    }}>
                      {method.name}
                    </div>
                    <code style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {method.example}
                    </code>
                  </div>
                ))}
              </div>
              <div className="code-block">
                <div className="code-header">
                  <span className="code-lang">Python</span>
                </div>
                <div className="code-content">
                  <pre>{currentStep.details.code}</pre>
                </div>
              </div>
            </>
          )}

          {/* 构建词表 */}
          {currentStep.id === 'vocab' && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '25px'
              }}>
                {currentStep.details.parameters.map((param, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-card)',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <code style={{
                      color: 'var(--accent-warning)',
                      fontWeight: '600'
                    }}>
                      {param.name}
                    </code>
                    <div style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      marginTop: '5px'
                    }}>
                      {param.desc}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'var(--accent-embedding)',
                      marginTop: '5px'
                    }}>
                      典型值：{param.typical}
                    </div>
                  </div>
                ))}
              </div>
              <div className="code-block">
                <div className="code-header">
                  <span className="code-lang">Python</span>
                </div>
                <div className="code-content">
                  <pre>{currentStep.details.code}</pre>
                </div>
              </div>
            </>
          )}

          {/* 窗口采样 */}
          {currentStep.id === 'window' && (
            <>
              <div className="analogy-box" style={{ textAlign: 'left', marginBottom: '25px' }}>
                {currentStep.details.explanation}
              </div>
              <div style={{
                background: 'var(--bg-card)',
                padding: '25px',
                borderRadius: '12px',
                marginBottom: '25px'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>句子：</span>
                  <span style={{ marginLeft: '10px', letterSpacing: '5px' }}>
                    {currentStep.details.example.sentence.split(' ').map((w, i) => (
                      <span key={i} style={{
                        padding: '5px 10px',
                        background: w === currentStep.details.example.center
                          ? 'var(--accent-embedding)'
                          : currentStep.details.example.context.includes(w)
                            ? 'var(--accent-primary)'
                            : 'var(--bg-tertiary)',
                        color: w === currentStep.details.example.center ? 'var(--bg-primary)' : 'var(--text-primary)',
                        borderRadius: '4px',
                        marginRight: '8px'
                      }}>
                        {w}
                      </span>
                    ))}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)'
                }}>
                  中心词：<span style={{ color: 'var(--accent-embedding)' }}>{currentStep.details.example.center}</span>
                  &nbsp;|&nbsp;
                  窗口大小：{currentStep.details.example.window}
                  &nbsp;|&nbsp;
                  上下文：<span style={{ color: 'var(--accent-primary)' }}>{currentStep.details.example.context.join(', ')}</span>
                </div>
              </div>
            </>
          )}

          {/* 负采样 */}
          {currentStep.id === 'negative' && (
            <>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'left',
                border: '1px solid var(--accent-danger)'
              }}>
                <strong style={{ color: 'var(--accent-danger)' }}>❓ 问题：</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{currentStep.details.problem}</span>
              </div>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'left',
                border: '1px solid var(--accent-success)'
              }}>
                <strong style={{ color: 'var(--accent-success)' }}>💡 解决方案：</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{currentStep.details.solution}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '25px'
              }}>
                <div style={{
                  background: 'var(--bg-card)',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '2px solid var(--accent-success)',
                  textAlign: 'left'
                }}>
                  <div style={{ color: 'var(--accent-success)', fontWeight: '600', marginBottom: '8px' }}>
                    ✓ 正样本
                  </div>
                  <code style={{ color: 'var(--text-secondary)' }}>
                    {currentStep.details.example.positive}
                  </code>
                </div>
                <div style={{
                  background: 'var(--bg-card)',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '2px solid var(--accent-danger)',
                  textAlign: 'left'
                }}>
                  <div style={{ color: 'var(--accent-danger)', fontWeight: '600', marginBottom: '8px' }}>
                    ✗ 负样本
                  </div>
                  <code style={{ color: 'var(--text-secondary)' }}>
                    {currentStep.details.example.negative}
                  </code>
                </div>
              </div>
              <div className="code-block">
                <div className="code-header">
                  <span className="code-lang">Python</span>
                </div>
                <div className="code-content">
                  <pre>{currentStep.details.code}</pre>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 导航按钮 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '30px'
        }}>
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            style={{
              padding: '10px 25px',
              background: activeStep === 0 ? 'var(--bg-tertiary)' : 'var(--bg-card)',
              color: activeStep === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: activeStep === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            ← 上一步
          </button>
          <button
            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
            disabled={activeStep === steps.length - 1}
            style={{
              padding: '10px 25px',
              background: activeStep === steps.length - 1 ? 'var(--bg-tertiary)' : 'var(--accent-embedding)',
              color: activeStep === steps.length - 1 ? 'var(--text-muted)' : 'var(--bg-primary)',
              border: 'none',
              borderRadius: '8px',
              cursor: activeStep === steps.length - 1 ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            下一步 →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataPreparation;

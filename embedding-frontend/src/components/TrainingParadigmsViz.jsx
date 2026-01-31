import React, { useState } from 'react';
import { trainingParadigms, trainingSteps } from '../data/trainingParadigms';

const TrainingParadigmsViz = () => {
  const [activeMethod, setActiveMethod] = useState('cbow');
  const [activeCategory, setActiveCategory] = useState('static');

  const staticMethods = trainingParadigms.staticEmbeddings.methods;
  const contextualMethods = trainingParadigms.contextualEmbeddings.methods;

  const currentMethod = activeCategory === 'static'
    ? staticMethods.find(m => m.id === activeMethod)
    : contextualMethods.find(m => m.id === activeMethod);

  return (
    <div className="embedding-tab fade-in">
      <div className="embedding-sidebar">
        <nav className="embedding-nav">
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            padding: '8px 12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            静态嵌入
          </div>
          {staticMethods.map(method => (
            <button
              key={method.id}
              className={`embedding-nav-item ${activeMethod === method.id && activeCategory === 'static' ? 'active' : ''}`}
              onClick={() => { setActiveMethod(method.id); setActiveCategory('static'); }}
            >
              {method.name}
            </button>
          ))}

          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            padding: '8px 12px',
            marginTop: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            上下文嵌入
          </div>
          {contextualMethods.map(method => (
            <button
              key={method.id}
              className={`embedding-nav-item ${activeMethod === method.id && activeCategory === 'contextual' ? 'active' : ''}`}
              onClick={() => { setActiveMethod(method.id); setActiveCategory('contextual'); }}
            >
              {method.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="embedding-content">
        <h2 className="section-title">🎓 训练范式</h2>

        {/* 训练流程概览 */}
        <div className="content-text">
          <p>
            词嵌入的训练方法经历了从简单的计数统计到复杂的神经网络的演进。
            不同的训练范式有各自的优势和适用场景。
          </p>
        </div>

        {/* 训练步骤 */}
        <div className="step-cards" style={{ marginBottom: '30px' }}>
          {trainingSteps.map((step, index) => (
            <div key={step.id} className="step-card">
              <div className="step-number">{index + 1}</div>
              <div className="step-title">
                <span style={{ marginRight: '8px' }}>{step.icon}</span>
                {step.title}
              </div>
              <div className="step-desc">{step.description}</div>
            </div>
          ))}
        </div>

        {/* 当前选中的方法详情 */}
        {currentMethod && (
          <div className="visual-container fade-in" key={activeMethod}>
            <h3 style={{
              marginBottom: '20px',
              color: 'var(--accent-embedding)',
              fontSize: '1.3rem'
            }}>
              {currentMethod.name} - {currentMethod.fullName}
            </h3>

            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '20px',
              fontSize: '1.05rem'
            }}>
              {currentMethod.description}
            </p>

            <div className="analogy-box" style={{ textAlign: 'left' }}>
              <strong>💡 通俗理解：</strong> {currentMethod.analogy}
            </div>

            {/* CBOW 示例 */}
            {activeMethod === 'cbow' && currentMethod.example && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>
                  训练示例：完形填空
                </h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginBottom: '20px'
                }}>
                  {currentMethod.example.context.map((word, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '12px 20px',
                        background: word === '___' ? 'var(--accent-danger)' : 'var(--bg-card)',
                        color: 'white',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        border: word === '___' ? 'none' : '1px solid var(--border-color)'
                      }}
                    >
                      {word === '___' ? '?' : word}
                    </span>
                  ))}
                  <span style={{ fontSize: '1.5rem', color: 'var(--accent-embedding)' }}>→</span>
                  <span style={{
                    padding: '12px 20px',
                    background: 'var(--accent-embedding)',
                    color: 'var(--bg-primary)',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '1.1rem'
                  }}>
                    {currentMethod.example.target}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {currentMethod.example.explanation}
                </p>
              </div>
            )}

            {/* Skip-gram 示例 */}
            {activeMethod === 'skipgram' && currentMethod.example && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>
                  训练示例：联想预测
                </h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '20px',
                  flexWrap: 'wrap',
                  marginBottom: '20px'
                }}>
                  <span style={{
                    padding: '15px 25px',
                    background: 'var(--accent-embedding)',
                    color: 'var(--bg-primary)',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '1.2rem'
                  }}>
                    {currentMethod.example.center}
                  </span>
                  <span style={{ fontSize: '1.5rem', color: 'var(--accent-embedding)' }}>→</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {currentMethod.example.context.map((word, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '10px 16px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {currentMethod.example.explanation}
                </p>
              </div>
            )}

            {/* BERT 训练任务 */}
            {activeMethod === 'bert' && currentMethod.trainingTasks && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>
                  预训练任务
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {currentMethod.trainingTasks.map((task, i) => (
                    <div key={i} style={{
                      background: 'var(--bg-card)',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      textAlign: 'left'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: 'var(--accent-embedding)',
                        marginBottom: '10px'
                      }}>
                        {task.name}
                      </div>
                      <div style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        marginBottom: '10px'
                      }}>
                        {task.description}
                      </div>
                      <code style={{
                        display: 'block',
                        background: 'var(--bg-tertiary)',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: 'var(--accent-success)'
                      }}>
                        {task.example}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 上下文嵌入示例 */}
            {activeMethod === 'elmo' && currentMethod.example && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>
                  上下文敏感性演示："{currentMethod.example.word}"
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {currentMethod.example.contexts.map((ctx, i) => (
                    <div key={i} style={{
                      background: 'var(--bg-card)',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      textAlign: 'left'
                    }}>
                      <div style={{
                        color: 'var(--text-primary)',
                        marginBottom: '10px',
                        fontSize: '1rem'
                      }}>
                        "{ctx.sentence}"
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        background: i === 0 ? 'rgba(34, 211, 238, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: i === 0 ? 'var(--accent-embedding)' : 'var(--accent-warning)',
                        borderRadius: '20px',
                        fontSize: '0.85rem'
                      }}>
                        含义：{ctx.meaning}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{
                  color: 'var(--accent-embedding)',
                  marginTop: '15px',
                  fontWeight: '500'
                }}>
                  ✨ 同一个词 "{currentMethod.example.word}" 在不同语境中获得不同的向量表示！
                </p>
              </div>
            )}

            {/* 优缺点（静态方法） */}
            {currentMethod.pros && currentMethod.cons && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginTop: '25px',
                textAlign: 'left'
              }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--accent-success)'
                }}>
                  <div style={{
                    fontWeight: '600',
                    color: 'var(--accent-success)',
                    marginBottom: '12px'
                  }}>
                    ✅ 优点
                  </div>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                  }}>
                    {currentMethod.pros.map((pro, i) => (
                      <li key={i} style={{ marginBottom: '6px' }}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--accent-danger)'
                }}>
                  <div style={{
                    fontWeight: '600',
                    color: 'var(--accent-danger)',
                    marginBottom: '12px'
                  }}>
                    ❌ 缺点
                  </div>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                  }}>
                    {currentMethod.cons.map((con, i) => (
                      <li key={i} style={{ marginBottom: '6px' }}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 架构标签 */}
            {currentMethod.architecture && (
              <div style={{ marginTop: '20px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: 'var(--accent-primary)',
                  borderRadius: '20px',
                  fontSize: '0.85rem'
                }}>
                  架构：{currentMethod.architecture}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingParadigmsViz;

import React, { useState } from 'react';
import { embeddingHistory } from '../data/embeddingHistory';

const EmbeddingHistoryTimeline = () => {
  const [expandedIds, setExpandedIds] = useState(['word2vec']);

  const toggleExpand = (id) => {
    setExpandedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="embedding-tab fade-in">
      <div className="embedding-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 className="section-title">📜 Embedding 发展历史</h2>

        <div className="content-text">
          <p>
            词嵌入（Word Embedding）的发展是自然语言处理领域最重要的进步之一。
            从最初简单的 One-Hot 编码，到如今大模型产生的上下文敏感嵌入，
            让我们一起回顾这段精彩的历程。
          </p>
        </div>

        <div className="analogy-box">
          <strong>💡 核心演进：</strong>
          稀疏离散 → 稠密静态 → 上下文动态 → 大模型时代
        </div>

        <div className="timeline-container">
          <div className="timeline-trunk"></div>

          {embeddingHistory.map((item, index) => (
            <div
              key={item.id}
              className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
            >
              <div
                className="timeline-connector"
                onClick={() => toggleExpand(item.id)}
                title="点击展开/收起"
              />

              <div
                className={`timeline-card ${expandedIds.includes(item.id) ? 'expanded' : ''}`}
                onClick={() => toggleExpand(item.id)}
              >
                <div className="timeline-year">
                  <span style={{ marginRight: '8px' }}>{item.icon}</span>
                  {item.year}
                </div>
                <div className="timeline-title">{item.title}</div>
                <div className="timeline-subtitle">{item.subtitle}</div>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  margin: 0
                }}>
                  {item.description}
                </p>

                {expandedIds.includes(item.id) && (
                  <div className="timeline-details fade-in">
                    {item.details.split('\n').map((paragraph, i) => (
                      <p key={i} style={{ marginBottom: '10px' }}>
                        {paragraph}
                      </p>
                    ))}

                    <div className="timeline-tags">
                      {item.tags.map((tag, i) => (
                        <span key={i} className="timeline-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="visual-container" style={{ marginTop: '40px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>
            📈 技术演进总结
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            textAlign: 'left'
          }}>
            <div style={{
              background: 'var(--bg-card)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📍</div>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                第一阶段：离散表示
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                One-Hot Encoding<br/>
                维度高、稀疏、无语义
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid var(--accent-embedding)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🚀</div>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--accent-embedding)' }}>
                第二阶段：静态嵌入
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Word2Vec / GloVe / FastText<br/>
                低维、稠密、有语义
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid var(--accent-primary)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌊</div>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--accent-primary)' }}>
                第三阶段：动态嵌入
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                ELMo / BERT / GPT<br/>
                上下文敏感、深度理解
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid var(--accent-warning)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌟</div>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--accent-warning)' }}>
                第四阶段：大模型时代
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                GPT-4 / LLaMA / Qwen<br/>
                超大规模、涌现能力
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbeddingHistoryTimeline;

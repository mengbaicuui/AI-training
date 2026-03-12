import { useState, useMemo } from 'react';
import {
  rerankSections,
  rerankWarmupQuestions,
  rerankQuestions,
  rerankDemoChunks,
} from '../data/rerankingData';
import QuestionPanel from './QuestionPanel';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderMarkdown(text = '') {
  return {
    __html: escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />'),
  };
}

const RerankingTab = () => {
  const [activeSection, setActiveSection] = useState(rerankSections[0].id);
  const [showReranked, setShowReranked] = useState(false);

  const currentSection = rerankSections.find((s) => s.id === activeSection);

  const sortedByBiEncoder = useMemo(
    () => [...rerankDemoChunks].sort((a, b) => b.biEncoderScore - a.biEncoderScore),
    []
  );

  const sortedByCrossEncoder = useMemo(
    () => [...rerankDemoChunks].sort((a, b) => b.crossEncoderScore - a.crossEncoderScore),
    []
  );

  const displayChunks = showReranked ? sortedByCrossEncoder : sortedByBiEncoder;

  const relevanceColor = (rel) => {
    switch (rel) {
      case 'high': return 'var(--accent-success)';
      case 'medium': return 'var(--accent-info)';
      case 'low': return 'var(--accent-warning)';
      case 'noise': return 'var(--accent-danger)';
      default: return 'var(--text-muted)';
    }
  };

  const relevanceLabel = (rel) => {
    switch (rel) {
      case 'high': return '高相关';
      case 'medium': return '中相关';
      case 'low': return '低相关';
      case 'noise': return '噪声';
      default: return '';
    }
  };

  const rankChange = (chunk) => {
    const bIdx = sortedByBiEncoder.findIndex((c) => c.id === chunk.id);
    const cIdx = sortedByCrossEncoder.findIndex((c) => c.id === chunk.id);
    return bIdx - cIdx;
  };

  const CodeBlock = ({ code, lang = 'python' }) => (
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">{lang}</span>
      </div>
      <div className="code-content"><pre>{code}</pre></div>
    </div>
  );

  const ConceptGrid = ({ items = [] }) => {
    if (!items.length) return null;
    return (
      <div className="content-block">
        <h4 className="block-title">概念讲解</h4>
        <div className="compare-grid">
          {items.map((item) => (
            <div key={item.term} className="compare-card">
              <div className="compare-card-title">{item.term}</div>
              <div className="compare-card-body" dangerouslySetInnerHTML={renderMarkdown(item.desc)} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const IllustrationGallery = ({ items = [] }) => {
    if (!items.length) return null;
    return (
      <>
        {items.map((item, idx) => (
          <div key={`${item.src}-${idx}`} className="content-block">
            <h4 className="block-title">{item.title}</h4>
            {item.description && (
              <p className="content-text" dangerouslySetInnerHTML={renderMarkdown(item.description)} />
            )}
            <div style={{ textAlign: 'center', margin: 'var(--spacing-md) 0' }}>
              <img
                src={item.src}
                alt={item.title}
                style={{
                  maxWidth: '100%',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              />
            </div>
          </div>
        ))}
      </>
    );
  };

  const PracticeList = ({ items = [] }) => {
    if (!items.length) return null;
    return (
      <div className="content-block">
        <h4 className="block-title">工程实践</h4>
        <div className="highlight-box">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((item, idx) => (
              <li
                key={`${item}-${idx}`}
                style={{
                  padding: 'var(--spacing-xs) 0',
                  color: 'var(--text-secondary)',
                  borderBottom: idx === items.length - 1 ? 'none' : '1px solid rgba(99, 102, 241, 0.1)',
                }}
                dangerouslySetInnerHTML={renderMarkdown(item)}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const ExtensionList = ({ items = [] }) => {
    const [openIndex, setOpenIndex] = useState(null);
    if (!items.length) return null;

    return (
      <div className="content-block">
        <h4 className="block-title">思考延伸</h4>
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={`${item.question}-${idx}`} className="compare-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-md)', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', flex: 1 }} dangerouslySetInnerHTML={renderMarkdown(item.question)} />
                  <button
                    type="button"
                    className="sidebar-nav-item"
                    style={{ padding: '6px 10px', minWidth: 'auto' }}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                  >
                    {isOpen ? '收起思路' : '查看解题思路'}
                  </button>
                </div>
                {isOpen && (
                  <div className="highlight-box" style={{ marginTop: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 'var(--spacing-xs)' }}>
                      解题思路
                    </div>
                    <div className="content-text" style={{ margin: 0 }} dangerouslySetInnerHTML={renderMarkdown(item.approach)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const SectionContent = ({ section }) => (
    <div className="fade-in">
      <h2 className="section-title">
        <span>{section.icon}</span>
        {section.title}
      </h2>

      <IllustrationGallery items={section.illustrations} />

      {section.content?.map((para, idx) => (
        <p key={idx} className="content-text" dangerouslySetInnerHTML={renderMarkdown(para)} />
      ))}

      <ConceptGrid items={section.concepts} />

      {section.keyPoints?.length > 0 && (
        <div className="highlight-box">
          <h4 className="block-title" style={{ marginBottom: 'var(--spacing-sm)' }}>🎯 核心要点</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {section.keyPoints.map((point, idx) => (
              <li
                key={`${point}-${idx}`}
                style={{
                  padding: 'var(--spacing-xs) 0',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  borderBottom: idx === section.keyPoints.length - 1 ? 'none' : '1px solid rgba(99, 102, 241, 0.1)',
                  paddingLeft: 'var(--spacing-md)',
                  position: 'relative',
                }}
              >
                <span style={{ position: 'absolute', left: 0, color: 'var(--accent-primary)', fontWeight: 'bold' }}>›</span>
                <span dangerouslySetInnerHTML={renderMarkdown(point)} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <PracticeList items={section.engineeringPractice} />

      {section.codeExamples?.map((example, idx) => (
        <div key={`${section.id}-${idx}`} className="content-block">
          <h4 className="block-title">{example.title}</h4>
          {example.description && (
            <p
              className="content-text"
              style={{ marginBottom: 'var(--spacing-md)' }}
              dangerouslySetInnerHTML={renderMarkdown(example.description)}
            />
          )}
          <CodeBlock code={example.code} lang={example.lang || 'python'} />
          {example.outputSummary && (
            <div className="highlight-box" style={{ marginTop: 'var(--spacing-md)' }}>
              <p className="content-text" style={{ margin: 0 }} dangerouslySetInnerHTML={renderMarkdown(example.outputSummary)} />
            </div>
          )}
        </div>
      ))}

      {!section.codeExamples && section.codeExample && (
        <CodeBlock code={section.codeExample} lang="python" />
      )}

      <ExtensionList items={section.extensions} />
    </div>
  );

  return (
    <div className="section-tab">
      <aside className="section-sidebar">
        <div className="sidebar-title">🎯 Rerank & 上下文组装</div>
        <nav className="sidebar-nav">
          {rerankSections.map((s) => (
            <button
              key={s.id}
              className={`sidebar-nav-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span>{s.icon}</span> {s.title}
            </button>
          ))}
          <button
            className={`sidebar-nav-item ${activeSection === 'demo' ? 'active' : ''}`}
            onClick={() => setActiveSection('demo')}
          >
            <span>🧪</span> 交互式 Rerank Demo
          </button>
        </nav>
      </aside>

      <div className="section-main">
        {activeSection !== 'demo' && currentSection && (
          <SectionContent section={currentSection} />
        )}

        {activeSection === 'demo' && (
          <div className="fade-in">
            <h2 className="section-title">
              <span>🧪</span>
              交互式 Rerank 演示
            </h2>

            <div className="highlight-box" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <p className="content-text" style={{ marginBottom: 0 }}>
                <strong>查询：</strong>"海外出差的住宿报销标准是多少？"
              </p>
              <p className="content-text" style={{ marginBottom: 0, marginTop: 'var(--spacing-sm)', fontSize: '0.85rem' }}>
                下面展示 10 个候选 chunk 在 bi-encoder 初排和 cross-encoder rerank 后的排序变化。点击切换按钮观察顺序和分数的变化。
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <button
                onClick={() => setShowReranked(false)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-lg)',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${!showReranked ? 'var(--accent-warning)' : 'var(--border-color)'}`,
                  background: !showReranked ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-tertiary)',
                  color: !showReranked ? 'var(--accent-warning)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all var(--transition-fast)',
                }}
              >
                Bi-Encoder 初排
              </button>

              <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</span>

              <button
                onClick={() => setShowReranked(true)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-lg)',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${showReranked ? 'var(--accent-info)' : 'var(--border-color)'}`,
                  background: showReranked ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                  color: showReranked ? 'var(--accent-info)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all var(--transition-fast)',
                }}
              >
                Cross-Encoder Rerank
              </button>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--spacing-md)' }}>
                <span className="tag tag-success">高相关</span>
                <span className="tag tag-info">中相关</span>
                <span className="tag tag-warning">低相关</span>
                <span className="tag tag-danger">噪声</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
              <div className="metric-card" style={{ flex: 1, minWidth: 150 }}>
                <div className="metric-label">排序方式</div>
                <div className="metric-value" style={{ fontSize: '1rem', color: showReranked ? 'var(--accent-info)' : 'var(--accent-warning)' }}>
                  {showReranked ? 'Cross-Encoder' : 'Bi-Encoder'}
                </div>
              </div>
              <div className="metric-card" style={{ flex: 1, minWidth: 150 }}>
                <div className="metric-label">Top-3 精度</div>
                <div className={`metric-value ${showReranked ? 'good' : 'warn'}`} style={{ fontSize: '1.2rem' }}>
                  {showReranked ? '100%' : '33%'}
                </div>
              </div>
              <div className="metric-card" style={{ flex: 1, minWidth: 150 }}>
                <div className="metric-label">噪声 Chunk 排名</div>
                <div className={`metric-value ${showReranked ? 'good' : 'bad'}`} style={{ fontSize: '1.2rem' }}>
                  {showReranked ? '第 8-10' : '第 3-4'}
                </div>
              </div>
            </div>

            {displayChunks.map((chunk, idx) => {
              const change = rankChange(chunk);
              return (
                <div
                  key={chunk.id}
                  className={`chunk-card ${chunk.relevance === 'high' ? 'relevant' : ''} ${chunk.relevance === 'noise' ? 'noise' : ''}`}
                  style={{
                    transition: 'all 0.4s ease',
                  }}
                >
                  <div className="chunk-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <span style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {idx + 1}
                      </span>
                      <span className="chunk-source">{chunk.source}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      {showReranked && change !== 0 && (
                        <span style={{
                          fontSize: '0.75rem',
                          fontFamily: "'JetBrains Mono', monospace",
                          color: change > 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
                          fontWeight: 600,
                        }}>
                          {change > 0 ? `↑${change}` : `↓${Math.abs(change)}`}
                        </span>
                      )}
                      <span
                        className="chunk-score"
                        style={{
                          background: showReranked ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: showReranked ? 'var(--accent-info)' : 'var(--accent-warning)',
                        }}
                      >
                        {showReranked
                          ? `CE: ${chunk.crossEncoderScore.toFixed(2)}`
                          : `BE: ${chunk.biEncoderScore.toFixed(2)}`}
                      </span>
                      <span className="tag" style={{
                        background: `${relevanceColor(chunk.relevance)}22`,
                        color: relevanceColor(chunk.relevance),
                      }}>
                        {relevanceLabel(chunk.relevance)}
                      </span>
                    </div>
                  </div>
                  <div className="chunk-text">{chunk.text}</div>

                  {showReranked && (
                    <div style={{
                      marginTop: 'var(--spacing-sm)',
                      display: 'flex',
                      gap: 'var(--spacing-md)',
                      alignItems: 'center',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div className="score-bar-container">
                          <span className="score-bar-label">Bi-Encoder</span>
                          <div className="score-bar">
                            <div
                              className="score-bar-fill bm25"
                              style={{ width: `${chunk.biEncoderScore * 100}%` }}
                            />
                          </div>
                          <span className="score-bar-value">{chunk.biEncoderScore.toFixed(2)}</span>
                        </div>
                        <div className="score-bar-container">
                          <span className="score-bar-label">Cross-Encoder</span>
                          <div className="score-bar">
                            <div
                              className="score-bar-fill rerank"
                              style={{ width: `${chunk.crossEncoderScore * 100}%` }}
                            />
                          </div>
                          <span className="score-bar-value">{chunk.crossEncoderScore.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="summary-box">
              <div className="summary-title">📌 关键观察</div>
              <ul className="summary-list">
                <li>
                  <strong>Bi-Encoder 排序问题：</strong>国内住宿标准（中相关）和旧版海外标准（噪声）被排在高位，因为它们的 embedding 与 query 表面相似度高
                </li>
                <li>
                  <strong>Cross-Encoder 修正：</strong>精确命中"海外出差住宿标准"的 chunk 从第 3 名提升到第 1 名（↑2），旧版文档从第 3 名降到第 8 名（↓5）
                </li>
                <li>
                  <strong>噪声过滤：</strong>完全无关的"空调温度通知"从 bi-encoder 的 0.42 分降至 cross-encoder 的 0.05 分，排到末尾
                </li>
                <li>
                  <strong>Top-3 精度：</strong>bi-encoder 的 top-3 只有 1 个高相关（33%），rerank 后 top-3 全部是高/中相关（100%）
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <QuestionPanel
        questions={rerankQuestions}
        warmupQuestions={rerankWarmupQuestions}
        sectionTitle="Rerank & 上下文组装"
      />
    </div>
  );
};

export default RerankingTab;

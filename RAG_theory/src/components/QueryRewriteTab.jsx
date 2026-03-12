import { useState } from 'react';
import {
  queryRewriteSections,
  queryRewriteWarmupQuestions,
  queryRewriteQuestions,
  queryDecomposeDemo,
} from '../data/queryRewriteData';
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

const QueryRewriteTab = () => {
  const [activeSection, setActiveSection] = useState(queryRewriteSections[0].id);
  const [demoStep, setDemoStep] = useState(0);

  const currentSection = queryRewriteSections.find((s) => s.id === activeSection);
  const demo = queryDecomposeDemo;

  const analysisKeys = Object.keys(demo.analysis);
  const analysisEntries = Object.values(demo.analysis);

  const stepLabels = [
    '原始 Query',
    '约束提取',
    '子查询拆分',
    '分别检索',
    '最终回答',
  ];

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

      {!section.codeExamples && section.codeExample && <CodeBlock code={section.codeExample} lang="python" />}

      <ExtensionList items={section.extensions} />
    </div>
  );

  return (
    <div className="section-tab">
      <aside className="section-sidebar">
        <div className="sidebar-title">✍️ Query 改写</div>
        <nav className="sidebar-nav">
          {queryRewriteSections.map((s) => (
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
            <span>🧪</span> Query Decomposition 演示
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
              Query Decomposition 交互演示
            </h2>

            <p className="content-text">
              一个复杂的企业查询如何被拆解、提取约束、分别检索，最终合成准确回答。点击下方步骤按钮逐步观察。
            </p>

            <div style={{
              display: 'flex',
              gap: 'var(--spacing-xs)',
              marginBottom: 'var(--spacing-xl)',
              flexWrap: 'wrap',
            }}>
              {stepLabels.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setDemoStep(i)}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${demoStep === i ? 'var(--accent-primary)' : demoStep > i ? 'var(--accent-success)' : 'var(--border-color)'}`,
                    background: demoStep === i
                      ? 'rgba(99, 102, 241, 0.2)'
                      : demoStep > i
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'var(--bg-tertiary)',
                    color: demoStep === i
                      ? 'var(--accent-primary)'
                      : demoStep > i
                        ? 'var(--accent-success)'
                        : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: demoStep === i ? 600 : 400,
                    fontSize: '0.85rem',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                  }}
                >
                  <span style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: demoStep === i
                      ? 'var(--accent-primary)'
                      : demoStep > i
                        ? 'var(--accent-success)'
                        : 'var(--bg-card)',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {demoStep > i ? '✓' : i + 1}
                  </span>
                  {label}
                </button>
              ))}
            </div>

            {/* Step 0: Original Query */}
            {demoStep >= 0 && (
              <div className="content-block">
                <h4 className="block-title">原始用户查询</h4>
                <div style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--spacing-lg)',
                  border: '2px solid var(--accent-primary)',
                  fontSize: '1.1rem',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  lineHeight: 1.8,
                  position: 'relative',
                }}>
                  <span style={{
                    position: 'absolute',
                    top: -10,
                    left: 16,
                    background: 'var(--accent-primary)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    USER QUERY
                  </span>
                  {demoStep >= 1 ? (
                    <span>
                      <HighlightSpan color={demo.analysis.timeConstraint.color}>
                        {demo.analysis.timeConstraint.raw}
                      </HighlightSpan>
                      <HighlightSpan color={demo.analysis.deptConstraint.color}>
                        {demo.analysis.deptConstraint.raw}
                      </HighlightSpan>
                      发布的
                      <HighlightSpan color={demo.analysis.topicConstraint.color}>
                        {demo.analysis.topicConstraint.raw}
                      </HighlightSpan>
                      中，
                      <HighlightSpan color={demo.analysis.specificQuestion.color}>
                        {demo.analysis.specificQuestion.raw}
                      </HighlightSpan>
                      ？
                    </span>
                  ) : (
                    demo.originalQuery
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Constraint Extraction */}
            {demoStep >= 1 && (
              <div className="content-block fade-in">
                <h4 className="block-title">约束提取结果</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 'var(--spacing-md)',
                }}>
                  {analysisKeys.map((key, i) => {
                    const entry = analysisEntries[i];
                    const labels = ['时间约束', '部门约束', '主题约束', '具体问题'];
                    return (
                      <div
                        key={key}
                        style={{
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--spacing-md)',
                          borderLeft: `4px solid ${entry.color}`,
                        }}
                      >
                        <div style={{
                          fontSize: '0.75rem',
                          color: entry.color,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: 'var(--spacing-xs)',
                        }}>
                          {labels[i]}
                        </div>
                        <div style={{
                          fontSize: '0.95rem',
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                          marginBottom: 'var(--spacing-xs)',
                        }}>
                          "{entry.raw}"
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                        }}>
                          → {entry.parsed}
                        </div>
                        {entry.filterValue && (
                          <div style={{
                            marginTop: 'var(--spacing-xs)',
                            display: 'inline-block',
                            padding: '1px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: `${entry.color}22`,
                            color: entry.color,
                            fontSize: '0.75rem',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            filter: {entry.filterValue}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Sub-queries */}
            {demoStep >= 2 && (
              <div className="content-block fade-in">
                <h4 className="block-title">拆分子查询</h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-md)',
                }}>
                  {demo.subQueries.map((sq) => (
                    <div
                      key={sq.id}
                      style={{
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        marginBottom: 'var(--spacing-sm)',
                      }}>
                        <span style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: 'var(--accent-secondary)',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {sq.id}
                        </span>
                        <span style={{
                          fontSize: '0.95rem',
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                        }}>
                          {sq.query}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-md)',
                        flexWrap: 'wrap',
                      }}>
                        <span className="tag tag-primary">{sq.intent}</span>
                        {Object.entries(sq.filters).map(([k, v]) => (
                          <span
                            key={k}
                            style={{
                              fontSize: '0.75rem',
                              fontFamily: "'JetBrains Mono', monospace",
                              padding: '1px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(139, 92, 246, 0.15)',
                              color: 'var(--accent-tertiary)',
                            }}
                          >
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Retrieval results */}
            {demoStep >= 3 && (
              <div className="content-block fade-in">
                <h4 className="block-title">各子查询检索结果</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: 'var(--spacing-lg)',
                }}>
                  {demo.subQueries.map((sq) => (
                    <div key={sq.id}>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--spacing-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                      }}>
                        <span style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: 'var(--accent-secondary)',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {sq.id}
                        </span>
                        子查询 {sq.id} 检索结果
                      </div>
                      {sq.results.map((r, ri) => (
                        <div
                          key={ri}
                          className={`chunk-card ${r.relevant ? 'relevant' : ''}`}
                          style={{ marginBottom: 'var(--spacing-xs)' }}
                        >
                          <div className="chunk-card-header">
                            <span className="chunk-source">{r.doc}</span>
                            <span
                              className="chunk-score"
                              style={{
                                background: r.relevant ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: r.relevant ? 'var(--accent-success)' : 'var(--accent-warning)',
                              }}
                            >
                              {r.score.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Final answer */}
            {demoStep >= 4 && (
              <div className="content-block fade-in">
                <h4 className="block-title">LLM 最终回答</h4>
                <div className="success-box" style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    top: -10,
                    left: 16,
                    background: 'var(--accent-success)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    ANSWER
                  </span>
                  <p className="content-text" style={{ marginBottom: 0, marginTop: 'var(--spacing-sm)' }}>
                    {demo.finalAnswer}
                  </p>
                </div>

                <div className="summary-box">
                  <div className="summary-title">📌 Decomposition 效果分析</div>
                  <ul className="summary-list">
                    <li>
                      <strong>约束保留：</strong>时间（2025-Q3）、部门（财务部）约束被正确提取并转为 metadata filter，避免召回旧版本文档
                    </li>
                    <li>
                      <strong>子查询分工：</strong>子查询 1 负责定位文档范围，子查询 2 负责精确定位具体内容。两者互补而非重复
                    </li>
                    <li>
                      <strong>噪声过滤：</strong>v2 旧版文档虽然被子查询 1 召回（score 0.71），但因时间 filter 不匹配被排除
                    </li>
                    <li>
                      <strong>对比直接检索：</strong>如果直接用原始 query 检索，可能同时召回 v2/v3 版本、国内/海外标准，LLM 需要自己判断版本——增加幻觉风险
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <QuestionPanel
        questions={queryRewriteQuestions}
        warmupQuestions={queryRewriteWarmupQuestions}
        sectionTitle="Query 改写"
      />
    </div>
  );
};

const HighlightSpan = ({ color, children }) => (
  <span style={{
    background: `${color}33`,
    color: color,
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 600,
    borderBottom: `2px solid ${color}`,
  }}>
    {children}
  </span>
);

export default QueryRewriteTab;

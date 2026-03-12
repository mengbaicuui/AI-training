import { useState } from 'react';
import { agenticSections, agenticTimelineDemo, agenticWarmupQuestions, agenticQuestions } from '../data/agenticRAGData';
import QuestionPanel from './QuestionPanel';

const PhaseTag = ({ phase, color }) => (
  <span
    className="tag"
    style={{ background: `${color}22`, color, fontWeight: 600 }}
  >
    {phase}
  </span>
);

const TimelineStep = ({ step, isActive, onClick }) => (
  <div
    className={`trace-step ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    <div
      className="trace-step-number"
      style={{ background: step.phaseColor }}
    >
      {step.id}
    </div>
    <div className="trace-step-content">
      <div className="trace-step-title">
        <PhaseTag phase={step.phase} color={step.phaseColor} />
        {' '}{step.title}
      </div>
      <div className="trace-step-desc">{step.description}</div>
      <div className="trace-step-meta">
        <span className="trace-step-badge">🎯 {step.evidence.slice(0, 40)}…</span>
        <span className="trace-step-badge">🔤 {step.tokens} tokens</span>
        <span className="trace-step-badge">⏱ {step.time}</span>
      </div>
    </div>
  </div>
);

const renderContent = (blocks) =>
  blocks.map((block, i) => {
    switch (block.type) {
      case 'text':
        return (
          <p key={i} className="content-text" dangerouslySetInnerHTML={{ __html: block.value.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        );
      case 'list':
        return (
          <div key={i} className="content-block">
            {block.title && <h4 className="block-title">{block.title}</h4>}
            <ul className="detail-section" style={{ marginBottom: 'var(--spacing-md)' }}>
              {block.items.map((item, j) => (
                <li key={j} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', padding: 'var(--spacing-xs) 0', paddingLeft: 'var(--spacing-md)', position: 'relative' }}>
                  <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>') }} />
                </li>
              ))}
            </ul>
          </div>
        );
      case 'highlight':
        return (
          <div key={i} className="highlight-box">
            <p className="content-text" style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: block.value.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        );
      case 'warning':
        return (
          <div key={i} className="warning-box">
            <p className="content-text" style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: block.value.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        );
      case 'danger':
        return (
          <div key={i} className="danger-box">
            <p className="content-text" style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: block.value.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        );
      case 'code':
        return (
          <div key={i} className="code-block">
            <div className="code-header">
              <span className="code-lang">{block.title || block.lang}</span>
            </div>
            <div className="code-content">
              <pre>{block.value}</pre>
            </div>
          </div>
        );
      case 'compare':
        return (
          <div key={i} className="content-block">
            {block.title && <h4 className="block-title">{block.title}</h4>}
            <div className="compare-grid">
              {block.items.map((item, j) => (
                <div key={j} className="compare-card">
                  <div className="compare-card-title">{item.name}</div>
                  <div className="compare-card-body">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'table':
        return (
          <div key={i} className="content-block">
            {block.title && <h4 className="block-title">{block.title}</h4>}
            <div style={{ overflowX: 'auto' }}>
              <table className="info-table">
                <thead>
                  <tr>
                    {block.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, j) => (
                    <tr key={j}>
                      {row.map((cell, k) => (
                        <td key={`${j}-${k}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={i} className="content-block">
            {block.title && <h4 className="block-title">{block.title}</h4>}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-md)',
              }}
            >
              <img
                src={block.src}
                alt={block.alt || block.title || 'diagram'}
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-md)',
                  display: 'block',
                }}
              />
              {block.caption && (
                <p className="content-text" style={{ marginTop: 'var(--spacing-sm)', marginBottom: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {block.caption}
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  });

const AgenticRAGTab = () => {
  const [activeSection, setActiveSection] = useState(agenticSections[0].id);
  const [activeStep, setActiveStep] = useState(1);

  const currentSection = agenticSections.find(s => s.id === activeSection);
  const currentStep = agenticTimelineDemo.steps.find(s => s.id === activeStep);

  return (
    <div className="section-tab">
      <aside className="section-sidebar">
        <div className="sidebar-title">🤖 Agentic RAG</div>
        <nav className="sidebar-nav">
          {agenticSections.map((sec) => (
            <button
              key={sec.id}
              className={`sidebar-nav-item ${activeSection === sec.id ? 'active' : ''}`}
              onClick={() => setActiveSection(sec.id)}
            >
              <span>{sec.icon}</span>
              <span>{sec.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="section-main">
        {currentSection && (
          <div className="fade-in" key={currentSection.id}>
            <h2 className="section-title">
              <span>{currentSection.icon}</span>
              {currentSection.title}
            </h2>

            {activeSection === 'plan-act-observe' && (
              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3 className="block-title" style={{ marginBottom: 'var(--spacing-md)' }}>
                  🔬 实战演示：{agenticTimelineDemo.query}
                </h3>

                <div className="metric-grid" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <div className="metric-card">
                    <div className="metric-label">总步数</div>
                    <div className="metric-value good">{agenticTimelineDemo.stepsCount}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">总 Token</div>
                    <div className="metric-value warn">{agenticTimelineDemo.totalTokens.toLocaleString()}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">总耗时</div>
                    <div className="metric-value good">{agenticTimelineDemo.totalTime}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  <div style={{ flex: '0 0 340px' }}>
                    <div className="trace-timeline">
                      {agenticTimelineDemo.steps.map((step) => (
                        <TimelineStep
                          key={step.id}
                          step={step}
                          isActive={activeStep === step.id}
                          onClick={() => setActiveStep(step.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {currentStep && (
                    <div className="detail-panel" style={{ flex: 1 }}>
                      <div className="detail-header">
                        <div className="detail-title">
                          <PhaseTag phase={currentStep.phase} color={currentStep.phaseColor} />
                          Step {currentStep.id}: {currentStep.title}
                        </div>
                      </div>
                      <div className="detail-section">
                        <h4>执行详情</h4>
                        <div className="code-block">
                          <div className="code-content">
                            <pre>{currentStep.detail}</pre>
                          </div>
                        </div>
                      </div>
                      <div className="detail-section">
                        <h4>获得证据</h4>
                        <div className="success-box" style={{ margin: 0 }}>
                          <p className="content-text" style={{ margin: 0 }}>{currentStep.evidence}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                        <div className="metric-card" style={{ flex: 1 }}>
                          <div className="metric-label">Tokens</div>
                          <div className="metric-value" style={{ fontSize: '1.2rem', color: 'var(--accent-warning)' }}>{currentStep.tokens}</div>
                        </div>
                        <div className="metric-card" style={{ flex: 1 }}>
                          <div className="metric-label">耗时</div>
                          <div className="metric-value" style={{ fontSize: '1.2rem', color: 'var(--accent-info)' }}>{currentStep.time}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {renderContent(currentSection.content)}
          </div>
        )}
      </div>

      <QuestionPanel
        warmupQuestions={agenticWarmupQuestions}
        questions={agenticQuestions}
        sectionTitle="Agentic RAG"
      />
    </div>
  );
};

export default AgenticRAGTab;

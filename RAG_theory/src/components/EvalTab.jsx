import { useState } from 'react';
import { evalSections, evalWarmupQuestions, evalQuestions } from '../data/evalData';
import QuestionPanel from './QuestionPanel';

const EvalTab = () => {
  const [activeSection, setActiveSection] = useState(evalSections[0].id);
  const [expandedTreeNodes, setExpandedTreeNodes] = useState({});

  const currentSection = evalSections.find(s => s.id === activeSection);

  const toggleTreeNode = (key) => {
    setExpandedTreeNodes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderMetricCards = (metrics) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      {metrics.map((m, i) => (
        <div key={i} className="compare-card">
          <div className="compare-card-title">
            <span className="tag tag-primary">{m.name}</span>
          </div>
          <div className="compare-card-body">
            {m.formula && (
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <strong style={{ color: 'var(--accent-info)', fontSize: '0.8rem' }}>计算方式：</strong>
                <span style={{ fontSize: '0.85rem' }}>{m.formula}</span>
              </div>
            )}
            <p style={{ marginBottom: 'var(--spacing-sm)' }}>{m.interpretation || m.desc}</p>
            {m.howToMeasure && (
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <strong style={{ fontSize: '0.8rem' }}>测量方法：</strong>
                <span style={{ fontSize: '0.85rem' }}>{m.howToMeasure}</span>
              </div>
            )}
            {m.pitfall && (
              <div className="warning-box" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{ fontSize: '0.85rem' }}>⚠️ {m.pitfall}</span>
              </div>
            )}
            {m.target && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <span className="tag tag-success">目标</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>{m.target}</span>
              </div>
            )}
            {m.actionable && (
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-warning)', marginTop: 'var(--spacing-xs)' }}>
                → {m.actionable}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMetricDashboard = () => {
    const layers = [
      {
        name: '检索层',
        color: 'var(--accent-info)',
        bg: 'rgba(6,182,212,0.12)',
        metrics: [
          { label: 'Recall@10', value: '0.92', status: 'good' },
          { label: 'MRR', value: '0.78', status: 'good' },
          { label: 'nDCG@10', value: '0.71', status: 'good' },
          { label: 'Effective Recall', value: '0.88', status: 'warn' },
        ]
      },
      {
        name: '生成层',
        color: 'var(--accent-primary)',
        bg: 'rgba(99,102,241,0.12)',
        metrics: [
          { label: 'Faithfulness', value: '0.93', status: 'good' },
          { label: 'Relevancy', value: '0.87', status: 'good' },
          { label: 'Citation Correct', value: '0.96', status: 'good' },
          { label: 'Citation Cover', value: '0.82', status: 'warn' },
        ]
      },
      {
        name: '运营层',
        color: 'var(--accent-warning)',
        bg: 'rgba(245,158,11,0.12)',
        metrics: [
          { label: 'p95 Latency', value: '4.2s', status: 'good' },
          { label: '负反馈率', value: '8%', status: 'good' },
          { label: '$/request', value: '$0.03', status: 'good' },
          { label: '满意度', value: '4.1/5', status: 'good' },
        ]
      }
    ];

    return (
      <div className="content-block">
        <div className="block-title">分层指标仪表盘（示例）</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {layers.map((layer, i) => (
            <div key={i} style={{
              background: layer.bg,
              border: `1px solid ${layer.color}`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md)',
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: layer.color, marginBottom: 'var(--spacing-sm)' }}>
                {layer.name}
              </div>
              <div className="metric-grid">
                {layer.metrics.map((m, j) => (
                  <div key={j} className="metric-card">
                    <div className="metric-label">{m.label}</div>
                    <div className={`metric-value ${m.status}`}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFailureTree = (tree) => (
    <div className="content-block">
      <div className="block-title">失败归因树（可展开）</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {tree.map((node, i) => (
          <div key={i} style={{
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            <div
              onClick={() => toggleTreeNode(`l1-${i}`)}
              style={{
                padding: 'var(--spacing-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                borderLeft: '4px solid var(--accent-danger)',
                transition: 'background var(--transition-fast)',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: 'var(--accent-danger)', fontWeight: 700, fontSize: '1rem' }}>
                {expandedTreeNodes[`l1-${i}`] ? '▼' : '▶'}
              </span>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {node.level1}
              </span>
              <span className="tag tag-danger" style={{ marginLeft: 'auto' }}>
                {node.causes.length} 个子原因
              </span>
            </div>

            {expandedTreeNodes[`l1-${i}`] && (
              <div style={{ padding: '0 var(--spacing-md) var(--spacing-md)', paddingLeft: 'var(--spacing-xl)' }}>
                {node.causes.map((cause, j) => (
                  <div key={j} style={{ marginTop: 'var(--spacing-sm)' }}>
                    <div
                      onClick={() => toggleTreeNode(`l2-${i}-${j}`)}
                      style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        borderLeft: '3px solid var(--accent-warning)',
                        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ color: 'var(--accent-warning)', fontWeight: 600, fontSize: '0.85rem' }}>
                        {expandedTreeNodes[`l2-${i}-${j}`] ? '▼' : '▶'}
                      </span>
                      <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {cause.level2}
                      </span>
                    </div>

                    {expandedTreeNodes[`l2-${i}-${j}`] && (
                      <div style={{
                        marginLeft: 'var(--spacing-xl)',
                        marginTop: 'var(--spacing-xs)',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        background: 'rgba(99,102,241,0.05)',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '2px solid var(--accent-primary)'
                      }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                          {cause.details}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                          <span className="tag tag-success">修复方向</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>{cause.fix}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTriad = (title, triad) => (
    <div className="content-block">
      <div className="block-title">{title}</div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-lg) 0'
      }}>
        <div style={{ position: 'relative', width: '360px', height: '300px' }}>
          {[
            { x: '50%', y: '5%', transform: 'translate(-50%, 0)', data: triad[0], color: 'var(--accent-info)' },
            { x: '5%', y: '75%', transform: 'translate(0, -50%)', data: triad[1], color: 'var(--accent-success)' },
            { x: '95%', y: '75%', transform: 'translate(-100%, -50%)', data: triad[2], color: 'var(--accent-warning)' },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              transform: pos.transform,
              background: `rgba(${pos.color === 'var(--accent-info)' ? '6,182,212' : pos.color === 'var(--accent-success)' ? '16,185,129' : '245,158,11'}, 0.12)`,
              border: `2px solid ${pos.color}`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              textAlign: 'center',
              maxWidth: '160px'
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: pos.color }}>{pos.data.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{pos.data.question}</div>
            </div>
          ))}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 360 300">
            <line x1="180" y1="80" x2="60" y2="210" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
            <line x1="180" y1="80" x2="300" y2="210" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
            <line x1="60" y1="210" x2="300" y2="210" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
          </svg>
        </div>
      </div>

      {triad.map((t, i) => (
        <div key={i} className="compare-card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div className="compare-card-title">
            <span className={`tag ${i === 0 ? 'tag-info' : i === 1 ? 'tag-success' : 'tag-warning'}`}>{t.name}</span>
          </div>
          <div className="compare-card-body">
            <p style={{ marginBottom: 'var(--spacing-sm)' }}><strong>核心问题：</strong>{t.question}</p>
            <div className="danger-box" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
              <strong>失败后果：</strong>{t.failure}
            </div>
            <p style={{ marginBottom: 'var(--spacing-sm)' }}><strong>测量方法：</strong>{t.measurement}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <span className="tag tag-success">改进方向</span>
              <span style={{ fontSize: '0.85rem' }}>{t.improveBy}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFailureMatrix = (matrix) => (
    <div className="content-block">
      <div className="block-title">失败模式矩阵</div>
      <table className="info-table">
        <thead>
          <tr>
            <th>Triad 状态</th>
            <th>诊断</th>
            <th>修复方向</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((m, i) => (
            <tr key={i}>
              <td style={{ fontSize: '0.85rem', minWidth: '200px' }}><strong>{m.scenario}</strong></td>
              <td style={{ fontSize: '0.85rem' }}>{m.diagnosis}</td>
              <td><span className="tag tag-success">{m.fix}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderToolComparison = (tools) => (
    <div className="content-block">
      <div className="block-title">评估工具链对比（2026）</div>
      <div style={{ overflowX: 'auto' }}>
        <table className="info-table">
          <thead>
            <tr>
              <th>工具</th>
              <th>类型</th>
              <th>核心优势</th>
              <th>适用场景</th>
              <th>成熟度</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((t, i) => (
              <tr key={i}>
                <td><strong style={{ color: 'var(--accent-primary)' }}>{t.name}</strong></td>
                <td><span className="tag tag-info">{t.type}</span></td>
                <td style={{ fontSize: '0.85rem' }}>
                  <ul style={{ paddingLeft: 'var(--spacing-md)', margin: 0 }}>
                    {t.strengths.slice(0, 3).map((s, j) => <li key={j}>{s}</li>)}
                  </ul>
                </td>
                <td style={{ fontSize: '0.85rem' }}>{t.bestFor}</td>
                <td><span className={`tag ${t.maturity === '成熟' ? 'tag-success' : 'tag-warning'}`}>{t.maturity}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRecommendations = (recs) => (
    <div className="content-block">
      <div className="block-title">按阶段选型建议</div>
      <div className="compare-grid">
        {recs.map((r, i) => (
          <div key={i} className="compare-card">
            <div className="compare-card-title">
              <span className="tag tag-primary">{r.stage}</span>
            </div>
            <div className="compare-card-body">
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <strong style={{ color: 'var(--accent-info)' }}>推荐组合：</strong>
                <span style={{ fontSize: '0.9rem' }}>{r.combo}</span>
              </div>
              <p style={{ fontSize: '0.85rem' }}>{r.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEvalDataset = (sub) => {
    if (sub.structure) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <table className="info-table">
            <thead>
              <tr><th>字段</th><th>说明</th><th>示例</th></tr>
            </thead>
            <tbody>
              {sub.structure.fields.map((f, i) => (
                <tr key={i}>
                  <td><code style={{ color: 'var(--accent-info)' }}>{f.field}</code></td>
                  <td>{f.desc}</td>
                  <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', maxWidth: '300px', wordBreak: 'break-all' }}>{f.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (sub.methods) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          {sub.methods.map((m, i) => (
            <div key={i} className="compare-card" style={{ marginBottom: 'var(--spacing-md)' }}>
              <div className="compare-card-title">
                <span className="tag tag-primary">{m.method}</span>
              </div>
              <div className="compare-card-body">
                <p style={{ marginBottom: 'var(--spacing-sm)' }}><strong>流程：</strong>{m.process}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                  <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--accent-success)' }}>✓</span> {m.pros}</div>
                  <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--accent-danger)' }}>✗</span> {m.cons}</div>
                </div>
                <div className="highlight-box" style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                  <strong>建议：</strong>{m.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (sub.guidelines) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div className="highlight-box">
            <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
              {sub.guidelines.map((g, i) => (
                <li key={i} style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>{g}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderCICD = (sub) => {
    if (sub.pipeline) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            {sub.pipeline.map((step, i) => (
              <div key={i} className="trace-step">
                <div className="trace-step-number">{i + 1}</div>
                <div className="trace-step-content">
                  <div className="trace-step-title" style={{ fontSize: '0.85rem' }}>{step}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (sub.codeExample) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          {sub.details && (
            <div className="highlight-box" style={{ marginBottom: 'var(--spacing-md)' }}>
              <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                {sub.details.map((d, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>{d}</li>)}
              </ul>
            </div>
          )}
          <div className="code-block">
            <div className="code-header">
              <span className="code-lang">Python (DeepEval + pytest)</span>
            </div>
            <div className="code-content">
              <pre>{sub.codeExample}</pre>
            </div>
          </div>
        </div>
      );
    }

    if (sub.practices) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div className="success-box">
            <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
              {sub.practices.map((p, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>{p}</li>)}
            </ul>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderOnlineMonitoring = (sub) => {
    if (sub.methods) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div className="compare-grid">
            {sub.methods.map((m, i) => (
              <div key={i} className="compare-card">
                <div className="compare-card-title">{m.type}</div>
                <div className="compare-card-body">
                  <p style={{ marginBottom: 'var(--spacing-sm)' }}>{m.desc}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--accent-success)' }}>✓</span> {m.pros}</div>
                    <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--accent-danger)' }}>✗</span> {m.cons}</div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-info)' }}>💡 {m.tips}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (sub.loop) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {sub.loop.map((step, i) => (
              <div key={i}>
                <div style={{
                  display: 'flex',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  background: i % 2 === 0 ? 'var(--bg-tertiary)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'white',
                    flexShrink: 0
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{step.step}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{step.desc}</div>
                  </div>
                  <div className="tag tag-info">{step.output}</div>
                </div>
                {i < sub.loop.length - 1 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', padding: '2px 0' }}>↓</div>
                )}
              </div>
            ))}
            <div style={{ textAlign: 'center', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, marginTop: 'var(--spacing-sm)' }}>
              ↻ 闭环：持续迭代，每个周期系统都更好
            </div>
          </div>
        </div>
      );
    }

    if (sub.considerations) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div className="highlight-box">
            <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
              {sub.considerations.map((c, i) => (
                <li key={i} style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (sub.alerts) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <table className="info-table">
            <thead>
              <tr>
                <th>指标</th>
                <th>告警条件</th>
                <th>严重级别</th>
                <th>响应动作</th>
              </tr>
            </thead>
            <tbody>
              {sub.alerts.map((a, i) => (
                <tr key={i}>
                  <td><strong>{a.metric}</strong></td>
                  <td style={{ fontSize: '0.85rem' }}>{a.threshold}</td>
                  <td><span className={`tag ${a.severity.includes('P1') ? 'tag-danger' : a.severity.includes('P2') ? 'tag-warning' : 'tag-info'}`}>{a.severity}</span></td>
                  <td style={{ fontSize: '0.85rem' }}>{a.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  const renderSectionContent = () => {
    if (!currentSection) return null;

    switch (currentSection.id) {
      case 'metrics':
        return (
          <>
            {renderMetricDashboard()}
            {currentSection.subsections.map((sub, i) => (
              <div key={i} className="content-block">
                <div className="block-title">{sub.title}</div>
                <p className="content-text">{sub.content}</p>
                {renderMetricCards(sub.metrics)}
              </div>
            ))}
          </>
        );

      case 'rag-triad':
        return (
          <>
            <p className="content-text">{currentSection.subsections[0].content}</p>
            {renderTriad(currentSection.subsections[0].title, currentSection.subsections[0].triad)}
            {currentSection.subsections[1] && (
              <>
                <p className="content-text">{currentSection.subsections[1].content}</p>
                {renderTriad(currentSection.subsections[1].title, currentSection.subsections[1].triad)}
              </>
            )}
            {currentSection.subsections[2] && renderFailureMatrix(currentSection.subsections[2].failureMatrix)}
          </>
        );

      case 'failure-tree':
        return (
          <>
            <p className="content-text">{currentSection.subsections[0].content}</p>
            {renderFailureTree(currentSection.subsections[0].tree)}
            <div className="warning-box" style={{ marginTop: 'var(--spacing-md)' }}>
              <strong>实战建议：</strong>将这棵归因树做成可执行的 debug runbook。每个叶子节点配一个诊断脚本和修复 playbook，新人也能快速定位问题。
            </div>
          </>
        );

      case 'eval-dataset':
        return currentSection.subsections.map((sub, i) => (
          <div key={i}>{renderEvalDataset(sub)}</div>
        ));

      case 'eval-tools':
        return (
          <>
            <p className="content-text">{currentSection.subsections[0].content}</p>
            {renderToolComparison(currentSection.subsections[0].tools)}
            {currentSection.subsections[1] && renderRecommendations(currentSection.subsections[1].recommendations)}
          </>
        );

      case 'cicd':
        return currentSection.subsections.map((sub, i) => (
          <div key={i}>{renderCICD(sub)}</div>
        ));

      case 'online-monitoring':
        return currentSection.subsections.map((sub, i) => (
          <div key={i}>{renderOnlineMonitoring(sub)}</div>
        ));

      default:
        return currentSection.subsections.map((sub, i) => (
          <div key={i} className="content-block">
            <div className="block-title">{sub.title}</div>
            <p className="content-text">{sub.content}</p>
          </div>
        ));
    }
  };

  return (
    <div className="section-tab fade-in">
      <aside className="section-sidebar">
        <div className="sidebar-title">📊 评估 & 可观测</div>
        <nav className="sidebar-nav">
          {evalSections.map(section => (
            <button
              key={section.id}
              className={`sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span>{section.icon}</span>
              {section.title}
            </button>
          ))}
        </nav>
      </aside>

      <div className="section-main">
        <h2 className="section-title">
          <span>{currentSection.icon}</span>
          {currentSection.title}
        </h2>

        {renderSectionContent()}

        <div className="summary-box">
          <div className="summary-title">本节核心</div>
          <ul className="summary-list">
            <li><strong>分层指标：</strong>检索层（Recall/MRR/nDCG）→ 生成层（Faithfulness/Relevancy/Citation）→ 运营层（延迟/成本/满意度），不同层的问题用不同指标发现</li>
            <li><strong>RAG Triad：</strong>Context Relevance + Groundedness + Answer Relevance 形成闭环，三者缺一不可</li>
            <li><strong>失败归因树：</strong>从"结果不对"系统性回溯到"哪一步出了问题"，是 debug 的核心工具</li>
            <li><strong>评估集是基石：</strong>query + gold_docs + gold_answer + gold_citations，持续构建和迭代</li>
            <li><strong>CI/CD 回归：</strong>每个 PR 跑核心评估、每晚跑全量评估、指标低于阈值自动阻断</li>
            <li><strong>数据闭环：</strong>日志 → 标注 → 评估 → 优化 → 灰度 → 监控 → 日志，自驱动改进循环</li>
          </ul>
        </div>
      </div>

      <QuestionPanel
        warmupQuestions={evalWarmupQuestions}
        questions={evalQuestions}
        sectionTitle="评估 & 可观测"
      />
    </div>
  );
};

export default EvalTab;

import { useState } from 'react';
import { securitySections, securityWarmupQuestions, securityQuestions } from '../data/securityData';
import QuestionPanel from './QuestionPanel';

const SecurityTab = () => {
  const [activeSection, setActiveSection] = useState(securitySections[0].id);
  const [checklistState, setChecklistState] = useState({});

  const currentSection = securitySections.find(s => s.id === activeSection);

  const toggleCheckItem = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setChecklistState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getCheckedCount = (category, catIdx) => {
    return category.items.filter((_, itemIdx) => checklistState[`${catIdx}-${itemIdx}`]).length;
  };

  const renderACLGateFlow = () => (
    <div className="content-block">
      <div className="block-title">ACL Gate 请求路径</div>
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '0',
        margin: 'var(--spacing-md) 0',
        overflowX: 'auto',
        padding: 'var(--spacing-sm) 0'
      }}>
        {[
          { label: '用户请求', sub: 'Query + Identity', color: 'var(--accent-primary)', bg: 'rgba(99,102,241,0.15)' },
          { label: 'Pre-filter Gate', sub: 'ACL 过滤候选池', color: 'var(--accent-success)', bg: 'rgba(16,185,129,0.15)' },
          { label: '向量检索', sub: 'ANN Search', color: 'var(--accent-info)', bg: 'rgba(6,182,212,0.15)' },
          { label: 'Post-filter Gate', sub: '权限二次过滤', color: 'var(--accent-warning)', bg: 'rgba(245,158,11,0.15)' },
          { label: 'Rerank', sub: '相关性重排', color: 'var(--accent-info)', bg: 'rgba(6,182,212,0.15)' },
          { label: 'Pre-gen Gate', sub: '生成前最终检查', color: 'var(--accent-danger)', bg: 'rgba(239,68,68,0.15)' },
          { label: 'LLM 生成', sub: '基于安全 context', color: 'var(--accent-primary)', bg: 'rgba(99,102,241,0.15)' },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              background: step.bg,
              border: `1px solid ${step.color}`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              textAlign: 'center',
              minWidth: '120px',
              flexShrink: 0
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: step.color }}>{step.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{step.sub}</div>
            </div>
            {i < 6 && (
              <div style={{
                color: 'var(--text-muted)',
                fontSize: '1.2rem',
                padding: '0 4px',
                flexShrink: 0
              }}>→</div>
            )}
          </div>
        ))}
      </div>
      <div className="highlight-box" style={{ marginTop: 'var(--spacing-md)' }}>
        <strong>三层防御原则：</strong>Pre-filter（必须）→ Post-filter（推荐）→ Pre-generation（必须）。
        绿色/黄色/红色 gate 分别代表不同安全等级的拦截点。任何单一 gate 都不够——纵深防御是安全的基本原则。
      </div>
    </div>
  );

  const renderSubsection = (sub, idx) => {
    if (sub.strategies) {
      return (
        <div key={idx} className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div className="compare-grid">
            {sub.strategies.map((s, i) => (
              <div key={i} className="compare-card">
                <div className="compare-card-title">{s.name}</div>
                <div className="compare-card-body">
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <strong style={{ color: 'var(--accent-success)' }}>优势：</strong>
                    <ul style={{ paddingLeft: 'var(--spacing-md)', marginTop: '4px' }}>
                      {s.pros.map((p, j) => <li key={j} style={{ fontSize: '0.85rem' }}>{p}</li>)}
                    </ul>
                  </div>
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <strong style={{ color: 'var(--accent-danger)' }}>劣势：</strong>
                    <ul style={{ paddingLeft: 'var(--spacing-md)', marginTop: '4px' }}>
                      {s.cons.map((c, j) => <li key={j} style={{ fontSize: '0.85rem' }}>{c}</li>)}
                    </ul>
                  </div>
                  <div className="tag tag-info">{s.bestFor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (sub.pros && sub.cons && sub.verdict) {
      return (
        <div key={idx} className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            <div className="success-box">
              <strong>优势</strong>
              <ul style={{ paddingLeft: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
                {sub.pros.map((p, i) => <li key={i} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>{p}</li>)}
              </ul>
            </div>
            <div className="danger-box">
              <strong>风险</strong>
              <ul style={{ paddingLeft: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
                {sub.cons.map((c, i) => <li key={i} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>{c}</li>)}
              </ul>
            </div>
          </div>
          <div className="highlight-box">
            <strong>结论：</strong>{sub.verdict}
          </div>
        </div>
      );
    }

    if (sub.layers) {
      return (
        <div key={idx} className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <table className="info-table">
            <thead>
              <tr>
                <th>Gate</th>
                <th>角色</th>
                <th>优先级</th>
              </tr>
            </thead>
            <tbody>
              {sub.layers.map((l, i) => (
                <tr key={i}>
                  <td><strong>{l.gate}</strong></td>
                  <td>{l.role}</td>
                  <td><span className={`tag ${l.priority === '必须' ? 'tag-danger' : 'tag-warning'}`}>{l.priority}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (sub.attackVectors) {
      return (
        <div key={idx} className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          {sub.attackVectors.map((av, i) => (
            <div key={i} className="danger-box" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                <strong>{av.vector}</strong>
                <span className={`tag ${av.risk === '极高' ? 'tag-danger' : 'tag-warning'}`}>风险: {av.risk}</span>
              </div>
              <div className="code-block">
                <div className="code-content">
                  <pre>{av.example}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (sub.defenses) {
      return (
        <div key={idx} className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <table className="info-table">
            <thead>
              <tr>
                <th>策略</th>
                <th>描述</th>
                <th>实现方式</th>
                <th>有效性</th>
              </tr>
            </thead>
            <tbody>
              {sub.defenses.map((d, i) => (
                <tr key={i}>
                  <td><strong>{d.strategy}</strong></td>
                  <td style={{ fontSize: '0.85rem' }}>{d.desc}</td>
                  <td style={{ fontSize: '0.85rem' }}>{d.implementation}</td>
                  <td><span className={`tag ${d.effectiveness === '高' ? 'tag-success' : d.effectiveness === '中高' ? 'tag-info' : 'tag-warning'}`}>{d.effectiveness}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (sub.tools) {
      return (
        <div key={idx} className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div className="highlight-box">
            <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
              {sub.tools.map((t, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>{t}</li>)}
            </ul>
          </div>
        </div>
      );
    }

    if (sub.piiTypes) {
      return (
        <div key={idx} className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <table className="info-table">
            <thead>
              <tr><th>类型</th><th>示例</th><th>敏感等级</th></tr>
            </thead>
            <tbody>
              {sub.piiTypes.map((p, i) => (
                <tr key={i}>
                  <td><strong>{p.type}</strong></td>
                  <td>{p.examples}</td>
                  <td><span className={`tag ${p.sensitivity === '极高' ? 'tag-danger' : p.sensitivity === '高' ? 'tag-warning' : 'tag-info'}`}>{p.sensitivity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (sub.comparison) {
      return (
        <div key={idx} className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div className="compare-grid">
            {sub.comparison.map((c, i) => (
              <div key={i} className="compare-card">
                <div className="compare-card-title">{c.timing}</div>
                <div className="compare-card-body">
                  <p style={{ marginBottom: 'var(--spacing-sm)' }}>{c.approach}</p>
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <strong style={{ color: 'var(--accent-success)' }}>优势：</strong>
                    <ul style={{ paddingLeft: 'var(--spacing-md)', marginTop: '4px' }}>
                      {c.pros.map((p, j) => <li key={j} style={{ fontSize: '0.85rem' }}>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--accent-danger)' }}>劣势：</strong>
                    <ul style={{ paddingLeft: 'var(--spacing-md)', marginTop: '4px' }}>
                      {c.cons.map((co, j) => <li key={j} style={{ fontSize: '0.85rem' }}>{co}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {sub.recommendation && (
            <div className="success-box">
              <strong>推荐：</strong>{sub.recommendation}
            </div>
          )}
        </div>
      );
    }

    if (sub.strategies && Array.isArray(sub.strategies)) {
      return (
        <div key={idx} className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <table className="info-table">
            <thead>
              <tr><th>方法</th><th>技术</th><th>适用场景</th></tr>
            </thead>
            <tbody>
              {sub.strategies.map((s, i) => (
                <tr key={i}>
                  <td><strong>{s.method}</strong></td>
                  <td>{s.technique}</td>
                  <td>{s.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (sub.fields) {
      return (
        <div key={idx} className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <table className="info-table">
            <thead>
              <tr><th>字段</th><th>说明</th></tr>
            </thead>
            <tbody>
              {sub.fields.map((f, i) => (
                <tr key={i}>
                  <td><code style={{ color: 'var(--accent-info)', fontSize: '0.85rem' }}>{f.field}</code></td>
                  <td>{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (sub.useCases) {
      return (
        <div key={idx} className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div className="success-box">
            <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
              {sub.useCases.map((u, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>{u}</li>)}
            </ul>
          </div>
        </div>
      );
    }

    if (sub.checklist) {
      return (
        <div key={idx} className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          {sub.checklist.map((cat, catIdx) => {
            const checked = getCheckedCount(cat, catIdx);
            const total = cat.items.length;
            const allChecked = checked === total;
            return (
              <div key={catIdx} style={{
                background: allChecked ? 'rgba(16,185,129,0.08)' : 'var(--bg-tertiary)',
                border: `1px solid ${allChecked ? 'var(--accent-success)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-md)',
                transition: 'all var(--transition-normal)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{cat.category}</strong>
                  <span className={`tag ${allChecked ? 'tag-success' : 'tag-warning'}`}>
                    {checked}/{total} {allChecked ? '✓ PASS' : '进行中'}
                  </span>
                </div>
                {cat.items.map((item, itemIdx) => {
                  const isChecked = checklistState[`${catIdx}-${itemIdx}`];
                  return (
                    <div
                      key={itemIdx}
                      onClick={() => toggleCheckItem(catIdx, itemIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        padding: 'var(--spacing-sm) var(--spacing-sm)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'background var(--transition-fast)',
                        opacity: isChecked ? 0.7 : 1
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: `2px solid ${isChecked ? 'var(--accent-success)' : 'var(--border-color)'}`,
                        background: isChecked ? 'var(--accent-success)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all var(--transition-fast)',
                        fontSize: '0.7rem',
                        color: 'white'
                      }}>
                        {isChecked && '✓'}
                      </div>
                      <span style={{
                        fontSize: '0.85rem',
                        color: isChecked ? 'var(--text-muted)' : 'var(--text-secondary)',
                        textDecoration: isChecked ? 'line-through' : 'none'
                      }}>{item}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div className="warning-box" style={{ marginTop: 'var(--spacing-md)' }}>
            <strong>Go/No-Go 规则：</strong>以上所有类别必须全部通过（绿色 PASS）才能放行上线。任何一个类别未完成即为 No-Go。
          </div>
        </div>
      );
    }

    return (
      <div key={idx} className="content-block">
        <div className="block-title">{sub.title}</div>
        <p className="content-text">{sub.content}</p>
        {sub.details && (
          <div className="highlight-box">
            <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
              {sub.details.map((d, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>{d}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="section-tab fade-in">
      <aside className="section-sidebar">
        <div className="sidebar-title">🔒 ACL / 安全 / 合规</div>
        <nav className="sidebar-nav">
          {securitySections.map(section => (
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

        {activeSection === 'acl-gate' && renderACLGateFlow()}

        {currentSection.subsections.map((sub, idx) => renderSubsection(sub, idx))}

        <div className="summary-box">
          <div className="summary-title">本节核心</div>
          <ul className="summary-list">
            <li><strong>权限纵深防御：</strong>Pre-filter + Post-filter + Pre-generation 三层 ACL gate，任何单一防线都不够</li>
            <li><strong>多租户隔离：</strong>大客户用索引隔离，中小客户用过滤隔离 + 强制 tenant filter 注入</li>
            <li><strong>Prompt Injection：</strong>RAG 的攻击面比 chatbot 多了检索内容和工具返回两条路径，需要多层防护</li>
            <li><strong>PII 分级处理：</strong>高敏感数据 ingestion-time 不可逆脱敏，中低敏感数据 query-time 动态脱敏</li>
            <li><strong>上线前必过：</strong>权限穿透 + 注入测试 + PII 泄露 + 审计完整性 = Go/No-Go 门禁</li>
          </ul>
        </div>
      </div>

      <QuestionPanel
        warmupQuestions={securityWarmupQuestions}
        questions={securityQuestions}
        sectionTitle="ACL / 安全 / 合规"
      />
    </div>
  );
};

export default SecurityTab;

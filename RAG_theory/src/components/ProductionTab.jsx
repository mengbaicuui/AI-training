import { useState } from 'react';
import QuestionPanel from './QuestionPanel';
import { productionSections, productionContent, productionQuestions } from '../data/productionData';

const ProductionTab = () => {
  const [activeSection, setActiveSection] = useState(productionSections[0].id);
  const [checklistState, setChecklistState] = useState({});

  const currentSection = productionSections.find(s => s.id === activeSection);
  const content = productionContent[activeSection];

  const toggleCheckItem = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setChecklistState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getCheckedCount = (category, catIdx) => {
    return category.items.filter((_, itemIdx) => checklistState[`${catIdx}-${itemIdx}`]).length;
  };

  const renderDeploymentMatrix = () => (
    <div className="content-block">
      <div className="block-title">三路决策矩阵：商业托管 vs 开源平台 vs 代码自研</div>
      <div style={{ overflowX: 'auto' }}>
        <table className="info-table">
          <thead>
            <tr>
              <th>维度</th>
              <th style={{ color: 'var(--accent-info)' }}>商业托管</th>
              <th style={{ color: 'var(--accent-success)' }}>开源平台</th>
              <th style={{ color: 'var(--accent-warning)' }}>代码自研</th>
            </tr>
          </thead>
          <tbody>
            {productionContent.deployment.decisionMatrix.map((row, i) => (
              <tr key={i}>
                <td><strong>{row.dimension}</strong></td>
                <td>{row.managed}</td>
                <td>{row.openSource}</td>
                <td>{row.diy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCodeBlock = (title, code, lang = 'python') => {
    if (!code) return null;
    return (
      <div className="content-block">
        <div className="block-title">{title || '代码示例'}</div>
        <div className="code-block">
          <div className="code-header">
            <span className="code-lang">{lang}</span>
          </div>
          <div className="code-content">
            <pre>{code}</pre>
          </div>
        </div>
      </div>
    );
  };

  const renderNotes = (title, items, tone = 'highlight') => {
    if (!items?.length) return null;
    const className = tone === 'warning' ? 'warning-box' : tone === 'success' ? 'success-box' : 'highlight-box';
    return (
      <div className={className}>
        <strong>{title}</strong>
        <ul style={{ paddingLeft: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)', marginBottom: 0 }}>
          {items.map((item, i) => (
            <li key={i} style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderPlatformCards = () => {
    const categories = [
      { title: '商业托管 (RAG-as-a-Service)', color: 'var(--accent-info)', items: productionContent.deployment.managedPlatforms },
      { title: '开源 RAG 平台（可私有部署）', color: 'var(--accent-success)', items: productionContent.deployment.openSourcePlatforms },
      { title: '代码框架（全栈自研）', color: 'var(--accent-warning)', items: productionContent.deployment.diyFrameworks },
    ];
    return (
      <div className="content-block">
        <div className="block-title">主流方案速览</div>
        <div className="compare-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {categories.map((cat, ci) => (
            <div key={ci} className="compare-card" style={{ borderTop: `3px solid ${cat.color}` }}>
              <div className="compare-card-title" style={{ color: cat.color }}>{cat.title}</div>
              <div className="compare-card-body">
                {cat.items.map((p, pi) => (
                  <div key={pi} style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong>
                    <br />
                    <span style={{ fontSize: '0.85rem' }}>{p.note}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="highlight-box" style={{ marginTop: 'var(--spacing-md)' }}>
          <strong>分层策略：</strong>{productionContent.deployment.layeredStrategy}
        </div>
      </div>
    );
  };

  const renderLatencyBars = () => {
    const stages = productionContent.latency.budget;
    const parseMs = (range) => {
      const m = range.match(/(\d+)-(\d+)/);
      return m ? (parseInt(m[1]) + parseInt(m[2])) / 2 : parseInt(range) || 100;
    };
    const values = stages.map(s => parseMs(s.range));
    const total = values.reduce((a, b) => a + b, 0);
    return (
      <div className="content-block">
        <div className="block-title">延迟预算拆解（典型请求）</div>
        <div style={{
          display: 'flex',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          marginBottom: 'var(--spacing-md)'
        }}>
          {stages.map((s, i) => {
            const pct = (values[i] / total) * 100;
            return (
              <div
                key={i}
                style={{
                  width: `${pct}%`,
                  minWidth: '60px',
                  background: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  color: 'white',
                  fontWeight: 600
                }}
                title={`${s.stage}: ${s.range}`}
              >
                {s.range}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
          {stages.map((s, i) => (
            <span key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: s.color, borderRadius: '2px', marginRight: '4px', verticalAlign: 'middle' }} />
              {s.stage}
            </span>
          ))}
        </div>
        <div className="highlight-box">
          <strong>关键洞察：</strong>LLM 生成通常占总延迟的 70%+。Streaming 可让用户在 TTFT 即开始看到内容，显著降低感知延迟。
        </div>
      </div>
    );
  };

  const renderKnowledgeBaseLayers = () => (
    <div className="content-block">
      <div className="block-title">知识库分层架构</div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)'
      }}>
        {productionContent.lifecycle.layers.map((layer, i) => (
          <div
            key={i}
            style={{
              padding: 'var(--spacing-lg) var(--spacing-xl)',
              background: `${layer.color}22`,
              borderLeft: `4px solid ${layer.color}`,
              borderBottom: i < productionContent.lifecycle.layers.length - 1 ? '1px solid var(--border-color)' : 'none'
            }}
          >
            <div style={{ fontWeight: 600, color: layer.color, marginBottom: 'var(--spacing-xs)' }}>{layer.name}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{layer.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChecklist = () => (
    <div className="content-block">
      <div className="block-title">Go/No-Go 上线检查清单</div>
      {productionContent.checklist.categories.map((cat, catIdx) => {
        const checked = getCheckedCount(cat, catIdx);
        const total = cat.items.length;
        const allChecked = checked === total;
        return (
          <div
            key={catIdx}
            style={{
              background: allChecked ? 'rgba(16,185,129,0.08)' : 'var(--bg-tertiary)',
              border: `1px solid ${allChecked ? 'var(--accent-success)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-md)',
              transition: 'all var(--transition-normal)'
            }}
          >
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
                    padding: 'var(--spacing-sm)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background var(--transition-fast)',
                    opacity: isChecked ? 0.7 : 1
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
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
                    fontSize: '0.7rem',
                    color: 'white'
                  }}>
                    {isChecked && '✓'}
                  </div>
                  <span style={{
                    fontSize: '0.85rem',
                    color: isChecked ? 'var(--text-muted)' : 'var(--text-secondary)',
                    textDecoration: isChecked ? 'line-through' : 'none'
                  }}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
      <div className="warning-box" style={{ marginTop: 'var(--spacing-md)' }}>
        <strong>Go/No-Go 规则：</strong>所有类别必须全部通过才能放行上线。
      </div>
    </div>
  );

  const renderSectionContent = () => {
    if (!content) return null;

    switch (activeSection) {
      case 'rbac':
        return (
          <>
            <div className="content-block">
              <div className="block-title">挑战</div>
              <p className="content-text">{content.challenge}</p>
              {content.principle && <p className="content-text" style={{ marginTop: 'var(--spacing-sm)' }}><strong>核心原则：</strong>{content.principle}</p>}
            </div>
            <div className="content-block">
              <div className="block-title">解决方案</div>
              <p className="content-text">{content.solution}</p>
              <p className="content-text" style={{ marginTop: 'var(--spacing-sm)' }}>{content.approach}</p>
            </div>
            <div className="content-block">
              <div className="block-title">ACL 实施点</div>
              <table className="info-table">
                <thead><tr><th>环节</th><th>说明</th></tr></thead>
                <tbody>
                  {content.enforcementPoints.map((p, i) => (
                    <tr key={i}><td><strong>{p.point}</strong></td><td>{p.desc}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="highlight-box">
              <strong>设计模式：</strong>{content.designPattern}
            </div>
            <div className="content-block">
              <p className="content-text"><strong>多租户：</strong>{content.multiTenant}</p>
              <p className="content-text" style={{ marginTop: 'var(--spacing-sm)' }}><strong>审计：</strong>{content.auditLogging}</p>
            </div>
            {renderNotes('实战检查点', content.checkpoints, 'warning')}
            {renderCodeBlock('ACL Filter 注入示例', content.codeExample)}
          </>
        );

      case 'deployment':
        return (
          <>
            {renderDeploymentMatrix()}
            {renderPlatformCards()}
            <div className="success-box">
              <strong>平稳上线：</strong>{content.smoothLaunch}
            </div>
          </>
        );

      case 'cost':
        return (
          <>
            <div className="content-block">
              <div className="block-title">成本拆解</div>
              <ul className="content-text" style={{ paddingLeft: 'var(--spacing-lg)' }}>
                {content.breakdown.map((b, i) => (
                  <li key={i} style={{ marginBottom: 'var(--spacing-sm)' }}><strong>{b.area}:</strong> {b.items}</li>
                ))}
              </ul>
            </div>
            <div className="content-block">
              <div className="block-title">缓存策略</div>
              <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                {content.caching.map((c, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)' }}>{c}</li>)}
              </ul>
            </div>
            <div className="highlight-box">
              <strong>分层模型路由：</strong>{content.tieredRouting}
            </div>
            <div className="content-block">
              <div className="block-title">Embedding 成本优化</div>
              <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                {content.embeddingReduction.map((e, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)' }}>{e}</li>)}
              </ul>
            </div>
            <div className="content-block">
              <div className="block-title">向量库优化</div>
              <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                {content.vectorDbOpt.map((v, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)' }}>{v}</li>)}
              </ul>
            </div>
            {renderNotes('成本治理思路', content.costHeuristics)}
            {renderCodeBlock('分层模型路由示例', content.codeExample)}
          </>
        );

      case 'latency':
        return (
          <>
            {renderLatencyBars()}
            <div className="content-block">
              <div className="block-title">检索优化</div>
              <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                {content.retrievalOpt.map((r, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)' }}>{r}</li>)}
              </ul>
            </div>
            <div className="content-block">
              <div className="block-title">生成优化</div>
              <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                {content.generationOpt.map((g, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)' }}>{g}</li>)}
              </ul>
            </div>
            <div className="highlight-box">
              <strong>并行执行：</strong>{content.parallelExec}
            </div>
            <div className="content-block">
              <div className="block-title">SLO</div>
              <p className="content-text">{content.slo}</p>
            </div>
            {renderNotes('延迟优化优先级', content.latencyHeuristics, 'success')}
            {renderCodeBlock('并行检索 + Streaming 示例', content.codeExample)}
          </>
        );

      case 'monitoring':
        return (
          <>
            <div className="content-block">
              <div className="block-title">关键指标</div>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                {content.metrics.map((m, i) => (
                  <span key={i} className="tag tag-info">{m}</span>
                ))}
              </div>
            </div>
            <div className="content-block">
              <div className="block-title">工具</div>
              <table className="info-table">
                <thead><tr><th>工具</th><th>用途</th></tr></thead>
                <tbody>
                  {content.tools.map((t, i) => (
                    <tr key={i}><td><strong>{t.name}</strong></td><td>{t.desc}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            {content.observabilityImage && (
              <div className="content-block">
                <div className="block-title">{content.observabilityImage.title}</div>
                <div style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--spacing-md)',
                }}>
                  <img
                    src={content.observabilityImage.src}
                    alt={content.observabilityImage.alt}
                    style={{
                      width: '100%',
                      borderRadius: 'var(--radius-md)',
                      display: 'block',
                    }}
                  />
                  <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    marginTop: 'var(--spacing-sm)',
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}>
                    {content.observabilityImage.caption}
                  </p>
                </div>
              </div>
            )}
            <div className="content-block">
              <div className="block-title">告警触发</div>
              <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                {content.alerts.map((a, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)' }}>{a}</li>)}
              </ul>
            </div>
            <div className="highlight-box">
              <strong>A/B 测试：</strong>{content.abTesting}
            </div>
            {renderNotes('观测设计原则', content.observabilityNotes)}
            {renderCodeBlock('Trace 打点示例', content.codeExample)}
          </>
        );

      case 'lifecycle':
        return (
          <>
            {renderKnowledgeBaseLayers()}
            <div className="content-block">
              <div className="block-title">Human-in-the-Loop</div>
              <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                {content.humanInLoop.map((h, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)' }}>{h}</li>)}
              </ul>
            </div>
            <div className="content-block">
              <div className="block-title">数据版本控制</div>
              <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                {content.dataVersionControl.map((d, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)' }}>{d}</li>)}
              </ul>
            </div>
            <div className="content-block">
              <div className="block-title">组件升级</div>
              <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                {content.componentUpgrades.map((c, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)' }}>{c}</li>)}
              </ul>
            </div>
            <div className="success-box">
              <strong>数据飞轮：</strong>{content.flywheel}
            </div>
            {renderNotes('生命周期设计提醒', content.lifecycleNotes)}
            {renderCodeBlock('文档增量更新示例', content.codeExample)}
          </>
        );

      case 'checklist':
        return renderChecklist();

      default:
        return null;
    }
  };

  return (
    <div className="section-tab fade-in">
      <aside className="section-sidebar">
        <div className="sidebar-title">🚀 生产落地</div>
        <nav className="sidebar-nav">
          {productionSections.map(section => (
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
          <span>{currentSection?.icon}</span>
          {currentSection?.title}
        </h2>

        {renderSectionContent()}

        <div className="summary-box">
          <div className="summary-title">本节核心</div>
          <ul className="summary-list">
            <li><strong>ACL 三层：</strong>Doc + Chunk + Query 级权限隔离，metadata 过滤在向量库层实施</li>
            <li><strong>部署选型：</strong>非核心用平台快速上线，核心逻辑 DIY 保护 IP</li>
            <li><strong>成本优化：</strong>缓存 + 分层模型路由 + embedding 降维</li>
            <li><strong>延迟优化：</strong>LLM 生成是瓶颈，Streaming + 并行检索</li>
            <li><strong>监控飞轮：</strong>Faithfulness、延迟、用户满意度 + A/B 测试</li>
            <li><strong>上线门禁：</strong>Data / Retrieval / Generation / Eval / Security / Ops 全项通过</li>
          </ul>
        </div>
      </div>

      <QuestionPanel
        warmupQuestions={productionQuestions.warmUp}
        questions={productionQuestions.deepThinking}
        sectionTitle="生产落地"
      />
    </div>
  );
};

export default ProductionTab;

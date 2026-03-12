import { useState } from 'react';
import { costSections, costWarmupQuestions, costQuestions } from '../data/costLatencyData';
import QuestionPanel from './QuestionPanel';

const CostLatencyTab = () => {
  const [activeSection, setActiveSection] = useState(costSections[0].id);

  const currentSection = costSections.find(s => s.id === activeSection);

  const renderCostCalculator = (components) => (
    <div className="content-block">
      <div className="block-title">每请求成本拆解</div>
      <div style={{ overflowX: 'auto' }}>
        <table className="info-table">
          <thead>
            <tr>
              <th>环节</th>
              <th>说明</th>
              <th>成本范围</th>
              <th>占比</th>
            </tr>
          </thead>
          <tbody>
            {components.map((c, i) => (
              <tr key={i}>
                <td><strong style={{ color: 'var(--accent-primary)' }}>{c.step}</strong></td>
                <td style={{ fontSize: '0.85rem' }}>{c.desc}</td>
                <td>
                  <code style={{ color: 'var(--accent-success)', fontSize: '0.85rem' }}>{c.costRange}</code>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <div style={{
                      height: '8px',
                      width: `${parseInt(c.percentage) * 2}px`,
                      background: parseInt(c.percentage) > 30
                        ? 'var(--accent-danger)'
                        : parseInt(c.percentage) > 10
                          ? 'var(--accent-warning)'
                          : 'var(--accent-success)',
                      borderRadius: '4px',
                      minWidth: '4px'
                    }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{c.percentage}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
        {components.map((c, i) => (
          <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            💡 {c.step}: {c.note}
          </div>
        ))}
      </div>
    </div>
  );

  const renderLatencyWaterfall = () => {
    const steps = [
      { name: 'Query Embedding', duration: 30, color: 'var(--accent-info)' },
      { name: 'BM25 检索', duration: 50, color: 'var(--accent-warning)', parallel: true },
      { name: '向量检索', duration: 80, color: 'var(--accent-primary)', parallel: true },
      { name: '结果融合', duration: 20, color: 'var(--text-muted)' },
      { name: 'Rerank', duration: 150, color: 'var(--accent-secondary)' },
      { name: 'Context 组装', duration: 30, color: 'var(--text-muted)' },
      { name: 'LLM 生成（TTFT）', duration: 400, color: 'var(--accent-danger)' },
      { name: 'LLM 生成（全量）', duration: 2000, color: 'var(--accent-danger)' },
    ];

    const maxDuration = 2000;
    let cumulativeOffset = 0;
    const offsets = steps.map((step, i) => {
      if (step.parallel && steps[i - 1]?.parallel) {
        return cumulativeOffset;
      }
      if (i > 0 && !step.parallel) {
        const prevParallelGroup = [];
        let j = i - 1;
        while (j >= 0 && steps[j].parallel) {
          prevParallelGroup.push(steps[j]);
          j--;
        }
        if (prevParallelGroup.length > 0) {
          cumulativeOffset += Math.max(...prevParallelGroup.map(s => s.duration));
        } else if (i > 0) {
          cumulativeOffset += steps[i - 1].duration;
        }
      } else if (i > 0 && step.parallel && !steps[i - 1]?.parallel) {
        cumulativeOffset += steps[i - 1].duration;
      }
      return cumulativeOffset;
    });

    return (
      <div className="content-block">
        <div className="block-title">延迟瀑布图（典型请求各环节耗时）</div>
        <div style={{
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-lg)',
          border: '1px solid var(--border-color)'
        }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-sm)',
            }}>
              <div style={{
                width: '140px',
                fontSize: '0.8rem',
                color: step.parallel ? 'var(--accent-info)' : 'var(--text-secondary)',
                textAlign: 'right',
                flexShrink: 0
              }}>
                {step.parallel && '⟂ '}{step.name}
              </div>
              <div style={{ flex: 1, position: 'relative', height: '24px' }}>
                <div style={{
                  position: 'absolute',
                  left: `${(offsets[i] / maxDuration) * 100}%`,
                  width: `${Math.max((step.duration / maxDuration) * 100, 1)}%`,
                  height: '100%',
                  background: step.color,
                  borderRadius: '4px',
                  opacity: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '30px'
                }}>
                  <span style={{ fontSize: '0.7rem', color: 'white', fontWeight: 600 }}>
                    {step.duration}ms
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 'var(--spacing-md)',
            paddingTop: 'var(--spacing-sm)',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <span>0ms</span>
            <span>检索阶段 ~330ms</span>
            <span>LLM 生成 ~2400ms</span>
            <span>总计 ~2760ms</span>
          </div>
        </div>
        <div className="highlight-box" style={{ marginTop: 'var(--spacing-md)' }}>
          <strong>关键洞察：</strong>LLM 生成占总延迟的 85%+。检索侧优化能减少几百毫秒，但真正的延迟大头在生成侧。
          Streaming 可以让用户在 TTFT（~400ms）就开始看到内容，感知延迟大幅降低。
          <br /><strong>⟂ 标记</strong>表示可以并行执行的环节（BM25 和向量检索）。
        </div>
      </div>
    );
  };

  const renderScenarios = (scenarios) => (
    <div className="content-block">
      <div className="block-title">成本估算模型</div>
      <div className="compare-grid">
        {scenarios.map((s, i) => (
          <div key={i} className="compare-card">
            <div className="compare-card-title">{s.name}</div>
            <div className="compare-card-body">
              <div className="metric-grid" style={{ marginBottom: 'var(--spacing-sm)' }}>
                <div className="metric-card">
                  <div className="metric-label">QPS</div>
                  <div className="metric-value" style={{ fontSize: '1rem' }}>{s.qps}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">模型</div>
                  <div className="metric-value" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{s.model}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) 0' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Context</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.contextLength}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>日成本</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-warning)' }}>{s.dailyCost}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>月成本</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-danger)' }}>{s.monthlyCost}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCacheLayers = (layers) => (
    <div className="content-block">
      <div className="block-title">三级缓存体系</div>
      {layers.map((layer, i) => (
        <div key={i} className="compare-card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div className="compare-card-title">
            <span className={`tag ${i === 0 ? 'tag-primary' : i === 1 ? 'tag-info' : 'tag-success'}`}>{layer.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--accent-warning)' }}>
              命中率: {layer.hitRate}
            </span>
          </div>
          <div className="compare-card-body">
            <p style={{ marginBottom: 'var(--spacing-sm)' }}><strong>机制：</strong>{layer.mechanism}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
              <div className="success-box" style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                <strong style={{ fontSize: '0.8rem' }}>优势</strong>
                <ul style={{ paddingLeft: 'var(--spacing-md)', marginTop: '4px' }}>
                  {layer.pros.map((p, j) => <li key={j} style={{ fontSize: '0.8rem' }}>{p}</li>)}
                </ul>
              </div>
              <div className="danger-box" style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                <strong style={{ fontSize: '0.8rem' }}>风险</strong>
                <ul style={{ paddingLeft: 'var(--spacing-md)', marginTop: '4px' }}>
                  {layer.cons.map((c, j) => <li key={j} style={{ fontSize: '0.8rem' }}>{c}</li>)}
                </ul>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: '0.85rem' }}>
              <div><strong>工具：</strong>{layer.tools}</div>
            </div>
            <div className="highlight-box" style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-sm) var(--spacing-md)' }}>
              💡 {layer.implementation}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderModelTiers = (tiers) => (
    <div className="content-block">
      <div className="block-title">分层模型路由</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {tiers.map((tier, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 'var(--spacing-md)',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '4px',
              background: i === 0 ? 'var(--accent-success)' : i === 1 ? 'var(--accent-info)' : i === 2 ? 'var(--accent-warning)' : 'var(--accent-danger)',
              flexShrink: 0
            }} />
            <div style={{ padding: 'var(--spacing-md)', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                <strong style={{ fontSize: '0.9rem' }}>{tier.tier}</strong>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <span className={`tag ${i === 0 ? 'tag-success' : i === 1 ? 'tag-info' : i === 2 ? 'tag-warning' : 'tag-danger'}`}>
                    {tier.cost === '$0' ? '免费' : `成本: ${tier.cost}`}
                  </span>
                  <span className="tag tag-primary">覆盖: {tier.coverage}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{tier.desc}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>适用: {tier.suitable}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderApproaches = (approaches, costSavings) => (
    <div className="content-block">
      <div className="block-title">Query 分类器设计</div>
      <table className="info-table">
        <thead>
          <tr>
            <th>方案</th>
            <th>描述</th>
            <th>优势</th>
            <th>劣势</th>
            <th>推荐</th>
          </tr>
        </thead>
        <tbody>
          {approaches.map((a, i) => (
            <tr key={i}>
              <td><strong>{a.approach}</strong></td>
              <td style={{ fontSize: '0.85rem' }}>{a.desc}</td>
              <td style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>{a.pros}</td>
              <td style={{ fontSize: '0.85rem', color: 'var(--accent-danger)' }}>{a.cons}</td>
              <td style={{ fontSize: '0.85rem' }}>{a.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {costSavings && (
        <div className="success-box" style={{ marginTop: 'var(--spacing-md)' }}>
          <strong>成本节省估算：</strong>{costSavings}
        </div>
      )}
    </div>
  );

  const renderRetrievalOpt = (sub) => {
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

    if (sub.params) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <table className="info-table">
            <thead>
              <tr><th>索引类型</th><th>参数</th><th>作用</th><th>推荐值</th></tr>
            </thead>
            <tbody>
              {sub.params.map((p, i) => (
                <tr key={i}>
                  <td><span className="tag tag-info">{p.index}</span></td>
                  <td><code style={{ color: 'var(--accent-primary)' }}>{p.param}</code></td>
                  <td style={{ fontSize: '0.85rem' }}>{p.desc}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>{p.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (sub.techniques && Array.isArray(sub.techniques) && typeof sub.techniques[0] === 'string') {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div className="success-box">
            <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
              {sub.techniques.map((t, i) => (
                <li key={i} style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (sub.details && Array.isArray(sub.details) && typeof sub.details[0] === 'string') {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div className="highlight-box">
            <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
              {sub.details.map((d, i) => (
                <li key={i} style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="content-block">
        <div className="block-title">{sub.title}</div>
        <p className="content-text">{sub.content}</p>
      </div>
    );
  };

  const renderGenOpt = (sub) => {
    if (sub.techniques && Array.isArray(sub.techniques) && sub.techniques[0]?.technique) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          {sub.techniques.map((t, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'stretch',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: 'var(--spacing-sm)',
              overflow: 'hidden'
            }}>
              <div style={{ width: '4px', background: 'var(--accent-success)', flexShrink: 0 }} />
              <div style={{ padding: 'var(--spacing-md)', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{t.technique}</strong>
                  <span className="tag tag-success">节省: {t.saving}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.desc}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-warning)' }}>⚠️ 风险: {t.risk}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (sub.strategies) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div className="compare-grid">
            {sub.strategies.map((s, i) => (
              <div key={i} className="compare-card">
                <div className="compare-card-title">{s.strategy}</div>
                <div className="compare-card-body">
                  <p style={{ marginBottom: 'var(--spacing-sm)' }}>{s.desc}</p>
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <span className="tag tag-success">{s.benefit}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    实现: {s.implementation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (sub.budgets) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <table className="info-table">
            <thead>
              <tr><th>维度</th><th>典型值</th><th>实施方式</th><th>原因</th></tr>
            </thead>
            <tbody>
              {sub.budgets.map((b, i) => (
                <tr key={i}>
                  <td><strong>{b.dimension}</strong></td>
                  <td><code style={{ color: 'var(--accent-info)' }}>{b.typical}</code></td>
                  <td style={{ fontSize: '0.85rem' }}>{b.enforcement}</td>
                  <td style={{ fontSize: '0.85rem' }}>{b.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  const renderSLO = (sub) => {
    if (sub.slos) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <table className="info-table">
            <thead>
              <tr>
                <th>指标</th>
                {sub.slos[0].p50 && <th>p50</th>}
                {sub.slos[0].p95 && <th>p95</th>}
                {sub.slos[0].p99 && <th>p99</th>}
                {sub.slos[0].target && <th>目标</th>}
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {sub.slos.map((s, i) => (
                <tr key={i}>
                  <td><strong>{s.metric}</strong></td>
                  {s.p50 && <td><code style={{ color: 'var(--accent-success)' }}>{s.p50}</code></td>}
                  {s.p95 && <td><code style={{ color: 'var(--accent-warning)' }}>{s.p95}</code></td>}
                  {s.p99 && <td><code style={{ color: 'var(--accent-danger)' }}>{s.p99}</code></td>}
                  {s.target && <td><code style={{ color: 'var(--accent-primary)' }}>{s.target}</code></td>}
                  <td style={{ fontSize: '0.85rem' }}>{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (sub.levels) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          {sub.levels.map((l, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'stretch',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: 'var(--spacing-sm)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '4px',
                background: i === 0 ? 'var(--accent-danger)' : i === 1 ? 'var(--accent-warning)' : i === 2 ? 'var(--accent-info)' : 'var(--text-muted)',
                flexShrink: 0
              }} />
              <div style={{ padding: 'var(--spacing-md)', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                  <strong>
                    <span className={`tag ${i === 0 ? 'tag-danger' : i === 1 ? 'tag-warning' : i === 2 ? 'tag-info' : 'tag-primary'}`}>
                      {l.level}
                    </span>
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.notify}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <strong>触发条件：</strong>{l.criteria}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>
                  <strong>响应：</strong>{l.response}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (sub.planningItems) {
      return (
        <div className="content-block">
          <div className="block-title">{sub.title}</div>
          <p className="content-text">{sub.content}</p>
          <div className="warning-box">
            <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
              {sub.planningItems.map((item, i) => (
                <li key={i} style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderSectionContent = () => {
    if (!currentSection) return null;

    switch (currentSection.id) {
      case 'cost-breakdown':
        return (
          <>
            {renderLatencyWaterfall()}
            {currentSection.subsections.map((sub, i) => {
              if (sub.components) return <div key={i}>{renderCostCalculator(sub.components)}</div>;
              if (sub.scenarios) return <div key={i}>{renderScenarios(sub.scenarios)}</div>;
              if (sub.hiddenCosts) return (
                <div key={i} className="content-block">
                  <div className="block-title">{sub.title}</div>
                  <p className="content-text">{sub.content}</p>
                  <div className="warning-box">
                    <ul style={{ paddingLeft: 'var(--spacing-md)' }}>
                      {sub.hiddenCosts.map((c, j) => (
                        <li key={j} style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
              return null;
            })}
          </>
        );

      case 'caching':
        return currentSection.subsections.map((sub, i) => {
          if (sub.layers) return <div key={i}>{renderCacheLayers(sub.layers)}</div>;
          if (sub.strategies) return (
            <div key={i} className="content-block">
              <div className="block-title">{sub.title}</div>
              <p className="content-text">{sub.content}</p>
              <table className="info-table">
                <thead>
                  <tr><th>策略</th><th>描述</th><th>适用场景</th><th>风险</th></tr>
                </thead>
                <tbody>
                  {sub.strategies.map((s, j) => (
                    <tr key={j}>
                      <td><strong>{s.strategy}</strong></td>
                      <td style={{ fontSize: '0.85rem' }}>{s.desc}</td>
                      <td style={{ fontSize: '0.85rem' }}>{s.bestFor}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--accent-warning)' }}>{s.risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          return null;
        });

      case 'model-routing':
        return currentSection.subsections.map((sub, i) => {
          if (sub.tiers) return (
            <div key={i}>
              <p className="content-text">{sub.content}</p>
              {renderModelTiers(sub.tiers)}
            </div>
          );
          if (sub.approaches) return (
            <div key={i}>
              <p className="content-text">{sub.content}</p>
              {renderApproaches(sub.approaches, sub.costSavings)}
            </div>
          );
          return null;
        });

      case 'retrieval-opt':
        return currentSection.subsections.map((sub, i) => (
          <div key={i}>{renderRetrievalOpt(sub)}</div>
        ));

      case 'generation-opt':
        return currentSection.subsections.map((sub, i) => (
          <div key={i}>{renderGenOpt(sub)}</div>
        ));

      case 'slo':
        return currentSection.subsections.map((sub, i) => (
          <div key={i}>{renderSLO(sub)}</div>
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
        <div className="sidebar-title">⚡ 成本 / 延迟优化</div>
        <nav className="sidebar-nav">
          {costSections.map(section => (
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
            <li><strong>成本大头在 LLM：</strong>Input tokens（context）占 40-60%，Output tokens 占 25-40%，检索侧只占 10-20%</li>
            <li><strong>三级缓存：</strong>语义缓存（相似 query）→ 检索缓存（相同检索条件）→ 答案缓存（精确匹配），综合命中率 40-60%</li>
            <li><strong>模型路由：</strong>50% 查询走小模型、20% 走 FAQ 直接匹配，可降低 LLM 成本 50-60%</li>
            <li><strong>Context 精简：</strong>严格 rerank + 截断到 3-5 chunks，less is more</li>
            <li><strong>并行化：</strong>多路召回并行 + streaming 响应，大幅降低感知延迟</li>
            <li><strong>SLO 驱动：</strong>设定延迟/成本/质量的明确目标，分级告警，容量预规划</li>
          </ul>
        </div>
      </div>

      <QuestionPanel
        warmupQuestions={costWarmupQuestions}
        questions={costQuestions}
        sectionTitle="成本 / 延迟优化"
      />
    </div>
  );
};

export default CostLatencyTab;

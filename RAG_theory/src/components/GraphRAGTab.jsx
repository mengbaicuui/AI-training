import { useState } from 'react';
import { graphSections, graphComparisonData, graphWarmupQuestions, graphQuestions } from '../data/graphRAGData';
import QuestionPanel from './QuestionPanel';

const LevelBadge = ({ level, text }) => {
  const cls = level === 'good' ? 'tag-success' : level === 'warn' ? 'tag-warning' : 'tag-danger';
  return <span className={`tag ${cls}`}>{text}</span>;
};

const ComparisonTable = () => (
  <div style={{ overflowX: 'auto', marginBottom: 'var(--spacing-xl)' }}>
    <table className="info-table">
      <thead>
        <tr>
          <th>方案</th>
          <th>出处</th>
          <th>索引成本</th>
          <th>查询成本</th>
          <th>多跳能力</th>
          <th>全局理解</th>
          <th>增量更新</th>
          <th>成熟度</th>
        </tr>
      </thead>
      <tbody>
        {graphComparisonData.map((row) => (
          <tr key={row.name}>
            <td style={{ fontWeight: 600, color: 'var(--accent-tertiary)' }}>{row.name}</td>
            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.paper}</td>
            <td><LevelBadge level={row.indexCostLevel} text={row.indexCost} /></td>
            <td><LevelBadge level={row.queryCostLevel} text={row.queryCost} /></td>
            <td><LevelBadge level={row.multiHopLevel} text={row.multiHop} /></td>
            <td><LevelBadge level={row.globalLevel} text={row.globalUnderstanding} /></td>
            <td><LevelBadge level={row.incrementalLevel} text={row.incrementalUpdate} /></td>
            <td><LevelBadge level={row.maturityLevel} text={row.maturity} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DecisionFlowchart = () => (
  <div style={{ marginBottom: 'var(--spacing-xl)' }}>
    <h3 className="block-title">🗺️ 选型决策流程</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <div className="highlight-box">
        <p className="content-text" style={{ margin: 0, fontWeight: 600, color: 'var(--accent-primary)' }}>
          🏁 起点：你的核心需求是什么？
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
        <div className="compare-card" style={{ borderLeft: '4px solid var(--accent-success)' }}>
          <div className="compare-card-title">
            <span className="tag tag-success">80% 场景</span>
          </div>
          <div className="compare-card-body">
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              "我只需要准确找到相关文档并生成答案"
            </p>
            <p>→ <strong style={{ color: 'var(--accent-success)' }}>Hybrid + Rerank + Query Decomposition</strong></p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>简单、成熟、成本最低。先做这个再说。</p>
          </div>
        </div>

        <div className="compare-card" style={{ borderLeft: '4px solid var(--accent-info)' }}>
          <div className="compare-card-title">
            <span className="tag tag-info">需要图但要轻量</span>
          </div>
          <div className="compare-card-body">
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              "我需要实体关系推理，但预算有限"
            </p>
            <p>→ <strong style={{ color: 'var(--accent-info)' }}>LightRAG</strong></p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>图+向量混合，&lt;100 tokens/查询，支持增量更新</p>
          </div>
        </div>

        <div className="compare-card" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
          <div className="compare-card-title">
            <span className="tag tag-primary">多跳链路推理</span>
          </div>
          <div className="compare-card-body">
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              "查询需要沿关系链走 2-5 跳"
            </p>
            <p>→ <strong style={{ color: 'var(--accent-secondary)' }}>HippoRAG</strong></p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>KG + PPR 单步多跳，比 IRCoT 便宜 10-30 倍</p>
          </div>
        </div>

        <div className="compare-card" style={{ borderLeft: '4px solid var(--accent-warning)' }}>
          <div className="compare-card-title">
            <span className="tag tag-warning">长文档层级理解</span>
          </div>
          <div className="compare-card-body">
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              "文档很长，用户会问不同粒度的问题"
            </p>
            <p>→ <strong style={{ color: 'var(--accent-warning)' }}>RAPTOR</strong></p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>树状分层摘要，跨层检索，适合制度/研报</p>
          </div>
        </div>

        <div className="compare-card" style={{ borderLeft: '4px solid var(--accent-danger)' }}>
          <div className="compare-card-title">
            <span className="tag tag-danger">全局主题洞察</span>
          </div>
          <div className="compare-card-body">
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              "需要纵观全集、跨文档的主题分析"
            </p>
            <p>→ <strong style={{ color: 'var(--accent-danger)' }}>GraphRAG / LazyGraphRAG</strong></p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>社区摘要覆盖全局，优先用 LazyGraphRAG 降本</p>
          </div>
        </div>

        <div className="compare-card" style={{ borderLeft: '4px solid var(--accent-orange)' }}>
          <div className="compare-card-title">
            <span className="tag" style={{ background: 'rgba(249,115,22,0.2)', color: 'var(--accent-orange)' }}>已有 KG</span>
          </div>
          <div className="compare-card-body">
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              "公司已有知识图谱，想做 RAG 增强"
            </p>
            <p>→ <strong style={{ color: 'var(--accent-orange)' }}>SubgraphRAG / Walk&Retrieve</strong></p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>直接在已有 KG 上做子图检索或随机游走</p>
          </div>
        </div>
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
                <li key={j} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', padding: 'var(--spacing-xs) 0', paddingLeft: 'var(--spacing-md)', position: 'relative', whiteSpace: 'pre-line' }}>
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
      default:
        return null;
    }
  });

const GraphRAGTab = () => {
  const [activeSection, setActiveSection] = useState(graphSections[0].id);

  const currentSection = graphSections.find(s => s.id === activeSection);

  return (
    <div className="section-tab">
      <aside className="section-sidebar">
        <div className="sidebar-title">🕸️ GraphRAG 替代路线图</div>
        <nav className="sidebar-nav">
          {graphSections.map((sec) => (
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

        <div style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
            📚 引用论文
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            {[
              { name: 'LightRAG', id: '2410.05779', venue: 'EMNLP 2025' },
              { name: 'HippoRAG', id: '2405.14831', venue: 'NeurIPS 2024' },
              { name: 'RAPTOR', id: '2401.18059', venue: 'ICLR 2024' },
            ].map(p => (
              <div key={p.id} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '2px 0' }}>
                <span style={{ color: 'var(--accent-tertiary)' }}>{p.name}</span>
                <span style={{ color: 'var(--text-muted)' }}> · {p.venue}</span>
                <br />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>arxiv:{p.id}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="section-main">
        {currentSection && (
          <div className="fade-in" key={currentSection.id}>
            <h2 className="section-title">
              <span>{currentSection.icon}</span>
              {currentSection.title}
            </h2>

            {activeSection === 'why-expensive' && (
              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3 className="block-title">📊 方案全景对比</h3>
                <ComparisonTable />
              </div>
            )}

            {activeSection === 'decision-framework' && (
              <DecisionFlowchart />
            )}

            {renderContent(currentSection.content)}

            {activeSection === 'decision-framework' && (
              <div className="summary-box">
                <div className="summary-title">💎 一句话总结</div>
                <ul className="summary-list">
                  <li>先做好 <strong>Hybrid + Rerank</strong>，这是你的 baseline 和 fallback</li>
                  <li>需要图但要省钱？→ <strong>LightRAG</strong>（查询成本是 GraphRAG 的 1/6000）</li>
                  <li>多跳推理是刚需？→ <strong>HippoRAG</strong>（PPR 单步多跳，NeurIPS 2024）</li>
                  <li>长文档多粒度理解？→ <strong>RAPTOR</strong>（树状分层摘要，ICLR 2024）</li>
                  <li>必须全局洞察？→ <strong>LazyGraphRAG</strong>（GraphRAG 效果，向量 RAG 的成本）</li>
                  <li>选型必须由 <strong>评估数据驱动</strong>，不能靠论文结论和直觉</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <QuestionPanel
        warmupQuestions={graphWarmupQuestions}
        questions={graphQuestions}
        sectionTitle="GraphRAG 轻量替代路线图"
      />
    </div>
  );
};

export default GraphRAGTab;

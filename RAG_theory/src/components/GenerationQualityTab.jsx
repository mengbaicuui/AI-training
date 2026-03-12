import { useState } from 'react';
import QuestionPanel from './QuestionPanel';
import { generationSections, generationContent, generationWarmupQuestions, generationQuestions } from '../data/generationQualityData';

const renderContent = (blocks) =>
  blocks?.map((block, i) => {
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
      default:
        return null;
    }
  });

const FaithBenchCards = () => {
  const cards = [
    { id: 'benign', label: 'Benign 良性', desc: '技术上无据可依但可接受/有帮助，如基于 context 的合理推断', color: 'var(--accent-success)', bg: 'rgba(16,185,129,0.15)', border: 'var(--accent-success)' },
    { id: 'suspicious', label: 'Suspicious 可疑', desc: '模糊、取决于解读。例：时间歧义（"去年"指哪年？）', color: 'var(--accent-warning)', bg: 'rgba(245,158,11,0.15)', border: 'var(--accent-warning)' },
    { id: 'unwanted', label: 'Unwanted 有害', desc: '明确有害的事实错误。例：源数据说 "koi 重 2 磅"，回答却说 "3 磅"', color: 'var(--accent-danger)', bg: 'rgba(239,68,68,0.15)', border: 'var(--accent-danger)' },
  ];
  return (
    <div className="content-block">
      <div className="block-title">FaithBench 幻觉分类</div>
      <div className="compare-grid">
        {cards.map((c) => (
          <div key={c.id} className="compare-card" style={{ background: c.bg, borderColor: c.border, borderWidth: '2px' }}>
            <div className="compare-card-title">
              <span className="tag" style={{ background: `${c.color}33`, color: c.color }}>{c.label}</span>
            </div>
            <div className="compare-card-body">
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RAGTriadCards = () => {
  const triad = [
    { name: 'Context Relevance', question: '检索到的 chunks 是否包含所需的原子事实？', color: 'var(--accent-info)' },
    { name: 'Faithfulness', question: '回答是否完全来源于检索到的 chunks？', color: 'var(--accent-success)' },
    { name: 'Answer Relevance', question: '回答是否直接回应了用户查询？', color: 'var(--accent-warning)' },
  ];
  return (
    <div className="content-block">
      <div className="block-title">RAG Triad 三角</div>
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {triad.map((t, i) => (
          <div key={i} className="metric-card" style={{ borderLeft: `4px solid ${t.color}` }}>
            <div className="metric-label" style={{ color: t.color }}>{t.name}</div>
            <div className="metric-value" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{t.question}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DefenseLayerDiagram = () => {
  const rings = [
    {
      layer: 'Input',
      label: '输入层',
      measures: ['输入清洗', '注入模式检测', 'PII 预扫描'],
      color: 'var(--accent-info)',
      bg: 'rgba(6,182,212,0.15)',
    },
    {
      layer: 'Processing',
      label: '处理层',
      measures: ['主题限制', '权限校验', 'Context 过滤'],
      color: 'var(--accent-warning)',
      bg: 'rgba(245,158,11,0.15)',
    },
    {
      layer: 'Output',
      label: '输出层',
      measures: ['内容过滤', '有害检测', 'PII 脱敏'],
      color: 'var(--accent-success)',
      bg: 'rgba(16,185,129,0.15)',
    },
  ];
  return (
    <div className="content-block">
      <div className="block-title">Defense Layer 防御层级</div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        flexWrap: 'wrap',
        padding: 'var(--spacing-xl) 0',
      }}>
        {rings.map((ring, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 160,
                padding: 'var(--spacing-lg)',
                background: ring.bg,
                border: `3px solid ${ring.color}`,
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 160,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: ring.color }}>{ring.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>{ring.layer}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'center', fontSize: '0.8rem' }}>
                {ring.measures.map((m, j) => (
                  <li key={j} style={{ color: 'var(--text-secondary)' }}>{m}</li>
                ))}
              </ul>
            </div>
            {i < rings.length - 1 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '1.5rem', padding: '0 8px' }}>→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const GenerationQualityTab = () => {
  const [activeSection, setActiveSection] = useState(generationSections[0].id);

  const currentSection = generationSections.find((s) => s.id === activeSection);
  const content = generationContent[activeSection];

  return (
    <div className="section-tab">
      <aside className="section-sidebar">
        <div className="sidebar-title">🛡️ 生成质量</div>
        <nav className="sidebar-nav">
          {generationSections.map((sec) => (
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

            {activeSection === 'hallucination-types' && <FaithBenchCards />}
            {activeSection === 'detection' && <RAGTriadCards />}
            {activeSection === 'guardrails' && <DefenseLayerDiagram />}

            {renderContent(content)}
          </div>
        )}
      </div>

      <QuestionPanel
        warmupQuestions={generationWarmupQuestions}
        questions={generationQuestions}
        sectionTitle="生成质量"
      />
    </div>
  );
};

export default GenerationQualityTab;

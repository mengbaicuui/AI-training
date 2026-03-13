import { useState } from 'react';
import QuestionPanel from './QuestionPanel';
import {
  evolutionSections,
  evolutionContent,
  evolutionQuestions,
  evolutionComparisonTable,
  evolutionTimeline,
  evolutionKnowledgePointDetails,
} from '../data/evolutionData';

const EVOLUTION_FLOW_STAGES = [
  { id: 'naive', label: '朴素 RAG', color: 'rgba(16, 185, 129, 0.25)', borderColor: '#10b981' },
  { id: 'advanced', label: '高级 RAG', color: 'rgba(99, 102, 241, 0.25)', borderColor: '#6366f1' },
  { id: 'agentic', label: '智能体 RAG', color: 'rgba(139, 92, 246, 0.25)', borderColor: '#8b5cf6' },
  { id: 'knowledge', label: '知识增强 RAG', color: 'rgba(245, 158, 11, 0.25)', borderColor: '#f59e0b' },
  { id: 'multimodal', label: '多模态 RAG', color: 'rgba(236, 72, 153, 0.25)', borderColor: '#ec4899' },
];

const EvolutionFlowDiagram = () => (
  <div
    className="content-block"
    style={{ marginBottom: 'var(--spacing-xl)' }}
  >
    <h3 className="block-title">📈 RAG 技术演进路径</h3>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {EVOLUTION_FLOW_STAGES.map((stage, idx) => (
        <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <div
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderRadius: 'var(--radius-md)',
              background: stage.color,
              border: `2px solid ${stage.borderColor}`,
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              minWidth: 120,
              textAlign: 'center',
            }}
          >
            {stage.label}
          </div>
          {idx < EVOLUTION_FLOW_STAGES.length - 1 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 700 }}>→</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

const KnowledgePointModal = ({ point, onClose }) => {
  if (!point) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.38)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xl)',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(720px, 100%)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--spacing-xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 'var(--spacing-md)' }}>
          <div>
            <div className="tag tag-info" style={{ marginBottom: 'var(--spacing-sm)' }}>知识点总结</div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>{point.name}</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            关闭
          </button>
        </div>

        <div className="highlight-box" style={{ marginTop: 'var(--spacing-lg)' }}>
          <p className="content-text" style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: point.summary
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code style="background:var(--bg-tertiary);padding:1px 5px;border-radius:4px;font-size:0.88em">$1</code>')
            .replace(/\n/g, '<br />')
          }} />
        </div>

        {point.whyItMatters && (
          <div className="content-block" style={{ marginTop: 'var(--spacing-lg)', marginBottom: 0 }}>
            <h4 className="block-title">为什么重要</h4>
            <p className="content-text" style={{ marginBottom: 0 }} dangerouslySetInnerHTML={{ __html: point.whyItMatters
              .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/`(.*?)`/g, '<code style="background:var(--bg-tertiary);padding:1px 5px;border-radius:4px;font-size:0.88em">$1</code>')
              .replace(/\n/g, '<br />')
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

const VerticalTimeline = ({ items, onKnowledgePointClick }) => (
  <div className="content-block" style={{ marginBottom: 'var(--spacing-xl)' }}>
    <h3 className="block-title">🕒 RAG 里程碑时间轴</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
      {items.map((it, idx) => (
        <div
          key={`${it.date}-${idx}`}
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 28px 1fr',
            gap: 'var(--spacing-lg)',
            alignItems: 'stretch',
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', paddingTop: 2 }}>
            {it.date}
          </div>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                marginTop: 4,
                boxShadow: '0 0 0 4px rgba(99,102,241,0.18)',
                zIndex: 1,
              }}
            />
            {idx < items.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  bottom: -26,
                  width: 3,
                  borderRadius: 999,
                  background: 'linear-gradient(180deg, rgba(99,102,241,0.55), rgba(148,163,184,0.15))',
                }}
              />
            )}
          </div>

          <div
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-md) var(--spacing-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{it.title}</span>
              {Array.isArray(it.tags) && it.tags.length > 0 && (
                <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {it.tags.slice(0, 6).map((t) => (
                    <span key={t} className="tag tag-primary" style={{ fontSize: '0.75rem' }}>
                      {t}
                    </span>
                  ))}
                </span>
              )}
            </div>
            {it.highlight && (
              <div className="highlight-box" style={{ marginTop: 'var(--spacing-sm)' }}>
                <p className="content-text" style={{ margin: 0 }}>
                  {it.highlight}
                </p>
              </div>
            )}

            {Array.isArray(it.knowledgePoints) && it.knowledgePoints.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-sm)' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>知识点</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {it.knowledgePoints.map((point) => (
                    <button
                      key={point}
                      type="button"
                      onClick={() => onKnowledgePointClick(point)}
                      className="tag"
                      style={{
                        background: 'rgba(6,182,212,0.14)',
                        color: 'var(--accent-info)',
                        border: '1px solid rgba(6,182,212,0.18)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {point}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                  点击知识点可查看总结
                </div>
              </div>
            )}

            {Array.isArray(it.papers) && it.papers.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>代表 Paper</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {it.papers.map((paper) => (
                    <div
                      key={paper}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.86rem',
                      }}
                    >
                      {paper}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UpgradeChecklist = () => (
  <div className="content-block" style={{ marginBottom: 'var(--spacing-xl)' }}>
    <h3 className="block-title">🧭 升级 Checklist</h3>
    <div className="compare-grid">
      {[
        {
          title: '如果你还在 Naive RAG',
          body: '先补 `Hybrid + Rerank + Query 优化`，这是绝大多数团队的第一性升级路径。'
        },
        {
          title: '如果召回已不错',
          body: '再看 `生成质量 / 评估 / 可观测`，不要急着上更重的架构。'
        },
        {
          title: '如果问题是多跳或全局理解',
          body: '再考虑 `Agentic / Graph / Tree / Memory` 这类结构化增强路线。'
        },
        {
          title: '如果数据源涉及非文本内容',
          body: '优先考虑把 `表格 / 图像 / 扫描件 / 版面信息` 先转成可检索的摘要、caption 或结构化表示，而不是等纯文本方案失效后再补。'
        },
      ].map((item) => (
        <div key={item.title} className="compare-card">
          <div className="compare-card-title">{item.title}</div>
          <div className="compare-card-body">{item.body}</div>
        </div>
      ))}
    </div>
  </div>
);

const SelectionHeuristics = () => (
  <div className="content-block" style={{ marginTop: 'var(--spacing-lg)' }}>
    <h4 className="block-title">选型判断</h4>
    <table className="info-table">
      <thead>
        <tr>
          <th>你遇到的瓶颈</th>
          <th>优先补的能力</th>
          <th>不建议直接做什么</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>编号、术语、错误码检不准</td>
          <td>Hybrid Search + 分词 + Rerank</td>
          <td>直接上 Agentic</td>
        </tr>
        <tr>
          <td>复杂 query 容易跑偏</td>
          <td>Query Rewrite / Decomposition / Routing</td>
          <td>先堆更长 context</td>
        </tr>
        <tr>
          <td>需要多跳关系或全局主题理解</td>
          <td>Graph / Tree / Memory 类路线</td>
          <td>只靠 top-k 增大硬扛</td>
        </tr>
        <tr>
          <td>数据源里有大量图纸、表格、扫描件</td>
          <td>先让非文本内容变成可检索摘要，再决定是否上图文联合检索</td>
          <td>继续假设“文档都是纯文本”</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const RAGEvolutionTab = () => {
  const [activeSection, setActiveSection] = useState(evolutionSections[0]?.id ?? 'naive');
  const [selectedKnowledgePoint, setSelectedKnowledgePoint] = useState(null);

  const currentContent = evolutionContent[activeSection];

  return (
    <div className="section-tab">
      <aside className="section-sidebar">
        <div className="sidebar-title">
          <span>🔄</span> RAG 演进
        </div>
        <nav className="sidebar-nav">
          {evolutionSections.map((section) => (
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
        <div className="fade-in">
          {currentContent && (
            <>
              <h2 className="section-title">
                <span>{evolutionSections.find((s) => s.id === activeSection)?.icon ?? '📄'}</span>
                {currentContent.title}
              </h2>

              {activeSection === 'timeline' && (
                <VerticalTimeline
                  items={evolutionTimeline}
                  onKnowledgePointClick={(point) => {
                    const detail = evolutionKnowledgePointDetails[point] || {
                      name: point,
                      summary: `${point} 是 RAG 演进中的一个关键能力点。它通常对应某个检索、组织、评估或生成阶段的升级方向。`,
                      whyItMatters: '如果你的系统在这一能力上存在短板，就会在召回质量、上下文组织、可解释性或工程稳定性上遇到瓶颈。',
                    };
                    setSelectedKnowledgePoint(detail);
                  }}
                />
              )}
              {activeSection === 'timeline' && <UpgradeChecklist />}
              {activeSection === 'comparison' && <EvolutionFlowDiagram />}

              {currentContent.content.map((para, i) => (
                <p key={i} className="content-text">
                  {para}
                </p>
              ))}

              {activeSection === 'comparison' && (
                <div className="content-block" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <h4 className="block-title">技术代际对比表</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="info-table">
                      <thead>
                        <tr>
                          <th>阶段</th>
                          <th>核心特征</th>
                          <th>典型技术栈</th>
                          <th>主要局限</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evolutionComparisonTable.map((row, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600, color: 'var(--accent-tertiary)' }}>
                              {row.stage}
                            </td>
                            <td>{row.coreFeature}</td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {row.typicalStack}
                            </td>
                            <td>{row.limitations}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === 'selection' && <SelectionHeuristics />}
            </>
          )}
        </div>
      </div>

      <KnowledgePointModal
        point={selectedKnowledgePoint}
        onClose={() => setSelectedKnowledgePoint(null)}
      />

      <QuestionPanel
        warmupQuestions={evolutionQuestions.warmUp}
        questions={evolutionQuestions.deepThinking}
        sectionTitle="RAG 演进"
      />
    </div>
  );
};

export default RAGEvolutionTab;

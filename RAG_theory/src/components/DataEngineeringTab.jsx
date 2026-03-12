import { useState } from 'react';
import QuestionPanel from './QuestionPanel';
import {
  dataEngSections,
  dataEngContent,
  dataEngQuestions,
  dataEngVectorDBTable,
} from '../data/dataEngineeringData';

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

const INGESTION_PIPELINE_STEPS = [
  { id: 'sources', label: 'Data Sources', color: 'var(--accent-info)' },
  { id: 'parse', label: 'Parse', color: 'var(--accent-primary)' },
  { id: 'chunk', label: 'Chunk', color: 'var(--accent-secondary)' },
  { id: 'embed', label: 'Embed', color: 'var(--accent-success)' },
  { id: 'index', label: 'Index', color: 'var(--accent-warning)' },
  { id: 'vectordb', label: 'Vector DB', color: 'var(--accent-tertiary)' },
];

const IngestionPipelineFlow = () => (
  <div
    className="content-block"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-sm)',
      flexWrap: 'wrap',
      marginBottom: 'var(--spacing-xl)',
      padding: 'var(--spacing-lg)',
      background: 'var(--bg-tertiary)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)',
    }}
  >
    {INGESTION_PIPELINE_STEPS.map((step, idx) => (
      <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <div
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            background: step.color,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.85rem',
            opacity: 0.9,
            minWidth: 90,
            textAlign: 'center',
          }}
        >
          {step.label}
        </div>
        {idx < INGESTION_PIPELINE_STEPS.length - 1 && (
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 700 }}>→</span>
        )}
      </div>
    ))}
  </div>
);

function CodeBlock({ code, lang = 'python' }) {
  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">{lang}</span>
      </div>
      <div className="code-content">
        <pre>{code}</pre>
      </div>
    </div>
  );
}

function ConceptGrid({ items = [] }) {
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
}

function ToolTable({ data }) {
  if (!data?.columns?.length || !data?.rows?.length) return null;
  return (
    <div className="content-block">
      <h4 className="block-title">{data.title || '工具对比'}</h4>
      <div style={{ overflowX: 'auto' }}>
        <table className="info-table">
          <thead>
            <tr>
              {data.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, idx) => (
              <tr key={idx}>
                {row.map((cell, cellIdx) => (
                  <td key={`${idx}-${cellIdx}`} dangerouslySetInnerHTML={renderMarkdown(cell)} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExtensionList({ items = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  if (!items.length) return null;
  return (
    <div className="content-block">
      <h4 className="block-title">思考延伸</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {items.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          const question = typeof item === 'string' ? item : item.question;
          const approach = typeof item === 'string' ? '' : item.approach;
          return (
            <div key={idx} className="warning-box" style={{ margin: 0 }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500 }}>
                {question}
              </div>
              <button
                type="button"
                className={`answer-toggle-btn ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                style={{ marginTop: 'var(--spacing-sm)' }}
              >
                {isExpanded ? '🔼 收起思路' : '🔽 查看解题思路'}
              </button>
              {isExpanded && approach && (
                <div className="answer-content" style={{ marginTop: 'var(--spacing-sm)' }}>
                  <div className="answer-label">解题思路</div>
                  <div className="answer-text" dangerouslySetInnerHTML={renderMarkdown(approach)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionContent({ sectionId, content }) {
  if (!content) return null;

  const sectionMeta = dataEngSections.find((s) => s.id === sectionId);

  return (
    <div className="fade-in">
      <h2 className="section-title">
        <span>{sectionMeta?.icon ?? '📄'}</span>
        {content.title}
      </h2>

      {sectionId === 'parsing' && <IngestionPipelineFlow />}

      {content.content.map((para, i) => (
        <p key={i} className="content-text" dangerouslySetInnerHTML={renderMarkdown(para)} />
      ))}

      <ConceptGrid items={content.concepts} />

      {content.toolComparison && <ToolTable data={content.toolComparison} />}

      {content.illustration && (
        <div className="content-block">
          <h4 className="block-title">{content.illustration.title}</h4>
          {content.illustration.description && (
            <p className="content-text" dangerouslySetInnerHTML={renderMarkdown(content.illustration.description)} />
          )}
          <div style={{ textAlign: 'center', margin: 'var(--spacing-md) 0' }}>
            <img
              src={content.illustration.src}
              alt={content.illustration.title}
              style={{
                maxWidth: '100%',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            />
          </div>
        </div>
      )}

      {content.codeExample && (
        <div className="content-block">
          <h4 className="block-title">代码示例</h4>
          <CodeBlock code={content.codeExample} />
        </div>
      )}

      {content.codeExamples?.map((example, idx) => (
        <div key={`${example.title}-${idx}`} className="content-block">
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
              <p
                className="content-text"
                style={{ margin: 0 }}
                dangerouslySetInnerHTML={renderMarkdown(example.outputSummary)}
              />
            </div>
          )}
        </div>
      ))}

      <ExtensionList items={content.extensions} />

      {sectionId === 'vectordb' && (
        <div className="content-block" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h4 className="block-title">即时索引支持对比</h4>
          <div className="highlight-box" style={{ marginBottom: 'var(--spacing-md)' }}>
            <p className="content-text" style={{ margin: 0 }} dangerouslySetInnerHTML={renderMarkdown(
              '**为什么要关注即时索引？** 生产 RAG 系统不只是一次性建库，文档会持续新增、修订和删除。如果忽略文档刷新，知识库数据就会过时，系统会给出不准确甚至过时的回答。'
              + '\n\n以客户支持机器人为例：当一篇新的知识库文章发布时，机器人需要**立即**能检索到这篇文章来帮助客户，而不是等到下次批处理才生效。新闻聚合、威胁情报分析等场景同样需要近实时的数据可用性。'
              + '\n\n解决路径是：**增量更新 → CDC 变更捕获 → 即时索引**。增量更新只处理新增/修改/删除的文档，而非每次全量重建；CDC 监控源端变化（如数据库触发器、事务日志）来自动触发刷新；即时索引则要求向量数据库能在秒级内让新数据可查。'
              + '\n\n实现即时索引还需要：**1)** 并行化和优化摄取管线（高效解析、快速 embedding、GPU 加速）；**2)** 异步处理，将摄取确认与后台索引解耦；**3)** 选择专为低延迟更新设计的向量数据库。下表对比了主流向量库在即时索引方面的表现：'
            )} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="info-table">
              <thead>
                <tr>
                  <th>向量数据库</th>
                  <th>支持即时索引</th>
                  <th>主要特点 / 影响速度的因素</th>
                </tr>
              </thead>
              <tbody>
                {dataEngVectorDBTable.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-tertiary)' }}>{row.db}</td>
                    <td>{row.instantIndex}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {row.features}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DataEngineeringTab() {
  const [activeSection, setActiveSection] = useState(dataEngSections[0]?.id ?? 'parsing');

  const currentContent = dataEngContent[activeSection];

  return (
    <div className="section-tab">
      <aside className="section-sidebar">
        <div className="sidebar-title">
          <span>📄</span> 数据工程
        </div>
        <nav className="sidebar-nav">
          {dataEngSections.map((section) => (
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
        <SectionContent sectionId={activeSection} content={currentContent} />
      </div>

      <QuestionPanel
        warmupQuestions={dataEngQuestions.warmUp}
        questions={dataEngQuestions.deepThinking}
        sectionTitle="数据工程"
      />
    </div>
  );
}

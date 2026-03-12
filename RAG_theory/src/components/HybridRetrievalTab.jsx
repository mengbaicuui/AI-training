import { useState } from 'react';
import {
  hybridSections,
  hybridWarmupQuestions,
  hybridQuestions
} from '../data/hybridRetrievalData';
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

const bm25Results = [
  { id: 'doc_A', title: 'OA审批流程异常排查手册 — ERR_2041 处理步骤', score: 18.7, rank: 1 },
  { id: 'doc_C', title: '常见报错码速查表（ERR_2000~ERR_3000）', score: 15.2, rank: 2 },
  { id: 'doc_E', title: 'OA 3.0 版本更新日志 — 审批模块修复', score: 11.4, rank: 3 },
  { id: 'doc_G', title: '系统运维FAQ — OA 相关问题汇总', score: 8.1, rank: 4 },
  { id: 'doc_H', title: 'IT 部门工单处理规范', score: 5.3, rank: 5 },
];

const denseResults = [
  { id: 'doc_B', title: 'OA审批流程使用指南（含异常处理章节）', score: 0.89, rank: 1 },
  { id: 'doc_A', title: 'OA审批流程异常排查手册 — ERR_2041 处理步骤', score: 0.85, rank: 2 },
  { id: 'doc_D', title: '企业办公系统常见问题与解决方案', score: 0.78, rank: 3 },
  { id: 'doc_F', title: '审批流程配置与权限管理', score: 0.72, rank: 4 },
  { id: 'doc_C', title: '常见报错码速查表（ERR_2000~ERR_3000）', score: 0.61, rank: 5 },
];

function computeRRF(bm25, dense, k = 60) {
  const scores = {};
  const docMap = {};
  bm25.forEach((item, idx) => {
    scores[item.id] = (scores[item.id] || 0) + 1 / (k + idx + 1);
    docMap[item.id] = item.title;
  });
  dense.forEach((item, idx) => {
    scores[item.id] = (scores[item.id] || 0) + 1 / (k + idx + 1);
    docMap[item.id] = item.title;
  });
  return Object.entries(scores)
    .map(([id, score]) => ({
      id,
      title: docMap[id],
      score: score,
      inBM25: bm25.some(r => r.id === id),
      inDense: dense.some(r => r.id === id),
    }))
    .sort((a, b) => b.score - a.score);
}

const rrfResults = computeRRF(bm25Results, denseResults);
const maxRRF = rrfResults[0]?.score || 1;

function RRFDemo() {
  const [kValue, setKValue] = useState(60);
  const dynamicRRF = computeRRF(bm25Results, denseResults, kValue);
  const dynMax = dynamicRRF[0]?.score || 1;

  const maxBM25 = bm25Results[0]?.score || 1;

  return (
    <div className="content-block">
      <h3 className="block-title">🧪 RRF 融合交互演示</h3>
      <div className="highlight-box" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <p className="content-text" style={{ margin: 0 }}>
          <strong>Query：</strong>"OA审批流程异常报错ERR_2041"
          <br />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            这条 query 同时包含精确编号（ERR_2041）和语义描述（审批流程异常），是 Hybrid 检索的典型场景。
          </span>
        </p>
      </div>

      <div className="compare-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="compare-card">
          <div className="compare-card-title">
            <span className="tag tag-warning">BM25</span>
            精确匹配路
          </div>
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            {bm25Results.map((r) => (
              <div key={r.id} className="score-bar-container">
                <span className="score-bar-label" title={r.title}>{r.title}</span>
                <div className="score-bar">
                  <div
                    className="score-bar-fill bm25"
                    style={{ width: `${(r.score / maxBM25) * 100}%` }}
                  />
                </div>
                <span className="score-bar-value">{r.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="compare-card">
          <div className="compare-card-title">
            <span className="tag tag-primary">Dense</span>
            语义匹配路
          </div>
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            {denseResults.map((r) => (
              <div key={r.id} className="score-bar-container">
                <span className="score-bar-label" title={r.title}>{r.title}</span>
                <div className="score-bar">
                  <div
                    className="score-bar-fill dense"
                    style={{ width: `${r.score * 100}%` }}
                  />
                </div>
                <span className="score-bar-value">{r.score.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)',
        background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)'
      }}>
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
          k 参数：<strong style={{ color: 'var(--accent-warning)' }}>{kValue}</strong>
        </label>
        <input
          type="range" min="1" max="200" value={kValue}
          onChange={(e) => setKValue(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          RRF_score = Σ 1/({kValue} + rank)
        </span>
      </div>

      <div className="compare-card" style={{ borderColor: 'var(--accent-success)' }}>
        <div className="compare-card-title">
          <span className="tag tag-success">Hybrid RRF</span>
          融合结果（k={kValue}）
        </div>
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          {dynamicRRF.map((r, idx) => (
            <div key={r.id} className="score-bar-container">
              <span className="score-bar-label" title={r.title}>
                <span style={{
                  color: 'var(--accent-success)', fontWeight: 600,
                  marginRight: '4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem'
                }}>#{idx + 1}</span>
                {r.title}
              </span>
              <div className="score-bar">
                <div
                  className="score-bar-fill hybrid"
                  style={{ width: `${(r.score / dynMax) * 100}%` }}
                />
              </div>
              <span className="score-bar-value">{r.score.toFixed(4)}</span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-md)',
          flexWrap: 'wrap', fontSize: '0.8rem'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>来源标记：</span>
          {dynamicRRF.map(r => (
            <span key={r.id} style={{ color: 'var(--text-secondary)' }}>
              {r.id}：
              {r.inBM25 && <span className="tag tag-warning" style={{ marginRight: '2px' }}>BM25</span>}
              {r.inDense && <span className="tag tag-primary">Dense</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="warning-box" style={{ marginTop: 'var(--spacing-md)' }}>
        <strong>注意观察：</strong>BM25 分数 18.7 和 Dense 分数 0.89 完全不可比较，
        但 RRF 只依赖排名（rank），将两路结果统一到同一尺度。
        拖动 k 参数滑块观察：k 越小，排名靠前的文档优势越大；k 越大，排名差异被平滑。
      </div>
    </div>
  );
}

function MetadataFilterFlow() {
  return (
    <div className="content-block">
      <h3 className="block-title">🔀 Pre-filter vs Post-filter 流程对比</h3>
      <div className="compare-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="compare-card">
          <div className="compare-card-title">
            <span className="tag tag-success">Pre-filter</span>
            先过滤，后检索
          </div>
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            {[
              { step: 1, label: '用户 Query + Metadata 条件', sub: 'department="财务部", doc_type="FAQ"', color: 'var(--accent-info)' },
              { step: 2, label: 'Metadata 过滤缩小候选集', sub: '100万 → 2万条文档', color: 'var(--accent-warning)' },
              { step: 3, label: '在候选集上执行 ANN 搜索', sub: 'BM25 + Dense 在 2万条上检索', color: 'var(--accent-primary)' },
              { step: 4, label: '返回 Top-K 结果', sub: '结果已满足 metadata 约束', color: 'var(--accent-success)' },
            ].map(s => (
              <div key={s.step} className="trace-step" style={{ cursor: 'default' }}>
                <div className="trace-step-number" style={{ background: s.color }}>{s.step}</div>
                <div className="trace-step-content">
                  <div className="trace-step-title">{s.label}</div>
                  <div className="trace-step-desc">{s.sub}</div>
                </div>
              </div>
            ))}
            <div className="success-box" style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-md)' }}>
              <strong>优势：</strong>搜索范围小、速度快、结果一定满足过滤条件
            </div>
            <div className="danger-box" style={{ padding: 'var(--spacing-md)' }}>
              <strong>风险：</strong>候选集过小时 ANN 退化，可能"安静地"丢失最相关文档
            </div>
          </div>
        </div>

        <div className="compare-card">
          <div className="compare-card-title">
            <span className="tag tag-info">Post-filter</span>
            先检索，后过滤
          </div>
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            {[
              { step: 1, label: '用户 Query（忽略 Metadata）', sub: '在全量索引上执行检索', color: 'var(--accent-info)' },
              { step: 2, label: '全量 ANN 检索 Top-N', sub: '从 100万条中取 Top-100', color: 'var(--accent-primary)' },
              { step: 3, label: '对 Top-N 应用 Metadata 过滤', sub: '100条 → 过滤掉不符合条件的', color: 'var(--accent-warning)' },
              { step: 4, label: '返回过滤后的 Top-K', sub: '可能不足 K 条', color: 'var(--accent-success)' },
            ].map(s => (
              <div key={s.step} className="trace-step" style={{ cursor: 'default' }}>
                <div className="trace-step-number" style={{ background: s.color }}>{s.step}</div>
                <div className="trace-step-content">
                  <div className="trace-step-title">{s.label}</div>
                  <div className="trace-step-desc">{s.sub}</div>
                </div>
              </div>
            ))}
            <div className="success-box" style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-md)' }}>
              <strong>优势：</strong>向量检索不受过滤影响，检索质量有保障
            </div>
            <div className="danger-box" style={{ padding: 'var(--spacing-md)' }}>
              <strong>风险：</strong>过滤率高时结果可能不足 K 条，浪费计算资源
            </div>
          </div>
        </div>
      </div>

      <div className="highlight-box">
        <strong>实战决策树：</strong>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--spacing-sm)' }}>
          <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--text-secondary)' }}>
            <span className="tag tag-success" style={{ marginRight: '8px' }}>Pre-filter</span>
            权限过滤、时间范围（过滤比例 {'<'} 50%）
          </li>
          <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--text-secondary)' }}>
            <span className="tag tag-info" style={{ marginRight: '8px' }}>Post-filter</span>
            精细部门+岗位+类型组合（过滤比例 {'>'} 80%）
          </li>
          <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--text-secondary)' }}>
            <span className="tag tag-warning" style={{ marginRight: '8px' }}>自适应</span>
            先估算候选集大小，过小则自动放宽到仅权限约束
          </li>
        </ul>
      </div>
    </div>
  );
}

function CodeBlock({ code, lang }) {
  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">{lang || 'python'}</span>
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

function PracticeList({ items = [] }) {
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
}

function BM25FormulaFigure() {
  const containerStyle = {
    maxWidth: 900,
    margin: '0 auto var(--spacing-lg)',
    padding: 15,
    fontSize: 13,
    color: '#333',
    lineHeight: 1.6,
    boxSizing: 'border-box',
  };

  const cardStyle = {
    flex: '1 1 300px',
    borderRadius: 10,
    padding: '15px 20px',
    border: '1px solid',
  };

  const highlightBase = {
    position: 'relative',
    display: 'inline-block',
    padding: '2px 6px',
    borderRadius: 6,
    border: '1px solid transparent',
    margin: '0 2px',
  };

  const labelBase = {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '0.65em',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  };

  return (
    <div className="content-block">
      <div style={containerStyle}>
        <h3 style={{ fontSize: '1.6em', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1a1a1a' }}>
          BM25 评分公式
        </h3>
        <p style={{ fontSize: '1em', color: '#666', margin: '0 0 15px 0' }}>
          最值得关注的调参旋钮：k1 控制词频饱和，b 控制文档长度归一化。
        </p>

        <div
          style={{
            backgroundColor: '#f9fafd',
            border: '1px solid #eaedf3',
            borderRadius: 10,
            padding: '25px 15px 40px 15px',
            marginBottom: 25,
            overflowX: 'auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: '"Cambria Math", "Times New Roman", serif',
              fontSize: '1.4em',
              color: '#222',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              position: 'relative',
            }}
          >
            <span
              style={{
                ...highlightBase,
                backgroundColor: '#fff4e5',
                borderColor: '#ffd8a8',
              }}
            >
              score(D,Q) = Σ IDF(q)
              <span style={{ ...labelBase, color: '#d97706', marginTop: 4 }}>稀有词权重</span>
            </span>
            {' '}· ( ( f(q,D) · (
            <span
              style={{
                ...highlightBase,
                backgroundColor: '#e7f1ff',
                borderColor: '#a5c8ff',
              }}
            >
              k1
              <span style={{ ...labelBase, color: '#0d6efd', marginTop: 10 }}>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    height: 10,
                    borderLeft: '1.5px dashed #0d6efd',
                    transform: 'translateX(-50%)',
                    content: '""',
                  }}
                />
                k1
              </span>
            </span>
            {' + 1) ) / ( f(q,D) + k1 · ( 1 - '}
            <span
              style={{
                ...highlightBase,
                backgroundColor: '#e8f5e9',
                borderColor: '#a5d6a7',
              }}
            >
              b
              <span style={{ ...labelBase, color: '#198754', marginTop: 10 }}>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    height: 10,
                    borderLeft: '1.5px dashed #198754',
                    transform: 'translateX(-50%)',
                    content: '""',
                  }}
                />
                b
              </span>
            </span>
            {' + b · |D| / avgdl ) ) )'}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
          <div
            style={{
              ...cardStyle,
              backgroundColor: '#f4f8ff',
              borderColor: '#cce0ff',
            }}
          >
            <h2 style={{ fontSize: '1.25em', margin: '0 0 10px 0', color: '#0d6efd' }}>k1: 词频饱和</h2>
            <h3 style={{ fontSize: '1.05em', color: '#333', margin: '10px 0 5px 0', fontWeight: 'bold' }}>它控制什么：</h3>
            <ul style={{ margin: '0 0 10px 0', paddingLeft: 20, color: '#444' }}>
              <li style={{ marginBottom: 4 }}>同一个词重复出现时，还能加多少分</li>
              <li style={{ marginBottom: 4 }}>k1 越大，重复出现越“值钱”</li>
              <li style={{ marginBottom: 4 }}>k1 越小，词频收益越快饱和</li>
            </ul>
            <h3 style={{ fontSize: '1.05em', color: '#333', margin: '10px 0 5px 0', fontWeight: 'bold' }}>实战影响</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#444' }}>
              <li style={{ marginBottom: 4 }}>高 k1：适合“重复提到关键词就更相关”的场景</li>
              <li style={{ marginBottom: 4 }}>低 k1：适合模板噪声多、重复词不一定更相关的语料</li>
            </ul>
          </div>

          <div
            style={{
              ...cardStyle,
              backgroundColor: '#f4fcf6',
              borderColor: '#c3e6cb',
            }}
          >
            <h2 style={{ fontSize: '1.25em', margin: '0 0 10px 0', color: '#198754' }}>b: 长度归一化</h2>
            <h3 style={{ fontSize: '1.05em', color: '#333', margin: '10px 0 5px 0', fontWeight: 'bold' }}>它控制什么：</h3>
            <ul style={{ margin: '0 0 10px 0', paddingLeft: 20, color: '#444' }}>
              <li style={{ marginBottom: 4 }}>长文档会被惩罚到什么程度</li>
              <li style={{ marginBottom: 4 }}>b 越大，对长文档惩罚越强</li>
              <li style={{ marginBottom: 4 }}>b 越小，对长文档惩罚越弱</li>
            </ul>
            <h3 style={{ fontSize: '1.05em', color: '#333', margin: '10px 0 5px 0', fontWeight: 'bold' }}>实战影响</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#444' }}>
              <li style={{ marginBottom: 4 }}>高 b：更偏向短小、聚焦的文档</li>
              <li style={{ marginBottom: 4 }}>低 b：适合长手册、长规范里经常藏答案的场景</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function IllustrationBlock({ illustration }) {
  if (!illustration?.src) return null;

  return (
    <div className="content-block">
      <h4 className="block-title">{illustration.title}</h4>
      {illustration.description && (
        <p className="content-text" dangerouslySetInnerHTML={renderMarkdown(illustration.description)} />
      )}
      <div style={{ textAlign: 'center', margin: 'var(--spacing-md) 0' }}>
        <img
          src={illustration.src}
          alt={illustration.title}
          style={{
            maxWidth: '100%',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            background: 'white',
          }}
        />
      </div>
    </div>
  );
}

function ExtensionList({ items = [] }) {
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
}

function SectionContent({ section }) {
  return (
    <div className="fade-in">
      <h2 className="section-title">
        <span>{section.icon}</span>
        {section.title}
      </h2>

      {section.id === 'bm25' ? <BM25FormulaFigure /> : <IllustrationBlock illustration={section.illustration} />}

      {section.content.map((para, i) => (
        <p key={i} className="content-text" dangerouslySetInnerHTML={renderMarkdown(para)} />
      ))}

      <ConceptGrid items={section.concepts} />

      {section.keyPoints && section.keyPoints.length > 0 && (
        <div className="highlight-box">
          <h4 className="block-title" style={{ marginBottom: 'var(--spacing-sm)' }}>🎯 核心要点</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {section.keyPoints.map((point, i) => (
              <li key={i} style={{
                padding: 'var(--spacing-xs) 0',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
                paddingLeft: 'var(--spacing-md)',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute', left: 0,
                  color: 'var(--accent-primary)', fontWeight: 'bold'
                }}>›</span>
                <span dangerouslySetInnerHTML={renderMarkdown(point)} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <PracticeList items={section.engineeringPractice} />

      {section.codeExamples?.map((example, idx) => (
        <div key={`${section.id}-${idx}`} className="content-block">
          {example.title && (
            <h4 className="block-title" style={{ marginBottom: 'var(--spacing-sm)' }}>
              {example.title}
            </h4>
          )}
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
                style={{ margin: 0, whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={renderMarkdown(example.outputSummary)}
              />
            </div>
          )}
        </div>
      ))}

      {!section.codeExamples && section.codeExample && (
        <CodeBlock code={section.codeExample} lang="python" />
      )}

      <ExtensionList items={section.extensions} />

      {section.id === 'rrf' && <RRFDemo />}
      {section.id === 'metadata-filter' && <MetadataFilterFlow />}
    </div>
  );
}

export default function HybridRetrievalTab() {
  const [activeSection, setActiveSection] = useState(hybridSections[0]?.id);

  const currentSection = hybridSections.find(s => s.id === activeSection) || hybridSections[0];

  return (
    <div className="section-tab">
      <aside className="section-sidebar">
        <div className="sidebar-title">
          <span>🔍</span> Hybrid 检索
        </div>
        <nav className="sidebar-nav">
          {hybridSections.map((section) => (
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
        <SectionContent section={currentSection} />
      </div>

      <QuestionPanel
        warmupQuestions={hybridWarmupQuestions}
        questions={hybridQuestions}
        sectionTitle="Hybrid 检索"
      />
    </div>
  );
}

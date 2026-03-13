import React from 'react';

const toRad = (deg) => (deg * Math.PI) / 180;

const CX = 600;
const CY = 415;
const MAIN_R = 178;
const LEAF_FROM_MAIN = 120;
const CENTER_R = 56;

const TOPICS = [
  {
    label: '检索工程',
    color: '#6366f1',
    angle: 0,
    leaves: ['BM25', 'Dense 检索', 'RRF 融合', 'Metadata 过滤'],
  },
  {
    label: 'Reranking',
    color: '#8b5cf6',
    angle: 45,
    leaves: ['Cross-Encoder', 'ColBERT', 'LLM Reranker', 'MMR 去重'],
  },
  {
    label: '评估体系',
    color: '#10b981',
    angle: 90,
    leaves: ['Recall@k', 'MRR / nDCG', 'RAGAS', 'Noise 测试'],
  },
  {
    label: '生产落地',
    color: '#64748b',
    angle: 135,
    leaves: ['监控 Tracing', '安全护栏', '成本优化'],
  },
  {
    label: '数据工程',
    color: '#06b6d4',
    angle: 180,
    leaves: ['文档解析', '分块策略', 'Embedding', '向量数据库'],
  },
  {
    label: 'Agentic RAG',
    color: '#f97316',
    angle: 225,
    leaves: ['Self-RAG', 'CRAG', 'Adaptive-RAG', 'MemoRAG'],
  },
  {
    label: 'Query 优化',
    color: '#f59e0b',
    angle: 270,
    leaves: ['Multi-Query', 'HyDE', 'Self-Query', 'Router'],
  },
  {
    label: '生成质量',
    color: '#ef4444',
    angle: 315,
    leaves: ['Prompt 工程', '幻觉控制', '护栏'],
  },
];

const getLeafOffsets = (n) => {
  if (n >= 4) return [-27, -9, 9, 27];
  if (n === 3) return [-18, 0, 18];
  return [-10, 10];
};

const getTextAnchor = (x) => {
  if (x > CX + 50) return 'start';
  if (x < CX - 50) return 'end';
  return 'middle';
};

const MindMap = () => {
  const lines = [];
  const leaves = [];
  const mainNodes = [];

  TOPICS.forEach((topic, ti) => {
    const mainRad = toRad(topic.angle);
    const mx = CX + MAIN_R * Math.cos(mainRad);
    const my = CY + MAIN_R * Math.sin(mainRad);

    lines.push(
      <line
        key={`cm-${ti}`}
        x1={CX + CENTER_R * Math.cos(mainRad)}
        y1={CY + CENTER_R * Math.sin(mainRad)}
        x2={mx}
        y2={my}
        stroke={topic.color}
        strokeWidth="2"
        opacity="0.5"
      />
    );

    const offsets = getLeafOffsets(topic.leaves.length);
    topic.leaves.forEach((leaf, li) => {
      const leafRad = toRad(topic.angle + offsets[li]);
      const lx = mx + LEAF_FROM_MAIN * Math.cos(leafRad);
      const ly = my + LEAF_FROM_MAIN * Math.sin(leafRad);
      const anchor = getTextAnchor(lx);
      const textDx = anchor === 'start' ? 9 : anchor === 'end' ? -9 : 0;

      leaves.push(
        <g key={`leaf-${ti}-${li}`}>
          <line
            x1={mx} y1={my} x2={lx} y2={ly}
            stroke={topic.color} strokeWidth="1.5" opacity="0.3"
          />
          <circle cx={lx} cy={ly} r="3.5" fill={topic.color} opacity="0.9" />
          <text
            x={lx + textDx}
            y={ly + 4}
            textAnchor={anchor}
            fontSize="11.5"
            fill="#94a3b8"
            fontFamily="system-ui,-apple-system,'PingFang SC',sans-serif"
          >
            {leaf}
          </text>
        </g>
      );
    });

    const boxW = topic.label.length > 8 ? 124 : 108;
    mainNodes.push(
      <g key={`main-${ti}`}>
        <rect
          x={mx - boxW / 2} y={my - 16}
          width={boxW} height={32}
          rx="16"
          fill={topic.color}
          opacity="0.9"
        />
        <text
          x={mx} y={my + 5}
          textAnchor="middle"
          fontSize="12.5"
          fontWeight="600"
          fill="white"
          fontFamily="system-ui,-apple-system,'PingFang SC',sans-serif"
        >
          {topic.label}
        </text>
      </g>
    );
  });

  return (
    <svg
      viewBox="0 0 1200 830"
      style={{ width: '100%', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="1200" height="830" fill="#0f172a" rx="12" />

      {/* subtle radial guides */}
      {TOPICS.map((t, i) => (
        <line
          key={`guide-${i}`}
          x1={CX} y1={CY}
          x2={CX + (MAIN_R + LEAF_FROM_MAIN + 60) * Math.cos(toRad(t.angle))}
          y2={CY + (MAIN_R + LEAF_FROM_MAIN + 60) * Math.sin(toRad(t.angle))}
          stroke={t.color}
          strokeWidth="1"
          opacity="0.06"
        />
      ))}

      {lines}
      {leaves}
      {mainNodes}

      {/* Center outer glow ring */}
      <circle cx={CX} cy={CY} r={CENTER_R + 8} fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
      {/* Center dashed ring */}
      <circle
        cx={CX} cy={CY} r={CENTER_R + 2}
        fill="none"
        stroke="#6366f1"
        strokeWidth="1.5"
        strokeDasharray="5 3"
        opacity="0.5"
      />
      {/* Center fill */}
      <circle cx={CX} cy={CY} r={CENTER_R} fill="#1e293b" />

      <text
        x={CX} y={CY - 10}
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="#f1f5f9"
        fontFamily="system-ui,-apple-system,'PingFang SC',sans-serif"
      >
        RAG
      </text>
      <text
        x={CX} y={CY + 11}
        textAnchor="middle"
        fontSize="11.5"
        fill="#64748b"
        fontFamily="system-ui,-apple-system,'PingFang SC',sans-serif"
      >
        生产实践
      </text>
    </svg>
  );
};

const TAKEAWAYS = [
  { phase: 1, color: '#06b6d4', icon: '📄', title: '数据工程', points: ['文档解析质量直接决定 RAG 上限', 'Chunk 策略需结合文档结构和查询模式', 'Embedding 要在目标领域做区分度测试'] },
  { phase: 2, color: '#6366f1', icon: '🔍', title: '检索 + Rerank', points: ['BM25 + Dense 混合几乎总优于单路', 'Cross-Encoder Rerank 能大幅提升 Top-k 精度', 'Query 改写是低成本高收益的优化手段'] },
  { phase: 3, color: '#f59e0b', icon: '📊', title: '评估 + 上线', points: ['没有评估就没有优化方向——先建 Benchmark', 'Agentic RAG 核心代价是延时和 token', '生产系统必须有 Tracing 才能定位问题'] },
];

const SummaryTab = () => {
  return (
    <div className="section-tab fade-in">
      <div className="section-main" style={{ flex: 1, maxWidth: '100%' }}>

        <div className="content-block">
          <h2 className="section-title">知识总结</h2>
          <p className="content-text">
            一天的工作坊结束前，我们从两个视角回顾整个 RAG 知识体系：企业落地的架构全景，以及各模块之间的核心关联。
          </p>
        </div>

        {/* Architecture overview image */}
        <div className="content-block">
          <div className="block-title">🏗️ 企业级 RAG 架构全景</div>
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-lg)',
          }}>
            <img
              src="/rag-architecture-overview.png"
              alt="企业级 RAG 架构全景"
              style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'block' }}
            />
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              marginTop: 'var(--spacing-sm)',
              textAlign: 'center',
              lineHeight: 1.6,
            }}>
              Enterprise Data Store → Indexing API（Extract / Chunk / Embed）→ Vector Store → Hybrid Search → Reranking → Prompt → Generative LLM，
              配合 Hallucination Detection 与 Metadata 过滤构成完整闭环。
            </p>
          </div>
        </div>

        {/* Mind map */}
        <div className="content-block">
          <div className="block-title">🧠 RAG 知识体系脑图</div>
          <div style={{
            background: '#0f172a',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #1e293b',
            overflow: 'hidden',
          }}>
            <MindMap />
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-sm)', textAlign: 'center' }}>
            8 个核心模块，32 个关键技术点
          </p>
        </div>

        {/* Key Takeaways */}
        <div className="content-block">
          <div className="block-title">📝 课后总结</div>
          <div className="compare-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {TAKEAWAYS.map((t, i) => (
              <div key={i} className="compare-card" style={{ borderTop: `3px solid ${t.color}` }}>
                <div className="compare-card-title">
                  <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                  <span
                    className="tag"
                    style={{ background: `${t.color}22`, color: t.color, fontWeight: 600 }}
                  >
                    Phase {t.phase}
                  </span>
                  <span>{t.title}</span>
                </div>
                <ul style={{ paddingLeft: 'var(--spacing-md)', margin: 0 }}>
                  {t.points.map((p, j) => (
                    <li key={j} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '3px 0', lineHeight: 1.5 }}>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SummaryTab;

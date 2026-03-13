import { useState } from 'react';

const PHASE_COLORS = {
  1: '#06b6d4', // accent-info
  2: '#6366f1', // accent-primary
  3: '#f59e0b', // accent-warning
};

const SCHEDULE = [
  {
    phase: 1,
    title: '架构视野与数据基石',
    time: '09:00 - 12:00',
    items: [
      { time: '09:00-09:45', title: 'RAG 技术演进: Naive → Advanced → Agentic → 知识增强' },
      { time: '09:45-10:30', title: '数据工程: 复杂文档解析(PDF/表格/电路图) + 分块策略' },
      { time: '10:30-10:45', title: '茶歇', isBreak: true },
      { time: '10:45-12:00', title: 'Embedding 选型 & 向量数据库 + 元数据过滤实战' },
    ],
  },
  {
    phase: 2,
    title: '检索工程与生成质量',
    time: '13:30 - 16:30',
    items: [
      { time: '13:30-14:15', title: '混合检索: BM25 + Dense + RRF Fusion' },
      { time: '14:15-15:00', title: '重排序 + Query 改写 (HyDE/RAG Fusion/Self-Query)' },
      { time: '15:00-15:15', title: '茶歇', isBreak: true },
      { time: '15:15-16:00', title: '生成质量: 幻觉检测/纠正 + 护栏(ShieldGemma/LlamaGuard)' },
      { time: '16:00-16:30', title: '实战 Lab: 两阶段检索器 + 重排序对比实验' },
    ],
  },
  {
    phase: 3,
    title: '评估运营与高阶架构',
    time: '16:45 - 18:30',
    items: [
      { time: '16:45-17:15', title: '评估体系: RAG Triad + RAGAS/DeepEval + CI/CD 门禁' },
      { time: '17:15-17:45', title: 'Agentic RAG & GraphRAG 轻量替代路线' },
      { time: '17:45-18:15', title: '生产落地: ACL/RBAC + 成本优化 + 数据新鲜度 + 监控' },
      { time: '18:15-18:30', title: '总结 & Q/A' },
    ],
  },
];

const LEARNING_OBJECTIVES = [
  '掌握 RAG 全链路架构与技术选型',
  '实现混合检索 + 重排序优化管线',
  '建立生成质量防线(幻觉/护栏)',
  '搭建自动化评估闭环(RAGAS + 监控)',
  '理解 Agentic RAG 与知识图谱增强路线',
  '制定 ACL/成本/运维的生产落地方案',
];

const TECH_STACK = [
  { category: '文档解析', tools: 'PaddleOCR-VL-1.5, MinerU API, PyMuPDF' },
  { category: 'Embedding', tools: 'Qwen3-Embedding-8B (硅基流动 API), OpenAI Embedding' },
  { category: '向量数据库', tools: 'ChromaDB (实验), Qdrant / Milvus (生产)' },
  { category: '检索/Rerank', tools: 'BM25, Cross-encoder, Zerank 2, Qwen3 Reranker 8B, Colbert' },
  { category: '框架', tools: 'LangChain, LlamaIndex, LangGraph' },
  { category: '评估', tools: 'RAGAS, DeepEval, Open-RAG-Eval' },
  { category: '护栏', tools: 'ShieldGemma, LlamaGuard, NeMo Guardrails' },
  { category: '可观测', tools: 'LangSmith, Langfuse, Arize Phoenix' },
];

const PREP_CATEGORIES = [
  {
    icon: '💻',
    title: '基础环境',
    color: '#06b6d4',
    items: [
      { name: 'Python 3.10+', cmd: 'python --version', note: '推荐 3.11' },
      { name: 'Git', cmd: 'git --version', note: null },
      { name: 'Node.js 18+', cmd: 'node --version', note: '课件前端需要（可选）' },
    ],
  },
  {
    icon: '🔑',
    title: 'API Keys',
    color: '#f59e0b',
    items: [
      { name: 'OpenAI API Key', cmd: 'export OPENAI_API_KEY="sk-..."', note: '用于 GPT-4o / Embedding API 调用，必须' },
      { name: 'MinerU API Key', cmd: null, note: '文档解析对比实验 — mineru.net 注册获取（可选）' },
      { name: 'LangSmith API Key', cmd: null, note: '用于 Tracing / 可观测（可选）' },
    ],
  },
  {
    icon: '🤖',
    title: '模型提前下载（体积较大，务必提前）',
    color: '#8b5cf6',
    items: [
      { name: 'PaddleOCR-VL-1.5', cmd: 'pip install paddlepaddle paddleocr\n# HuggingFace: PaddlePaddle/PaddleOCR-VL-1.5', note: '文档解析 Lab — 多模态 OCR，支持表格/公式/电路图' },
      { name: 'BGE-M3 Embedding', cmd: 'pip install FlagEmbedding\n# 模型: BAAI/bge-m3 (~2GB)', note: '多语言 Embedding，首次 import 自动下载' },
      { name: 'Qwen3-Embedding-4B', cmd: 'pip install sentence-transformers\n# 模型: Qwen/Qwen3-Embedding-4B (~8GB)', note: 'MTEB 顶级水准，与 BGE-M3 做对比实验，需要较大显存' },
      { name: 'BGE-Reranker-v2-m3', cmd: '# 模型: BAAI/bge-reranker-v2-m3 (~1GB)', note: 'Rerank 对比实验' },
    ],
  },
  {
    icon: '📦',
    title: 'Python 核心依赖',
    color: '#6366f1',
    items: [
      { name: '框架层', cmd: 'pip install langchain langchain-openai langchain-community llama-index', note: null },
      { name: '文档解析', cmd: 'pip install pymupdf paddlepaddle paddleocr python-docx', note: null },
      { name: 'Embedding & Rerank', cmd: 'pip install FlagEmbedding sentence-transformers', note: null },
      { name: '向量数据库 & BM25', cmd: 'pip install chromadb rank-bm25', note: 'ChromaDB 本地持久化 + 纯 Python BM25，pip 装完即用' },
      { name: '评估工具', cmd: 'pip install ragas deepeval', note: null },
      { name: '可观测 & 护栏', cmd: 'pip install langsmith langfuse nemoguardrails', note: null },
      { name: '工具类', cmd: 'pip install jieba numpy pandas httpx', note: null },
    ],
  },
  {
    icon: '🧠',
    title: '知识储备',
    color: '#ef4444',
    items: [
      { name: '基本 RAG 开发经验', cmd: null, note: '了解 Embedding → 向量检索 → LLM 生成 的基本流程' },
      { name: 'Python 编程能力', cmd: null, note: '能独立编写 async / API 调用 / 数据处理代码' },
      { name: 'LLM API 调用经验', cmd: null, note: '使用过 OpenAI / Claude / 通义千问等 API' },
    ],
  },
  {
    icon: '🐳',
    title: '进阶（可选，生产环境部署时需要）',
    color: '#64748b',
    items: [
      { name: 'Docker Desktop', cmd: 'docker --version', note: '生产部署时 ES / Qdrant / Redis 通常容器化运行，工作坊实验不需要' },
      { name: 'Elasticsearch 8.x', cmd: 'docker pull elasticsearch:8.15.0', note: '生产级 BM25 + 混合检索，工作坊用 rank-bm25 替代' },
      { name: 'Qdrant / Milvus', cmd: 'docker pull qdrant/qdrant:latest', note: '生产级向量库，工作坊用 ChromaDB 本地模式替代' },
    ],
  },
];

const TOOL_FRAMEWORK_CARDS = [
  { id: 'langchain', icon: '🧱', title: 'LangChain & LangGraph', desc: 'RAG 管道组装 + Agent 状态编排' },
  { id: 'langfuse', icon: '📈', title: 'Langfuse', desc: '看 trace、tool call、latency、agent 轨迹' },
  { id: 'ocr', icon: '📄', title: 'MinerU & PaddleOCR', desc: '复杂 PDF / 表格 / 图文混排解析' },
  { id: 'tools', icon: '🛠️', title: 'Tools', desc: 'Tavily、网页抓取、外部检索和业务接口' },
];

const CourseHomeTab = ({ tabs = [], onNavigate = () => {}, onOpenToolFramework = () => {} }) => {
  const [expandedPrep, setExpandedPrep] = useState({});

  const togglePrep = (idx) => {
    setExpandedPrep(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="section-tab fade-in">
      <div className="section-main" style={{ flex: 1, maxWidth: '100%' }}>
        {/* Workshop Title & Overview */}
        <div className="content-block">
          <h2 className="section-title">RAG 生产实践工作坊</h2>
          <p className="content-text" style={{ fontSize: '1.05rem', marginBottom: 'var(--spacing-sm)' }}>
            一天密集实战，面向有经验的开发者
          </p>
          <div className="highlight-box">
            <p className="content-text" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
              从 0 到生产级 RAG：一天掌握构建、调优、评估与上线
            </p>
          </div>
        </div>

        <div className="content-block">
          <div className="block-title">🗂️ 课程目录</div>
          <div className="compare-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {tabs.filter((tab) => tab.id !== 'home' && tab.id !== 'tool-framework').map((tab) => (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className="compare-card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: 'var(--bg-secondary)',
                }}
              >
                <div className="compare-card-title">
                  <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
                <div className="compare-card-body">
                  {tab.phase ? `Phase ${tab.phase}` : '概览 / 参考材料'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="content-block">
          <div className="block-title">🧰 工具 / 框架介绍</div>
          <div className="compare-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {TOOL_FRAMEWORK_CARDS.map((card) => (
              <button
                key={card.id}
                onClick={() => onOpenToolFramework(card.id)}
                className="compare-card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: 'var(--bg-secondary)',
                }}
              >
                <div className="compare-card-title">
                  <span style={{ fontSize: '1.1rem' }}>{card.icon}</span>
                  <span>{card.title}</span>
                </div>
                <div className="compare-card-body">{card.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Timeline */}
        <div className="content-block">
          <div className="block-title">📅 日程安排</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            {SCHEDULE.map((phaseData) => {
              const accentColor = PHASE_COLORS[phaseData.phase];
              return (
                <div
                  key={phaseData.phase}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      borderLeft: `4px solid ${accentColor}`,
                      background: `${accentColor}15`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                      <span
                        className="tag"
                        style={{
                          background: `${accentColor}30`,
                          color: accentColor,
                          fontWeight: 600,
                        }}
                      >
                        Phase {phaseData.phase}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {phaseData.title}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {phaseData.time}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: 'var(--spacing-md)' }}>
                    {phaseData.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 'var(--spacing-md)',
                          padding: item.isBreak
                            ? 'var(--spacing-sm) 0'
                            : 'var(--spacing-sm) var(--spacing-md)',
                          marginBottom: idx < phaseData.items.length - 1 ? 'var(--spacing-xs)' : 0,
                          background: item.isBreak ? 'transparent' : 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-md)',
                          borderLeft: item.isBreak ? 'none' : `3px solid ${accentColor}`,
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: '0.8rem',
                            fontFamily: 'JetBrains Mono, monospace',
                            color: item.isBreak ? 'var(--text-muted)' : accentColor,
                            minWidth: '90px',
                          }}
                        >
                          {item.time}
                        </span>
                        <span
                          style={{
                            fontSize: item.isBreak ? '0.9rem' : '0.95rem',
                            color: item.isBreak ? 'var(--text-muted)' : 'var(--text-secondary)',
                            fontStyle: item.isBreak ? 'italic' : 'normal',
                          }}
                        >
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="content-block">
          <div className="block-title">🎯 学习目标</div>
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {LEARNING_OBJECTIVES.map((obj, idx) => (
              <div key={idx} className="compare-card">
                <div className="compare-card-title">
                  <span className="tag tag-primary">{idx + 1}</span>
                </div>
                <div className="compare-card-body">{obj}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Overview */}
        <div className="content-block">
          <div className="block-title">🛠️ 技术栈概览</div>
          <table className="info-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>工具/库</th>
              </tr>
            </thead>
            <tbody>
              {TECH_STACK.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{row.category}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.tools}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ==================== Preparation Checklist ==================== */}
        <div className="content-block">
          <div className="block-title">📋 课前准备清单</div>
          <div className="danger-box" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <p className="content-text" style={{ margin: 0, fontWeight: 600 }}>
              请务必在工作坊前一天完成以下准备，现场网络可能不稳定时 API 调用会受影响。
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {PREP_CATEGORIES.map((cat, catIdx) => {
              const isExpanded = expandedPrep[catIdx] !== false; // default open
              return (
                <div
                  key={catIdx}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => togglePrep(catIdx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)',
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      background: 'transparent',
                      border: 'none',
                      borderLeft: `4px solid ${cat.color}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {cat.title}
                    </span>
                    <span className="tag" style={{ background: `${cat.color}25`, color: cat.color }}>
                      {cat.items.length} 项
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'transform 150ms', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      ▾
                    </span>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 var(--spacing-lg) var(--spacing-md)' }}>
                      {cat.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            marginBottom: 'var(--spacing-xs)',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <span style={{ color: cat.color, fontSize: '0.8rem' }}>●</span>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                              {item.name}
                            </span>
                          </div>
                          {item.cmd && (
                            <div style={{
                              background: '#f8fafc',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '6px 10px',
                              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                              fontSize: '0.8rem',
                              color: '#0f172a',
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.5,
                            }}>
                              {item.cmd}
                            </div>
                          )}
                          {item.note && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: 'var(--spacing-md)' }}>
                              {item.note}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick install script */}
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="block-title">⚡ 一键安装脚本</div>
            <div className="code-block">
              <div className="code-header">
                <span className="code-lang">bash — 课前环境准备</span>
              </div>
              <div className="code-content">
                <pre>{`# 1. Python 依赖（一次性安装）
pip install langchain langchain-openai langchain-community llama-index \\
  pymupdf python-docx \\
  chromadb rank-bm25 \\
  ragas deepeval langsmith langfuse nemoguardrails \\
  jieba numpy pandas httpx

# 2. 验证 ChromaDB
python -c "
import chromadb
client = chromadb.Client()
col = client.create_collection('test')
col.add(documents=['hello'], ids=['1'])
print('✅ ChromaDB ready')
"

# 3. 验证 API Key（Embedding / Rerank 走硅基流动等 API，无需本地模型）
python -c "
import os
assert os.getenv('OPENAI_API_KEY'), '❌ 请设置 OPENAI_API_KEY'
print('✅ OpenAI API Key ready')
"
# 硅基流动：Qwen3-Embedding-8B、Qwen3 Reranker 8B 等，见 https://cloud.siliconflow.cn
test -n \"$SILICONFLOW_API_KEY\" && echo '✅ SILICONFLOW_API_KEY 已设置' || echo '⚠️ 可选：export SILICONFLOW_API_KEY=... 用于 Embedding/Rerank API'

echo "🎉 环境准备完成！纯 Python + API，无需下载模型与 Docker。"`}</pre>
              </div>
            </div>
          </div>

          <div className="success-box" style={{ marginTop: 'var(--spacing-md)' }}>
            <p className="content-text" style={{ margin: 0 }}>
              <strong>工作坊设计原则：纯 Python + API，无需下载模型。</strong>Embedding / Rerank 使用硅基流动等 API（Qwen3-Embedding-8B、Qwen3 Reranker 8B 等），
              向量库用 ChromaDB，BM25 用 rank-bm25。所有实验只需 Python + OpenAI / 硅基流动 API Key 即可运行。
              Docker / ES / Qdrant 等属于生产落地阶段内容，课上讲原理和选型，不做硬性要求。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHomeTab;

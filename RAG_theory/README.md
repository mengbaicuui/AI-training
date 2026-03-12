# RAG Theory — 交互式课件

面向有经验的 IT 开发者的一日制 RAG 工作坊，覆盖从概念到生产落地的完整 RAG pipeline。

## 快速启动

```bash
cd RAG_theory
npm install   # 首次运行需要安装依赖
npm run dev
```

浏览器访问 `http://localhost:5173` 即可打开课件。

## 课件内容

| 模块 | 主要内容 |
|------|----------|
| RAG Pipeline 总览 | 端到端流水线拆解，各阶段核心职责 |
| RAG 演进史 | Naive RAG → Advanced RAG → Agentic RAG |
| 数据工程 | 文档解析、分块策略、Embedding 选型、向量数据库、数据新鲜度 |
| 混合检索 | BM25、Dense Retrieval、RRF 融合、Metadata 过滤、评估指标 |
| Reranking | Cross-Encoder、ColBERT、LLM Reranker、上下文组装、验收调参 |
| Query 改写 | failure mode → 技巧映射（MMR / Self-Query / Multi-Query / HyDE / Router） |
| Agentic RAG | Self-RAG、CRAG、Adaptive-RAG、MemoRAG |
| 生成质量 | Prompt 工程、幻觉控制、引用溯源 |
| 评估体系 | Recall@k、MRR、nDCG、Faithfulness、噪声灵敏度 |
| 成本与延时 | Latency budget、Token 优化、缓存策略 |
| Graph RAG | 知识图谱增强检索 |
| 生产部署 | 监控、灰度、安全护栏 |

## 技术栈

- **前端**：React + Vite
- **样式**：纯 CSS（无 UI 框架依赖）

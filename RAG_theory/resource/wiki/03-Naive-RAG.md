# Naive RAG

定义：
以“检索 + 拼接上下文 + 生成”为主的基础范式，不显著引入图结构、多代理协作或复杂控制闭环。

标签：
- naive rag

关注点：
- retrieval quality
- chunking
- indexing
- reranking
- context packing
- hallucination mitigation

## 代表论文
1. Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
2. REALM: Retrieval-Augmented Language Model Pre-Training
3. Dense Passage Retrieval for Open-Domain Question Answering
4. FiD: Leveraging Passage Retrieval with Generative Models for Open Domain Question Answering
5. Atlas: Few-shot Learning with Retrieval Augmented Language Models
6. HyDE: Precise Zero-Shot Dense Retrieval without Relevance Labels
7. RePlug: Retrieval-Augmented Black-Box Language Models
8. Improving Language Models by Retrieving from Trillions of Tokens
9. RetroMAE: Pre-Training Retrieval-oriented Language Models Via Masked Auto-Encoder
10. In-Context RALM: Retrieval-Augmented Language Models in the Inference Pipeline
11. RAG-Fusion: A New Take on Retrieval Augmented Generation
12. RankRAG: Unifying Context Ranking with Retrieval-Augmented Generation
13. LongRAG: Enhancing Retrieval-Augmented Generation with Long-context LLMs
14. RA-DIT: Retrieval-Augmented Dual Instruction Tuning
15. Demonstrate-Search-Predict: Composing Retrieval and Language Models for Knowledge-Intensive NLP
16. Question Answering over Tabular Data with Row and Column Retrieval
17. Retrieve Anything To Augment Large Language Models
18. RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval

## 小结
Naive RAG 仍然是整个知识库的主体：它覆盖了 retrieval、reranking、context 组织、训练与推理阶段接入方式，是最适合做课程主线的部分。
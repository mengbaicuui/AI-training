export const hybridSections = [
  {
    id: 'why-hybrid',
    title: '为什么 Hybrid 是默认选择',
    icon: '⚡',
    content: [
      'BM25 和 Dense Retrieval 各有擅长的 query 类型，单独用任何一路都会有系统性盲区。BM25 基于 term frequency 和 inverse document frequency，对精确匹配、稀有 token 有天然优势——工单号 "ERR_2041"、产品简称 "OA3.0"、报错码 "NullPointerException" 这类 query，向量模型几乎无法正确编码语义，BM25 却能精准命中。',
      'Dense Retrieval 通过 embedding 空间的距离度量实现语义匹配，擅长处理同义改写（"怎么请假" vs "休假申请流程"）、跨语言相似（中英混合 query）、以及上下文推理（"之前提到的那个方案" 的指代消解依赖上游 query rewrite，但语义向量天然更鲁棒）。',
      '研究与工程实践都验证了 Hybrid 的优势：2024 年 BEIR benchmark 上 BM25+Dense 的 Hybrid 方案比纯向量检索在 nDCG@10 上平均提升约 35%（Weaviate 技术报告）。在企业场景中这个差距往往更大，因为企业数据含有大量编号、缩写、内部术语——这些恰恰是向量模型的弱项。',
      '工程建议：除非你的 query 100% 是自然语言描述且无任何专有名词，否则 Hybrid 应该作为 RAG 系统的默认检索策略。'
    ],
    concepts: [
      { term: 'Sparse Retrieval', desc: '以 BM25 为代表，核心是 **词项匹配**。它不理解语义，但非常擅长抓住错误码、编号、缩写和精确关键词。' },
      { term: 'Dense Retrieval', desc: '以 embedding 检索为代表，核心是 **向量空间里的语义相似**。它擅长同义改写、模糊表达和跨语言语义对齐。' },
      { term: 'Hybrid Retrieval', desc: '不是“谁替代谁”，而是把 sparse 和 dense 的优势组合起来，减少单一路的系统性盲区。' },
    ],
    keyPoints: [
      'BM25 擅长：精确匹配、稀有 token（编号/报错码/缩写）、长尾专有名词',
      'Dense 擅长：语义相似、同义改写、跨语言匹配、模糊意图理解',
      '单一路盲区：向量检索对罕见 token 几乎随机；BM25 对改写和意图理解无力',
      'Hybrid 在 BEIR benchmark 上比纯向量提升约 35%（nDCG@10）',
      '企业场景的编号/术语密度远高于公开数据集，Hybrid 优势更显著'
    ],
    engineeringPractice: [
      '默认把 Hybrid 当成企业 RAG 的起点，而不是等线上出问题再补 BM25。',
      '先把 query 分成 **编号类 / 术语类 / 自然语言类 / 混合类**，再看 BM25-only、Dense-only、Hybrid 三组的差异。',
      '如果你的系统里有大量工单号、报错码、车型编号、法规条款号，Hybrid 通常不是优化项，而是必需项。'
    ],
    extensions: [
      {
        question: '什么时候可以不做 Hybrid，而只用 Dense？',
        approach: '先看 query 分布，而不是看模型榜单。如果你的 query 几乎全是自然语言描述，没有编号、缩写、错误码、版本号，也没有强依赖精确词项的业务约束，那么纯 Dense 可能够用。但要用评估集证明这一点，而不是靠直觉。'
      },
      {
        question: '为什么很多团队“向量检索效果不错”，上线后还是要补 BM25？',
        approach: '因为离线 demo 往往以自然语言 query 为主，而真实线上流量常常掺杂错误码、产品型号、内部简称和短 query。Dense 在这类 query 上的弱点通常要到生产环境才暴露。'
      }
    ],
    codeExample: `# 典型 Hybrid 检索伪代码（以 Elasticsearch 8.x 为例）
from elasticsearch import Elasticsearch

es = Elasticsearch("https://localhost:9200")

def hybrid_search(query: str, index: str, k: int = 20):
    """BM25 + kNN 双路检索，服务端 RRF 融合"""
    resp = es.search(
        index=index,
        retriever={
            "rrf": {
                "retrievers": [
                    {
                        "standard": {
                            "query": {
                                "multi_match": {
                                    "query": query,
                                    "fields": ["title^3", "content", "tags^2"],
                                    "type": "best_fields"
                                }
                            }
                        }
                    },
                    {
                        "knn": {
                            "field": "embedding",
                            "query_vector_builder": {
                                "text_embedding": {
                                    "model_id": "bge-m3",
                                    "model_text": query
                                }
                            },
                            "k": k,
                            "num_candidates": k * 5
                        }
                    }
                ],
                "rank_window_size": k,
                "rank_constant": 60
            }
        },
        size=k
    )
    return resp["hits"]["hits"]`
  },
  {
    id: 'bm25',
    title: 'BM25 实战要点',
    icon: '📝',
    content: [
      'BM25 本质上是一种**基于词项统计的排序函数**。它不做向量语义理解，而是根据 query 里的词在文档中出现了多少次（TF）、这些词在整个语料里是否稀有（IDF），来判断一篇文档和 query 是否相关。',
      '如果把 BM25 公式拆开看，最值得关注的其实不是整条公式，而是两个最关键的参数：**`k1`** 和 **`b`**。`k1` 控制词频饱和速度，决定“同一个词在文档里多出现几次”还能带来多少额外收益；`b` 控制文档长度归一化强度，决定长文档会被惩罚到什么程度。',
      'BM25 的效果高度依赖分词质量。中文场景下必须选择合适的分词器：Elasticsearch 推荐 ik_max_word（索引时）+ ik_smart（查询时）的组合；如果用 Python 端做预处理，jieba 的搜索引擎模式（jieba.cut_for_search）能提供更好的召回。关键陷阱：默认 standard analyzer 会把中文按单字切分，BM25 退化为字符级匹配，效果极差。',
      '字段权重（field boosting）是低成本高回报的调优手段。标题字段通常 boost 2-5x，标签/关键词字段 boost 2-3x，正文保持 1x。multi_match 的 best_fields 类型适合精确匹配场景，cross_fields 适合短 query 分散在多个字段的情况。',
      '同义词扩展对 BM25 影响显著。建议维护业务同义词表（如 "OA" → "办公自动化"、"HR" → "人力资源"），在 analyzer 的 synonym filter 阶段注入。注意同义词扩展要在索引时和查询时保持一致，否则会出现静默召回丢失。',
      'BM25 对术语/编号类 query 具有不可替代性。当用户输入 "ERR_2041" 或 "v3.2.1-hotfix" 这种高信息密度 token 时，BM25 能直接通过 inverted index 精准定位，而向量模型会将其编码为一个与训练分布差异很大的 embedding，检索结果近乎随机。这是 Hybrid 系统中 BM25 最关键的价值。'
    ],
    concepts: [
      { term: 'TF-IDF 直觉', desc: '一个词在当前文档里出现得越多、在全语料里越稀有，它对相关性的贡献通常越大。BM25 就是在这个直觉上做了更稳健的长度归一化。' },
      { term: 'Inverted Index', desc: 'BM25 的底层依赖倒排索引。它先按词找候选文档，再做打分，因此对精确词项、错误码、型号、缩写特别敏感。' },
      { term: 'Analyzer', desc: '中文 BM25 的上限，很大程度取决于分词器、停用词和同义词配置。分词错了，后面所有打分都建立在错误 token 上。' },
    ],
    illustration: {
      title: 'BM25 公式与关键参数',
      description: '看 BM25 公式时，最关键的是盯住 **`k1`** 和 **`b`**：`k1` 决定词频项的饱和速度，`b` 决定长度归一化强度。实战里大多数问题不是“公式看不懂”，而是 **分词、字段权重、`k1/b` 设置不合适**。默认可从 `k1≈1.2~2.0`、`b≈0.6~0.8` 起步。',
      src: '/bm25-formula-diagram.svg',
    },
    keyPoints: [
      '中文分词器选择：ik_max_word（索引）+ ik_smart（查询）组合，或 jieba.cut_for_search',
      '绝对不能用 standard analyzer 处理中文——退化为单字匹配',
      '`k1` 控制词频饱和：越大越鼓励同一词反复出现；越小越快饱和，重复出现的额外收益更低',
      '`b` 控制长度归一化：越大越惩罚长文档；越小越弱化长文档惩罚',
      '字段权重：title boost 2-5x, tags boost 2-3x, content 保持 1x',
      '同义词表需索引时和查询时双端一致，避免静默召回丢失',
      '编号/报错码/版本号等高信息密度 token 是 BM25 的独有优势区'
    ],
    engineeringPractice: [
      '如果是中文场景，先解决 **分词器**，再谈 BM25 效果；默认 analyzer 往往会把你带沟里。',
      '调 BM25 时，先固定分词器和字段权重，再调 `k1` / `b`；不要把多个变量一起改。',
      '经验起点：`k1` 可从 `1.2` 或 `1.5` 开始，`b` 可从 `0.75` 开始；再用评估集小范围网格搜索。',
      '如果你的文档普遍很长但真正有用的信息只在局部，适当降低 `b` 往往能减少对长文档的过度惩罚。',
      '如果 query 往往依赖关键词在文档里多次出现来判断相关性，可以适当提高 `k1`；如果重复出现经常只是模板噪声，则降低 `k1`。',
      '把 `title`、`tags`、`keywords` 这类高密度字段单独提权，往往比盲目调 `k1` / `b` 更有收益。',
      '维护一份业务词典和同义词表，尤其是产品简称、部门黑话、内部缩写和型号命名规则。',
      '本地原型可以先用 `rank_bm25 + jieba` 验证效果，生产再迁移到 Elasticsearch / OpenSearch。'
    ],
    codeExamples: [
      {
        title: '方案 A：生产环境里的 Elasticsearch BM25 配置',
        description: '适合已经上了 Elasticsearch / OpenSearch 的团队：把中文分词、同义词和字段权重一次配好，直接服务线上检索。',
        code: `# Elasticsearch 中文分词 + 同义词 + 字段权重配置
PUT /enterprise_kb
{
  "settings": {
    "analysis": {
      "filter": {
        "biz_synonyms": {
          "type": "synonym",
          "synonyms_path": "analysis/biz_synonyms.txt"
        }
      },
      "analyzer": {
        "ik_with_synonyms": {
          "tokenizer": "ik_max_word",
          "filter": ["lowercase", "biz_synonyms"]
        },
        "ik_search": {
          "tokenizer": "ik_smart",
          "filter": ["lowercase", "biz_synonyms"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "ik_with_synonyms",
        "search_analyzer": "ik_search",
        "boost": 3
      },
      "content": {
        "type": "text",
        "analyzer": "ik_with_synonyms",
        "search_analyzer": "ik_search"
      },
      "tags": {
        "type": "text",
        "analyzer": "keyword",
        "boost": 2
      }
    }
  }
}`,
      },
      {
        title: '方案 B：本地轻量 BM25（rank_bm25 + jieba）',
        description: '适合 workshop、原型验证和本地实验。优点是依赖很轻、几分钟能跑起来，也很适合先验证“BM25 对错误码/术语到底有没有帮助”。',
        outputSummary: `实际运行输出：
BM25 索引构建完成
QUERY: ERR-502-DB
TOKENS: ['ERR', '-', '502', '-', 'DB']
TOP1: 由于网络超时，数据库报出了 ERR-502-DB 错误，请检查连接。
----------------------------------------
QUERY: 点火线圈 蓄电池
TOKENS: ['点火', '线圈', '蓄电池']
TOP1: 维修步骤：先断开蓄电池负极；然后拆下点火线圈。`,
        code: `# 需要安装: pip install rank_bm25 jieba
import jieba
from rank_bm25 import BM25Okapi

# 1. 准备知识库 Chunk（假装这些是已经切分好的段落）
corpus = [
    "维修步骤：先断开蓄电池负极；然后拆下点火线圈。",
    "由于网络超时，数据库报出了 ERR-502-DB 错误，请检查连接。",
    "苹果公司发布了最新的 iPhone 15 Pro Max 256G 钛金属版本。",
    "点火系统故障诊断：重点检查火花塞是否积碳。"
]

# 2. 定义分词与清洗函数
def tokenize(text: str) -> list:
    # 实际生产中这里通常会加载业务词典：
    # jieba.load_userdict("my_dict.txt")
    words = jieba.lcut(text)
    stop_words = {"：", "；", "。", "，", "了", "的", "由于", "请"}
    return [w for w in words if w not in stop_words and w.strip()]

# 3. 构建 BM25 索引
tokenized_corpus = [tokenize(doc) for doc in corpus]
bm25_index = BM25Okapi(tokenized_corpus)
print("BM25 索引构建完成")

# 4. 执行检索测试
queries = [
    "ERR-502-DB",       # 专有名词 / 错误码精确匹配
    "点火线圈 蓄电池",   # 领域组合词匹配
]

for query in queries:
    tokenized_query = tokenize(query)
    top_n_results = bm25_index.get_top_n(tokenized_query, corpus, n=1)
    print(f"QUERY: {query}")
    print(f"TOKENS: {tokenized_query}")
    print(f"TOP1: {top_n_results[0]}")
    print("-" * 40)`,
      }
    ]
    ,
    extensions: [
      {
        question: 'BM25 在你的业务里最可能“赢过向量”的 query 是哪些？',
        approach: '先去看真实查询日志，重点找错误码、型号、单号、版本号、法规条款号、内部简称和极短 query。不要抽象地讨论 BM25 优势，而要把它落到具体 query 类型上。'
      },
      {
        question: '为什么中文 BM25 里“分词器”往往比算法公式本身更重要？',
        approach: '因为 BM25 只会在 token 层面打分。token 切得对，BM25 才能发挥；token 切错了，再高级的公式也只是在错误输入上做精致计算。'
      },
      {
        question: '什么时候该先调 `k1`，什么时候该先调 `b`？',
        approach: '先看问题像“词频不敏感”还是“长文档被压制过头”。如果你发现关键词在高相关文档里反复出现却没带来明显优势，先看 `k1`；如果长文档明明相关却总被短文档压过，先看 `b`。但前提仍然是分词和字段权重已经基本合理。'
      }
    ]
  },
  {
    id: 'dense',
    title: 'Dense Retrieval 实战要点',
    icon: '🧮',
    content: [
      'Embedding 模型选择是 Dense Retrieval 效果的天花板。2025-2026 主流选择：BGE-M3（多语言、多粒度）、GTE-Qwen2（中文优化、Alibaba）、Jina Embeddings v3（长文本、多语言）。选型核心看三个维度：你的数据语言分布、文档平均长度、以及对延迟的容忍度。',
      '维度与性能存在明确权衡。1024 维 embedding 在精度上略优于 768 维（约 1-3% nDCG 差异），但存储和检索成本线性增长。实战建议：如果文档量 < 500 万，直接用 1024 维；如果 > 1000 万，考虑 768 维 + Matryoshka 降维（如 BGE-M3 支持 256/512/768/1024 维灵活切换）。量化（int8/binary）能进一步压缩 4-32x，适合超大规模场景。',
      'Batch encoding 是工程层面最容易被忽略的优化点。逐条编码 vs batch=256 在 GPU 上可以差 10-50x 吞吐。离线索引时务必使用 batch encoding；在线 query encoding 通常单条，但如果有 query 扩展（多个候选 query），也应 batch 处理。',
      '多语言支持方面，BGE-M3 和 Jina v3 都支持 100+ 语言。但要注意：模型在训练语言上的效果差异很大，中文查英文文档的 cross-lingual 效果通常比同语言检索低 10-20%。如果有大量跨语言需求，考虑先做 query translation 再检索。',
      'Dense Retrieval 的核心优势在语义理解：用户输入 "怎么把文件发给同事" 时，能匹配到标题为 "企业网盘共享操作指南" 的文档——这是 BM25 完全无法做到的。这种语义泛化能力是 Hybrid 系统中 Dense 路的不可替代价值。'
    ],
    concepts: [
      { term: 'Embedding Space', desc: 'Dense Retrieval 把 query 和文档都映射到向量空间，再用距离或相似度判断相关性。核心不是词是否相同，而是语义是否接近。' },
      { term: 'Semantic Generalization', desc: 'Dense 的价值在于“你没用同样的话问，它也能懂”。这对同义改写、模糊表达和口语化 query 非常重要。' },
      { term: 'Model Ceiling', desc: 'Embedding 模型基本决定了 Dense 路的上限。后面的索引、ANN、rerank 只能在这个上限之下优化。' },
    ],
    keyPoints: [
      '2025-2026 主流 embedding：BGE-M3（多语言多粒度）、GTE-Qwen2（中文优化）、Jina v3（长文本）',
      '维度权衡：< 500 万文档用 1024 维；> 1000 万考虑 768 维 + Matryoshka 降维',
      '量化（int8/binary）可压缩 4-32x 存储，适合超大规模',
      'Batch encoding 比逐条编码吞吐高 10-50x，离线索引必须 batch',
      '跨语言检索效果比同语言低 10-20%，大量跨语言需求建议先 query translation'
    ],
    engineeringPractice: [
      '先用小评估集比较 2-3 个 embedding 候选，而不是直接选榜单第一。',
      '离线建库务必 batch 编码；在线 query 很少是瓶颈，离线 embedding 吞吐才是真正的大头。',
      '文档量大时先做维度、量化和存储成本的 tradeoff，不要只盯着 Recall。'
    ],
    extensions: [
      {
        question: '如果 Dense 模型在你的领域里区分不清专业术语，第一步该做什么？',
        approach: '先确认问题是否真的来自 embedding，而不是 chunking、query 写法或评估集本身。确认后，再按成本从低到高尝试 instruction prefix、对比学习微调、继续预训练。'
      },
      {
        question: 'Dense 检索提升了 Recall，但用户仍觉得“不准”，可能卡在哪？',
        approach: 'Dense 只负责把相关候选拉进来，不保证最相关的排在前面。后续还要看融合、rerank、metadata filter 和最终 context assembly。'
      }
    ],
    codeExample: `# Dense Retrieval 最佳实践：BGE-M3 batch 编码 + Milvus 写入
from FlagEmbedding import BGEM3FlagModel
from pymilvus import Collection, connections

model = BGEM3FlagModel("BAAI/bge-m3", use_fp16=True)

# batch 编码 — 离线索引时务必 batch 处理
documents = load_documents()  # List[str]
embeddings = model.encode(
    documents,
    batch_size=256,
    max_length=8192,      # BGE-M3 支持最长 8192 token
    return_dense=True,
    return_sparse=True,   # 同时生成稀疏向量，可替代 BM25
)

# Matryoshka 降维：1024 → 512 维（精度损失 < 2%，存储减半）
import numpy as np
dense_vecs = embeddings["dense_vecs"]
dense_512 = dense_vecs[:, :512]
dense_512 = dense_512 / np.linalg.norm(dense_512, axis=1, keepdims=True)

# 写入 Milvus
connections.connect("default", host="localhost", port="19530")
collection = Collection("enterprise_kb")
collection.insert([
    doc_ids,
    dense_512.tolist(),
    metadata_list
])`
  },
  {
    id: 'rrf',
    title: 'RRF 融合策略',
    icon: '🔀',
    content: [
      'Reciprocal Rank Fusion（RRF）是目前 Hybrid Retrieval 最广泛使用的融合算法，其核心思想极其简洁：对每个文档，取其在每路检索结果中的排名倒数求和，然后按总分重排。公式为 RRF_score(d) = Σ 1/(k + rank_i(d))，其中 k 是常数（通常 60），rank_i(d) 是文档 d 在第 i 路检索中的排名。',
      '为什么不直接用分数合并？因为不同检索路返回的分数不可比。BM25 分数范围可能是 0-30，余弦相似度是 -1 到 1，L2 距离则值越小越好。即使做 min-max 归一化，不同 query 的分数分布也不同（有的 query BM25 分布很集中，有的很分散），归一化后的分数仍然不具备跨 query 可比性。RRF 只依赖排名而非分数，天然规避了这个问题。',
      'k 参数的含义和调优：k 控制排名靠前文档的优势衰减速度。k 越小，top-1 文档的权重优势越大（k=1 时 top-1 得分是 top-2 的约 1.5 倍）；k 越大，排名间的分数差异越平滑（k=100 时 top-1 仅比 top-2 高约 1%）。默认 k=60 在大多数场景表现稳健，但可以在 20-100 范围内用 Recall@k 做 grid search。',
      '加权 RRF 是一种常见变体：WRF_score(d) = Σ w_i/(k + rank_i(d))，其中 w_i 是第 i 路检索的权重。当你确定某路检索在你的场景中更可靠时（比如企业编号密集的工单系统中 BM25 更重要），可以给该路更高的权重。',
      '其他融合方式对比：Convex Combination 直接加权原始分数，需要先归一化且效果不稳定；Learned Fusion 用一个小模型学习融合权重，效果上限高但需要标注数据且增加系统复杂度；Cascading 先用一路粗筛再用另一路精排，延迟更低但可能丢失候选。目前工程实践中 RRF 是最佳性价比选择。'
    ],
    concepts: [
      { term: 'Score Non-comparability', desc: 'BM25、余弦相似度、L2 距离来自不同打分体系，原始分数通常不能直接相加。' },
      { term: 'Rank-based Fusion', desc: 'RRF 只看排名，不看原始分数，因此天然更稳健，也更适合多路检索结果融合。' },
      { term: 'Weighting', desc: '如果你已经知道某一路在特定业务里更可靠，可以用加权 RRF 给它更大影响力。' },
    ],
    keyPoints: [
      'RRF 公式：RRF_score(d) = Σ 1/(k + rank_i(d))，基于排名而非分数',
      '不同检索路的分数不可比（BM25 分 0-30, 余弦 -1~1, L2 越小越好），这是不能直接合并的根本原因',
      'k 参数：默认 60；k 小则 top 文档优势大，k 大则排名间差异平滑',
      '加权 RRF：给更可靠的检索路更高的 w_i 权重',
      '融合方式对比：RRF（稳健首选）> Learned（需标注）> Convex Combination（不稳定）'
    ],
    engineeringPractice: [
      '默认从 `k=60` 开始，不要一上来就过度调参。',
      '如果 query 明显偏编号密集，可以给 BM25 更高权重；如果偏自然语言 FAQ，则 Dense 权重可以更大。',
      '融合调参必须结合评估集做 ablation，不能只凭几条 demo query 下结论。'
    ],
    extensions: [
      {
        question: '为什么很多团队知道 RRF 好用，却依然喜欢“直接加权分数”？',
        approach: '因为直接加权看起来直观，但它默认各路分数是同尺度可比的。这个前提在真实系统里通常不成立，所以它常常在少量样例上看似有效，换 query 分布就失效。'
      },
      {
        question: '加权 RRF 应该靠经验设，还是靠数据学出来？',
        approach: '起步阶段可以先用经验权重，但进入生产后，最好通过评估集和 query 分桶来学习或搜索更合适的权重。没有评估闭环，权重只是在“调感觉”。'
      }
    ],
    codeExample: `# RRF 融合实现（Python）
from collections import defaultdict
from typing import List, Tuple, Dict

def reciprocal_rank_fusion(
    results_lists: List[List[str]],
    k: int = 60,
    weights: List[float] | None = None
) -> List[Tuple[str, float]]:
    """
    多路检索结果 RRF 融合
    
    Args:
        results_lists: 每路检索返回的 doc_id 列表（已按相关性排序）
        k: 排名平滑常数，默认 60
        weights: 每路检索的权重，None 表示等权
    
    Returns:
        融合后的 (doc_id, rrf_score) 列表，按 score 降序
    """
    if weights is None:
        weights = [1.0] * len(results_lists)
    
    rrf_scores: Dict[str, float] = defaultdict(float)
    
    for weight, results in zip(weights, results_lists):
        for rank, doc_id in enumerate(results, start=1):
            rrf_scores[doc_id] += weight / (k + rank)
    
    return sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)

# 使用示例
bm25_results = ["doc_A", "doc_C", "doc_B", "doc_E", "doc_D"]
dense_results = ["doc_B", "doc_A", "doc_D", "doc_C", "doc_F"]

# 等权融合
merged = reciprocal_rank_fusion([bm25_results, dense_results], k=60)
# → [("doc_A", 0.0327), ("doc_B", 0.0327), ("doc_C", 0.0325), ...]

# 加权融合：BM25 权重更高（编号密集场景）
merged_weighted = reciprocal_rank_fusion(
    [bm25_results, dense_results],
    k=60, weights=[1.5, 1.0]
)`
  },
  {
    id: 'metadata-filter',
    title: 'Metadata Filter',
    icon: '🏷️',
    content: [
      'Metadata Filter 是 Hybrid Retrieval 中经常被低估的一环。在企业场景中，文档通常带有丰富的元数据：所属部门、适用岗位、创建/更新时间、文档类型（制度/流程/FAQ/公告）、生效状态、密级等。合理利用这些元数据做过滤，可以在不损失相关性的前提下大幅缩小搜索范围，同时实现权限隔离。',
      'Pre-filter（先过滤后检索）vs Post-filter（先检索后过滤）是核心架构选择。Pre-filter 在 ANN 索引上先用 metadata 缩小候选集再做向量搜索，优点是速度快、结果数可控，缺点是如果过滤条件太严格可能导致候选集过小、向量检索退化（Milvus 中如果过滤后候选 < nprobe，会自动 fallback 到暴力搜索）。Post-filter 先做全量向量搜索再过滤，优点是向量检索不受影响，缺点是可能返回不足 top-k 条结果且浪费计算。',
      '实战建议：时间范围过滤和权限过滤适合 pre-filter（过滤比例通常 < 50%）；非常精细的部门/岗位组合过滤，如果可能过滤掉 > 80% 文档，建议用 post-filter 或 pre-filter + 自动扩展兜底策略。Weaviate 和 Qdrant 的 filter 实现已经比较成熟，能自动选择最优执行路径。',
      '对召回率的影响：不恰当的 pre-filter 可能导致"安静的失败"——看起来返回了 k 条结果，但因为候选集太小，实际上丢失了最相关的文档。监控建议：记录每次 filter 后的候选集大小，设置告警阈值（如候选集 < 100 则告警），定期做有/无 filter 的 A/B 召回对比。'
    ],
    concepts: [
      { term: 'Hard Constraint', desc: '权限、时间范围、数据域这类条件不是“排序偏好”，而是必须满足的硬约束。' },
      { term: 'Pre-filter vs Post-filter', desc: '先过滤还是后过滤，不只是执行顺序问题，而是速度、召回和结果完整性的权衡。' },
      { term: 'Silent Failure', desc: '最危险的不是报错，而是结果看起来正常，实际上因为过滤过严已经把最相关文档排除掉。' },
    ],
    keyPoints: [
      '常见 metadata 维度：部门、岗位、时间范围、文档类型、生效状态、密级',
      'Pre-filter 快但候选集过小时向量检索退化；Post-filter 稳但可能结果不足 k 条',
      '时间/权限过滤 → pre-filter；精细组合过滤（>80% 被滤除）→ post-filter + 兜底',
      '监控 filter 后候选集大小，< 100 应触发告警',
      '不恰当 filter 导致"安静的失败"：结果看起来正常但召回已严重下降'
    ],
    engineeringPractice: [
      '把权限过滤当成安全要求，而不是排序优化；能在检索层过滤掉，就不要留到应用层兜底。',
      '持续记录 filter 后候选集大小，并把“候选集过小”做成监控指标。',
      '对高过滤率条件设计自动放宽策略，但要保留权限这类硬约束。'
    ],
    extensions: [
      {
        question: '如果 metadata filter 明显降低了 Recall，应该先放宽哪个条件？',
        approach: '先区分“安全约束”和“业务偏好”。权限、密级、生效状态通常不能放；时间范围、部门组合、文档类型等偏好条件可以尝试放宽或后置。'
      },
      {
        question: '为什么 metadata filter 经常被误以为只是“工程细节”？',
        approach: '因为它看起来不像模型能力问题，但它直接决定候选集边界。候选集边界错了，后面 embedding、RRF、rerank 再强也救不回来。'
      }
    ],
    codeExample: `# Metadata Filter 策略示例（Milvus + 自适应 filter）
from pymilvus import Collection

def smart_filtered_search(
    collection: Collection,
    query_embedding: list,
    filters: dict,
    top_k: int = 20,
    min_candidates: int = 100
):
    """
    自适应 metadata filter：
    1. 先尝试 pre-filter
    2. 如果候选集过小，自动放宽过滤条件
    """
    # 构建 filter 表达式
    expr_parts = []
    if filters.get("department"):
        expr_parts.append(f'department == "{filters["department"]}"')
    if filters.get("doc_type"):
        expr_parts.append(f'doc_type == "{filters["doc_type"]}"')
    if filters.get("updated_after"):
        expr_parts.append(f'update_time >= "{filters["updated_after"]}"')
    
    full_expr = " and ".join(expr_parts) if expr_parts else ""
    
    # 先估算候选集大小
    if full_expr:
        count = collection.query(
            expr=full_expr,
            output_fields=["count(*)"]
        )
        candidate_size = count[0]["count(*)"]
        
        if candidate_size < min_candidates:
            # 候选集过小 → 仅保留权限过滤，放宽其他条件
            expr_parts = [p for p in expr_parts 
                         if "department" in p]  # 权限是硬约束
            full_expr = " and ".join(expr_parts) if expr_parts else ""
    
    results = collection.search(
        data=[query_embedding],
        anns_field="embedding",
        param={"metric_type": "COSINE", "params": {"nprobe": 32}},
        limit=top_k,
        expr=full_expr if full_expr else None,
        output_fields=["title", "department", "doc_type", "update_time"]
    )
    return results[0]`
  },
  {
    id: 'evaluation',
    title: '验收与调参',
    icon: '📊',
    content: [
      '检索质量评估的核心指标三件套：Recall@k 衡量"在返回的 k 条结果中，标注相关文档被召回了多少比例"；MRR（Mean Reciprocal Rank）衡量"第一条相关文档排在第几位的倒数"，反映用户找到答案的速度；nDCG@k（Normalized Discounted Cumulative Gain）综合考虑相关性等级和位置衰减，是最全面的单一指标。',
      '如何判断"提升来自哪一路"？做 ablation 实验：分别只用 BM25、只用 Dense、用 Hybrid 三种配置跑同一个评估集。对比 Recall@k 和 nDCG@k 的差异。如果 Hybrid 比两路中更好的那个还高 5%+ 以上，说明融合在起作用。进一步分析：把 query 按类型分组（编号类、自然语言类、混合类），看每组的提升分别来自哪路。',
      'Ablation 实验设计要点：评估集至少 200+ query（覆盖不同类型），每个 query 需要人工标注的相关文档列表（至少 binary 相关/不相关，最好有 3 级标注）。固定 BM25 和 Dense 的参数不变，只改变融合方式和参数。调参顺序建议：先确定单路最佳参数 → 再调 RRF 的 k 和权重 → 最后调 metadata filter 策略。',
      '实战调参经验：Recall@20 < 0.7 说明检索层有严重问题，需要先检查 chunking、embedding 模型、分词器等基础环节；Recall@20 在 0.7-0.85 之间有较大优化空间，重点调 RRF 参数和字段权重；Recall@20 > 0.85 时检索层已经不错，瓶颈可能在 reranking 或 generation 层。MRR < 0.5 说明排序有问题，相关文档排不到前面，考虑引入 reranker。',
      '持续监控：上线后不能只看一次评估就认为完成。建议每周抽样 50-100 条真实 query，人工标注并计算指标趋势。数据分布漂移（新增大量某类文档、用户 query 模式变化）会导致检索效果缓慢退化。设置 Recall@20 < 0.75 和 MRR < 0.5 的告警阈值。'
    ],
    concepts: [
      { term: 'Recall@k', desc: '关注“相关文档有没有被召回”。适合衡量检索系统是不是把正确候选带进来了。' },
      { term: 'MRR', desc: '关注“第一条正确结果排得够不够前”。这更接近用户的直接感受。' },
      { term: 'Ablation', desc: '把 BM25、Dense、Hybrid 分开跑，是定位提升到底来自哪一路的最有效方法。' },
    ],
    keyPoints: [
      '核心指标：Recall@k（召回率）、MRR（首条相关文档排名）、nDCG@k（综合排序质量）',
      'Ablation 三组对比：BM25-only / Dense-only / Hybrid，分 query 类型分析提升来源',
      '评估集要求：200+ query、覆盖不同类型、人工标注相关性（至少 binary）',
      '调参顺序：单路参数 → RRF k/权重 → metadata filter 策略',
      'Recall@20 < 0.7 查基础（chunking/embedding/分词）；0.7-0.85 调融合参数；> 0.85 看 reranker',
      '上线后每周抽样评估，设置 Recall 和 MRR 告警阈值'
    ],
    engineeringPractice: [
      '评估集里必须混入编号类、自然语言类、短 query 和混合 query，不能只测一种题型。',
      '先把单路做到合理，再评估融合；否则 Hybrid 结果只是把两个弱检索器混在一起。',
      '上线后继续做周级抽样评估，否则数据分布漂移会让检索系统悄悄退化。'
    ],
    extensions: [
      {
        question: '为什么很多团队做了离线评估，线上仍觉得检索“不靠谱”？',
        approach: '通常不是评估这个动作没做，而是评估集不代表真实流量。最常见的问题是：query 类型过于单一、没有覆盖错误码/短 query、相关性标注过粗、没有包含真实权限和过滤条件。'
      },
      {
        question: 'Recall 提升了，但用户满意度没提升，下一步应该往哪查？',
        approach: '先看 MRR 和 nDCG，如果相关文档虽然被召回但排位太靠后，问题在排序或融合；如果排序也不错，再往 rerank、context assembly 和生成阶段排查。'
      }
    ],
    codeExample: `# 检索质量评估 & Ablation 实验框架
import numpy as np
from typing import List, Dict

def recall_at_k(retrieved: List[str], relevant: List[str], k: int) -> float:
    """Recall@k：前 k 条结果中召回了多少相关文档"""
    retrieved_k = set(retrieved[:k])
    relevant_set = set(relevant)
    if not relevant_set:
        return 0.0
    return len(retrieved_k & relevant_set) / len(relevant_set)

def mrr(retrieved: List[str], relevant: List[str]) -> float:
    """MRR：第一条相关文档排名的倒数"""
    relevant_set = set(relevant)
    for rank, doc_id in enumerate(retrieved, start=1):
        if doc_id in relevant_set:
            return 1.0 / rank
    return 0.0

def ndcg_at_k(retrieved: List[str], relevance_map: Dict[str, int], k: int) -> float:
    """nDCG@k：归一化折损累计增益（支持多级相关性）"""
    dcg = sum(
        relevance_map.get(doc_id, 0) / np.log2(rank + 1)
        for rank, doc_id in enumerate(retrieved[:k], start=1)
    )
    ideal = sorted(relevance_map.values(), reverse=True)[:k]
    idcg = sum(rel / np.log2(i + 2) for i, rel in enumerate(ideal))
    return dcg / idcg if idcg > 0 else 0.0

# Ablation 实验
def run_ablation(eval_queries, retrieval_fns: dict, k=20):
    """
    retrieval_fns: {"bm25": fn, "dense": fn, "hybrid": fn}
    eval_queries: [{"query": str, "relevant": [doc_id, ...]}]
    """
    results = {name: {"recall": [], "mrr": [], "ndcg": []}
               for name in retrieval_fns}
    
    for q in eval_queries:
        for name, fn in retrieval_fns.items():
            retrieved = fn(q["query"])
            results[name]["recall"].append(recall_at_k(retrieved, q["relevant"], k))
            results[name]["mrr"].append(mrr(retrieved, q["relevant"]))
    
    for name in results:
        for metric in results[name]:
            scores = results[name][metric]
            results[name][metric] = {
                "mean": np.mean(scores),
                "std": np.std(scores),
                "p50": np.median(scores)
            }
    return results`
  }
];

export const hybridWarmupQuestions = [
  {
    question: '你的系统里，用户搜"OA审批流程异常报错ERR_2041"，向量检索能找到答案吗？',
    hook: '稀有 token 是向量检索的死角'
  },
  {
    question: '两路检索返回的分数一个是 BM25 的 12.7，一个是余弦相似度 0.83，怎么合并？',
    hook: '这就是为什么需要 RRF'
  }
];

export const hybridQuestions = [
  {
    question: '为什么 BM25 在中文场景下需要特别关注分词器？不分词直接用字符级 n-gram 行不行？',
    hint: '想想 "机器学习" 被切成 "机/器/学/习" 会怎样',
    answer: 'BM25 依赖 term 级别的 TF-IDF 计算。如果不分词，中文会退化为单字匹配："机器学习" 变成 "机""器""学""习" 四个独立 term，与 "学习机器" 甚至 "学习器" 的匹配分数几乎相同，丧失了词语级别的语义区分度。字符级 n-gram（如 bigram）会产生大量无意义组合（"机器""器学""学习"），召回噪音极大且索引膨胀。正确做法是使用中文分词器（jieba/ik_analyzer），在词语粒度上建立倒排索引，BM25 才能有效利用词频和逆文档频率的统计信号。'
  },
  {
    question: '如果向量检索已经能覆盖 90% 的 query，还需要 BM25 吗？剩下 10% 是什么？',
    hint: '想想企业场景中哪些 query 类型是向量模型训练数据里罕见的',
    answer: '需要。剩下的 10% 通常是：(1) 精确编号类（工单号、错误码、版本号如 "ERR_2041""v3.2.1-hotfix"），向量模型训练时几乎没见过这类 token 的语义映射；(2) 极短且无上下文的缩写/术语（"OA""HR""ACL"），向量编码高度模糊；(3) 包含特殊字符的技术查询（正则表达式、SQL 片段、文件路径）。这 10% 虽然占比小，但往往是用户最急迫、最精确的需求（出了 bug 搜错误码）。如果这类 query 检索失败，用户对系统信任度的打击远超 90% 普通 query 的正确给出的收益。BM25 对这类 query 的精准匹配能力是不可替代的。'
  },
  {
    question: 'RRF 的 k 参数设大设小分别有什么影响？有没有最优值？',
    hint: '把 k=1 和 k=1000 代入公式 1/(k+rank) 算一下 top-1 和 top-10 的分数差',
    answer: 'k 小（如 k=1）：top-1 得分 = 1/2=0.5，top-10 得分 = 1/11≈0.09，差距 5.5 倍——排名靠前的文档优势巨大，融合结果几乎被某一路的 top-1 主导。k 大（如 k=1000）：top-1 得分 = 1/1001，top-10 得分 = 1/1010，差距仅 0.9%——所有排名的文档得分几乎一样，融合退化为"出现在多少路中"的计数。没有全局最优值，但经验上 k=60 是个鲁棒的默认选择（Cormack et al. 2009 原始论文设定），实践中可在 20-100 范围内用评估集 grid search 微调。'
  },
  {
    question: 'Pre-filter（先过滤再检索）和 Post-filter（先检索再过滤）各有什么风险？',
    hint: '考虑候选集大小对 ANN 索引行为的影响',
    answer: 'Pre-filter 风险：如果过滤条件过于严格（比如限定"财务部 + FAQ + 最近30天"只剩 50 条文档），ANN 索引的候选集可能小于 nprobe/ef 参数要求，导致向量检索退化为暴力搜索（性能下降）甚至候选不足（召回严重下降）。最坏情况下看起来返回了 k 条结果但都不相关——"安静的失败"。Post-filter 风险：先做全量向量检索返回 top-100，再按 metadata 过滤，如果过滤率高（比如 80% 被滤除），最终可能只剩 20 条甚至不足 k 条结果，且被滤除的可能包含过滤后才"最相关"的文档。两种方式的本质矛盾是：过滤是硬约束，检索是软排序，二者的执行顺序会影响结果集的完整性和质量。'
  }
];

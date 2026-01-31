"""
STS 数据集高质量过滤脚本

功能：
1. 检测并合并相似的 origin 文本（相似度 > 0.95）
2. 标记 origin-positive 相似度异常的样本为待确认
3. 标记 hard_negative 相似度过低的样本为不可训练

使用方法：
    python sts_data_filter.py
"""

import json
import os
import asyncio
import numpy as np
from typing import List, Dict, Any, Tuple
from tqdm import tqdm
import dotenv

dotenv.load_dotenv()

# 支持直接运行和作为模块导入
try:
    from . import common
except ImportError:
    import sys
    import os

    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import common

# ---------------- Configuration ----------------
# ---------------- Configuration ----------------
llm_client = common.get_llm_async_client()
embedding_client = common.get_embedding_async_client()

# Embedding 配置
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL_NAME", "openai/qwen3-embedding-0.6b-large")
EMBEDDING_BATCH_SIZE = 50  # 每批处理的文本数量

# LLM 配置
LLM_MODEL = os.getenv("LLM_MODEL_NAME", "openai/minimaxm21")

# 阈值配置
ORIGIN_SIMILARITY_THRESHOLD = 0.92  # origin 相似度阈值（> 此值认为需要合并）
ORIGIN_POSITIVE_MIN_SIMILARITY = 0.7  # origin-positive 最低相似度（< 此值标记待确认）
HARD_NEGATIVE_MAX_SIMILARITY = 0.8  # hard_negative 最高相似度（< 此值标记不可训练）

# 输入输出路径
INPUT_FILE = "outputs/data_synthesis/sts_dataset.json"
OUTPUT_FILE = "outputs/data_synthesis/sts_dataset_cleaned.json"


# ---------------- Embedding Utilities with ChromaDB Cache ----------------
import hashlib
import chromadb
from chromadb.config import Settings

# ChromaDB 配置
CHROMA_PERSIST_DIR = "outputs/data_synthesis/chroma_cache"
CHROMA_COLLECTION_NAME = "sts_embeddings"

# 初始化 ChromaDB
_chroma_client = None
_chroma_collection = None


def get_chroma_collection():
    """获取或创建 ChromaDB collection"""
    global _chroma_client, _chroma_collection
    if _chroma_collection is None:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        _chroma_collection = _chroma_client.get_or_create_collection(
            name=CHROMA_COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
        )
        print(f"  📦 ChromaDB 已初始化: {CHROMA_PERSIST_DIR}")
        print(f"     当前缓存数量: {_chroma_collection.count()}")
    return _chroma_collection


def text_to_id(text: str) -> str:
    """将文本转换为唯一 ID"""
    return hashlib.md5(text.encode("utf-8")).hexdigest()


def get_cached_embeddings(texts: List[str]) -> Tuple[Dict[str, List[float]], List[str]]:
    """
    从 ChromaDB 获取已缓存的 embeddings
    返回: (已缓存的 {id: embedding}, 未缓存的文本列表)
    """
    collection = get_chroma_collection()

    text_ids = [text_to_id(t) for t in texts]
    id_to_text = {text_to_id(t): t for t in texts}

    # 查询已存在的
    try:
        # 去重 IDs，ChromaDB 不允许重复 ID 查询
        unique_text_ids = list(set(text_ids))
        result = collection.get(ids=unique_text_ids, include=["embeddings"])
        cached = {}
        cached_ids = set()

        ids_list = result.get("ids") if result else None
        embeddings_list = result.get("embeddings") if result else None

        # 使用显式长度检查，避免 numpy 数组布尔判断问题
        has_ids = ids_list is not None and len(ids_list) > 0
        has_embeddings = embeddings_list is not None and len(embeddings_list) > 0

        if has_ids and has_embeddings:
            for i, id_ in enumerate(ids_list):
                try:
                    if i >= len(embeddings_list):
                        continue
                    emb = embeddings_list[i]
                    # 转换为 Python list 避免 numpy 数组问题
                    if emb is not None and len(emb) > 0:
                        emb_list = list(emb) if hasattr(emb, "__iter__") else None
                        if emb_list and len(emb_list) > 0:
                            cached[id_] = emb_list
                            cached_ids.add(id_)
                except (IndexError, TypeError):
                    continue

        # 找出未缓存的文本
        uncached_texts = [t for t in texts if text_to_id(t) not in cached_ids]

        return cached, uncached_texts
    except Exception as e:
        print(f"  ⚠️ 缓存查询失败: {e}")
        import traceback

        traceback.print_exc()
        return {}, texts


def save_embeddings_to_cache(texts: List[str], embeddings: List[List[float]]):
    """将 embeddings 保存到 ChromaDB 缓存"""
    collection = get_chroma_collection()

    valid_data = [(t, e) for t, e in zip(texts, embeddings) if e is not None]
    if not valid_data:
        return

    seen_ids = set()
    unique_ids = []
    unique_documents = []
    unique_embs = []

    for t, e in valid_data:
        tid = text_to_id(t)
        if tid not in seen_ids:
            seen_ids.add(tid)
            unique_ids.append(tid)
            unique_documents.append(t)
            unique_embs.append(e)

    try:
        # 使用 upsert 避免重复
        # 分批处理以避免超过 ChromaDB 的最大批处理大小 (5461)
        batch_size = 5000
        for i in range(0, len(unique_ids), batch_size):
            end_idx = i + batch_size
            collection.upsert(
                ids=unique_ids[i:end_idx],
                documents=unique_documents[i:end_idx],
                embeddings=unique_embs[i:end_idx],
            )
    except Exception as e:
        print(f"  ⚠️ 缓存保存失败: {e}")


async def get_embedding(text: str) -> List[float]:
    """获取单个文本的 embedding（带缓存）"""
    cached, uncached = get_cached_embeddings([text])
    text_id = text_to_id(text)

    if text_id in cached:
        return cached[text_id]

    try:
        response = await embedding_client.embeddings.create(
            model=EMBEDDING_MODEL, input=text
        )
        embedding = response.data[0].embedding
        save_embeddings_to_cache([text], [embedding])
        return embedding
    except Exception as e:
        print(f"Embedding Error: {e}")
        return None


async def get_embeddings_batch(
    texts: List[str], sem: asyncio.Semaphore
) -> List[List[float]]:
    """批量获取文本的 embeddings"""
    async with sem:
        try:
            response = await embedding_client.embeddings.create(
                model=EMBEDDING_MODEL, input=texts
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            print(f"Batch Embedding Error: {e}")
            return [None] * len(texts)


async def get_all_embeddings(
    texts: List[str], batch_size: int = EMBEDDING_BATCH_SIZE, concurrency: int = 10
) -> List[List[float]]:
    """获取所有文本的 embeddings，带 ChromaDB 缓存和进度条"""

    # 1. 首先从缓存获取
    print("  🔍 检查缓存...")
    cached_embeddings, uncached_texts = get_cached_embeddings(texts)
    print(f"     缓存命中: {len(cached_embeddings)}, 需要计算: {len(uncached_texts)}")

    # 2. 构建结果数组
    embeddings = [None] * len(texts)
    text_to_idx = {t: i for i, t in enumerate(texts)}

    # 填充缓存结果
    for text in texts:
        text_id = text_to_id(text)
        if text_id in cached_embeddings:
            embeddings[text_to_idx[text]] = cached_embeddings[text_id]

    # 3. 如果没有未缓存的，直接返回
    if not uncached_texts:
        print("  ✅ 全部命中缓存!")
        return embeddings

    # 4. 批量获取未缓存的 embeddings
    sem = asyncio.Semaphore(concurrency)
    uncached_embeddings = [None] * len(uncached_texts)

    # 分批处理
    batches = []
    for i in range(0, len(uncached_texts), batch_size):
        batch_texts = uncached_texts[i : i + batch_size]
        batches.append((i, batch_texts))

    async def process_batch(start_idx: int, batch_texts: List[str]):
        result = await get_embeddings_batch(batch_texts, sem)
        for j, emb in enumerate(result):
            uncached_embeddings[start_idx + j] = emb

    tasks = [
        process_batch(start_idx, batch_texts) for start_idx, batch_texts in batches
    ]

    for f in tqdm(
        asyncio.as_completed(tasks), total=len(tasks), desc="获取 Embeddings"
    ):
        await f

    # 5. 保存新获取的 embeddings 到缓存
    save_embeddings_to_cache(uncached_texts, uncached_embeddings)

    # 6. 填充到结果数组
    for i, text in enumerate(uncached_texts):
        if text in text_to_idx:
            embeddings[text_to_idx[text]] = uncached_embeddings[i]

    return embeddings


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """计算余弦相似度"""
    if vec1 is None or vec2 is None:
        return 0.0
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    dot_product = np.dot(v1, v2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot_product / (norm1 * norm2)


def build_similarity_matrix(embeddings: List[List[float]]) -> np.ndarray:
    """构建相似度矩阵"""
    n = len(embeddings)
    matrix = np.zeros((n, n))

    # 转换为 numpy 数组
    valid_embeddings = []
    valid_indices = []
    for i, emb in enumerate(embeddings):
        if emb is not None:
            valid_embeddings.append(emb)
            valid_indices.append(i)

    if not valid_embeddings:
        return matrix

    emb_matrix = np.array(valid_embeddings)

    # 归一化
    norms = np.linalg.norm(emb_matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1
    emb_matrix = emb_matrix / norms

    # 计算相似度
    sim_matrix = np.dot(emb_matrix, emb_matrix.T)

    # 填充到原始矩阵
    for i, idx_i in enumerate(valid_indices):
        for j, idx_j in enumerate(valid_indices):
            matrix[idx_i, idx_j] = sim_matrix[i, j]

    return matrix


# ---------------- Origin 合并逻辑（使用 ChromaDB 向量搜索优化）----------------

# 用于 origin 去重的独立 collection
ORIGIN_DEDUP_COLLECTION = "sts_origin_dedup"


def find_similar_origins_chromadb(
    dataset: List[Dict],
    threshold: float = ORIGIN_SIMILARITY_THRESHOLD,
    top_k: int = 5,
) -> List[Tuple[int, int, float]]:
    """
    使用 ChromaDB 的向量搜索功能找出相似的 origin 对

    优化点：
    - 使用 HNSW 索引，时间复杂度 O(n log n) 而非 O(n²)
    - 不需要在内存中存储完整的相似度矩阵
    - 只查询每个 origin 的 top-k 最近邻

    Args:
        dataset: 数据集
        threshold: 相似度阈值
        top_k: 每个 origin 查询的最近邻数量

    Returns:
        相似对列表 [(idx1, idx2, similarity), ...]
    """
    global _chroma_client

    # 创建临时 collection 用于去重搜索
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)

    # 删除旧的去重 collection（如果存在）
    try:
        _chroma_client.delete_collection(ORIGIN_DEDUP_COLLECTION)
    except:
        pass

    dedup_collection = _chroma_client.create_collection(
        name=ORIGIN_DEDUP_COLLECTION, metadata={"hnsw:space": "cosine"}
    )

    # 从缓存获取所有 origin 的 embeddings
    origins = [item["origin"] for item in dataset]
    main_collection = get_chroma_collection()

    # 批量获取已缓存的 embeddings
    text_ids = [text_to_id(t) for t in origins]
    # 去重查询 ID，防止 ChromaDB 报错
    unique_text_ids = list(set(text_ids))
    cached_result = main_collection.get(ids=unique_text_ids, include=["embeddings"])

    # 构建 id -> embedding 映射
    id_to_embedding = {}
    if cached_result and cached_result.get("ids"):
        for i, id_ in enumerate(cached_result["ids"]):
            embs = cached_result.get("embeddings")
            if embs is not None and i < len(embs) and embs[i] is not None:
                id_to_embedding[id_] = list(embs[i])

    # 添加所有 origin 到去重 collection
    valid_indices = []
    valid_ids = []
    valid_embeddings = []
    valid_documents = []

    for i, origin in enumerate(origins):
        text_id = text_to_id(origin)
        if text_id in id_to_embedding:
            valid_indices.append(i)
            valid_ids.append(f"origin_{i}")
            valid_embeddings.append(id_to_embedding[text_id])
            valid_documents.append(origin)

    if not valid_ids:
        print("  ⚠️ 没有可用的 embeddings 进行去重搜索")
        return []

    # 批量添加到 collection
    # 分批处理以避免超过 ChromaDB 的最大批处理大小 (5461)
    batch_size = 5000
    for i in range(0, len(valid_ids), batch_size):
        end_idx = i + batch_size
        dedup_collection.add(
            ids=valid_ids[i:end_idx],
            embeddings=valid_embeddings[i:end_idx],
            documents=valid_documents[i:end_idx],
            metadatas=[{"original_idx": idx} for idx in valid_indices[i:end_idx]],
        )

    print(f"  添加了 {len(valid_ids)} 个 origin 到去重索引")

    # 对每个 origin 搜索最近邻
    similar_pairs = set()  # 使用 set 避免重复

    for i, idx in enumerate(valid_indices):
        # 查询 top-k+1（包括自己）
        results = dedup_collection.query(
            query_embeddings=[valid_embeddings[i]],
            n_results=min(top_k + 1, len(valid_ids)),
            include=["distances", "metadatas"],
        )

        if not results or not results.get("ids") or not results["ids"][0]:
            continue

        for j, neighbor_id in enumerate(results["ids"][0]):
            # 获取相似度（ChromaDB 返回的是距离，cosine space 下 distance = 1 - similarity）
            distance = results["distances"][0][j] if results.get("distances") else 1.0
            similarity = 1.0 - distance

            # 获取原始索引
            neighbor_metadata = (
                results["metadatas"][0][j] if results.get("metadatas") else {}
            )
            neighbor_idx = neighbor_metadata.get("original_idx", -1)

            # 跳过自己，检查阈值
            if neighbor_idx == idx or neighbor_idx < 0:
                continue

            if similarity >= threshold:
                # 使用排序后的 tuple 作为 key 避免重复
                pair_key = (min(idx, neighbor_idx), max(idx, neighbor_idx))
                similar_pairs.add((pair_key[0], pair_key[1], similarity))

    # 清理临时 collection
    try:
        _chroma_client.delete_collection(ORIGIN_DEDUP_COLLECTION)
    except:
        pass

    # 转换为列表并按相似度降序排序
    result = list(similar_pairs)
    result.sort(key=lambda x: x[2], reverse=True)

    return result


# 保留旧的全量矩阵方法作为备选（小数据集时可能更快）
def find_similar_origins_matrix(
    origins: List[str],
    similarity_matrix: np.ndarray,
    threshold: float = ORIGIN_SIMILARITY_THRESHOLD,
) -> List[Tuple[int, int, float]]:
    """找出相似度高于阈值的 origin 对（全量矩阵方法，适用于小数据集）"""
    similar_pairs = []
    n = len(origins)

    for i in range(n):
        for j in range(i + 1, n):
            sim = similarity_matrix[i, j]
            if sim >= threshold:
                similar_pairs.append((i, j, sim))

    # 按相似度降序排序
    similar_pairs.sort(key=lambda x: x[2], reverse=True)
    return similar_pairs


async def merge_similar_samples(sample1: Dict, sample2: Dict) -> Dict:
    """使用 LLM 合并两个相似的样本"""
    prompt = f"""你是一个数据合并专家。以下两个样本的 origin 文本非常相似，请将它们合并为一个高质量的样本。

样本1：
- origin: {sample1["origin"]}
- positive: {sample1["positive"]}
- hard_negative: {json.dumps(sample1.get("hard_negative", []), ensure_ascii=False)}

样本2：
- origin: {sample2["origin"]}
- positive: {sample2["positive"]}
- hard_negative: {json.dumps(sample2.get("hard_negative", []), ensure_ascii=False)}

请合并这两个样本，规则如下：
1. origin：选择更完整、更清晰的那个，或将两者合并为一个更完整的描述
2. positive：选择更好的正例，或重新生成一个更优质的正例
3. hard_negative：合并两者的难负例，去除重复的，保留质量最高的 3-5 个

请严格输出 JSON 格式（无需 markdown 代码块）：
{{
    "origin": "...",
    "positive": "...",
    "hard_negative": ["...", ...]
}}
"""

    try:
        response = await llm_client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        content = response.choices[0].message.content
        merged = common.safe_json_parse(content)

        if merged:
            # 保留原始元数据
            return {
                "task_type": "sts",
                "origin_id": f"{sample1['origin_id']}+{sample2['origin_id']}",
                "origin": merged["origin"],
                "positive": merged["positive"],
                "hard_negative": merged.get("hard_negative", []),
                "merged_from": [sample1["origin_id"], sample2["origin_id"]],
            }
    except Exception as e:
        print(f"Merge Error: {e}")

    # 合并失败时返回第一个样本
    return sample1


async def process_origin_deduplication(
    dataset: List[Dict],
    max_merges: int = 100,
    use_chromadb_search: bool = True,
    output_file: str = None,
) -> Tuple[List[Dict], List[Tuple[int, int, float]]]:
    """
    处理 origin 去重和合并

    Args:
        dataset: 数据集
        max_merges: 最大合并数量
        use_chromadb_search: 是否使用 ChromaDB 向量搜索（推荐大数据集使用）
            - True: 使用 HNSW 索引搜索，O(n log n) 复杂度，内存友好
            - False: 使用全量相似度矩阵，O(n²) 复杂度，小数据集更精确
        output_file: 输出文件路径，用于中间保存
    """
    print("\n📊 步骤 1: 检测相似的 Origin 文本...")

    # 提取所有 origins
    origins = [item["origin"] for item in dataset]
    n = len(origins)

    # 根据数据集大小自动选择方法
    # 阈值：超过 1000 条时使用 ChromaDB 向量搜索
    AUTO_SWITCH_THRESHOLD = 1000
    if n > AUTO_SWITCH_THRESHOLD and not use_chromadb_search:
        print(f"  ⚠️ 数据集较大 ({n} 条)，自动切换到 ChromaDB 向量搜索模式")
        use_chromadb_search = True

    # 获取 embeddings（两种方法都需要）
    print("  获取 origin embeddings...")
    embeddings = await get_all_embeddings(origins)

    if use_chromadb_search:
        # 使用 ChromaDB 向量搜索（O(n log n)，内存友好）
        print(f"  🚀 使用 ChromaDB 向量搜索（数据量: {n}）...")
        similar_pairs = find_similar_origins_chromadb(dataset)
    else:
        # 使用全量相似度矩阵（O(n²)，小数据集更快）
        print(f"  📊 使用全量相似度矩阵（数据量: {n}）...")
        print("  构建相似度矩阵...")
        similarity_matrix = build_similarity_matrix(embeddings)
        similar_pairs = find_similar_origins_matrix(origins, similarity_matrix)

    print(
        f"  发现 {len(similar_pairs)} 对相似的 origin（阈值: {ORIGIN_SIMILARITY_THRESHOLD}）"
    )

    if not similar_pairs:
        return dataset, similar_pairs

    # 限制合并数量
    pairs_to_merge = similar_pairs[:max_merges]
    print(f"  将处理前 {len(pairs_to_merge)} 对进行合并...")

    # 记录已合并的索引
    merged_indices = set()
    new_dataset = []

    # 处理合并
    for i, j, sim in tqdm(pairs_to_merge, desc="合并相似样本"):
        if i in merged_indices or j in merged_indices:
            continue

        merged = await merge_similar_samples(dataset[i], dataset[j])
        merged_indices.add(i)
        merged_indices.add(j)
        new_dataset.append(merged)

        # 每处理 20 条合并数据保存一次
        if output_file and len(new_dataset) % 20 == 0:
            temp_dataset = list(new_dataset)
            # 添加尚未合并的原始数据
            for idx, item in enumerate(dataset):
                if idx not in merged_indices:
                    temp_dataset.append(item)

            print(f"\n💾 中间保存: {len(temp_dataset)} 条数据到 {output_file}")
            try:
                common.save_json(temp_dataset, output_file)
            except Exception as e:
                print(f"  ⚠️ 中间保存失败: {e}")

    # 添加未合并的样本
    for idx, item in enumerate(dataset):
        if idx not in merged_indices:
            new_dataset.append(item)

    print(f"  ✅ 合并完成。原始: {len(dataset)} -> 新: {len(new_dataset)}")

    return new_dataset, similar_pairs


# ---------------- 质量标记逻辑 ----------------
async def process_quality_marking(dataset: List[Dict]) -> List[Dict]:
    """处理数据质量标记"""
    print("\n📊 步骤 2: 进行质量标记...")

    # 收集所有需要计算 embedding 的文本
    all_texts = []
    text_indices = []  # 记录每个文本对应的 (样本索引, 文本类型, 子索引)

    for idx, item in enumerate(dataset):
        # origin
        all_texts.append(item["origin"])
        text_indices.append((idx, "origin", 0))

        # positive
        all_texts.append(item["positive"])
        text_indices.append((idx, "positive", 0))

        # hard_negatives
        for neg_idx, neg in enumerate(item.get("hard_negative", [])):
            all_texts.append(neg)
            text_indices.append((idx, "hard_negative", neg_idx))

    print(f"  需要计算 {len(all_texts)} 个文本的 embedding...")

    # 获取所有 embeddings
    embeddings = await get_all_embeddings(all_texts)

    # 按样本组织 embeddings
    sample_embeddings = {}
    for i, (idx, text_type, sub_idx) in enumerate(text_indices):
        if idx not in sample_embeddings:
            sample_embeddings[idx] = {
                "origin": None,
                "positive": None,
                "hard_negative": [],
            }

        if text_type == "origin":
            sample_embeddings[idx]["origin"] = embeddings[i]
        elif text_type == "positive":
            sample_embeddings[idx]["positive"] = embeddings[i]
        else:
            # 确保 hard_negative 列表足够长
            while len(sample_embeddings[idx]["hard_negative"]) <= sub_idx:
                sample_embeddings[idx]["hard_negative"].append(None)
            sample_embeddings[idx]["hard_negative"][sub_idx] = embeddings[i]

    # 计算相似度并标记
    needs_review_count = 0
    non_trainable_count = 0

    for idx, item in enumerate(dataset):
        embs = sample_embeddings.get(idx, {})
        origin_emb = embs.get("origin")
        positive_emb = embs.get("positive")
        hard_negative_embs = embs.get("hard_negative", [])

        item_tags = []

        # 检查 origin-positive 相似度
        if origin_emb and positive_emb:
            op_sim = cosine_similarity(origin_emb, positive_emb)
            item["origin_positive_similarity"] = round(op_sim, 4)

            if op_sim < ORIGIN_POSITIVE_MIN_SIMILARITY:
                item_tags.append("needs_review")
                needs_review_count += 1

        # 检查 hard_negatives
        hard_negative_trainable = []
        hard_negative_similarities = []

        for neg_idx, neg_emb in enumerate(hard_negative_embs):
            if origin_emb and neg_emb:
                on_sim = cosine_similarity(origin_emb, neg_emb)
                hard_negative_similarities.append(round(on_sim, 4))

                # 如果 hard_negative 与 origin 相似度过低（距离太大），标记为不可训练
                if on_sim < HARD_NEGATIVE_MAX_SIMILARITY:
                    hard_negative_trainable.append(False)
                    non_trainable_count += 1
                else:
                    hard_negative_trainable.append(True)
            else:
                hard_negative_similarities.append(None)
                hard_negative_trainable.append(True)  # 默认可训练

        if hard_negative_trainable:
            item["hard_negative_trainable"] = hard_negative_trainable
            item["hard_negative_similarity"] = hard_negative_similarities

        if item_tags:
            item["tags"] = item_tags

    print(f"  ✅ 标记完成:")
    print(f"     - 待确认样本: {needs_review_count}")
    print(f"     - 不可训练的难负例: {non_trainable_count}")

    return dataset


# ---------------- 主流程 ----------------
async def run_data_filter(
    input_file: str = INPUT_FILE,
    output_file: str = OUTPUT_FILE,
    skip_origin_dedup: bool = False,
    max_merges: int = 100,
):
    """运行数据过滤主流程"""
    print("=" * 60)
    print("STS 数据集高质量过滤脚本")
    print("=" * 60)

    # 加载已处理数据（避免重复处理）
    processed_origins = set()
    cleaned_dataset = []
    if os.path.exists(output_file):
        print(f"\n📂 加载已处理数据: {output_file}")
        cleaned_dataset = common.load_existing_json(output_file)
        for item in cleaned_dataset:
            if "origin" in item:
                processed_origins.add(item["origin"])
        print(f"  已处理样本数: {len(processed_origins)}")

    # 加载原始数据
    print(f"\n📂 加载数据: {input_file}")
    # dataset = common.load_existing_json(input_file)[:20] # Removed debug slice
    raw_dataset = common.load_existing_json(input_file)
    print(f"  原始输入样本数: {len(raw_dataset)}")

    if not raw_dataset:
        print("❌ 数据为空，退出")
        return

    # 过滤已处理的样本
    dataset = []
    for item in raw_dataset:
        if item.get("origin") not in processed_origins:
            dataset.append(item)

    print(
        f"  待处理样本数: {len(dataset)} (过滤了 {len(raw_dataset) - len(dataset)} 条)"
    )

    if not dataset:
        print("✅ 所有数据已处理，无需操作")
        return

    similar_pairs = []

    # 临时输出文件，防止覆盖原有 cleaned 数据
    temp_output_file = output_file.replace(".json", "_processing.json")
    print(f"  临时处理文件将保存至: {temp_output_file}")

    # 步骤 1: Origin 去重（可选跳过）
    if not skip_origin_dedup:
        dataset, similar_pairs = await process_origin_deduplication(
            dataset, max_merges, output_file=temp_output_file
        )
    else:
        print("\n⏭️ 跳过 Origin 去重步骤")

    # 步骤 2: 质量标记
    dataset = await process_quality_marking(dataset)

    # 合并新旧数据
    final_dataset = cleaned_dataset + dataset

    # 保存结果
    print(f"\n💾 保存最终结果到: {output_file}")
    common.save_json(final_dataset, output_file)

    # 清理临时文件
    if os.path.exists(temp_output_file):
        try:
            os.remove(temp_output_file)
            print(f"  🗑️ 删除临时文件: {temp_output_file}")
        except:
            pass

    # 输出统计
    print("\n📈 最终统计:")
    print(f"   - 总样本数: {len(dataset)}")
    print(f"   - 发现的相似 origin 对: {len(similar_pairs)}")

    needs_review = sum(
        1 for item in dataset if "tags" in item and "needs_review" in item["tags"]
    )
    print(f"   - 待确认样本: {needs_review}")

    non_trainable_negs = sum(
        item.get("hard_negative_trainable", []).count(False) for item in dataset
    )
    print(f"   - 不可训练的难负例: {non_trainable_negs}")

    print("\n🎉 处理完成!")


if __name__ == "__main__":
    asyncio.run(run_data_filter())

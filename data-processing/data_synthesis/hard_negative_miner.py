import os
import asyncio
import hashlib
import numpy as np
import chromadb
from typing import List, Dict, Optional, Any
from tqdm import tqdm

try:
    from . import common
except ImportError:
    import sys

    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import common

# ---------------- Configuration ----------------
# ---------------- Configuration ----------------
llm_client = common.get_llm_async_client()
embedding_client = common.get_embedding_async_client()

# Default Models
DEFAULT_EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL_NAME", "openai/qwen3-embedding-0.6b-large"
)
DEFAULT_JUDGE_MODEL = os.getenv("LLM_MODEL_NAME", "openai/minimaxm21")

# Default Mining Config
DEFAULT_TARGET_COUNT = 8  # Changed to 3 as requested
DEFAULT_BATCH_SIZE = 5
DEFAULT_CONCURRENCY = 2
DEFAULT_SEARCH_TOP_K = 10
CHROMA_PERSIST_DIR = "outputs/data_synthesis/chroma_cache_qa_v2"
CHROMA_COLLECTION_NAME = "qa_v2_documents"

# Global lazy instances
_chroma_client = None
_chroma_collection = None


# ---------------- Utilities ----------------
def text_to_id(text: str) -> str:
    """Convert text to unique ID."""
    return hashlib.md5(text.encode("utf-8")).hexdigest()


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity."""
    if vec1 is None or vec2 is None:
        return 0.0
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    dot_product = np.dot(v1, v2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(dot_product / (norm1 * norm2))


# ---------------- ChromaDB ----------------
def get_chroma_collection(
    persist_dir=CHROMA_PERSIST_DIR, collection_name=CHROMA_COLLECTION_NAME
):
    """Get or create ChromaDB collection."""
    global _chroma_client, _chroma_collection
    if _chroma_collection is None:
        _chroma_client = chromadb.PersistentClient(path=persist_dir)
        _chroma_collection = _chroma_client.get_or_create_collection(
            name=collection_name, metadata={"hnsw:space": "cosine"}
        )
        print(f"  📦 ChromaDB Initialized: {persist_dir}")
        print(f"     Current count: {_chroma_collection.count()}")
    return _chroma_collection


async def get_embedding(
    text: str, model=DEFAULT_EMBEDDING_MODEL, max_retries: int = 5
) -> Optional[List[float]]:
    """Get embedding for single text with retry."""
    for attempt in range(max_retries):
        try:
            response = await embedding_client.embeddings.create(model=model, input=text)
            return response.data[0].embedding
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "503" in error_str:
                wait_time = (2**attempt) + (attempt * 0.5)
                if attempt < max_retries - 1:
                    await asyncio.sleep(wait_time)
                    continue
            print(f"Embedding Error after {attempt + 1} attempts: {e}")
            return None
    return None


async def get_embeddings_batch(
    texts: List[str],
    sem: asyncio.Semaphore,
    model=DEFAULT_EMBEDDING_MODEL,
    max_retries: int = 5,
) -> List[Optional[List[float]]]:
    """Get batch embeddings with retry."""
    async with sem:
        for attempt in range(max_retries):
            try:
                response = await embedding_client.embeddings.create(
                    model=model, input=texts
                )
                return [item.embedding for item in response.data]
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "503" in error_str:
                    wait_time = (2**attempt) + (attempt * 0.5)
                    if attempt < max_retries - 1:
                        await asyncio.sleep(wait_time)
                        continue
                print(f"Batch Embedding Error after {attempt + 1} attempts: {e}")
                return [None] * len(texts)
        return [None] * len(texts)


async def store_documents_to_chromadb(
    chunks: List[Dict],
    batch_size: int = 50,
    concurrency: int = 3,
    persist_dir=CHROMA_PERSIST_DIR,
    collection_name=CHROMA_COLLECTION_NAME,
):
    """Store documents to ChromaDB."""
    collection = get_chroma_collection(persist_dir, collection_name)

    existing_ids = set()
    all_ids = [text_to_id(chunk["text"]) for chunk in chunks]

    try:
        for i in range(0, len(all_ids), 1000):
            batch_ids = list(set(all_ids[i : i + 1000]))
            result = collection.get(ids=batch_ids)
            if result and result.get("ids"):
                existing_ids.update(result["ids"])
    except Exception as e:
        print(f"  ⚠️ Failed to check existing docs: {e}")

    # Deduplicate chunks based on text/ID to avoid duplicates within the batch itself
    seen_batch_ids = set()
    new_chunks = []
    for c in chunks:
        c_id = text_to_id(c["text"])
        if c_id not in existing_ids and c_id not in seen_batch_ids:
            seen_batch_ids.add(c_id)
            new_chunks.append(c)

    if not new_chunks:
        print(f"  ✅ All {len(chunks)} documents already in ChromaDB")
        return

    print(f"  Adding {len(new_chunks)} new documents to ChromaDB...")

    sem = asyncio.Semaphore(concurrency)
    embeddings_result = [None] * len(new_chunks)

    batches = []
    for i in range(0, len(new_chunks), batch_size):
        batch_texts = [c["text"] for c in new_chunks[i : i + batch_size]]
        batches.append((i, batch_texts))

    async def process_batch(start_idx, batch_texts):
        result = await get_embeddings_batch(batch_texts, sem)
        for j, emb in enumerate(result):
            embeddings_result[start_idx + j] = emb

    tasks = [process_batch(start, txts) for start, txts in batches]

    for f in tqdm(
        asyncio.as_completed(tasks), total=len(tasks), desc="Getting Embeddings"
    ):
        await f

    valid_data = []
    for i, chunk in enumerate(new_chunks):
        if embeddings_result[i] is not None:
            valid_data.append(
                {
                    "id": text_to_id(chunk["text"]),
                    "document": chunk["text"],
                    "embedding": embeddings_result[i],
                    "metadata": {
                        "origin_id": chunk.get("id", ""),
                        "source": chunk.get("source", ""),
                    },
                }
            )

    store_batch_size = 5000
    for i in range(0, len(valid_data), store_batch_size):
        batch = valid_data[i : i + store_batch_size]
        collection.upsert(
            ids=[d["id"] for d in batch],
            documents=[d["document"] for d in batch],
            embeddings=[d["embedding"] for d in batch],
            metadatas=[d["metadata"] for d in batch],
        )

    print(f"  ✅ Stored {len(valid_data)} documents to ChromaDB")


# ---------------- Hard Negative Mining ----------------
async def search_hard_negative_candidates(
    query: str,
    document: str,
    document_embedding: List[float] = None,
    top_k: int = DEFAULT_SEARCH_TOP_K,
    collection=None,
) -> List[Dict]:
    """Search for hard negative candidates."""
    if collection is None:
        collection = get_chroma_collection()

    query_embedding = await get_embedding(query)
    if query_embedding is None:
        return []

    if document_embedding is None:
        document_embedding = await get_embedding(document)
        if document_embedding is None:
            # Fallback if doc embedding fails?
            # Usually we should have it. If not, we might need to fetch it.
            return []

    base_sim = cosine_similarity(query_embedding, document_embedding)
    document_text_id = text_to_id(document)

    candidates = []
    try:
        # Search for similar documents
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k * 2,
            include=["documents", "metadatas", "distances"],
        )

        if results and results.get("ids") and results["ids"][0]:
            for i, doc_id in enumerate(results["ids"][0]):
                if doc_id == document_text_id:
                    continue

                distance = (
                    results["distances"][0][i] if results.get("distances") else 1.0
                )
                similarity = 1 - distance

                # Logic: somewhat similar but not identical to base_sim?
                # Or just similar to query.
                # Original logic: < base_sim - 0.05 OR approx base_sim * 0.95

                if (
                    similarity < base_sim - 0.05
                    or abs(similarity - base_sim * 0.95) < 0.05
                ):
                    candidates.append(
                        {
                            "text": results["documents"][0][i],
                            "origin_id": results["metadatas"][0][i].get(
                                "origin_id", doc_id
                            )
                            if results.get("metadatas")
                            else doc_id,
                            "similarity": similarity,
                        }
                    )
    except Exception as e:
        print(f"Hard Negative Search Error: {e}")

    # Deduplicate
    seen = set()
    unique = []
    for c in candidates:
        if c["text"] not in seen:
            seen.add(c["text"])
            unique.append(c)
            if len(unique) >= top_k * 2:
                break
    return unique


async def judge_single_batch(
    query: str, candidates: List[Dict], judge_model=DEFAULT_JUDGE_MODEL
) -> List[Dict]:
    """Judge if candidates are valid hard negatives using LLM."""
    prompt = f"""你是一个搜索相关性评估专家。请判断以下候选文档是否能够回答用户的查询问题。

用户查询: {query}

候选文档:
"""
    for i, c in enumerate(candidates):
        prompt += f"\n[{i + 1}] {c['text'][:500]}..."

    prompt += """

请对每个候选文档进行判断，输出 JSON 格式：
{
    "results": [
        {"index": 1, "reason": "简短理由", "can_answer": true/false},
        ...
    ]
}

判断标准：
- can_answer: true 表示该文档能够回答或部分回答用户的问题
- can_answer: false 表示该文档完全不能回答用户的问题（适合作为难负样本）
"""

    try:
        response = await llm_client.chat.completions.create(
            model=judge_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
        content = common.safe_json_parse(response.choices[0].message.content)

        if content and "results" in content:
            valid_negatives = []
            for r in content["results"]:
                idx = r.get("index", 0) - 1
                if 0 <= idx < len(candidates) and not r.get("can_answer", True):
                    valid_negatives.append(candidates[idx])
            return valid_negatives
    except Exception as e:
        print(f"Judge Error: {e}")

    return []


async def mine_hard_negatives(
    query: str,
    document: str,
    document_embedding: List[float] = None,
    target_count: int = DEFAULT_TARGET_COUNT,
    batch_size: int = DEFAULT_BATCH_SIZE,
    concurrency: int = DEFAULT_CONCURRENCY,
    collection=None,
) -> List[Dict]:
    """Main wrapper to mine hard negatives."""
    if document_embedding is None:
        document_embedding = await get_embedding(document)

    candidates = await search_hard_negative_candidates(
        query, document, document_embedding, top_k=10, collection=collection
    )

    if not candidates:
        return []

    valid_negatives = []

    # Process batches
    batches = []
    for i in range(0, len(candidates), batch_size):
        batches.append(candidates[i : i + batch_size])

    sem = asyncio.Semaphore(concurrency)
    stop_flag = asyncio.Event()

    async def process_batch_with_stop(batch):
        if stop_flag.is_set():
            return []
        async with sem:
            if stop_flag.is_set():
                return []
            return await judge_single_batch(query, batch)

    tasks = [process_batch_with_stop(b) for b in batches]

    for coro in asyncio.as_completed(tasks):
        if len(valid_negatives) >= target_count:
            stop_flag.set()
            break

        result = await coro
        valid_negatives.extend(result)

        if len(valid_negatives) >= target_count:
            stop_flag.set()
            break

    return valid_negatives[:target_count]

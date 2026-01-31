import importlib.metadata
import os
import json
import random
import asyncio
import sys
from typing import List, Dict, Any
from tqdm import tqdm

# --- Path Setup for Imports ---
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from data_synthesis import hard_negative_miner
except ImportError:
    # Fallback to local import if structure is different
    sys.path.insert(
        0,
        os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "data_synthesis",
        ),
    )
    import hard_negative_miner

# --- Environment Patch for Broken Torch ---
original_version = importlib.metadata.version


def patched_version(package_name):
    try:
        val = original_version(package_name)
        if package_name == "torch" and val is None:
            return "2.0.0"
        return val
    except importlib.metadata.PackageNotFoundError:
        if package_name == "torch":
            return "2.0.0"
        raise


importlib.metadata.version = patched_version
# ------------------------------------------

from datasets import load_dataset

# Configuration
OUTPUT_DIR = "outputs/swift_embedding"
OUTPUT_FILE = "swift_qa_common_instruct_train.jsonl"
SAMPLE_RATIO = 0.2
SEED = 42

# Ensure hard negative miner uses the correct config for this task if needed
# But defaults (3 negatives) match user request.

random.seed(SEED)


def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)


def convert_to_swift_format(qa_item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert QA item with hard negatives to Swift format.
    """
    query = qa_item.get("query", "")
    document = qa_item.get("document", "")
    negatives = qa_item.get("hard_negatives", [])

    if not query or not document:
        return None

    # Instruction for QA/Retrieval
    instruction = "Given a question, retrieve passages that answer the question"
    formatted_query = f"Instruct: {instruction}\nQuery: {query}"

    swift_item = {
        "messages": [{"role": "user", "content": formatted_query}],
        "positive_messages": [[{"role": "user", "content": document}]],
        "channel": "common",
    }

    if negatives:
        swift_item["negative_messages"] = [
            [{"role": "user", "content": n["text"]}] for n in negatives
        ]

    return swift_item


async def process_quora_with_mining(max_count=500):
    print("Processing SetFit/qqp (Quora) ...")
    try:
        # Use simple QQP dataset which doesn't trigger torch check (Parquet/JSONL based)
        dataset = load_dataset("SetFit/qqp", split="train")
    except Exception as e:
        print(f"Error loading SetFit/qqp: {e}")
        return []

    # Filter only duplicates (label=1)
    dataset = dataset.filter(lambda x: x["label"] == 1)

    # Sample
    total_size = len(dataset)
    sample_size = min(max_count, int(total_size * SAMPLE_RATIO))
    print(f"  Total Duplicates: {total_size}, Sampling: {sample_size}")

    dataset = dataset.shuffle(seed=SEED).select(range(sample_size))

    # Prepare documents for indexing
    # For Quora duplicates, both text1 and text2 are valid "documents".
    # text1 is query, text2 is document (or vice versa).
    # We will treat text2 as the document to be indexed.

    print("  Preparing documents for ChromaDB indexing...")
    chunks_to_index = []
    items_to_process = []

    for i, item in enumerate(dataset):
        query = item.get("text1")
        document = item.get("text2")

        if not query or not document:
            continue

        chunks_to_index.append(
            {"text": document, "id": f"quora_{i}", "source": "quora"}
        )
        items_to_process.append(
            {"query": query, "document": document, "id": f"quora_{i}"}
        )

    # Index documents
    await hard_negative_miner.store_documents_to_chromadb(chunks_to_index)

    # Mine Hard Negatives
    print(f"  Mining hard negatives for {len(items_to_process)} items...")

    processed_items = []
    sem = asyncio.Semaphore(10)  # Concurrency for mining

    async def process_item(item):
        async with sem:
            query = item["query"]
            document = item["document"]

            # Mine hard negatives
            # Note: We pass document_embedding as None to let the miner fetch/cache it if needed,
            # but ideally we should have it. The miner handles it.
            hard_negatives = await hard_negative_miner.mine_hard_negatives(
                query,
                document,
                document_embedding=None,
                target_count=3,
                batch_size=4,
                concurrency=2,
            )

            qa_item = {
                "query": query,
                "document": document,
                "hard_negatives": hard_negatives,
            }
            return convert_to_swift_format(qa_item)

    tasks = [process_item(item) for item in items_to_process]

    for f in tqdm(asyncio.as_completed(tasks), total=len(tasks), desc="Mining Quora"):
        result = await f
        if result:
            processed_items.append(result)

    return processed_items


async def main_async(max_count=500):
    ensure_dir(OUTPUT_DIR)

    all_items = []

    # Quora
    quora_items = await process_quora_with_mining(max_count)
    print(f"Generated {len(quora_items)} items from Quora")
    all_items.extend(quora_items)

    # MS MARCO (Skipped for now due to env issues, can be added if fixed)
    # ms_items = await process_ms_marco_with_mining()

    # Shuffle combined
    random.shuffle(all_items)

    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILE)
    print(f"Saving {len(all_items)} items to {output_path}...")

    with open(output_path, "w", encoding="utf-8") as f:
        for item in all_items:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

    print("Done!")


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()

import os
import json
import random
import asyncio
from tqdm import tqdm
from openai import AsyncOpenAI
from langchain_text_splitters import (
    MarkdownHeaderTextSplitter,
    RecursiveCharacterTextSplitter,
)

import dotenv

dotenv.load_dotenv()

# ---------------- Configuration ----------------
# Using environment variables for credentials
API_KEY = os.getenv("OPENAI_API_KEY", "sk-jxx6qPvI_veJvXWkpNHFpQ")
BASE_URL = os.getenv("OPENAI_BASE_URL", "https://llm.aboydfd.com")

# Embedding API credentials
EMBEDDING_API_KEY = os.getenv("EMBEDDING_API_KEY")
EMBEDDING_API_BASE = os.getenv("EMBEDDING_API_BASE")


def get_llm_async_client():
    return AsyncOpenAI(api_key=API_KEY, base_url=BASE_URL)


def get_embedding_async_client():
    if not EMBEDDING_API_KEY:
        print("⚠️ Warning: EMBEDDING_API_KEY not found in environment")
    return AsyncOpenAI(api_key=EMBEDDING_API_KEY, base_url=EMBEDDING_API_BASE)


def get_async_client():
    """Alias for get_llm_async_client for backward compatibility"""
    return get_llm_async_client()


# ---------------- Text Processing ----------------
def load_and_chunk_markdown(file_path, chunk_size=600, chunk_overlap=100):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    headers_to_split_on = [("#", "H1"), ("##", "H2"), ("###", "H3")]
    markdown_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on
    )
    md_header_splits = markdown_splitter.split_text(text)

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", "。", "！"],
    )
    final_chunks = text_splitter.split_documents(md_header_splits)

    processed = []
    for idx, chunk in enumerate(final_chunks):
        header_path = " > ".join(chunk.metadata.values())
        processed.append(
            {
                "id": f"{os.path.basename(file_path)}_{idx}",
                "text": f"[{header_path}] {chunk.page_content}",
                "source": os.path.basename(file_path),
                "original_chunk": chunk,  # Keep original if needed
            }
        )
    return processed


def safe_json_parse(json_str):
    """Clean and parse JSON string from LLM response."""
    if not json_str:
        return None
    try:
        # Standard parse
        return json.loads(json_str)
    except json.JSONDecodeError:
        # Try to strip markdown fences
        cleaned = json_str.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

        try:
            return json.loads(cleaned.strip())
        except:
            return None


# ---------------- Pipeline Utilities ----------------
def load_existing_json(file_path):
    """Safely load existing JSON file."""
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ Warning: Failed to load existing file {file_path}: {e}")
    return []


def save_json(data, file_path):
    """Save data to JSON file safely."""
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"⚠️ Warning: Save failed: {e}")


async def run_synthesis_pipeline(
    md_files_dir,
    output_file,
    process_single_sample_func,
    sample_count=50,
    concurrency=20,
    dedup_ids=None,
    dedup_texts=None,
):
    """
    Generic pipeline for synthesis:
    1. Load all MD files
    2. Sample chunks
    3. Run process_single_sample_func concurrently
    4. Save results incrementally
    """
    if dedup_ids is None:
        dedup_ids = set()
    if dedup_texts is None:
        dedup_texts = set()

    # 1. Load Chunks
    all_chunks = []
    files = [f for f in os.listdir(md_files_dir) if f.endswith(".md")]
    print(f"📂 Loading {len(files)} markdown files from {md_files_dir}...")
    for filename in files:
        all_chunks.extend(load_and_chunk_markdown(os.path.join(md_files_dir, filename)))

    print(f"✅ Loaded {len(all_chunks)} chunks total.")

    # 2. Sample
    if len(all_chunks) > sample_count:
        target_indices = random.sample(range(len(all_chunks)), sample_count)
    else:
        target_indices = range(len(all_chunks))

    dataset = load_existing_json(output_file)
    original_count = len(dataset)

    print(f"🚀 Starting pipeline (Concurrency: {concurrency})...")
    sem = asyncio.Semaphore(concurrency)
    tasks = []
    skipped_count = 0

    for idx in target_indices:
        chunk = all_chunks[idx]

        # Deduplication check
        if chunk["id"] in dedup_ids or chunk["text"] in dedup_texts:
            skipped_count += 1
            continue

        tasks.append(process_single_sample_func(idx, chunk, all_chunks, sem))

    print(f"ℹ️ Skipped {skipped_count} existing items. {len(tasks)} tasks remaining.")

    # 3. Process
    processed_count = 0
    new_items_count = 0

    for f in tqdm(asyncio.as_completed(tasks), total=len(tasks)):
        result = await f
        processed_count += 1
        if result:
            if isinstance(result, list):
                dataset.extend(result)
                new_items_count += len(result)
            else:
                dataset.append(result)
                new_items_count += 1

        # Intermediate save every 20 processed
        if processed_count % 20 == 0:
            save_json(dataset, output_file)

    # Final save
    save_json(dataset, output_file)
    print(
        f"🎉 Pipeline Complete. Added {new_items_count} new items. Total: {len(dataset)}."
    )

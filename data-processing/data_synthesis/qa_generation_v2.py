"""
QA Generation V2 - 基于角色和配置的高质量 Query 生成

功能：
1. 第一阶段：为每篇文档选择合适的角色和配置（调用两次以获取多样性）
2. 第二阶段：根据配置生成中英文 Query
3. 第三阶段：使用 ChromaDB 挖掘难负样本

使用方法：
    python qa_generation_v2.py
"""

import os
import json
import asyncio
import random
from typing import List, Dict, Any, Tuple, Optional
from tqdm import tqdm
import numpy as np

# 支持直接运行和作为模块导入
try:
    from . import common
    from .prompt_template.characters import characters
    from .prompt_template.choose_configuration import choose_configuration
    from .prompt_template.choose_configuration import choose_configuration
    from .prompt_template.generate_query import generate_query
    from . import hard_negative_miner
except ImportError:
    import sys

    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import common
    import hard_negative_miner
    from prompt_template.characters import characters
    from prompt_template.choose_configuration import choose_configuration
    from prompt_template.generate_query import generate_query

import chromadb
import hashlib

# ---------------- 配置区域 ----------------
client = common.get_async_client()

# 模型配置
# 模型配置
MODEL_CONFIG = os.getenv("LLM_MODEL_NAME", "openai/minimaxm21")  # 用于配置选择
MODEL_QUERY = os.getenv("LLM_MODEL_NAME", "openai/minimaxm21")  # 用于 Query 生成

# 输入输出路径
DEFAULT_INPUT_DIR = "./data/books"
DEFAULT_OUTPUT_FILE = "outputs/data_synthesis/qa_v2_dataset.json"

# 难度与 Query 长度分布配置
# 格式: {难度: {长度: 概率, ...}}
DIFFICULTY_LENGTH_DISTRIBUTION = {
    "high_school": {15: 0.80, 30: 0.15, 50: 0.05},
    "university": {15: 0.10, 30: 0.80, 50: 0.10},
    "phd": {15: 0.05, 30: 0.15, 50: 0.80},
}

# ---------------- ChromaDB 工具函数 ----------------
# Moved to hard_negative_miner.py


# ---------------- 第一阶段：配置选择 ----------------
async def choose_config_for_document(document: str) -> Optional[Dict]:
    """为文档选择合适的角色和配置"""
    prompt = choose_configuration(
        language="中文", passage=document, characters=characters
    )

    try:
        response = await client.chat.completions.create(
            model=MODEL_CONFIG,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        content = response.choices[0].message.content
        return common.safe_json_parse(content)
    except Exception as e:
        print(f"Config Selection Error: {e}")
        return None


def get_query_length(difficulty: str) -> int:
    """根据难度按照概率分布采样获取 Query 长度"""
    distribution = DIFFICULTY_LENGTH_DISTRIBUTION.get(
        difficulty, {20: 1.0}
    )  # 默认长度 20
    lengths = list(distribution.keys())
    probs = list(distribution.values())

    # 归一化概率 (防止浮点误差)
    total_prob = sum(probs)
    probs = [p / total_prob for p in probs]

    return random.choices(lengths, weights=probs, k=1)[0]


# ---------------- 第二阶段：Query 生成 ----------------
async def generate_query_pair(document: str, config: Dict) -> Optional[Dict[str, str]]:
    """生成中英文 Query 对"""
    character = config.get("Character", "Curious User")
    question_type = config.get("Question_Type", "acquire_knowledge")
    difficulty = config.get("Difficulty", "university")
    query_length = get_query_length(difficulty)

    results = {}

    # 生成中文 Query
    prompt_zh = generate_query(
        corpus_language="中文",
        queries_language="中文",
        passage=document,
        character=character,
        query_difficulty=difficulty,
        query_language="中文",
        query_length=query_length,
        query_type=question_type,
    )

    try:
        response_zh = await client.chat.completions.create(
            model=MODEL_QUERY,
            messages=[{"role": "user", "content": prompt_zh}],
            temperature=0.7,
        )
        content_zh = common.safe_json_parse(response_zh.choices[0].message.content)
        if content_zh and "query" in content_zh:
            results["zh"] = content_zh["query"]
    except Exception as e:
        print(f"Query Generation (ZH) Error: {e}")

    # 生成英文 Query
    prompt_en = generate_query(
        corpus_language="中文",
        queries_language="English",
        passage=document,
        character=character,
        query_difficulty=difficulty,
        query_language="English",
        query_length=query_length,
        query_type=question_type,
    )

    try:
        response_en = await client.chat.completions.create(
            model=MODEL_QUERY,
            messages=[{"role": "user", "content": prompt_en}],
            temperature=0.7,
        )
        content_en = common.safe_json_parse(response_en.choices[0].message.content)
        if content_en and "query" in content_en:
            results["en"] = content_en["query"]
    except Exception as e:
        print(f"Query Generation (EN) Error: {e}")

    return results if results else None


# ---------------- 第三阶段：难负样本挖掘 ----------------
# Moved to hard_negative_miner.py


# ---------------- 单文档处理逻辑 ----------------
async def process_single_document(
    idx: int, chunk: Dict, all_chunks: List[Dict], sem: asyncio.Semaphore
) -> List[Dict]:
    """处理单个文档，生成 QA 样本"""
    async with sem:
        document = chunk["text"]

        # 获取文档 embedding
        doc_embedding = await hard_negative_miner.get_embedding(document)
        if doc_embedding is None:
            return []

        # 第一阶段：两次配置选择
        config1 = await choose_config_for_document(document)
        config2 = await choose_config_for_document(document)

        if config1 is None and config2 is None:
            return []

        # 确定要使用的配置
        configs_to_use = []
        if config1 is None:
            configs_to_use = [config2]
        elif config2 is None:
            configs_to_use = [config1]
        else:
            # 比较两次配置是否相同
            same_config = (
                config1.get("Character") == config2.get("Character")
                and config1.get("Question_Type") == config2.get("Question_Type")
                and config1.get("Difficulty") == config2.get("Difficulty")
            )

            if same_config:
                configs_to_use = [config1]
            else:
                configs_to_use = [config1, config2]

        results = []

        for config in configs_to_use:
            # 第二阶段：生成中英文 Query
            query_pair = await generate_query_pair(document, config)

            if not query_pair:
                continue

            # 第三阶段：难负样本挖掘（使用中文 query）
            hard_negatives = []
            if "zh" in query_pair:
                hard_negatives = await hard_negative_miner.mine_hard_negatives(
                    query_pair["zh"], document, doc_embedding
                )

            # 组装结果
            sample = {
                "query_zh": query_pair.get("zh", ""),
                "query_en": query_pair.get("en", ""),
                "document": document,
                "character": config.get("Character", ""),
                "config": {
                    "question_type": config.get("Question_Type", ""),
                    "difficulty": config.get("Difficulty", ""),
                },
                "hard_negatives": [
                    {"text": hn["text"], "origin_id": hn["origin_id"]}
                    for hn in hard_negatives
                ],
                "origin_id": chunk["id"],
                "source": chunk.get("source", ""),
            }

            results.append(sample)

        return results


# ---------------- 主流程 ----------------
async def build_qa_v2_dataset(
    md_files_dir: str = DEFAULT_INPUT_DIR,
    output_file: str = DEFAULT_OUTPUT_FILE,
    sample_count: int = 1000,
    concurrency: int = 10,
):
    """构建 QA V2 数据集"""
    print("=" * 60)
    print("QA Generation V2 - 基于角色和配置的高质量 Query 生成")
    print("=" * 60)

    # 确保输出目录存在
    os.makedirs(
        os.path.dirname(output_file) if os.path.dirname(output_file) else ".",
        exist_ok=True,
    )

    # 加载已有数据用于去重
    dataset = common.load_existing_json(output_file)
    dedup_ids = set()
    dedup_texts = set()

    for item in dataset:
        if "origin_id" in item:
            dedup_ids.add(item["origin_id"])
        if "document" in item:
            dedup_texts.add(item["document"])

    print(f"✅ 去重加载: {len(dedup_ids)} IDs, {len(dedup_texts)} Texts.")

    # 加载所有文档
    all_chunks = []
    files = [f for f in os.listdir(md_files_dir) if f.endswith(".md")]
    print(f"\n📂 加载 {len(files)} 个 Markdown 文件...")

    for filename in files:
        all_chunks.extend(
            common.load_and_chunk_markdown(os.path.join(md_files_dir, filename))
        )

    print(f"✅ 加载了 {len(all_chunks)} 个文档块")

    # 将所有文档存储到 ChromaDB
    print("\n📦 初始化文档向量库...")
    display_path = output_file
    if len(display_path) > 50:
        display_path = "..." + display_path[-47:]
    print(f"   输出文件: {display_path}")

    # 将所有文档存储到 ChromaDB
    print("\n📦 初始化文档向量库...")
    await hard_negative_miner.store_documents_to_chromadb(all_chunks)

    # 选择要处理的样本

    if len(all_chunks) > sample_count:
        target_indices = random.sample(range(len(all_chunks)), sample_count)
    else:
        target_indices = range(len(all_chunks))

    # 过滤已处理的
    tasks = []
    skipped_count = 0
    sem = asyncio.Semaphore(concurrency)

    for idx in target_indices:
        chunk = all_chunks[idx]
        if chunk["id"] in dedup_ids or chunk["text"] in dedup_texts:
            skipped_count += 1
            continue
        tasks.append(process_single_document(idx, chunk, all_chunks, sem))

    print(f"\nℹ️ 跳过 {skipped_count} 个已处理文档，剩余 {len(tasks)} 个待处理")
    print(f"🚀 开始处理 (并发度: {concurrency})...\n")

    # 处理并保存
    processed_count = 0
    new_items_count = 0

    for f in tqdm(asyncio.as_completed(tasks), total=len(tasks)):
        result = await f
        processed_count += 1

        if result:
            dataset.extend(result)
            new_items_count += len(result)

        # 每 20 条保存一次
        if processed_count % 20 == 0:
            common.save_json(dataset, output_file)

    # 最终保存
    common.save_json(dataset, output_file)

    print(f"\n🎉 处理完成！新增 {new_items_count} 条样本，总计 {len(dataset)} 条")
    print(f"   输出文件: {output_file}")


# 运行入口
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="QA Generation V2")
    parser.add_argument(
        "--input", "-i", default=DEFAULT_INPUT_DIR, help="输入 Markdown 文件目录"
    )
    parser.add_argument(
        "--output", "-o", default=DEFAULT_OUTPUT_FILE, help="输出 JSON 文件路径"
    )
    parser.add_argument("--count", "-c", type=int, default=10, help="处理的样本数量")
    parser.add_argument("--concurrency", "-j", type=int, default=10, help="并发度")

    args = parser.parse_args()

    asyncio.run(
        build_qa_v2_dataset(
            md_files_dir=args.input,
            output_file=args.output,
            sample_count=args.count,
            concurrency=args.concurrency,
        )
    )

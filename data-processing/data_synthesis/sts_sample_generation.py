import json
import asyncio
import common

import os

# ---------------- Configuration ----------------
client = common.get_async_client()
MODEL_GENERATOR = os.getenv("LLM_MODEL_NAME", "openai/minimaxm21")


# ---------------- Core Logic ----------------
async def generate_sts_pair(chunk_text):
    """
    Extracts automotive repair sentences and generates non-automotive hard negatives.
    Returns a list of dictionaries.
    """
    prompt = f"""
    你是一个汽车维修领域的数据合成专家。请阅读以下文本片段：
    ---
    {chunk_text}
    ---
    
    任务：
    1. "origin"：从文本中提取多个严格与**汽车维修/保养**相关的代表性句子（保留原文）。
    2. "positive"：根据提取的句子，生成一个语义相近的正例（Rewriting/Paraphrasing）。要求：
        1. 句子A和句子B必须表达相同的核心意图。
        2. 避免简单的同义词替换，应进行句式重组。
        3. 如果可以用汽车维修领域的黑话、专业术语来替换其中的某些词，务必使用这些独有的词
    3. "hard_negative"：生成多个“难负例”句子。
       - 要求：
         1. **语义距离较远**（最好不属于汽车领域）。
         2. 必须包含查询中的大部分关键词，使其在表面上看起来非常相关。
         3. 它应该是一个相关但不正确的主题、另一个实体、错误的时间段，或者是相反的观点。
         4. 长度与正样本相当。
         5. 风格应模仿正样本的语调。
       - 关键：应该具有相似的句子结构、长度或包含一些中性关键词，以模拟困难的检索情况（例如：字面匹配但含义不同）。
    
    请严格输出 JSON 列表格式（无需 markdown 代码块），包含多个对象：
    [
        {{
            "origin": "...",
            "positive": "...",
            "hard_negative": ["...", ...]
        }},
        ...
    ]
    """

    try:
        response = await client.chat.completions.create(
            model=MODEL_GENERATOR,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        content = response.choices[0].message.content
        return common.safe_json_parse(
            content
        )  # Assuming I add this helper or handle it
    except Exception as e:
        print(f"STS Gen Error: {e}")
        return None


async def process_single_sample(idx, chunk, all_chunks, sem):
    async with sem:
        data_list = await generate_sts_pair(chunk["text"])
        if not data_list or not isinstance(data_list, list):
            return None

        results = []
        for data in data_list:
            if not data or not data.get("origin") or not data.get("positive"):
                continue

            results.append(
                {
                    "task_type": "sts",
                    "origin_id": chunk["id"],
                    "origin": data["origin"],
                    "positive": data["positive"],  # List of strings
                    "hard_negative": data.get("hard_negative", []),  # List of strings
                }
            )

        return results if results else None


# ---------------- Main ----------------
async def run_sts_generation(md_dir, output_file, sample_count=50, concurrency=20):
    await common.run_synthesis_pipeline(
        md_dir,
        output_file,
        process_single_sample,
        sample_count=sample_count,
        concurrency=concurrency,
    )


if __name__ == "__main__":
    # Example usage
    asyncio.run(
        run_sts_generation(
            "./data/books",
            "outputs/data_synthesis/sts_dataset.json",
            sample_count=10,
        )
    )

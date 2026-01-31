import json
import os
import asyncio
from tqdm import tqdm
from common import get_async_client, safe_json_parse

# Input/Output paths
INPUT_FILE = "../outputs/data_synthesis/qa_v2_dataset.json"
OUTPUT_FILE = "../outputs/data_synthesis/qa_v2_dataset_filtered.json"

# Threshold
LENGTH_THRESHOLD = 50
BATCH_SIZE = 10  # Number of texts to judge in one LLM call


async def judge_batch(client, texts):
    """
    Judge a batch of texts.
    Returns a list of booleans (True=Keep, False=Delete).
    """
    prompt = """You are a data quality expert.
I will provide a list of texts from a QA dataset.
Please judge each text. If it is nonsensical, or lacks meaningful content, mark it for deletion.

Texts:
"""
    for i, text in enumerate(texts):
        # Escape quotes/newlines potentially
        safe_text = text.replace("\n", " ").replace('"', "'")[:200]
        prompt += f"[{i + 1}] {safe_text}\n"

    prompt += """
Return a JSON object with a list of results:
{
    "results": [
        {"index": 1, "keep": true},
        {"index": 2, "keep": false},
        ...
    ]
}
Ensure you return a result for each index from 1 to N.
"""
    for attempt in range(5):
        try:
            response = await client.chat.completions.create(
                model="gemini/gemini-3-flash-preview",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that outputs JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content
            parsed = safe_json_parse(content)

            # Default to Keep if parsing fails or index missing
            decisions = [True] * len(texts)

            if parsed and "results" in parsed:
                for res in parsed["results"]:
                    idx = res.get("index")
                    keep = res.get("keep", True)
                    if isinstance(idx, int) and 1 <= idx <= len(texts):
                        decisions[idx - 1] = keep
            return decisions
        except Exception as e:
            print(f"Batch judgment error (attempt {attempt + 1}): {e}")
            await asyncio.sleep(2 * (attempt + 1))

    return [True] * len(texts)


async def main():
    client = get_async_client()

    print(f"Loading {INPUT_FILE}...")
    try:
        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"File not found: {INPUT_FILE}")
        return

    print(f"Loaded {len(data)} items. Preparing tasks...")

    # Identify all texts needing judgment
    # Task structure: (item_id, type, sub_id, text)
    # type: 'pos' or 'neg'
    # sub_id: index in hard_negatives if neg

    tasks = []

    for i, item in enumerate(data):
        # Check positive
        doc = item.get("document", "")
        if len(doc) < LENGTH_THRESHOLD:
            tasks.append({"item_idx": i, "type": "pos", "text": doc})

        # Check negatives
        hard_negatives = item.get("hard_negatives", [])
        for ni, neg in enumerate(hard_negatives):
            neg_text = neg.get("text", "")
            if len(neg_text) < LENGTH_THRESHOLD:
                tasks.append(
                    {"item_idx": i, "type": "neg", "neg_idx": ni, "text": neg_text}
                )

    print(f"Found {len(tasks)} short texts to judge.")

    # Process tasks in batches
    # We need to map results back to decisions
    # decisions key: (item_idx, type, neg_idx) -> keep(bool)

    decision_map = {}  # (item_idx, type, neg_idx_or_None) -> bool

    if tasks:
        # Create batches
        batches = [tasks[i : i + BATCH_SIZE] for i in range(0, len(tasks), BATCH_SIZE)]

        print(f"Processing {len(batches)} batches...")

        sem = asyncio.Semaphore(2)  # 2 concurrent requests

        async def process_batch_wrapper(batch_tasks):
            async with sem:
                texts = [t["text"] for t in batch_tasks]
                results = await judge_batch(client, texts)
                return batch_tasks, results

        batch_futures = [process_batch_wrapper(b) for b in batches]

        for f in tqdm(asyncio.as_completed(batch_futures), total=len(batches)):
            batch_tasks, results = await f
            for task, keep in zip(batch_tasks, results):
                key = (task["item_idx"], task["type"], task.get("neg_idx"))
                decision_map[key] = keep

    print("Applying decisions...")

    filtered_data = []
    removed_items = 0
    removed_negatives = 0

    for i, item in enumerate(data):
        # Check positive decision
        pos_key = (i, "pos", None)
        if pos_key in decision_map:
            if not decision_map[pos_key]:
                removed_items += 1
                continue  # Skip this item

        # Check negative decisions
        original_negs = item.get("hard_negatives", [])
        new_negs = []
        for ni, neg in enumerate(original_negs):
            neg_key = (i, "neg", ni)
            keep = True
            if neg_key in decision_map:
                keep = decision_map[neg_key]

            if keep:
                new_negs.append(neg)
            else:
                removed_negatives += 1

        item["hard_negatives"] = new_negs
        filtered_data.append(item)

    print(f"Filtered complete.")
    print(f"Original items: {len(data)}")
    print(f"Items removed (short positive): {removed_items}")
    print(f"Negatives removed: {removed_negatives}")
    print(f"Final items: {len(filtered_data)}")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(filtered_data, f, ensure_ascii=False, indent=2)
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())

import json
import os
import argparse
from pathlib import Path
from tqdm import tqdm
import csv
import random
import datasets
import glob


def load_data(file_path):
    if file_path.endswith(".jsonl"):
        data = []
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    data.append(json.loads(line))
        return data
    else:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def write_jsonl(data, file_path):
    with open(file_path, "w", encoding="utf-8") as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")


def write_qrels(data, file_path):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f, delimiter="\t")
        writer.writerow(["query-id", "corpus-id", "score"])
        for item in data:
            writer.writerow([item["query-id"], item["corpus-id"], item["score"]])


def strip_instruct_prefix(text):
    """
    Strips the 'Instruct: ...\nQuery:' prefix if present.
    """
    if "Instruct:" in text and "\nQuery:" in text:
        parts = text.split("\nQuery:", 1)
        if len(parts) > 1:
            return parts[1].strip()
    return text.strip()


def convert_swift_to_mteb(input_file, output_dir):
    print(f"Converting Swift dataset from {input_file} to {output_dir}")
    try:
        data = load_data(input_file)
    except FileNotFoundError:
        print(f"Error: File {input_file} not found.")
        return

    corpus = []
    queries = []
    qrels = []

    seen_corpus_ids = set()

    # Determine if this is a list (standard swift format)
    if not isinstance(data, list):
        print(f"Error: Expected list in {input_file}, got {type(data)}")
        return

    for idx, item in tqdm(enumerate(data), total=len(data)):
        # Extract query
        # Support both instruct and no_instruct
        # In instruct: messages[0]['content'] starts with "Instruct: ...\nQuery:"
        # In no_instruct: messages[0]['content'] is the query text
        if "messages" not in item:
            continue

        messages = item["messages"]
        if not messages or not isinstance(messages, list):
            continue

        query_raw = messages[0].get("content", "")
        if not query_raw:
            continue

        query_text = strip_instruct_prefix(query_raw)

        # Use origin_id if available to track source, else use index
        # But for MTEB we need valid IDs.
        query_id = f"q_{idx}"
        queries.append({"_id": query_id, "text": query_text})

        # Positives
        # item["positive_messages"] is [[{"content": ...}]]
        positives = item.get("positive_messages", [])
        for pos_idx, pos_group in enumerate(positives):
            # pos_group is a list of messages (conversation history?), usually just one for embedding
            if isinstance(pos_group, list) and len(pos_group) > 0:
                pos_msg = pos_group[0]
                pos_raw = pos_msg.get("content", "")
                if not pos_raw:
                    continue

                pos_text = strip_instruct_prefix(pos_raw)

                pos_id = f"doc_{idx}_p_{pos_idx}"

                if pos_id not in seen_corpus_ids:
                    corpus.append({"_id": pos_id, "text": pos_text, "title": ""})
                    seen_corpus_ids.add(pos_id)

                qrels.append({"query-id": query_id, "corpus-id": pos_id, "score": 1})

        # Negatives
        negatives = item.get("negative_messages", [])
        for neg_idx, neg_group in enumerate(negatives):
            if isinstance(neg_group, list) and len(neg_group) > 0:
                neg_msg = neg_group[0]
                neg_raw = neg_msg.get("content", "")
                if not neg_raw:
                    continue

                neg_text = strip_instruct_prefix(neg_raw)

                neg_id = f"doc_{idx}_n_{neg_idx}"

                if neg_id not in seen_corpus_ids:
                    corpus.append({"_id": neg_id, "text": neg_text, "title": ""})
                    seen_corpus_ids.add(neg_id)

    ensure_dir(output_dir)
    write_jsonl(corpus, os.path.join(output_dir, "corpus.jsonl"))
    write_jsonl(queries, os.path.join(output_dir, "queries.jsonl"))
    write_qrels(qrels, os.path.join(output_dir, "qrels", "test.tsv"))
    print(
        f"Finished Swift conversion: {len(corpus)} documents, {len(queries)} queries."
    )


def download_and_convert_mteb(
    dataset_name, output_dir, sample_queries=500, sample_distractors=10000
):
    print(f"Downloading and converting MTEB dataset {dataset_name} to {output_dir}")

    try:
        ds_corpus = datasets.load_dataset(dataset_name, "corpus")["corpus"]
        ds_queries = datasets.load_dataset(dataset_name, "queries")["queries"]
        ds_qrels = datasets.load_dataset(dataset_name, "default")
    except Exception as e:
        print(f"Error loading {dataset_name}: {e}")
        return

    # Select Split (prefer test, then dev/validation, then train)
    split = "test"
    if "test" not in ds_qrels:
        if "validation" in ds_qrels:
            split = "validation"
        elif "dev" in ds_qrels:
            split = "dev"
        elif "train" in ds_qrels:
            split = "train"
        else:
            print(f"No suitable split found for {dataset_name}")
            return

    qrels_data = ds_qrels[split]

    # 1. Sample queries
    qrel_dict = {}  # query_id -> list of (corpus_id, score)
    for item in qrels_data:
        qid = str(item["query-id"])
        cid = str(item["corpus-id"])
        score = item["score"]
        if qid not in qrel_dict:
            qrel_dict[qid] = []
        qrel_dict[qid].append((cid, score))

    all_query_ids = list(qrel_dict.keys())
    if len(all_query_ids) > sample_queries:
        selected_query_ids = random.sample(all_query_ids, sample_queries)
    else:
        selected_query_ids = all_query_ids

    # Get selected queries text
    queries_out = []

    # Build query lookup
    query_lookup = {}
    for item in ds_queries:
        query_lookup[str(item["_id"])] = item["text"]

    final_qrels = []  # list of {query-id, corpus-id, score}
    needed_corpus_ids = set()

    for qid in selected_query_ids:
        if qid in query_lookup:
            queries_out.append({"_id": qid, "text": query_lookup[qid]})

            # Add relevant qrels
            for cid, score in qrel_dict[qid]:
                if score > 0:
                    final_qrels.append(
                        {"query-id": qid, "corpus-id": cid, "score": score}
                    )
                    needed_corpus_ids.add(cid)

    # 2. Get Corpus
    corpus_out = []
    distractor_pool = []
    pool_cap = sample_distractors * 2

    found_count = 0

    for item in tqdm(ds_corpus, desc=f"Processing {dataset_name} corpus"):
        doc_id = str(item["_id"])
        text = item["text"]
        title = item.get("title", "")

        doc_obj = {"_id": doc_id, "text": text, "title": title}

        if doc_id in needed_corpus_ids:
            corpus_out.append(doc_obj)
            found_count += 1
        else:
            if len(distractor_pool) < pool_cap:
                distractor_pool.append(doc_obj)

    num_to_sample = min(len(distractor_pool), sample_distractors)
    corpus_out.extend(random.sample(distractor_pool, num_to_sample))

    ensure_dir(output_dir)
    write_jsonl(corpus_out, os.path.join(output_dir, "corpus.jsonl"))
    write_jsonl(queries_out, os.path.join(output_dir, "queries.jsonl"))
    write_qrels(final_qrels, os.path.join(output_dir, "qrels", "test.tsv"))

    print(
        f"Finished {dataset_name}: {len(corpus_out)} docs, {len(queries_out)} queries."
    )


def main(
    swift_test_dir="outputs/swift_embedding",
    output_base="outputs/mteb_eval",
):
    # Convert Swift Test Data
    # Find all *test*.jsonl and *test*.json files
    test_files = glob.glob(os.path.join(swift_test_dir, "*test*.json*"))
    # Filter to ensure we only get .json and .jsonl
    test_files = [f for f in test_files if f.endswith(".json") or f.endswith(".jsonl")]

    if not test_files:
        print(f"Warning: No *test*.json or *test*.jsonl files found in {swift_test_dir}")
    
    for swift_test_path in test_files:
        file_name = Path(swift_test_path).stem
        convert_swift_to_mteb(swift_test_path, os.path.join(output_base, file_name))

    # Download and convert MTEB-HF datasets
    mteb_datasets = ["mteb/scifact", "mteb/fiqa", "mteb/nfcorpus", "mteb/arguana"]
    for ds_name in mteb_datasets:
        short_name = ds_name.split("/")[-1]
        output_dir = os.path.join(output_base, short_name)

        # Check if already exists to avoid re-downloading if not needed?
        # But for now we just run it as it was in original script
        download_and_convert_mteb(
            ds_name, output_dir, sample_queries=500, sample_distractors=10000
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert datasets to MTEB format")
    parser.add_argument(
        "--swift_test_dir",
        type=str,
        default="outputs/swift_embedding",
        help="Directory containing Swift embedding test datasets",
    )
    parser.add_argument(
        "--output_base",
        type=str,
        default="outputs/mteb_eval",
        help="Base output directory",
    )

    args = parser.parse_args()

    main(
        swift_test_dir=args.swift_test_dir,
        output_base=args.output_base,
    )

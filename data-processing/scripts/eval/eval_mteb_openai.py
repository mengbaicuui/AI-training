from dotenv import load_dotenv
import os
import argparse
import sys
import logging
import time
from typing import List, Dict, Union, Any
import numpy as np
from mteb import MTEB
from mteb.abstasks import AbsTaskRetrieval
from mteb.abstasks import AbsTask
import concurrent.futures
from tqdm import tqdm

try:
    from mteb import TaskMetadata
except ImportError:
    # Fallback or try another path if needed, mteb structure changes often.
    # In 1.x it was different. In 2.x it uses TaskMetadata.
    from mteb.abstasks import TaskMetadata

import openai

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


from mteb.models.models_protocols import EncoderProtocol


class OpenAIModel(EncoderProtocol):
    def __init__(
        self,
        model_name="text-embedding-3-small",
        batch_size=1000,
        max_workers=3,
        api_key=None,
        base_url=None,
    ):
        self.model_name = model_name
        self.batch_size = batch_size
        self.max_workers = max_workers

        default_api_key = os.getenv("EMBEDDING_API_KEY")
        default_base_url = os.getenv("EMBEDDING_API_BASE")
        logger.info(f"Using Base URL: {default_base_url}")

        self.client = openai.OpenAI(
            api_key=default_api_key or api_key,
            base_url=default_base_url or base_url,
        )
        logger.info(
            f"Initialized OpenAIModel with model={model_name}, batch_size={batch_size}, max_workers={max_workers}, base_url={base_url}"
        )

    @property
    def mteb_model_meta(self):
        return None

    def _encode_batch(self, batch: list[str]) -> list[list[float]]:
        max_retries = 3
        for attempt in range(max_retries + 1):
            try:
                response = self.client.embeddings.create(
                    input=batch, model=self.model_name
                )
                return [data.embedding for data in response.data]
            except Exception as e:
                if attempt < max_retries:
                    logger.error(
                        f"Error encoding batch (Attempt {attempt + 1}/{max_retries + 1}): {e}. Retrying in 10 seconds..."
                    )
                    time.sleep(10)
                else:
                    logger.error(f"Failed after {max_retries} retries: {e}")
                    raise e

    def encode(
        self, sentences: Union[List[str], Any], batch_size: int = 32, **kwargs
    ) -> np.ndarray:
        """
        Encode a list of sentences (or DataLoader) into embeddings.
        """
        if batch_size is None or batch_size == 0:
            batch_size = self.batch_size

        show_progress_bar = kwargs.get("show_progress_bar", True)

        all_embeddings = []
        batches = []

        # 1. Prepare all batches first
        # Check if input is a DataLoader or generic iterable (not a list)
        if hasattr(sentences, "__iter__") and not isinstance(sentences, (list, tuple)):
            for batch in sentences:
                # Handle dict input (common in MTEB DataLoaders)
                if isinstance(batch, dict) and "text" in batch:
                    batch = batch["text"]

                # Check if batch contains tensors (convert to list if needed)
                if hasattr(batch, "tolist"):
                    batch = batch.tolist()

                # Ensure batch is list of strings
                if not isinstance(batch, list):
                    batch = [batch]

                batches.append(batch)
        else:
            # Standard list processing with slicing
            for i in range(0, len(sentences), batch_size):
                batches.append(sentences[i : i + batch_size])

        # 2. Encode batches in parallel
        # We use a dictionary to map futures back to their batch index to preserve order
        results = [None] * len(batches)

        with concurrent.futures.ThreadPoolExecutor(
            max_workers=self.max_workers
        ) as executor:
            future_to_idx = {
                executor.submit(self._encode_batch, batch): i
                for i, batch in enumerate(batches)
            }

            # Use tqdm to show progress as tasks complete
            for future in tqdm(
                concurrent.futures.as_completed(future_to_idx),
                total=len(batches),
                disable=not show_progress_bar,
                desc="Encoding batches",
            ):
                idx = future_to_idx[future]
                try:
                    results[idx] = future.result()
                except Exception as e:
                    logger.error(f"Batch {idx} failed: {e}")
                    # You might want to retry or handle empty reponses here
                    # For now, maybe re-raise or append empty?
                    # Re-raising is safer for correctness.
                    raise e

        # 3. Flatten results
        for res in results:
            if res:
                all_embeddings.extend(res)

        return np.array(all_embeddings)

    def similarity(self, embeddings1, embeddings2):
        import torch

        if not isinstance(embeddings1, torch.Tensor):
            embeddings1 = torch.tensor(embeddings1)
        if not isinstance(embeddings2, torch.Tensor):
            embeddings2 = torch.tensor(embeddings2)
        return embeddings1 @ embeddings2.T


class CustomRetrievalTask(AbsTaskRetrieval):
    def __init__(
        self,
        data_dir,
        task_name="CustomRetrieval",
        query_instruct=None,
        corpus_instruct=None,
        **kwargs,
    ):
        self.data_dir = data_dir
        self.query_instruct = query_instruct
        self.corpus_instruct = corpus_instruct
        self.metadata = TaskMetadata(
            name=task_name,
            description="Custom retrieval task",
            reference=None,
            type="Retrieval",
            category="t2t",
            eval_splits=["test"],
            eval_langs=["cmn-Hans"],
            main_score="ndcg_at_10",
            dataset={
                "path": "custom",
                "revision": "1.0",
            },
        )
        super().__init__(**kwargs)

    def load_data(self, **kwargs):
        """
        Load data from the specified directory.
        """
        import json
        import csv

        corpus_path = os.path.join(self.data_dir, "corpus.jsonl")
        queries_path = os.path.join(self.data_dir, "queries.jsonl")
        qrels_path = os.path.join(self.data_dir, "qrels", "test.tsv")

        print(f"LOADING {self.metadata.name} from {self.data_dir}")

        if (
            not os.path.exists(corpus_path)
            or not os.path.exists(queries_path)
            or not os.path.exists(qrels_path)
        ):
            raise FileNotFoundError(f"Data files not found in {self.data_dir}")

        self.corpus = {}
        self.queries = {}
        self.relevant_docs = {}

        # Load Corpus
        self.corpus = {"test": {}}
        with open(corpus_path, "r", encoding="utf-8") as f:
            for line in f:
                item = json.loads(line)
                text = item["text"]
                if self.corpus_instruct:
                    # Apply instruction to corpus
                    # Format: "Instruct: ...\nQuery: {text}"
                    text = self.corpus_instruct.format(query=text)

                self.corpus["test"][item["_id"]] = {
                    "text": text,
                    "title": item.get("title", ""),
                }

        # Load Queries
        self.queries = {"test": {}}
        with open(queries_path, "r", encoding="utf-8") as f:
            for line in f:
                item = json.loads(line)
                text = item["text"]
                if self.query_instruct:
                    # Apply instruction to query
                    text = self.query_instruct.format(query=text)

                self.queries["test"][item["_id"]] = text

        # Load Qrels
        self.relevant_docs = {"test": {}}
        with open(qrels_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter="\t")
            for row in reader:
                qid = row["query-id"]
                docid = row["corpus-id"]
                score = int(float(row["score"]))

                if qid not in self.relevant_docs["test"]:
                    self.relevant_docs["test"][qid] = {}
                self.relevant_docs["test"][qid][docid] = score

        self.data_loaded = True


def get_instruction_for_dataset(dataset_name):
    """
    Returns (query_instruction, corpus_instruction) tuple.
    Templates must have {query} placeholder.
    """
    # 1. STS, LLM Generated
    # "query and answer need instruct: Instruct: Retrieve semantically similar text\nQuery: {query}"
    sts_instruct = "Instruct: Retrieve semantically similar text\nQuery: {query}"

    if dataset_name in ["sts", "llm_generated"]:
        return sts_instruct, sts_instruct

    # 2. QA Data
    # Only Query needs instruct. Corpus (answer) None.
    # Pattern: "Instruct: Given a question about {domain}, retrieve passages that answer the question"
    # We will assume standard "\nQuery: {query}" suffix for the query part to hold the text.

    qa_template = "Instruct: Given a question about {domain}, retrieve passages that answer the question\nQuery: {query}"

    domain_map = {
        "qa_v2": "automotive repair",
        "scifact": "scientific facts",
        "fiqa": "finance",
        "nfcorpus": "medical",  # or nutrition
        "arguana": "debate",
    }

    if dataset_name in domain_map:
        domain = domain_map[dataset_name]
        q_instruct = qa_template.format(
            domain=domain, query="{query}"
        )  # format ONLY the domain, keep {query} literal
        return q_instruct, None

    # Default: No instructions
    return None, None


def main():
    parser = argparse.ArgumentParser(description="Evaluate MTEB with OpenAI API model")
    parser.add_argument(
        "--model_name", type=str, required=True, help="Model name for API"
    )
    parser.add_argument(
        "--base_url", type=str, default=None, help="OpenAI API Base URL"
    )
    parser.add_argument("--api_key", type=str, default=None, help="OpenAI API Key")
    parser.add_argument(
        "--dataset_path",
        type=str,
        required=True,
        help="Path to MTEB formatted dataset directory (containing subdirectories for tasks)",
    )
    parser.add_argument(
        "--batch_size", type=int, default=32, help="Batch size for encoding"
    )
    parser.add_argument(
        "--max_workers",
        type=int,
        default=16,
        help="Max workers for concurrent requests",
    )
    parser.add_argument(
        "--output_dir", type=str, default="results", help="Output directory"
    )
    parser.add_argument(
        "--task_name", type=str, default=None, help="Specific task to run (optional)"
    )
    parser.add_argument(
        "--dry_run",
        action="store_true",
        help="Print formatted examples and exit without running eval",
    )

    args = parser.parse_args()

    if args.dry_run:
        print("DRY RUN MODE: checking data loading and formatting only.")

    # Initialize Model
    if not args.dry_run:
        model = OpenAIModel(
            model_name=args.model_name,
            batch_size=args.batch_size,
            max_workers=args.max_workers,
            api_key=args.api_key,
            base_url=args.base_url,
        )
    else:
        model = None

    # Find tasks
    # Walk through dataset_path and look for subdirectories
    tasks_to_run = []

    if not os.path.exists(args.dataset_path):
        print(f"Dataset path {args.dataset_path} does not exist.")
        return

    # If single task dir specified directly?
    # Check if 'corpus.jsonl' exists in root
    if os.path.exists(os.path.join(args.dataset_path, "corpus.jsonl")):
        # Single task mode
        task_name = args.task_name or os.path.basename(args.dataset_path.rstrip("/"))
        tasks_to_run.append((task_name, args.dataset_path))
    else:
        # Multi task mode
        subdirs = [
            d
            for d in os.listdir(args.dataset_path)
            if os.path.isdir(os.path.join(args.dataset_path, d))
        ]
        for d in subdirs:
            if args.task_name and d != args.task_name:
                continue
            tasks_to_run.append((d, os.path.join(args.dataset_path, d)))

    print(f"Found {len(tasks_to_run)} tasks: {[t[0] for t in tasks_to_run]}")

    for task_name, task_dir in tasks_to_run:
        print(f"\n--- Running Task: {task_name} ---")

        q_instruct, c_instruct = get_instruction_for_dataset(task_name)

        if q_instruct:
            print(f"Query Instruct Template: {q_instruct}")
        if c_instruct:
            print(f"Corpus Instruct Template: {c_instruct}")

        task = CustomRetrievalTask(
            data_dir=task_dir,
            task_name=task_name,
            query_instruct=q_instruct,
            corpus_instruct=c_instruct,
        )

        if args.dry_run:
            task.load_data()
            queries = task.queries["test"]
            corpus = task.corpus["test"]

            print(f"Loaded {len(queries)} queries, {len(corpus)} corpus items.")
            # Print example
            if queries:
                qid = next(iter(queries))
                print(f"Example Query ({qid}):\n{queries[qid]!r}")
            if corpus:
                cid = next(iter(corpus))
                # Print first corpus item content
                print(f"Example Corpus ({cid}):\n{corpus[cid]['text']!r}")
            continue

        evaluation = MTEB(tasks=[task])
        results = evaluation.run(
            model,
            output_folder=os.path.join(args.output_dir, task_name),
            encode_kwargs={
                "batch_size": 100,  # 建议调大 batch_size 以加快速度
                "show_progress_bar": True,  # 开启进度条显示
            },
        )
        print(f"Finished {task_name} with results: {results}")


if __name__ == "__main__":
    main()

import asyncio
from scripts.process_mineru import process_pdfs
from scripts.convert_to_swift_format import main as convert_to_swift_format
from scripts.convert_common_domain_mteb_to_swift import main_async as convert_common_domain_mteb_to_swift
from scripts.merge_train_swift_embedding import main as merge_train_swift_embedding
from data_synthesis.sts_sample_generation import run_sts_generation
from data_synthesis.sts_data_filter import run_data_filter
from data_synthesis.qa_generation_v2 import build_qa_v2_dataset
from scripts.eval.convert_test_swift_format_to_mteb import main as convert_test_to_swift_format_to_mteb
import os
from scripts.clean_jsonl import clean_jsonl

# process_pdfs()

def clean_jsonl_data():
    base_dir = "outputs/swift_embedding"
    files = [
        os.path.join(base_dir, "swift_embedding_merged_instruct.jsonl"),
    ]
    
    if os.path.exists(base_dir):
        for f in os.listdir(base_dir):
            if "test" in f and f.endswith((".json", ".jsonl")):
                files.append(os.path.join(base_dir, f))
    
    # Remove duplicates just in case
    files = sorted(list(set(files)))

    for f in files:
        if os.path.exists(f):
            print(f"Cleaning {f}...")
            clean_jsonl(f)
        else:
            print(f"File to clean not found: {f}")


async def main():
    process_pdfs()
    await run_sts_generation(
        "./data/books", "outputs/data_synthesis/sts_dataset.json", sample_count=10
    )
    await build_qa_v2_dataset(sample_count=1)
    await run_data_filter()
    await convert_common_domain_mteb_to_swift(max_count=1)
    convert_to_swift_format(split=True)
    merge_train_swift_embedding()
    clean_jsonl_data()
    convert_test_to_swift_format_to_mteb()

    # 将outputs/swift_embedding/swift_embedding_merged_instruct.jsonl的数据拿去训练


if __name__ == "__main__":
    asyncio.run(main())


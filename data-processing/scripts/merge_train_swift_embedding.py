#!/usr/bin/env python3
"""
将outputs/swift_embedding目录下的训练数据合并。

扫描所有带 'train' 的jsonl文件，并根据配置(instruct/no_instruct)进行合并。
"""

import json
import argparse
import os
from pathlib import Path
from typing import List, Dict


def load_jsonl_file(filepath: str) -> List[Dict]:
    """加载JSONL文件"""
    data = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    data.append(json.loads(line))
                except json.JSONDecodeError:
                    print(f"Warning: Failed to decode line in {filepath}")
    return data


def save_jsonl_file(data: List[Dict], filepath: str):
    """保存为JSONL格式（每行一个JSON对象）"""
    with open(filepath, "w", encoding="utf-8") as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")


def main(
    input_dir: str = "outputs/swift_embedding",
    output_dir: str = "outputs/swift_embedding",
    configs: List[str] = None,
):
    if configs is None:
        configs = ["instruct"]

    # 获取脚本所在目录的父目录作为基础路径
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent

    input_path = base_dir / input_dir
    output_path = base_dir / output_dir

    # 创建输出目录
    output_path.mkdir(parents=True, exist_ok=True)

    if not input_path.exists():
        print(f"Error: Input directory {input_path} does not exist.")
        return

    print(f"Scanning directory: {input_path}")
    print(f"Configs to process: {configs}")

    for config in configs:
        merged_data = []
        found_files = []

        # 扫描目录下所有文件
        for file_path in input_path.glob("*train*.jsonl"):
            filename = file_path.name

            # 过滤掉已经是合并过的文件，避免重复合并
            if "merged" in filename:
                continue

            # 简单的包含检查：文件名必须包含 config 字符串 (e.g. "instruct")
            # 注意：如果 config 是 "instruct"，那么 "no_instruct" 也会包含 "instruct"。
            # 为了区分，我们应先检查是否包含 "no_instruct" 如果当前config是instruct且文件名有no_instruct，则跳过
            # 或者更严谨的判断。
            # 假设文件名格式通常是 swift_{type}_{config}_train.jsonl

            # 逻辑：
            # 1. 必须包含 'train' (glob已保证)
            # 2. 必须包含 config
            # 3. 如果 config 是 'instruct'，文件名不能包含 'no_instruct' (除非config就是no_instruct)

            if config not in filename:
                continue

            if config == "instruct" and "no_instruct" in filename:
                continue

            print(f"  Found file for [{config}]: {filename}")
            file_data = load_jsonl_file(str(file_path))
            merged_data.extend(file_data)
            found_files.append(filename)

        if not merged_data:
            print(f"[{config}] No data found to merge.")
            continue

        # 保存合并后的文件
        output_filename = f"swift_embedding_merged_{config}.jsonl"
        output_file_path = output_path / output_filename

        save_jsonl_file(merged_data, str(output_file_path))

        print(f"\n[Merge Complete] [{config}]")
        print(f"  Merged {len(found_files)} files: {found_files}")
        print(f"  Total samples: {len(merged_data)}")
        print(f"  Saved to: {output_file_path}")

        # 生成SWIFT训练命令示例
        print("\n" + "=" * 50)
        print(f"SWIFT Training Command Example ({config}):")
        print("=" * 50)
        print(f"""
# Single GPU Training
swift sft \\
    --model Qwen/Qwen3-Embedding-0.6B \\
    --task_type embedding \\
    --model_type qwen3_emb \\
    --train_type full \\
    --dataset {output_file_path} \\
    --split_dataset_ratio 0.05 \\
    --eval_strategy steps \\
    --output_dir output/qwen3_embedding_{config} \\
    --eval_steps 100 \\
    --num_train_epochs 3 \\
    --save_steps 100 \\
    --per_device_train_batch_size 4 \\
    --per_device_eval_batch_size 4 \\
    --gradient_accumulation_steps 4 \\
    --learning_rate 6e-6 \\
    --loss_type infonce \\
    --label_names labels \\
    --dataloader_drop_last true
""")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Merge SWIFT embedding training data")
    parser.add_argument(
        "--input-dir",
        type=str,
        default="outputs/swift_embedding",
        help="Input directory containing jsonl files",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="outputs/swift_embedding",
        help="Output directory for merged file",
    )
    parser.add_argument(
        "--configs",
        nargs="+",
        default=["instruct"],
        help="List of configs to process (e.g., instruct no_instruct). Default: instruct",
    )

    args = parser.parse_args()

    main(input_dir=args.input_dir, output_dir=args.output_dir, configs=args.configs)

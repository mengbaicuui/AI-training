#!/usr/bin/env python3
"""
将data_synthesis目录下的数据转换为适合Qwen3-Embedding微调的SWIFT框架格式。

SWIFT框架Embedding训练数据格式（使用infonce loss）:
{
    "messages": [{"role": "user", "content": "sentence1"}],
    "positive_messages": [[{"role": "user", "content": "sentence2"}]],
    "negative_messages": [[{"role": "user", "content": "sentence3"}], ...]  # 可选
}

支持的输入格式:
1. qa_dataset.json - Query-Answer对，包含positive/hard_negative/easy_negative
2. sts_dataset.json - 语义相似度对，包含origin/positive/hard_negative
3. sentence_class_dataset.json - 句子分类数据
4. passage_class_dataset.json - 段落分类数据
"""

import json
import argparse
import os
import random
from pathlib import Path
from typing import List, Dict, Any, Optional


# 定义各数据集类型的任务描述（参考task_prompts.json）
TASK_DESCRIPTIONS = {
    "qa": "Given a question about automotive repair, retrieve passages that answer the question",
    "sts": "Retrieve semantically similar text",
    "sentence_class": "Classify the automotive technical sentence into its appropriate category",
    "passage_class": "Classify the automotive technical passage into its appropriate category",
}


def format_with_instruction(text: str, task_type: str) -> str:
    """
    为文本添加Instruct和Query格式

    格式: Instruct: {task_description}
    Query:{query}
    """
    task_description = TASK_DESCRIPTIONS.get(task_type, "Retrieve relevant text")
    return f"Instruct: {task_description}\nQuery:{text}"


def convert_qa_dataset(data: List[Dict], use_instruction: bool = True) -> List[Dict]:
    """
    转换QA数据集格式

    原格式:
    {
        "query": "问题",
        "candidates": [
            {"text": "...", "type": "positive/hard_negative_synthetic/easy_negative", "score": 0-3}
        ]
    }

    目标格式:
    {
        "messages": [{"role": "user", "content": "query"}],
        "positive_messages": [[{"role": "user", "content": "positive_text"}]],
        "negative_messages": [[{"role": "user", "content": "negative_text"}], ...]
    }
    """
    converted = []

    for item in data:
        query = item.get("query", "")
        if not query:
            continue

        candidates = item.get("candidates", [])
        if not candidates:
            continue

        # 分类候选项
        positives = []
        negatives = []

        for candidate in candidates:
            text = candidate.get("text", "")
            if not text:
                continue

            cand_type = candidate.get("type", "")
            score = candidate.get("score", 0)

            # score >= 2 视为正样本，或者type为positive
            if score >= 2 or cand_type == "positive":
                positives.append(text)
            else:
                negatives.append(text)

        if not positives:
            continue

        # 只对query添加instruction格式
        if use_instruction:
            formatted_query = format_with_instruction(query, "qa")
        else:
            formatted_query = query

        swift_item = {
            "messages": [{"role": "user", "content": formatted_query}],
            "positive_messages": [[{"role": "user", "content": p}] for p in positives],
        }

        if negatives:
            swift_item["negative_messages"] = [
                [{"role": "user", "content": n}] for n in negatives
            ]

        converted.append(swift_item)

    return converted


def convert_qa_v2_dataset(data: List[Dict], use_instruction: bool = True) -> List[Dict]:
    """
    转换QA V2数据集格式 (支持query_zh/query_en)

    原格式:
    {
        "query_zh": "...",
        "query_en": "...",
        "document": "...",
        "hard_negatives": [{"text": "..."}, ...]
    }

    目标格式:
    {
        "messages": [{"role": "user", "content": "query"}],
        "positive_messages": [[{"role": "user", "content": "document"}]],
        "negative_messages": [[{"role": "user", "content": "hard_negative"}], ...]
    }
    """
    converted = []

    for item in data:
        document = item.get("document", "")
        if not document:
            continue

        raw_negatives = item.get("hard_negatives", [])
        negatives = []
        for neg in raw_negatives:
            # v2 format: hard_negatives is list of dicts with "text" key
            if isinstance(neg, dict):
                text = neg.get("text", "")
            else:
                text = str(neg)

            if text:
                negatives.append(text)

        # 处理中英文query，分别生成独立样本
        for key in ["query_zh", "query_en"]:
            query = item.get(key, "")
            if not query:
                continue

            # 只对query添加instruction
            if use_instruction:
                formatted_query = format_with_instruction(query, "qa")
            else:
                formatted_query = query

            # document和negatives不加instruction

            swift_item = {
                "messages": [{"role": "user", "content": formatted_query}],
                "positive_messages": [[{"role": "user", "content": document}]],
            }

            if negatives:
                swift_item["negative_messages"] = [
                    [{"role": "user", "content": n}] for n in negatives
                ]

            converted.append(swift_item)

    return converted


def convert_sts_dataset(data: List[Dict], use_instruction: bool = True) -> List[Dict]:
    """
    转换STS（语义相似度）数据集格式

    原格式:
    {
        "task_type": "sts",
        "origin_id": "...",
        "origin": "原始文本（可选）",
        "positive": "正样本文本" 或 ["正样本文本1", ...],
        "hard_negative": "负样本文本" 或 ["负样本文本1", ...],
        "hard_negative_trainable": [true, false, ...] (可选),
        "hard_negative_similarity": [0.8, 0.7, ...] (可选)
    }

    目标格式:
    {
        "messages": [{"role": "user", "content": "origin或positive"}],
        "positive_messages": [[{"role": "user", "content": "positive"}]],
        "negative_messages": [[{"role": "user", "content": "hard_negative"}]]
    }
    """
    converted = []

    for item in data:
        # 优先使用origin作为anchor，否则跳过
        origin = item.get("origin", "")
        origin_id = item.get("origin_id", "")

        # 处理 positive 字段，支持 string 和 list
        positive_raw = item.get("positive", [])
        if isinstance(positive_raw, str):
            positives = [positive_raw] if positive_raw else []
        elif isinstance(positive_raw, list):
            positives = [p for p in positive_raw if isinstance(p, str) and p]
        else:
            positives = []

        if not positives:
            continue

        # 处理 hard_negative 字段，支持 string 和 list
        # 新增逻辑：支持通过 hard_negative_trainable 和 hard_negative_similarity 筛选
        negative_raw = item.get("hard_negative", [])
        trainable = item.get("hard_negative_trainable", [])
        similarity = item.get("hard_negative_similarity", [])

        negatives = []

        # 检查是否具备筛选条件：都是列表且长度一致
        can_filter = (
            isinstance(negative_raw, list)
            and isinstance(trainable, list)
            and isinstance(similarity, list)
            and len(negative_raw) == len(trainable)
            and len(negative_raw) == len(similarity)
        )

        if can_filter:
            true_negatives = []
            false_negatives = []  # (text, similarity)

            for i, text in enumerate(negative_raw):
                if not isinstance(text, str) or not text:
                    continue

                is_trainable = trainable[i]
                sim = similarity[i]

                if is_trainable:
                    true_negatives.append(text)
                else:
                    false_negatives.append((text, sim))

            # 策略：
            # 1. 保留所有 trainable=True 的负样本
            negatives.extend(true_negatives)

            # 2. 对于 trainable=False 的负样本，如果有多个，只取相似度最高的一个
            if false_negatives:
                # 按相似度降序排列
                false_negatives.sort(key=lambda x: x[1], reverse=True)
                # 取第一个（相似度最高的）
                negatives.append(false_negatives[0][0])
        else:
            # 回退到原有逻辑
            if isinstance(negative_raw, str):
                negatives = [negative_raw] if negative_raw else []
            elif isinstance(negative_raw, list):
                negatives = [n for n in negative_raw if isinstance(n, str) and n]
            else:
                negatives = []

        # 如果没有origin，使用第一个positive作为anchor
        # 但这样会导致第一个positive既是anchor又是positive target，可能需要从positives列表移除
        # 目前策略：如果有origin则用origin，否则跳过（更严格，保证质量）
        if not origin:
            # Fallback strategy: if we have at least 2 positives, use one as anchor
            if len(positives) >= 2:
                anchor = positives[0]
                positives = positives[1:]
            else:
                continue
        else:
            anchor = origin

        # 只对anchor添加instruction格式
        if use_instruction:
            formatted_anchor = format_with_instruction(anchor, "sts")
            formatted_positives = [format_with_instruction(p, "sts") for p in positives]
            formatted_negatives = [format_with_instruction(n, "sts") for n in negatives]
        else:
            formatted_anchor = anchor
            formatted_positives = positives
            formatted_negatives = negatives

        swift_item = {
            "messages": [{"role": "user", "content": formatted_anchor}],
            "positive_messages": [
                [{"role": "user", "content": p}] for p in formatted_positives
            ],
        }

        if negatives:
            swift_item["negative_messages"] = [
                [{"role": "user", "content": n}] for n in formatted_negatives
            ]

        # 保留origin_id以便调试
        if origin_id:
            swift_item["_origin_id"] = origin_id

        converted.append(swift_item)

    return converted


def convert_classification_dataset(
    data: List[Dict],
    task_type: str = "sentence_class",
    use_label_as_anchor: bool = False,
    use_instruction: bool = True,
) -> List[Dict]:
    """
    转换分类数据集格式（sentence_class 和 passage_class）

    原格式:
    {
        "task_type": "sentence_classification/passage_classification",
        "origin_id": "...",
        "text": "文本内容",
        "label": "分类标签",
        "hard_negative": "负样本（可选）"
    }

    对于分类任务，我们可以：
    1. 将同一label的样本作为正样本对（需要预处理）
    2. 或者使用text + label的组合

    这里我们使用简化方法：text作为anchor，如果有hard_negative则使用
    """
    # 按label分组
    label_groups: Dict[str, List[str]] = {}
    items_with_negatives = []

    for item in data:
        text = item.get("text", "")
        label = item.get("label", "")
        hard_negative = item.get("hard_negative", "")

        if not text or not label:
            continue

        if label not in label_groups:
            label_groups[label] = []
        label_groups[label].append(text)

        if hard_negative:
            items_with_negatives.append(
                {"text": text, "label": label, "hard_negative": hard_negative}
            )

    converted = []

    # 方法1: 使用同label的其他样本作为正样本
    for label, texts in label_groups.items():
        if len(texts) < 2:
            continue

        for i, text in enumerate(texts):
            # 随机选择同label的其他样本作为正样本
            other_texts = [t for j, t in enumerate(texts) if j != i]
            if not other_texts:
                continue

            # 只取前3个作为正样本避免过多
            positives = other_texts[:3]

            # 只对anchor text添加instruction格式
            if use_instruction:
                formatted_text = format_with_instruction(text, task_type)
            else:
                formatted_text = text

            swift_item = {
                "messages": [{"role": "user", "content": formatted_text}],
                "positive_messages": [
                    [{"role": "user", "content": p}] for p in positives
                ],
            }

            converted.append(swift_item)

    # 方法2: 使用hard_negative的样本
    for item in items_with_negatives:
        text = item["text"]
        hard_negative = item["hard_negative"]
        label = item["label"]

        # 找同label的其他样本作为正样本
        same_label_texts = [t for t in label_groups.get(label, []) if t != text]
        if not same_label_texts:
            continue

        positives = same_label_texts[:2]

        # 只对anchor text添加instruction格式
        if use_instruction:
            formatted_text = format_with_instruction(text, task_type)
        else:
            formatted_text = text

        swift_item = {
            "messages": [{"role": "user", "content": formatted_text}],
            "positive_messages": [[{"role": "user", "content": p}] for p in positives],
            "negative_messages": [[{"role": "user", "content": hard_negative}]],
        }

        converted.append(swift_item)

    return converted


def load_json_file(filepath: str) -> List[Dict]:
    """加载JSON文件"""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def save_jsonl_file(data: List[Dict], filepath: str):
    """保存为JSONL格式（每行一个JSON对象）"""
    with open(filepath, "w", encoding="utf-8") as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")


def save_json_file(data: List[Dict], filepath: str):
    """保存为JSON格式"""
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, ensure_ascii=False, indent=2, fp=f)


def main(
    input_dir: str = "outputs/data_synthesis",
    output_dir: str = "outputs/swift_embedding",
    format: str = "jsonl",
    split: bool = False,
    split_ratio: float = 0.1,
):
    # 获取脚本所在目录的父目录作为基础路径
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent

    input_dir = base_dir / input_dir
    output_dir = base_dir / output_dir

    # 创建输出目录
    output_dir.mkdir(parents=True, exist_ok=True)

    # 定义数据集转换映射
    datasets_config = {
        # "qa_dataset.json": ("qa", convert_qa_dataset),
        "qa_v2_dataset.json": ("qa", convert_qa_v2_dataset),
        # "sts_dataset.json": ("sts", convert_sts_dataset),
        "sts_dataset_cleaned.json": ("sts", convert_sts_dataset),
        "sentence_class_dataset.json": (
            "sentence_class",
            lambda data, use_instruction=True: convert_classification_dataset(
                data, task_type="sentence_class", use_instruction=use_instruction
            ),
        ),
        "passage_class_dataset.json": (
            "passage_class",
            lambda data, use_instruction=True: convert_classification_dataset(
                data, task_type="passage_class", use_instruction=use_instruction
            ),
        ),
    }

    configs = [("instruct", True), ("no_instruct", False)]

    # 分别存储训练集和测试集
    all_train_by_config = {"instruct": [], "no_instruct": []}
    all_test_by_config = {"instruct": [], "no_instruct": []}

    stats = {}

    for filename, (dataset_type, converter) in datasets_config.items():
        filepath = input_dir / filename

        if not filepath.exists():
            print(f"[跳过] 文件不存在: {filepath}")
            continue

        print(f"[处理] {filename}...")

        try:
            data = load_json_file(str(filepath))

            stats[dataset_type] = {"original_count": len(data)}
            print(f"  原始样本数: {len(data)}")

            for config_name, use_instruction in configs:
                converted = converter(data, use_instruction=use_instruction)

                stats[dataset_type][f"converted_{config_name}"] = len(converted)
                print(f"  [{config_name}] 转换后样本数: {len(converted)}")

                # 如果启用拆分，先对单个数据集进行拆分
                if split:
                    random.seed(
                        42 + hash(dataset_type)
                    )  # 不同数据集使用不同但可复现的种子
                    shuffled_data = converted.copy()
                    random.shuffle(shuffled_data)

                    test_size = int(len(shuffled_data) * split_ratio)
                    train_size = len(shuffled_data) - test_size

                    train_data = shuffled_data[:train_size]
                    test_data = shuffled_data[train_size:]

                    stats[dataset_type][f"train_{config_name}"] = len(train_data)
                    stats[dataset_type][f"test_{config_name}"] = len(test_data)
                    print(
                        f"  [{config_name}] 拆分: 训练集 {len(train_data)}, 测试集 {len(test_data)}"
                    )

                    # 保存单独的文件（如果不合并）
                    if not merge:
                        # 保存训练集
                        train_filename = (
                            f"swift_{dataset_type}_{config_name}_train.{format}"
                        )
                        train_path = output_dir / train_filename
                        if format == "jsonl":
                            save_jsonl_file(train_data, str(train_path))
                        else:
                            save_json_file(train_data, str(train_path))
                        print(f"  [{config_name}] 训练集已保存到: {train_path}")

                        # 保存测试集
                        test_filename = f"swift_{dataset_type}_{config_name}_test.json"
                        test_path = output_dir / test_filename
                        save_json_file(test_data, str(test_path))
                        print(f"  [{config_name}] 测试集已保存到: {test_path}")

                    all_train_by_config[config_name].extend(train_data)
                    all_test_by_config[config_name].extend(test_data)
                else:
                    # 不拆分，保存全部数据
                    if not merge:
                        output_filename = f"swift_{dataset_type}_{config_name}.{format}"
                        output_path = output_dir / output_filename

                        if format == "jsonl":
                            save_jsonl_file(converted, str(output_path))
                        else:
                            save_json_file(converted, str(output_path))

                        print(f"  [{config_name}] 已保存到: {output_path}")

                    all_train_by_config[config_name].extend(converted)

        except Exception as e:
            print(f"  [错误] 处理失败: {e}")
            import traceback

            traceback.print_exc()

    # 打印统计信息
    print("\n" + "=" * 50)
    print("转换统计:")
    print("=" * 50)
    for dataset_type, stat in stats.items():
        print(f"  {dataset_type}:")
        print(f"    原始: {stat['original_count']}")
        for config_name in ["instruct", "no_instruct"]:
            if f"converted_{config_name}" in stat:
                print(f"    {config_name}: {stat[f'converted_{config_name}']}")
                if split and f"train_{config_name}" in stat:
                    print(f"      Train: {stat[f'train_{config_name}']}")
                    print(f"      Test:  {stat[f'test_{config_name}']}")

    print("\n" + "=" * 50)
    print("说明:")
    print("已生成单独的数据集文件。如果不使用--split，将生成完整文件。")
    print(
        "若要合并这些文件用于训练，请运行: python scripts/merge_train_swift_embedding.py"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="将data_synthesis数据转换为SWIFT Embedding训练格式"
    )
    parser.add_argument(
        "--input-dir", type=str, default="outputs/data_synthesis", help="输入目录路径"
    )
    parser.add_argument(
        "--output-dir", type=str, default="outputs/swift_embedding", help="输出目录路径"
    )
    parser.add_argument(
        "--format",
        type=str,
        choices=["jsonl", "json"],
        default="jsonl",
        help="输出格式：jsonl（推荐）或json",
    )
    parser.add_argument(
        "--split",
        action="store_true",
        help="是否拆分数据集为训练集和测试集",
    )
    parser.add_argument(
        "--split-ratio",
        type=float,
        default=0.1,
        help="测试集比例（0-1之间），默认为0.1",
    )

    args = parser.parse_args()
    main(
        input_dir=args.input_dir,
        output_dir=args.output_dir,
        format=args.format,
        split=args.split,
        split_ratio=args.split_ratio,
    )

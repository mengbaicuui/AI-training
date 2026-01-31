import os
import json
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import glob
from collections import defaultdict

# --- 配置 ---
# 不再硬编码单一文件夹，而是扫描匹配模式的文件夹
RESULTS_DIR_PATTERN = "results*"
OUTPUT_CSV = "outputs/mteb_summary.csv"
OUTPUT_IMG = "outputs/mteb_radar_chart.png"

# 定义每个任务类型的核心指标 (Main Metric)
# 参考 MTEB 官方标准
TASK_METRICS = {
    "BitextMining": "f1",
    "Classification": "accuracy",  # 部分数据集可能是 f1，视具体情况调整
    "Clustering": "v_measure",
    "PairClassification": "cos_sim_ap",
    "Reranking": "map",
    "Retrieval": "ndcg_at_10",
    "STS": "cos_sim_spearman",
    "Summarization": "cos_sim_spearman",
}


def get_model_name(folder_path):
    """从文件夹路径提取模型名称"""
    # 假设如果文件夹名为 results-4b-original，模型名为 4b-original
    # 去除前缀 "results-" 或 "results_"
    base_name = os.path.basename(os.path.normpath(folder_path))
    if base_name.startswith("results-"):
        return base_name[8:]
    if base_name.startswith("results_"):
        return base_name[8:]
    return base_name


def parse_results(base_pattern):
    data = []

    # 找到所有匹配的目录
    result_dirs = glob.glob(base_pattern)
    print(f"Found result directories: {result_dirs}")

    for folder in result_dirs:
        if not os.path.isdir(folder):
            continue

        model_name = get_model_name(folder)
        print(f"Processing model: {model_name} from {folder}")

        # 遍历文件夹查找 json 文件 (递归)
        # MTEB 结果通常嵌套在 dataset/model/revision/xxx.json
        for root, dirs, files in os.walk(folder):
            for file in files:
                if file.endswith(".json"):
                    # 排除 model_meta.json 等非结果文件，通常结果文件名与数据集名可能一致，或者只看包含 scores 的文件
                    if file == "model_meta.json":
                        continue

                    file_path = os.path.join(root, file)

                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = json.load(f)
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}")
                        continue

                    # 检查是否包含 scores
                    if "scores" not in content:
                        continue

                    # MTEB 2.x 结构通常是 content['scores']['test'][0] 列表或 content['test']
                    scores_data = None
                    if "test" in content["scores"]:
                        test_scores = content["scores"]["test"]
                        # 如果是列表，通常取第一个
                        if isinstance(test_scores, list) and len(test_scores) > 0:
                            scores_data = test_scores[0]
                        elif isinstance(test_scores, dict):
                            scores_data = test_scores
                    # 兼容旧版本直接在 content['test']
                    elif "test" in content:
                        scores_data = content["test"]

                    if not scores_data:
                        continue

                    # 获取 Dataset Name (优先从 json 中获取 'task_name', 否则用文件名)
                    dataset_name = content.get("task_name", file.replace(".json", ""))

                    extract_success = False
                    extracted_score = None
                    task_type = "Unknown"

                    # 尝试匹配任务类型和分数
                    # 1. 优先尝试从 main_score 获取 (如果 json 里指明了)
                    if "main_score" in scores_data:
                        extracted_score = scores_data["main_score"]
                        # 尝试反推 task type
                        for t, m in TASK_METRICS.items():
                            if m in scores_data:  # 这是一个弱判断
                                pass

                    # 2. 如果没有 main_score 或者需要确定 Task Type
                    # 遍历 TASK_METRICS
                    for task, metric in TASK_METRICS.items():
                        if metric in scores_data:
                            # 如果之前没拿过分数，或者正好匹配到这个 metric
                            # 简单的策略：如果能匹配到 metric，就认为是这个 task
                            # 注意：accuracy 很通用，容易误判，最好有更强的 task 信息

                            # 如果这是第一次匹配到，或者该 metric 的确存在且我们还没定 task
                            if task_type == "Unknown" or extracted_score is None:
                                extracted_score = scores_data[metric]
                                task_type = task
                                extract_success = True

                            # 针对 Retrieval 特殊处理
                            if task == "Retrieval" and "ndcg_at_10" in scores_data:
                                extracted_score = scores_data["ndcg_at_10"]
                                task_type = "Retrieval"
                                extract_success = True
                                break  # Retrieval 优先级较高或明确

                    if task_type == "Unknown":
                        # 最后的尝试，如果是 accuracy
                        if "accuracy" in scores_data:
                            extracted_score = scores_data["accuracy"]
                            task_type = "Classification"  # 假设

                    if extracted_score is not None:
                        data.append(
                            {
                                "Model": model_name,
                                "Dataset": dataset_name,
                                "Task": task_type,
                                "Score": extracted_score * 100,  # 转换为百分制
                            }
                        )

    return pd.DataFrame(data)


def generate_report():
    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)

    df = parse_results(RESULTS_DIR_PATTERN)

    if df.empty:
        print("未找到有效的结果文件，请检查路径。")
        return

    # 打印原始数据预览
    print("Parsed Data Preview:")
    print(df.head())

    # 1. 计算每个模型在每个任务类别的平均分
    # Group by Model and Task first
    task_summary = df.groupby(["Model", "Task"])["Score"].mean().reset_index()

    # 2. 生成 CSV 表格：行是 Task，列是 Model
    # Pivot table
    pivot_df = task_summary.pivot(index="Task", columns="Model", values="Score")

    # 计算均值行
    pivot_df.loc["Average"] = pivot_df.mean()

    print("\n=== MTEB Task Summary Table ===")
    print(pivot_df)

    pivot_df.to_csv(OUTPUT_CSV)
    print(f"Task 汇总表格已保存至 {OUTPUT_CSV}")

    # --- 新增: 生成 Dataset 维度的详细表格 (用户要求: 数据集为纵轴) ---
    dataset_pivot = df.pivot_table(
        index=["Task", "Dataset"], columns="Model", values="Score"
    )
    # sort by Task to keep them grouped
    dataset_pivot = dataset_pivot.sort_index()

    DATASET_CSV = "outputs/mteb_dataset_summary.csv"
    dataset_pivot.to_csv(DATASET_CSV)
    print(f"\n=== MTEB Dataset Summary Table ===")
    print(dataset_pivot)
    print(f"Dataset 详细表格已保存至 {DATASET_CSV}")

    # 3. 绘制雷达图
    # 移除 Average 行画图
    plot_df = pivot_df.drop("Average", errors="ignore")

    if plot_df.empty:
        print("没有足够的数据绘制雷达图")
        return

    labels = plot_df.index.tolist()
    num_vars = len(labels)

    # 角度
    angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
    angles += angles[:1]  # 闭环

    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))

    # 为每个模型画线
    models = plot_df.columns.tolist()
    # 自动颜色
    colors = plt.cm.get_cmap("tab10", len(models))

    for i, model in enumerate(models):
        values = plot_df[model].tolist()
        values += values[:1]  # 闭环

        ax.plot(angles, values, linewidth=2, label=model, color=colors(i))
        ax.fill(angles, values, color=colors(i), alpha=0.1)

    ax.set_theta_offset(np.pi / 2)
    ax.set_theta_direction(-1)

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(labels)

    # 添加图例
    plt.legend(loc="upper right", bbox_to_anchor=(0.1, 0.1))

    plt.title(f"MTEB Model Comparison", y=1.05)
    plt.tight_layout()
    plt.savefig(OUTPUT_IMG)
    print(f"雷达图已保存至 {OUTPUT_IMG}")


if __name__ == "__main__":
    generate_report()

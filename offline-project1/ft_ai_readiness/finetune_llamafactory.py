"""
用 Llama Factory 微调 Qwen3-8B（教学用）
========================================
对比手写版本，Llama Factory 更简洁，只需配置 YAML + 一行命令

依赖安装：
    pip install llamafactory

运行方式：
    方式1: 直接运行本脚本
        python finetune_llamafactory.py
    
    方式2: 用命令行（推荐）
        llamafactory-cli train configs/qwen3_lora_sft.yaml
    
    方式3: 用 Web UI
        llamafactory-cli webui
"""

import os
import json
from pathlib import Path

# ============================================================
# 1. 配置参数
# ============================================================
MODEL_PATH = "/root/autodl-tmp/Qwen3-8B"   # Qwen3-8B 本地路径
DATA_DIR = Path("data")                     # 数据目录
OUTPUT_DIR = "./qwen3-8b-cars-lora-lf"      # LoRA 权重保存位置
CONFIG_DIR = Path("configs")                # 配置文件目录

# 数据划分比例
TRAIN_RATIO = 0.8
VAL_RATIO = 0.1
TEST_RATIO = 0.1
RANDOM_SEED = 42

# ============================================================
# 2. 准备数据（划分 train/val/test）
# ============================================================
print("=" * 60)
print(">>> [1/3] 准备数据...")

def load_jsonl(path):
    """读取 JSONL"""
    data = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line))
    return data

def save_jsonl(data, path):
    """保存为 JSONL"""
    with open(path, "w", encoding="utf-8") as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

# 加载原始数据
raw_data = load_jsonl(DATA_DIR / "Cars_details_QA/train.json")
print(f"   原始数据量: {len(raw_data)}")

# 转换为 Llama Factory Alpaca 格式
# Llama Factory 期望: instruction, input, output
alpaca_data = []
for item in raw_data:
    alpaca_data.append({
        "instruction": item["Questions"],
        "input": "",
        "output": item["Answers"],
    })

# 打乱并划分
import random
random.seed(RANDOM_SEED)
random.shuffle(alpaca_data)

n = len(alpaca_data)
train_end = int(n * TRAIN_RATIO)
val_end = int(n * (TRAIN_RATIO + VAL_RATIO))

train_data = alpaca_data[:train_end]
val_data = alpaca_data[train_end:val_end]
test_data = alpaca_data[val_end:]

print(f"   训练集: {len(train_data)} 条")
print(f"   验证集: {len(val_data)} 条")
print(f"   测试集: {len(test_data)} 条")

# 保存划分后的数据
DATASET_DIR = DATA_DIR / "cars_qa_split"
DATASET_DIR.mkdir(parents=True, exist_ok=True)

save_jsonl(train_data, DATASET_DIR / "train.json")
save_jsonl(val_data, DATASET_DIR / "val.json")
save_jsonl(test_data, DATASET_DIR / "test.json")
print(f"   数据已保存到: {DATASET_DIR}")

# ============================================================
# 3. 创建 dataset_info.json（Llama Factory 必需）
# ============================================================
print("\n>>> [2/3] 创建 dataset_info.json...")

dataset_info = {
    "cars_qa_train": {
        "file_name": "cars_qa_split/train.json",
        "columns": {
            "prompt": "instruction",
            "query": "input",
            "response": "output",
        }
    },
    "cars_qa_val": {
        "file_name": "cars_qa_split/val.json",
        "columns": {
            "prompt": "instruction",
            "query": "input",
            "response": "output",
        }
    },
    "cars_qa_test": {
        "file_name": "cars_qa_split/test.json",
        "columns": {
            "prompt": "instruction",
            "query": "input",
            "response": "output",
        }
    }
}

dataset_info_path = DATA_DIR / "dataset_info.json"

# 如果已存在，合并
if dataset_info_path.exists():
    with open(dataset_info_path, "r", encoding="utf-8") as f:
        existing = json.load(f)
    existing.update(dataset_info)
    dataset_info = existing

with open(dataset_info_path, "w", encoding="utf-8") as f:
    json.dump(dataset_info, f, ensure_ascii=False, indent=2)

print(f"   已更新: {dataset_info_path}")

# ============================================================
# 4. 创建训练配置文件（YAML）
# ============================================================
print("\n>>> [3/3] 创建训练配置...")

CONFIG_DIR.mkdir(parents=True, exist_ok=True)

# Llama Factory YAML 配置
yaml_content = f"""### Qwen3-8B LoRA SFT 配置（教学用）

### 模型配置
model_name_or_path: {MODEL_PATH}
trust_remote_code: true

### 训练方法
stage: sft                    # 监督微调
do_train: true
finetuning_type: lora         # 使用 LoRA

### 数据配置
dataset_dir: {DATA_DIR.resolve()}
dataset: cars_qa_train        # 训练集（对应 dataset_info.json 里的名字）
eval_dataset: cars_qa_val     # 验证集
template: qwen3               # Qwen3 对话模板
cutoff_len: 512               # 最大序列长度

### LoRA 配置
lora_rank: 8                  # LoRA 秩
lora_alpha: 16                # 缩放因子
lora_dropout: 0.05
lora_target: q_proj,k_proj,v_proj,o_proj

### 训练参数
output_dir: {OUTPUT_DIR}
num_train_epochs: 3
per_device_train_batch_size: 2
per_device_eval_batch_size: 2
gradient_accumulation_steps: 8
learning_rate: 2.0e-5
warmup_ratio: 0.1
lr_scheduler_type: cosine

### 验证配置（输出 val_loss）
eval_strategy: steps          # 按步数验证
eval_steps: 100               # 每 100 步验证
save_steps: 100
save_total_limit: 3
load_best_model_at_end: true  # 加载最佳模型

### 精度
bf16: true

### 日志（启用 TensorBoard 看 loss）
logging_steps: 50
report_to: tensorboard    # 改为 tensorboard，训练时会写日志到 output_dir/runs/
"""

config_path = CONFIG_DIR / "qwen3_lora_sft.yaml"
with open(config_path, "w", encoding="utf-8") as f:
    f.write(yaml_content)

print(f"   配置已保存: {config_path}")

# ============================================================
# 5. 启动训练
# ============================================================
print("\n" + "=" * 60)
print("准备工作完成！")
print("=" * 60)
print(f"""
接下来有两种方式运行训练：

【方式1】命令行（推荐）
    llamafactory-cli train {config_path}

【方式2】Web UI
    llamafactory-cli webui
    然后在界面里：
    - 数据路径: {DATA_DIR.resolve()}
    - 数据集: cars_qa_train
    - 验证集: cars_qa_val

【方式3】继续运行本脚本
    下面会自动调用 Llama Factory API
""")

# 询问是否继续
user_input = input("\n是否现在开始训练? (y/n): ").strip().lower()

if user_input == "y":
    print("\n>>> 开始训练...")
    
    # 方法1: 用命令行
    cmd = f"llamafactory-cli train {config_path}"
    print(f"执行: {cmd}\n")
    os.system(cmd)
    
    print("\n" + "=" * 60)
    print("训练完成！")
    print(f"LoRA 权重保存在: {OUTPUT_DIR}")
    print("=" * 60)
else:
    print("\n已跳过训练。你可以稍后手动运行：")
    print(f"    llamafactory-cli train {config_path}")

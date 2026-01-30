"""
Qwen3-8B LoRA 微调示例（教学用）
================================
目标：用汽车问答数据微调模型，让它能回答汽车相关问题

包含：
- Train / Val / Test 数据划分
- 训练过程中输出 val loss
- 训练结束后在 test 集上评估

依赖安装：
    pip install torch transformers peft trl datasets accelerate bitsandbytes
"""

import json
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model, TaskType
from trl import SFTTrainer
from datasets import Dataset

# ============================================================
# 1. 配置参数
# ============================================================
MODEL_PATH = "/root/autodl-tmp/Qwen3-8B"  # Qwen3-8B 本地路径
DATA_PATH = "data/Cars_details_QA/train.json"  # 汽车问答数据（JSONL）
OUTPUT_DIR = "./qwen3-8b-cars-lora"  # LoRA 权重保存位置

# 数据划分比例
TRAIN_RATIO = 0.8   # 80% 训练
VAL_RATIO = 0.1     # 10% 验证
TEST_RATIO = 0.1    # 10% 测试

RANDOM_SEED = 42    # 随机种子，保证可复现

# ============================================================
# 2. 加载 Tokenizer 和基座模型
# ============================================================
print("=" * 60)
print(">>> [1/6] 加载 Tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)

# 如果没有 pad_token，用 eos_token 代替
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

print(">>> [2/6] 加载基座模型...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    trust_remote_code=True,
    torch_dtype=torch.bfloat16,
    device_map="auto",
    # 显存紧张时取消注释：
    # load_in_4bit=True,
)

# ============================================================
# 3. 配置 LoRA
# ============================================================
print(">>> [3/6] 配置 LoRA 适配器...")
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,  # 因果语言模型任务
    r=8,                           # LoRA 秩（越大容量越大）
    lora_alpha=16,                 # 缩放因子（一般设为 2*r）
    lora_dropout=0.05,             # Dropout 防过拟合
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],  # 要加 LoRA 的层
)

model = get_peft_model(model, lora_config)
model.enable_input_require_grads()  # 启用梯度（LoRA 训练必需）
model.print_trainable_parameters()  # 打印可训练参数量

# ============================================================
# 4. 加载数据 & 划分 Train / Val / Test
# ============================================================
print(">>> [4/6] 加载并划分数据...")

def load_jsonl(path):
    """读取 JSONL 文件"""
    data = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line))
    return data

def format_example(example, tokenizer):
    """
    用 tokenizer.apply_chat_template 格式化数据
    确保和模型预训练格式一致
    """
    messages = [
        {"role": "user", "content": example["Questions"]},
        {"role": "assistant", "content": example["Answers"]},
    ]
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=False,
    )
    return {"text": text}

# 加载原始数据
raw_data = load_jsonl(DATA_PATH)
print(f"   原始数据量: {len(raw_data)}")

# 打乱数据（固定随机种子）
import random
random.seed(RANDOM_SEED)
random.shuffle(raw_data)

# 计算划分点
n = len(raw_data)
train_end = int(n * TRAIN_RATIO)
val_end = int(n * (TRAIN_RATIO + VAL_RATIO))

# 划分
train_raw = raw_data[:train_end]
val_raw = raw_data[train_end:val_end]
test_raw = raw_data[val_end:]

print(f"   训练集: {len(train_raw)} 条 ({TRAIN_RATIO*100:.0f}%)")
print(f"   验证集: {len(val_raw)} 条 ({VAL_RATIO*100:.0f}%)")
print(f"   测试集: {len(test_raw)} 条 ({TEST_RATIO*100:.0f}%)")

# 格式化为 Dataset
train_dataset = Dataset.from_list([format_example(ex, tokenizer) for ex in train_raw])
val_dataset = Dataset.from_list([format_example(ex, tokenizer) for ex in val_raw])
test_dataset = Dataset.from_list([format_example(ex, tokenizer) for ex in test_raw])

# 保存测试集供后续评估用
TEST_DATA_PATH = "data/Cars_details_QA/test.json"
with open(TEST_DATA_PATH, "w", encoding="utf-8") as f:
    for ex in test_raw:
        f.write(json.dumps(ex, ensure_ascii=False) + "\n")
print(f"   测试集已保存到: {TEST_DATA_PATH}")

print("\n   训练样例:")
print("-" * 40)
print(train_dataset[0]["text"][:300] + "...")
print("-" * 40)

# ============================================================
# 5. 训练参数配置（含验证）
# ============================================================
print(">>> [5/6] 配置训练参数...")
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    
    # 训练轮数
    num_train_epochs=3,
    
    # Batch size 配置
    per_device_train_batch_size=2,
    per_device_eval_batch_size=2,
    gradient_accumulation_steps=8,   # 等效 batch_size = 2 * 8 = 16
    
    # 学习率
    learning_rate=2e-5,              # LoRA 推荐较低学习率
    warmup_ratio=0.1,
    
    # ========== 验证配置（关键！）==========
    eval_strategy="steps",           # 按步数验证
    eval_steps=100,                  # 每 100 步验证一次
    load_best_model_at_end=True,     # 训练结束后加载最佳模型
    metric_for_best_model="eval_loss",  # 用 eval_loss 选最佳
    greater_is_better=False,         # loss 越小越好
    
    # 日志和保存
    logging_steps=50,
    save_steps=100,
    save_total_limit=3,
    
    # 精度
    bf16=True,
    
    # 其他
    report_to="none",
    seed=RANDOM_SEED,
)

# ============================================================
# 6. 开始训练
# ============================================================
print(">>> [6/6] 开始 LoRA 微调...")
print("=" * 60)

trainer = SFTTrainer(
    model=model,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,        # ← 传入验证集
    args=training_args,
    processing_class=tokenizer,
    max_seq_length=512,
)

# 训练！
train_result = trainer.train()

# 打印训练结果
print("\n" + "=" * 60)
print("训练完成！")
print(f"   最终 train_loss: {train_result.training_loss:.4f}")
print("=" * 60)

# ============================================================
# 7. 在测试集上评估
# ============================================================
print("\n>>> 在测试集上评估...")
test_results = trainer.evaluate(eval_dataset=test_dataset)
print(f"   测试集 eval_loss: {test_results['eval_loss']:.4f}")

# ============================================================
# 8. 保存 LoRA 权重
# ============================================================
print(f"\n>>> 保存 LoRA 权重到 {OUTPUT_DIR}...")
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

print("\n" + "=" * 60)
print("全部完成！")
print(f"   LoRA 权重: {OUTPUT_DIR}")
print(f"   测试数据: {TEST_DATA_PATH}")
print("   运行 evaluate_lora.py 可对比微调前后效果")
print("=" * 60)

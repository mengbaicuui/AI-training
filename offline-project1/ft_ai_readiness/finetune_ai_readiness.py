"""
AI Readiness 数据 LoRA 微调（24GB 显存优化版）
================================================
修复：显示 train/val loss，移除测试集评估报错
"""

import json
import random
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainerCallback
from peft import LoraConfig, get_peft_model, TaskType
from trl import SFTTrainer, SFTConfig
from datasets import Dataset


# 自定义回调：打印 train_loss 和 val_loss
class LossLoggerCallback(TrainerCallback):
    def on_evaluate(self, args, state, control, metrics, **kwargs):
        train_loss = state.log_history[-2].get("loss", 0) if len(state.log_history) >= 2 else 0
        val_loss = metrics.get("eval_loss", 0)
        lr = state.log_history[-2].get("learning_rate", 0) if len(state.log_history) >= 2 else 0
        step = state.global_step
        epoch = state.epoch
        
        print(f"{{'train_loss': {train_loss:.4f}, 'val_loss': {val_loss:.4f}, 'learning_rate': {lr:.2e}, 'epoch': {epoch:.2f}, 'step': {step}}}")

# ============================================================
# 配置
# ============================================================
MODEL_PATH = "/root/autodl-tmp/Qwen3-8B"
DATA_PATH = "data/ai_readiness.jsonl"
OUTPUT_DIR = "./qwen3-8b-ai-readiness-lora"
TRAIN_RATIO, VAL_RATIO, TEST_RATIO = 0.8, 0.1, 0.1
RANDOM_SEED = 42

# ============================================================
# 1. 加载 Tokenizer
# ============================================================
print("=" * 60)
print(">>> [1/6] 加载 Tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

# ============================================================
# 2. 加载模型（bf16）
# ============================================================
print(">>> [2/6] 加载基座模型（bf16）...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    trust_remote_code=True,
    torch_dtype=torch.bfloat16,
    device_map="auto",
    low_cpu_mem_usage=True,
)
model.enable_input_require_grads()

# ============================================================
# 3. 配置 LoRA
# ============================================================
print(">>> [3/6] 配置 LoRA...")
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=4,
    lora_alpha=8,
    lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"],
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# ============================================================
# 4. 加载数据
# ============================================================
print(">>> [4/6] 加载并划分数据...")

def load_jsonl(path):
    with open(path, "r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]

def format_example(ex, tok):
    user = ex["instruction"] + ("\n" + ex["input"] if ex.get("input") else "")
    msgs = [
        {"role": "user", "content": user},
        {"role": "assistant", "content": ex["output"]}
    ]
    return {"text": tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=False)}

raw_data = load_jsonl(DATA_PATH)
random.seed(RANDOM_SEED)
random.shuffle(raw_data)

n = len(raw_data)
train_end = int(n * TRAIN_RATIO)
val_end = int(n * (TRAIN_RATIO + VAL_RATIO))

train_raw = raw_data[:train_end]
val_raw = raw_data[train_end:val_end]
test_raw = raw_data[val_end:]

print(f"   训练集: {len(train_raw)} 条")
print(f"   验证集: {len(val_raw)} 条")
print(f"   测试集: {len(test_raw)} 条")

train_ds = Dataset.from_list([format_example(ex, tokenizer) for ex in train_raw])
val_ds = Dataset.from_list([format_example(ex, tokenizer) for ex in val_raw])

# 保存测试集（用于后续 evaluate 脚本）
TEST_DATA_PATH = "data/ai_readiness_test.jsonl"
with open(TEST_DATA_PATH, "w", encoding="utf-8") as f:
    for ex in test_raw:
        f.write(json.dumps(ex, ensure_ascii=False) + "\n")
print(f"   测试集已保存: {TEST_DATA_PATH}")

# ============================================================
# 5. 训练参数（显示 train/val loss）
# ============================================================
print(">>> [5/6] 配置训练参数...")

training_args = SFTConfig(
    output_dir=OUTPUT_DIR,
    num_train_epochs=10,
    
    # Batch 配置
    per_device_train_batch_size=1,
    per_device_eval_batch_size=1,
    gradient_accumulation_steps=16,
    gradient_checkpointing=True,
    
    # 学习率
    learning_rate=2e-5,
    warmup_ratio=0.1,
    
    # ========== 验证和日志（同步显示 train_loss 和 val_loss）==========
    eval_strategy="steps",
    eval_steps=25,                       # 每 25 步验证
    logging_strategy="steps",
    logging_steps=25,                    # 和 eval 同步，一起显示
    
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    greater_is_better=False,
    
    save_steps=50,
    save_total_limit=2,
    bf16=True,
    report_to="tensorboard",   # 启用 TensorBoard 看 loss
    seed=RANDOM_SEED,
    
    # SFT 特有配置
    max_seq_length=512,
    dataset_text_field="text",           # 指定文本列名
)

# ============================================================
# 6. 开始训练
# ============================================================
print(">>> [6/6] 开始 LoRA 微调...")
print("=" * 60)

trainer = SFTTrainer(
    model=model,
    train_dataset=train_ds,
    eval_dataset=val_ds,
    args=training_args,
    processing_class=tokenizer,
    callbacks=[LossLoggerCallback()],    # 添加回调，清晰显示 loss
)

# 训练
train_result = trainer.train()

# ============================================================
# 7. 保存
# ============================================================
print("\n" + "=" * 60)
print("训练完成！")
print(f"   最终 train_loss: {train_result.training_loss:.4f}")
print("=" * 60)

print(f"\n>>> 保存 LoRA 权重到 {OUTPUT_DIR}...")
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

print("\n" + "=" * 60)
print("全部完成！")
print(f"   LoRA 权重: {OUTPUT_DIR}")
print(f"   测试数据: {TEST_DATA_PATH}")
print("\n下一步：运行 test_ai_readiness.py 测试效果")
print("=" * 60)

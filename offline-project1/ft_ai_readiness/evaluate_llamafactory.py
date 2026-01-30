"""
用 Llama Factory 评估微调效果（教学用）
======================================
对比基座模型 vs 微调后模型

运行方式：
    python evaluate_llamafactory.py
"""

import json
from pathlib import Path

# ============================================================
# 配置
# ============================================================
MODEL_PATH = "/root/autodl-tmp/Qwen3-8B"
LORA_PATH = "./qwen3-8b-cars-lora-lf"      # Llama Factory 训练的 LoRA
TEST_DATA = "data/cars_qa_split/test.json"  # 测试集
NUM_SAMPLES = 5                             # 测试样本数

CONFIG_DIR = Path("configs")

# ============================================================
# 创建推理配置
# ============================================================
def create_inference_configs():
    """创建基座和微调后的推理配置"""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    
    # 基座模型配置
    base_config = f"""### 基座模型推理配置
model_name_or_path: {MODEL_PATH}
trust_remote_code: true
template: qwen3
"""
    
    # 微调后模型配置
    lora_config = f"""### 微调后模型推理配置
model_name_or_path: {MODEL_PATH}
adapter_name_or_path: {LORA_PATH}
trust_remote_code: true
template: qwen3
finetuning_type: lora
"""
    
    base_path = CONFIG_DIR / "qwen3_base_infer.yaml"
    lora_path = CONFIG_DIR / "qwen3_lora_infer.yaml"
    
    with open(base_path, "w") as f:
        f.write(base_config)
    with open(lora_path, "w") as f:
        f.write(lora_config)
    
    return base_path, lora_path


# ============================================================
# 主函数
# ============================================================
def main():
    print("=" * 70)
    print("         Llama Factory 微调效果评估")
    print("=" * 70)
    
    # 加载测试数据
    print("\n>>> 加载测试数据...")
    with open(TEST_DATA, "r", encoding="utf-8") as f:
        test_samples = [json.loads(line) for line in f][:NUM_SAMPLES]
    print(f"   已加载 {len(test_samples)} 条测试样本")
    
    # 创建推理配置
    print("\n>>> 创建推理配置...")
    base_config, lora_config = create_inference_configs()
    print(f"   基座配置: {base_config}")
    print(f"   LoRA配置: {lora_config}")
    
    # 打印评估指南
    print("\n" + "=" * 70)
    print("         评估方式")
    print("=" * 70)
    
    print("""
【方式1】用 Llama Factory Web UI（推荐，可视化对比）

    1. 启动 Web UI:
       llamafactory-cli webui
    
    2. 在 "Chat" 标签页:
       - 先不加载 LoRA，测试基座模型
       - 再加载 LoRA 权重，测试微调后模型
    
    3. 用下面的测试问题对比效果

【方式2】用命令行 Chat

    # 基座模型
    llamafactory-cli chat configs/qwen3_base_infer.yaml
    
    # 微调后模型
    llamafactory-cli chat configs/qwen3_lora_infer.yaml

【方式3】用之前的 evaluate_lora.py（兼容）
    
    # 修改 LORA_PATH 为 Llama Factory 的输出目录
    LORA_PATH = "./qwen3-8b-cars-lora-lf"
    python evaluate_lora.py
""")
    
    # 打印测试问题
    print("\n" + "=" * 70)
    print("         测试问题（复制到 Chat 里测试）")
    print("=" * 70)
    
    for i, sample in enumerate(test_samples, 1):
        print(f"\n{'─' * 70}")
        print(f"问题 {i}: {sample['instruction']}")
        print(f"标准答案: {sample['output']}")
    
    print("\n" + "=" * 70)
    print("""
观察要点：
  🔵 基座模型：可能回答模糊、推理、或说「不知道」
  🟢 微调后：应该能直接给出准确的汽车参数

如果效果不理想，可以调整：
  - num_train_epochs（训练轮数）
  - learning_rate（学习率）
  - lora_rank（LoRA 秩）
""")


if __name__ == "__main__":
    main()

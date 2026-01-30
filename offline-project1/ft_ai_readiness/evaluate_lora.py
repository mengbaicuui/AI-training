"""
评估 LoRA 微调效果（教学用）
============================
对比基座模型 vs 微调后模型 对汽车问题的回答

使用方法：
    python evaluate_lora.py
"""

import json
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

# ============================================================
# 1. 配置路径
# ============================================================
BASE_MODEL_PATH = "/root/autodl-tmp/Qwen3-8B"  # Qwen3-8B 本地路径
LORA_PATH = "./qwen3-8b-cars-lora"             # 微调后的 LoRA 权重
TEST_DATA_PATH = "data/Cars_details_QA/test.json"  # 测试集（训练时划分出的）

# 要测试的问题数量（从测试集随机抽取）
NUM_TEST_SAMPLES = 5


def load_model(model_path, lora_path=None):
    """
    加载模型
    - lora_path=None: 加载基座模型
    - lora_path=路径: 加载基座+LoRA
    """
    tokenizer = AutoTokenizer.from_pretrained(
        lora_path or model_path,
        trust_remote_code=True
    )
    
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        trust_remote_code=True,
        torch_dtype=torch.bfloat16,
        device_map="auto",
    )
    
    if lora_path:
        model = PeftModel.from_pretrained(model, lora_path)
    
    model.eval()
    return model, tokenizer


def generate_answer(model, tokenizer, question, max_new_tokens=256):
    """生成回答"""
    messages = [{"role": "user", "content": question}]
    
    # 用 apply_chat_template 构建 prompt
    prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=tokenizer.eos_token_id,
        )
    
    # 只取新生成的部分
    input_len = inputs["input_ids"].shape[1]
    answer = tokenizer.decode(outputs[0][input_len:], skip_special_tokens=True)
    
    # 如果有 thinking 标签，提取答案部分
    if "</think>" in answer:
        answer = answer.split("</think>")[-1]
    
    return answer.strip()


def load_test_questions(path, num_samples):
    """从测试集加载问题"""
    questions = []
    answers = []
    with open(path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= num_samples:
                break
            data = json.loads(line)
            questions.append(data["Questions"])
            answers.append(data["Answers"])
    return questions, answers


def main():
    print("=" * 70)
    print("              LoRA 微调效果评估")
    print("=" * 70)
    
    # 加载测试问题
    print(f"\n>>> 从测试集加载 {NUM_TEST_SAMPLES} 个问题...")
    try:
        questions, ground_truths = load_test_questions(TEST_DATA_PATH, NUM_TEST_SAMPLES)
    except FileNotFoundError:
        print(f"   测试集文件不存在: {TEST_DATA_PATH}")
        print("   请先运行 finetune_lora.py 生成测试集")
        return
    
    # 加载基座模型
    print("\n>>> 加载基座模型（未微调）...")
    base_model, base_tokenizer = load_model(BASE_MODEL_PATH)
    
    # 加载微调后模型
    print(">>> 加载微调后模型（+LoRA）...")
    lora_model, lora_tokenizer = load_model(BASE_MODEL_PATH, LORA_PATH)
    
    # 开始对比测试
    print("\n" + "=" * 70)
    print("              开始对比测试")
    print("=" * 70)
    
    for i, (question, ground_truth) in enumerate(zip(questions, ground_truths), 1):
        print(f"\n{'─' * 70}")
        print(f"问题 {i}/{NUM_TEST_SAMPLES}: {question}")
        print(f"{'─' * 70}")
        
        # 标准答案
        print(f"\n📗 【标准答案】")
        print(f"   {ground_truth}")
        
        # 基座模型回答
        print(f"\n🔵 【基座模型（未微调）】")
        base_answer = generate_answer(base_model, base_tokenizer, question)
        # 截断太长的回答
        if len(base_answer) > 500:
            base_answer = base_answer[:500] + "..."
        print(f"   {base_answer}")
        
        # 微调后模型回答
        print(f"\n🟢 【微调后模型（+LoRA）】")
        lora_answer = generate_answer(lora_model, lora_tokenizer, question)
        if len(lora_answer) > 500:
            lora_answer = lora_answer[:500] + "..."
        print(f"   {lora_answer}")
    
    # 总结
    print("\n" + "=" * 70)
    print("评估完成！")
    print("=" * 70)
    print("""
观察要点：
  1. 基座模型可能回答模糊、推理、或说「不知道」
  2. 微调后模型应该能直接给出准确的汽车参数
  3. 如果微调效果不好，可以尝试：
     - 增加训练轮数 (num_train_epochs)
     - 调整学习率 (learning_rate)
     - 增大 LoRA 秩 (r)
""")


if __name__ == "__main__":
    main()

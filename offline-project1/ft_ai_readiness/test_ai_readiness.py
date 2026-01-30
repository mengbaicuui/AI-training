"""
AI Readiness 微调效果对比测试
==============================
对比：基座模型（Qwen3-8B，关闭推理） vs 微调后模型
"""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

# ============================================================
# 配置
# ============================================================
BASE_MODEL_PATH = "/root/autodl-tmp/Qwen3-8B"
LORA_PATH = "./qwen3-8b-ai-readiness-lora"  # 或 checkpoint-xxx

# 测试问题
TEST_QUESTIONS = [
    "AI成熟度如何去评估?",
    "阻碍试点项目大规模推广的主要障碍是什么?",
    "衡量投资回报使用了哪些指标?",
    "组织如何评估潜在的生成式AI供应商或合作伙伴?",
    "是什么阻止了员工或同事更频繁地使用这些工具?",
]


def generate_answer(model, tokenizer, question, max_new_tokens=256):
    """生成回答（关闭 Qwen3 推理模式）"""
    messages = [{"role": "user", "content": question}]
    
    # 使用 apply_chat_template，尝试关闭 thinking 模式
    try:
        text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
            enable_thinking=False,  # 关闭推理模式
        )
    except TypeError:
        # 旧版本不支持 enable_thinking
        text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
    
    inputs = tokenizer([text], return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1,
            pad_token_id=tokenizer.eos_token_id,
        )
    
    # 只取新生成的部分
    response = tokenizer.decode(
        output_ids[0][len(inputs["input_ids"][0]):],
        skip_special_tokens=True
    )
    
    # 去掉 thinking 标签（如果有）
    if "</think>" in response:
        response = response.split("</think>")[-1]
    
    return response.strip()


def main():
    print("=" * 70)
    print("        AI Readiness 微调效果对比")
    print("        基座模型 vs 微调后模型")
    print("=" * 70)
    
    # ========== 加载基座模型 ==========
    print("\n>>> 加载基座模型（Qwen3-8B）...")
    base_tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_PATH, trust_remote_code=True)
    base_model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL_PATH,
        torch_dtype=torch.bfloat16,
        device_map="auto",
        trust_remote_code=True
    )
    base_model.eval()
    
    # ========== 加载微调后模型 ==========
    print(">>> 加载微调后模型（+LoRA）...")
    lora_tokenizer = AutoTokenizer.from_pretrained(LORA_PATH, trust_remote_code=True)
    lora_model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL_PATH,
        torch_dtype=torch.bfloat16,
        device_map="auto",
        trust_remote_code=True
    )
    lora_model = PeftModel.from_pretrained(lora_model, LORA_PATH)
    lora_model.eval()
    
    # ========== 对比测试 ==========
    print("\n" + "=" * 70)
    print("        开始对比测试")
    print("=" * 70)
    
    for i, question in enumerate(TEST_QUESTIONS, 1):
        print(f"\n{'─' * 70}")
        print(f"问题 {i}: {question}")
        print(f"{'─' * 70}")
        
        # 基座模型回答
        print("\n🔵 【基座模型 Qwen3-8B】")
        base_answer = generate_answer(base_model, base_tokenizer, question)
        if len(base_answer) > 400:
            base_answer = base_answer[:400] + "..."
        print(f"   {base_answer}")
        
        # 微调后模型回答
        print("\n🟢 【微调后模型 +LoRA】")
        lora_answer = generate_answer(lora_model, lora_tokenizer, question)
        if len(lora_answer) > 400:
            lora_answer = lora_answer[:400] + "..."
        print(f"   {lora_answer}")
    
    # ========== 总结 ==========
    print("\n" + "=" * 70)
    print("对比完成！")
    print("=" * 70)
    print("""
观察要点：
  🔵 基座模型：回答可能比较通用、泛泛而谈
  🟢 微调后：应该能给出更具体、更贴合 AI Readiness 框架的回答
""")


if __name__ == "__main__":
    main()

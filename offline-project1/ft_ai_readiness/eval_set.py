import json

def convert_eval_to_alpaca(input_file, output_file):
    """将 eval 数据转换为 LLaMA Factory Alpaca 格式"""
    with open(input_file, 'r', encoding='utf-8') as f:
        data = [json.loads(line) for line in f if line.strip()]
    
    alpaca_data = []
    for item in data:
        question = item['question']
        options = item.get('options', '')
        
        # 如果有选项，拼接到问题后面
        if options and options != '""':
            try:
                opts = json.loads(options)
                opts_text = '\n'.join([f"{chr(65+i)}. {opt}" for i, opt in enumerate(opts)])
                instruction = f"{question}\n\n选项：\n{opts_text}"
            except:
                instruction = question
        else:
            instruction = question
        
        alpaca_data.append({
            "instruction": instruction,
            "input": "",
            "output": str(item['correctAnswer'])
        })
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for item in alpaca_data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')
    
    print(f"转换完成: {len(alpaca_data)} 条")

# 使用
convert_eval_to_alpaca(
    'data/ai-readiness-eval.jsonl',
    'data/ai-readiness-eval-alpaca.jsonl'
)
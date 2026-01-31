import torch
import numpy as np
import os
import re
import argparse
from transformers import AutoModel, AutoTokenizer, AutoConfig

# ================= 配置区域 =================
# 默认值
DEFAULT_BASE_MODEL_PATH = "/data00/models/Qwen/Qwen3-Embedding-4B"
DEFAULT_FT_MODEL_PATH = "/data01/opt/projects/llm-training/output/v16-20260129-164448/checkpoint-280-merged"
DEFAULT_OUTPUT_PATH = "./merged_qwen_slerp"

# 对应 YAML 中的 parameters
DEFAULT_T = 0.618
FILTER_KEYWORD = "self_attn"         # 对应 filter: self_attn
FILTER_GRADIENT = [0.1, 0.5, 0.9]    # 对应 value: [0.1, 0.5, 0.9]

# 对应 dtype: float16
DTYPE = torch.float16
# ===========================================

def slerp(t, v0, v1, dot_threshold=0.9995):
    """
    球面线性插值 (SLERP) 实现
    """
    # 转为 float32 进行高精度计算
    v0_f = v0.float()
    v1_f = v1.float()
    
    # 拷贝避免修改原变量
    v0_copy = v0_f.clone()
    v1_copy = v1_f.clone()

    v0_norm = v0_copy / torch.norm(v0_copy)
    v1_norm = v1_copy / torch.norm(v1_copy)
    
    dot = torch.sum(v0_norm * v1_norm)

    if dot < 0.0:
        v1_copy = -v1_copy
        dot = -dot

    if dot > dot_threshold:
        res = (1 - t) * v0_copy + t * v1_copy
    else:
        theta_0 = torch.acos(dot)
        sin_theta_0 = torch.sin(theta_0)
        theta_t = theta_0 * t
        sin_theta_t = torch.sin(theta_t)
        
        s0 = torch.sin(theta_0 - theta_t) / sin_theta_0
        s1 = sin_theta_t / sin_theta_0
        res = s0 * v0_copy + s1 * v1_copy
        
    return res.to(DTYPE)

def get_layer_index(key):
    """
    从参数键名中提取层号。
    
    例如: "model.layers.15.self_attn.q_proj.weight" -> 15
    """
    # 适配常见 Transformer 结构 (bert.encoder.layer.X 或 model.layers.X)
    match = re.search(r"(layers|h|block)\.(\d+)\.", key)
    if match:
        return int(match.group(2))
    return None

def calculate_t(key, total_layers):
    """
    根据配置计算当前参数的 t 值
    """
    # 1. 检查是否匹配 filter (self_attn)
    if FILTER_KEYWORD in key:
        layer_idx = get_layer_index(key)
        
        # 如果能提取到层号，则进行梯度插值
        if layer_idx is not None:
            # 构造梯度坐标轴
            # 我们希望将 layer_idx (0 到 total_layers-1) 映射到 gradient 的值域
            # np.interp(x, xp, fp)
            # x: 当前层号
            # xp: 梯度值的锚点位置 (例如 0层对应0.1, 中间层对应0.5, 最后层对应0.9)
            xp = np.linspace(0, total_layers - 1, len(FILTER_GRADIENT))
            fp = FILTER_GRADIENT
            
            t = np.interp(layer_idx, xp, fp)
            return float(t) # 返回计算出的动态 t
            
    # 2. 如果不匹配 filter 或不是层级参数，使用默认值
    return DEFAULT_T

def parse_args():
    parser = argparse.ArgumentParser(description="Merge two models using SLERP.")
    parser.add_argument(
        "--base_model_path", 
        type=str, 
        default=DEFAULT_BASE_MODEL_PATH, 
        help="Path to the base model"
    )
    parser.add_argument(
        "--ft_model_path", 
        type=str, 
        default=DEFAULT_FT_MODEL_PATH, 
        help="Path to the fine-tuned model"
    )
    parser.add_argument(
        "--output_path", 
        type=str, 
        default=DEFAULT_OUTPUT_PATH, 
        help="Path to save the merged model"
    )
    return parser.parse_args()

def main():
    args = parse_args()
    
    base_model_path = args.base_model_path
    ft_model_path = args.ft_model_path
    output_path = args.output_path

    print(f"Loading Base Model: {base_model_path}...")
    # 使用 cpu 加载以节省显存，或者改为 "cuda"
    model_base = AutoModel.from_pretrained(base_model_path, torch_dtype=DTYPE, device_map="cpu")
    tokenizer = AutoTokenizer.from_pretrained(ft_model_path)
    config = AutoConfig.from_pretrained(ft_model_path)
    
    # 获取总层数 (Qwen 通常是 config.num_hidden_layers)
    if hasattr(config, "num_hidden_layers"):
        total_layers = config.num_hidden_layers
    elif hasattr(config, "n_layer"):
        total_layers = config.n_layer
    else:
        # 如果找不到，需要手动检查 state_dict 或设置为默认值 (如 32)
        print("Warning: 无法自动检测总层数，假设为 32 (请根据 Qwen3-4B 实际情况确认)")
        total_layers = 32
        
    print(f"Detected total layers: {total_layers}")

    print(f"Loading Fine-tuned Model: {ft_model_path}...")
    model_ft = AutoModel.from_pretrained(ft_model_path, torch_dtype=DTYPE, device_map="cpu")
    
    base_sd = model_base.state_dict()
    ft_sd = model_ft.state_dict()
    
    merged_sd = {}
    
    print("Starting Merge...")
    print(f"Global t: {DEFAULT_T}")
    print(f"Filter '{FILTER_KEYWORD}' gradient: {FILTER_GRADIENT}")

    for key in base_sd.keys():
        if key not in ft_sd:
            merged_sd[key] = base_sd[key]
            continue
            
        # 计算当前参数的 t 值
        t = calculate_t(key, total_layers)
        
        # 仅用于日志打印，避免刷屏，只打印每层的第一个参数变化
        if "self_attn" in key and ".q_proj." in key: 
            print(f"  - Processing {key}: dynamic t = {t:.4f}")
        
        param_base = base_sd[key]
        param_ft = ft_sd[key]
        
        # 形状检查
        if param_base.shape != param_ft.shape:
            print(f"Skipping {key} due to shape mismatch")
            merged_sd[key] = param_base
            continue
            
        # 仅对浮点参数做 SLERP，整数(如 position_ids) 跳过
        if torch.is_floating_point(param_base):
            merged_sd[key] = slerp(t, param_base, param_ft)
        else:
            merged_sd[key] = param_base # 或者是 ft 参数，通常非浮点参数不变

    print("Saving merged model...")
    # 将合并后的权重加载回 base 模型对象
    model_base.load_state_dict(merged_sd)
    model_base.save_pretrained(output_path)
    tokenizer.save_pretrained(output_path)
    print(f"Done! Model saved to {output_path}")

if __name__ == "__main__":
    main()


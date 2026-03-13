"""
数据集预处理脚本

功能：
1. 统计 token 长度分布，计算 p95, p99
2. 基于 hash 去重
3. 清理无效字符
4. 过滤太长或太短的数据
"""

import json
import hashlib
import re
from pathlib import Path
from collections import Counter
import numpy as np
from typing import Optional

# 尝试导入 tiktoken（如果没有则使用简单的字符计数）
USE_TIKTOKEN = False
TOKENIZER = None

def try_load_tiktoken():
    """尝试加载 tiktoken"""
    global USE_TIKTOKEN, TOKENIZER
    try:
        import tiktoken
        TOKENIZER = tiktoken.get_encoding("cl100k_base")  # GPT-4/Claude 常用编码
        USE_TIKTOKEN = True
        return True
    except (ImportError, Exception) as e:
        USE_TIKTOKEN = False
        return False


def count_tokens(text: str) -> int:
    """计算文本的 token 数量"""
    if USE_TIKTOKEN:
        return len(TOKENIZER.encode(text))
    else:
        # 简单估算：中文按字符数，英文按空格分词
        # 中文大约 1.5 字符 = 1 token，英文大约 4 字符 = 1 token
        chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
        other_chars = len(text) - chinese_chars
        return int(chinese_chars / 1.5 + other_chars / 4)


def compute_hash(sample: dict) -> str:
    """计算样本的 hash 值用于去重"""
    # 使用 instruction + output 的组合来计算 hash
    content = f"{sample.get('instruction', '')}{sample.get('output', '')}"
    return hashlib.md5(content.encode('utf-8')).hexdigest()


def clean_invalid_chars(text: str) -> str:
    """清理无效字符"""
    if not text:
        return text
    
    # 1. 移除 NULL 字符
    text = text.replace('\x00', '')
    
    # 2. 移除其他控制字符（保留换行、制表符）
    text = re.sub(r'[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    
    # 3. 规范化空白字符
    # 多个连续空格变成单个空格
    text = re.sub(r'[ \t]+', ' ', text)
    # 多个连续换行变成两个换行
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # 4. 移除首尾空白
    text = text.strip()
    
    # 5. 移除 Unicode 特殊字符（如 BOM、零宽字符等）
    text = re.sub(r'[\ufeff\u200b\u200c\u200d\u2060]', '', text)
    
    return text


def clean_sample(sample: dict) -> dict:
    """清理单个样本中的无效字符"""
    cleaned = {}
    for key, value in sample.items():
        if isinstance(value, str):
            cleaned[key] = clean_invalid_chars(value)
        else:
            cleaned[key] = value
    return cleaned


def get_sample_token_length(sample: dict) -> int:
    """计算样本的总 token 长度"""
    instruction = sample.get('instruction', '')
    input_text = sample.get('input', '')
    output = sample.get('output', '')
    system = sample.get('system', '')
    
    total_text = f"{system}{instruction}{input_text}{output}"
    return count_tokens(total_text)


def analyze_token_distribution(samples: list[dict]) -> dict:
    """分析 token 长度分布"""
    lengths = [get_sample_token_length(s) for s in samples]
    lengths_array = np.array(lengths)
    
    stats = {
        'count': len(lengths),
        'min': int(np.min(lengths_array)),
        'max': int(np.max(lengths_array)),
        'mean': float(np.mean(lengths_array)),
        'median': float(np.median(lengths_array)),
        'std': float(np.std(lengths_array)),
        'p50': int(np.percentile(lengths_array, 50)),
        'p75': int(np.percentile(lengths_array, 75)),
        'p90': int(np.percentile(lengths_array, 90)),
        'p95': int(np.percentile(lengths_array, 95)),
        'p99': int(np.percentile(lengths_array, 99)),
    }
    
    # 统计长度分布区间
    bins = [0, 50, 100, 200, 500, 1000, 2000, 5000, float('inf')]
    bin_labels = ['0-50', '50-100', '100-200', '200-500', '500-1000', '1000-2000', '2000-5000', '5000+']
    distribution = Counter()
    for length in lengths:
        for i in range(len(bins) - 1):
            if bins[i] <= length < bins[i + 1]:
                distribution[bin_labels[i]] += 1
                break
    
    stats['distribution'] = dict(distribution)
    stats['lengths'] = lengths  # 保留原始长度数据用于后续分析
    
    return stats


def deduplicate_by_hash(samples: list[dict]) -> tuple[list[dict], int]:
    """基于 hash 去重"""
    seen_hashes = set()
    unique_samples = []
    duplicate_count = 0
    
    for sample in samples:
        sample_hash = compute_hash(sample)
        if sample_hash not in seen_hashes:
            seen_hashes.add(sample_hash)
            unique_samples.append(sample)
        else:
            duplicate_count += 1
    
    return unique_samples, duplicate_count


def filter_by_length(
    samples: list[dict], 
    min_tokens: int = 10, 
    max_tokens: int = 4096
) -> tuple[list[dict], dict]:
    """根据 token 长度过滤样本"""
    filtered = []
    stats = {
        'too_short': 0,
        'too_long': 0,
        'valid': 0,
        'short_examples': [],
        'long_examples': [],
    }
    
    for sample in samples:
        length = get_sample_token_length(sample)
        if length < min_tokens:
            stats['too_short'] += 1
            if len(stats['short_examples']) < 3:
                stats['short_examples'].append({
                    'instruction': sample.get('instruction', '')[:100],
                    'length': length
                })
        elif length > max_tokens:
            stats['too_long'] += 1
            if len(stats['long_examples']) < 3:
                stats['long_examples'].append({
                    'instruction': sample.get('instruction', '')[:100],
                    'length': length
                })
        else:
            stats['valid'] += 1
            filtered.append(sample)
    
    return filtered, stats


def load_jsonl(file_path: str) -> list[dict]:
    """加载 JSONL 文件"""
    samples = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                sample = json.loads(line)
                samples.append(sample)
            except json.JSONDecodeError as e:
                print(f"⚠️ 第 {line_num} 行 JSON 解析错误: {e}")
    return samples


def save_jsonl(samples: list[dict], file_path: str):
    """保存为 JSONL 文件"""
    with open(file_path, 'w', encoding='utf-8') as f:
        for sample in samples:
            f.write(json.dumps(sample, ensure_ascii=False) + '\n')


def print_stats(title: str, stats: dict):
    """打印统计信息"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)
    for key, value in stats.items():
        if key == 'lengths':
            continue  # 跳过原始长度数据
        if key == 'distribution':
            print(f"\n  Token 长度分布:")
            for bin_name, count in sorted(value.items(), key=lambda x: int(x[0].split('-')[0].replace('+', '9999'))):
                print(f"    {bin_name:>12}: {count:>6} 条")
        elif key in ['short_examples', 'long_examples']:
            if value:
                label = "过短示例" if key == 'short_examples' else "过长示例"
                print(f"\n  {label}:")
                for ex in value:
                    print(f"    - [{ex['length']} tokens] {ex['instruction'][:50]}...")
        else:
            print(f"  {key:>12}: {value}")


def preprocess_ai_readiness(
    input_file: str = "data/ai_readiness.jsonl",
    output_file: Optional[str] = None,
    min_tokens: int = 10,
    max_tokens: int = 4096,
    save_cleaned: bool = True
):
    """
    预处理 AI Readiness 数据集的主函数
    
    Args:
        input_file: 输入文件路径
        output_file: 输出文件路径（默认为 input_file 同目录下的 cleaned 文件）
        min_tokens: 最小 token 数量
        max_tokens: 最大 token 数量
        save_cleaned: 是否保存清洗后的数据
    """
    if output_file is None:
        input_path = Path(input_file)
        output_file = str(input_path.parent / f"{input_path.stem}_cleaned{input_path.suffix}")
    
    print(f"\n📂 加载数据: {input_file}")
    samples = load_jsonl(input_file)
    print(f"   原始数据量: {len(samples)} 条")
    
    # ========== 1. Token 长度分布分析 ==========
    print("\n📊 步骤 1: 分析 Token 长度分布...")
    token_stats = analyze_token_distribution(samples)
    print_stats("Token 长度统计", token_stats)
    
    print(f"\n  🎯 关键分位数:")
    print(f"     P95 = {token_stats['p95']} tokens (95% 的数据短于此长度)")
    print(f"     P99 = {token_stats['p99']} tokens (99% 的数据短于此长度)")
    
    # ========== 2. 清理无效字符 ==========
    print("\n🧹 步骤 2: 清理无效字符...")
    cleaned_samples = [clean_sample(s) for s in samples]
    print(f"   清理完成，共处理 {len(cleaned_samples)} 条数据")
    
    # ========== 3. Hash 去重 ==========
    print("\n🔍 步骤 3: 基于 Hash 去重...")
    deduped_samples, dup_count = deduplicate_by_hash(cleaned_samples)
    print(f"   去重完成:")
    print(f"     - 原始数量: {len(cleaned_samples)} 条")
    print(f"     - 重复数量: {dup_count} 条")
    print(f"     - 去重后:   {len(deduped_samples)} 条")
    
    # ========== 4. 长度过滤 ==========
    print(f"\n📏 步骤 4: 过滤过长/过短数据 (min={min_tokens}, max={max_tokens})...")
    filtered_samples, filter_stats = filter_by_length(deduped_samples, min_tokens, max_tokens)
    print(f"   过滤完成:")
    print(f"     - 过短 (<{min_tokens} tokens): {filter_stats['too_short']} 条")
    print(f"     - 过长 (>{max_tokens} tokens): {filter_stats['too_long']} 条")
    print(f"     - 有效数据: {filter_stats['valid']} 条")
    
    if filter_stats['short_examples']:
        print(f"\n   过短示例:")
        for ex in filter_stats['short_examples']:
            print(f"     [{ex['length']} tokens] {ex['instruction'][:60]}...")
    
    if filter_stats['long_examples']:
        print(f"\n   过长示例:")
        for ex in filter_stats['long_examples']:
            print(f"     [{ex['length']} tokens] {ex['instruction'][:60]}...")
    
    # ========== 5. 清洗后的 Token 分布 ==========
    print("\n📊 清洗后 Token 长度分布:")
    final_stats = analyze_token_distribution(filtered_samples)
    print(f"   数据量: {final_stats['count']} 条")
    print(f"   平均长度: {final_stats['mean']:.1f} tokens")
    print(f"   中位数: {final_stats['median']:.1f} tokens")
    print(f"   P95: {final_stats['p95']} tokens")
    print(f"   P99: {final_stats['p99']} tokens")
    
    # ========== 6. 保存清洗后的数据 ==========
    if save_cleaned:
        print(f"\n💾 保存清洗后的数据: {output_file}")
        save_jsonl(filtered_samples, output_file)
        print(f"   保存完成!")
    
    # ========== 总结 ==========
    print("\n" + "="*60)
    print("  📋 预处理总结")
    print("="*60)
    print(f"  原始数据量:     {len(samples)} 条")
    print(f"  重复数据:       {dup_count} 条 ({dup_count/len(samples)*100:.1f}%)")
    print(f"  过短数据:       {filter_stats['too_short']} 条")
    print(f"  过长数据:       {filter_stats['too_long']} 条")
    print(f"  最终数据量:     {len(filtered_samples)} 条 ({len(filtered_samples)/len(samples)*100:.1f}%)")
    print("="*60)
    
    return filtered_samples, {
        'original_count': len(samples),
        'duplicate_count': dup_count,
        'too_short': filter_stats['too_short'],
        'too_long': filter_stats['too_long'],
        'final_count': len(filtered_samples),
        'token_stats_before': token_stats,
        'token_stats_after': final_stats,
    }


if __name__ == "__main__":
    import argparse
    
    # 尝试加载 tiktoken
    if try_load_tiktoken():
        print("✅ 使用 tiktoken 进行精确 token 计数")
    else:
        print("⚠️ tiktoken 未安装或加载失败，使用字符估算代替")
    
    parser = argparse.ArgumentParser(description='预处理 AI Readiness 数据集')
    parser.add_argument('--input', '-i', default='data/ai_readiness.jsonl', 
                        help='输入文件路径')
    parser.add_argument('--output', '-o', default=None, 
                        help='输出文件路径')
    parser.add_argument('--min-tokens', type=int, default=10, 
                        help='最小 token 数量')
    parser.add_argument('--max-tokens', type=int, default=4096, 
                        help='最大 token 数量')
    parser.add_argument('--no-save', action='store_true', 
                        help='不保存清洗后的数据')
    
    args = parser.parse_args()
    
    preprocess_ai_readiness(
        input_file=args.input,
        output_file=args.output,
        min_tokens=args.min_tokens,
        max_tokens=args.max_tokens,
        save_cleaned=not args.no_save
    )

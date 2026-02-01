#!/usr/bin/env python3
"""
Embedding/LLM模型评测脚本 (异步并行版本)
支持 Recall@K, MRR@K, NDCG@K 评测指标
支持多种排序策略：Embedding相似度排序、LLM排序
"""

import json
import argparse
import asyncio
import traceback
import os
import re
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

import numpy as np
import mlflow
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()


@dataclass
class EvalConfig:
    """评测配置"""

    api_base: str
    api_key: str
    model: str
    k_values: List[int]
    concurrency: int = 10  # 并发数


# ============== Sorter 抽象层 ==============


class BaseSorter(ABC):
    """排序器基类"""

    @abstractmethod
    async def sort_candidates(
        self, query: str, candidates: List[str], labels: List[int]
    ) -> List[Dict[str, Any]]:
        """
        对候选文本按相关性排序

        Args:
            query: 查询文本
            candidates: 候选文本列表
            labels: 对应的标签列表 (1=正样本, 0=负样本)

        Returns:
            排序后的结果列表，每项包含:
            - text: 文本内容
            - score: 排序分数 (用于排序，越大越好)
            - label: 原始标签
            - type: 'positive' 或 'negative'
        """
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        """排序器名称"""
        pass


class EmbeddingSorter(BaseSorter):
    """基于Embedding相似度的排序器"""

    def __init__(
        self, api_base: str, api_key: str, model: str, use_instruct: bool = True
    ):
        self.client = AsyncOpenAI(base_url=api_base, api_key=api_key)
        self.model = model
        self.use_instruct = use_instruct

    @property
    def name(self) -> str:
        return f"EmbeddingSorter({self.model})"

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """批量获取embedding"""
        if self.use_instruct:
            texts = [
                f"Instruct: Retrieve semantically similar text\nQuery:{text}"
                for text in texts
            ]
        response = await self.client.embeddings.create(model=self.model, input=texts)
        # 按照输入顺序返回
        sorted_data = sorted(response.data, key=lambda x: x.index)
        return [item.embedding for item in sorted_data]

    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """计算余弦相似度"""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        return float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))

    async def sort_candidates(
        self, query: str, candidates: List[str], labels: List[int]
    ) -> List[Dict[str, Any]]:
        """使用embedding相似度对候选文本排序"""
        # 获取所有embedding
        all_texts = [query] + candidates
        embeddings = await self.get_embeddings(all_texts)

        query_emb = embeddings[0]
        candidate_embs = embeddings[1:]

        # 计算相似度
        results = []
        for text, emb, label in zip(candidates, candidate_embs, labels):
            sim = self.cosine_similarity(query_emb, emb)
            results.append(
                {
                    "text": text,
                    "score": sim,
                    "label": label,
                    "type": "positive" if label == 1 else "negative",
                }
            )

        # 按相似度降序排序
        results.sort(key=lambda x: x["score"], reverse=True)
        return results


class LLMSorter(BaseSorter):
    """基于LLM的排序器"""

    def __init__(
        self,
        api_base: str,
        api_key: str,
        model: str,
        system_prompt: Optional[str] = None,
    ):
        self.client = AsyncOpenAI(base_url=api_base, api_key=api_key)
        self.model = model
        self.system_prompt = system_prompt or self._default_system_prompt()

    @property
    def name(self) -> str:
        return f"LLMSorter({self.model})"

    @staticmethod
    def _default_system_prompt() -> str:
        return """你是一个专业的文本相关性排序助手。给定一个查询和多个候选文本，你需要按照与查询的相关性对候选文本进行排序。

请仔细分析每个候选文本与查询的语义相关性，考虑以下因素：
1. 主题相关性：候选文本是否讨论与查询相同的主题
2. 语义相似性：候选文本的含义是否与查询相近
3. 信息覆盖：候选文本是否能回答或解决查询的问题

输出格式：按相关性从高到低，输出候选文本的编号列表，用逗号分隔。
例如：如果候选文本1最相关，候选文本3次之，候选文本2最不相关，则输出：1,3,2

只输出编号列表，不要输出其他内容。"""

    def _build_user_prompt(self, query: str, candidates: List[str]) -> str:
        """构建用户提示"""
        candidates_text = "\n".join(
            [f"[{i + 1}] {text}" for i, text in enumerate(candidates)]
        )
        return f"""查询：{query}

候选文本：
{candidates_text}

请按相关性从高到低排序，输出编号列表："""

    def _parse_ranking(self, response: str, num_candidates: int) -> List[int]:
        """解析LLM返回的排序结果"""
        # 提取所有数字
        numbers = re.findall(r"\d+", response)
        ranking = []
        seen = set()

        for num_str in numbers:
            num = int(num_str)
            if 1 <= num <= num_candidates and num not in seen:
                ranking.append(num - 1)  # 转为0-indexed
                seen.add(num)

        # 如果有遗漏的候选，按原顺序追加
        for i in range(num_candidates):
            if i not in ranking:
                ranking.append(i)

        return ranking

    async def sort_candidates(
        self, query: str, candidates: List[str], labels: List[int]
    ) -> List[Dict[str, Any]]:
        """使用LLM对候选文本排序"""
        user_prompt = self._build_user_prompt(query, candidates)

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0,
            max_tokens=4096,
        )

        response_text = response.choices[0].message.content.strip()
        ranking = self._parse_ranking(response_text, len(candidates))

        # 构建排序结果
        results = []
        for rank, idx in enumerate(ranking):
            results.append(
                {
                    "text": candidates[idx],
                    "score": len(candidates) - rank,  # 排名越靠前分数越高
                    "label": labels[idx],
                    "type": "positive" if labels[idx] == 1 else "negative",
                    "original_index": idx,
                }
            )

        return results


# ============== 兼容旧代码的客户端类 ==============


class AsyncEmbeddingClient:
    """异步OpenAI格式的Embedding API客户端 (兼容旧代码)"""

    def __init__(self, api_base: str, api_key: str, model: str):
        self.client = AsyncOpenAI(base_url=api_base, api_key=api_key)
        self.model = model

    async def get_embedding(self, text: str) -> List[float]:
        """获取单条文本的embedding"""
        response = await self.client.embeddings.create(model=self.model, input=text)
        return response.data[0].embedding

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """批量获取embedding"""
        texts = [
            f"Instruct: Retrieve semantically similar text\nQuery:{text}"
            for text in texts
        ]
        response = await self.client.embeddings.create(model=self.model, input=texts)
        # 按照输入顺序返回
        sorted_data = sorted(response.data, key=lambda x: x.index)
        return [item.embedding for item in sorted_data]


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """计算余弦相似度"""
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    return float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))


def compute_recall_at_k(ranked_labels: List[int], k: int) -> float:
    """
    计算 Recall@K
    ranked_labels: 排序后的标签列表 (1=正样本, 0=负样本)
    k: 取前K个结果
    """
    total_positives = sum(ranked_labels)
    if total_positives == 0:
        return 0.0

    top_k_positives = sum(ranked_labels[:k])
    return top_k_positives / total_positives


def compute_mrr_at_k(ranked_labels: List[int], k: int) -> float:
    """
    计算 MRR@K (Mean Reciprocal Rank)
    返回第一个正样本的倒数排名
    """
    for i, label in enumerate(ranked_labels[:k]):
        if label == 1:
            return 1.0 / (i + 1)
    return 0.0


def compute_ndcg_at_k(ranked_labels: List[int], k: int) -> float:
    """
    计算 NDCG@K (Normalized Discounted Cumulative Gain)
    """
    # DCG@K
    dcg = 0.0
    for i, label in enumerate(ranked_labels[:k]):
        dcg += label / np.log2(i + 2)  # i+2 因为排名从1开始，log从2开始

    # IDCG@K (理想情况：所有正样本排在前面)
    ideal_labels = sorted(ranked_labels, reverse=True)
    idcg = 0.0
    for i, label in enumerate(ideal_labels[:k]):
        idcg += label / np.log2(i + 2)

    if idcg == 0:
        return 0.0

    return dcg / idcg


async def evaluate_single_query(
    sorter: BaseSorter, item: Dict, k_values: List[int], index: int
) -> Dict[str, Any]:
    """
    异步评测单个query
    返回各项指标和详细排序结果

    Args:
        sorter: 排序器实例 (EmbeddingSorter 或 LLMSorter)
        item: 评测数据项
        k_values: K值列表
        index: 数据索引
    """
    query = item["query"]
    positives = item["positives"]
    negatives = item["negatives"]

    # 构建候选池
    candidates = positives + negatives
    labels = [1] * len(positives) + [0] * len(negatives)

    # 使用排序器进行排序
    sorted_results = await sorter.sort_candidates(query, candidates, labels)
    ranked_labels = [r["label"] for r in sorted_results]

    # 获取所有正样本的排名 (1-based)
    positive_ranks = []
    for rank, result in enumerate(sorted_results):
        if result["label"] == 1:
            positive_ranks.append(rank + 1)

    # 计算各K值的指标
    metrics = {}
    for k in k_values:
        metrics[f"recall@{k}"] = compute_recall_at_k(ranked_labels, k)
        metrics[f"mrr@{k}"] = compute_mrr_at_k(ranked_labels, k)
        metrics[f"ndcg@{k}"] = compute_ndcg_at_k(ranked_labels, k)

    return {
        "id": item.get("id", index),
        "category": item.get("category", ""),
        "query": query,
        "reason": item.get("reason", ""),
        "metrics": metrics,
        "positive_ranks": positive_ranks,  # 所有正样本的排名
        "ranked_results": sorted_results[: max(k_values)],  # 只保留top-K结果
        "total_positives": len(positives),
        "total_negatives": len(negatives),
    }


def load_eval_data(data_path: str) -> List[Dict]:
    """加载评测数据集"""
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)


class ProgressTracker:
    """进度跟踪器"""

    def __init__(self, total: int):
        self.total = total
        self.completed = 0
        self.lock = asyncio.Lock()

    async def increment(self, query: str = ""):
        async with self.lock:
            self.completed += 1
            print(
                f"\r评测进度: {self.completed}/{self.total} - {query[:30]}...",
                end="",
                flush=True,
            )


async def evaluate_with_semaphore(
    semaphore: asyncio.Semaphore,
    sorter: BaseSorter,
    item: Dict,
    k_values: List[int],
    index: int,
    progress: ProgressTracker,
) -> Dict[str, Any]:
    """带信号量控制的评测任务"""
    async with semaphore:
        try:
            result = await evaluate_single_query(sorter, item, k_values, index)
            await progress.increment(item.get("query", ""))
            return result
        except Exception as e:
            await progress.increment(f"[失败] {item.get('query', '')}")
            traceback.print_exc()
            return {
                "id": item.get("id", index),
                "query": item.get("query", ""),
                "error": str(e),
            }


async def run_evaluation_async(
    sorter: BaseSorter,
    data: List[Dict],
    k_values: List[int],
    concurrency: int = 10,
    verbose: bool = True,
) -> Dict[str, Any]:
    """
    异步并行运行评测

    Args:
        sorter: 排序器实例 (EmbeddingSorter 或 LLMSorter)
        data: 评测数据列表
        k_values: K值列表
        concurrency: 并发数
        verbose: 是否显示进度
    """
    # 创建信号量控制并发
    semaphore = asyncio.Semaphore(concurrency)
    progress = ProgressTracker(len(data))

    if verbose:
        print(f"排序器: {sorter.name}")
        print(f"并发数: {concurrency}")

    # 创建所有任务
    tasks = [
        evaluate_with_semaphore(semaphore, sorter, item, k_values, i, progress)
        for i, item in enumerate(data)
    ]

    # 并行执行所有任务
    results = await asyncio.gather(*tasks)

    if verbose:
        print()  # 换行

    # 初始化聚合指标
    aggregated_metrics = {
        f"{metric}@{k}": [] for k in k_values for metric in ["recall", "mrr", "ndcg"]
    }

    # 聚合指标
    for result in results:
        if "error" not in result:
            for metric_name, value in result["metrics"].items():
                aggregated_metrics[metric_name].append(value)

    # 计算平均指标
    avg_metrics = {}
    for metric_name, values in aggregated_metrics.items():
        if values:
            avg_metrics[f"avg_{metric_name}"] = float(np.mean(values))
            avg_metrics[f"std_{metric_name}"] = float(np.std(values))

    return {
        "summary": {
            "total_queries": len(data),
            "successful": len([r for r in results if "error" not in r]),
            "failed": len([r for r in results if "error" in r]),
            "k_values": k_values,
            "concurrency": concurrency,
            **avg_metrics,
        },
        "details": results,
    }


async def async_main(args):
    """异步主函数"""
    # 通用配置
    api_base = args.api_base or os.getenv(
        "EMBEDDING_API_BASE", "https://api.openai.com/v1"
    )
    api_key = args.api_key or os.getenv("EMBEDDING_API_KEY")
    model = args.model or os.getenv("EMBEDDING_MODEL_NAME", "text-embedding-3-small")

    if not api_key:
        print("错误: 请设置EMBEDDING_API_KEY环境变量或通过--api-key参数提供")
        return

    # 根据sorter类型创建排序器
    sorter_type = args.sorter.lower()

    if sorter_type == "embedding":
        sorter = EmbeddingSorter(
            api_base, api_key, model, use_instruct=not args.no_instruct
        )
    elif sorter_type == "llm":
        # LLM排序器使用独立的配置，如果没有指定则使用默认配置
        llm_api_base = args.llm_api_base or os.getenv("LLM_API_BASE", api_base)
        llm_api_key = args.llm_api_key or os.getenv("LLM_API_KEY", api_key)
        llm_model = args.llm_model or os.getenv("LLM_MODEL_NAME", "gpt-4o-mini")
        sorter = LLMSorter(llm_api_base, llm_api_key, llm_model)
    else:
        print(f"错误: 不支持的排序器类型 '{sorter_type}'，请使用 'embedding' 或 'llm'")
        return

    # MLflow 配置
    mlflow_tracking_uri = "http://192.168.0.105:5000"
    mlflow.set_tracking_uri(mlflow_tracking_uri)
    try:
        mlflow.set_experiment("embedding_evaluation_v3")
    except Exception:
        pass

    # 开始 MLflow Run
    run_name = f"eval_{sorter_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    with mlflow.start_run(run_name=run_name):
        # 记录参数
        mlflow.log_param("sorter_type", sorter_type)
        mlflow.log_param("sorter_name", sorter.name)
        if sorter_type == "embedding":
            mlflow.log_param("api_base", api_base)
            mlflow.log_param("model", model)
            mlflow.log_param("prompt_instruct", not args.no_instruct)
        else:
            mlflow.log_param("llm_api_base", llm_api_base)
            mlflow.log_param("llm_model", llm_model)

        mlflow.log_param("k_values", str(args.k))
        mlflow.log_param("concurrency", args.concurrency)
        mlflow.log_param("data_path", args.data)

        # 记录额外参数
        if args.extra_params:
            try:
                extra_params = json.loads(args.extra_params)
                if isinstance(extra_params, dict):
                    mlflow.log_params(extra_params)
                    print(f"已记录额外参数: {extra_params}")
                else:
                    print(
                        f"[Warning] --extra-params 应为 JSON 字典格式，实际类型: {type(extra_params)}"
                    )
            except json.JSONDecodeError:
                print(f"[Warning] 无法解析 --extra-params 为 JSON: {args.extra_params}")

        # 上传指定文件
        if args.upload_file:
            if os.path.exists(args.upload_file):
                try:
                    mlflow.log_artifact(args.upload_file)
                    print(f"已上传文件到 MLflow: {args.upload_file}")
                except Exception as e:
                    print(f"[Warning] 上传文件失败: {e}")
            else:
                print(f"[Warning] 未找到要上传的文件: {args.upload_file}")

        print("=" * 60)
        print("Embedding/LLM模型评测 (异步并行版本)")
        print("=" * 60)
        print(f"排序器类型: {sorter_type}")
        print(f"排序器: {sorter.name}")
        if sorter_type == "embedding":
            print(f"API Base: {api_base}")
            print(f"Model: {model}")
        else:
            print(
                f"LLM API Base: {args.llm_api_base or os.getenv('LLM_API_BASE', api_base)}"
            )
            print(
                f"LLM Model: {args.llm_model or os.getenv('LLM_MODEL', 'gpt-4o-mini')}"
            )
        print(f"K values: {args.k}")
        print(f"并发数: {args.concurrency}")
        print(f"Data: {args.data}")
        print(f"MLflow: {mlflow_tracking_uri}")
        print("=" * 60)

        # 加载数据
        data = load_eval_data(args.data)
        print(f"加载了 {len(data)} 条评测数据")

        # 运行评测
        print("\n开始评测...\n")
        start_time = datetime.now()

        results = await run_evaluation_async(
            sorter, data, args.k, concurrency=args.concurrency, verbose=not args.quiet
        )

        end_time = datetime.now()
        elapsed = (end_time - start_time).total_seconds()

        # 输出汇总结果
        print("\n" + "=" * 60)
        print("评测结果汇总")
        print("=" * 60)
        summary = results["summary"]
        print(f"总查询数: {summary['total_queries']}")
        print(f"成功: {summary['successful']}, 失败: {summary['failed']}")
        print(
            f"耗时: {elapsed:.2f}秒 ({summary['total_queries'] / elapsed:.2f} queries/s)"
        )
        print()

        # 记录汇总 metrics 到 MLflow
        mlflow.log_metric("total_queries", summary["total_queries"])
        mlflow.log_metric("successful", summary["successful"])
        mlflow.log_metric("failed", summary["failed"])
        mlflow.log_metric("elapsed_seconds", elapsed)
        mlflow.log_metric(
            "queries_per_second",
            summary["total_queries"] / elapsed if elapsed > 0 else 0,
        )

        for k in args.k:
            print(f"--- K={k} ---")
            recall = summary.get(f"avg_recall@{k}", 0)
            mrr = summary.get(f"avg_mrr@{k}", 0)
            ndcg = summary.get(f"avg_ndcg@{k}", 0)

            print(
                f"  Recall@{k}:  {recall:.4f} (±{summary.get(f'std_recall@{k}', 0):.4f})"
            )
            print(f"  MRR@{k}:     {mrr:.4f} (±{summary.get(f'std_mrr@{k}', 0):.4f})")
            print(f"  NDCG@{k}:    {ndcg:.4f} (±{summary.get(f'std_ndcg@{k}', 0):.4f})")
            print()

            # Log metrics
            mlflow.log_metric(f"recall_at_{k}", recall)
            mlflow.log_metric(f"mrr_at_{k}", mrr)
            mlflow.log_metric(f"ndcg_at_{k}", ndcg)

        # 保存结果
        output_dir = "outputs/embedding_evals"
        output_path = args.output

        if not output_path:
            # 如果未指定输出路径，生成默认文件名并在 outputs/embedding_evals 目录下
            os.makedirs(output_dir, exist_ok=True)
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = os.path.join(
                output_dir, f"eval_results_{sorter_type}_{timestamp_str}.json"
            )
        elif not os.path.dirname(output_path):
            # 如果只提供了文件名，则保存到 outputs/embedding_evals 目录下
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, output_path)
        else:
            # 如果提供了带路径的文件名，确保其父目录存在
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

        output_data = {
            "timestamp": datetime.now().isoformat(),
            "elapsed_seconds": elapsed,
            "config": {
                "sorter_type": sorter_type,
                "sorter_name": sorter.name,
                "api_base": api_base,
                "model": model,
                "k_values": args.k,
                "concurrency": args.concurrency,
                "data_path": args.data,
            },
            **results,
        }
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"详细结果已保存至: {output_path}")

        # 记录 artifact
        try:
            mlflow.log_artifact(output_path)
            print(f"Artifact successfully logged to MLflow: {output_path}")
        except Exception as e:
            print(f"\n[Warning] Failed to log artifact to MLflow: {e}")
            print(
                "To fix this, ensure you have the correct S3/MinIO credentials set in your environment variables:"
            )
            print("  export AWS_ACCESS_KEY_ID=...")
            print("  export AWS_SECRET_ACCESS_KEY=...")
            print("  export MLFLOW_S3_ENDPOINT_URL=...")


def main():
    parser = argparse.ArgumentParser(
        description="Embedding/LLM模型评测工具 (异步并行版本)"
    )
    parser.add_argument(
        "--data",
        type=str,
        default="data/embeddings/llm_generated.json",
        help="评测数据集路径",
    )
    parser.add_argument(
        "--k",
        type=int,
        nargs="+",
        default=[1, 3, 5, 10],
        help="K值列表，如 --k 1 3 5 10",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="结果输出路径 (JSON格式) (默认: outputs/embedding_evals/)",
    )

    # 排序器配置
    parser.add_argument(
        "--sorter",
        type=str,
        default="embedding",
        choices=["embedding", "llm"],
        help="排序器类型: 'embedding' (使用embedding相似度) 或 'llm' (使用LLM排序) (默认: embedding)",
    )

    # Embedding API 配置
    parser.add_argument(
        "--api-base",
        type=str,
        default=None,
        help="Embedding API Base URL (默认从.env读取)",
    )
    parser.add_argument(
        "--api-key", type=str, default=None, help="Embedding API Key (默认从.env读取)"
    )
    parser.add_argument(
        "--model", type=str, default=None, help="Embedding模型名称 (默认从.env读取)"
    )

    # LLM API 配置 (仅用于llm排序器)
    parser.add_argument(
        "--llm-api-base",
        type=str,
        default="https://llm.aboydfd.com",
        help="LLM API Base URL (默认使用LLM_API_BASE环境变量或--api-base)",
    )
    parser.add_argument(
        "--llm-api-key",
        type=str,
        default=None,
        help="LLM API Key (默认使用LLM_API_KEY环境变量或--api-key)",
    )
    parser.add_argument(
        "--llm-model",
        type=str,
        default="openai/minimaxm21",
        help="LLM模型名称 (默认: gpt-4o-mini)",
    )

    # 其他配置
    parser.add_argument(
        "--concurrency", type=int, default=10, help="并发请求数 (默认10)"
    )
    parser.add_argument("--quiet", action="store_true", help="静默模式，不显示进度")

    # 额外功能参数
    parser.add_argument(
        "--extra-params",
        type=str,
        default=None,
        help="额外参数，JSON字典格式字符串，例如 '{\"epochs\": 5}'",
    )
    parser.add_argument(
        "--upload-file",
        type=str,
        default=None,
        help="需要上传到MLflow的额外文件路径",
    )
    parser.add_argument(
        "--no-instruct",
        action="store_true",
        help="是否不添加Instruct指令 (默认添加)",
    )

    args = parser.parse_args()

    # 运行异步主函数
    asyncio.run(async_main(args))


if __name__ == "__main__":
    main()

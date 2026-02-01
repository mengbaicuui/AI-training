## 安装

pip install uv
uv sync

## 配置

拷贝.env.template到.env
修改对应的配置

## 流程

1. 用下面的这个prompt，生成100个sts的评估数据，放置到data/embeddings/llm_generated.json：
    ```我现在在准备汽车维修领域的embedding数据集，能帮忙想一些embedding模型很难处理的case么，至少给我100个，用json list的形式返回。给3个positive，然后每个例子的难负样本要多生成几个起码要3个。```
2. 拿现在的Embedding模型测试一下效果：
    ```
    uv run python embedding_eval.py --sorter embedding
    ```
2. 将所有的pdfs放到data/pdfs目录下
3. 执行一遍`uv run python scripts/process_all.py`（第一次执行只是为了跑通全流程，所以很多步骤的sample_count都是很小的值）
4. 将sample_count调到合适的值，然后重新执行一遍process_all
5. 将生成的outputs/swift_embedding/swift_embedding_merged_instruct.jsonl的数据拿去训练
6. 使用slerp脚本对新旧模型进行合并
7. 用vllm启动基础模型/微调的模型/合并后的模型分别测试一遍性能（改成对应的模型名称，注意，测试结果会放在results下，将results的结果进行重命名，以匹配对应的测试模型）：
    ```
        uv run python scripts/eval/eval_mteb_openai.py \
        --model_name openai/qwen3-embedding-4b-tuned-rack \
        --dataset_path outputs/mteb_eval/
    ```
8. 执行`uv run python scripts/agg_results.py`命令，查看各个模型的性能。


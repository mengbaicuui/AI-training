1. 将所有的pdfs放到data/pdfs目录下
2. 执行一遍process_all（第一次执行只是为了跑通全流程，所以很多步骤的sample_count都是很小的值）
3. 将sample_count调到合适的值，然后重新执行一遍process_all
4. 将生成的outputs/swift_embedding/swift_embedding_merged_instruct.jsonl的数据拿去训练
5. 使用slerp脚本对新旧模型进行合并
6. 用vllm启动基础模型/微调的模型/合并后的模型分别测试一遍性能（改成对应的模型名称，注意，测试结果会放在results下，将results的结果进行重命名，以匹配对应的测试模型）：
    ```
        uv run python scripts/eval/eval_mteb_openai.py \
        --model_name openai/qwen3-embedding-4b-tuned-rack \
        --dataset_path outputs/mteb_eval/
    ```
7. 执行`uv run python scripts/agg_results.py`命令，查看各个模型的性能。
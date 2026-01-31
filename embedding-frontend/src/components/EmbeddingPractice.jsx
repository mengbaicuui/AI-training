import React, { useState } from 'react';

const EmbeddingPractice = () => {
    const [activeStep, setActiveStep] = useState(1);

    const steps = [
        { id: 1, title: '文档准备', icon: '📄' },
        { id: 2, title: 'STS 数据生成', icon: '🤖' },
        { id: 3, title: 'QA 数据生成', icon: '❓' },
        { id: 4, title: '模型训练', icon: '🔥' },
        { id: 5, title: '模型评测', icon: '📊' }
    ];

    const renderStepContent = (stepId) => {
        switch (stepId) {
            case 1:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>1. 文档准备</h3>
                        <p>准备领域相关的文档数据，作为后续训练的基础。</p>

                        <div className="action-card">
                            <h4>📚 目标：下载并解析 PDF 文件</h4>
                            <p>下载 4 个 PDF 文件，并调用 MinerU 的 API 进行直接解析。</p>

                            <div className="code-block-action">
                                <span className="action-label">Action</span>
                                <p>直接调用 <code>pdf_processing.py</code>，结果保存到 <code>data/books/</code></p>
                            </div>

                            <pre className="code-preview">
                                <code>python pdf_processing.py --output_dir data/books/</code>
                            </pre>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>2. STS 数据生成</h3>
                        <p>生成语义文本相似度（Semantic Textual Similarity）数据，特别是难负样本。</p>

                        <div className="action-card">
                            <h4>🧠 目标：生成 Hard Cases</h4>
                            <p>直接调用强大的 LLM 生成数据，然后手动拷贝 JSON 结果（无需使用 API，节省 Token）。</p>

                            <div className="code-block-action">
                                <span className="action-label">Action</span>
                                <p>复制以下 Prompt 调用 LLM：</p>
                            </div>

                            <div className="prompt-display">
                                <p>我现在在准备汽车维修领域的embedding数据集，能帮忙想一些embedding模型很难处理的case么，至少给我100个，用json list的形式返回。给3个positive，然后每个例子的难负样本要多生成几个起码要3个。</p>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>3. QA 数据生成</h3>
                        <p>生成问答对（Query-Answer）数据，用于训练模型的检索能力。</p>

                        <div className="action-card">
                            <h4>🛠️ 步骤 1：数据生成</h4>
                            <p>用 Markdown 文件生成 QA 对，通过生成配置再生成 Query，然后进行过滤。</p>
                            <div className="code-block-action">
                                <span className="action-label">Action</span>
                                <p>调用 <code>qa_generation_v2.py</code></p>
                            </div>
                            <pre className="code-preview">
                                <code>python qa_generation_v2.py</code>
                            </pre>
                        </div>

                        <div className="action-card" style={{ marginTop: '20px' }}>
                            <h4>✂️ 步骤 2：数据划分</h4>
                            <p>将生成的数据划分为训练集（train）和测试集（test）。</p>
                            <div className="code-block-action">
                                <span className="action-label">Action</span>
                                <p>调用 Split 脚本</p>
                            </div>
                            <pre className="code-preview">
                                <code>python split_dataset.py --input data/generated_qa.json</code>
                            </pre>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>4. 模型训练</h3>
                        <p>使用 Swift 框架微调 Embedding 模型。</p>

                        <div className="info-box">
                            <h5>💡 Concept: Channel Loss</h5>
                            <p>Channel Loss (InfoNCE) 是一种对比学习损失函数，旨在拉近正样本对的距离，推远负样本对的距离。训练时通过调整 Batch Size 和 Temperature 参数来优化。</p>
                        </div>

                        <div className="action-card">
                            <h4>🚀 训练命令</h4>
                            <p>根据显存调整以下参数（如 <code>batch_size</code>, <code>lora_rank</code>）。</p>

                            <pre className="code-preview" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <code>export MAX_POSITIVE_SAMPLES=3
                                    export MAX_NEGATIVE_SAMPLES=8
                                    nproc_per_node=5
                                    NPROC_PER_NODE=$nproc_per_node \
                                    swift sft \
                                    --model {'${model_path_prefix}'}/Qwen3-Embedding-4B \
                                    --task_type embedding \
                                    --model_type qwen3_emb \
                                    --train_type lora \
                                    --lora_rank 64 # 可能需要降低 \
                                    --lora_alpha 32 \
                                    --dataset ./swift_sts_cleaned_instruct.jsonl ./swift_qa_instruct.jsonl \
                                    --adam_beta1 0.9 \
                                    --adam_beta2 0.98 \
                                    --adam_epsilon 1e-6 \
                                    --lr_scheduler_type linear \
                                    --split_dataset_ratio 0.05 \
                                    --eval_strategy steps \
                                    --output_dir output \
                                    --eval_steps 10 \
                                    --num_train_epochs 5 \
                                    --save_steps 10 \
                                    --per_device_train_batch_size 4 # 需要降低 \
                                    --per_device_eval_batch_size 2 \
                                    --gradient_accumulation_steps 8 # 相应提升 \
                                    --torch_dtype float16 \
                                    --warmup_ratio 0.01 \
                                    --weight_decay 1e-5 \
                                    --learning_rate 1e-4 \
                                    --loss_type infonce \
                                    --label_names labels \
                                    --dataloader_drop_last true \
                                    --deepspeed zero3</code>
                            </pre>
                        </div>

                        <div className="action-card" style={{ marginTop: '20px' }}>
                            <h4>📈 监控训练 (TensorBoard)</h4>
                            <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                                <li><code>cd $runs</code></li>
                                <li><code>tensorboard --logdir "./" --host 0.0.0.0</code></li>
                                <li>打开网页查看</li>
                            </ol>
                            <div className="image-placeholder" style={{
                                height: '200px',
                                background: 'var(--bg-tertiary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '15px',
                                border: '2px dashed var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-muted)'
                            }}>
                                [训练曲线截图占位符: 一个好的 loss 下降曲线]
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>5. 模型评测</h3>
                        <p>对训练好的模型进行全面评估。</p>

                        <div className="action-card">
                            <h4>📊 MLflow记录</h4>
                            <p>评测时将结果记录在 MLflow，记录模型路径、数据集路径、评测指标及每条数据的详细评测内容。</p>
                            <div className="image-placeholder" style={{
                                height: '150px',
                                background: 'var(--bg-tertiary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '15px',
                                border: '2px dashed var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-muted)'
                            }}>
                                [评测集表格 Placeholder]
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="embedding-tab fade-in">
            <div className="embedding-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '40px' }}>

                {/* Left Sidebar: Steps */}
                <div style={{ width: '250px', flexShrink: 0 }}>
                    <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>实战流程</h2>
                    <div className="steps-container">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`step-item ${activeStep === step.id ? 'active' : ''}`}
                                onClick={() => setActiveStep(step.id)}
                                style={{
                                    padding: '15px 20px',
                                    marginBottom: '10px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    background: activeStep === step.id ? 'var(--accent-embedding)' : 'var(--bg-card)',
                                    color: activeStep === step.id ? '#fff' : 'var(--text-secondary)',
                                    border: activeStep === step.id ? 'none' : '1px solid var(--border-color)',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontWeight: activeStep === step.id ? '600' : '400'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                                <span>{step.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Content Area */}
                <div style={{ flex: 1 }}>
                    {renderStepContent(activeStep)}
                </div>
            </div>

            <style>{`
                .action-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 24px;
                    margin-top: 15px;
                }
                .action-card h4 {
                    margin-top: 0;
                    margin-bottom: 15px;
                    color: var(--text-primary);
                }
                .code-block-action {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                    background: rgba(34, 197, 94, 0.1);
                    padding: 8px 12px;
                    border-radius: 6px;
                    border-left: 4px solid #22c55e;
                }
                .action-label {
                    background: #22c55e;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .code-preview {
                    background: var(--bg-tertiary);
                    padding: 15px;
                    border-radius: 8px;
                    overflow-x: auto;
                    font-family: monospace;
                    font-size: 0.9rem;
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }
                .prompt-display {
                    background: var(--bg-tertiary);
                    padding: 20px;
                    border-radius: 8px;
                    font-style: italic;
                    color: var(--text-secondary);
                    border-left: 4px solid var(--accent-embedding);
                }
                .info-box {
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .info-box h5 {
                    margin: 0 0 5px 0;
                    color: #3b82f6;
                }
                .info-box p {
                    margin: 0;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
};

export default EmbeddingPractice;

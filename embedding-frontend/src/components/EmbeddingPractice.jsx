import React, { useState } from 'react';

const EmbeddingPractice = () => {
    const [activeStep, setActiveStep] = useState(1);

    const steps = [
        { id: 1, title: '文档处理 (PDF)', icon: '📄' },
        { id: 2, title: '数据合成 (LLM)', icon: '🤖' },
        { id: 3, title: '数据过滤 (Cleaning)', icon: '🧹' },
        { id: 4, title: '格式转换 (Formatting)', icon: '🔄' },
        { id: 5, title: '数据合并 (Merging)', icon: '🔗' },
        { id: 6, title: '测试集准备 (Test)', icon: '🧪' },
        { id: 7, title: '模型训练 (Training)', icon: '🔥' },
        { id: 8, title: '模型合并 (Slerp)', icon: '🧬' },
        { id: 9, title: '全流程评估 (Eval)', icon: '📊' }
    ];

    const renderStepContent = (stepId) => {
        switch (stepId) {
            case 1:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>1. 文档处理 (Document Processing)</h3>
                        <p>第一步是将原始的非结构化数据（如PDF）转换为机器可读的Markdown格式。</p>

                        <div className="action-card">
                            <h4>🎯 目标</h4>
                            <p>使用MinerU工具解析PDF文件，提取纯文本与表格信息，过滤掉页眉页脚等噪音。</p>

                            <div className="info-box">
                                <h5>💡 Methodology: MinerU Parser</h5>
                                <p>MinerU 是一个高效的PDF解析库，它能将PDF布局还原并转换为Markdown。这一步至关重要，因为高质量的原始文本是生成高质量QA对的基础。</p>
                            </div>

                            <div className="code-block-action">
                                <span className="action-label">Action</span>
                                <p>将PDF放入 <code>data/pdfs</code> 目录，脚本会自动处理。</p>
                            </div>
                            <pre className="code-preview">
                                <code># 对应的Python逻辑
                                    from scripts.process_mineru import process_pdfs

                                    # 自动扫描 data/pdfs 目录并将解析结果保存至 data/books
                                    process_pdfs()</code>
                            </pre>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>2. 数据合成 (Data Synthesis)</h3>
                        <p>利用大语言模型（LLM）根据文档内容生成用于训练的QA对和STS（语义相似度）数据。</p>

                        <div className="action-card">
                            <h4>🧠 任务一：STS 数据生成 (Hard Negatives)</h4>
                            <p>生成语义相似度数据，重点在于挖掘“难负样本”（Hard Negatives）——即字面相似但含义不同的句子，这对提升Embedding模型的区分能力最关键。</p>

                            <div className="info-box" style={{ background: 'rgba(255, 237, 213, 0.3)', borderColor: 'rgba(251, 146, 60, 0.3)' }}>
                                <h5 style={{ color: '#ea580c' }}>📜 Prompt Template (Chinese)</h5>
                                <p style={{ marginBottom: '10px' }}>这是用于生成 STS 数据的 Prompt，要求模型扮演汽车维修专家，生成正例（同义重写）和难负例（字面相似但语义无关）。</p>
                                <pre style={{
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit',
                                    fontSize: '0.85rem',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(0,0,0,0.05)'
                                }}>
                                    {`你是一个汽车维修领域的数据合成专家。请阅读以下文本片段：
---
{chunk_text}
---

任务：
1. "origin"：从文本中提取多个严格与**汽车维修/保养**相关的代表性句子（保留原文）。
2. "positive"：根据提取的句子，生成一个语义相近的正例（Rewriting/Paraphrasing）。要求：
    1. 句子A和句子B必须表达相同的核心意图。
    2. 避免简单的同义词替换，应进行句式重组。
    3. 如果可以用汽车维修领域的黑话、专业术语来替换其中的某些词，务必使用这些独有的词
3. "hard_negative"：生成多个“难负例”句子。
    - 要求：
        1. **语义距离较远**（最好不属于汽车领域）。
        2. 必须包含查询中的大部分关键词，使其在表面上看起来非常相关。
        3. 它应该是一个相关但不正确的主题、另一个实体、错误的时间段，或者是相反的观点。
        4. 长度与正样本相当。
        5. 风格应模仿正样本的语调。
    - 关键：应该具有相似的句子结构、长度或包含一些中性关键词，以模拟困难的检索情况（例如：字面匹配但含义不同）。

请严格输出 JSON 列表格式...`}
                                </pre>
                            </div>

                            <pre className="code-preview">
                                <code># 对应的Python逻辑
                                    from data_synthesis.sts_sample_generation import run_sts_generation

                                    # 生成正负样本对，默认 sample_count=500
                                    await run_sts_generation(
                                    "./data/books",
                                    "outputs/data_synthesis/sts_dataset.json",
                                    sample_count=500
                                    )</code>
                            </pre>
                        </div>

                        <div className="action-card" style={{ marginTop: '20px' }}>
                            <h4>❓ 任务二：QA 问答对生成</h4>
                            <p>根据文档生成 Query-Answer 对，用于训练模型在非对称搜索场景下的能力。</p>

                            <div className="info-box" style={{ background: 'rgba(219, 234, 254, 0.3)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                                <h5 style={{ color: '#2563eb' }}>📜 Prompt Template (Chinese Translated)</h5>
                                <p style={{ marginBottom: '10px' }}>这是 QA 生成 Prompt 的中文翻译版。它采用“角色扮演”策略，让模型根据特定角色（用户画像）和难度要求来提问。</p>
                                <pre style={{
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit',
                                    fontSize: '0.85rem',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(0,0,0,0.05)'
                                }}>
                                    {`给定 **角色**、**段落** 和 **要求**，请从 **角色** 的视角生成一个能够满足 **要求** 并可用于检索该 **段落** 的查询。请以 JSON 格式返回结果。

示例...

现在，根据用户提供的 **角色**、**段落** 和 **要求** 生成 **输出**：
- **段落** 语言为 {corpus_language}
- **角色** 和 **要求** 为英语
请确保仅生成 JSON 输出，键为英语，值为 {queries_language}。

注意：当语言为中文时，仅在类型为关键词(keyword)时用空格分词。

**角色**
{character}
**段落**
{passage}
**要求**
- 类型: {query_type};
- 难度: {query_difficulty};
- 长度: 生成的句子长度应为 {query_length} 个词; 
- 语言: 结果生成的语言应为 {query_language};`}
                                </pre>
                            </div>

                            <pre className="code-preview">
                                <code># 对应的Python逻辑
                                    from data_synthesis.qa_generation_v2 import build_qa_v2_dataset

                                    # 基于Markdown内容生成QA对
                                    await build_qa_v2_dataset(sample_count=500)</code>
                            </pre>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>3. 数据过滤 (Data Filtering)</h3>
                        <p>LLM生成的数据可能存在幻觉或低质量内容，必须进行严格过滤。</p>

                        <div className="action-card">
                            <h4>🧹 目标</h4>
                            <p>清洗生成的STS和QA数据，移除格式错误或逻辑不通的样本。</p>

                            <div className="info-box">
                                <h5>💡 Methodology: Rule-based & Model-based Filtering</h5>
                                <p>使用规则（如长度检查）和模型打分来筛选数据。保留下来的数据必须包含完整的 query, positive, negative 字段。</p>
                            </div>

                            <div className="code-block-action">
                                <span className="action-label">Action</span>
                                <p>执行数据过滤逻辑</p>
                            </div>
                            <pre className="code-preview">
                                <code># 对应的Python逻辑
                                    from data_synthesis.sts_data_filter import run_data_filter

                                    # 过滤掉不符合要求的数据，输出到 cleaned 目录
                                    await run_data_filter()</code>
                            </pre>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>4. 格式转换 (Format Conversion)</h3>
                        <p>将清洗后的数据转换为 Swift 框架支持的训练格式，并合并开源数据集。</p>

                        <div className="action-card">
                            <h4>🔄 步骤详解</h4>
                            <ol>
                                <li><strong>开源数据转换</strong>: 将 MTEB 通用领域数据转换为 Swift 格式。</li>
                                <li><strong>私有数据转换</strong>: 将生成的 STS/QA 数据转换为 Swift 格式。</li>
                                <li><strong>数据切分</strong>: 自动划分训练集 (Train) 和 验证集 (Eval)。</li>
                            </ol>

                            <pre className="code-preview">
                                <code># 对应的Python逻辑
                                    from scripts.convert_common_domain_mteb_to_swift import main_async
                                    from scripts.convert_to_swift_format import main as convert_to_swift_format

                                    # 1. 转换通用MTEB数据
                                    await convert_common_domain_mteb_to_swift(max_count=500)

                                    # 2. 转换私有数据并切分 (split=True)
                                    convert_to_swift_format(split=True)</code>
                            </pre>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>5. 数据合并 (Merging & Cleaning)</h3>
                        <p>将所有训练数据合并为一个 master 文件，供训练脚本读取。</p>

                        <div className="action-card">
                            <h4>🔗 目标</h4>
                            <p>生成最终的训练文件 <code>swift_embedding_merged_instruct.jsonl</code>。</p>

                            <pre className="code-preview">
                                <code># 对应的Python逻辑
                                    from scripts.merge_train_swift_embedding import main as merge_train
                                    from scripts.clean_jsonl import clean_jsonl

                                    # 1. 合并所有以 'instruct' 结尾的训练数据
                                    merge_train()

                                    # 2. 最终清洗，确保JSON格式无误
                                    # 扫描 outputs/swift_embedding 下的文件并进行校验
                                    clean_jsonl_data()</code>
                            </pre>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>6. 测试集准备 (Test Set Prep)</h3>
                        <p>准备用于 MTEB 评测的标准测试集。</p>

                        <div className="action-card">
                            <h4>🧪 目标</h4>
                            <p>将预留的测试数据转换为 MTEB 评测格式，确保可以用统一的 pipeline 进行评估。</p>

                            <pre className="code-preview">
                                <code># 对应的Python逻辑
                                    from scripts.eval.convert_test_swift_format_to_mteb import main as convert_test

                                    # 将测试数据转换为 MTEB 格式
                                    convert_test()</code>
                            </pre>
                        </div>
                    </div>
                );
            case 7:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>7. 模型训练 (Model Training)</h3>
                        <p>使用 Swift 框架启动微调任务。</p>

                        <div className="action-card">
                            <h4>🔥 训练命令</h4>
                            <p>使用 LoRA 进行微调，采用 InfoNCE Loss。</p>
                            <div className="info-box">
                                <h5>💡 Methodology: InfoNCE Loss</h5>
                                <p>InfoNCE 损失函数通过最大化正样本对的互信息，同时最小化与负样本的互信息，从而学习到更好的向量表示。</p>
                            </div>

                            <pre className="code-preview">
                                <code># 在命令行执行的Shell脚本示例 (参数需根据硬件调整)
                                    swift sft \
                                    --model Qwen/Qwen2.5-7B-Instruct \
                                    --dataset outputs/swift_embedding/swift_embedding_merged_instruct.jsonl \
                                    --train_type lora \
                                    --loss_type infonce \
                                    --batch_size 2 \
                                    --learning_rate 1e-4 \
                                    --output_dir output</code>
                            </pre>
                        </div>
                    </div>
                );
            case 8:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>8. 模型合并 (Slerp Merge)</h3>
                        <p>使用 Slerp (Spherical Linear Interpolation) 算法合并模型。</p>

                        <div className="action-card">
                            <h4>🧬 目标</h4>
                            <p>将微调后的 LoRA 权重或全量权重与原始模型进行融合，以保留基座模型的通用能力，同时获得微调后的领域能力。</p>

                            <div className="info-box">
                                <h5>💡 Methodology: Slerp</h5>
                                <p>相比简单的平均（Average），Slerp 在高维球面上进行插值，能更好地保持向量空间的几何特性，通常能获得比单纯微调更好的泛化性能。</p>
                            </div>

                            <pre className="code-preview">
                                <code># 执行 Slerp 合并脚本
                                    uv run python scripts/slerp_merge.py</code>
                            </pre>
                        </div>
                    </div>
                );
            case 9:
                return (
                    <div className="practice-step-content fade-in">
                        <h3>9. 全流程评估 (Evaluation)</h3>
                        <p>使用 MTEB 框架对合并后的模型进行最终评分。</p>

                        <div className="action-card">
                            <h4>📊 步骤详解</h4>
                            <ol>
                                <li>使用 <code>eval_mteb_openai.py</code> 跑分（支持自定义模型）。</li>
                                <li>使用 <code>agg_results.py</code> 聚合所有模型的成绩进行对比。</li>
                            </ol>

                            <pre className="code-preview">
                                <code># 1. 运行评测
                                    uv run python scripts/eval/eval_mteb_openai.py \
                                    --model_name output/your_merged_model_path \
                                    --dataset_path outputs/mteb_eval/

                                    # 2. 聚合结果
                                    uv run python scripts/agg_results.py</code>
                            </pre>
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
                <div style={{ width: '280px', flexShrink: 0 }}>
                    <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>实战全流程</h2>
                    <div className="steps-container">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`step-item ${activeStep === step.id ? 'active' : ''}`}
                                onClick={() => setActiveStep(step.id)}
                                style={{
                                    padding: '12px 16px',
                                    marginBottom: '8px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    background: activeStep === step.id ? 'var(--accent-embedding)' : 'var(--bg-card)',
                                    color: activeStep === step.id ? '#fff' : 'var(--text-secondary)',
                                    border: activeStep === step.id ? 'none' : '1px solid var(--border-color)',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.95rem',
                                    fontWeight: activeStep === step.id ? '600' : '400'
                                }}
                            >
                                <span style={{ fontSize: '1.1rem' }}>{step.icon}</span>
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
                    font-size: 1.1rem;
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
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.85rem;
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
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
                    font-size: 0.95rem;
                }
                .info-box p {
                    margin: 0;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }
                .practice-step-content h3 {
                    margin-bottom: 10px;
                    color: var(--text-primary);
                }
                .practice-step-content > p {
                    color: var(--text-secondary);
                    margin-bottom: 20px;
                }
                .steps-container {
                    max-height: calc(100vh - 200px);
                    overflow-y: auto;
                }
            `}</style>
        </div>
    );
};

export default EmbeddingPractice;

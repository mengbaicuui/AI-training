import React from 'react';

const Qwen3DataPipeline = () => {
    return (
        <div className="fade-in">
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: 'var(--accent-warning)' }}>
                🧪 数据合成流水线 (Data Synthesis Pipeline)
            </h3>

            <div style={{ marginBottom: '30px', background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                    Qwen3-Embedding 的核心竞争力在于其庞大且高质量的<b>合成数据</b>。
                    阿里团队<b>放弃了公开的弱监督数据（因为质量参差不齐）</b>，转而<b>改用大规模的合成数据</b>。
                    通过构建自动化的数据合成与清洗流水线，生成了覆盖 93 种语言的海量训练对。
                </p>
                <div style={{
                    textAlign: 'center',
                    background: '#fff',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                }}>
                    <img
                        src="/src/assets/data-source.png"
                        alt="Data Source Composition"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
                        图示：数据来源构成对比
                    </p>
                </div>
            </div>

            {/* Pipeline Visualizer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Phase 1: Generation */}
                <div className="pipeline-step fade-in" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--bg-card)',
                    padding: '20px',
                    borderRadius: '12px',
                    borderLeft: '5px solid #3b82f6',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ flexShrink: 0, fontSize: '2rem', marginRight: '20px', opacity: 0.8 }}>🧬</div>
                        <div>
                            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Phase 1: 多样性生成 (Synthesis)</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                利用 <b>Qwen3-32B Instruct</b> 模型，通过精心设计的 Prompt，生成多样化的 Query-Document 对。
                                涵盖单语、跨语言检索，以及分类、聚类等多种任务类型。
                            </p>
                        </div>
                    </div>

                    {/* Step 1: Configuration Generation Prompt */}
                    <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem', color: '#e2e8f0', fontFamily: 'monospace', marginBottom: '15px' }}>
                        <div style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '0.8rem' }}>// Step 1: Configuration Generation Prompt (Selects Character & Difficulty)</div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {`给定一个段落（Passage）和人物（Character），从三个字段中选择合适的选项：人物（Character）、问题类型（Question_Type）、难度（Difficulty），并以 JSON 格式返回输出。

首先，从候选中选择对该段落可能感兴趣的人物（Character）。然后选择该人物可能针对该段落提出的问题类型（Question_Type）；最后，根据段落、人物和问题类型选择可能的问题难度（Difficulty）。

人物（Character）：由输入给出

问题类型（Question_Type）：
keywords（关键词）：...
acquire_knowledge（获取知识）：...
summary（摘要）：...
yes_or_no（是非题）：...
background（背景）：...

难度（Difficulty）：
high_school（高中）：...
university（大学）：...
phd（博士）：...

以下是一些示例 <Example1> <Example2> <Example3>

现在，根据用户提供的段落（Passage）和人物（Character）生成输出，段落将为 {language} 语言，人物将为英文。确保仅生成内容为英文的 JSON 输出。

Passage: {passage} Character: {character}`}
                        </pre>
                    </div>

                    <div style={{ textAlign: 'center', color: '#64748b', marginBottom: '15px' }}>↓</div>

                    {/* Step 2: Query Generation Prompt */}
                    <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem', color: '#e2e8f0', fontFamily: 'monospace' }}>
                        <div style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '0.8rem' }}>// Step 2: Query Generation Prompt (Uses Config from Step 1)</div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {`给定一个**人物（Character）**、**段落（Passage）** 和**要求（Requirement）**，从该人物的视角生成一个满足该要求且可用于检索该段落的查询（query）。请以JSON格式返回结果。  

以下是一个示例：
<example> 

现在，根据用户提供的**人物（Character）**、**段落（Passage）** 和**要求（Requirement）** 生成**输出（output）**，其中**段落（Passage）** 为{corpus_language}语言，**人物（Character）** 和**要求（Requirement）** 为英文。 
￫ 确保仅生成 JSON 输出，其中键（key）为英文，值（value）采用{queries_language}语言。

**人物（Character）**
{character}
**段落（Passage）**
{passage}

**要求（Requirment）**
- 类型（Type）：{type}；(关键词keyword, 事实性factual, 摘要summary, 判断judgment等)
- 难度（Difficulty）：{difficulty}；
- 长度（Length）：生成句子的长度应为{length}个单词；
- 语言（Languange）：生成结果的语言应为{language}语言；`}
                        </pre>
                    </div>
                </div>

                {/* Arrow */}
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.5rem', lineHeight: '1' }}>↓</div>

                {/* Phase 2: Filtering */}
                <div className="pipeline-step fade-in" style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-card)',
                    padding: '20px',
                    borderRadius: '12px',
                    borderLeft: '5px solid #f59e0b',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ flexShrink: 0, fontSize: '2rem', marginRight: '20px', opacity: 0.8 }}>🔍</div>
                    <div>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Phase 2: 质量过滤 (Filtering)</h4>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <p style={{ margin: '0 0 10px 0' }}>
                                传统的挖掘方法（如简单的 Top-K）容易引入“假负样本”（False Negatives）。为了解决这个问题，利用<b>教师模型（Teacher Model）</b>对正样本的评分来动态设定负样本的选取阈值。
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <h5 style={{ margin: '0 0 5px 0', color: '#d97706', fontSize: '0.95rem' }}>Top-K MarginPos</h5>
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}>基于绝对边际的阈值筛选</p>
                                    <div style={{ marginTop: '8px', padding: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#b45309' }}>
                                        Threshold = Score<sub>pos</sub> - Margin
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <h5 style={{ margin: '0 0 5px 0', color: '#d97706', fontSize: '0.95rem' }}>Top-K PercPos</h5>
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}>基于百分比的阈值筛选 (效果最佳)</p>
                                    <div style={{ marginTop: '8px', padding: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#b45309' }}>
                                        Threshold = Score<sub>pos</sub> * Percentage
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>生成流程：</div>
                                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <li><b>教师打分</b>：使用 Qwen3-Embedding-8B 对查询和候选段落评分。</li>
                                    <li><b>计算阈值</b>：根据 MarginPos 或 PercPos 计算动态“负样本上限”。</li>
                                    <li><b>过滤筛选</b>：剔除得分高于阈值的段落（避免假负样本）。</li>
                                    <li><b>LLM终选选</b>：用LLM再剔除一遍的假的负样本。</li>
                                    <li><b>最终产出</b>：剩余段落作为高质量难负样本用于训练。</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arrow */}
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.5rem', lineHeight: '1' }}>↓</div>

                {/* Phase 3: Training */}
                <div className="pipeline-step fade-in" style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-card)',
                    padding: '20px',
                    borderRadius: '12px',
                    borderLeft: '5px solid #10b981',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ flexShrink: 0, fontSize: '2rem', marginRight: '20px', opacity: 0.8 }}>🚀</div>
                    <div>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Phase 3: 多阶段训练 (Multi-stage Training)</h4>

                        {/* Moved from Training Tab */}
                        <div style={{ marginBottom: '15px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '15px' }}>
                                Qwen3-Embedding 的训练包含三个核心阶段：
                            </p>
                            <div style={{ textAlign: 'center' }}>
                                <img
                                    src="/src/assets/training-stage.png"
                                    alt="Qwen3 Training Stages"
                                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', fontStyle: 'italic' }}>
                                    图示：Qwen3-Embedding 的分阶段训练流程
                                </p>
                            </div>
                        </div>

                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            具体包含以下三步：
                            <br />
                            1. <b>弱监督预训练 (Weakly Supervised)</b>: 亿级数据，学习通用语义。
                            <br />
                            2. <b>监督微调 (Supervised Fine-tuning)</b>: 千万级高质量合成数据，强化指令跟随。
                            <br />
                            3. <b>模型融合 </b>: 提升多任务能力。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Qwen3DataPipeline;

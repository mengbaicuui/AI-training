import React, { useState } from 'react';
import embeddingArch from '../assets/embedding.png';
import rerankingArch from '../assets/reranking.png';

const Qwen3Architecture = () => {
    const [query, setQuery] = useState("查找关于量子物理的论文");
    const [instruction, setInstruction] = useState("Given a search query, retrieve relevant scientific papers:");

    // Reranking demo state
    const [rerankQuery, setRerankQuery] = useState("什么是深度学习？");
    const [rerankDoc, setRerankDoc] = useState("深度学习是机器学习的一个子集，模仿人类大脑的运作方式...");
    const [rerankScore, setRerankScore] = useState(null);

    const calculateRerankScore = () => {
        // Simulate score calculation
        const randomScore = (0.85 + Math.random() * 0.14).toFixed(4);
        setRerankScore(randomScore);
    };

    return (
        <div className="fade-in">
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: 'var(--accent-embedding)' }}>
                🏗️ 模型架构 (Model Architecture)
            </h3>

            {/* Introduction */}
            <div style={{ marginBottom: '30px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <p>
                    Qwen3-Embedding 基于 Decoder-only 的 Qwen3 LLM 架构构建。与传统的 BERT-based Encoder 模型不同，
                    Decoder-only 架构能够更好地利用大规模预训练知识，并支持更长的上下文窗口（最大可达 32k）。
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>

                {/* 1. Embedding Model & Input Format */}
                <div className="metric-card" style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        1. Qwen3-Embedding
                    </h4>

                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        <li><b>基座</b>: Qwen3 (0.5B / 4B / 8B / 32B)</li>
                        <li><b>池化</b>: 仅仅使用最后一个 token <code>[EOS]</code> 的向量作为句向量。</li>
                        <li><b>特点</b>: 必须使用指令（Instructions）来区分查询（Query）和文档（Document）。</li>
                    </ul>

                    {/* Embedding Architecture Image */}
                    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                        <img
                            src={embeddingArch}
                            alt="Qwen3 Embedding Architecture"
                            style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    {/* Interactive Input Visualizer */}
                    <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>🛠️ 输入格式可视化 (Input Visualizer)</h5>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Instruction (Task Definition)</label>
                                <input
                                    type="text"
                                    value={instruction}
                                    onChange={(e) => setInstruction(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Query / Text</label>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>最终模型输入 (Final Input to LLM):</div>
                            <div style={{
                                fontFamily: 'monospace',
                                background: '#1e293b',
                                color: '#e2e8f0',
                                padding: '12px',
                                borderRadius: '6px',
                                wordBreak: 'break-all'
                            }}>
                                <span style={{ color: '#fb923c' }}>{instruction}</span>
                                <span style={{ color: '#fff' }}> </span>
                                <span style={{ color: '#60a5fa' }}>{query}</span>
                                <span style={{ color: '#a78bfa', fontWeight: 'bold' }}> [EOS]</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Reranking Model Logic */}
                <div className="metric-card" style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        2. Qwen3-Reranking
                    </h4>

                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        <li><b>机制</b>: Point-wise Reranking</li>
                        <li><b>输入</b>: Query + Document</li>
                        <li><b>输出</b>: 计算模型输出 "yes" 和 "no" token 的 logits 差异。</li>
                    </ul>

                    {/* Reranking Architecture Image */}
                    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                        <img
                            src={rerankingArch}
                            alt="Qwen3 Reranking Architecture"
                            style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    {/* Interactive Reranking Demo */}
                    <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>🧮 判别逻辑演示 (Scoring Logic)</h5>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                            <input
                                type="text"
                                placeholder="Query..."
                                value={rerankQuery}
                                onChange={(e) => setRerankQuery(e.target.value)}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                            />
                            <textarea
                                value={rerankDoc}
                                onChange={(e) => setRerankDoc(e.target.value)}
                                rows={2}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'none' }}
                            />
                        </div>

                        <button
                            onClick={calculateRerankScore}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: 'var(--accent-embedding)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Compute Relevance Score
                        </button>

                        {rerankScore && (
                            <div className="fade-in" style={{ marginTop: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Prediction: Is this document relevant?</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>Logic: Softmax(logit("yes"))</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-embedding)' }}>{rerankScore}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>


        </div >
    );
};

export default Qwen3Architecture;

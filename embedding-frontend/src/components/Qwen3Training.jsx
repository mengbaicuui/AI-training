import React, { useState } from 'react';

const Qwen3Training = () => {
    // MRL visualization state
    const [activeDim, setActiveDim] = useState(4096);
    const dimensions = [4096, 1024, 768, 512, 256];

    // Import image (assuming Vite/Webpack handles assets in src/assets)
    // Note: In a real project, we would import this at the top with other imports.
    // However, since I am editing inside the component, I'll use the path directly in img src if valid,
    // or assume it's imported.
    // Actually, I should check if I can add the import statement.
    // Since I can only replace a contiguous block, I will add the image below the description.

    // Sample vector data representation
    const totalCells = 64; // Visual simplification
    const getActiveCells = (dim) => {
        const ratio = dim / 4096;
        return Math.floor(totalCells * ratio);
    };

    return (
        <div className="fade-in">
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: 'var(--accent-success)' }}>
                ⚙️ 训练策略 (Training Strategy)
            </h3>



            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>

                {/* 1. Loss Functions */}
                <div className="metric-card" style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '1.2rem', margin: '0 0 20px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        1. 损失函数 (Loss Functions)
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div>
                            <h5 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>InfoNCE Loss</h5>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                标准的对比学习损失函数。在训练批次内，将所有非配对的文档视为负样本 (In-batch negatives)，同时每个查询还显式配备了 8 个难负样本 (Hard Negatives)。
                            </p>
                        </div>
                        <div>
                            <h5 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>MRL Loss (Matryoshka)</h5>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                套娃 (Matryoshka) 表示学习。强制模型的前 k 维向量也包含完整的语义信息。
                                <br />
                                <b>优势：</b> 允许用户根据精度和速度需求，灵活截取向量的前 N 维使用，无需重新训练。
                            </p>
                        </div>
                    </div>

                    {/* Interactive MRL Visualizer */}
                    <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h5 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🪆 MRL 弹性向量可视化 (Matryoshka Visualizer)
                            <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>(点击下方维度按钮尝试截断)</span>
                        </h5>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            {dimensions.map(dim => (
                                <button
                                    key={dim}
                                    onClick={() => setActiveDim(dim)}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        border: activeDim === dim ? 'none' : '1px solid var(--border-color)',
                                        background: activeDim === dim ? 'var(--accent-success)' : 'var(--bg-card)',
                                        color: activeDim === dim ? '#fff' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {dim} dim
                                </button>
                            ))}
                        </div>

                        {/* Vector Bar Visualization */}
                        <div style={{ position: 'relative', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', display: 'flex' }}>
                            {/* Active part */}
                            <div style={{
                                width: `${(activeDim / 4096) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #10b981, #34d399)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                transition: 'width 0.3s ease-in-out',
                                boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
                            }}>
                                {activeDim} 维度有效
                            </div>
                            {/* Inactive part */}
                            <div style={{
                                flex: 1,
                                height: '100%',
                                background: '#cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8',
                                fontSize: '0.8rem'
                            }}>
                                被截断丢弃
                            </div>
                        </div>

                        <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            📝 <b>效果说明：</b> 即使截断到 <b>{activeDim}</b> 维，Qwen3 依然能保持约 <b>{activeDim == 4096 ? '100%' : activeDim >= 1024 ? '98%' : activeDim >= 768 ? '96%' : activeDim >= 512 ? '94%' : '93%'}</b> 的检索性能，但存储空间减少了 <b>{Math.round((1 - activeDim / 4096) * 100)}%</b>。
                        </div>
                    </div>
                </div>

                {/* 2. LoRA Fine-tuning */}
                <div className="metric-card" style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        2. 高效微调 (LoRA)
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        不同于全量参数微调，Qwen3-Embedding 使用 <b>LoRA (Low-Rank Adaptation)</b> 技术。
                        它冻结了预训练模型的权重，仅训练插入在每一层的小型低秩矩阵。
                        <br />
                        <b>优点：</b> 极大降低了显存占用（VRAM），使得在消费级显卡上微调 7B+ 模型成为可能，同时避免了灾难性遗忘。
                    </p>
                </div>

                {/* 3. Training Hyperparameters */}
                <div className="metric-card" style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '1.2rem', margin: '0 0 20px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        3. 训练超参数 (Hyperparameters)
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', color: 'var(--text-primary)', borderRadius: '6px 0 0 6px' }}>Hyper-param</th>
                                    <th style={{ padding: '12px', color: 'var(--text-primary)', borderRadius: '0 6px 6px 0' }}>Value (Embedding)</th>
                                </tr>
                            </thead>
                            <tbody style={{ color: 'var(--text-secondary)' }}>
                                {[
                                    ['Learning Rate Decay', 'Linear'],
                                    ['Adam ε', '1e-6'],
                                    ['Adam β₁', '0.9'],
                                    ['Adam β₂', '0.98'],
                                    ['Gradient Clipping', '0.0'],
                                    ['Precision', 'BF16'],
                                    ['Weight Decay', '1e-5'],
                                    ['Peak Learning Rate', '1e-4'],
                                    ['Warm-up Ratio', '0.01'],
                                    ['Lora alpha', '32'],
                                    ['Lora rank', '64'],
                                    ['Hard negative sample', '8/16']
                                ].map(([param, value], index) => (
                                    <tr key={param} style={{ borderBottom: index !== 11 ? '1px solid var(--border-color)' : 'none' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: '500' }}>{param}</td>
                                        <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Qwen3Training;

import React, { useState } from 'react';
import Qwen3Architecture from './Qwen3Architecture';
import Qwen3Training from './Qwen3Training';
import Qwen3DataPipeline from './Qwen3DataPipeline';

const Qwen3EmbeddingTab = () => {
    const [subTab, setSubTab] = useState('overview');

    const renderSubTabContent = () => {
        switch (subTab) {
            case 'architecture':
                return <Qwen3Architecture />;
            case 'training':
                return <Qwen3Training />;
            case 'data':
                return <Qwen3DataPipeline />;
            case 'overview':
            default:
                return (
                    <div className="fade-in">
                        <div className="content-text" style={{ marginBottom: '32px' }}>
                            <p>
                                阿里巴巴发布的 <b>Qwen3-Embedding</b> 是新一代开源向量模型，基于 Qwen3 架构，在多语言检索和 Reranking 任务上表现卓越。
                                本教程将深度剖析其技术细节。
                            </p>
                            <p>
                                请点击上方导航栏，探索其<b>模型架构</b>、独创的<b>训练策略</b>以及核心的<b>数据合成流水线</b>。
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '40px' }}>
                            <div className="metric-card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => setSubTab('architecture')}>
                                <h4 style={{ color: 'var(--accent-embedding)' }}>🏗️ 模型架构</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Decoder-only 架构、EOS 向量池化、Point-wise Reranking 机制。</p>
                            </div>
                            <div className="metric-card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => setSubTab('training')}>
                                <h4 style={{ color: 'var(--accent-success)' }}>⚙️ 训练策略</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>InfoNCE 损失、MRL 弹性向量、LoRA 高效微调。</p>
                            </div>
                            <div className="metric-card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => setSubTab('data')}>
                                <h4 style={{ color: 'var(--accent-warning)' }}>🧪 数据流水线</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>合成数据生成、质量过滤、多阶段训练流程。</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                            <h4 style={{ marginTop: 0 }}>🔗 相关资源</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '20px' }}>
                                <li><a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>📑 论文 (arXiv)</a></li>
                                <li><a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>💻 代码 (GitHub)</a></li>
                                <li><a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>🤗 模型 (HuggingFace)</a></li>
                            </ul>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="embedding-tab fade-in">
            <div className="embedding-content" style={{ maxWidth: '1000px', margin: '0 auto', color: 'var(--text-primary)' }}>
                <h2 className="section-title">🧬 Qwen3 Embedding 论文详细解读</h2>

                {/* Sub-navigation */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', overflowX: 'auto' }}>
                    <button
                        onClick={() => setSubTab('overview')}
                        style={{
                            padding: '8px 16px',
                            background: subTab === 'overview' ? 'var(--bg-tertiary)' : 'transparent',
                            color: subTab === 'overview' ? 'var(--text-primary)' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: subTab === 'overview' ? '600' : 'normal',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        📋 概览 (Overview)
                    </button>
                    <button
                        onClick={() => setSubTab('architecture')}
                        style={{
                            padding: '8px 16px',
                            background: subTab === 'architecture' ? 'var(--bg-tertiary)' : 'transparent',
                            color: subTab === 'architecture' ? 'var(--text-primary)' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: subTab === 'architecture' ? '600' : 'normal',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        🏗️ 架构 (Architecture)
                    </button>
                    <button
                        onClick={() => setSubTab('data')}
                        style={{
                            padding: '8px 16px',
                            background: subTab === 'data' ? 'var(--bg-tertiary)' : 'transparent',
                            color: subTab === 'data' ? 'var(--text-primary)' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: subTab === 'data' ? '600' : 'normal',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        🧪 数据 (Data)
                    </button>
                    <button
                        onClick={() => setSubTab('training')}
                        style={{
                            padding: '8px 16px',
                            background: subTab === 'training' ? 'var(--bg-tertiary)' : 'transparent',
                            color: subTab === 'training' ? 'var(--text-primary)' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: subTab === 'training' ? '600' : 'normal',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        ⚙️ 训练 (Training)
                    </button>
                </div>

                {/* Content Area */}
                {renderSubTabContent()}

            </div>
        </div>
    );
};

export default Qwen3EmbeddingTab;

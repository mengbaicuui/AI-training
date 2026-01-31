
import React, { useState } from 'react';
import { embeddingDevelopmentData, embeddingDerivationData } from '../data/embeddingDevelopmentData';
import MetricCalculator from './MetricCalculator';

const EmbeddingDevelopment = () => {
    const [activeStageId, setActiveStageId] = useState('stage1');
    const [expandedDerivation, setExpandedDerivation] = useState(null);

    const activeStage = embeddingDevelopmentData.find(s => s.id === activeStageId);

    // 复用 TaskTypesGuide 的数据展示逻辑
    const renderDataExample = (dataStructure) => {
        if (!dataStructure) return null;

        if (dataStructure.type === 'multi-part') {
            return (
                <div className="data-example-container">
                    {dataStructure.parts.map((part, i) => (
                        <div key={i} style={{ marginBottom: '20px' }}>
                            <div style={{
                                fontWeight: '600',
                                color: 'var(--accent-embedding)',
                                marginBottom: '8px',
                                fontSize: '0.9rem'
                            }}>
                                {part.name}
                            </div>
                            <pre style={{
                                background: 'var(--bg-tertiary)',
                                padding: '12px',
                                borderRadius: '8px',
                                overflow: 'auto',
                                fontSize: '0.8rem',
                                lineHeight: '1.5',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color)'
                            }}>
                                <code>{part.example}</code>
                            </pre>
                        </div>
                    ))}
                </div>
            );
        }

        if (dataStructure.type === 'table') {
            return (
                <div className="data-example-container">
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.85rem'
                        }}>
                            <thead>
                                <tr>
                                    {dataStructure.headers.map((header, i) => (
                                        <th key={i} style={{
                                            padding: '10px 12px',
                                            background: 'var(--bg-tertiary)',
                                            color: 'var(--text-primary)',
                                            textAlign: 'left',
                                            borderBottom: '2px solid var(--border-color)',
                                            fontWeight: '600'
                                        }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {dataStructure.rows.map((row, i) => (
                                    <tr key={i}>
                                        {row.map((cell, j) => (
                                            <td key={j} style={{
                                                padding: '10px 12px',
                                                borderBottom: '1px solid var(--border-color)',
                                                color: 'var(--text-secondary)',
                                                fontFamily: j === 0 ? 'inherit' : 'monospace'
                                            }}>
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {dataStructure.note && (
                        <p style={{
                            marginTop: '12px',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic'
                        }}>
                            💡 {dataStructure.note}
                        </p>
                    )}
                </div>
            );
        }

        if (dataStructure.type === 'description') {
            return (
                <div className="data-example-container">
                    <div style={{
                        background: 'var(--bg-tertiary)',
                        padding: '16px',
                        borderRadius: '8px',
                        whiteSpace: 'pre-line',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        border: '1px solid var(--border-color)'
                    }}>
                        {dataStructure.content}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="embedding-tab fade-in">
            <div className="embedding-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 className="section-title">📜 Embedding 模型发展史</h2>

                <div className="content-text">
                    <p>
                        从离散符号到大模型，Embedding 技术经历了四次重大范式转移。
                        每一次演进都深刻改变了我们处理自然语言的方式。
                    </p>
                </div>

                {/* 阶段选择 Tab */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginTop: '24px',
                    marginBottom: '32px'
                }}>
                    {embeddingDevelopmentData.map((stage) => (
                        <button
                            key={stage.id}
                            onClick={() => {
                                setActiveStageId(stage.id);
                                setExpandedDerivation(null);
                            }}
                            style={{
                                padding: '12px 20px',
                                background: activeStageId === stage.id ? stage.color : 'var(--bg-card)',
                                color: activeStageId === stage.id ? '#fff' : 'var(--text-secondary)',
                                border: activeStageId === stage.id ? 'none' : '1px solid var(--border-color)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s',
                                fontWeight: activeStageId === stage.id ? '600' : '400',
                                boxShadow: activeStageId === stage.id ? `0 4px 12px ${stage.color}40` : 'none'
                            }}
                        >
                            {stage.name}
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
                                {stage.year}
                            </div>
                        </button>
                    ))}
                </div>

                {/* 当前阶段详情 */}
                {activeStage && (
                    <div className="fade-in">
                        {/* 阶段介绍 Header */}
                        <div style={{
                            background: `linear-gradient(135deg, ${activeStage.color}15, ${activeStage.color}05)`,
                            borderRadius: '16px',
                            padding: '32px',
                            marginBottom: '40px',
                            border: `1px solid ${activeStage.color}30`,
                            textAlign: 'center'
                        }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                                {activeStage.name}
                            </h3>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto' }}>
                                {activeStage.description}
                            </p>
                        </div>

                        {/* 此阶段的技术列表 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            {activeStage.technologies.map((tech) => (
                                <div key={tech.id} style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-color)',
                                    padding: '32px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* 装饰边框 */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '6px',
                                        height: '100%',
                                        background: activeStage.color
                                    }} />

                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                                        {tech.name}
                                    </h4>

                                    <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                                        {tech.description}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                        {/* 通俗别名 / 类比 */}
                                        <div style={{
                                            background: 'var(--bg-tertiary)',
                                            padding: '20px',
                                            borderRadius: '12px'
                                        }}>
                                            <h5 style={{ margin: '0 0 12px 0', color: activeStage.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                💡 通俗理解
                                            </h5>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                                {tech.analogy}
                                            </p>
                                        </div>

                                        {/* 真实案例 */}
                                        <div style={{
                                            background: 'rgba(34, 197, 94, 0.05)',
                                            border: '1px solid rgba(34, 197, 94, 0.2)',
                                            padding: '20px',
                                            borderRadius: '12px'
                                        }}>
                                            <h5 style={{ margin: '0 0 12px 0', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                🎯 真实案例与应用
                                            </h5>
                                            {renderDataExample(tech.realCase)}
                                        </div>
                                    </div>

                                    {/* 推导/演示部分 */}
                                    {tech.derivationId && embeddingDerivationData[tech.derivationId] && (
                                        <div style={{ marginTop: '24px' }}>
                                            <button
                                                onClick={() => setExpandedDerivation(expandedDerivation === tech.id ? null : tech.id)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: expandedDerivation === tech.id ? activeStage.color : 'var(--bg-tertiary)',
                                                    color: expandedDerivation === tech.id ? '#fff' : 'var(--text-primary)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span>🧮</span>
                                                {expandedDerivation === tech.id ? '收起计算演示' : '查看推导过程演示'}
                                            </button>

                                            {expandedDerivation === tech.id && (
                                                <div className="fade-in" style={{ marginTop: '16px' }}>
                                                    <MetricCalculator
                                                        metricName={tech.name} // 只是为了显示名字
                                                        color={activeStage.color}
                                                        customData={embeddingDerivationData[tech.derivationId]}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 局限性 */}
                                    {tech.limitations && (
                                        <div style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <strong>⚠️ 局限性：</strong>
                                            {tech.limitations.join('；')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmbeddingDevelopment;

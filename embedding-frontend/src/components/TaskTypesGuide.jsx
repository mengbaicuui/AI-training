import React, { useState } from 'react';
import { taskTypesData } from '../data/taskTypesData';
import MetricCalculator from './MetricCalculator';

const TaskTypesGuide = () => {
    const [activeTask, setActiveTask] = useState('retrieval');
    const [expandedMetric, setExpandedMetric] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState(null);

    const currentTask = taskTypesData.find(t => t.id === activeTask);

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
                <h2 className="section-title">📖 MTEB 任务类型详解</h2>

                <div className="content-text">
                    <p>
                        <b>MTEB (Massive Text Embedding Benchmark)</b> 是衡量 Embedding 模型"通用性"的黄金标准。
                        它包含 <b>8 类核心任务</b>、58 个数据集，覆盖 112 种语言。
                        一个优秀的 Embedding 模型不应偏科，而应在检索、分类、聚类等多个维度上均表现出色。
                    </p>
                </div>

                {/* 任务类型选择器 */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginTop: '24px',
                    marginBottom: '32px'
                }}>
                    {taskTypesData.map((task) => (
                        <button
                            key={task.id}
                            onClick={() => {
                                setActiveTask(task.id);
                                setExpandedMetric(null);
                                setSelectedMetric(null);
                            }}
                            style={{
                                padding: '10px 16px',
                                background: activeTask === task.id ? task.color : 'var(--bg-card)',
                                color: activeTask === task.id ? '#fff' : 'var(--text-secondary)',
                                border: activeTask === task.id ? 'none' : '1px solid var(--border-color)',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontWeight: activeTask === task.id ? '600' : '400'
                            }}
                        >
                            <span>{task.icon}</span>
                            {task.nameCn}
                        </button>
                    ))}
                </div>

                {/* 当前任务详情 */}
                {currentTask && (
                    <div className="fade-in">
                        {/* 标题区域 */}
                        <div style={{
                            background: `linear-gradient(135deg, ${currentTask.color}15, ${currentTask.color}05)`,
                            borderRadius: '12px',
                            padding: '24px',
                            marginBottom: '24px',
                            border: `1px solid ${currentTask.color}30`
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '12px'
                            }}>
                                <span style={{ fontSize: '2rem' }}>{currentTask.icon}</span>
                                <div>
                                    <h3 style={{
                                        margin: 0,
                                        color: 'var(--text-primary)',
                                        fontSize: '1.5rem'
                                    }}>
                                        {currentTask.name}
                                        <span style={{
                                            marginLeft: '10px',
                                            fontSize: '1rem',
                                            color: currentTask.color
                                        }}>
                                            ({currentTask.nameCn})
                                        </span>
                                    </h3>
                                </div>
                            </div>
                            <p style={{
                                margin: 0,
                                color: 'var(--text-secondary)',
                                fontSize: '1rem',
                                lineHeight: '1.6'
                            }}>
                                {currentTask.description}
                            </p>
                        </div>

                        {/* 通俗讲解 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{
                                color: 'var(--text-primary)',
                                marginBottom: '12px',
                                borderLeft: `4px solid ${currentTask.color}`,
                                paddingLeft: '12px'
                            }}>
                                💡 通俗讲解
                            </h4>
                            <div style={{
                                background: 'var(--bg-card)',
                                padding: '16px',
                                borderRadius: '8px',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.7',
                                fontSize: '0.95rem'
                            }}>
                                {currentTask.analogy}
                            </div>
                        </div>

                        {/* 使用场景 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{
                                color: 'var(--text-primary)',
                                marginBottom: '12px',
                                borderLeft: '4px solid var(--accent-success)',
                                paddingLeft: '12px'
                            }}>
                                🎯 使用场景
                            </h4>
                            <div style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                padding: '16px',
                                borderRadius: '8px',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.7',
                                fontSize: '0.95rem',
                                border: '1px solid rgba(34, 197, 94, 0.2)'
                            }}>
                                {currentTask.useCase}
                            </div>
                        </div>

                        {/* 数据示例 */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{
                                color: 'var(--text-primary)',
                                marginBottom: '12px',
                                borderLeft: '4px solid var(--accent-warning)',
                                paddingLeft: '12px'
                            }}>
                                📋 真实数据示例
                            </h4>
                            {renderDataExample(currentTask.dataStructure)}
                        </div>

                        {/* 评估指标 */}
                        <div>
                            <h4 style={{
                                color: 'var(--text-primary)',
                                marginBottom: '16px',
                                borderLeft: '4px solid var(--accent-primary)',
                                paddingLeft: '12px'
                            }}>
                                📊 评估指标
                            </h4>
                            <div className="metric-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '16px'
                            }}>
                                {currentTask.metrics.map((metric, i) => (
                                    <div
                                        key={i}
                                        className="metric-card"
                                        style={{
                                            background: 'var(--bg-card)',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            border: metric.importance === 'primary'
                                                ? `2px solid ${currentTask.color}`
                                                : '1px solid var(--border-color)',
                                            cursor: metric.explanation ? 'pointer' : 'default',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => {
                                            if (metric.explanation) {
                                                setExpandedMetric(expandedMetric === metric.name ? null : metric.name);
                                            }
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{
                                                fontWeight: '600',
                                                color: currentTask.color,
                                                fontSize: '1.1rem'
                                            }}>
                                                {metric.name}
                                                {metric.importance === 'primary' && (
                                                    <span style={{
                                                        marginLeft: '8px',
                                                        fontSize: '0.7rem',
                                                        background: currentTask.color,
                                                        color: '#fff',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        verticalAlign: 'middle'
                                                    }}>
                                                        主要指标
                                                    </span>
                                                )}
                                            </div>
                                            {metric.explanation && (
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    {expandedMetric === metric.name ? '▼' : '▶'}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--text-muted)',
                                            marginBottom: '8px'
                                        }}>
                                            {metric.fullName}
                                        </div>
                                        <p style={{
                                            margin: '0 0 10px 0',
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.9rem',
                                            lineHeight: '1.5'
                                        }}>
                                            {metric.description}
                                        </p>
                                        {metric.formula && (
                                            <div style={{
                                                background: 'var(--bg-tertiary)',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                fontFamily: 'monospace',
                                                fontSize: '0.85rem',
                                                color: 'var(--accent-success)'
                                            }}>
                                                {metric.formula}
                                            </div>
                                        )}
                                        {expandedMetric === metric.name && metric.explanation && (
                                            <div className="fade-in" style={{
                                                marginTop: '12px',
                                                padding: '12px',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                color: 'var(--text-secondary)',
                                                lineHeight: '1.6',
                                                whiteSpace: 'pre-line'
                                            }}>
                                                💡 {metric.explanation}
                                            </div>
                                        )}
                                        {/* 打开计算器按钮 */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMetric(selectedMetric === metric.name ? null : metric.name);
                                            }}
                                            style={{
                                                marginTop: '12px',
                                                padding: '8px 16px',
                                                background: selectedMetric === metric.name ? currentTask.color : 'var(--bg-tertiary)',
                                                color: selectedMetric === metric.name ? '#fff' : 'var(--text-secondary)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                width: '100%',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {selectedMetric === metric.name ? '✓ 正在演示' : '🧮 查看计算演示'}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* 交互式计算演示区域 */}
                            {selectedMetric && (
                                <div style={{ marginTop: '24px' }} className="fade-in">
                                    <h4 style={{
                                        color: 'var(--text-primary)',
                                        marginBottom: '16px',
                                        borderLeft: `4px solid ${currentTask.color}`,
                                        paddingLeft: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        🧮 {selectedMetric} 动态计算演示
                                        <button
                                            onClick={() => setSelectedMetric(null)}
                                            style={{
                                                marginLeft: 'auto',
                                                padding: '4px 12px',
                                                background: 'var(--bg-tertiary)',
                                                color: 'var(--text-muted)',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            ✕ 关闭
                                        </button>
                                    </h4>
                                    <MetricCalculator
                                        metricName={selectedMetric}
                                        color={currentTask.color}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 底部总结 */}
                <div style={{
                    marginTop: '40px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, var(--bg-card), var(--bg-tertiary))',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)'
                }}>
                    <h4 style={{
                        color: 'var(--text-primary)',
                        marginBottom: '12px'
                    }}>
                        📌 关键结论
                    </h4>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '20px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.8'
                    }}>
                        <li><b>RAG 核心</b>：Retrieval 任务是 RAG 系统的生命线，nDCG@10 是最重要的指标</li>
                        <li><b>不要只看 STS</b>：早期开发者只关注语义相似度，但 STS 高分不代表检索能力强</li>
                        <li><b>选择合适的任务</b>：根据你的业务场景选择最相关的任务类型进行评估</li>
                        <li><b>Reranking 是提升法宝</b>：在 Retrieval 后加入 Reranking 阶段，通常能提升 10%+ 准确率</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TaskTypesGuide;

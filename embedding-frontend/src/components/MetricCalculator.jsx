import React, { useState, useEffect } from 'react';
import { metricCalculationsData } from '../data/metricCalculationsData';

/**
 * 交互式指标计算器组件
 * 用于动态演示各种评估指标的计算过程
 */
const MetricCalculator = ({ metricName, color = '#6366f1', customData = null }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showAllSteps, setShowAllSteps] = useState(false);

    const calcData = customData || metricCalculationsData[metricName];

    useEffect(() => {
        setCurrentStep(0);
        setShowAllSteps(false);
    }, [metricName]);

    if (!calcData) {
        return (
            <div style={{
                padding: '20px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                textAlign: 'center'
            }}>
                暂无 {metricName} 的计算演示
            </div>
        );
    }

    const steps = calcData.example?.steps || [];

    const handleNextStep = () => {
        if (currentStep < steps.length - 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setIsAnimating(false);
            }, 300);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setIsAnimating(false);
            }, 300);
        }
    };

    const handleReset = () => {
        setCurrentStep(0);
        setShowAllSteps(false);
    };

    const handleShowAll = () => {
        setShowAllSteps(!showAllSteps);
    };

    // 渲染公式
    const renderFormula = () => (
        <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
            <div style={{
                fontWeight: '600',
                color: color,
                marginBottom: '10px',
                fontSize: '0.9rem'
            }}>
                📐 核心公式
            </div>
            <div style={{
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                color: 'var(--text-primary)',
                textAlign: 'center',
                padding: '10px',
                background: 'var(--bg-card)',
                borderRadius: '6px'
            }}>
                {calcData.formulaLatex}
            </div>
            {calcData.subFormulas && (
                <div style={{ marginTop: '12px' }}>
                    {calcData.subFormulas.map((sub, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '8px',
                            fontSize: '0.85rem'
                        }}>
                            <span style={{
                                background: color,
                                color: '#fff',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontWeight: '500'
                            }}>
                                {sub.name}
                            </span>
                            <code style={{ color: 'var(--text-secondary)' }}>
                                {sub.formula}
                            </code>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // 渲染数据表格 (nDCG, MAP 等需要)
    const renderDataTable = () => {
        const example = calcData.example;

        if (example.modelResults) {
            // nDCG 格式
            return (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '10px'
                    }}>
                        📋 {example.scenario}
                    </div>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '280px' }}>
                            <div style={{ fontSize: '0.85rem', color: color, marginBottom: '8px' }}>
                                模型返回结果：
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-tertiary)' }}>
                                        <th style={tableHeaderStyle}>排名</th>
                                        <th style={tableHeaderStyle}>文档</th>
                                        <th style={tableHeaderStyle}>相关度</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {example.modelResults.map((row, i) => (
                                        <tr key={i} style={{
                                            background: row.isRelevant ? 'rgba(34, 197, 94, 0.1)' : 'transparent'
                                        }}>
                                            <td style={tableCellStyle}>{row.rank}</td>
                                            <td style={tableCellStyle}>{row.doc}</td>
                                            <td style={tableCellStyle}>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    background: row.relevance > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                    color: row.relevance > 0 ? '#22c55e' : '#ef4444'
                                                }}>
                                                    {row.relevance}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ flex: 1, minWidth: '280px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#22c55e', marginBottom: '8px' }}>
                                理想排序：
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-tertiary)' }}>
                                        <th style={tableHeaderStyle}>排名</th>
                                        <th style={tableHeaderStyle}>文档</th>
                                        <th style={tableHeaderStyle}>相关度</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {example.idealResults.map((row, i) => (
                                        <tr key={i}>
                                            <td style={tableCellStyle}>{row.rank}</td>
                                            <td style={tableCellStyle}>{row.doc}</td>
                                            <td style={tableCellStyle}>{row.relevance}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }

        if (example.predictions) {
            // Accuracy 格式
            return (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '10px'
                    }}>
                        📋 {example.scenario}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-tertiary)' }}>
                                    <th style={tableHeaderStyle}>文本</th>
                                    <th style={tableHeaderStyle}>真实</th>
                                    <th style={tableHeaderStyle}>预测</th>
                                    <th style={tableHeaderStyle}>结果</th>
                                </tr>
                            </thead>
                            <tbody>
                                {example.predictions.map((row, i) => (
                                    <tr key={i} style={{
                                        background: row.correct ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                                    }}>
                                        <td style={tableCellStyle}>{row.text}</td>
                                        <td style={tableCellStyle}>{row.actual}</td>
                                        <td style={tableCellStyle}>{row.predicted}</td>
                                        <td style={tableCellStyle}>
                                            {row.correct ? '✓' : '✗'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (example.confusionMatrix) {
            // F1 格式 - 混淆矩阵
            const cm = example.confusionMatrix;
            return (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '10px'
                    }}>
                        📋 {example.scenario}
                    </div>
                    <div style={{
                        display: 'inline-block',
                        background: 'var(--bg-tertiary)',
                        padding: '16px',
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', textAlign: 'center' }}>
                            混淆矩阵
                        </div>
                        <table style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...tableHeaderStyle, width: '80px' }}></th>
                                    <th style={tableHeaderStyle}>预测: 欺诈</th>
                                    <th style={tableHeaderStyle}>预测: 正常</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ ...tableCellStyle, fontWeight: '600' }}>实际: 欺诈</td>
                                    <td style={{ ...tableCellStyle, background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                                        TP = {cm.tp}
                                    </td>
                                    <td style={{ ...tableCellStyle, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                                        FN = {cm.fn}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ ...tableCellStyle, fontWeight: '600' }}>实际: 正常</td>
                                    <td style={{ ...tableCellStyle, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                                        FP = {cm.fp}
                                    </td>
                                    <td style={{ ...tableCellStyle, background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                                        TN = {cm.tn}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (example.pairs) {
            // Spearman / AP 格式
            return (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '10px'
                    }}>
                        📋 {example.scenario}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-tertiary)' }}>
                                    <th style={tableHeaderStyle}>句对</th>
                                    <th style={tableHeaderStyle}>人类评分</th>
                                    <th style={tableHeaderStyle}>模型评分</th>
                                    <th style={tableHeaderStyle}>人类排名</th>
                                    <th style={tableHeaderStyle}>模型排名</th>
                                </tr>
                            </thead>
                            <tbody>
                                {example.pairs.map((row, i) => (
                                    <tr key={i}>
                                        <td style={tableCellStyle}>{row.pairId}</td>
                                        <td style={tableCellStyle}>{row.humanScore}</td>
                                        <td style={tableCellStyle}>{row.modelScore}</td>
                                        <td style={tableCellStyle}>{row.humanRank}</td>
                                        <td style={{
                                            ...tableCellStyle,
                                            color: row.humanRank === row.modelRank ? '#22c55e' : '#f59e0b'
                                        }}>
                                            {row.modelRank}
                                            {row.humanRank !== row.modelRank && ' ⚠️'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (example.queries) {
            // MRR / MAP 多查询格式
            return (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '10px'
                    }}>
                        📋 {example.scenario}
                    </div>
                    {example.queries.map((q, qi) => (
                        <div key={qi} style={{
                            background: 'var(--bg-tertiary)',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '10px'
                        }}>
                            <div style={{ fontWeight: '500', color: color, marginBottom: '8px' }}>
                                {q.query}
                            </div>
                            {q.firstRelevantRank !== undefined && (
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    第一个相关文档位置：<b>第 {q.firstRelevantRank} 位</b> → 1/{q.firstRelevantRank} = {q.reciprocal.toFixed(2)}
                                </div>
                            )}
                            {q.results && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                    {q.results.map((r, ri) => (
                                        <span key={ri} style={{
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            background: r.relevant ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                                            color: r.relevant ? '#22c55e' : 'var(--text-muted)'
                                        }}>
                                            {ri + 1}. {r.doc} {r.relevant ? '✓' : ''}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        if (example.clusters) {
            // V-Measure 聚类格式
            return (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '10px'
                    }}>
                        📋 {example.scenario}
                    </div>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {example.clusters.map((cluster, ci) => (
                            <div key={ci} style={{
                                flex: 1,
                                minWidth: '200px',
                                background: 'var(--bg-tertiary)',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '2px dashed ' + (ci === 0 ? '#6366f1' : '#22d3ee')
                            }}>
                                <div style={{
                                    fontWeight: '600',
                                    color: ci === 0 ? '#6366f1' : '#22d3ee',
                                    marginBottom: '10px'
                                }}>
                                    {cluster.name}
                                </div>
                                {cluster.papers.map((paper, pi) => (
                                    <div key={pi} style={{
                                        padding: '6px 10px',
                                        marginBottom: '6px',
                                        borderRadius: '4px',
                                        fontSize: '0.85rem',
                                        background: paper.trueLabel === 'NLP' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                                        color: paper.trueLabel === 'NLP' ? '#8b5cf6' : '#f97316'
                                    }}>
                                        {paper.title}
                                        <span style={{ marginLeft: '8px', opacity: 0.7 }}>({paper.trueLabel})</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return null;
    };

    // 渲染计算步骤
    const renderSteps = () => (
        <div style={{ marginTop: '20px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
            }}>
                <div style={{
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                }}>
                    🔢 计算步骤 {!showAllSteps && `(${currentStep + 1}/${steps.length})`}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleShowAll}
                        style={{
                            padding: '6px 12px',
                            background: showAllSteps ? color : 'var(--bg-tertiary)',
                            color: showAllSteps ? '#fff' : 'var(--text-secondary)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                        }}
                    >
                        {showAllSteps ? '逐步演示' : '显示全部'}
                    </button>
                </div>
            </div>

            {showAllSteps ? (
                // 显示所有步骤
                <div>
                    {steps.map((step, i) => (
                        <div key={i} style={{
                            background: 'var(--bg-tertiary)',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            borderLeft: `4px solid ${color}`
                        }}>
                            <StepContent step={step} stepIndex={i} color={color} />
                        </div>
                    ))}
                </div>
            ) : (
                // 逐步显示
                <div>
                    <div style={{
                        background: 'var(--bg-tertiary)',
                        padding: '20px',
                        borderRadius: '12px',
                        minHeight: '120px',
                        opacity: isAnimating ? 0.5 : 1,
                        transition: 'opacity 0.3s',
                        borderLeft: `4px solid ${color}`
                    }}>
                        <StepContent step={steps[currentStep]} stepIndex={currentStep} color={color} />
                    </div>

                    {/* 导航按钮 */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '12px',
                        marginTop: '16px'
                    }}>
                        <button
                            onClick={handleReset}
                            disabled={currentStep === 0}
                            style={navButtonStyle(currentStep === 0, color)}
                        >
                            ⟲ 重置
                        </button>
                        <button
                            onClick={handlePrevStep}
                            disabled={currentStep === 0}
                            style={navButtonStyle(currentStep === 0, color)}
                        >
                            ← 上一步
                        </button>
                        <div style={{
                            display: 'flex',
                            gap: '6px',
                            alignItems: 'center'
                        }}>
                            {steps.map((_, i) => (
                                <div key={i} style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: i === currentStep ? color : 'var(--bg-card)',
                                    border: i <= currentStep ? `2px solid ${color}` : '2px solid var(--border-color)',
                                    transition: 'all 0.3s'
                                }} />
                            ))}
                        </div>
                        <button
                            onClick={handleNextStep}
                            disabled={currentStep === steps.length - 1}
                            style={navButtonStyle(currentStep === steps.length - 1, color)}
                        >
                            下一步 →
                        </button>
                    </div>
                </div>
            )}

            {/* 结果解读 */}
            {calcData.example.interpretation && (currentStep === steps.length - 1 || showAllSteps) && (
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                    <span style={{ fontWeight: '600', color: '#22c55e' }}>💡 结果解读：</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
                        {calcData.example.interpretation}
                    </span>
                </div>
            )}

            {/* F1 特殊对比 */}
            {calcData.example.comparison && (currentStep === steps.length - 1 || showAllSteps) && (
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                    <div style={{ fontWeight: '600', color: '#f59e0b', marginBottom: '10px' }}>
                        ⚠️ Accuracy vs F1 对比
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Accuracy: </span>
                            <span style={{ color: '#22c55e', fontWeight: '600' }}>{(calcData.example.comparison.accuracy * 100).toFixed(0)}%</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>F1: </span>
                            <span style={{ color: '#ef4444', fontWeight: '600' }}>{(calcData.example.comparison.f1 * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {calcData.example.comparison.note}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="metric-calculator fade-in" style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid var(--border-color)'
        }}>
            <div style={{
                fontWeight: '600',
                fontSize: '1.1rem',
                color: 'var(--text-primary)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <span style={{
                    padding: '6px 12px',
                    background: color,
                    color: '#fff',
                    borderRadius: '6px'
                }}>
                    {metricName}
                </span>
                <span>动态计算演示</span>
            </div>

            {renderFormula()}
            {renderDataTable()}
            {steps.length > 0 && renderSteps()}
        </div>
    );
};

// 单步内容组件
const StepContent = ({ step, stepIndex, color }) => (
    <div>
        <div style={{
            fontWeight: '600',
            color: color,
            marginBottom: '10px',
            fontSize: '1rem'
        }}>
            Step {stepIndex + 1}: {step.name}
        </div>
        {step.detail && (
            <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: '10px',
                whiteSpace: 'pre-line'
            }}>
                {step.detail}
            </div>
        )}
        {step.calculation && (
            <div style={{
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                padding: '10px',
                background: 'var(--bg-card)',
                borderRadius: '6px',
                marginBottom: '10px'
            }}>
                {step.calculation}
            </div>
        )}
        {step.values && (
            <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '10px'
            }}>
                {step.values.map((v, i) => (
                    <span key={i} style={{
                        padding: '4px 10px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)'
                    }}>
                        {typeof v === 'string' ? v : JSON.stringify(v)}
                    </span>
                ))}
            </div>
        )}
        {step.result !== undefined && (
            <div style={{
                display: 'inline-block',
                padding: '8px 16px',
                background: 'rgba(34, 197, 94, 0.2)',
                borderRadius: '6px',
                fontWeight: '600',
                color: '#22c55e'
            }}>
                = {typeof step.result === 'number' ? step.result.toFixed(2) : step.result}
            </div>
        )}
    </div>
);

// 样式
const tableHeaderStyle = {
    padding: '8px 12px',
    textAlign: 'left',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontWeight: '600'
};

const tableCellStyle = {
    padding: '8px 12px',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-secondary)'
};

const navButtonStyle = (disabled, color) => ({
    padding: '8px 16px',
    background: disabled ? 'var(--bg-tertiary)' : color,
    color: disabled ? 'var(--text-muted)' : '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1
});

export default MetricCalculator;

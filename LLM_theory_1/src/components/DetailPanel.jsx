import { useState } from 'react';
import { formatParamCount, calculateParamRatio, calculateQwen3Params, calculateQwen3MoeParams } from '../utils/paramUtils';

function DetailPanel({ node, breadcrumb, onBreadcrumbClick, config, isMoe }) {
    const [copiedCode, setCopiedCode] = useState(false);

    if (!node) {
        return (
            <div className="detail-panel">
                <div className="empty-state">
                    <div className="empty-icon">👈</div>
                    <div className="empty-title">选择一个组件查看详情</div>
                    <div className="empty-text">
                        点击左侧架构树中的任意层级，查看其参数、Shape 变换、中文解释和关键代码
                    </div>
                </div>
            </div>
        );
    }

    const handleCopyCode = async () => {
        if (node.code) {
            try {
                await navigator.clipboard.writeText(node.code);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    const highlightPythonSyntax = (code) => {
        if (!code) return '';

        const tokens = [
            { type: 'comment', regex: /#[^\n]*/ },
            { type: 'string', regex: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/ },
            { type: 'keyword', regex: /\b(class|def|return|if|else|elif|for|while|in|import|from|as|with|try|except|finally|raise|assert|yield|lambda|and|or|not|is|None|True|False|self|super)\b/ },
            { type: 'number', regex: /\b\d+\.?\d*\b/ },
            { type: 'function', regex: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ }
        ];

        const escapeHtml = (text) => text.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));

        const combinedRegex = new RegExp(tokens.map(t => `(${t.regex.source})`).join('|'), 'g');

        let lastIndex = 0;
        let result = '';
        let match;

        while ((match = combinedRegex.exec(code)) !== null) {
            result += escapeHtml(code.slice(lastIndex, match.index));

            let matchedTokenIndex = -1;
            for (let i = 0; i < tokens.length; i++) {
                if (match[i + 1] !== undefined) {
                    matchedTokenIndex = i;
                    break;
                }
            }

            if (matchedTokenIndex !== -1) {
                const tokenType = tokens[matchedTokenIndex].type;
                result += `<span class="${tokenType}">${escapeHtml(match[0])}</span>`;
            } else {
                result += escapeHtml(match[0]);
            }

            lastIndex = combinedRegex.lastIndex;
        }

        result += escapeHtml(code.slice(lastIndex));
        return result;
    };


    return (
        <div className="detail-panel fade-in">
            <div className="detail-header">
                {/* Breadcrumb */}
                <div className="detail-breadcrumb">
                    {breadcrumb.map((item, index) => (
                        <span key={item.id || index}>
                            <span
                                className={`breadcrumb-item ${index === breadcrumb.length - 1 ? 'current' : ''}`}
                                onClick={() => onBreadcrumbClick(index)}
                            >
                                {item.name.split(' ')[0]}
                            </span>
                            {index < breadcrumb.length - 1 && (
                                <span className="breadcrumb-separator"> › </span>
                            )}
                        </span>
                    ))}
                </div>

                {/* Title */}
                <h2 className="detail-title">{node.name}</h2>
                {node.nameZh && <div className="detail-title-zh">{node.nameZh}</div>}
            </div>

            <div className="detail-content">
                {/* 参数量统计 - 根据节点 ID 动态计算 */}
                {(() => {
                    const paramStats = isMoe ? calculateQwen3MoeParams(config) : calculateQwen3Params(config);
                    const totalParams = paramStats.total;

                    // 根据节点 ID 获取对应的参数量
                    const getNodeParams = (nodeId) => {
                        // Embedding
                        if (nodeId === 'embed_tokens' || nodeId === 'moe_embed_tokens') return paramStats.embedding.embed_tokens;

                        // Attention 相关
                        if (nodeId === 'self_attn' || nodeId === 'moe_self_attn') return paramStats.attention.total_per_layer;
                        if (nodeId === 'q_proj' || nodeId === 'moe_q_proj') return paramStats.attention.q_proj;
                        if (nodeId === 'k_proj' || nodeId === 'moe_k_proj') return paramStats.attention.k_proj;
                        if (nodeId === 'v_proj' || nodeId === 'moe_v_proj') return paramStats.attention.v_proj;
                        if (nodeId === 'o_proj' || nodeId === 'moe_o_proj') return paramStats.attention.o_proj;
                        if (nodeId === 'q_norm' || nodeId === 'moe_q_norm') return paramStats.attention.q_norm;
                        if (nodeId === 'k_norm' || nodeId === 'moe_k_norm') return paramStats.attention.k_norm;

                        // MLP 相关
                        if (nodeId === 'mlp') return paramStats.mlp?.total_per_layer || 0;
                        if (nodeId === 'gate_proj') return paramStats.mlp?.gate_proj || 0;
                        if (nodeId === 'up_proj') return paramStats.mlp?.up_proj || 0;
                        if (nodeId === 'down_proj') return paramStats.mlp?.down_proj || 0;

                        // MoE 相关
                        if (nodeId === 'moe_block') return paramStats.moe?.moe_block_total || 0;
                        if (nodeId === 'moe_gate') return paramStats.moe?.router_gate || 0;
                        if (nodeId === 'moe_experts') return paramStats.moe?.all_experts || 0;
                        if (nodeId === 'single_expert') return paramStats.moe?.single_expert || 0;
                        if (nodeId === 'expert_gate_proj') return paramStats.moe?.expert_breakdown?.gate_proj || 0;
                        if (nodeId === 'expert_up_proj') return paramStats.moe?.expert_breakdown?.up_proj || 0;
                        if (nodeId === 'expert_down_proj') return paramStats.moe?.expert_breakdown?.down_proj || 0;

                        // Norm 相关
                        if (nodeId === 'input_layernorm' || nodeId === 'moe_input_layernorm') return paramStats.norm.input_layernorm;
                        if (nodeId === 'post_attention_layernorm' || nodeId === 'moe_post_attention_layernorm') return paramStats.norm.post_attention_layernorm;
                        if (nodeId === 'final_norm' || nodeId === 'moe_final_norm') return paramStats.norm.final_norm;

                        // LM Head
                        if (nodeId === 'lm_head' || nodeId === 'moe_lm_head') return paramStats.lm_head.tied ? 0 : paramStats.lm_head.params;

                        // 层级聚合
                        if (nodeId === 'layers' || nodeId === 'moe_layers') return paramStats.all_layers;
                        if (nodeId === 'decoder_layer' || nodeId === 'moe_decoder_layer') return paramStats.layer_total;
                        if (nodeId === 'qwen3_model' || nodeId === 'qwen3_moe_model') return totalParams - (paramStats.lm_head.tied ? 0 : paramStats.lm_head.params);
                        if (nodeId === 'qwen3_for_causal_lm' || nodeId === 'qwen3_moe_for_causal_lm') return totalParams;

                        // Rotary Embedding (无参数或极少)
                        if (nodeId === 'rotary_emb' || nodeId === 'moe_rotary_emb') return 0;

                        return null;
                    };

                    const nodeParams = getNodeParams(node.id);

                    if (nodeParams !== null && nodeParams >= 0) {
                        const ratio = totalParams > 0 ? (nodeParams / totalParams) * 100 : 0;
                        const isPerLayer = ['self_attn', 'moe_self_attn', 'mlp', 'moe_block', 'decoder_layer', 'moe_decoder_layer',
                            'input_layernorm', 'moe_input_layernorm', 'post_attention_layernorm', 'moe_post_attention_layernorm'].includes(node.id);
                        const numLayers = paramStats.config?.num_hidden_layers || 32;

                        return (
                            <div className="detail-section param-stats-section">
                                <h3 className="section-title">
                                    <span className="section-icon">📊</span>
                                    参数量统计
                                </h3>
                                <div className="param-stats-grid">
                                    <div className="param-stat-card">
                                        <div className="param-stat-label">
                                            {isPerLayer ? '每层参数量' : '参数量'}
                                        </div>
                                        <div className="param-stat-value">
                                            {nodeParams === 0 ? (paramStats.lm_head.tied && (node.id === 'lm_head' || node.id === 'moe_lm_head') ? '共享 (0)' : '0') : formatParamCount(nodeParams)}
                                        </div>
                                    </div>
                                    {isPerLayer && (
                                        <div className="param-stat-card">
                                            <div className="param-stat-label">全部层总计</div>
                                            <div className="param-stat-value">{formatParamCount(nodeParams * numLayers)}</div>
                                        </div>
                                    )}
                                    <div className="param-stat-card">
                                        <div className="param-stat-label">占模型总参数</div>
                                        <div className="param-stat-value">
                                            {isPerLayer ? calculateParamRatio(nodeParams * numLayers, totalParams) : calculateParamRatio(nodeParams, totalParams)}
                                        </div>
                                    </div>
                                </div>
                                {/* 进度条 */}
                                <div className="param-progress-container">
                                    <div className="param-progress-bar">
                                        <div
                                            className="param-progress-fill"
                                            style={{ width: `${Math.min(100, isPerLayer ? (nodeParams * numLayers / totalParams) * 100 : ratio)}%` }}
                                        />
                                    </div>
                                    <div className="param-progress-label">
                                        模型总参数: {formatParamCount(totalParams)}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Description */}
                {node.description && (
                    <div className="detail-section">
                        <h3 className="section-title">
                            <span className="section-icon">📖</span>
                            功能说明
                        </h3>
                        <p className="description-text">{node.description}</p>
                    </div>
                )}

                {/* Parameters */}
                {node.params && Object.keys(node.params).length > 0 && (
                    <div className="detail-section">
                        <h3 className="section-title">
                            <span className="section-icon">⚙️</span>
                            参数配置
                        </h3>
                        <table className="params-table">
                            <thead>
                                <tr>
                                    <th>参数名</th>
                                    <th>值 / 说明</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(node.params).map(([key, value]) => (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td>{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Shapes */}
                {node.shapes && Object.keys(node.shapes).length > 0 && (
                    <div className="detail-section">
                        <h3 className="section-title">
                            <span className="section-icon">📐</span>
                            张量形状变换
                        </h3>
                        <div className="shapes-grid">
                            {Object.entries(node.shapes).map(([key, value]) => (
                                <div key={key} className="shape-card">
                                    <div className="shape-label">{key}</div>
                                    <div className="shape-value">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Code */}
                {node.code && (
                    <div className="detail-section">
                        <h3 className="section-title">
                            <span className="section-icon">💻</span>
                            关键代码
                        </h3>
                        <div className="code-block">
                            <div className="code-header">
                                <span className="code-lang">Python</span>
                                <button className="code-copy-btn" onClick={handleCopyCode}>
                                    {copiedCode ? '✓ 已复制' : '📋 复制'}
                                </button>
                            </div>
                            <div className="code-content">
                                <pre dangerouslySetInnerHTML={{
                                    __html: highlightPythonSyntax(node.code)
                                }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Children summary */}
                {node.children && node.children.length > 0 && (
                    <div className="detail-section">
                        <h3 className="section-title">
                            <span className="section-icon">📦</span>
                            子组件 ({node.children.length})
                        </h3>
                        <div className="children-list">
                            {node.children.map((child, index) => (
                                <div key={child.id || index} className="diff-item">
                                    <span className="diff-key">{child.name.split(' ')[0]}</span>
                                    <span className="diff-value">{child.nameZh || ''}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DetailPanel;

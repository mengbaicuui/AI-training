import React from 'react';
import { formatParamCount, calculateParamRatio, calculateQwen3Params, calculateQwen3MoeParams } from '../utils/paramUtils';

/**
 * ArchitectureDiagram Component
 * 
 * Renders a scalable SVG Macro View of the Qwen3 and Qwen3-MoE architectures.
 * 
 * Features:
 * - Dynamically scalable via `scale` constant.
 * - Visualizes data flow from Input to Output.
 * - Shows detailed Attention mechanism (RoPE, Q/K Norm, GQA).
 * - Switches between Dense (MLP) and Sparse (MoE) visualizations based on `isMoe` prop.
 * - Highlights residual connections and normalization layers.
 * 
 * @param {Object} props
 * @param {boolean} props.isMoe - Whether to render MoE specific components.
 * @param {Object} props.config - Model configuration object (vocab_size, hidden_layers, etc).
 */
function ArchitectureDiagram({ isMoe, config }) {
    // Helper to safely get config values since structure might vary
    const getValue = (key) => {
        if (!config) return 'N/A';
        if (config[key] !== undefined) return config[key];
        if (config.defaultParams && config.defaultParams[key] !== undefined) return config.defaultParams[key];
        if (key === 'num_hidden_layers' && config.num_hidden_layers) return config.num_hidden_layers;
        if (key === 'vocab_size' && config.vocab_size) return config.vocab_size;
        return 'N/A';
    };

    const [showParams, setShowParams] = React.useState(true);

    const vocab_size = getValue('vocab_size');
    const hidden_layers = getValue('num_hidden_layers');
    const heads = getValue('num_attention_heads');
    const kv_heads = getValue('num_key_value_heads') || heads;
    const intermediate_size = getValue('intermediate_size');
    const num_experts = getValue('num_experts');
    const num_experts_per_tok = getValue('num_experts_per_tok');

    // 计算参数量
    const paramStats = isMoe ? calculateQwen3MoeParams(config) : calculateQwen3Params(config);
    const totalParams = paramStats.total;
    const decoderTotalParams = paramStats.all_layers;
    const decoderActiveParams = paramStats.active_layer_total * hidden_layers;

    // Helper for rendering params if enabled
    const getParams = (p) => showParams ? p : null;
    const getRatio = (r) => showParams ? r : null;

    // SCALED UP SVG config
    const scale = 1.0; // Increased scaling factor for better visibility
    const width = 900 * scale;
    const height = 2400 * scale; // Increased height to prevent overlap
    const centerX = width / 2;
    const blockWidth = 500 * scale;
    const blockHeight = 50 * scale;
    const detailHeight = 450 * scale; // Increased significantly for extra details
    const gap = 60 * scale; // Increased gap between elements

    // Font sizes
    const fsTitle = 32 * scale;
    const fsHead = 18 * scale;
    const fsSub = 14 * scale;
    const fsSmall = 12 * scale;
    const fsIcon = 20 * scale;
    const fsParam = 11 * scale;

    // Theme colors
    const colors = {
        input: '#6366f1',
        norm: '#10b981',
        attn: '#f59e0b',
        ffn: '#3b82f6',
        moe: '#ec4899',
        output: '#8b5cf6',
        line: '#64748b',
        lineHighlight: '#a78bfa',
        text: '#f1f5f9',
        textMuted: '#94a3b8',
        bg: 'rgba(30, 30, 50, 0.6)',
        paramBg: 'rgba(139, 92, 246, 0.15)',
        paramText: '#c4b5fd',
    };

    // Components
    const ArrowMarker = () => (
        <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L8,3 z" fill={colors.line} />
            </marker>
            <marker id="arrow-highlight" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L8,3 z" fill={colors.lineHighlight} />
            </marker>
        </defs>
    );

    const Connection = ({ x1, y1, x2, y2, label }) => (
        <g>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors.line} strokeWidth={2 * scale} markerEnd="url(#arrow)" />
            {label && (
                <rect x={(x1 + x2) / 2 - 30 * scale} y={(y1 + y2) / 2 - 10 * scale} width={60 * scale} height={20 * scale} fill={colors.bg} rx={4 * scale} />
            )}
            {label && (
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2} fill={colors.textMuted} fontSize={fsSmall} dominantBaseline="middle" textAnchor="middle">
                    {label}
                </text>
            )}
        </g>
    );

    const ResidualConnection = ({ startY, endY, offset = 280 * scale }) => {
        const x = centerX + offset;
        return (
            <g>
                <path
                    d={`M ${centerX} ${startY} L ${x} ${startY} L ${x} ${endY} L ${centerX + 18 * scale} ${endY}`}
                    fill="none"
                    stroke={colors.lineHighlight}
                    strokeWidth={1.5 * scale}
                    strokeDasharray={`${6 * scale},${4 * scale}`}
                    markerEnd="url(#arrow-highlight)"
                    opacity="0.8"
                />
                <circle cx={centerX} cy={endY} r={12 * scale} fill={colors.lineHighlight} stroke={colors.text} strokeWidth={1.5 * scale} />
                <text x={centerX} y={endY} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={fsHead} fontWeight="bold">+</text>
                <text x={x + 8 * scale} y={(startY + endY) / 2} fill={colors.textMuted} fontSize={fsSub} dominantBaseline="middle" transform={`rotate(90, ${x + 8 * scale}, ${(startY + endY) / 2})`}>
                    Residual
                </text>
            </g>
        );
    };

    // Block 组件 - 支持参数量显示 (Enhanced with foreignObject for rich content)
    const Block = ({ y, title, subtitle, color, icon, height = blockHeight, params, ratio, paramWidth = 90, paramHeight = 20 }) => (
        <g transform={`translate(${centerX - blockWidth / 2}, ${y})`}>
            <rect
                width={blockWidth}
                height={height}
                rx={12 * scale}
                fill={colors.bg}
                stroke={color}
                strokeWidth={2 * scale}
            />
            <text x={20 * scale} y={height > blockHeight ? 35 * scale : height / 2} fill={colors.text} fontSize={fsHead} fontWeight="bold" dominantBaseline={height > blockHeight ? "auto" : "middle"}>
                {icon} {title}
            </text>
            <text x={blockWidth - 20 * scale} y={height > blockHeight ? 35 * scale : height / 2} fill={colors.textMuted} fontSize={fsSub} textAnchor="end" dominantBaseline={height > blockHeight ? "auto" : "middle"}>
                {subtitle}
            </text>
            {/* 参数量标签 (Using foreignObject for valid HTML styling) */}
            {params && (
                <foreignObject x={blockWidth - paramWidth * scale - 20 * scale} y={height - paramHeight * scale - 8 * scale} width={paramWidth * scale} height={paramHeight * scale}>
                    <div style={{
                        backgroundColor: colors.paramBg,
                        borderRadius: '4px',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${color}30`
                    }}>
                        {typeof params === 'object' ? params : (
                            <span style={{ color: colors.paramText, fontSize: fsParam, fontWeight: 500, whiteSpace: 'nowrap' }}>
                                {params} {ratio && `(${ratio})`}
                            </span>
                        )}
                    </div>
                </foreignObject>
            )}
        </g>
    );

    // Detailed Operations Visualization - 支持参数量显示
    const SmallBox = ({ x, y, w, h, text, color, strokeDasharray, params }) => (
        <g transform={`translate(${x}, ${y})`}>
            <rect width={w} height={h} rx={4 * scale} fill={color} opacity="0.2" stroke={color} strokeDasharray={strokeDasharray} strokeWidth={2} />
            <text x={w / 2} y={params ? h / 2 - 5 * scale : h / 2} textAnchor="middle" dominantBaseline="middle" fill={colors.text} fontSize={fsSmall}>{text}</text>
            {params && (
                <text x={w / 2} y={h / 2 + 9 * scale} textAnchor="middle" dominantBaseline="middle" fill={colors.paramText} fontSize={fsParam - 1}>{params}</text>
            )}
        </g>
    );

    const DetailedInput = ({ y }) => {
        const h = detailHeight * 0.7; // Height for the block
        const boxY = y + 50 * scale;
        const boxW = 85 * scale;
        const boxH = 32 * scale;

        // Layout positions
        const leftX = centerX - 100 * scale;  // Input IDs side
        const rightX = centerX + 100 * scale; // Position IDs side
        const midX = centerX;

        // Vertical positions
        const row1Y = boxY;                       // Input IDs, Position IDs
        const row2Y = boxY + boxH + 22 * scale;   // Embedding
        const row3Y = row2Y + 42 * scale + 26 * scale; // Hidden States
        const row4Y = row3Y + boxH + 28 * scale;  // Rotary Embedding

        return (
            <g>
                <Block y={y} title="Model Inputs & Embeddings" subtitle="" color={colors.input} icon="⌨️" height={h} params={getParams(formatParamCount(paramStats.embedding.total))} ratio={getRatio(calculateParamRatio(paramStats.embedding.total, totalParams))} />

                {/* Row 1: Input IDs (left) and Position IDs (right) */}
                <SmallBox x={leftX - boxW / 2} y={row1Y} w={boxW} h={boxH} text="Input IDs" color={colors.input} />
                <SmallBox x={rightX - boxW / 2} y={row1Y} w={boxW} h={boxH} text="Position IDs" color={colors.input} />

                {/* Arrow: Input IDs → Embedding */}
                <line x1={leftX} y1={row1Y + boxH} x2={leftX} y2={row2Y} stroke={colors.line} strokeWidth={1.5 * scale} markerEnd="url(#arrow)" />

                {/* Row 2: Embedding Table */}
                <SmallBox x={leftX - boxW / 2} y={row2Y} w={boxW} h={40 * scale} text="Embedding" color={colors.input} params={getParams(formatParamCount(paramStats.embedding.embed_tokens))} />

                {/* Arrow: Embedding → Hidden States (curved to center) */}
                <path
                    d={`M ${leftX} ${row2Y + 40 * scale} L ${leftX} ${row2Y + 52 * scale} Q ${leftX} ${row3Y - 8 * scale}, ${midX - boxW * 0.5} ${row3Y + boxH / 2}`}
                    fill="none"
                    stroke={colors.line}
                    strokeWidth={1.5 * scale}
                    markerEnd="url(#arrow)"
                />

                {/* Row 3: Hidden States (center) */}
                <SmallBox x={midX - boxW * 0.6} y={row3Y} w={boxW * 1.2} h={boxH} text="Hidden States" color={colors.input} />

                {/* Branch arrow: Hidden States → Rotary Embedding (dashed, side branch) */}
                <path
                    d={`M ${midX + 20 * scale} ${row3Y + boxH} L ${midX + 20 * scale} ${row4Y}`}
                    fill="none"
                    stroke={colors.line}
                    strokeWidth={1.5 * scale}
                    strokeDasharray="4,3"
                    markerEnd="url(#arrow)"
                />

                {/* Arrow: Position IDs → Rotary Embedding (curved path) */}
                <path
                    d={`M ${rightX} ${row1Y + boxH} L ${rightX} ${row4Y - 20 * scale} Q ${rightX} ${row4Y + 10 * scale}, ${midX + boxW * 0.6} ${row4Y + 18 * scale}`}
                    fill="none"
                    stroke={colors.line}
                    strokeWidth={1.5 * scale}
                    markerEnd="url(#arrow)"
                />

                {/* Row 4: Rotary Embedding */}
                <SmallBox x={midX - boxW * 0.6} y={row4Y} w={boxW * 1.2} h={36 * scale} text="Rotary Emb" color={colors.input} />
                <text x={midX} y={row4Y + 48 * scale} textAnchor="middle" fill={colors.textMuted} fontSize={fsSmall - 1}>
                    → (cos, sin) for Attention
                </text>

                {/* Main output: Hidden States continues straight down to Decoder (solid) */}
                <path
                    d={`M ${midX - 20 * scale} ${row3Y + boxH} L ${midX - 20 * scale} ${y + h - 8 * scale}`}
                    fill="none"
                    stroke={colors.line}
                    strokeWidth={2 * scale}
                    markerEnd="url(#arrow)"
                />
                <text x={midX - 35 * scale} y={y + h - 18 * scale} textAnchor="end" fill={colors.textMuted} fontSize={fsSmall - 1}>
                    hidden_states
                </text>

                {/* RoPE output: (cos, sin) to be used in Attention (dashed, goes down) */}
                <path
                    d={`M ${midX + 20 * scale} ${row4Y + 36 * scale} L ${midX + 20 * scale} ${y + h - 8 * scale}`}
                    fill="none"
                    stroke={colors.lineHighlight}
                    strokeWidth={1.5 * scale}
                    strokeDasharray="5,4"
                    markerEnd="url(#arrow-highlight)"
                />
                <text x={midX + 35 * scale} y={y + h - 18 * scale} textAnchor="start" fill={colors.textMuted} fontSize={fsSmall - 1}>
                    pos_emb
                </text>
            </g>
        );
    };

    const DetailedAttention = ({ y }) => {
        const boxY = y + 60 * scale;
        const spacing = 150 * scale; // Reduced spacing between Q/K/V columns
        const boxW = 80 * scale; // Smaller boxes
        const h = 35 * scale;
        const matY = boxY + h * 6.5; // Pushed down further for more space

        const gqaTotal = paramStats.attention.total_all_layers;
        const gqaLayer = paramStats.attention.total_per_layer;
        const gqaParamsStr = showParams ? `Layer: ${formatParamCount(gqaLayer)} | Stack: ${formatParamCount(gqaTotal)}` : null;

        return (
            <g>
                <Block
                    y={y}
                    title="Grouped Query Attention (GQA)"
                    subtitle={`H=${heads}, KV=${kv_heads}`}
                    color={colors.attn}
                    icon="🔗"
                    height={detailHeight}
                    params={gqaParamsStr}
                    paramWidth={200}
                />

                {/* RoPE Side Inject label - moved further left */}
                <text x={centerX - 260 * scale} y={boxY + h * 3} fill={colors.textMuted} fontSize={fsSmall} textAnchor="end">
                    RoPE (Cos, Sin) ➔
                </text>
                <path d={`M ${centerX - 250 * scale} ${boxY + h * 3} L ${centerX - 200 * scale} ${boxY + h * 3}`} stroke={colors.lineHighlight} strokeWidth={1.5} strokeDasharray="4,4" markerEnd="url(#arrow-highlight)" />

                {/* 1. Projections - Q column */}
                <g transform={`translate(${centerX - spacing}, ${boxY})`}>
                    <SmallBox x={0} y={0} w={boxW} h={h} text="Q Proj" color={colors.attn} params={getParams(formatParamCount(paramStats.attention.q_proj))} />
                    <line x1={boxW / 2} y1={h} x2={boxW / 2} y2={h * 1.6} stroke={colors.line} strokeWidth={1.5} markerEnd="url(#arrow)" />
                    <SmallBox x={0} y={h * 1.6} w={boxW} h={h} text="Q-Norm" color={colors.norm} params={getParams(formatParamCount(paramStats.attention.q_norm))} />
                    <line x1={boxW / 2} y1={h * 2.6} x2={boxW / 2} y2={h * 3.2} stroke={colors.line} strokeWidth={1.5} markerEnd="url(#arrow)" />
                    <rect x={-5 * scale} y={h * 3.2} width={boxW + 10 * scale} height={h} rx={4} fill={colors.input} stroke={colors.input} strokeOpacity="0.5" fillOpacity="0.2" />
                    <text x={boxW / 2} y={h * 3.7} textAnchor="middle" dominantBaseline="middle" fill={colors.text} fontSize={fsSmall}>Apply RoPE</text>
                </g>

                {/* K column */}
                <g transform={`translate(${centerX}, ${boxY})`}>
                    <SmallBox x={-boxW / 2} y={0} w={boxW} h={h} text="K Proj" color={colors.attn} params={getParams(formatParamCount(paramStats.attention.k_proj))} />
                    <line x1={0} y1={h} x2={0} y2={h * 1.6} stroke={colors.line} strokeWidth={1.5} markerEnd="url(#arrow)" />
                    <SmallBox x={-boxW / 2} y={h * 1.6} w={boxW} h={h} text="K-Norm" color={colors.norm} params={getParams(formatParamCount(paramStats.attention.k_norm))} />
                    <line x1={0} y1={h * 2.6} x2={0} y2={h * 3.2} stroke={colors.line} strokeWidth={1.5} markerEnd="url(#arrow)" />
                    <rect x={-boxW / 2 - 5 * scale} y={h * 3.2} width={boxW + 10 * scale} height={h} rx={4} fill={colors.input} stroke={colors.input} strokeOpacity="0.5" fillOpacity="0.2" />
                    <text x={0} y={h * 3.7} textAnchor="middle" dominantBaseline="middle" fill={colors.text} fontSize={fsSmall}>Apply RoPE</text>
                </g>

                {/* V column */}
                <g transform={`translate(${centerX + spacing}, ${boxY})`}>
                    <SmallBox x={-boxW / 2} y={0} w={boxW} h={h} text="V Proj" color={colors.attn} params={getParams(formatParamCount(paramStats.attention.v_proj))} />
                    <line x1={0} y1={h} x2={0} y2={h * 5.5} stroke={colors.line} strokeWidth={1.5} />
                </g>

                {/* Attention Matrix Math - Q * K^T (Dot) */}
                <circle cx={centerX - 60 * scale} cy={matY} r={16 * scale} fill={colors.bg} stroke={colors.attn} strokeWidth={1.5 * scale} />
                <text x={centerX - 60 * scale} y={matY} textAnchor="middle" dominantBaseline="central" fill={colors.text} fontSize={fsSub}>Dot</text>

                {/* Connect Q-RoPE, K-RoPE to Dot */}
                <line x1={centerX - spacing + boxW / 2} y1={boxY + h * 4.2} x2={centerX - 60 * scale - 10} y2={matY - 12 * scale} stroke={colors.line} strokeWidth={1.5} />
                <line x1={centerX} y1={boxY + h * 4.2} x2={centerX - 60 * scale + 10} y2={matY - 12 * scale} stroke={colors.line} strokeWidth={1.5} />

                {/* Scale/Softmax */}
                <SmallBox x={centerX - 100 * scale} y={matY + 25 * scale} w={80 * scale} h={28 * scale} text="Softmax" color={colors.attn} />
                <line x1={centerX - 60 * scale} y1={matY + 16 * scale} x2={centerX - 60 * scale} y2={matY + 25 * scale} stroke={colors.line} strokeWidth={1.5} />

                {/* Weights * V */}
                <circle cx={centerX} cy={matY + 70 * scale} r={16 * scale} fill={colors.bg} stroke={colors.attn} strokeWidth={1.5 * scale} />
                <text x={centerX} y={matY + 70 * scale} textAnchor="middle" dominantBaseline="central" fill={colors.text} fontSize={fsSub}>×</text>

                {/* Connect Softmax, V to mult */}
                <line x1={centerX - 60 * scale} y1={matY + 53 * scale} x2={centerX - 12 * scale} y2={matY + 60 * scale} stroke={colors.line} strokeWidth={1.5} />
                <line x1={centerX + spacing} y1={boxY + h * 5.5} x2={centerX + 12 * scale} y2={matY + 60 * scale} stroke={colors.line} strokeWidth={1.5} />

                {/* O Proj */}
                <SmallBox x={centerX - 40 * scale} y={matY + 95 * scale} w={80 * scale} h={28 * scale} text="O Proj" color={colors.attn} params={getParams(formatParamCount(paramStats.attention.o_proj))} />
                <line x1={centerX} y1={matY + 86 * scale} x2={centerX} y2={matY + 95 * scale} stroke={colors.line} strokeWidth={1.5 * scale} markerEnd="url(#arrow)" />
            </g>
        );
    };

    const DetailedMoE = ({ y }) => {
        const boxY = y + 60 * scale;

        const moeLayer = paramStats.moe?.moe_block_total || 0;
        const moeTotal = moeLayer * (paramStats.config?.num_hidden_layers || 48);

        const moeActiveLayer = paramStats.moe?.active_per_layer || 0;
        const moeActiveStack = moeActiveLayer * (paramStats.config?.num_hidden_layers || 48);

        const expertParams = showParams ? formatParamCount(paramStats.moe?.single_expert) : null;

        const moeParamsContent = showParams ? (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontSize: '10px', lineHeight: '1.4', padding: '2px 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '2px', paddingBottom: '1px' }}>
                    <span style={{ fontWeight: 600, color: colors.text }}>Total:</span>
                    <span>L: {formatParamCount(moeLayer)} | S: {formatParamCount(moeTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                    <span style={{ fontWeight: 600 }}>Active:</span>
                    <span>L: {formatParamCount(moeActiveLayer)} | S: {formatParamCount(moeActiveStack)}</span>
                </div>
            </div>
        ) : null;

        return (
            <g>
                <Block
                    y={y}
                    title="Sparse Mixture of Experts (MoE)"
                    subtitle={`Top-${num_experts_per_tok} of ${num_experts}`}
                    color={colors.moe}
                    icon="🚦"
                    height={detailHeight}
                    params={moeParamsContent}
                    paramWidth={220}
                    paramHeight={40}
                />

                {/* Router */}
                <g transform={`translate(${centerX - 35 * scale}, ${boxY})`}>
                    <SmallBox x={0} y={0} w={70 * scale} h={35 * scale} text="Router" color={colors.moe} params={getParams(formatParamCount(paramStats.moe?.router_gate))} />
                    <line x1={35 * scale} y1={-12 * scale} x2={35 * scale} y2={0} stroke={colors.line} strokeWidth={1.5 * scale} markerEnd="url(#arrow)" />
                </g>

                {/* Experts Distribution */}
                <text x={centerX} y={boxY + 55 * scale} textAnchor="middle" fill={colors.textMuted} fontSize={fsSmall}>Gating Weights</text>

                {/* Expert Paths - more spread out */}
                <path d={`M ${centerX} ${boxY + 35 * scale} C ${centerX} ${boxY + 65 * scale}, ${centerX - 160 * scale} ${boxY + 55 * scale}, ${centerX - 160 * scale} ${boxY + 85 * scale}`} fill="none" stroke={colors.moe} strokeDasharray={`${6 * scale},${4 * scale}`} strokeWidth={1.5} />
                <path d={`M ${centerX} ${boxY + 35 * scale} C ${centerX} ${boxY + 65 * scale}, ${centerX} ${boxY + 55 * scale}, ${centerX} ${boxY + 95 * scale}`} fill="none" stroke={colors.moe} strokeWidth={1.5 * scale} />
                <path d={`M ${centerX} ${boxY + 35 * scale} C ${centerX} ${boxY + 65 * scale}, ${centerX + 160 * scale} ${boxY + 55 * scale}, ${centerX + 160 * scale} ${boxY + 85 * scale}`} fill="none" stroke={colors.moe} strokeDasharray={`${6 * scale},${4 * scale}`} strokeWidth={1.5} />

                {/* Experts - better positioned */}
                <SmallBox x={centerX - 195 * scale} y={boxY + 85 * scale} w={70 * scale} h={45 * scale} text="Expert 1" color={colors.moe} params={expertParams} />
                <SmallBox x={centerX - 35 * scale} y={boxY + 95 * scale} w={70 * scale} h={45 * scale} text="..." color={colors.moe} />
                <SmallBox x={centerX + 125 * scale} y={boxY + 85 * scale} w={70 * scale} h={45 * scale} text="Expert N" color={colors.moe} params={expertParams} />

                {/* Summation - more space below experts */}
                <circle cx={centerX} cy={boxY + 175 * scale} r={16 * scale} fill={colors.bg} stroke={colors.moe} strokeWidth={1.5 * scale} />
                <text x={centerX} y={boxY + 175 * scale} textAnchor="middle" dominantBaseline="central" fill={colors.text} fontSize={fsIcon}>Σ</text>
                <text x={centerX + 30 * scale} y={boxY + 175 * scale} fill={colors.textMuted} fontSize={fsSmall}>Weighted Sum</text>

                <line x1={centerX - 160 * scale} y1={boxY + 130 * scale} x2={centerX - 12 * scale} y2={boxY + 163 * scale} stroke={colors.line} strokeWidth={1.5} />
                <line x1={centerX} y1={boxY + 140 * scale} x2={centerX} y2={boxY + 159 * scale} stroke={colors.line} strokeWidth={1.5} />
                <line x1={centerX + 160 * scale} y1={boxY + 130 * scale} x2={centerX + 12 * scale} y2={boxY + 163 * scale} stroke={colors.line} strokeWidth={1.5} />
            </g>
        );
    };

    // Layout - Adjusted for better spacing
    const pos = {};
    let currentY = 40 * scale;

    pos.titleY = currentY;

    currentY += 70 * scale;
    pos.inputY = currentY;
    // detailed input takes extra space - increased for DetailedInput height
    const inputBlockHeight = detailHeight * 0.7;
    currentY += inputBlockHeight + 30 * scale;
    pos.inputConnY = currentY;

    currentY += 60 * scale; // Gap before Decoder Block

    // Transformer Block Start
    pos.blockStartY = currentY;
    pos.norm1Y = currentY;
    pos.norm1ConnY = currentY + blockHeight;

    currentY += blockHeight + gap;
    pos.attnY = currentY; // Detailed Attention starts here

    // Residual 1
    pos.residual1StartY = pos.blockStartY + blockHeight / 2;
    pos.residual1EndY = currentY + detailHeight + 40 * scale;

    currentY += detailHeight + 80 * scale; // Space for Attention + Add
    pos.norm2Y = currentY;
    pos.norm2ConnY = currentY + blockHeight;

    currentY += blockHeight + gap;
    pos.ffnY = currentY; // FFN / MoE starts here

    const ffnHeight = isMoe ? detailHeight : blockHeight;
    pos.residual2StartY = pos.norm2Y - gap - blockHeight / 2;
    pos.residual2EndY = currentY + ffnHeight + 40 * scale;

    currentY += ffnHeight + 80 * scale;
    pos.blockEndConnY = currentY;

    // End Loop wrapper
    pos.blockEndY = currentY + 30 * scale;

    // Output
    currentY += gap * 2;
    pos.finalNormY = currentY;
    pos.finalNormConnY = currentY + blockHeight;

    currentY += blockHeight + gap;
    pos.headY = currentY;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="architecture-svg" style={{ minWidth: '100%', minHeight: '100%' }}>
            <ArrowMarker />

            {/* Toggle Switch */}
            <foreignObject x={width - 180 * scale} y={20 * scale} width={160 * scale} height={40 * scale}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', color: colors.text, fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 500 }}>
                    <span>参数量</span>
                    <div
                        onClick={() => setShowParams(!showParams)}
                        style={{
                            position: 'relative', width: '36px', height: '20px',
                            backgroundColor: showParams ? colors.moe : 'rgba(255,255,255,0.2)',
                            borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: '2px', left: showParams ? '18px' : '2px',
                            width: '16px', height: '16px', backgroundColor: 'white',
                            borderRadius: '50%', transition: 'all 0.3s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }} />
                    </div>
                </div>
            </foreignObject>

            {/* Decoder Block Wrapper (Background Layer - Rendered First) */}
            <rect
                x={centerX - blockWidth / 2 - 30 * scale}
                y={pos.blockStartY - 15 * scale}
                width={blockWidth + 80 * scale}
                height={pos.blockEndY - pos.blockStartY + 30 * scale}
                fill="none"
                stroke={colors.line}
                strokeDasharray={`${8 * scale},${8 * scale}`}
                strokeWidth={1.5 * scale}
                rx={16 * scale}
                opacity="0.5"
            />
            <text x={centerX} y={pos.blockStartY - 30 * scale} fill={colors.textMuted} fontSize={fsSub} fontWeight="bold" textAnchor="middle">
                × {hidden_layers} Decoder Layers
            </text>

            {/* Decoder Stack Total Params */}
            {showParams && (
                <g>
                    <rect
                        x={centerX + blockWidth / 2 + 60 * scale}
                        y={(pos.blockStartY + pos.blockEndY) / 2 - 80 * scale}
                        width={160 * scale}
                        height={160 * scale}
                        rx={8 * scale}
                        fill={colors.bg}
                        stroke={colors.line}
                        strokeDasharray="2,2"
                        opacity="0.9"
                        filter="url(#dropShadow)"
                    />
                    {/* Total */}
                    <text x={centerX + blockWidth / 2 + 140 * scale} y={(pos.blockStartY + pos.blockEndY) / 2 - 35 * scale}
                        fill={colors.textMuted} fontSize={fsSub} fontWeight="bold" textAnchor="middle">
                        Stack Total
                    </text>
                    <text x={centerX + blockWidth / 2 + 140 * scale} y={(pos.blockStartY + pos.blockEndY) / 2 - 10 * scale}
                        fill={colors.moe} fontSize={fsHead} fontWeight="bold" textAnchor="middle">
                        {formatParamCount(decoderTotalParams)}
                    </text>

                    {/* Divider */}
                    <line x1={centerX + blockWidth / 2 + 80 * scale} y1={(pos.blockStartY + pos.blockEndY) / 2 + 5 * scale}
                        x2={centerX + blockWidth / 2 + 200 * scale} y2={(pos.blockStartY + pos.blockEndY) / 2 + 5 * scale}
                        stroke={colors.line} strokeWidth={1} strokeDasharray="4,4" opacity="0.5" />

                    {/* Active */}
                    <text x={centerX + blockWidth / 2 + 140 * scale} y={(pos.blockStartY + pos.blockEndY) / 2 + 30 * scale}
                        fill={colors.textMuted} fontSize={fsSub} fontWeight="bold" textAnchor="middle">
                        Stack Active
                    </text>
                    <text x={centerX + blockWidth / 2 + 140 * scale} y={(pos.blockStartY + pos.blockEndY) / 2 + 55 * scale}
                        fill="#059669" fontSize={fsHead} fontWeight="bold" textAnchor="middle">
                        {formatParamCount(decoderActiveParams)}
                    </text>
                    {/* Connecting line */}
                    <line
                        x1={centerX + blockWidth / 2 + 50 * scale} y1={(pos.blockStartY + pos.blockEndY) / 2}
                        x2={centerX + blockWidth / 2 + 60 * scale} y2={(pos.blockStartY + pos.blockEndY) / 2}
                        stroke={colors.line} strokeWidth={1} strokeDasharray="2,2"
                    />
                </g>
            )}

            <text x={centerX} y={pos.titleY} textAnchor="middle" fill={colors.text} fontSize={fsTitle} fontWeight="bold">
                {isMoe ? 'Qwen3-MoE' : 'Qwen3'} Architecture Flow
            </text>
            {/* Parameter Total Summary (Controlled by toggle) */}
            {showParams && (
                <g transform={`translate(${centerX}, ${pos.titleY + 25 * scale})`}>
                    <rect x={-180 * scale} y={0} width={360 * scale} height={28 * scale} rx={6 * scale} fill={colors.paramBg} />
                    <text x={0} y={14 * scale} textAnchor="middle" dominantBaseline="middle" fill={colors.paramText} fontSize={fsSub}>
                        📊 总参数量: {formatParamCount(totalParams)} {isMoe && paramStats.active_total && `(激活: ${formatParamCount(paramStats.active_total)})`}
                    </text>
                </g>
            )}

            {/* Input (Detailed) */}
            <DetailedInput y={pos.inputY} />
            <Connection x1={centerX} y1={pos.inputConnY} x2={centerX} y2={pos.norm1Y} />

            {/* Norm 1 */}
            <Block y={pos.norm1Y} title="RMSNorm" subtitle="Input LayerNorm" color={colors.norm} icon="⚖️" params={getParams(formatParamCount(paramStats.norm?.input_layernorm))} />
            <Connection x1={centerX} y1={pos.norm1ConnY} x2={centerX} y2={pos.attnY} />

            {/* Attention (Detailed) */}
            <DetailedAttention y={pos.attnY} />

            {/* Residual: Input -> Post-Attention */}
            <ResidualConnection startY={pos.inputConnY - 20 * scale} endY={pos.residual1EndY} />

            <Connection x1={centerX} y1={pos.residual1EndY + 12 * scale} x2={centerX} y2={pos.norm2Y} />

            {/* Norm 2 */}
            <Block y={pos.norm2Y} title="RMSNorm" subtitle="Post-Attention" color={colors.norm} icon="⚖️" params={getParams(formatParamCount(paramStats.norm?.post_attention_layernorm))} />
            <Connection x1={centerX} y1={pos.norm2ConnY} x2={centerX} y2={pos.ffnY} />

            {/* FFN / MoE */}
            {isMoe ? (
                <DetailedMoE y={pos.ffnY} />
            ) : (
                <g>
                    <Block y={pos.ffnY} title="SwiGLU MLP" subtitle={`Inter: ${intermediate_size}`} color={colors.ffn} icon="🧠" params={getParams(formatParamCount(paramStats.mlp?.total_per_layer))} ratio={getRatio(calculateParamRatio(paramStats.mlp?.total_all_layers, totalParams))} />
                    <Connection x1={centerX} y1={pos.ffnY + blockHeight} x2={centerX} y2={pos.residual2EndY} />
                </g>
            )}

            {/* Residual: Post-Attn -> Post-FFN */}
            <ResidualConnection startY={pos.norm2Y - 30 * scale} endY={pos.residual2EndY} />

            {/* Loop Output Connection */}
            <Connection x1={centerX} y1={pos.blockEndConnY} x2={centerX} y2={pos.finalNormY} />

            {/* Final Output */}
            <Block y={pos.finalNormY} title="Final RMSNorm" subtitle="" color={colors.norm} icon="⚖️" params={getParams(formatParamCount(paramStats.norm?.final_norm))} />
            <Connection x1={centerX} y1={pos.finalNormConnY} x2={centerX} y2={pos.headY} />
            <Block y={pos.headY} title="LM Head (Linear)" subtitle={paramStats.lm_head.tied ? 'Tied w/ Embed' : `Vocab: ${vocab_size}`} color={colors.output} icon="🎯" params={getParams(formatParamCount(paramStats.lm_head.params))} />

        </svg>
    );
}

export default ArchitectureDiagram;

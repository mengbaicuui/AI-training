import React from 'react';

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

    const vocab_size = getValue('vocab_size');
    const hidden_layers = getValue('num_hidden_layers');
    const heads = getValue('num_attention_heads');
    const kv_heads = getValue('num_key_value_heads') || heads;
    const intermediate_size = getValue('intermediate_size');
    const num_experts = getValue('num_experts');
    const num_experts_per_tok = getValue('num_experts_per_tok');

    // SCALED UP SVG config (2x multiplier)
    const scale = 0.7; // Scaling factor
    const width = 1000 * scale;
    const height = 2000 * scale;
    const centerX = width / 2;
    const blockWidth = 600 * scale;
    const blockHeight = 60 * scale;
    const detailHeight = 350 * scale; // Increased for extra details
    const gap = 50 * scale;

    // Font sizes
    const fsTitle = 32 * scale;
    const fsHead = 18 * scale;
    const fsSub = 14 * scale;
    const fsSmall = 12 * scale;
    const fsIcon = 20 * scale;

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
        bg: 'rgba(30, 30, 50, 0.6)'
    };

    // Components
    const ArrowMarker = () => (
        <defs>
            <marker id="arrow" markerWidth="24" markerHeight="24" refX="20" refY="6" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,12 L18,6 z" fill={colors.line} transform="scale(1)" />
            </marker>
            <marker id="arrow-highlight" markerWidth="24" markerHeight="24" refX="20" refY="6" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,12 L18,6 z" fill={colors.lineHighlight} />
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

    const ResidualConnection = ({ startY, endY, offset = 340 * scale }) => {
        const x = centerX + offset;
        return (
            <g>
                <path
                    d={`M ${centerX} ${startY} L ${x} ${startY} L ${x} ${endY} L ${centerX + 24 * scale} ${endY}`}
                    fill="none"
                    stroke={colors.lineHighlight}
                    strokeWidth={2 * scale}
                    strokeDasharray={`${6 * scale},${4 * scale}`}
                    markerEnd="url(#arrow-highlight)"
                    opacity="0.8"
                />
                <circle cx={centerX} cy={endY} r={14 * scale} fill={colors.lineHighlight} stroke={colors.text} strokeWidth={2 * scale} />
                <text x={centerX} y={endY} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={fsHead} fontWeight="bold">+</text>
                <text x={x + 10 * scale} y={(startY + endY) / 2} fill={colors.textMuted} fontSize={fsSub} dominantBaseline="middle" transform={`rotate(90, ${x + 10 * scale}, ${(startY + endY) / 2})`}>
                    Residual
                </text>
            </g>
        );
    };

    const Block = ({ y, title, subtitle, color, icon, height = blockHeight }) => (
        <g transform={`translate(${centerX - blockWidth / 2}, ${y})`}>
            <rect
                width={blockWidth}
                height={height}
                rx={12 * scale}
                fill={colors.bg}
                stroke={color}
                strokeWidth={2 * scale}
            />
            <text x={20 * scale} y={35 * scale} fill={colors.text} fontSize={fsHead} fontWeight="bold">
                {icon} {title}
            </text>
            <text x={blockWidth - 20 * scale} y={35 * scale} fill={colors.textMuted} fontSize={fsSub} textAnchor="end">
                {subtitle}
            </text>
        </g>
    );

    // Detailed Operations Visualization
    const SmallBox = ({ x, y, w, h, text, color, strokeDasharray }) => (
        <g transform={`translate(${x}, ${y})`}>
            <rect width={w} height={h} rx={4 * scale} fill={color} opacity="0.2" stroke={color} strokeDasharray={strokeDasharray} strokeWidth={2} />
            <text x={w / 2} y={h / 2} textAnchor="middle" dominantBaseline="middle" fill={colors.text} fontSize={fsSmall}>{text}</text>
        </g>
    );

    const DetailedInput = ({ y }) => {
        const h = detailHeight * 0.7; // Taller for split view
        const boxY = y + 60 * scale;
        const w = blockWidth * 0.9;

        // Split width for Embedding vs RoPE Pre-calc
        const col1X = centerX - w * 0.25;
        const col2X = centerX + w * 0.25;

        return (
            <g>
                <Block y={y} title="Model Inputs & Embeddings" subtitle="" color={colors.input} icon="⌨️" height={h} />

                {/* Left Col: Token Embeddings */}
                <g transform={`translate(${col1X - w * 0.2}, ${boxY})`}>
                    <SmallBox x={0} y={0} w={w * 0.2} h={40 * scale} text="Input IDs" color={colors.input} />
                    <line x1={w * 0.1} y1={40 * scale} x2={w * 0.1} y2={60 * scale} stroke={colors.line} strokeWidth={2 * scale} markerEnd="url(#arrow)" />
                    <SmallBox x={0} y={60 * scale} w={w * 0.2} h={50 * scale} text="Embedding Table" color={colors.input} />
                    <line x1={w * 0.1} y1={110 * scale} x2={w * 0.1} y2={130 * scale} stroke={colors.line} strokeWidth={2 * scale} markerEnd="url(#arrow)" />
                    <SmallBox x={0} y={130 * scale} w={w * 0.2} h={40 * scale} text="Hidden States" color={colors.input} />
                </g>

                {/* Right Col: RoPE Pre-calculation */}
                <g transform={`translate(${col2X - w * 0.2}, ${boxY})`}>
                    <SmallBox x={0} y={0} w={w * 0.25} h={40 * scale} text="Position IDs" color={colors.input} />
                    <line x1={w * 0.125} y1={40 * scale} x2={w * 0.125} y2={60 * scale} stroke={colors.line} strokeWidth={2 * scale} markerEnd="url(#arrow)" />
                    <SmallBox x={0} y={60 * scale} w={w * 0.25} h={50 * scale} text="Rotary Emb (Cos/Sin)" color={colors.input} />

                    {/* Dashed line to side indicating broadcast */}
                    <path d={`M ${w * 0.125} 110 * scale L ${w * 0.125} 150 * scale`} stroke={colors.lineHighlight} strokeWidth={2 * scale} strokeDasharray="5,5" markerEnd="url(#arrow-highlight)" />
                    <text x={w * 0.125} y={160 * scale} textAnchor="middle" fill={colors.textMuted} fontSize={fsSmall}>Broadcast to Attention</text>
                </g>

                {/* Merge visual removed - they go separately */}
            </g>
        );
    };

    const DetailedAttention = ({ y }) => {
        const boxY = y + 70 * scale;
        const spacing = 200 * scale;
        const boxW = 100 * scale;
        const h = 40 * scale;
        const matY = boxY + h * 5.0; // Pushed down further

        return (
            <g>
                <Block y={y} title="Grouped Query Attention (GQA)" subtitle={`H=${heads}, KV=${kv_heads}`} color={colors.attn} icon="🔗" height={detailHeight} />

                {/* RoPE Side Inject label */}
                <text x={centerX - 350 * scale} y={boxY + h * 2.5} fill={colors.textMuted} fontSize={fsSmall} textAnchor="end">
                    Rotary Pos Emb (Cos, Sin) ➔
                </text>
                <path d={`M ${centerX - 340 * scale} ${boxY + h * 2.5} L ${centerX - 280 * scale} ${boxY + h * 2.5}`} stroke={colors.lineHighlight} strokeWidth={2} strokeDasharray="4,4" markerEnd="url(#arrow-highlight)" />

                {/* 1. Projections */}
                <g transform={`translate(${centerX - spacing}, ${boxY})`}>
                    <SmallBox x={0} y={0} w={boxW} h={h} text="Q Proj" color={colors.attn} />
                    {/* Q Norm */}
                    <line x1={boxW / 2} y1={h} x2={boxW / 2} y2={h * 1.5} stroke={colors.line} strokeWidth={2} markerEnd="url(#arrow)" />
                    <SmallBox x={0} y={h * 1.5} w={boxW} h={h} text="Q-Norm" color={colors.norm} />

                    {/* RoPE Application */}
                    <line x1={boxW / 2} y1={h * 2.5} x2={boxW / 2} y2={h * 3} stroke={colors.line} strokeWidth={2} markerEnd="url(#arrow)" />
                    <rect x={-10 * scale} y={h * 3} width={boxW + 20 * scale} height={h} rx={4} fill={colors.input} stroke={colors.input} strokeOpacity="0.5" fillOpacity="0.2" />
                    <text x={boxW / 2} y={h * 3.5} textAnchor="middle" dominantBaseline="middle" fill={colors.text} fontSize={fsSmall}>Apply RoPE</text>
                </g>

                <g transform={`translate(${centerX}, ${boxY})`}>
                    <SmallBox x={-boxW / 2} y={0} w={boxW} h={h} text="K Proj" color={colors.attn} />
                    {/* K Norm */}
                    <line x1={0} y1={h} x2={0} y2={h * 1.5} stroke={colors.line} strokeWidth={2} markerEnd="url(#arrow)" />
                    <SmallBox x={-boxW / 2} y={h * 1.5} w={boxW} h={h} text="K-Norm" color={colors.norm} />

                    {/* RoPE Application */}
                    <line x1={0} y1={h * 2.5} x2={0} y2={h * 3} stroke={colors.line} strokeWidth={2} markerEnd="url(#arrow)" />
                    <rect x={-boxW / 2 - 10 * scale} y={h * 3} width={boxW + 20 * scale} height={h} rx={4} fill={colors.input} stroke={colors.input} strokeOpacity="0.5" fillOpacity="0.2" />
                    <text x={0} y={h * 3.5} textAnchor="middle" dominantBaseline="middle" fill={colors.text} fontSize={fsSmall}>Apply RoPE</text>
                </g>

                <g transform={`translate(${centerX + spacing}, ${boxY})`}>
                    <SmallBox x={-boxW} y={0} w={boxW} h={h} text="V Proj" color={colors.attn} />
                    <line x1={-boxW / 2} y1={h} x2={-boxW / 2} y2={h * 4.5} stroke={colors.line} strokeWidth={2} markerEnd="url(#arrow)" />
                </g>

                {/* Attention Matrix Math */}
                {/* Q * K^T */}
                <circle cx={centerX - 80 * scale} cy={matY} r={20 * scale} fill={colors.bg} stroke={colors.attn} strokeWidth={2 * scale} />
                <text x={centerX - 80 * scale} y={matY} textAnchor="middle" dominantBaseline="central" fill={colors.text} fontSize={fsHead}>Dot</text>

                {/* Connect Q-RoPE, K-RoPE to Dot */}
                <line x1={centerX - spacing + boxW / 2} y1={boxY + h * 4} x2={centerX - 80 * scale} y2={matY - 20 * scale} stroke={colors.line} strokeWidth={2} />
                <line x1={centerX} y1={boxY + h * 4} x2={centerX - 80 * scale} y2={matY - 20 * scale} stroke={colors.line} strokeWidth={2} />

                {/* Scale/Softmax */}
                <SmallBox x={centerX - 130 * scale} y={matY + 30 * scale} w={100 * scale} h={30 * scale} text="Softmax" color={colors.attn} />
                <line x1={centerX - 80 * scale} y1={matY + 20 * scale} x2={centerX - 80 * scale} y2={matY + 30 * scale} stroke={colors.line} strokeWidth={2} />

                {/* Weights * V */}
                <circle cx={centerX} cy={matY + 80 * scale} r={20 * scale} fill={colors.bg} stroke={colors.attn} strokeWidth={2 * scale} />
                <text x={centerX} y={matY + 80 * scale} textAnchor="middle" dominantBaseline="central" fill={colors.text} fontSize={fsHead}>×</text>

                {/* Connect Softmax, V to mult */}
                <line x1={centerX - 80 * scale} y1={matY + 60 * scale} x2={centerX - 15 * scale} y2={matY + 70 * scale} stroke={colors.line} strokeWidth={2} />
                <line x1={centerX + spacing - boxW / 2} y1={boxY + h * 4.5} x2={centerX + 15 * scale} y2={matY + 70 * scale} stroke={colors.line} strokeWidth={2} />

                {/* O Proj */}
                <SmallBox x={centerX - 50 * scale} y={matY + 110 * scale} w={100 * scale} h={30 * scale} text="O Proj" color={colors.attn} />
                <line x1={centerX} y1={matY + 95 * scale} x2={centerX} y2={matY + 110 * scale} stroke={colors.line} strokeWidth={2 * scale} markerEnd="url(#arrow)" />
            </g>
        );
    };

    const DetailedMoE = ({ y }) => {
        const boxY = y + 70 * scale;
        return (
            <g>
                <Block y={y} title="Sparse Mixture of Experts (MoE)" subtitle={`Top-${num_experts_per_tok} of ${num_experts}`} color={colors.moe} icon="🚦" height={detailHeight} />

                {/* Router */}
                <g transform={`translate(${centerX - 40 * scale}, ${boxY})`}>
                    <SmallBox x={0} y={0} w={80 * scale} h={40 * scale} text="Router" color={colors.moe} />
                    <line x1={40 * scale} y1={-15 * scale} x2={40 * scale} y2={0} stroke={colors.line} strokeWidth={2 * scale} markerEnd="url(#arrow)" />
                </g>

                {/* Experts Distribution */}
                <text x={centerX} y={boxY + 60 * scale} textAnchor="middle" fill={colors.textMuted} fontSize={fsSmall}>Gating Weights</text>

                {/* Expert Paths */}
                <path d={`M ${centerX} ${boxY + 40 * scale} C ${centerX} ${boxY + 70 * scale}, ${centerX - 200 * scale} ${boxY + 60 * scale}, ${centerX - 200 * scale} ${boxY + 90 * scale}`} fill="none" stroke={colors.moe} strokeDasharray={`${6 * scale},${4 * scale}`} strokeWidth={2} />
                <path d={`M ${centerX} ${boxY + 40 * scale} C ${centerX} ${boxY + 70 * scale}, ${centerX} ${boxY + 60 * scale}, ${centerX} ${boxY + 90 * scale}`} fill="none" stroke={colors.moe} strokeWidth={2 * scale} />
                <path d={`M ${centerX} ${boxY + 40 * scale} C ${centerX} ${boxY + 70 * scale}, ${centerX + 200 * scale} ${boxY + 60 * scale}, ${centerX + 200 * scale} ${boxY + 90 * scale}`} fill="none" stroke={colors.moe} strokeDasharray={`${6 * scale},${4 * scale}`} strokeWidth={2} />

                {/* Experts */}
                <SmallBox x={centerX - 240 * scale} y={boxY + 90 * scale} w={80 * scale} h={50 * scale} text="Expert 1" color={colors.moe} />
                <SmallBox x={centerX - 40 * scale} y={boxY + 90 * scale} w={80 * scale} h={50 * scale} text="..." color={colors.moe} />
                <SmallBox x={centerX + 160 * scale} y={boxY + 90 * scale} w={80 * scale} h={50 * scale} text="Expert N" color={colors.moe} />

                {/* Summation */}
                <circle cx={centerX} cy={boxY + 170 * scale} r={18 * scale} fill={colors.bg} stroke={colors.moe} strokeWidth={2 * scale} />
                <text x={centerX} y={boxY + 170 * scale} textAnchor="middle" dominantBaseline="central" fill={colors.text} fontSize={fsIcon}>Σ</text>
                <text x={centerX + 35 * scale} y={boxY + 170 * scale} fill={colors.textMuted} fontSize={fsSmall}>Weighted Sum</text>

                <line x1={centerX - 200 * scale} y1={boxY + 140 * scale} x2={centerX - 15 * scale} y2={boxY + 160 * scale} stroke={colors.line} strokeWidth={2} />
                <line x1={centerX} y1={boxY + 140 * scale} x2={centerX} y2={boxY + 152 * scale} stroke={colors.line} strokeWidth={2} />
                <line x1={centerX + 200 * scale} y1={boxY + 140 * scale} x2={centerX + 15 * scale} y2={boxY + 160 * scale} stroke={colors.line} strokeWidth={2} />
            </g>
        );
    };

    // Layout
    const pos = {};
    let currentY = 50 * scale;

    pos.titleY = currentY;

    currentY += 80 * scale;
    pos.inputY = currentY;
    // detailed input takes extra space
    currentY += 100 * scale;
    pos.inputConnY = currentY + 40 * scale;

    currentY += 80 * scale;

    // Transformer Block Start
    pos.blockStartY = currentY;
    pos.norm1Y = currentY;
    pos.norm1ConnY = currentY + blockHeight;

    currentY += blockHeight + gap;
    pos.attnY = currentY; // Detailed detailed Attention starts here

    // Residual 1
    pos.residual1StartY = pos.blockStartY + blockHeight / 2;
    pos.residual1EndY = currentY + detailHeight + 30 * scale;

    currentY += detailHeight + 60 * scale; // Space for Attention + Add
    pos.norm2Y = currentY;
    pos.norm2ConnY = currentY + blockHeight;

    currentY += blockHeight + gap;
    pos.ffnY = currentY; // FFN / MoE starts here

    const ffnHeight = isMoe ? detailHeight : blockHeight;
    pos.residual2StartY = pos.norm2Y - gap - blockHeight / 2;
    pos.residual2EndY = currentY + ffnHeight + 30 * scale;

    currentY += ffnHeight + 60 * scale;
    pos.blockEndConnY = currentY;

    // End Loop wrapper
    pos.blockEndY = currentY + 20 * scale;

    // Output
    currentY += gap * 2;
    pos.finalNormY = currentY;
    pos.finalNormConnY = currentY + blockHeight;

    currentY += blockHeight + gap;
    pos.headY = currentY;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="architecture-svg" style={{ minWidth: '100%', minHeight: '100%' }}>
            <ArrowMarker />

            {/* Decoder Block Wrapper (Background Layer - Rendered First) */}
            <rect
                x={centerX - blockWidth / 2 - 40 * scale}
                y={pos.blockStartY - 20 * scale}
                width={blockWidth + 80 * scale}
                height={pos.blockEndY - pos.blockStartY + 40 * scale}
                fill="none"
                stroke={colors.line}
                strokeDasharray={`${8 * scale},${8 * scale}`}
                strokeWidth={2 * scale}
                rx={20 * scale}
                opacity="0.5"
            />
            <text x={centerX - blockWidth / 2 - 30 * scale} y={pos.blockStartY - 40 * scale} fill={colors.textMuted} fontSize={fsHead} fontWeight="bold">
                × {hidden_layers} Decoder Layers
            </text>

            <text x={centerX} y={pos.titleY} textAnchor="middle" fill={colors.text} fontSize={fsTitle} fontWeight="bold">
                {isMoe ? 'Qwen3-MoE' : 'Qwen3'} Architecture Flow
            </text>

            {/* Input (Detailed) */}
            <DetailedInput y={pos.inputY} />
            <Connection x1={centerX} y1={pos.inputConnY} x2={centerX} y2={pos.norm1Y} />

            {/* Norm 1 */}
            <Block y={pos.norm1Y} title="RMSNorm" subtitle="" color={colors.norm} icon="⚖️" />
            <Connection x1={centerX} y1={pos.norm1ConnY} x2={centerX} y2={pos.attnY} />

            {/* Attention (Detailed) */}
            <DetailedAttention y={pos.attnY} />

            {/* Residual: Input -> Post-Attention */}
            {/* Note: In code it's `hidden_states = residual + hidden_states` */}
            {/* We draw the line from BEFORE Norm1 to AFTER Attention */}
            {/* The residual starts at `pos.inputConnY` level effectively, or just before Norm1 */}
            {/* Adjusting startY to be clearly above Norm1 */}
            <ResidualConnection startY={pos.inputConnY - 20 * scale} endY={pos.residual1EndY} />

            <Connection x1={centerX} y1={pos.residual1EndY + 12 * scale} x2={centerX} y2={pos.norm2Y} />

            {/* Norm 2 */}
            <Block y={pos.norm2Y} title="RMSNorm" subtitle="Post-Attention" color={colors.norm} icon="⚖️" />
            <Connection x1={centerX} y1={pos.norm2ConnY} x2={centerX} y2={pos.ffnY} />

            {/* FFN / MoE */}
            {isMoe ? (
                <DetailedMoE y={pos.ffnY} />
            ) : (
                <g>
                    <Block y={pos.ffnY} title="SwiGLU MLP" subtitle={`Inter: ${intermediate_size}`} color={colors.ffn} icon="🧠" />
                    <Connection x1={centerX} y1={pos.ffnY + blockHeight} x2={centerX} y2={pos.residual2EndY} />
                </g>
            )}

            {/* Residual: Post-Attn -> Post-FFN */}
            {/* Starts before Norm2 */}
            <ResidualConnection startY={pos.norm2Y - 30 * scale} endY={pos.residual2EndY} />

            {/* Loop Output Connection */}
            <Connection x1={centerX} y1={pos.blockEndConnY} x2={centerX} y2={pos.finalNormY} />

            {/* Final Output */}
            <Block y={pos.finalNormY} title="Final RMSNorm" subtitle="" color={colors.norm} icon="⚖️" />
            <Connection x1={centerX} y1={pos.finalNormConnY} x2={centerX} y2={pos.headY} />
            <Block y={pos.headY} title="LM Head (Linear)" subtitle={`Vocab: ${vocab_size}`} color={colors.output} icon="🎯" />

        </svg>
    );
}

export default ArchitectureDiagram;

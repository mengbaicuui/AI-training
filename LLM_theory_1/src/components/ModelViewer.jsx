import { useState } from 'react';

function ModelViewer({ architecture, config, selectedNode, onNodeSelect, isMoe }) {
    return (
        <div className="model-viewer">
            <LayerNode
                node={architecture}
                depth={0}
                path={[architecture]}
                selectedNode={selectedNode}
                onNodeSelect={onNodeSelect}
                isMoe={isMoe}
            />
        </div>
    );
}

function LayerNode({ node, depth, path, selectedNode, onNodeSelect, isMoe }) {
    const [isExpanded, setIsExpanded] = useState(depth < 2);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    const handleClick = (e) => {
        e.stopPropagation();
        onNodeSelect(node, path);
    };

    const handleExpandClick = (e) => {
        e.stopPropagation();
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
    };

    const getLayerIcon = (nodeName) => {
        if (nodeName.includes('Embedding')) return '📝';
        if (nodeName.includes('Attention')) return '🎯';
        if (nodeName.includes('MLP') || nodeName.includes('mlp')) return '🔗';
        if (nodeName.includes('MoeSparseMoeBlock') || nodeName.includes('SparseMoe')) return '🌟';
        if (nodeName.includes('Norm')) return '📊';
        if (nodeName.includes('Linear') || nodeName.includes('proj')) return '➡️';
        if (nodeName.includes('experts')) return '👥';
        if (nodeName.includes('gate')) return '🚪';
        if (nodeName.includes('Rotary') || nodeName.includes('rotary')) return '🔄';
        if (nodeName.includes('lm_head')) return '🎤';
        if (nodeName.includes('layers') || nodeName.includes('Layer')) return '📚';
        if (nodeName.includes('model')) return '🏗️';
        return '📦';
    };

    const isMoeSpecific = (name) => {
        return name.includes('MoeSparseMoeBlock') ||
            name.includes('gate (Linear)') ||
            name.includes('experts') ||
            name.includes('专家');
    };

    return (
        <div className="layer-card">
            <div
                className={`layer-header ${isSelected ? 'selected' : ''}`}
                onClick={handleClick}
                style={{ paddingLeft: `${depth * 16 + 12}px` }}
            >
                {hasChildren ? (
                    <span
                        className={`layer-expand-icon ${isExpanded ? 'expanded' : ''}`}
                        onClick={handleExpandClick}
                    >
                        ▶
                    </span>
                ) : (
                    <span className="layer-expand-icon" style={{ visibility: 'hidden' }}>▶</span>
                )}

                <span className="layer-icon">{getLayerIcon(node.name)}</span>

                <div className="layer-info">
                    <div className="layer-name">{node.name}</div>
                    {node.nameZh && <div className="layer-name-zh">{node.nameZh}</div>}
                </div>

                {isMoe && isMoeSpecific(node.name + (node.nameZh || '')) && (
                    <span className="layer-badge moe">MoE</span>
                )}

                {hasChildren && (
                    <span className="layer-badge">{node.children.length}</span>
                )}
            </div>

            {hasChildren && isExpanded && (
                <div className="layer-children">
                    {node.children.map((child, index) => (
                        <LayerNode
                            key={child.id || index}
                            node={child}
                            depth={depth + 1}
                            path={[...path, child]}
                            selectedNode={selectedNode}
                            onNodeSelect={onNodeSelect}
                            isMoe={isMoe}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ModelViewer;

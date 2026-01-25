import React, { useState, useEffect } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './LLMPipelineViz.css';
import {
    stages,
    unifiedNodes,
    unifiedEdges,
    paradigms,
    summary
} from '../data/pipelineData';
import { trainingSamples } from '../data/traning_datas';
import { Layers, Sparkles, Database, BookOpen, ChevronRight, Globe } from 'lucide-react';

// Modal Component for displaying data
const DataModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="data-modal-overlay" onClick={onClose}>
            <div className="data-modal-content" onClick={e => e.stopPropagation()}>
                <div className="data-modal-header">
                    <h3>
                        <Database size={18} className="mr-2" />
                        {data.title}
                    </h3>
                    <button className="data-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="data-modal-body">
                    <p className="data-modal-desc">{data.description}</p>
                    <pre className="data-modal-code">
                        {JSON.stringify(data.content, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

const LLMPipelineViz = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(unifiedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(unifiedEdges);
    const [selectedStage, setSelectedStage] = useState(null);
    const [selectedParadigm, setSelectedParadigm] = useState(null); // Default: null (Panorama)
    const [selectedNode, setSelectedNode] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Data Mapping Logic
    const getSampleDataKey = (nodeId, paradigmId) => {
        if (paradigmId === 'reasoning') {
            if (nodeId === 'sft-cold' || nodeId === 'sft-special') return 'reasoning_sft';
            if (nodeId === 'rl-reasoning' || nodeId === 'rl') return 'grpo_training_data';
        }
        if (paradigmId === 'distillation') {
            if (nodeId === 'rl') return 'rl_preference';
        }
        if (paradigmId === 'domain') {
            if (nodeId === 'cpt') return 'pre_training';
        }
        if (nodeId === 'pt' || nodeId === 'cpt') return 'pre_training';
        if (nodeId === 'sft' || nodeId === 'sft-general' || nodeId === 'sft-specific') return 'sft';
        if (nodeId === 'rl' || nodeId === 'rl-specific') return 'rl_preference';
        return null;
    };

    const handleShowData = (key) => {
        if (trainingSamples[key]) {
            setModalData(trainingSamples[key]);
            setIsModalOpen(true);
        }
    };

    // Update highlighting based on selection state
    useEffect(() => {
        // Helper to determine if a node/edge is highlighted
        const checkHighlight = (id, type) => {
            // 1. Stage selection takes priority
            if (selectedStage) {
                const stage = stages.find(s => s.id === selectedStage);
                if (stage && type === 'node') {
                    return stage.highlightNodes.includes(id);
                }
                // If stage selected, dim all edges or maybe highlight internal edges?
                // For simplicity, dim edges unless they connect two highlighted nodes?
                if (stage && type === 'edge') {
                    const edge = unifiedEdges.find(e => e.id === id);
                    return stage.highlightNodes.includes(edge.source) && stage.highlightNodes.includes(edge.target);
                }
            }

            // 2. Paradigm selection
            if (selectedParadigm) {
                const paradigm = paradigms.find(p => p.id === selectedParadigm);
                if (paradigm) {
                    return type === 'node'
                        ? paradigm.highlightNodes.includes(id)
                        : paradigm.highlightEdges.includes(id);
                }
            }

            // 3. Default: Highlight everything (Panorama)
            return true;
        };

        // Apply visual styles
        setNodes((nds) =>
            nds.map((node) => {
                const isHighlighted = checkHighlight(node.id, 'node');
                return {
                    ...node,
                    style: {
                        opacity: isHighlighted ? 1 : 0.25,
                        border: isHighlighted ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        boxShadow: isHighlighted ? '0 0 15px rgba(99, 102, 241, 0.6)' : 'none',
                        background: isHighlighted ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: isHighlighted ? '600' : '400',
                        transition: 'all 0.3s ease',
                    },
                };
            })
        );

        setEdges((eds) =>
            eds.map((edge) => {
                const isHighlighted = checkHighlight(edge.id, 'edge');
                return {
                    ...edge,
                    style: {
                        stroke: isHighlighted ? 'var(--accent-primary)' : 'var(--border-color)',
                        strokeWidth: isHighlighted ? 3 : 1,
                        opacity: isHighlighted ? 1 : 0.2,
                    },
                    animated: isHighlighted,
                };
            })
        );
    }, [selectedParadigm, selectedStage, setNodes, setEdges]);

    // Handle node click
    const onNodeClick = (event, node) => {
        setSelectedNode(node.id);
        // Don't clear paradigm/stage, just show node details in context
    };

    // Handle stage click
    const handleStageClick = (stageId) => {
        if (selectedStage === stageId) {
            setSelectedStage(null); // Deselect if clicking same stage
        } else {
            setSelectedStage(stageId);
            setSelectedParadigm(null); // Clear paradigm when selecting stage
        }
        setSelectedNode(null);
    };

    // Handle paradigm click
    const handleParadigmClick = (paradigmId) => {
        if (selectedParadigm === paradigmId) {
            setSelectedParadigm(null); // Deselect
        } else {
            setSelectedParadigm(paradigmId);
            setSelectedStage(null); // Clear stage when selecting paradigm
        }
        setSelectedNode(null);
    };

    // Get current active context
    const currentParadigm = selectedParadigm ? paradigms.find(p => p.id === selectedParadigm) : null;
    const currentStage = selectedStage ? stages.find(s => s.id === selectedStage) : null;

    // Render detail panel content
    const renderDetailPanel = () => {
        // 1. Node Details (Highest priority if selected)
        if (selectedNode) {
            // If a paradigm is selected, show context-aware details
            if (currentParadigm && currentParadigm.nodeDetails[selectedNode]) {
                const nodeDetails = currentParadigm.nodeDetails[selectedNode];
                const dataKey = getSampleDataKey(selectedNode, selectedParadigm);
                return (
                    <div className="viz-detail-content node-details">
                        <div className="paradigm-badge">{currentParadigm.name}</div>
                        <h3 className="viz-detail-title">
                            <BookOpen size={20} />
                            {nodeDetails.title}
                        </h3>

                        <div className="viz-detail-section">
                            <h4>🎯 角色</h4>
                            <p>{nodeDetails.role}</p>
                        </div>
                        <div className="viz-detail-section">
                            <h4>📊 数据</h4>
                            <p>{nodeDetails.data}</p>
                            {dataKey && trainingSamples[dataKey] && (
                                <button
                                    className="view-data-btn"
                                    onClick={() => handleShowData(dataKey)}
                                >
                                    <Database size={16} />
                                    查看该阶段训练数据 ({trainingSamples[dataKey].title.split(' ')[0]})
                                </button>
                            )}
                        </div>
                        <div className="viz-detail-section">
                            <h4>📤 输出</h4>
                            <p>{nodeDetails.output}</p>
                        </div>
                        {nodeDetails.keyPoint && (
                            <div className="viz-detail-section key-point">
                                <h4>💡 关键点</h4>
                                <p>{nodeDetails.keyPoint}</p>
                            </div>
                        )}
                    </div>
                );
            }

            // Fallback: Generic node name if no specific context
            // Or show stage info if node belongs to a stage?
            const node = unifiedNodes.find(n => n.id === selectedNode);
            if (node) {
                const dataKey = getSampleDataKey(node.id, null);
                return (
                    <div className="viz-detail-content">
                        <h3 className="viz-detail-title">{node.data.label}</h3>
                        {dataKey && trainingSamples[dataKey] && (
                            <button
                                className="view-data-btn"
                                style={{ marginBottom: '1rem' }}
                                onClick={() => handleShowData(dataKey)}
                            >
                                <Database size={16} />
                                查看训练数据样本
                            </button>
                        )}
                        <p className="viz-detail-desc">请选择左侧的训练范式以查看该节点在特定语境下的详细信息。</p>
                    </div>
                )
            }
        }

        // 2. Stage Details
        if (currentStage) {
            return (
                <div className="viz-detail-content stage-details">
                    <h3 className="viz-detail-title">
                        <Sparkles size={20} />
                        {currentStage.name} ({currentStage.nameEn})
                    </h3>
                    <p className="viz-detail-desc">{currentStage.description}</p>

                    <div className="viz-detail-section">
                        <h4>🎯 目标</h4>
                        <p>{currentStage.details.goal}</p>
                    </div>

                    <div className="viz-detail-section">
                        <h4>📊 训练数据</h4>
                        <div className="data-info">
                            <p><strong>类型：</strong>{currentStage.details.data.type}</p>
                            <p><strong>来源：</strong>{currentStage.details.data.sources.join('、')}</p>
                            <p><strong>规模：</strong>{currentStage.details.data.scale}</p>
                            <p><strong>质量要求：</strong>{currentStage.details.data.quality}</p>
                        </div>
                    </div>

                    <div className="viz-detail-section">
                        <h4>⚙️ 训练方法</h4>
                        <p>{currentStage.details.method}</p>
                    </div>

                    <div className="viz-detail-section">
                        <h4>💰 成本</h4>
                        <p>{currentStage.details.cost}</p>
                    </div>

                    <div className="viz-detail-section">
                        <h4>🔄 变体</h4>
                        <ul>
                            {currentStage.details.variants.map((v, i) => (
                                <li key={i}><strong>{v.name}：</strong>{v.desc}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            );
        }

        // 3. Paradigm Details
        if (currentParadigm) {
            return (
                <div className="viz-detail-content paradigm-details">
                    <h3 className="viz-detail-title">
                        <Layers size={20} />
                        {currentParadigm.name}
                    </h3>

                    <div className="viz-detail-section">
                        <p className="paradigm-flow">{currentParadigm.flow}</p>
                    </div>

                    <div className="viz-detail-section">
                        <h4>📌 使用场景</h4>
                        <p>{currentParadigm.scenario}</p>
                    </div>

                    <div className="viz-detail-section">
                        <h4>💼 典型案例</h4>
                        <p>{currentParadigm.examples}</p>
                    </div>

                    <div className="viz-detail-section">
                        <h4>📝 详细说明</h4>
                        {currentParadigm.details.map((detail, i) => (
                            <p key={i} dangerouslySetInnerHTML={{ __html: detail }} />
                        ))}
                    </div>

                    <div className="hint">
                        💡 点击节点查看该节点在当前范式下的详细信息
                    </div>
                </div>
            );
        }

        // 4. Default: Overview (Panorama)
        return (
            <div className="viz-detail-content overview-details">
                <h3 className="viz-detail-title">
                    <Globe size={20} />
                    训练范式全景
                </h3>
                <p className="viz-detail-desc">
                    当前展示了 LLM 训练流程的全景视图。该流程涵盖了从预训练到后训练的所有可能路径。
                </p>

                <div className="viz-detail-section">
                    <h4>🔍 交互指南</h4>
                    <ul>
                        <li>点击<strong>顶部阶段按钮</strong>查看预训练/后训练的详细数据差异。</li>
                        <li>点击<strong>左侧具体范式</strong>查看该范式的特定流向和节点含义。</li>
                    </ul>
                </div>

                <div className="viz-detail-section">
                    <h4>📖 核心总结</h4>
                    <p><strong>PT (Pre-training):</strong> 决定了模型的<strong>知识上限</strong>（智商基座）</p>
                    <p><strong>CPT (Continual PT):</strong> 决定了模型的<strong>专业深度</strong>（行业专家）</p>
                    <p><strong>SFT (Supervised Fine-Tuning):</strong> 决定了模型的<strong>服从性</strong>（听话程度）</p>
                    <p><strong>RL (Reinforcement Learning):</strong> 决定了模型的<strong>价值观</strong>或**深度思考能力**</p>
                </div>
            </div>
        );
    };

    // Panel collapse state
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    return (
        <div className="pipeline-viz-container">
            <DataModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={modalData} />
            {/* Stage buttons */}
            <div className="stage-bar">
                {stages.map((stage) => (
                    <button
                        key={stage.id}
                        className={`stage-button ${stage.id} ${selectedStage === stage.id ? 'active' : ''}`}
                        onClick={() => handleStageClick(stage.id)}
                    >
                        <div className="stage-content">
                            <span className="stage-name">{stage.name}</span>
                            <span className="stage-name-en">{stage.nameEn}</span>
                        </div>
                        {selectedStage === stage.id && <div className="active-indicator" />}
                    </button>
                ))}
            </div>

            <div className="main-area">
                {/* Left sidebar - Paradigm selector */}
                <div className="paradigm-sidebar">
                    <h3 className="sidebar-title">
                        <Layers size={20} />
                        训练范式
                    </h3>
                    <div className="paradigm-list">
                        {/* Overview Item */}
                        <div
                            className={`paradigm-item ${!selectedParadigm && !selectedStage ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedParadigm(null);
                                setSelectedStage(null);
                                setSelectedNode(null);
                            }}
                        >
                            <div className="paradigm-header">
                                <span className="paradigm-name">全景视图 (Panorama)</span>
                                <Globe size={16} />
                            </div>
                            <div className="paradigm-flow-badge" style={{ fontSize: '0.7rem' }}>展示所有可能路径</div>
                        </div>

                        {paradigms.map((p) => (
                            <div
                                key={p.id}
                                className={`paradigm-item ${selectedParadigm === p.id ? 'active' : ''}`}
                                onClick={() => handleParadigmClick(p.id)}
                            >
                                <div className="paradigm-header">
                                    <span className="paradigm-name">{p.name}</span>
                                    <ChevronRight size={16} />
                                </div>
                                <div className="paradigm-flow-badge">{p.flow}</div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="summary-section">
                        <h4 className="summary-title">{summary.title}</h4>
                        <ul className="summary-list">
                            {summary.points.map((point, i) => (
                                <li key={i}>
                                    <strong>{point.key}:</strong>
                                    <span dangerouslySetInnerHTML={{ __html: point.desc }} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Center - React Flow canvas */}
                <div className="flow-canvas">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        fitView
                        attributionPosition="bottom-right"
                        minZoom={0.3}
                        maxZoom={1.5}
                        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
                    >
                        <Background color="#334155" gap={16} />
                        <Controls />
                    </ReactFlow>

                    {/* Collapse Toggle Button - Absolute positioned on canvas right edge */}
                    <button
                        className={`panel-toggle-btn ${isPanelOpen ? 'open' : 'closed'}`}
                        onClick={() => setIsPanelOpen(!isPanelOpen)}
                        title={isPanelOpen ? "收起详情" : "展开详情"}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Right panel - Details - Conditional rendering/class */}
                <div className={`viz-detail-panel ${isPanelOpen ? 'open' : 'closed'}`}>
                    {renderDetailPanel()}
                </div>
            </div>
        </div>
    );
};

export default LLMPipelineViz;

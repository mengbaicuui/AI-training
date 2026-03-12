import React, { useState, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './RAGPipelineTab.css';
import {
    pipelineStages,
    pipelineNodes,
    pipelineEdges,
    paradigms,
    pipelineSummary,
    pipelineWarmupQuestions
} from '../data/pipelineData';
import { Layers, ChevronRight, Globe, BookOpen, Sparkles, Search } from 'lucide-react';
import QuestionPanel from './QuestionPanel';

const RAGPipelineTab = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(pipelineNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(pipelineEdges);
    const [selectedStage, setSelectedStage] = useState(null);
    const [selectedParadigm, setSelectedParadigm] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    const allQuestions = useMemo(() => {
        const questions = [];
        pipelineStages.forEach(stage => {
            if (stage.details?.questions) {
                stage.details.questions.forEach(q => {
                    questions.push({ ...q, question: `【${stage.name}】${q.question}` });
                });
            }
        });
        paradigms.forEach(paradigm => {
            if (paradigm.questions) {
                paradigm.questions.forEach(q => {
                    questions.push({ ...q, question: `【${paradigm.name}】${q.question}` });
                });
            }
        });
        return questions;
    }, []);

    useEffect(() => {
        const checkHighlight = (id, type) => {
            if (selectedStage) {
                const stage = pipelineStages.find(s => s.id === selectedStage);
                if (!stage) return true;
                if (type === 'node') return stage.highlightNodes.includes(id);
                if (type === 'edge') {
                    const edge = pipelineEdges.find(e => e.id === id);
                    return edge
                        && stage.highlightNodes.includes(edge.source)
                        && stage.highlightNodes.includes(edge.target);
                }
            }
            if (selectedParadigm) {
                const paradigm = paradigms.find(p => p.id === selectedParadigm);
                if (paradigm) {
                    return type === 'node'
                        ? paradigm.highlightNodes.includes(id)
                        : paradigm.highlightEdges.includes(id);
                }
            }
            return true;
        };

        setNodes((nds) =>
            nds.map((node) => {
                const isHighlighted = checkHighlight(node.id, 'node');
                return {
                    ...node,
                    style: {
                        opacity: isHighlighted ? 1 : 0.2,
                        border: isHighlighted
                            ? '2px solid var(--accent-primary)'
                            : '1px solid var(--border-color)',
                        boxShadow: isHighlighted
                            ? '0 0 15px rgba(99, 102, 241, 0.6)'
                            : 'none',
                        background: isHighlighted ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: isHighlighted ? '600' : '400',
                        whiteSpace: 'pre-line',
                        textAlign: 'center',
                        lineHeight: '1.4',
                        minWidth: '120px',
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
                        ...edge.style,
                        stroke: isHighlighted ? 'var(--accent-primary)' : 'var(--border-color)',
                        strokeWidth: isHighlighted ? 3 : 1,
                        opacity: isHighlighted ? 1 : 0.15,
                    },
                    animated: isHighlighted,
                };
            })
        );
    }, [selectedParadigm, selectedStage, setNodes, setEdges]);

    const onNodeClick = (_event, node) => {
        setSelectedNode(node.id);
    };

    const handleStageClick = (stageId) => {
        if (selectedStage === stageId) {
            setSelectedStage(null);
        } else {
            setSelectedStage(stageId);
            setSelectedParadigm(null);
        }
        setSelectedNode(null);
    };

    const handleParadigmClick = (paradigmId) => {
        if (selectedParadigm === paradigmId) {
            setSelectedParadigm(null);
        } else {
            setSelectedParadigm(paradigmId);
            setSelectedStage(null);
        }
        setSelectedNode(null);
    };

    const currentParadigm = selectedParadigm ? paradigms.find(p => p.id === selectedParadigm) : null;
    const currentStage = selectedStage ? pipelineStages.find(s => s.id === selectedStage) : null;

    const renderDetailPanel = () => {
        // Node details (highest priority)
        if (selectedNode) {
            if (currentParadigm && currentParadigm.nodeDetails?.[selectedNode]) {
                const nd = currentParadigm.nodeDetails[selectedNode];
                return (
                    <div className="detail-content fade-in">
                        <span className="paradigm-badge">{currentParadigm.name}</span>
                        <h3 className="detail-title">
                            <BookOpen size={18} />
                            {nd.title}
                        </h3>
                        <div className="detail-section">
                            <h4>🎯 角色</h4>
                            <p>{nd.role}</p>
                        </div>
                        <div className="detail-section">
                            <h4>📥 输入</h4>
                            <p>{nd.data}</p>
                        </div>
                        <div className="detail-section">
                            <h4>📤 输出</h4>
                            <p>{nd.output}</p>
                        </div>
                        {nd.keyPoint && (
                            <div className="detail-section key-point">
                                <h4>💡 关键点</h4>
                                <p>{nd.keyPoint}</p>
                            </div>
                        )}
                    </div>
                );
            }

            const node = pipelineNodes.find(n => n.id === selectedNode);
            if (node) {
                return (
                    <div className="detail-content fade-in">
                        <h3 className="detail-title">{node.data.label.replace('\n', ' ')}</h3>
                        <p className="detail-hint">
                            请选择左侧的 RAG 范式以查看该节点在特定架构下的详细信息。
                        </p>
                    </div>
                );
            }
        }

        // Stage details
        if (currentStage) {
            const d = currentStage.details;
            return (
                <div className="detail-content fade-in">
                    <h3 className="detail-title">
                        <Sparkles size={18} />
                        {currentStage.name}
                        <span className="detail-subtitle">{currentStage.nameEn}</span>
                    </h3>
                    <p className="detail-desc">{currentStage.description}</p>

                    <div className="detail-section">
                        <h4>🎯 目标</h4>
                        <p>{d.goal}</p>
                    </div>

                    <div className="detail-section">
                        <h4>🔗 流程</h4>
                        <div className="flow-badge">{d.pipeline}</div>
                    </div>

                    <div className="detail-section">
                        <h4>⚠️ 核心挑战</h4>
                        <ul>
                            {d.challenges.map((c, i) => (
                                <li key={i}><strong>{c.name}：</strong>{c.desc}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="detail-section">
                        <h4>✅ 2026 最佳实践</h4>
                        <ul>
                            {d.bestPractices.map((bp, i) => (
                                <li key={i}>{bp}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            );
        }

        // Paradigm details
        if (currentParadigm) {
            return (
                <div className="detail-content fade-in">
                    <h3 className="detail-title">
                        <Layers size={18} />
                        {currentParadigm.name}
                    </h3>

                    <div className="detail-section">
                        <div className="flow-badge">{currentParadigm.flow}</div>
                    </div>

                    <div className="detail-section">
                        <h4>📌 适用场景</h4>
                        <p>{currentParadigm.scenario}</p>
                    </div>

                    <div className="detail-section">
                        <h4>📝 详细说明</h4>
                        {currentParadigm.details.map((detail, i) => (
                            <p key={i} dangerouslySetInnerHTML={{ __html: detail }} />
                        ))}
                    </div>

                    <div className="hint-box">
                        💡 点击图中节点查看该节点在当前范式下的详细信息
                    </div>
                </div>
            );
        }

        // Default: Overview
        return (
            <div className="detail-content fade-in">
                <h3 className="detail-title">
                    <Globe size={18} />
                    RAG 全链路全景
                </h3>
                <p className="detail-desc">
                    当前展示了 RAG 系统的完整全景视图 — 从离线文档 Ingestion 到在线 Query-time 的所有可能路径。
                </p>

                <div className="detail-section">
                    <h4>🔍 交互指南</h4>
                    <ul>
                        <li>点击<strong>顶部阶段按钮</strong>聚焦离线或在线链路</li>
                        <li>点击<strong>左侧 RAG 范式</strong>查看不同架构的流向和各节点含义</li>
                        <li>点击<strong>图中节点</strong>查看该节点在选中范式下的详细角色</li>
                    </ul>
                </div>

                <div className="detail-section">
                    <h4>📖 架构演进路线</h4>
                    <p><strong>Naive RAG →</strong> 能用，但准确率低</p>
                    <p><strong>Hybrid RAG →</strong> 解决关键词盲区</p>
                    <p><strong>Rerank RAG →</strong> 大多数场景的最优解</p>
                    <p><strong>Agentic RAG →</strong> 复杂多跳问题</p>
                    <p><strong>GraphRAG →</strong> 关系推理和全局摘要</p>
                </div>
            </div>
        );
    };

    return (
        <div className="pipeline-viz-container">
            {/* Stage bar */}
            <div className="pipeline-top-bar">
                {pipelineStages.map((stage) => (
                    <button
                        key={stage.id}
                        className={`stage-btn ${stage.id} ${selectedStage === stage.id ? 'active' : ''}`}
                        onClick={() => handleStageClick(stage.id)}
                    >
                        <span className="stage-btn-name">{stage.name}</span>
                        <span className="stage-btn-en">{stage.nameEn}</span>
                    </button>
                ))}
            </div>

            <div className="pipeline-main">
                {/* Left sidebar - Paradigm selector */}
                <div className="pipeline-sidebar">
                    <h3 className="sidebar-title">
                        <Layers size={18} />
                        RAG 范式
                    </h3>
                    <div className="route-selector">
                        <div
                            className={`route-item ${!selectedParadigm && !selectedStage ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedParadigm(null);
                                setSelectedStage(null);
                                setSelectedNode(null);
                            }}
                        >
                            <div className="route-item-header">
                                <span className="route-item-name">全景视图 (Panorama)</span>
                                <Globe size={14} />
                            </div>
                            <div className="route-item-desc">展示所有可能路径</div>
                        </div>

                        {paradigms.map((p) => (
                            <div
                                key={p.id}
                                className={`route-item ${selectedParadigm === p.id ? 'active' : ''}`}
                                onClick={() => handleParadigmClick(p.id)}
                            >
                                <div className="route-item-header">
                                    <span className="route-item-name">{p.name}</span>
                                    <ChevronRight size={14} />
                                </div>
                                <div className="route-item-desc">{p.flow}</div>
                            </div>
                        ))}
                    </div>

                    <div className="summary-box">
                        <h4 className="summary-title">{pipelineSummary.title}</h4>
                        <ul className="summary-list">
                            {pipelineSummary.points.map((point, i) => (
                                <li key={i}>
                                    <strong>{point.key}：</strong>
                                    <span dangerouslySetInnerHTML={{ __html: point.desc }} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Center - ReactFlow canvas */}
                <div className="pipeline-canvas">
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
                        defaultViewport={{ x: 0, y: 0, zoom: 0.65 }}
                    >
                        <Background color="#334155" gap={16} />
                        <Controls />
                    </ReactFlow>

                    <button
                        className={`panel-toggle-btn ${isPanelOpen ? 'open' : 'closed'}`}
                        onClick={() => setIsPanelOpen(!isPanelOpen)}
                        title={isPanelOpen ? '收起详情' : '展开详情'}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Right panel - Detail */}
                <div className={`pipeline-detail ${!isPanelOpen ? 'collapsed' : ''}`}>
                    {renderDetailPanel()}
                </div>
            </div>

            <QuestionPanel
                questions={allQuestions}
                warmupQuestions={pipelineWarmupQuestions}
                sectionTitle="RAG 全链路追踪"
            />
        </div>
    );
};

export default RAGPipelineTab;

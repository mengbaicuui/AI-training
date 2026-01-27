import { useState, useMemo } from 'react';
import { llmHistoryData, llmHistoryWarmupQuestions } from '../data/llm_history';
import QuestionPanel from './QuestionPanel';
import './LLMHistoryTimeline.css';

const TimelineNode = ({ data, isExpanded, onToggle, side }) => {
    return (
        <div className={`timeline-row ${side} ${isExpanded ? 'expanded' : ''}`}>
            <div className="timeline-connector"></div>
            <div
                className="timeline-point-wrapper"
                onClick={() => onToggle(data.id)}
                role="button"
                tabIndex={0}
            >
                <div className="timeline-point">
                    <span className="point-icon">{data.icon}</span>
                </div>
                <div className="point-label">
                    <span className="point-date">{data.date}</span>
                    <span className="point-title">{data.title}</span>
                </div>
            </div>

            <div className={`timeline-content-wrapper ${isExpanded ? 'open' : ''}`}>
                <div className="timeline-branch-line"></div>
                <div className="timeline-detail-card">
                    <div className="card-header">
                        <div className="header-icon">{data.icon}</div>
                        <div className="header-text">
                            <h3>{data.title}</h3>
                            <span className="subtitle">{data.subtitle}</span>
                        </div>
                    </div>

                    <div className="card-body">
                        <p className="description">{data.details.description}</p>

                        <div className="key-points">
                            <h4>核心要点</h4>
                            <ul>
                                {data.details.keyPoints.map((point, idx) => (
                                    <li key={idx}>{point}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="impact-section">
                            <h4>⭐️ 历史意义</h4>
                            <p>{data.details.impact}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LLMHistoryTimeline = () => {
    const [expandedIds, setExpandedIds] = useState(llmHistoryData.map(item => item.id)); // Default expand all

    // 收集所有里程碑的问题
    const allQuestions = useMemo(() => {
        const questions = [];
        llmHistoryData.forEach(item => {
            if (item.details?.questions) {
                item.details.questions.forEach(q => {
                    questions.push({
                        ...q,
                        question: `【${item.title}】${q.question}`
                    });
                });
            }
        });
        return questions;
    }, []);

    const handleToggle = (id) => {
        setExpandedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                // Optional: Close others? For now allow multiple open like a real tree
                return [...prev, id];
                // If single mode is preferred: return [id];
            }
        });
    };

    return (
        <div className="timeline-container">
            <div className="timeline-header-section">
                <h2>深度学习的十年长征</h2>
                <p>从 ResNet 到百模齐放与代理智能时代 (2015-2026)</p>
            </div>

            <div className="timeline-tree">
                <div className="timeline-trunk"></div>

                {llmHistoryData.map((item, index) => (
                    <TimelineNode
                        key={item.id}
                        data={item}
                        side={index % 2 === 0 ? 'left' : 'right'}
                        isExpanded={expandedIds.includes(item.id)}
                        onToggle={handleToggle}
                    />
                ))}
            </div>

            {/* 问题面板 */}
            <QuestionPanel
                questions={allQuestions}
                warmupQuestions={llmHistoryWarmupQuestions}
                sectionTitle="LLM 发展史"
            />
        </div>
    );
};

export default LLMHistoryTimeline;

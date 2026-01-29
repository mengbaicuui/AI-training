import React, { useState, useEffect } from 'react';
import './QuestionPanel.css';

/**
 * 问题面板组件 - 显示在页面右下角的浮动按钮和问题弹窗
 * @param {Array} questions - 思考题数组，每个问题包含 question, hint, answer
 * @param {Array} warmupQuestions - 热身问题数组，每个问题包含 question, hook
 * @param {string} sectionTitle - 当前章节标题
 */
const QuestionPanel = ({ questions = [], warmupQuestions = [], sectionTitle = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('warmup'); // 'warmup' 或 'thinking'
    const [expandedAnswers, setExpandedAnswers] = useState({});

    // 当弹窗打开时，如果有热身问题，默认显示热身问题
    useEffect(() => {
        if (isOpen) {
            if (warmupQuestions && warmupQuestions.length > 0) {
                setActiveTab('warmup');
            } else {
                setActiveTab('thinking');
            }
            setExpandedAnswers({});
        }
    }, [isOpen, warmupQuestions]);

    const hasWarmup = warmupQuestions && warmupQuestions.length > 0;
    const hasThinking = questions && questions.length > 0;
    const totalCount = (warmupQuestions?.length || 0) + (questions?.length || 0);

    // 如果没有任何问题，不显示按钮
    if (!hasWarmup && !hasThinking) {
        return null;
    }

    const toggleAnswer = (index) => {
        setExpandedAnswers(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const toggleAllAnswers = (show) => {
        const newState = {};
        questions.forEach((_, index) => {
            newState[index] = show;
        });
        setExpandedAnswers(newState);
    };

    return (
        <>
            {/* 浮动按钮 */}
            <button
                className="question-fab"
                onClick={() => setIsOpen(true)}
                title="查看本节问题"
            >
                <span className="question-fab-icon">❓</span>
                <span className="question-fab-badge">{totalCount}</span>
            </button>

            {/* 问题弹窗 */}
            {isOpen && (
                <div className="question-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div
                        className="question-modal"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 头部 */}
                        <div className="question-modal-header">
                            <div className="question-modal-title">
                                <span className="question-icon">🧠</span>
                                <div>
                                    <h3>学习问题</h3>
                                    {sectionTitle && <span className="section-subtitle">{sectionTitle}</span>}
                                </div>
                            </div>
                            <button
                                className="question-close-btn"
                                onClick={() => setIsOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Tab 切换 */}
                        <div className="question-tabs">
                            {hasWarmup && (
                                <button
                                    className={`question-tab ${activeTab === 'warmup' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('warmup')}
                                >
                                    <span className="tab-icon">🚀</span>
                                    <span className="tab-label">学前热身</span>
                                    <span className="tab-count">{warmupQuestions.length}</span>
                                </button>
                            )}
                            {hasThinking && (
                                <button
                                    className={`question-tab ${activeTab === 'thinking' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('thinking')}
                                >
                                    <span className="tab-icon">🤔</span>
                                    <span className="tab-label">深度思考</span>
                                    <span className="tab-count">{questions.length}</span>
                                </button>
                            )}
                        </div>

                        {/* 热身问题列表 */}
                        {activeTab === 'warmup' && hasWarmup && (
                            <div className="question-list warmup-list">
                                <div className="warmup-intro">
                                    <span>💡</span>
                                    <p>在学习之前，先思考这些问题，带着好奇心去探索答案吧！</p>
                                </div>
                                {warmupQuestions.map((q, index) => (
                                    <div key={index} className="question-item warmup-item">
                                        <div className="question-number warmup">
                                            <span>✨</span>
                                        </div>
                                        <div className="question-content">
                                            <div className="question-text warmup-text">
                                                {q.question}
                                            </div>
                                            {q.hook && (
                                                <div className="warmup-hook">
                                                    🎯 {q.hook}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="warmup-cta">
                                    <span>👇 学完本节后，来"深度思考"检验一下吧！</span>
                                </div>
                            </div>
                        )}

                        {/* 思考题列表 */}
                        {activeTab === 'thinking' && hasThinking && (
                            <>
                                <div className="question-actions-bar">
                                    <button
                                        className="action-btn-small"
                                        onClick={() => toggleAllAnswers(true)}
                                        title="显示全部答案"
                                    >
                                        👁️ 全部显示
                                    </button>
                                    <button
                                        className="action-btn-small"
                                        onClick={() => toggleAllAnswers(false)}
                                        title="隐藏全部答案"
                                    >
                                        🙈 全部隐藏
                                    </button>
                                </div>
                                <div className="question-list">
                                    {questions.map((q, index) => (
                                        <div key={index} className="question-item">
                                            <div className="question-number">Q{index + 1}</div>
                                            <div className="question-content">
                                                <div className="question-text">
                                                    {q.question}
                                                </div>

                                                {q.hint && (
                                                    <div className="question-hint">
                                                        💡 提示：{q.hint}
                                                    </div>
                                                )}

                                                <button
                                                    className={`answer-toggle-btn ${expandedAnswers[index] ? 'expanded' : ''}`}
                                                    onClick={() => toggleAnswer(index)}
                                                >
                                                    {expandedAnswers[index] ? '🔼 隐藏答案' : '🔽 显示答案'}
                                                </button>

                                                {expandedAnswers[index] && (
                                                    <div className="answer-content">
                                                        <div className="answer-label">参考答案</div>
                                                        <div className="answer-text">{q.answer}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* 底部提示 */}
                        <div className="question-modal-footer">
                            {activeTab === 'warmup' ? (
                                <span>🌟 带着问题学习，效果加倍！</span>
                            ) : (
                                <span>💭 先独立思考，再看答案效果更好哦！</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuestionPanel;

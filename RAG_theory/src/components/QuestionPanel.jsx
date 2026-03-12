import { useState, useEffect } from 'react';
import './QuestionPanel.css';

const QuestionPanel = ({ questions = [], warmupQuestions = [], sectionTitle = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('warmup');
  const [expandedAnswers, setExpandedAnswers] = useState({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab(warmupQuestions?.length > 0 ? 'warmup' : 'thinking');
      setExpandedAnswers({});
    }
  }, [isOpen, warmupQuestions]);

  const hasWarmup = warmupQuestions?.length > 0;
  const hasThinking = questions?.length > 0;
  const totalCount = (warmupQuestions?.length || 0) + (questions?.length || 0);

  if (!hasWarmup && !hasThinking) return null;

  const toggleAnswer = (index) => {
    setExpandedAnswers(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleAllAnswers = (show) => {
    const newState = {};
    questions.forEach((_, index) => { newState[index] = show; });
    setExpandedAnswers(newState);
  };

  return (
    <>
      <button className="question-fab" onClick={() => setIsOpen(true)} title="查看本节问题">
        <span className="question-fab-icon">❓</span>
        <span className="question-fab-badge">{totalCount}</span>
      </button>

      {isOpen && (
        <div className="question-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="question-modal" onClick={e => e.stopPropagation()}>
            <div className="question-modal-header">
              <div className="question-modal-title">
                <span className="question-icon">🧠</span>
                <div>
                  <h3>学习问题</h3>
                  {sectionTitle && <span className="section-subtitle">{sectionTitle}</span>}
                </div>
              </div>
              <button className="question-close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="question-tabs">
              {hasWarmup && (
                <button
                  className={`question-tab ${activeTab === 'warmup' ? 'active' : ''}`}
                  onClick={() => setActiveTab('warmup')}
                >
                  <span className="qtab-icon">🚀</span>
                  <span className="qtab-label">实战挑战</span>
                  <span className="qtab-count">{warmupQuestions.length}</span>
                </button>
              )}
              {hasThinking && (
                <button
                  className={`question-tab ${activeTab === 'thinking' ? 'active' : ''}`}
                  onClick={() => setActiveTab('thinking')}
                >
                  <span className="qtab-icon">🤔</span>
                  <span className="qtab-label">深度思考</span>
                  <span className="qtab-count">{questions.length}</span>
                </button>
              )}
            </div>

            {activeTab === 'warmup' && hasWarmup && (
              <div className="question-list warmup-list">
                <div className="warmup-intro">
                  <span>💡</span>
                  <p>先想想这些问题，再带着思考去看内容</p>
                </div>
                {warmupQuestions.map((q, index) => (
                  <div key={index} className="question-item warmup-item">
                    <div className="question-number warmup"><span>✨</span></div>
                    <div className="question-content">
                      <div className="question-text warmup-text">{q.question}</div>
                      {q.hook && <div className="warmup-hook">🎯 {q.hook}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'thinking' && hasThinking && (
              <>
                <div className="question-actions-bar">
                  <button className="action-btn-small" onClick={() => toggleAllAnswers(true)}>👁️ 全部显示</button>
                  <button className="action-btn-small" onClick={() => toggleAllAnswers(false)}>🙈 全部隐藏</button>
                </div>
                <div className="question-list">
                  {questions.map((q, index) => (
                    <div key={index} className="question-item">
                      <div className="question-number">Q{index + 1}</div>
                      <div className="question-content">
                        <div className="question-text">{q.question}</div>
                        <button
                          className={`answer-toggle-btn ${expandedAnswers[index] ? 'expanded' : ''}`}
                          onClick={() => toggleAnswer(index)}
                        >
                          {expandedAnswers[index] ? '🔼 收起思路' : '🔽 查看解题思路'}
                        </button>
                        {expandedAnswers[index] && (
                          <div className="answer-content">
                            {(q.approach || q.hint) && (
                              <>
                                <div className="answer-label">解题思路</div>
                                <div className="answer-text">{q.approach || q.hint}</div>
                              </>
                            )}
                            {q.answer && (
                              <>
                                <div className="answer-label" style={{ marginTop: 'var(--spacing-md)' }}>参考答案</div>
                                <div className="answer-text">{q.answer}</div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="question-modal-footer">
              {activeTab === 'warmup'
                ? <span>🌟 带着问题学习，效果加倍！</span>
                : <span>💭 先独立思考，再看答案效果更好</span>
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionPanel;

import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { evaluationData, analogyDemos } from '../data/evaluationData';

const EvaluationMetrics = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentAnalogy = analogyDemos[activeDemo];

  // 3D 向量空间数据
  const vectorData = [
    { word: '国王', x: 0.8, y: 0.9, z: 0.7, color: '#6366f1' },
    { word: '王后', x: 0.85, y: 0.4, z: 0.75, color: '#22d3ee' },
    { word: '男人', x: 0.3, y: 0.85, z: 0.3, color: '#f59e0b' },
    { word: '女人', x: 0.35, y: 0.35, z: 0.35, color: '#ec4899' },
    { word: '王子', x: 0.7, y: 0.8, z: 0.5, color: '#8b5cf6' },
    { word: '公主', x: 0.75, y: 0.3, z: 0.55, color: '#f472b6' }
  ];

  return (
    <div className="embedding-tab fade-in">
      <div className="embedding-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 className="section-title">📊 评估指标</h2>

        <div className="content-text">
          <p>
            如何知道训练出的词向量质量好不好？我们需要通过<b>内在评估</b>和<b>外在评估</b>两种方式来验证。
          </p>
        </div>

        {/* 词类比演示 */}
        <div className="demo-container">
          <div className="demo-title">🧮 词类比任务交互演示</div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '20px'
            }}>
              {analogyDemos.map((demo, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveDemo(i); setShowResult(false); }}
                  style={{
                    padding: '8px 16px',
                    background: activeDemo === i ? 'var(--accent-embedding)' : 'var(--bg-card)',
                    color: activeDemo === i ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {demo.category}
                </button>
              ))}
            </div>
          </div>

          <div className="demo-input-group">
            <div className="demo-word-box">{currentAnalogy.a}</div>
            <span className="demo-operator">-</span>
            <div className="demo-word-box">{currentAnalogy.b}</div>
            <span className="demo-operator">+</span>
            <div className="demo-word-box">{currentAnalogy.c}</div>
            <span className="demo-operator">=</span>
            {showResult ? (
              <div className="demo-result fade-in">{currentAnalogy.result}</div>
            ) : (
              <button
                onClick={() => setShowResult(true)}
                style={{
                  padding: '12px 24px',
                  background: 'var(--bg-card)',
                  color: 'var(--accent-embedding)',
                  border: '2px dashed var(--accent-embedding)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                点击揭晓
              </button>
            )}
          </div>

          {showResult && (
            <p style={{
              color: 'var(--text-secondary)',
              marginTop: '15px',
              fontSize: '0.95rem'
            }} className="fade-in">
              💡 {currentAnalogy.explanation}
            </p>
          )}

          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px',
            textAlign: 'left'
          }}>
            <strong style={{ color: 'var(--accent-primary)' }}>公式原理：</strong>
            <code style={{
              display: 'block',
              marginTop: '10px',
              padding: '10px',
              background: 'var(--bg-card)',
              borderRadius: '6px',
              color: 'var(--accent-embedding)'
            }}>
              vec({currentAnalogy.a}) - vec({currentAnalogy.b}) + vec({currentAnalogy.c}) ≈ vec({currentAnalogy.result})
            </code>
          </div>
        </div>

        {/* 3D 向量空间可视化 */}
        <div className="visual-container" style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>
            🌐 3D 词向量空间可视化
          </h3>
          <div style={{
            height: '450px',
            width: '100%',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <Plot
              data={[{
                x: vectorData.map(d => d.x),
                y: vectorData.map(d => d.y),
                z: vectorData.map(d => d.z),
                mode: 'markers+text',
                type: 'scatter3d',
                text: vectorData.map(d => d.word),
                textposition: 'top center',
                marker: {
                  size: 12,
                  color: vectorData.map(d => d.color),
                  opacity: 0.9
                },
                hovertemplate: '<b>%{text}</b><br>x: %{x}<br>y: %{y}<br>z: %{z}<extra></extra>'
              }]}
              layout={{
                autosize: true,
                title: { text: '词向量空间示例', font: { color: '#e2e8f0' } },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                scene: {
                  xaxis: { title: 'Dim 1', color: '#94a3b8', gridcolor: '#334155' },
                  yaxis: { title: 'Dim 2', color: '#94a3b8', gridcolor: '#334155' },
                  zaxis: { title: 'Dim 3', color: '#94a3b8', gridcolor: '#334155' }
                },
                showlegend: false,
                margin: { l: 0, r: 0, b: 0, t: 40 }
              }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
            />
          </div>
          <p style={{
            marginTop: '15px',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}>
            观察：语义相关的词（如"国王"和"王后"）在空间中距离较近
            <br/>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              （拖动可旋转视角，滚轮可缩放）
            </span>
          </p>
        </div>

        {/* 相似度度量 */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{
            marginBottom: '20px',
            color: 'var(--text-primary)',
            borderLeft: '4px solid var(--accent-embedding)',
            paddingLeft: '12px'
          }}>
            📐 相似度度量方法
          </h3>

          <div className="metric-grid">
            {evaluationData.similarityMeasures.measures.map((measure, i) => (
              <div key={i} className="metric-card">
                <div className="metric-title">
                  {measure.name}
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontWeight: 'normal'
                  }}>
                    ({measure.nameEn})
                  </span>
                </div>
                <div className="metric-content">
                  <div style={{
                    background: 'var(--bg-tertiary)',
                    padding: '10px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    fontFamily: 'monospace',
                    color: 'var(--accent-success)'
                  }}>
                    {measure.formula}
                  </div>
                  <p style={{ marginBottom: '8px' }}>{measure.description}</p>
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--accent-embedding)'
                  }}>
                    取值范围：{measure.range}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 评估数据集 */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{
            marginBottom: '20px',
            color: 'var(--text-primary)',
            borderLeft: '4px solid var(--accent-primary)',
            paddingLeft: '12px'
          }}>
            📚 常用评估数据集
          </h3>

          <div className="step-cards">
            {evaluationData.intrinsicEvaluation.methods[1].datasets.map((dataset, i) => (
              <div key={i} className="step-card">
                <div style={{
                  fontWeight: '600',
                  color: 'var(--accent-embedding)',
                  marginBottom: '8px'
                }}>
                  {dataset.name}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px'
                }}>
                  {dataset.description}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  词对数量：{dataset.pairs}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 下游任务 */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{
            marginBottom: '20px',
            color: 'var(--text-primary)',
            borderLeft: '4px solid var(--accent-warning)',
            paddingLeft: '12px'
          }}>
            🎯 下游任务评估（外在评估）
          </h3>

          <div className="step-cards">
            {evaluationData.extrinsicEvaluation.tasks.map((task, i) => (
              <div key={i} className="step-card">
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{task.icon}</div>
                <div style={{
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  {task.name}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '10px'
                }}>
                  {task.description}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {task.metrics.map((metric, j) => (
                    <span key={j} style={{
                      padding: '4px 10px',
                      background: 'rgba(34, 211, 238, 0.15)',
                      color: 'var(--accent-embedding)',
                      borderRadius: '12px',
                      fontSize: '0.75rem'
                    }}>
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationMetrics;

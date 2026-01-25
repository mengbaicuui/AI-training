import React, { useState } from 'react';
/* Import images */
import attention1 from '../data/training/images/attention1.png';
import attention2 from '../data/training/images/attention2.png';
import Plot from 'react-plotly.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TransformerTab = () => {
    const [activeSection, setActiveSection] = useState('tokenization');

    return (
        <div className="transformer-tab">
            <div className="transformer-sidebar">
                <nav className="transformer-nav">
                    <button
                        className={`transformer-nav-item ${activeSection === 'tokenization' ? 'active' : ''}`}
                        onClick={() => setActiveSection('tokenization')}
                    >
                        1. Tokenization (分词)
                    </button>
                    <button
                        className={`transformer-nav-item ${activeSection === 'embedding' ? 'active' : ''}`}
                        onClick={() => setActiveSection('embedding')}
                    >
                        2. Embedding (词嵌入)
                    </button>
                    <button
                        className={`transformer-nav-item ${activeSection === 'position' ? 'active' : ''}`}
                        onClick={() => setActiveSection('position')}
                    >
                        3. Position (位置编码)
                    </button>
                    <button
                        className={`transformer-nav-item ${activeSection === 'attention' ? 'active' : ''}`}
                        onClick={() => setActiveSection('attention')}
                    >
                        4. Self Attention (自注意力)
                    </button>
                    <button
                        className={`transformer-nav-item ${activeSection === 'encoder-decoder' ? 'active' : ''}`}
                        onClick={() => setActiveSection('encoder-decoder')}
                    >
                        5. Encoder vs Decoder
                    </button>
                    <button
                        className={`transformer-nav-item ${activeSection === 'output' ? 'active' : ''}`}
                        onClick={() => setActiveSection('output')}
                    >
                        6. Output (输出)
                    </button>
                </nav>
            </div>

            <div className="transformer-content">
                {activeSection === 'tokenization' && <TokenizationSection />}
                {activeSection === 'embedding' && <EmbeddingSection />}
                {activeSection === 'position' && <PositionSection />}
                {activeSection === 'attention' && <AttentionSection />}
                {activeSection === 'encoder-decoder' && <EncoderDecoderSection />}
                {activeSection === 'output' && <OutputSection />}
            </div>
        </div>
    );
};

/* --- Sub-components (Placeholders for now, will fill in next steps) --- */

const TokenizationSection = () => (
    <section className="transformer-section fade-in">
        <h2 className="section-title">1. Tokenization (分词)</h2>
        <div className="content-text">
            <p>当你给 OpenAI 发送一段话时，模型并不是直接读“字”，而是读“Token”。这就好比我们去图书馆借书，图书管理员不看书名，而是看那个复杂的<b>索书号</b>。</p>
        </div>
        <div className="analogy-box">
            <strong>💡 核心概念：</strong> 计算机只认识数字，不认识文字。Tokenization 就是一本“大字典”，把文字变成计算机能懂的数字编号。
        </div>

        <div className="visual-container">
            <div className="token-map">
                <div className="token-card">
                    <div className="card-label">输入文字</div>
                    <h3 className="card-value">苹果</h3>
                </div>
                <div className="token-arrow">➜ 查表 ➜</div>
                <div className="token-card">
                    <div className="card-label">Token ID</div>
                    <div className="token-id">15329</div>
                </div>
            </div>
            <p className="visual-caption">模型眼中没有“苹果”，只有 15329。</p>
        </div>
    </section>
);

const EmbeddingSection = () => {
    return (
        <section className="transformer-section fade-in">
            <h2 className="section-title">2. Embedding (词嵌入)</h2>

            <div className="content-text">
                <p>现在我们只是对Token和数字做了一一映射，但是词和词之间是有关系，如果只是数字我们没法表示它们之间的关系，所以需要引入一个叫 <b>Embedding</b> 的东西。</p>
                <p>Embedding是一个N维向量，通过向量我们就能表示不同词之间的关系了。比如通过余弦相似度，我们可以计算两个向量的距离。</p>
            </div>

            <div className="analogy-box">
                <strong>🏪 大众点评比喻：</strong>
                <p>去大众点评找饭店，我们如果单知道店名（Token ID），那么并不知道到底哪家店好吃，得从多个维度去比较：距离、评分、菜品的类型...</p>
                <p>token id相当于饭店名称，token进行embedding后，对应的维度和饭店的维度相对应。</p>
            </div>

            <div className="visual-container">
                <div className="embedding-flow">
                    <div style={{ height: '500px', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                        <Plot
                            data={[
                                {
                                    x: [0.9], y: [0.8], z: [0.2],
                                    mode: 'text+markers',
                                    type: 'scatter3d',
                                    text: ['锦江饭店'],
                                    hovertemplate: '<b>%{text}</b><br>口味 (Flavor): %{x}<br>价格 (Price): %{y}<br>距离 (Distance): %{z}<extra></extra>',
                                    textposition: 'top center',
                                    marker: { size: 12, color: '#6366f1' },
                                    name: 'Target'
                                },
                                {
                                    x: [0.85], y: [0.75], z: [0.25],
                                    mode: 'text+markers',
                                    type: 'scatter3d',
                                    text: ['某川菜馆'],
                                    hovertemplate: '<b>%{text}</b><br>口味 (Flavor): %{x}<br>价格 (Price): %{y}<br>距离 (Distance): %{z}<extra></extra>',
                                    textposition: 'top center',
                                    marker: { size: 10, color: '#818cf8', opacity: 0.8 },
                                    name: 'Similar'
                                },
                                {
                                    x: [0.2], y: [0.1], z: [0.9],
                                    mode: 'text+markers',
                                    type: 'scatter3d',
                                    text: ['路边摊'],
                                    hovertemplate: '<b>%{text}</b><br>口味 (Flavor): %{x}<br>价格 (Price): %{y}<br>距离 (Distance): %{z}<extra></extra>',
                                    textposition: 'top center',
                                    marker: { size: 10, color: '#ef4444', opacity: 0.8 },
                                    name: 'Different'
                                }
                            ]}
                            layout={{
                                autosize: true,
                                title: { text: '3D 词向量空间 (Embedding Space)', font: { color: '#e2e8f0' } },
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                scene: {
                                    xaxis: { title: { text: '口味 (Flavor)', font: { size: 14, color: 'white' } }, color: '#94a3b8', gridcolor: '#334155' },
                                    yaxis: { title: { text: '价格 (Price)', font: { size: 14, color: 'white' } }, color: '#94a3b8', gridcolor: '#334155' },
                                    zaxis: { title: { text: '距离 (Distance)', font: { size: 14, color: 'white' } }, color: '#94a3b8', gridcolor: '#334155' },
                                },
                                showlegend: false,
                                margin: { l: 0, r: 0, b: 0, t: 30 }
                            }}
                            style={{ width: '100%', height: '100%' }}
                            useResizeHandler={true}
                        />
                    </div>
                    <p className="graph-caption" style={{ textAlign: 'center', marginTop: '10px' }}>
                        在三维空间中，“锦江饭店”与“某川菜馆”靠得很近（口味、价格相似），而与“路边摊”距离很远。
                        <br />
                        <span style={{ fontSize: '0.8em', color: '#94a3b8' }}>（注：鼠标悬停查看详细数值，拖动可旋转视角）</span>
                    </p>
                </div>
            </div>
        </section>
    );
};

const PositionSection = () => (
    <section className="transformer-section fade-in">
        <h2 className="section-title">3. Position Embedding (位置编码)</h2>
        <div className="content-text">
            <p>如果你把一句话的字打乱，意思可能完全变了。对于模型来说，每个词如果不加上“座位号”，它就不知道谁在谁前面。</p>
        </div>

        <div className="visual-container">
            <div className="analogy-box" style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ fontSize: '1.1em', marginBottom: '10px' }}>词的顺序决定了谁是主动，谁是被动</div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', flexWrap: 'wrap', marginTop: '20px' }}>
                    <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <span className="pos-box">我 <sup>1</sup></span>
                            <span className="pos-box">爱 <sup>2</sup></span>
                            <span className="pos-box">你 <sup>3</sup></span>
                        </div>
                        <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                            Meaning: I ❤️ You
                        </div>
                    </div>

                    <div style={{ fontSize: '2em', color: 'var(--text-muted)' }}>VS</div>

                    <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <span className="pos-box object">你 <sup>1</sup></span>
                            <span className="pos-box object">爱 <sup>2</sup></span>
                            <span className="pos-box object">我 <sup>3</sup></span>
                        </div>
                        <div style={{ color: 'var(--accent-warning)', fontWeight: 'bold' }}>
                            Meaning: You ❤️ Me
                        </div>
                    </div>
                </div>
            </div>
            <p className="visual-caption">虽然词是一样的（我、爱、你），但因为位置编码（1,2,3）不同，模型能够区分出语义的巨大差别。</p>
        </div>
    </section>
);

const AttentionSection = () => {
    return (
        <section className="transformer-section fade-in">
            <h2 className="section-title">4. Self Attention (自注意力机制)</h2>
            <div className="content-text">
                <p>这是 LLM 的灵魂。模型在看一句话时，不会“平均用力”，而是像人眼一样，<b>聚焦</b>在重要的词上。</p>
                <p>在翻译任务中，当模型生成英文时，它需要回过头去看原始的中文句子，找到对应的词（Alignment）。</p>
                <p>比如翻译 <i>"我是一个学生"</i> 为 <i>"I am a student"</i> 时，各个词的注意力分布如下：</p>
            </div>

            <div className="visual-container">
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <div className="img-wrapper">
                        {/* Using imported images */}
                        <img src={attention1} alt="Attention Example 1" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '300px' }} />
                        <p className="img-caption">注意力热力图示例 1</p>
                    </div>
                    <div className="img-wrapper">
                        <img src={attention2} alt="Attention Example 2" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '300px' }} />
                        <p className="img-caption">注意力热力图示例 2</p>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <h3>交互式演示: "我是一个学生" ➜ "I am a student"</h3>
                    <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                        点击左侧生成的英文单词（Query），查看它主要关注哪一个中文词（Key）。
                    </p>
                    <AttentionMatrix />
                </div>
            </div>
        </section>
    );
};

const GenericAttentionMatrix = ({ tokens, matrix, activeQuery, onQueryChange, title, description, renderDetailPanel }) => {
    const getCellClass = (val) => {
        if (val > 0.6) return 'matrix-cell heat-high';
        if (val > 0.3) return 'matrix-cell heat-med';
        if (val > 0.05) return 'matrix-cell heat-low';
        return 'matrix-cell heat-lowest';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div className="matrix-wrapper" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', maxWidth: '100%', overflowX: 'auto', paddingBottom: '20px' }}>

                {/* Visual Grid */}
                <div style={{ flex: 1, minWidth: 'fit-content' }}>
                    {title && (
                        <div style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                            {title}
                        </div>
                    )}

                    <div className="matrix-grid" style={{ gridTemplateColumns: `80px repeat(${tokens.length}, 1fr)`, gap: '2px' }}>

                        {/* Header Row (Top Axis) */}
                        <div className="matrix-header" style={{ fontSize: '0.7em' }}>Q\K</div>
                        {tokens.map((t, i) => (
                            <div key={i} className="matrix-header" style={{
                                fontSize: '0.75em',
                                writingMode: 'vertical-lr',
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingBottom: '5px'
                            }}>
                                {t}
                            </div>
                        ))}

                        {/* Data Rows */}
                        {tokens.map((queryToken, r) => (
                            <React.Fragment key={r}>
                                {/* Row Label (Left Axis) */}
                                <div
                                    className="matrix-row-label visible"
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '0.75em',
                                        color: activeQuery === r ? 'var(--accent-primary)' : 'var(--text-primary)',
                                        fontWeight: activeQuery === r ? 'bold' : 'normal',
                                        whiteSpace: 'nowrap',
                                        justifyContent: 'flex-end',
                                        paddingRight: '5px'
                                    }}
                                    onClick={() => onQueryChange && onQueryChange(r)}
                                >
                                    {queryToken}
                                </div>

                                {/* Cells */}
                                {tokens.map((_, c) => {
                                    const score = matrix[r][c];
                                    const isActive = activeQuery === r;
                                    return (
                                        <div key={`${r}-${c}`} className="matrix-cell-box visible">
                                            <div
                                                className={getCellClass(score)}
                                                style={{
                                                    opacity: isActive ? 1 : 0.4, // Dim background rows more
                                                    border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                                    fontSize: '0.55em',
                                                    padding: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: score === 0 ? 'var(--bg-card)' : undefined, // Explicitly empty for masked
                                                }}
                                                title={`${tokens[r]} -> ${tokens[c]}: ${score.toFixed(2)}`}
                                            >
                                                {score > 0 ? score.toFixed(2).replace('0.', '.') : ''}
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Explanation Panel */}
                <div style={{ width: '220px', padding: '15px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', height: 'fit-content', marginTop: '70px' }}>
                    {/* Default Detail Panel provided by Parent or Generic Fallback */}
                    {renderDetailPanel ? renderDetailPanel(activeQuery, matrix) : (
                        <>
                            <h4 style={{ marginBottom: '10px', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                                {activeQuery !== null ? `Token: "${tokens[activeQuery]}"` : "Details"}
                            </h4>
                            {activeQuery !== null ? (
                                <div className="fade-in">
                                    <div style={{ marginBottom: '10px', fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                                        Top Attention:
                                    </div>
                                    {tokens
                                        .map((t, i) => ({ token: t, score: matrix[activeQuery][i] }))
                                        .filter(item => item.score > 0)
                                        .sort((a, b) => b.score - a.score)
                                        .slice(0, 5)
                                        .map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                                <div style={{ width: '40px', fontSize: '0.8em', textAlign: 'right', marginRight: '8px' }}>{item.token}</div>
                                                <div style={{ flex: 1, height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', marginRight: '5px' }}>
                                                    <div style={{
                                                        width: `${item.score * 100}%`,
                                                        height: '100%',
                                                        background: 'var(--accent-primary)',
                                                        borderRadius: '3px'
                                                    }}></div>
                                                </div>
                                                <div style={{ width: '30px', fontSize: '0.8em', fontFamily: 'monospace' }}>{item.score.toFixed(2)}</div>
                                            </div>
                                        ))
                                    }
                                </div>
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>
                                    {description || "Click a row to see attention details."}
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

const AttentionMatrix = () => {
    const [activeQuery, setActiveQuery] = useState(null);

    // Full Token Sequence (13 tokens)
    const tokens = ['翻译', '：', '我', '是', '个', '学', '生', '。', 'I', 'am', 'a', 'student', '.'];

    // Helper to generate mock scores based on the logic
    const getMockScores = () => {
        const matrix = [];
        for (let r = 0; r < 13; r++) {
            const rawRow = [];
            let rowSum = 0;

            for (let c = 0; c < 13; c++) {
                // Base structure (unnormalized logits)
                let val = 0.01 + Math.random() * 0.02;

                // 1. Self Attention (Diagonal) - Strong
                if (r === c) val += 0.8;

                // 2. Local Context (previous/next neighbor)
                if (Math.abs(r - c) === 1) val += 0.2;

                // 3. Instruction Attention (Everyone attends to "翻译")
                if (c === 0) val += 0.1;

                // 4. Alignment Logic
                if (r === 8 && c === 2) val += 2.5; // I -> 我
                if (r === 9 && c === 3) val += 2.5; // am -> 是
                if (r === 10 && c === 4) val += 2.5; // a -> 个
                if (r === 11 && (c === 5 || c === 6)) val += 1.5; // student -> 学, 生
                if (r === 12 && c === 7) val += 2.0; // . -> 。
                if (r === 2 && c === 8) val += 1.0; // Reverse: 我 -> I

                rawRow.push(val);
                rowSum += val;
            }

            // Normalize row to sum to 1.0
            const normalizedRow = rawRow.map(v => v / rowSum);
            matrix.push(normalizedRow);
        }
        return matrix;
    };

    const [attentionMatrix] = useState(() => getMockScores());

    return (
        <GenericAttentionMatrix
            tokens={tokens}
            matrix={attentionMatrix}
            activeQuery={activeQuery}
            onQueryChange={setActiveQuery}
            title="Full Attention Matrix (13x13) - Translation Task"
            description="Full Encoder Attention: Every token attends to every other token to build a global understanding."
            renderDetailPanel={(activeQuery, matrix) => (
                <>
                    <h4 style={{ marginBottom: '10px', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                        {activeQuery !== null ? `Token: "${tokens[activeQuery]}"` : "点击矩阵行查看详情"}
                    </h4>
                    {activeQuery !== null ? (
                        <div className="fade-in">
                            <div style={{ marginBottom: '10px', fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                                Top Attention:
                            </div>
                            {tokens
                                .map((t, i) => ({ token: t, score: matrix[activeQuery][i] }))
                                .sort((a, b) => b.score - a.score)
                                .slice(0, 5)
                                .map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                        <div style={{ width: '40px', fontSize: '0.8em', textAlign: 'right', marginRight: '8px' }}>{item.token}</div>
                                        <div style={{ flex: 1, height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', marginRight: '5px' }}>
                                            <div style={{
                                                width: `${item.score * 100}%`,
                                                height: '100%',
                                                background: 'var(--accent-primary)',
                                                borderRadius: '3px'
                                            }}></div>
                                        </div>
                                        <div style={{ width: '30px', fontSize: '0.8em', fontFamily: 'monospace' }}>{item.score.toFixed(2)}</div>
                                    </div>
                                ))
                            }
                            <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)', fontSize: '0.8em', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                {activeQuery < 2 && "Instruction Focus"}
                                {activeQuery >= 2 && activeQuery <= 7 && "Chinese Context"}
                                {activeQuery >= 8 && "English Generation & Alignment"}
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>
                            点击任意一行，看这个词“关注”了谁。
                        </div>
                    )}
                </>
            )}
        />
    );
};




const EncoderDecoderSection = () => {
    // Encoder Data
    const encoderTokens = ["[CLS]", "This", "movie", "is", "great", "[SEP]"];
    const [encoderActive, setEncoderActive] = useState(null);
    const [encoderMatrix] = useState(() => {
        // Full Attention: Everyone sees everyone
        return encoderTokens.map((t, r) => {
            let raw = encoderTokens.map((_, c) => {
                let val = Math.random() * 0.1;
                if (r === c) val += 0.5; // Self
                if (r === 0 || c === 0) val += 0.3; // CLS focus
                return val;
            });
            const sum = raw.reduce((a, b) => a + b, 0);
            return raw.map(v => v / sum);
        });
    });

    // Decoder Data
    const decoderTokens = ["[START]", "I", "love", "coding", "with", "AI"];
    const [decoderActive, setDecoderActive] = useState(null);
    const [decoderMatrix] = useState(() => {
        // Causal Attention: Masked Future
        return decoderTokens.map((t, r) => {
            let raw = decoderTokens.map((_, c) => {
                if (c > r) return 0; // Masked!
                let val = Math.random() * 0.1;
                if (r === c) val += 0.8; // Self
                if (c === 0) val += 0.2; // Start token
                // Recent tokens
                if (r > 0 && c === r - 1) val += 0.4;
                return val;
            });
            const sum = raw.reduce((a, b) => a + b, 0);
            return raw.map(v => v / sum);
        });
    });


    return (
        <section className="transformer-section fade-in">
            <h2 className="section-title">5. Encoder vs Decoder (矩阵对比)</h2>

            <div className="content-text">
                <p>直观对比 Encoder (全向注意力) 与 Decoder (单向/因果注意力) 在处理信息时的核心差异。</p>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h3 style={{ borderLeft: '4px solid var(--accent-primary)', paddingLeft: '10px', marginBottom: '20px' }}>
                    1. Encoder (如 BERT): 上帝视角
                </h3>
                <p style={{ marginBottom: '15px', fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                    矩阵完全填满。第1个词可以看见最后1个词。这种结构适合<b>理解</b>整个句子（如情感分析）。
                </p>
                <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '8px' }}>
                    <GenericAttentionMatrix
                        tokens={encoderTokens}
                        matrix={encoderMatrix}
                        activeQuery={encoderActive}
                        onQueryChange={setEncoderActive}
                        title="Encoder Self-Attention (Full Matrix)"
                        description="注意观察：矩阵右上角是有值的。'[CLS]' 可以看到 'great'，反之亦然。"
                    />
                </div>
            </div>

            <div style={{ marginTop: '50px' }}>
                <h3 style={{ borderLeft: '4px solid var(--accent-success)', paddingLeft: '10px', marginBottom: '20px' }}>
                    2. Decoder (如 GPT): 凡人视角
                </h3>
                <p style={{ marginBottom: '15px', fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                    矩阵是<b>下三角</b>形状。右上角被 Mask 掉（灰色空缺）。第1个词<b>看不见</b>后面的词。这种结构适合<b>生成</b>（时光不能倒流）。
                </p>
                <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '8px' }}>
                    <GenericAttentionMatrix
                        tokens={decoderTokens}
                        matrix={decoderMatrix}
                        activeQuery={decoderActive}
                        onQueryChange={setDecoderActive}
                        title="Decoder Visual-Attention (Masked / Lower Triangular)"
                        description="注意观察：矩阵对角线右上方全是空白。'I' 看不见 'love'，只能看见 '[START]' 和自己。"
                    />
                </div>
            </div>

        </section>
    );
};


const OutputSection = () => {
    const [mode, setMode] = useState('decoder'); // 'encoder' or 'decoder'

    return (
        <section className="transformer-section fade-in">
            <h2 className="section-title">6. Output Generation (输出层)</h2>
            <div className="content-text">
                <p>Transformer 的输出形式取决于它是做<b>理解 (Encoder)</b> 还是 <b>生成 (Decoder)</b> 任务。</p>
            </div>

            <div className="tab-toggle-container" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <button
                    className={`tab-toggle-btn ${mode === 'encoder' ? 'active' : ''}`}
                    onClick={() => setMode('encoder')}
                    style={{
                        padding: '10px 30px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '20px 0 0 20px',
                        background: mode === 'encoder' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        color: mode === 'encoder' ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer'
                    }}
                >
                    Encoder: 理解与分类
                </button>
                <button
                    className={`tab-toggle-btn ${mode === 'decoder' ? 'active' : ''}`}
                    onClick={() => setMode('decoder')}
                    style={{
                        padding: '10px 30px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0 20px 20px 0',
                        background: mode === 'decoder' ? 'var(--accent-success)' : 'var(--bg-secondary)',
                        color: mode === 'decoder' ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer'
                    }}
                >
                    Decoder: 逐字生成
                </button>
            </div>

            <div className="demo-stage" style={{ minHeight: '400px', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', background: 'var(--bg-card)' }}>
                {mode === 'encoder' ? <EncoderDemo /> : <DecoderDemo />}
            </div>
        </section>
    );
};

const EncoderDemo = () => {
    // State: 0=Input, 1=Attention/Pooling, 2=Output
    const [step, setStep] = useState(0);

    // Example: Sentiment Analysis or Topic Classification on the source sentence
    const tokens = ["[CLS]", "我", "是", "一", "个", "学", "生", "。", "[SEP]"];

    const nextStep = () => {
        setStep(prev => (prev + 1) % 3);
    };

    const reset = () => setStep(0);

    return (
        <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}>Encoder 任务: 句子分类</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.9em' }}>
                Encoder 这种“双向”结构非常适合读懂整句话。通常使用第一个 token <b>[CLS]</b> 来代表整个句子的语义。
            </p>

            {/* Visual Stage */}
            <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

                {/* 1. Tokens Layer */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
                    {tokens.map((t, i) => (
                        <div key={i} className="token-node" style={{
                            padding: '8px 12px',
                            background: t === '[CLS]' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                            color: t === '[CLS]' ? 'white' : 'var(--text-primary)',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.9em',
                            fontWeight: t === '[CLS]' ? 'bold' : 'normal',
                            opacity: step >= 0 ? 1 : 0,
                            transform: step >= 0 ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'all 0.5s ease',
                            boxShadow: step === 1 && t === '[CLS]' ? '0 0 15px var(--accent-primary)' : 'none'
                        }}>
                            {t}
                        </div>
                    ))}
                </div>

                {/* 2. Attention Lines (Visual Only) */}
                {step >= 1 && (
                    <div style={{ position: 'absolute', top: '45px', left: '0', right: '0', height: '60px', overflow: 'hidden', pointerEvents: 'none' }}>
                        {/* Simplified CSS lines converging to CLS */}
                        <div style={{
                            width: '10px', height: '10px', background: 'var(--accent-primary)', borderRadius: '50%',
                            position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                            opacity: 0,
                            animation: 'converge 1s forwards'
                        }}></div>
                    </div>
                )}

                {/* 3. Classification Result */}
                <div style={{
                    marginTop: '20px',
                    opacity: step >= 2 ? 1 : 0,
                    transform: step >= 2 ? 'scale(1)' : 'scale(0.8)',
                    transition: 'all 0.5s ease'
                }}>
                    <div style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginBottom: '5px' }}>Classification Head Output</div>
                    <div style={{
                        padding: '10px 20px',
                        background: '#10b981',
                        color: 'white',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        Topic: Education (教育)
                    </div>
                </div>

            </div>

            {/* Controls */}
            <div style={{ marginTop: '30px' }}>
                <p style={{ minHeight: '1.5em', marginBottom: '15px', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                    {step === 0 && "1. 输入：将整个句子一次性输入模型，并在开头加上 [CLS] 标记。"}
                    {step === 1 && "2. 处理：Self-Attention 机制让 [CLS] 能够“看见”并从所有词（我、学生...）收集信息。"}
                    {step === 2 && "3. 输出：取出 [CLS] 的向量，通过分类层，判断这是一个关于“教育”的句子。"}
                </p>
                <button
                    className="action-btn"
                    onClick={step === 2 ? reset : nextStep}
                    style={{ padding: '8px 24px', fontSize: '1em' }}
                >
                    {step === 2 ? "重置 (Reset)" : "下一步 (Next Step)"}
                </button>
            </div>
        </div>
    );
};

const DecoderDemo = () => {
    // Steps: 0..N (Word by word generation)
    // Sentence: I am a student .
    const sourceTokens = ['翻译', '：', '我', '是', '个', '学', '生', '。'];
    const targetSteps = [
        { word: "I", probs: [{ n: 'I', v: 0.75 }, { n: 'The', v: 0.1 }, { n: 'You', v: 0.05 }, { n: 'He', v: 0.05 }] },
        { word: "am", probs: [{ n: 'am', v: 0.82 }, { n: 'like', v: 0.08 }, { n: 'will', v: 0.04 }, { n: 'can', v: 0.02 }] },
        { word: "a", probs: [{ n: 'a', v: 0.91 }, { n: 'the', v: 0.03 }, { n: 'student', v: 0.02 }, { n: 'good', v: 0.01 }] },
        { word: "student", probs: [{ n: 'student', v: 0.65 }, { n: 'teacher', v: 0.15 }, { n: 'person', v: 0.1 }, { n: 'boy', v: 0.05 }] },
        { word: ".", probs: [{ n: '.', v: 0.95 }, { n: 'and', v: 0.02 }, { n: '!', v: 0.01 }, { n: '?', v: 0.01 }] },
        { word: "[END]", probs: [{ n: '[END]', v: 0.98 }, { n: '.', v: 0.01 }, { n: 'Bye', v: 0.005 }] }
    ];

    const [currentStep, setCurrentStep] = useState(0);
    const [generated, setGenerated] = useState(["[START]"]);

    const handleNext = () => {
        if (currentStep < targetSteps.length) {
            setGenerated(prev => [...prev, targetSteps[currentStep].word]);
            setCurrentStep(prev => prev + 1);
        } else {
            // Reset
            setGenerated(["[START]"]);
            setCurrentStep(0);
        }
    };

    const isFinished = currentStep === targetSteps.length;
    const currentProbs = isFinished ? [] : targetSteps[currentStep].probs;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--accent-success)' }}>Decoder 任务: 翻译生成</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                    Decoder 必须“戴着眼罩”工作。它只能根据<b>已生成的词</b>，来预测<b>下一个词</b>。
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1 }}>
                {/* Left: Visualization of Generation */}
                <div style={{ padding: '15px', background: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>

                    {/* Source Context */}
                    <div style={{ marginBottom: '8px', fontSize: '0.9em', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                        Context (Input):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px', padding: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
                        {sourceTokens.map((t, i) => (
                            <span key={`src-${i}`} style={{
                                padding: '4px 8px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)',
                                borderRadius: '4px',
                                fontSize: '0.85em',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                                {t}
                            </span>
                        ))}
                    </div>

                    {/* Generated Context */}
                    <div style={{ marginBottom: '8px', fontSize: '0.9em', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                        Generation (Output):
                    </div>
                    <div style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-primary)', padding: '15px', alignContent: 'flex-start', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {generated.map((token, i) => (
                            <span key={i} className="bounce-in" style={{
                                padding: '4px 8px',
                                background: i === 0 ? 'var(--text-muted)' : 'var(--accent-success)',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '1em',
                                height: 'fit-content'
                            }}>
                                {token}
                            </span>
                        ))}
                        {!isFinished && (
                            <span style={{
                                padding: '4px 8px',
                                border: '1px dashed var(--accent-success)',
                                color: 'var(--accent-success)',
                                borderRadius: '4px',
                                opacity: 0.6,
                                animation: 'pulse 1.5s infinite'
                            }}>
                                ?
                            </span>
                        )}
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <button
                            className="action-btn success"
                            onClick={handleNext}
                            style={{ width: '100%', padding: '10px' }}
                        >
                            {isFinished ? "重新开始 (Restart)" : `生成下一个词 (Generate "${targetSteps[currentStep].word}")`}
                        </button>
                    </div>
                </div>

                {/* Right: Probability Chart */}
                <div style={{ padding: '15px', background: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: '0.9em', marginBottom: '15px', textAlign: 'center' }}>
                        Next Token Probability (词表概率)
                    </h4>

                    {isFinished ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-success)', flexDirection: 'column' }}>
                            <div style={{ fontSize: '3em' }}>🎉</div>
                            <div>Generation Complete</div>
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: '250px' }}>
                            <ResponsiveContainer>
                                <BarChart data={currentProbs} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="n" type="category" width={60} tick={{ fill: 'var(--text-primary)', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                    />
                                    <Bar dataKey="v" barSize={20} radius={[0, 4, 4, 0]}>
                                        {currentProbs.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-success)' : 'var(--text-muted)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div style={{ textAlign: 'center', fontSize: '0.8em', marginTop: '10px', color: 'var(--text-secondary)' }}>
                                模型认为接下来的词最可能是: <b>"{targetSteps[currentStep].word}"</b> ({Math.floor(targetSteps[currentStep].probs[0].v * 100)}%)
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransformerTab;

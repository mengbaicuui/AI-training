import React, { useState, useMemo } from 'react';
/* Import images */
import attention1 from '../data/training/images/attention1.png';
import attention2 from '../data/training/images/attention2.png';
import transformerOverall from '../data/training/images/transformer-overall.png';
import Plot from 'react-plotly.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import transformerQuestions from '../data/transformerQuestions';
import QuestionPanel from './QuestionPanel';

const TransformerTab = () => {
    const [activeSection, setActiveSection] = useState('tokenization');

    // 使用 useMemo 确保问题随 activeSection 变化而更新
    const currentQuestions = useMemo(() => {
        const sectionMap = {
            'tokenization': 'tokenization',
            'embedding': 'embedding',
            'position': 'position',
            'attention': 'attention',
            'encoder-decoder': 'encoderDecoder',
            'output': 'output'
        };
        const key = sectionMap[activeSection];
        return transformerQuestions[key]?.questions || [];
    }, [activeSection]);

    // 获取热身问题
    const currentWarmupQuestions = useMemo(() => {
        const sectionMap = {
            'tokenization': 'tokenization',
            'embedding': 'embedding',
            'position': 'position',
            'attention': 'attention',
            'encoder-decoder': 'encoderDecoder',
            'output': 'output'
        };
        const key = sectionMap[activeSection];
        return transformerQuestions[key]?.warmupQuestions || [];
    }, [activeSection]);

    const sectionTitle = useMemo(() => {
        const titles = {
            'tokenization': 'Tokenization (分词)',
            'embedding': 'Embedding (词嵌入)',
            'position': 'Position (位置编码)',
            'attention': 'Self Attention (自注意力)',
            'encoder-decoder': 'Encoder vs Decoder',
            'output': 'Output (输出)'
        };
        return titles[activeSection] || '';
    }, [activeSection]);

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
                    <button
                        className={`transformer-nav-item ${activeSection === 'summary' ? 'active' : ''}`}
                        onClick={() => setActiveSection('summary')}
                    >
                        7. 总结
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
                {activeSection === 'summary' && <SummarySection />}
            </div>

            {/* 问题面板 - 使用 key 强制重新渲染 */}
            <QuestionPanel
                key={activeSection}
                questions={currentQuestions}
                warmupQuestions={currentWarmupQuestions}
                sectionTitle={sectionTitle}
            />
        </div>
    );
};

/* --- Sub-components (Placeholders for now, will fill in next steps) --- */

const TokenizationSection = () => (
    <section className="transformer-section fade-in">
        <h2 className="section-title">1. Tokenization (分词)</h2>
        <div className="content-text">
            <p>当你给 LLM 发送一段话时，模型并不是直接读“字”，而是读“Token”。这就好比我们去图书馆借书，图书管理员不看书名，而是看那个复杂的<b>索书号</b>。</p>
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

        <div className="interactive-demo-card" style={{
            background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
            padding: '24px',
            marginTop: '24px',
            borderRadius: '12px',
            border: '1px solid var(--border-accent)',
            marginBottom: '24px',
            textAlign: 'center'
        }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '12px' }}>🚀 交互式深度演示</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                我们准备了一个独立的交互式实验室，带你体验 BPE 训练过程、Token 切分策略对比以及特殊 Token 的工作原理。
            </p>
            <a
                href="/tokenization.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'inline-block',
                    padding: '12px 32px',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
                打开 Tokenizer 实验室 ➜
            </a>
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

                {/* QKV 交互详解 */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '30px', marginTop: '30px' }}>
                    <h3>🔍 深入理解：Q、K、V 矩阵是如何交互的？</h3>
                    <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                        以"小明是学生，他喜欢编程" 为例，看看"他"这个词是如何通过注意力机制找到"小明"的。
                    </p>
                    <QKVInteractionDemo />
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
                            点击任意一行，看这个词"关注"了谁。
                        </div>
                    )}
                </>
            )}
        />
    );
};

// QKV 交互演示组件
const QKVInteractionDemo = () => {
    const [step, setStep] = useState(0);

    // 示例："小明是学生，他喜欢编程" - 重点展示"他"指向"小明"
    const sourceTokens = ['小明', '是', '学生', '，', '他', '喜欢', '编程'];

    // 模拟的 Embedding 向量（简化为4维）
    const embeddings = {
        '小明': [0.9, 0.3, 0.2, 0.8],
        '是': [0.2, 0.7, 0.3, 0.2],
        '学生': [0.6, 0.4, 0.2, 0.7],
        '，': [0.1, 0.1, 0.1, 0.1],
        '他': [0.85, 0.25, 0.15, 0.75],
        '喜欢': [0.4, 0.8, 0.5, 0.3],
        '编程': [0.5, 0.6, 0.8, 0.4],
    };

    // 计算 Q, K, V（简化的矩阵乘法结果）
    const Q_vectors = {
        '小明': [0.72, 0.41, 0.58, 0.65],
        '是': [0.38, 0.55, 0.42, 0.31],
        '学生': [0.56, 0.48, 0.45, 0.62],
        '，': [0.15, 0.18, 0.12, 0.14],
        '他': [0.70, 0.38, 0.52, 0.61],
        '喜欢': [0.45, 0.62, 0.55, 0.38],
        '编程': [0.52, 0.58, 0.68, 0.45],
    };

    const K_vectors = {
        '小明': [0.68, 0.45, 0.52, 0.71],
        '是': [0.35, 0.48, 0.38, 0.29],
        '学生': [0.51, 0.42, 0.39, 0.55],
        '，': [0.12, 0.15, 0.11, 0.13],
        '他': [0.65, 0.42, 0.48, 0.68],
        '喜欢': [0.42, 0.58, 0.51, 0.35],
        '编程': [0.48, 0.52, 0.62, 0.41],
    };

    const V_vectors = {
        '小明': [0.75, 0.38, 0.45, 0.72],
        '是': [0.31, 0.62, 0.28, 0.35],
        '学生': [0.52, 0.45, 0.38, 0.61],
        '，': [0.08, 0.10, 0.09, 0.08],
        '他': [0.71, 0.35, 0.42, 0.69],
        '喜欢': [0.38, 0.65, 0.48, 0.32],
        '编程': [0.45, 0.55, 0.71, 0.38],
    };

    // 注意力分数（Q·K^T / √d_k）- 7x7 矩阵，重点是"他"对"小明"的高分
    const attentionScores = [
        [0.92, 0.28, 0.45, 0.08, 0.78, 0.35, 0.42],  // "小明" 的注意力分数
        [0.32, 0.88, 0.41, 0.05, 0.28, 0.52, 0.38],  // "是"
        [0.48, 0.38, 0.91, 0.06, 0.42, 0.45, 0.55],  // "学生"
        [0.15, 0.12, 0.14, 0.25, 0.13, 0.18, 0.16],  // "，"
        [0.89, 0.25, 0.38, 0.05, 0.72, 0.32, 0.35],  // "他" - 对"小明"分数最高！
        [0.35, 0.48, 0.42, 0.06, 0.38, 0.85, 0.62],  // "喜欢"
        [0.38, 0.42, 0.52, 0.07, 0.35, 0.58, 0.88],  // "编程"
    ];

    // Softmax 后的注意力权重 - "他"主要关注"小明"
    const attentionWeights = [
        [0.38, 0.08, 0.15, 0.02, 0.28, 0.05, 0.04],  // "小明"
        [0.10, 0.42, 0.14, 0.02, 0.08, 0.16, 0.08],  // "是"
        [0.16, 0.10, 0.40, 0.02, 0.12, 0.10, 0.10],  // "学生"
        [0.14, 0.13, 0.15, 0.18, 0.13, 0.14, 0.13],  // "，"
        [0.45, 0.07, 0.12, 0.02, 0.22, 0.06, 0.06],  // "他" - 45%关注"小明"！
        [0.08, 0.14, 0.10, 0.02, 0.08, 0.38, 0.20],  // "喜欢"
        [0.08, 0.10, 0.14, 0.02, 0.06, 0.18, 0.42],  // "编程"
    ];

    const steps = [
        {
            title: '第1步：输入 Embedding',
            description: '每个词先通过 Embedding 层，变成一个向量（这里简化为4维）',
        },
        {
            title: '第2步：生成 Q、K、V',
            description: '输入向量分别乘以三个权重矩阵 W_Q、W_K、W_V，得到 Query、Key、Value 向量',
        },
        {
            title: '第3步：计算注意力分数',
            description: 'Q 和 K 做点积，得到每对词之间的"相关性分数"，再除以 √d_k 进行缩放',
        },
        {
            title: '第4步：Softmax 归一化',
            description: '对每一行做 Softmax，把分数变成概率分布（每行和为1）',
        },
        {
            title: '第5步：加权求和得到输出',
            description: '用注意力权重对 V 向量加权求和，得到融合了上下文信息的新向量',
        },
    ];

    // 根据注意力分数获取背景颜色（颜色深浅体现注意力强弱）
    const getHeatColor = (val, isAttentionMatrix = false) => {
        if (!isAttentionMatrix || typeof val !== 'number') {
            return 'var(--bg-tertiary)';
        }
        // 使用红色系，分数越高颜色越深
        if (val > 0.8) return 'rgba(239, 68, 68, 0.9)';  // 深红
        if (val > 0.6) return 'rgba(239, 68, 68, 0.7)';  // 中深红
        if (val > 0.4) return 'rgba(239, 68, 68, 0.5)';  // 中红
        if (val > 0.2) return 'rgba(239, 68, 68, 0.3)';  // 浅红
        if (val > 0.1) return 'rgba(239, 68, 68, 0.15)'; // 很浅红
        return 'var(--bg-tertiary)';  // 几乎无色
    };

    const renderMatrix = (data, labels, title, useHeatmap = false) => (
        <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>{title}</div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `60px repeat(${data[0]?.length || 4}, 1fr)`,
                gap: '2px',
                fontSize: '0.75em'
            }}>
                {/* Header */}
                <div></div>
                {(labels || ['d1', 'd2', 'd3', 'd4']).map((l, i) => (
                    <div key={i} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4px' }}>{l}</div>
                ))}
                {/* Data rows */}
                {data.map((row, r) => (
                    <React.Fragment key={r}>
                        <div style={{
                            textAlign: 'right',
                            paddingRight: '8px',
                            color: 'var(--accent-primary)',
                            fontWeight: 'bold'
                        }}>
                            {sourceTokens[r] || `Row${r}`}
                        </div>
                        {row.map((val, c) => {
                            const bgColor = getHeatColor(val, useHeatmap);
                            const isHighScore = useHeatmap && typeof val === 'number' && val > 0.4;
                            return (
                                <div key={c} style={{
                                    background: bgColor,
                                    color: isHighScore ? 'white' : 'var(--text-primary)',
                                    padding: '6px 4px',
                                    textAlign: 'center',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace',
                                    fontWeight: isHighScore ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease'
                                }}>
                                    {typeof val === 'number' ? val.toFixed(2) : val}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    const renderVectorComparison = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {/* Q vectors */}
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '8px', border: '2px solid var(--accent-primary)' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '10px', textAlign: 'center' }}>
                    Q (Query) 查询
                </div>
                <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                    "我想找什么？"
                </div>
                {sourceTokens.map((t, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold' }}>{t}:</span>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                            [{Q_vectors[t].map(v => v.toFixed(2)).join(', ')}]
                        </div>
                    </div>
                ))}
            </div>

            {/* K vectors */}
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', border: '2px solid var(--accent-success)' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--accent-success)', marginBottom: '10px', textAlign: 'center' }}>
                    K (Key) 键
                </div>
                <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                    "我的标签是什么？"
                </div>
                {sourceTokens.map((t, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold' }}>{t}:</span>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                            [{K_vectors[t].map(v => v.toFixed(2)).join(', ')}]
                        </div>
                    </div>
                ))}
            </div>

            {/* V vectors */}
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '8px', border: '2px solid var(--accent-warning)' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--accent-warning)', marginBottom: '10px', textAlign: 'center' }}>
                    V (Value) 值
                </div>
                <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                    "我的实际内容"
                </div>
                {sourceTokens.map((t, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold' }}>{t}:</span>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                            [{V_vectors[t].map(v => v.toFixed(2)).join(', ')}]
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAttentionCalculation = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Raw scores */}
            <div>
                <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-primary)' }}>
                    Q · K<sup>T</sup> / √d<sub>k</sub> (原始分数)
                </div>
                {renderMatrix(attentionScores, sourceTokens, '', true)}
                <div style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '8px' }}>
                    每个格子 = Q<sub>行</sub> · K<sub>列</sub> 的点积结果
                </div>
            </div>

            {/* Softmax weights */}
            <div>
                <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-primary)' }}>
                    Softmax(scores) (注意力权重)
                </div>
                {renderMatrix(attentionWeights, sourceTokens, '', true)}
                <div style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginTop: '8px' }}>
                    每行和为 1，表示"关注度分配"
                </div>
            </div>
        </div>
    );

    const renderFinalOutput = () => {
        // 计算 "他" 这个词的输出（作为示例）- 重点展示指代消解
        const exampleToken = '他';
        const exampleIndex = 4; // "他" 在 sourceTokens 中的索引
        const weights = attentionWeights[exampleIndex];

        return (
            <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '15px', color: 'var(--accent-primary)', fontSize: '1.1em' }}>
                    以 "{exampleToken}" 为例，计算输出向量：
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '20px',
                    fontSize: '0.85em'
                }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>Output</span>
                    <span>=</span>
                    <span style={{ background: 'rgba(239, 68, 68, 0.3)', padding: '4px 8px', borderRadius: '4px', border: '2px solid #ef4444', fontWeight: 'bold' }}>
                        {weights[0].toFixed(2)} × V<sub>小明</sub>
                    </span>
                    <span>+</span>
                    <span style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                        {weights[1].toFixed(2)} × V<sub>是</sub>
                    </span>
                    <span>+</span>
                    <span style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                        {weights[2].toFixed(2)} × V<sub>学生</sub>
                    </span>
                    <span>+ ...</span>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    alignItems: 'center'
                }}>
                    <span>=</span>
                    <div style={{
                        background: 'var(--accent-success)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontWeight: 'bold'
                    }}>
                        [0.58, 0.39, 0.41, 0.55]
                    </div>
                </div>

                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(99, 102, 241, 0.1))',
                    borderRadius: '8px',
                    border: '2px solid var(--accent-primary)'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        🎯 关键发现：指代消解 (Coreference Resolution)
                    </div>
                    <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        "<b>他</b>" 的注意力权重中，<span style={{ color: '#ef4444', fontWeight: 'bold' }}>45% 指向了 "小明"</span>！
                        <br/><br/>
                        这说明模型通过 Self-Attention "理解"了：<b>"他" 指的就是 "小明"</b>。
                        <br/>
                        这就是 Attention 机制解决<b>代词指代</b>问题的核心原理。
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{
            background: 'var(--bg-card)',
            padding: '25px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
        }}>
            {/* Step indicator */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '25px',
                flexWrap: 'wrap'
            }}>
                {steps.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setStep(i)}
                        style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '20px',
                            background: step === i ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                            color: step === i ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.85em',
                            fontWeight: step === i ? 'bold' : 'normal',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Step {i + 1}
                    </button>
                ))}
            </div>

            {/* Current step info */}
            <div style={{
                textAlign: 'center',
                marginBottom: '25px',
                padding: '15px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px'
            }}>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '8px' }}>
                    {steps[step].title}
                </h4>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9em' }}>
                    {steps[step].description}
                </p>
            </div>

            {/* Step content */}
            <div className="fade-in" key={step}>
                {step === 0 && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ fontSize: '1.5em', marginBottom: '15px' }}>
                                {sourceTokens.map((t, i) => (
                                    <span key={i} style={{
                                        display: 'inline-block',
                                        margin: '0 10px',
                                        padding: '10px 20px',
                                        background: 'var(--accent-primary)',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontWeight: 'bold'
                                    }}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                            <div style={{ fontSize: '2em', margin: '10px 0' }}>↓</div>
                            <div style={{ color: 'var(--text-muted)' }}>Embedding Layer</div>
                            <div style={{ fontSize: '2em', margin: '10px 0' }}>↓</div>
                        </div>
                        {renderMatrix(
                            sourceTokens.map(t => embeddings[t]),
                            ['dim 1', 'dim 2', 'dim 3', 'dim 4'],
                            'Embedding 向量（每个词 → 4维向量）'
                        )}
                    </div>
                )}

                {step === 1 && (
                    <div>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '20px',
                            padding: '15px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.1em' }}>
                                <span style={{ color: 'var(--accent-primary)' }}>Q</span> = X · W<sub>Q</sub> &nbsp;&nbsp;|&nbsp;&nbsp;
                                <span style={{ color: 'var(--accent-success)' }}>K</span> = X · W<sub>K</sub> &nbsp;&nbsp;|&nbsp;&nbsp;
                                <span style={{ color: 'var(--accent-warning)' }}>V</span> = X · W<sub>V</sub>
                            </div>
                            <div style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginTop: '8px' }}>
                                同一个输入 X，乘以不同的权重矩阵，得到不同"角色"的向量
                            </div>
                        </div>
                        {renderVectorComparison()}
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '20px',
                            padding: '15px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.1em' }}>
                                Score<sub>ij</sub> = Q<sub>i</sub> · K<sub>j</sub><sup>T</sup> / √d<sub>k</sub>
                            </div>
                            <div style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginTop: '8px' }}>
                                计算每对 (Query, Key) 的相关性分数
                            </div>
                        </div>
                        {renderMatrix(attentionScores, sourceTokens, '注意力分数矩阵 (7×7)', true)}
                        <div style={{
                            marginTop: '15px',
                            padding: '12px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '8px',
                            fontSize: '0.85em'
                        }}>
                            <b>解读：</b> 注意看 "<span style={{color: '#ef4444', fontWeight: 'bold'}}>他</span>" 这一行：对 "<span style={{color: '#ef4444', fontWeight: 'bold'}}>小明</span>" 的分数高达 0.89（颜色最深），
                            远高于其他词！这说明模型已经在学习"他"和"小明"之间的指代关系。
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '20px',
                            padding: '15px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.1em' }}>
                                Attention<sub>i</sub> = Softmax(Score<sub>i</sub>)
                            </div>
                            <div style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginTop: '8px' }}>
                                Softmax 让每行分数变成概率分布（和为1）
                            </div>
                        </div>
                        {renderAttentionCalculation()}
                    </div>
                )}

                {step === 4 && (
                    <div>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '20px',
                            padding: '15px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.1em' }}>
                                Output<sub>i</sub> = Σ<sub>j</sub> (Attention<sub>ij</sub> × V<sub>j</sub>)
                            </div>
                            <div style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginTop: '8px' }}>
                                用注意力权重对所有 V 向量加权求和
                            </div>
                        </div>
                        {renderFinalOutput()}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '25px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-color)'
            }}>
                <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    style={{
                        padding: '10px 25px',
                        border: 'none',
                        borderRadius: '8px',
                        background: step === 0 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                        color: step === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: step === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.9em'
                    }}
                >
                    ← 上一步
                </button>
                <button
                    onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
                    disabled={step === steps.length - 1}
                    style={{
                        padding: '10px 25px',
                        border: 'none',
                        borderRadius: '8px',
                        background: step === steps.length - 1 ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                        color: step === steps.length - 1 ? 'var(--text-muted)' : 'white',
                        cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.9em',
                        fontWeight: 'bold'
                    }}
                >
                    下一步 →
                </button>
            </div>
        </div>
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

    // MLP 输出层可视化组件
    const MLPOutputVisualization = () => {
        // 模拟的隐藏状态维度（简化展示）
        const hiddenDim = 4;
        const vocabSize = 6;

        // 模拟每个已生成 token 的隐藏状态（简化为4维）
        const hiddenStates = generated.map((token, idx) => ({
            token,
            values: [
                (Math.sin(idx * 0.5) * 0.5 + 0.5).toFixed(2),
                (Math.cos(idx * 0.3) * 0.5 + 0.5).toFixed(2),
                (Math.sin(idx * 0.7 + 1) * 0.5 + 0.5).toFixed(2),
                (Math.cos(idx * 0.4 + 0.5) * 0.5 + 0.5).toFixed(2)
            ]
        }));

        // 只展示最后一个 token 的处理过程
        const lastToken = generated[generated.length - 1];
        const lastHidden = hiddenStates[hiddenStates.length - 1];

        return (
            <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
            }}>
                <h4 style={{
                    color: 'var(--accent-primary)',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '1em'
                }}>
                    🧠 Output MLP Layer (输出层)
                </h4>

                {/* 流程图展示 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    flexWrap: 'wrap',
                    marginBottom: '20px'
                }}>
                    {/* 1. 隐藏状态输入 */}
                    <div style={{
                        background: 'var(--bg-tertiary)',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid var(--accent-primary)',
                        minWidth: '120px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            Hidden State
                        </div>
                        <div style={{
                            fontFamily: 'monospace',
                            fontSize: '0.7em',
                            color: 'var(--accent-primary)',
                            fontWeight: 'bold'
                        }}>
                            h<sub>{generated.length - 1}</sub> = [{lastHidden.values.join(', ')}]
                        </div>
                        <div style={{ fontSize: '0.7em', color: 'var(--text-muted)', marginTop: '4px' }}>
                            (d_model 维)
                        </div>
                    </div>

                    {/* 箭头 */}
                    <div style={{ fontSize: '1.5em', color: 'var(--text-muted)' }}>→</div>

                    {/* 2. MLP 神经网络层 */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '2px dashed var(--accent-warning)',
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            MLP (Linear)
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            justifyContent: 'center'
                        }}>
                            {/* 神经网络图标 */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px'
                            }}>
                                <div style={{ display: 'flex', gap: '3px' }}>
                                    {[1,2,3,4].map(i => (
                                        <div key={i} style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: 'var(--accent-warning)'
                                        }} />
                                    ))}
                                </div>
                                <div style={{ fontSize: '0.6em', color: 'var(--text-muted)' }}>input</div>
                            </div>

                            <div style={{ fontSize: '1.2em', color: 'var(--text-muted)' }}>×</div>

                            {/* 权重矩阵 */}
                            <div style={{
                                border: '1px solid var(--accent-warning)',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                background: 'rgba(245, 158, 11, 0.1)'
                            }}>
                                <div style={{ fontSize: '0.7em', fontWeight: 'bold', color: 'var(--accent-warning)' }}>
                                    W<sub>lm</sub>
                                </div>
                                <div style={{ fontSize: '0.6em', color: 'var(--text-muted)' }}>
                                    d × V
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.65em', color: 'var(--text-muted)', marginTop: '6px' }}>
                            W ∈ ℝ<sup>d_model × vocab_size</sup>
                        </div>
                    </div>

                    {/* 箭头 */}
                    <div style={{ fontSize: '1.5em', color: 'var(--text-muted)' }}>→</div>

                    {/* 3. Logits 输出 */}
                    <div style={{
                        background: 'var(--bg-tertiary)',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid var(--accent-success)',
                        minWidth: '100px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            Logits
                        </div>
                        <div style={{
                            fontFamily: 'monospace',
                            fontSize: '0.7em',
                            color: 'var(--accent-success)',
                            fontWeight: 'bold'
                        }}>
                            [2.1, 0.3, -0.5, ...]
                        </div>
                        <div style={{ fontSize: '0.7em', color: 'var(--text-muted)', marginTop: '4px' }}>
                            (vocab_size 维)
                        </div>
                    </div>

                    {/* 箭头 */}
                    <div style={{ fontSize: '1.5em', color: 'var(--text-muted)' }}>→</div>

                    {/* 4. Softmax */}
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid var(--accent-success)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            Softmax
                        </div>
                        <div style={{
                            fontSize: '0.8em',
                            color: 'var(--accent-success)',
                            fontWeight: 'bold'
                        }}>
                            e<sup>z<sub>i</sub></sup> / Σe<sup>z</sup>
                        </div>
                        <div style={{ fontSize: '0.7em', color: 'var(--text-muted)', marginTop: '4px' }}>
                            → 概率分布
                        </div>
                    </div>
                </div>

                {/* 多 Token 概率矩阵展示 */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '8px',
                    padding: '15px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{
                        fontSize: '0.85em',
                        fontWeight: 'bold',
                        marginBottom: '12px',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        📊 多 Token 概率矩阵 (每个位置预测下一个 Token)
                    </div>

                    {/* 概率矩阵表格 */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.72em'
                        }}>
                            <thead>
                                <tr>
                                    <th style={{
                                        padding: '8px 6px',
                                        borderBottom: '2px solid var(--border-color)',
                                        textAlign: 'left',
                                        color: 'var(--text-muted)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Token
                                    </th>
                                    <th style={{
                                        padding: '4px',
                                        borderBottom: '2px solid var(--border-color)',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                        width: '20px'
                                    }}>
                                    </th>
                                    <th style={{
                                        padding: '8px 6px',
                                        borderBottom: '2px solid var(--border-color)',
                                        textAlign: 'center',
                                        color: 'var(--accent-primary)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Hidden States
                                    </th>
                                    <th style={{
                                        padding: '4px',
                                        borderBottom: '2px solid var(--border-color)',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                        width: '20px'
                                    }}>
                                    </th>
                                    <th style={{
                                        padding: '8px 6px',
                                        borderBottom: '2px solid var(--border-color)',
                                        textAlign: 'center',
                                        color: 'var(--accent-warning)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Logits
                                    </th>
                                    <th style={{
                                        padding: '4px',
                                        borderBottom: '2px solid var(--border-color)',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                        width: '20px'
                                    }}>
                                    </th>
                                    <th style={{
                                        padding: '8px 6px',
                                        borderBottom: '2px solid var(--border-color)',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)'
                                    }}>
                                        概率分布 (Softmax)
                                    </th>
                                    <th style={{
                                        padding: '4px',
                                        borderBottom: '2px solid var(--border-color)',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                        width: '20px'
                                    }}>
                                    </th>
                                    <th style={{
                                        padding: '8px 6px',
                                        borderBottom: '2px solid var(--border-color)',
                                        textAlign: 'center',
                                        color: 'var(--accent-success)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        采样
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {generated.map((token, idx) => {
                                    // 模拟每个位置的概率分布
                                    const nextTokenProbs = idx < targetSteps.length
                                        ? targetSteps[idx].probs
                                        : [{ n: '[END]', v: 0.98 }];
                                    const sampledToken = idx < targetSteps.length
                                        ? targetSteps[idx].word
                                        : '[END]';
                                    const isCurrentPosition = idx === generated.length - 1 && !isFinished;

                                    // 模拟 hidden states (简化为4维向量)
                                    const hiddenStateValues = [
                                        (Math.sin(idx * 0.5 + 0.1) * 0.5 + 0.5).toFixed(2),
                                        (Math.cos(idx * 0.3 + 0.2) * 0.5 + 0.5).toFixed(2),
                                        (Math.sin(idx * 0.7 + 1) * 0.5 + 0.5).toFixed(2),
                                        (Math.cos(idx * 0.4 + 0.5) * 0.5 + 0.5).toFixed(2)
                                    ];

                                    // 模拟 logits (未归一化的分数)
                                    const logitsValues = nextTokenProbs.slice(0, 3).map((p, i) =>
                                        (Math.log(p.v / (1 - p.v + 0.01)) + (i === 0 ? 2 : 0)).toFixed(1)
                                    );

                                    return (
                                        <tr key={idx} style={{
                                            background: isCurrentPosition
                                                ? 'rgba(99, 102, 241, 0.15)'
                                                : 'transparent',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {/* Token 列 */}
                                            <td style={{
                                                padding: '8px 6px',
                                                borderBottom: '1px solid var(--border-color)',
                                                fontWeight: 'bold',
                                                color: isCurrentPosition ? 'var(--accent-primary)' : 'var(--text-primary)'
                                            }}>
                                                <span style={{
                                                    padding: '2px 6px',
                                                    background: idx === 0 ? 'var(--text-muted)' : 'var(--accent-success)',
                                                    color: 'white',
                                                    borderRadius: '4px',
                                                    fontSize: '0.9em'
                                                }}>
                                                    {token}
                                                </span>
                                                {isCurrentPosition && (
                                                    <span style={{
                                                        marginLeft: '4px',
                                                        fontSize: '0.75em',
                                                        color: 'var(--accent-primary)'
                                                    }}>
                                                        ←
                                                    </span>
                                                )}
                                            </td>

                                            {/* 箭头 → */}
                                            <td style={{
                                                padding: '4px',
                                                borderBottom: '1px solid var(--border-color)',
                                                textAlign: 'center',
                                                color: 'var(--text-muted)',
                                                fontSize: '1.1em'
                                            }}>
                                                →
                                            </td>

                                            {/* Hidden States 列 */}
                                            <td style={{
                                                padding: '6px',
                                                borderBottom: '1px solid var(--border-color)',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '3px 6px',
                                                    background: 'rgba(99, 102, 241, 0.15)',
                                                    borderRadius: '4px',
                                                    border: '1px solid var(--accent-primary)',
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.85em',
                                                    color: 'var(--accent-primary)'
                                                }}>
                                                    [{hiddenStateValues.join(', ')}]
                                                </div>
                                            </td>

                                            {/* 箭头 → MLP */}
                                            <td style={{
                                                padding: '4px',
                                                borderBottom: '1px solid var(--border-color)',
                                                textAlign: 'center',
                                                color: 'var(--accent-warning)',
                                                fontSize: '1em'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                                                    <span style={{ fontSize: '0.6em', color: 'var(--text-muted)' }}>×W</span>
                                                    <span>→</span>
                                                </div>
                                            </td>

                                            {/* Logits 列 */}
                                            <td style={{
                                                padding: '6px',
                                                borderBottom: '1px solid var(--border-color)',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '3px 6px',
                                                    background: 'rgba(245, 158, 11, 0.15)',
                                                    borderRadius: '4px',
                                                    border: '1px solid var(--accent-warning)',
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.85em',
                                                    color: 'var(--accent-warning)'
                                                }}>
                                                    [{logitsValues.join(', ')}, ...]
                                                </div>
                                            </td>

                                            {/* 箭头 → Softmax */}
                                            <td style={{
                                                padding: '4px',
                                                borderBottom: '1px solid var(--border-color)',
                                                textAlign: 'center',
                                                color: 'var(--accent-success)',
                                                fontSize: '1em'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                                                    <span style={{ fontSize: '0.55em', color: 'var(--text-muted)' }}>softmax</span>
                                                    <span>→</span>
                                                </div>
                                            </td>

                                            {/* 概率分布列 */}
                                            <td style={{
                                                padding: '6px',
                                                borderBottom: '1px solid var(--border-color)'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '3px',
                                                    flexWrap: 'wrap',
                                                    justifyContent: 'center'
                                                }}>
                                                    {nextTokenProbs.slice(0, 3).map((p, i) => (
                                                        <span key={i} style={{
                                                            padding: '2px 4px',
                                                            background: i === 0
                                                                ? 'rgba(16, 185, 129, 0.3)'
                                                                : 'var(--bg-tertiary)',
                                                            borderRadius: '3px',
                                                            fontSize: '0.85em',
                                                            border: i === 0
                                                                ? '1px solid var(--accent-success)'
                                                                : '1px solid var(--border-color)'
                                                        }}>
                                                            {p.n}: <b>{(p.v * 100).toFixed(0)}%</b>
                                                        </span>
                                                    ))}
                                                    <span style={{
                                                        color: 'var(--text-muted)',
                                                        fontSize: '0.8em'
                                                    }}>
                                                        ...
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 箭头 → 采样 */}
                                            <td style={{
                                                padding: '4px',
                                                borderBottom: '1px solid var(--border-color)',
                                                textAlign: 'center',
                                                color: 'var(--accent-success)',
                                                fontSize: '1em'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                                                    <span style={{ fontSize: '0.55em', color: 'var(--text-muted)' }}>sample</span>
                                                    <span>→</span>
                                                </div>
                                            </td>

                                            {/* 采样结果列 */}
                                            <td style={{
                                                padding: '6px',
                                                borderBottom: '1px solid var(--border-color)',
                                                textAlign: 'center'
                                            }}>
                                                {idx < generated.length - 1 || isFinished ? (
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        background: 'var(--accent-success)',
                                                        color: 'white',
                                                        borderRadius: '4px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {sampledToken}
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        padding: '2px 6px',
                                                        border: '1px dashed var(--accent-primary)',
                                                        borderRadius: '4px',
                                                        color: 'var(--accent-primary)',
                                                        animation: 'pulse 1.5s infinite',
                                                        fontSize: '0.9em'
                                                    }}>
                                                        🎲
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* 采样说明 */}
                    <div style={{
                        marginTop: '12px',
                        padding: '10px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '6px',
                        fontSize: '0.8em',
                        color: 'var(--text-secondary)'
                    }}>
                        💡 <b>数据流</b>：Token → Hidden States (d维) → <b>×W<sub>lm</sub></b> → Logits (vocab_size维) → <b>Softmax</b> → 概率分布 → <b>采样</b> → 下一个 Token
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--accent-success)' }}>Decoder 任务: 翻译生成</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                    Decoder 必须"戴着眼罩"工作。它只能根据<b>已生成的词</b>，通过 <b>Output MLP</b> 预测<b>下一个词的概率分布</b>，然后采样生成。
                </p>
            </div>

            {/* MLP 输出层可视化 */}
            <MLPOutputVisualization />

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

const SummarySection = () => (
    <section className="transformer-section fade-in">
        <h2 className="section-title">7. Transformer 总结</h2>
        <div className="content-text">
            <p>恭喜你完成了 Transformer 架构的学习！让我们回顾一下整个流程：</p>
        </div>

        <div className="analogy-box" style={{ marginBottom: '30px' }}>
            <strong>🎯 核心要点回顾：</strong>
            <ul style={{ marginTop: '10px', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li><b>Tokenization (分词)</b>：将文本转换为模型能理解的数字编号</li>
                <li><b>Embedding (词嵌入)</b>：将 Token ID 映射为多维向量，表达词的语义关系</li>
                <li><b>Position Encoding (位置编码)</b>：为每个词添加"座位号"，让模型理解词序</li>
                <li><b>Self-Attention (自注意力)</b>：让每个词"关注"其他词，捕捉上下文关系</li>
                <li><b>Encoder vs Decoder</b>：Encoder 全向注意力用于理解，Decoder 单向注意力用于生成</li>
                <li><b>Output (输出)</b>：通过分类头或逐词生成完成最终任务</li>
            </ul>
        </div>

        <div className="visual-container" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--accent-primary)' }}>Transformer 整体架构图</h3>
            <div style={{
                background: 'var(--bg-tertiary)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
            }}>
                <img
                    src={transformerOverall}
                    alt="Transformer 整体架构"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '600px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                />
            </div>
            <p className="visual-caption" style={{ marginTop: '15px' }}>
                Transformer 架构的完整视图：左侧为 Encoder，右侧为 Decoder
            </p>
        </div>

        <div className="interactive-demo-card" style={{
            background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
            padding: '24px',
            marginTop: '30px',
            borderRadius: '12px',
            border: '1px solid var(--border-accent)',
            textAlign: 'center'
        }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '12px' }}>🚀 LLM 动态演示</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                想要更直观地理解 Transformer 的工作原理？试试这个交互式可视化工具，动态展示 LLM 的运行过程。
            </p>
            <a
                href="https://poloclub.github.io/transformer-explainer/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'inline-block',
                    padding: '12px 32px',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
                打开 Transformer Explainer ➜
            </a>
        </div>
    </section>
);

export default TransformerTab;

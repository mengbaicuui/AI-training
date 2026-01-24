import { useState } from 'react';

function DetailPanel({ node, breadcrumb, onBreadcrumbClick, config, isMoe }) {
    const [copiedCode, setCopiedCode] = useState(false);

    if (!node) {
        return (
            <div className="detail-panel">
                <div className="empty-state">
                    <div className="empty-icon">👈</div>
                    <div className="empty-title">选择一个组件查看详情</div>
                    <div className="empty-text">
                        点击左侧架构树中的任意层级，查看其参数、Shape 变换、中文解释和关键代码
                    </div>
                </div>
            </div>
        );
    }

    const handleCopyCode = async () => {
        if (node.code) {
            try {
                await navigator.clipboard.writeText(node.code);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    const highlightPythonSyntax = (code) => {
        if (!code) return '';

        const tokens = [
            { type: 'comment', regex: /#[^\n]*/ },
            { type: 'string', regex: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/ },
            { type: 'keyword', regex: /\b(class|def|return|if|else|elif|for|while|in|import|from|as|with|try|except|finally|raise|assert|yield|lambda|and|or|not|is|None|True|False|self|super)\b/ },
            { type: 'number', regex: /\b\d+\.?\d*\b/ },
            { type: 'function', regex: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ }
        ];

        const escapeHtml = (text) => text.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));

        const combinedRegex = new RegExp(tokens.map(t => `(${t.regex.source})`).join('|'), 'g');

        let lastIndex = 0;
        let result = '';
        let match;

        while ((match = combinedRegex.exec(code)) !== null) {
            result += escapeHtml(code.slice(lastIndex, match.index));

            let matchedTokenIndex = -1;
            for (let i = 0; i < tokens.length; i++) {
                if (match[i + 1] !== undefined) {
                    matchedTokenIndex = i;
                    break;
                }
            }

            if (matchedTokenIndex !== -1) {
                const tokenType = tokens[matchedTokenIndex].type;
                result += `<span class="${tokenType}">${escapeHtml(match[0])}</span>`;
            } else {
                result += escapeHtml(match[0]);
            }

            lastIndex = combinedRegex.lastIndex;
        }

        result += escapeHtml(code.slice(lastIndex));
        return result;
    };


    return (
        <div className="detail-panel fade-in">
            <div className="detail-header">
                {/* Breadcrumb */}
                <div className="detail-breadcrumb">
                    {breadcrumb.map((item, index) => (
                        <span key={item.id || index}>
                            <span
                                className={`breadcrumb-item ${index === breadcrumb.length - 1 ? 'current' : ''}`}
                                onClick={() => onBreadcrumbClick(index)}
                            >
                                {item.name.split(' ')[0]}
                            </span>
                            {index < breadcrumb.length - 1 && (
                                <span className="breadcrumb-separator"> › </span>
                            )}
                        </span>
                    ))}
                </div>

                {/* Title */}
                <h2 className="detail-title">{node.name}</h2>
                {node.nameZh && <div className="detail-title-zh">{node.nameZh}</div>}
            </div>

            <div className="detail-content">
                {/* Description */}
                {node.description && (
                    <div className="detail-section">
                        <h3 className="section-title">
                            <span className="section-icon">📖</span>
                            功能说明
                        </h3>
                        <p className="description-text">{node.description}</p>
                    </div>
                )}

                {/* Parameters */}
                {node.params && Object.keys(node.params).length > 0 && (
                    <div className="detail-section">
                        <h3 className="section-title">
                            <span className="section-icon">⚙️</span>
                            参数配置
                        </h3>
                        <table className="params-table">
                            <thead>
                                <tr>
                                    <th>参数名</th>
                                    <th>值 / 说明</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(node.params).map(([key, value]) => (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td>{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Shapes */}
                {node.shapes && Object.keys(node.shapes).length > 0 && (
                    <div className="detail-section">
                        <h3 className="section-title">
                            <span className="section-icon">📐</span>
                            张量形状变换
                        </h3>
                        <div className="shapes-grid">
                            {Object.entries(node.shapes).map(([key, value]) => (
                                <div key={key} className="shape-card">
                                    <div className="shape-label">{key}</div>
                                    <div className="shape-value">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Code */}
                {node.code && (
                    <div className="detail-section">
                        <h3 className="section-title">
                            <span className="section-icon">💻</span>
                            关键代码
                        </h3>
                        <div className="code-block">
                            <div className="code-header">
                                <span className="code-lang">Python</span>
                                <button className="code-copy-btn" onClick={handleCopyCode}>
                                    {copiedCode ? '✓ 已复制' : '📋 复制'}
                                </button>
                            </div>
                            <div className="code-content">
                                <pre dangerouslySetInnerHTML={{
                                    __html: highlightPythonSyntax(node.code)
                                }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Children summary */}
                {node.children && node.children.length > 0 && (
                    <div className="detail-section">
                        <h3 className="section-title">
                            <span className="section-icon">📦</span>
                            子组件 ({node.children.length})
                        </h3>
                        <div className="children-list">
                            {node.children.map((child, index) => (
                                <div key={child.id || index} className="diff-item">
                                    <span className="diff-key">{child.name.split(' ')[0]}</span>
                                    <span className="diff-value">{child.nameZh || ''}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DetailPanel;

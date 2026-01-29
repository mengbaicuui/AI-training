import React from 'react';
import ArchitectureDiagram from './ArchitectureDiagram';

function MacroView({ isMoe, config }) {
    return (
        <div className="macro-view-container fade-in">
            <div className="macro-header">
                <h2 className="macro-title">
                    {isMoe ? 'Qwen3-MoE' : 'Qwen3'} 全局架构图
                </h2>
                <p className="macro-subtitle">
                    展示模型的数据流向、残差连接以及 {isMoe ? '混合专家路由' : '前馈网络'} 机制
                </p>
            </div>

            <div className="macro-content">
                <ArchitectureDiagram isMoe={isMoe} config={config} />
            </div>
        </div>
    );
}

export default MacroView;

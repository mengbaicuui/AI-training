import React from 'react';

function ViewSwitcher({ viewMode, onViewChange }) {
    return (
        <div className="view-switcher">
            <button
                className={`view-switch-btn ${viewMode === 'micro' ? 'active' : ''}`}
                onClick={() => onViewChange('micro')}
                title="微观视角 (Micro View)"
            >
                <span className="switch-icon">🔍</span>
                <span className="switch-text">微观视角 (组件树)</span>
            </button>
            <button
                className={`view-switch-btn ${viewMode === 'macro' ? 'active' : ''}`}
                onClick={() => onViewChange('macro')}
                title="宏观视角 (Macro View)"
            >
                <span className="switch-icon">🔭</span>
                <span className="switch-text">宏观视角 (架构图)</span>
            </button>
        </div>
    );
}

export default ViewSwitcher;

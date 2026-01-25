import { useState } from 'react';
import ModelViewer from './components/ModelViewer';
import DetailPanel from './components/DetailPanel';
import CompareView from './components/CompareView';
import MacroView from './components/MacroView';
import ViewSwitcher from './components/ViewSwitcher';
import LLMHistoryTimeline from './components/LLMHistoryTimeline';
import LLMPipelineViz from './components/LLMPipelineViz';
import TransformerTab from './components/TransformerTab';
import qwen3Architecture, { qwen3Config } from './data/qwen3';
import qwen3MoeArchitecture, { qwen3MoeConfig } from './data/qwen3_moe';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('qwen3');
  const [viewMode, setViewMode] = useState('micro'); // 'micro' or 'macro'
  const [selectedNode, setSelectedNode] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);

  const handleNodeSelect = (node, path) => {
    setSelectedNode(node);
    setBreadcrumb(path);
  };

  const handleBreadcrumbClick = (index) => {
    if (index < breadcrumb.length - 1) {
      const newPath = breadcrumb.slice(0, index + 1);
      setBreadcrumb(newPath);
      setSelectedNode(newPath[newPath.length - 1]);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedNode(null);
    setBreadcrumb([]);
  };

  const getCurrentArchitecture = () => {
    return activeTab === 'qwen3' ? qwen3Architecture : qwen3MoeArchitecture;
  };

  const getCurrentConfig = () => {
    return activeTab === 'qwen3' ? qwen3Config : qwen3MoeConfig;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🧠 Qwen3 模型架构可视化</h1>
        <p className="app-subtitle">
          深入解析 Qwen3 稠密模型与 Qwen3-MoE 混合专家模型的架构差异
        </p>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'qwen3' ? 'active' : ''}`}
          onClick={() => handleTabChange('qwen3')}
        >
          <span className="tab-icon">🔷</span>
          Qwen3 (稠密模型)
        </button>
        <button
          className={`tab-button moe ${activeTab === 'qwen3_moe' ? 'active' : ''}`}
          onClick={() => handleTabChange('qwen3_moe')}
        >
          <span className="tab-icon">🔶</span>
          Qwen3-MoE (混合专家)
        </button>
        <button
          className={`tab-button ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => handleTabChange('compare')}
        >
          <span className="tab-icon">⚖️</span>
          对比视图
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          <span className="tab-icon">📜</span>
          LLM 发展史
        </button>
        <button
          className={`tab-button ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => handleTabChange('pipeline')}
        >
          <span className="tab-icon">🚀</span>
          LLM 训练范式
        </button>
        <button
          className={`tab-button ${activeTab === 'transformer' ? 'active' : ''}`}
          onClick={() => handleTabChange('transformer')}
        >
          <span className="tab-icon">📖</span>
          Transformer 原理
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'compare' ? (
          <CompareView
            qwen3Architecture={qwen3Architecture}
            qwen3Config={qwen3Config}
            qwen3MoeArchitecture={qwen3MoeArchitecture}
            qwen3MoeConfig={qwen3MoeConfig}
          />
        ) : activeTab === 'history' ? (
          <LLMHistoryTimeline />
        ) : activeTab === 'pipeline' ? (
          <LLMPipelineViz />
        ) : activeTab === 'transformer' ? (
          <TransformerTab />
        ) : (
          <>
            {/* View Switcher only for non-compare tabs */}
            <div className="view-controls">
              <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
            </div>

            {viewMode === 'micro' ? (
              <>
                <div className="architecture-panel">
                  <div className="panel-title">
                    <span className="panel-title-icon">📐</span>
                    模型架构树
                  </div>
                  <div className="architecture-tree">
                    <ModelViewer
                      architecture={getCurrentArchitecture()}
                      config={getCurrentConfig()}
                      selectedNode={selectedNode}
                      onNodeSelect={handleNodeSelect}
                      isMoe={activeTab === 'qwen3_moe'}
                    />
                  </div>
                </div>

                <DetailPanel
                  node={selectedNode}
                  breadcrumb={breadcrumb}
                  onBreadcrumbClick={handleBreadcrumbClick}
                  config={getCurrentConfig()}
                  isMoe={activeTab === 'qwen3_moe'}
                />
              </>
            ) : (
              <MacroView
                isMoe={activeTab === 'qwen3_moe'}
                config={getCurrentConfig()}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;

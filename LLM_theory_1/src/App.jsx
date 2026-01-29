import { useState, useMemo } from 'react';
import ModelViewer from './components/ModelViewer';
import DetailPanel from './components/DetailPanel';
import CompareView from './components/CompareView';
import MacroView from './components/MacroView';
import ViewSwitcher from './components/ViewSwitcher';
import LLMHistoryTimeline from './components/LLMHistoryTimeline';
import LLMPipelineViz from './components/LLMPipelineViz';
import TransformerTab from './components/TransformerTab';
import QuestionPanel from './components/QuestionPanel';
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

  // 收集模型架构的问题
  const collectArchitectureQuestions = (node, prefix = '') => {
    const questions = [];
    if (!node) return questions;

    // 添加当前节点的问题
    if (node.questions) {
      node.questions.forEach(q => {
        questions.push({
          ...q,
          question: prefix ? `【${prefix}】${q.question}` : q.question
        });
      });
    }

    // 递归收集子节点的问题
    if (node.children) {
      node.children.forEach(child => {
        const childPrefix = child.nameZh || child.name;
        questions.push(...collectArchitectureQuestions(child, childPrefix));
      });
    }

    return questions;
  };

  // 获取当前架构的所有问题
  const architectureQuestions = useMemo(() => {
    const arch = getCurrentArchitecture();
    const config = getCurrentConfig();
    const questions = [];

    // 添加配置级别的问题（如 MoE 配置的问题）
    if (config.questions) {
      config.questions.forEach(q => {
        questions.push({
          ...q,
          question: `【${config.name}】${q.question}`
        });
      });
    }

    // 收集架构树中的问题
    questions.push(...collectArchitectureQuestions(arch));

    return questions;
  }, [activeTab]);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🧠 垂域模型训练理论基础</h1>
        <p className="app-subtitle">
          垂域模型训练理论基础：关键技术、训练范式、Transformer原理
        </p>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          <span className="tab-icon">📜</span>
          LLM 关键技术演进
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

                {/* 模型架构问题面板 */}
                <QuestionPanel
                  questions={architectureQuestions}
                  sectionTitle={activeTab === 'qwen3' ? 'Qwen3 稠密模型' : 'Qwen3-MoE 混合专家'}
                />
              </>
            ) : (
              <>
                <MacroView
                  isMoe={activeTab === 'qwen3_moe'}
                  config={getCurrentConfig()}
                />
                {/* 宏观视图也显示问题面板 */}
                <QuestionPanel
                  questions={architectureQuestions}
                  sectionTitle={activeTab === 'qwen3' ? 'Qwen3 稠密模型' : 'Qwen3-MoE 混合专家'}
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;

import { useState } from 'react';
import CourseHomeTab from './components/CourseHomeTab';
import AutelOverviewTab from './components/AutelOverviewTab';
import RAGEvolutionTab from './components/RAGEvolutionTab';
import DataEngineeringTab from './components/DataEngineeringTab';
import HybridRetrievalTab from './components/HybridRetrievalTab';
import RerankingTab from './components/RerankingTab';
import QueryRewriteTab from './components/QueryRewriteTab';
import GenerationQualityTab from './components/GenerationQualityTab';
import EvalTab from './components/EvalTab';
import AgenticRAGTab from './components/AgenticRAGTab';
import GraphRAGTab from './components/GraphRAGTab';
import ProductionTab from './components/ProductionTab';
import SummaryTab from './components/SummaryTab';
import ToolFrameworkTab from './components/ToolFrameworkTab';
import './App.css';

const tabs = [
  { id: 'home', icon: '📋', label: '课程总览', phase: null },
  { id: 'autel-overview', icon: '📄', label: 'RAG技术全景', phase: null },
  { id: 'tool-framework', icon: '🧰', label: '工具 / 框架介绍', phase: null },
  { id: 'evolution', icon: '🔄', label: 'RAG 演进', phase: 1 },
  { id: 'data-eng', icon: '📄', label: '数据工程', phase: 1 },
  { id: 'hybrid', icon: '🔍', label: '检索工程', phase: 2 },
  { id: 'rerank', icon: '🎯', label: 'Rerank', phase: 2 },
  { id: 'query', icon: '✍️', label: 'Query 优化', phase: 2 },
  { id: 'generation', icon: '🛡️', label: '生成质量', phase: 2 },
  { id: 'eval', icon: '📊', label: '评估体系', phase: 3 },
  { id: 'agentic', icon: '🤖', label: 'Agentic RAG', phase: 3 },
  { id: 'graph', icon: '🕸️', label: '知识增强', phase: 3 },
  { id: 'production', icon: '🚀', label: '生产落地', phase: 3 },
  { id: 'summary', icon: '🎯', label: '知识总结', phase: null },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [toolFrameworkSection, setToolFrameworkSection] = useState('langchain');
  const [navCollapsed, setNavCollapsed] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <CourseHomeTab
            tabs={tabs}
            onNavigate={setActiveTab}
            onOpenToolFramework={(section) => {
              setToolFrameworkSection(section);
              setActiveTab('tool-framework');
            }}
          />
        );
      case 'autel-overview': return <AutelOverviewTab />;
      case 'tool-framework':
        return (
          <ToolFrameworkTab
            initialSection={toolFrameworkSection}
            onSectionChange={setToolFrameworkSection}
          />
        );
      case 'evolution': return <RAGEvolutionTab />;
      case 'data-eng': return <DataEngineeringTab />;
      case 'hybrid': return <HybridRetrievalTab />;
      case 'rerank': return <RerankingTab />;
      case 'query': return <QueryRewriteTab />;
      case 'generation': return <GenerationQualityTab />;
      case 'eval': return <EvalTab />;
      case 'agentic': return <AgenticRAGTab />;
      case 'graph': return <GraphRAGTab />;
      case 'production': return <ProductionTab />;
      case 'summary': return <SummaryTab />;
      default: return <CourseHomeTab />;
    }
  };

  const phaseGroups = [
    { label: null, ids: ['home', 'autel-overview', 'tool-framework'] },
    { label: 'Phase 1', ids: ['evolution', 'data-eng'] },
    { label: 'Phase 2', ids: ['hybrid', 'rerank', 'query', 'generation'] },
    { label: 'Phase 3', ids: ['eval', 'agentic', 'graph', 'production'] },
    { label: null, ids: ['summary'] },
  ];

  return (
    <div className="app">
      <header className={`app-header ${navCollapsed ? 'collapsed' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div className="app-title" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>RAG 生产实践工作坊</div>
            {navCollapsed && (() => {
              const cur = tabs.find(t => t.id === activeTab);
              return cur ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  / {cur.icon} {cur.label}
                </span>
              ) : null;
            })()}
          </div>
          <button
            className="nav-collapse-btn"
            onClick={() => setNavCollapsed(v => !v)}
            title={navCollapsed ? '展开导航' : '收起导航'}
          >
            {navCollapsed ? '▼' : '▲'}
          </button>
        </div>

        {!navCollapsed && (
          <>
            <div className="app-subtitle">从 0 到生产级 RAG：构建 · 调优 · 评估 · 上线</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
              {phaseGroups.map((group, gi) => (
                <div key={gi} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                  {group.label && (
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                      borderRadius: '999px', background: '#eef2ff', color: '#6366f1',
                      whiteSpace: 'nowrap',
                    }}>
                      {group.label}
                    </span>
                  )}
                  {group.ids.map(id => {
                    const tab = tabs.find(t => t.id === id);
                    if (!tab) return null;
                    return (
                      <button
                        key={id}
                        className={`tab-button ${activeTab === id ? 'active' : ''}`}
                        onClick={() => setActiveTab(id)}
                      >
                        <span className="tab-icon">{tab.icon}</span>
                        {tab.label}
                      </button>
                    );
                  })}
                  {gi < phaseGroups.length - 1 && (
                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '0 2px' }}>|</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </header>

      <main className="main-content">
        {renderTab()}
      </main>
    </div>
  );
}

export default App;

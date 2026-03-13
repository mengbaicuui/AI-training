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

  return (
    <div className="app">
      <main className="main-content">
        {renderTab()}
      </main>

      {activeTab !== 'home' && (
        <button
          className="floating-home-btn"
          onClick={() => setActiveTab('home')}
        >
          返回首页
        </button>
      )}
    </div>
  );
}

export default App;

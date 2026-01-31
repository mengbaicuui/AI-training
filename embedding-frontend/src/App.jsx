import { useState } from 'react';
import EmbeddingDevelopment from './components/EmbeddingDevelopment';
import TrainingParadigmsViz from './components/TrainingParadigmsViz';
import EvaluationMetrics from './components/EvaluationMetrics';
import DataPreparation from './components/DataPreparation';
import CodePractice from './components/CodePractice';
import TaskTypesGuide from './components/TaskTypesGuide';
import Qwen3EmbeddingTab from './components/Qwen3EmbeddingTab';
import EmbeddingPractice from './components/EmbeddingPractice';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('history');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🧬 Embedding微调</h1>
        <p className="app-subtitle">
          从One-Hot一直到Qwen3-Embedding，深入理解词嵌入的原理与实践
        </p>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          <span className="tab-icon">📜</span>
          Embedding的发展史
        </button>
        <button
          className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => handleTabChange('tasks')}
        >
          <span className="tab-icon">📖</span>
          任务类型和评估指标详解
        </button>
        <button
          className={`tab-button ${activeTab === 'qwen3' ? 'active' : ''}`}
          onClick={() => handleTabChange('qwen3')}
        >
          <span className="tab-icon">🧬</span>
          Qwen3-Embedding详解
        </button>
        <button
          className={`tab-button ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => handleTabChange('practice')}
        >
          <span className="tab-icon">🎯</span>
          实战演示
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'history' && <EmbeddingDevelopment />}
        {activeTab === 'tasks' && <TaskTypesGuide />}
        {activeTab === 'qwen3' && <Qwen3EmbeddingTab />}
        {activeTab === 'practice' && <EmbeddingPractice />}
      </main>
    </div>
  );
}

export default App;

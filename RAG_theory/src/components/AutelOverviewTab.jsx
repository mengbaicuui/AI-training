const stages = [
  {
    id: 'query-translation',
    title: '1. Query Translation',
    subtitle: '改写、拆解、HyDE、Multi-query、Step-back 等，把问题翻译成更适合检索的形式。',
    page: 2,
  },
  {
    id: 'routing',
    title: '2. Routing',
    subtitle: '根据问题类型或语义特征，把请求路由到合适的数据源、Prompt 或处理管道。',
    page: 3,
  },
  {
    id: 'query-construction',
    title: '3. Query Construction',
    subtitle: '把自然语言转成结构化查询，如 Text-to-SQL、Text-to-Cypher、Self-query filter。',
    page: 2,
  },
  {
    id: 'indexing',
    title: '4. Indexing',
    subtitle: '围绕 chunk、multi-representation、specialized embeddings、hierarchical indexing 做索引准备。',
    page: 5,
  },
  {
    id: 'retrieval',
    title: '5. Retrieval',
    subtitle: '召回、重排、压缩、主动检索和 CRAG 等策略，决定拿什么证据给模型。',
    page: 4,
  },
  {
    id: 'generation',
    title: '6. Generation',
    subtitle: '把检索结果整合进上下文，生成最终答案，并通过 Self-RAG / RRR 做反思与修正。',
    page: 6,
  },
];

function AutelOverviewTab() {
  return (
    <div className="section-tab fade-in">
      <div className="section-main" style={{ flex: 1, maxWidth: '100%' }}>
        <div className="content-block">
          <h2 className="section-title">RAG技术全景</h2>
        </div>

        <div className="content-block">
          <div className="block-title">📈 横轴主线</div>
          <div className="compare-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {stages.map((stage) => (
              <div key={stage.id} className="compare-card">
                <div className="compare-card-title">{stage.title}</div>
                <div className="compare-card-body">{stage.subtitle}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          {stages.map((stage) => (
            <div
              key={stage.id}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-md)',
              }}
            >
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div className="block-title" style={{ fontSize: '1rem', marginBottom: 'var(--spacing-xs)' }}>
                  {stage.title}
                </div>
                <p className="content-text" style={{ margin: 0 }}>
                  {stage.subtitle}
                </p>
              </div>
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '4px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
              <img
                src={`/autel-rag-pages/cropped/page-${stage.page}.png`}
                alt={`${stage.title} overview`}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: 'var(--radius-md)',
                }}
              />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AutelOverviewTab;

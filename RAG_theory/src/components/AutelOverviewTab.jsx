const pages = [1, 2, 3, 4, 5, 6];

function AutelOverviewTab() {
  return (
    <div className="section-tab fade-in">
      <div className="section-main" style={{ flex: 1, maxWidth: '100%' }}>
        <div className="content-block">
          <h2 className="section-title">RAG技术全景</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          {pages.map((page) => (
            <div
              key={page}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '4px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={`/autel-rag-pages/page-${page}.png`}
                alt={`RAG技术全景 page ${page}`}
                style={{
                  width: 'auto',
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: 'calc(100vh - 110px)',
                  display: 'block',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AutelOverviewTab;

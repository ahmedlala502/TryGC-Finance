export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-hero">
        <div className="loading-card">
          <div className="skeleton skeleton-line wide" style={{ height: 14 }} />
          <div className="skeleton skeleton-line full" style={{ height: 58, marginTop: 16 }} />
          <div className="skeleton skeleton-line wide" style={{ height: 14, marginTop: 14 }} />
          <div className="loading-grid" style={{ marginTop: 20 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 110, borderRadius: 18 }} />
            ))}
          </div>
        </div>
        <div className="loading-card">
          <div className="skeleton skeleton-line short" style={{ height: 14 }} />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 18, marginTop: 12 }} />
          ))}
        </div>
      </div>

      <div className="loading-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="loading-card">
            <div className="skeleton skeleton-line short" style={{ height: 12 }} />
            <div className="skeleton" style={{ height: 72, borderRadius: 18, marginTop: 12 }} />
          </div>
        ))}
      </div>

      <div className="loading-columns">
        <div className="loading-card">
          <div className="skeleton skeleton-line short" style={{ height: 14 }} />
          <div className="skeleton" style={{ height: 320, borderRadius: 20, marginTop: 16 }} />
        </div>
        <div className="loading-card">
          <div className="skeleton skeleton-line short" style={{ height: 14 }} />
          <div className="skeleton" style={{ height: 320, borderRadius: 20, marginTop: 16 }} />
        </div>
      </div>
    </div>
  );
}

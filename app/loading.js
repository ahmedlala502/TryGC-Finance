export default function Loading() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div className="skeleton skeleton-line" style={{ width: 160, height: 28 }} />
          <div className="skeleton" style={{ width: 100, height: 32, borderRadius: 6 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 8 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton" style={{ height: 84, borderRadius: 10 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 200, borderRadius: 10, width: "100%" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="skeleton" style={{ height: 180, borderRadius: 10 }} />
          <div className="skeleton" style={{ height: 180, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}

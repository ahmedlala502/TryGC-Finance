import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";

export function DashboardPage({ summary }) {
  const cards = [
    { label: "Total Deals", value: summary.totals.total_deals || 0, href: "/deals" },
    { label: "Open Deals", value: summary.totals.open_deals || 0, href: "/deals" },
    { label: "Won Deals", value: summary.totals.won_deals || 0, href: "/deals" },
    { label: "Pipeline Value", value: formatCurrency(summary.totals.pipeline_value), href: "/deals" },
    { label: "Won Revenue", value: formatCurrency(summary.totals.won_value), href: "/performance" }
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Operational overview from the shared SQLite CRM data, upgraded with action queues and rep insights.</p>
        </div>
        <Link href="/deals/new" className="btn btn-primary">
          + New Deal
        </Link>
      </div>

      <div className="card hero-panel" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Snapshot
            </div>
            <h2 style={{ fontSize: 30, lineHeight: 1.1 }}>
              {formatCurrency(summary.totals.pipeline_value)} active pipeline value across{" "}
              {summary.totals.open_deals || 0} open deals.
            </h2>
            <p style={{ maxWidth: 620, color: "var(--text-secondary)" }}>
              Use the refreshed Next.js workspace to move faster between deals, track follow-ups, export reporting packs, and reuse classified workbook templates from the uploads directory.
            </p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div className="topbar-chip" style={{ minWidth: 0 }}>
              <span className="topbar-chip-label">Won Revenue</span>
              <strong style={{ fontSize: 22 }}>{formatCurrency(summary.totals.won_value)}</strong>
            </div>
            <div className="topbar-chip" style={{ minWidth: 0 }}>
              <span className="topbar-chip-label">Loss Count</span>
              <strong style={{ fontSize: 22 }}>{summary.totals.lost_deals || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24
        }}
      >
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="kpi-card primary">
            <div className="kpi-value">{card.value}</div>
            <div className="kpi-sub">{card.label}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Deals</span>
          </div>
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Deal</th>
                    <th>Stage</th>
                    <th>Account</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentDeals.map((deal) => (
                    <tr key={deal.id}>
                      <td>
                        <Link href={`/deals/${deal.id}`}>{deal.title}</Link>
                      </td>
                      <td>{deal.stage_name || deal.status}</td>
                      <td>{deal.account_name || "—"}</td>
                      <td>{formatDate(deal.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Stage Distribution</span>
          </div>
          <div className="card-body" style={{ display: "grid", gap: 12 }}>
            {summary.stageSummary.map((stage) => (
              <div
                key={stage.id}
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: 10,
                  padding: 14,
                  background: "#fff"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <strong>{stage.name}</strong>
                  <span>{stage.deal_count}</span>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                  {formatCurrency(stage.stage_value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Follow-Ups</span>
          </div>
          <div className="card-body" style={{ display: "grid", gap: 10 }}>
            {summary.upcomingFollowUps.map((deal) => (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                style={{ border: "1px solid var(--border-color)", borderRadius: 10, padding: 12, display: "grid", gap: 4 }}
              >
                <strong>{deal.title}</strong>
                <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{deal.account_name || "No account"}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  {formatDate(deal.follow_up_date)} · {deal.priority || "Medium"}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Performers</span>
          </div>
          <div className="card-body" style={{ display: "grid", gap: 10 }}>
            {summary.topPerformers.length ? (
              summary.topPerformers.map((row, index) => (
                <div key={row.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-color)" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {index + 1}. {row.name}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>{row.won_deals} won deals</div>
                  </div>
                  <strong>{formatCurrency(row.won_value)}</strong>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--text-secondary)" }}>Rep ranking is only shown for manager and admin views.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

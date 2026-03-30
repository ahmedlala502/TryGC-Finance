import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";

const KpiIcons = {
  totalDeals: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  ),
  openDeals: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  wonDeals: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
    </svg>
  ),
  pipeline: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
    </svg>
  ),
  revenue: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
};

const STAGE_COLORS = [
  "#1d7a72", "#2f9e6f", "#d38a2a", "#2f6f90", "#7c3aed",
  "#db2777", "#059669", "#dc2626", "#0284c7", "#9333ea"
];

export function DashboardPage({ summary }) {
  const totals = summary.totals;
  const totalDeals = totals.total_deals || 0;

  const kpiCards = [
    {
      label: "Total Deals",
      value: totals.total_deals || 0,
      href: "/deals",
      icon: KpiIcons.totalDeals,
      colorClass: "kpi-info",
    },
    {
      label: "Open Deals",
      value: totals.open_deals || 0,
      href: "/deals",
      icon: KpiIcons.openDeals,
      colorClass: "kpi-warning",
    },
    {
      label: "Won Deals",
      value: totals.won_deals || 0,
      href: "/deals",
      icon: KpiIcons.wonDeals,
      colorClass: "kpi-success",
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(totals.pipeline_value),
      href: "/deals",
      icon: KpiIcons.pipeline,
      colorClass: "kpi-primary",
    },
    {
      label: "Won Revenue",
      value: formatCurrency(totals.won_value),
      href: "/performance",
      icon: KpiIcons.revenue,
      colorClass: "kpi-success",
    },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Operational overview — pipeline activity, rep performance, and upcoming follow-ups.</p>
        </div>
        <Link href="/deals/new" className="btn btn-primary">
          + New Deal
        </Link>
      </div>

      {/* Hero banner */}
      <div className="card hero-panel" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 24 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>
              Live Snapshot
            </div>
            <h2 style={{ fontSize: 28, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-0.02em" }}>
              {formatCurrency(totals.pipeline_value)} active pipeline
              <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}> across </span>
              {totals.open_deals || 0} open deals
            </h2>
            <p style={{ maxWidth: 580, color: "var(--text-secondary)", fontSize: 13.5, lineHeight: 1.6 }}>
              Move faster between deals, track follow-ups, export reporting packs, and reuse classified workbook templates from the uploads directory.
            </p>
          </div>
          <div style={{ display: "grid", gap: 12, alignContent: "center" }}>
            <div className="hero-stat-chip">
              <span className="hero-stat-label">Won Revenue</span>
              <strong className="hero-stat-value">{formatCurrency(totals.won_value)}</strong>
            </div>
            <div className="hero-stat-chip">
              <span className="hero-stat-label">Lost Deals</span>
              <strong className="hero-stat-value">{totals.lost_deals || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="dashboard-kpi-grid" style={{ marginBottom: 24 }}>
        {kpiCards.map((card) => (
          <Link key={card.label} href={card.href} className={`kpi-card ${card.colorClass}`}>
            <div className="kpi-header">
              <span className="kpi-label">{card.label}</span>
              <span className="kpi-icon">{card.icon}</span>
            </div>
            <div className="kpi-value">{card.value}</div>
          </Link>
        ))}
      </div>

      {/* Main two-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Recent Deals */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Deals</span>
            <Link href="/deals" className="btn btn-outline-secondary btn-sm">View all</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
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
                  {summary.recentDeals.length ? summary.recentDeals.map((deal) => (
                    <tr key={deal.id}>
                      <td>
                        <Link href={`/deals/${deal.id}`} style={{ fontWeight: 600 }}>{deal.title}</Link>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{deal.stage_name || deal.status}</span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{deal.account_name || "—"}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{formatDate(deal.updated_at)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4">
                        <div className="empty-state" style={{ padding: "32px 20px" }}>
                          <div className="empty-state-title">No deals yet</div>
                          <div className="empty-state-sub">Create your first deal to get started.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Stage Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Stage Distribution</span>
          </div>
          <div className="card-body" style={{ display: "grid", gap: 14 }}>
            {summary.stageSummary.length ? summary.stageSummary.map((stage, i) => {
              const pct = totalDeals > 0 ? Math.round((stage.deal_count / totalDeals) * 100) : 0;
              const color = STAGE_COLORS[i % STAGE_COLORS.length];
              return (
                <div key={stage.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{stage.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatCurrency(stage.stage_value)}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 28, textAlign: "right" }}>{stage.deal_count}</span>
                    </div>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            }) : (
              <div className="empty-state" style={{ padding: "24px 0" }}>
                <div className="empty-state-title">No stage data</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        {/* Upcoming Follow-Ups */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Follow-Ups</span>
          </div>
          <div className="card-body" style={{ display: "grid", gap: 10 }}>
            {summary.upcomingFollowUps.length ? summary.upcomingFollowUps.map((deal) => (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="followup-item"
              >
                <strong style={{ fontSize: 13 }}>{deal.title}</strong>
                <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{deal.account_name || "No account"}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatDate(deal.follow_up_date)}</span>
                  <span className={`badge ${deal.priority === "High" ? "badge-danger" : deal.priority === "Low" ? "badge-secondary" : "badge-warning"}`} style={{ fontSize: 10 }}>
                    {deal.priority || "Medium"}
                  </span>
                </div>
              </Link>
            )) : (
              <div className="empty-state" style={{ padding: "24px 0" }}>
                <div className="empty-state-title">No follow-ups scheduled</div>
                <div className="empty-state-sub">Set follow-up dates on deals to see them here.</div>
              </div>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Performers</span>
            <Link href="/performance" className="btn btn-outline-secondary btn-sm">Full report</Link>
          </div>
          <div className="card-body" style={{ display: "grid", gap: 0 }}>
            {summary.topPerformers.length ? (
              summary.topPerformers.map((row, index) => (
                <div
                  key={row.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: index < summary.topPerformers.length - 1 ? "1px solid var(--border-color)" : "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: index === 0 ? "#fef3c7" : index === 1 ? "#f1f5f9" : "#f8f9fa",
                      color: index === 0 ? "#92400e" : "var(--text-secondary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, flexShrink: 0
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{row.name}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 11 }}>{row.won_deals} won deal{row.won_deals !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <strong style={{ color: "var(--primary)" }}>{formatCurrency(row.won_value)}</strong>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: "24px 0" }}>
                <div className="empty-state-title">Rep ranking visible to managers and admins</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

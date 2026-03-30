import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";

const KPI_ICONS = {
  totalDeals: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  pipeline: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  revenue: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const STAGE_COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#a78bfa", "#f472b6", "#f87171", "#22c55e", "#38bdf8"];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function DashboardPage({ summary }) {
  const { totals, health } = summary;
  const totalDeals = Number(totals.total_deals || 0);
  const openDeals = Number(totals.open_deals || 0);
  const attentionCount = Number(health.overdueFollowUps || 0) + Number(health.dueToday || 0);
  const activeStageCount = summary.stageSummary.filter((stage) => Number(stage.deal_count || 0) > 0).length;
  const topStage = [...summary.stageSummary].sort((a, b) => Number(b.stage_value || 0) - Number(a.stage_value || 0))[0];
  const topPerformer = summary.topPerformers[0];
  const executionScore = clamp(72 + Number(health.winRate || 0) - attentionCount * 7, 18, 98);
  const todayKey = new Date().toISOString().slice(0, 10);

  const priorityQueue = summary.upcomingFollowUps.slice(0, 4).map((deal) => {
    const followUpKey = String(deal.follow_up_date || "").slice(0, 10);
    return {
      ...deal,
      tone: followUpKey && followUpKey < todayKey ? "critical" : deal.priority === "High" ? "watch" : "calm"
    };
  });

  const stageRibbon = summary.stageSummary
    .filter((stage) => Number(stage.deal_count || 0) > 0)
    .slice(0, 4)
    .map((stage, index) => ({
      ...stage,
      accent: stage.color || STAGE_COLORS[index % STAGE_COLORS.length],
      ratio: totalDeals > 0 ? Math.round((Number(stage.deal_count || 0) / totalDeals) * 100) : 0
    }));

  const summarySignals = [
    {
      label: "Open opportunities",
      value: openDeals,
      copy: `${activeStageCount || 0} active lanes are currently populated.`
    },
    {
      label: "Won revenue",
      value: formatCurrency(totals.won_value || 0),
      copy: topPerformer ? `${topPerformer.name} is setting the pace right now.` : "Closed wins will start to stack here."
    },
    {
      label: "Action pressure",
      value: attentionCount,
      copy: attentionCount ? "Follow-ups need attention before they age further." : "No urgent follow-up debt is building."
    }
  ];

  const focusCards = [
    {
      label: "Execution score",
      value: `${executionScore}/100`,
      badge: executionScore >= 80 ? "Strong" : executionScore >= 60 ? "Stable" : "Watch",
      tone: executionScore >= 80 ? "good" : executionScore >= 60 ? "warn" : "risk",
      copy: attentionCount
        ? `${attentionCount} follow-ups still need attention before the next revenue review.`
        : "No urgent follow-up debt is piling up right now."
    },
    {
      label: "Pipeline spread",
      value: topStage ? topStage.name : "No stage data",
      badge: `${activeStageCount || 0} active lanes`,
      tone: "good",
      copy: topStage
        ? `${formatCurrency(topStage.stage_value || 0)} sits in the strongest stage cluster right now.`
        : "Add or activate stages to reveal distribution patterns."
    },
    {
      label: "Rep momentum",
      value: topPerformer ? topPerformer.name : "No ranking yet",
      badge: topPerformer ? `${topPerformer.won_deals} wins` : "Awaiting wins",
      tone: topPerformer ? "good" : "warn",
      copy: topPerformer
        ? `${formatCurrency(topPerformer.won_value || 0)} closed revenue is setting the pace this cycle.`
        : "Closed-won activity will surface top reps here automatically."
    }
  ];

  const kpiCards = [
    {
      label: "Total Deals",
      value: totalDeals,
      meta: `${activeStageCount || 0} active stages represented`,
      href: "/deals",
      icon: KPI_ICONS.totalDeals,
      colorClass: "kpi-info"
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(totals.pipeline_value || 0),
      meta: `${formatCurrency(health.averageOpenValue || 0)} avg open deal`,
      href: "/deals",
      icon: KPI_ICONS.pipeline,
      colorClass: "kpi-primary"
    },
    {
      label: "Won Revenue",
      value: formatCurrency(totals.won_value || 0),
      meta: topPerformer ? `${topPerformer.name} currently leads` : `${totals.lost_deals || 0} lost deals`,
      href: "/performance",
      icon: KPI_ICONS.revenue,
      colorClass: "kpi-success"
    }
  ];

  const healthItems = [
    {
      label: "Win Rate",
      value: `${health.winRate}%`,
      tone: Number(health.winRate || 0) >= 50 ? "good" : "warn",
      hint: "Based on all closed won and lost opportunities."
    },
    {
      label: "Overdue Follow-Ups",
      value: health.overdueFollowUps,
      tone: health.overdueFollowUps > 0 ? "risk" : "good",
      hint: "Deals that have already missed the next agreed customer touchpoint."
    },
    {
      label: "High Priority Open",
      value: health.highPriorityOpen,
      tone: health.highPriorityOpen > 0 ? "warn" : "good",
      hint: "Open deals tagged high or critical for immediate visibility."
    }
  ];

  const quickActions = [
    {
      title: "Open pipeline board",
      detail: "Re-prioritize live opportunities visually and move blocked deals forward faster.",
      href: "/deals/kanban"
    },
    {
      title: "Review import templates",
      detail: "Normalize source files before finance, ops, or reps touch the workspace.",
      href: "/import"
    },
    {
      title: "Export executive pack",
      detail: "Ship a polished reporting snapshot of deals, users, and performance in seconds.",
      href: "/export"
    }
  ];

  return (
    <div className="dashboard-shell">
      <div className="page-header page-header-tight">
        <div>
          <h1 className="page-title">Revenue Operating System</h1>
          <p className="page-subtitle">
            A faster operating layer for pipeline pressure, team execution, and the next actions protecting revenue.
          </p>
        </div>
        <div className="page-header-actions">
          <Link href="/deals/kanban" className="btn btn-outline-secondary btn-sm">
            Open board
          </Link>
          <Link href="/deals/new" className="btn btn-primary">
            New deal
          </Link>
        </div>
      </div>

      {stageRibbon.length ? (
        <section className="dashboard-stage-ribbon">
          {stageRibbon.map((stage) => (
            <div key={stage.id} className="dashboard-stage-card" style={{ "--stage-accent": stage.accent }}>
              <div className="dashboard-stage-label">{stage.name}</div>
              <div className="dashboard-stage-value">{formatCurrency(stage.stage_value || 0)}</div>
              <div className="dashboard-stage-meta">
                <span>{stage.deal_count} active deal{Number(stage.deal_count || 0) === 1 ? "" : "s"}</span>
                <span>{stage.ratio}% of pipeline</span>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <section className="hero-panel dashboard-hero-upscale">
        <div className="dashboard-hero-copy">
          <div className="dashboard-eyebrow">
            <span className="status-dot" />
            Live operating view
          </div>
          <h2 className="dashboard-hero-title">
            {formatCurrency(totals.pipeline_value || 0)} in active pipeline, with {openDeals} opportunities still moving.
          </h2>
          <p className="dashboard-hero-text">
            The shell now surfaces cleaner contrast, stronger hierarchy, and faster controls so managers can catch risk earlier and act with less friction.
          </p>
          <div className="dashboard-hero-actions">
            <Link href="/deals" className="btn btn-primary">
              Review deals
            </Link>
            <Link href="/performance" className="btn btn-outline-secondary">
              Rep performance
            </Link>
          </div>

          <div className="dashboard-summary-grid">
            {summarySignals.map((signal) => (
              <div key={signal.label} className="dashboard-signal">
                <div className="dashboard-signal-label">{signal.label}</div>
                <div className="dashboard-signal-value">{signal.value}</div>
                <div className="dashboard-signal-copy">{signal.copy}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <div className="dashboard-panel-title">Immediate queue</div>
              <div className="dashboard-panel-caption">The next conversations that need a decision.</div>
            </div>
            <Link href="/deals" className="btn btn-outline-secondary btn-sm">
              Open deals
            </Link>
          </div>

          <div className="dashboard-activity-list">
            {priorityQueue.length ? (
              priorityQueue.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`} className={`dashboard-activity-item hero-priority-item ${deal.tone}`}>
                  <div className="dashboard-activity-head">
                    <div className="dashboard-activity-title">{deal.title}</div>
                    <span className={`dashboard-focus-badge ${deal.tone === "critical" ? "risk" : deal.tone === "watch" ? "warn" : "good"}`}>
                      {deal.tone === "critical" ? "Overdue" : deal.priority || "Normal"}
                    </span>
                  </div>
                  <div className="dashboard-activity-copy">{deal.account_name || "No account assigned yet"}</div>
                  <div className="dashboard-stage-meta">
                    <span>{formatDate(deal.follow_up_date)}</span>
                    <span>Owner follow-up</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="dashboard-activity-item">
                <div className="dashboard-activity-title">Queue is clear</div>
                <div className="dashboard-activity-copy">No urgent follow-ups are queued right now.</div>
              </div>
            )}
          </div>

          <div className="dashboard-panel-header">
            <div>
              <div className="dashboard-panel-title">Stage momentum</div>
              <div className="dashboard-panel-caption">Where most value is sitting right now.</div>
            </div>
          </div>

          <div className="dashboard-activity-list">
            {summary.stageSummary.slice(0, 3).map((stage, index) => {
              const pct = totalDeals > 0 ? Math.round((Number(stage.deal_count || 0) / totalDeals) * 100) : 0;
              const color = stage.color || STAGE_COLORS[index % STAGE_COLORS.length];
              return (
                <div key={stage.id} className="dashboard-stage-meter" style={{ "--stage-accent": color }}>
                  <div className="dashboard-stage-meter-head">
                    <div className="dashboard-stage-meter-title">
                      <span className="dashboard-stage-meter-dot" />
                      <span>{stage.name}</span>
                    </div>
                    <div className="dashboard-stage-meter-copy">{pct}%</div>
                  </div>
                  <div className="dashboard-stage-meter-copy">
                    {formatCurrency(stage.stage_value || 0)} across {stage.deal_count} deal{Number(stage.deal_count || 0) === 1 ? "" : "s"}
                  </div>
                  <div className="dashboard-stage-meter-progress">
                    <div className="dashboard-stage-meter-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="dashboard-focus-grid">
        {focusCards.map((signal) => (
          <div key={signal.label} className="dashboard-focus-card">
            <div className="dashboard-focus-top">
              <span className="dashboard-focus-label">{signal.label}</span>
              <span className={`dashboard-focus-badge ${signal.tone}`}>{signal.badge}</span>
            </div>
            <div className="dashboard-focus-value">{signal.value}</div>
            <p className="dashboard-focus-copy">{signal.copy}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-kpi-grid">
        {kpiCards.map((card) => (
          <Link key={card.label} href={card.href} className={`kpi-card ${card.colorClass}`}>
            <div className="kpi-header">
              <span className="kpi-label">{card.label}</span>
              <span className="kpi-icon">{card.icon}</span>
            </div>
            <div className="kpi-value">{card.value}</div>
            <div className="kpi-meta">{card.meta}</div>
          </Link>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Live pipeline</span>
            <Link href="/deals" className="btn btn-outline-secondary btn-sm">
              View all
            </Link>
          </div>
          <div className="card-body card-body-table">
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
                  {summary.recentDeals.length ? (
                    summary.recentDeals.map((deal) => (
                      <tr key={deal.id}>
                        <td>
                          <Link href={`/deals/${deal.id}`} className="table-link-strong">
                            {deal.title}
                          </Link>
                        </td>
                        <td>
                          <span
                            className="badge badge-secondary table-stage-badge"
                            style={deal.stage_color ? { background: `${deal.stage_color}22`, color: deal.stage_color, borderColor: `${deal.stage_color}55` } : undefined}
                          >
                            {deal.stage_name || deal.status}
                          </span>
                        </td>
                        <td className="table-muted-cell">{deal.account_name || "-"}</td>
                        <td className="table-subtle-cell">{formatDate(deal.updated_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">
                        <div className="empty-state empty-state-padded">
                          <div className="empty-state-title">No deals yet</div>
                          <div className="empty-state-sub">Create your first deal to start shaping the dashboard.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="dashboard-side-stack">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Pressure points</span>
            </div>
            <div className="card-body pipeline-health-list">
              {healthItems.map((item) => (
                <div key={item.label} className={`health-item health-item-${item.tone}`}>
                  <div>
                    <div className="health-item-label">{item.label}</div>
                    <div className="health-item-hint">{item.hint}</div>
                  </div>
                  <div className="health-item-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Stage distribution</span>
            </div>
            <div className="card-body stage-list-block">
              {summary.stageSummary.length ? (
                summary.stageSummary.map((stage, index) => {
                  const pct = totalDeals > 0 ? Math.round((Number(stage.deal_count || 0) / totalDeals) * 100) : 0;
                  const color = stage.color || STAGE_COLORS[index % STAGE_COLORS.length];
                  return (
                    <div key={stage.id} className="stage-distribution-item">
                      <div className="stage-distribution-head">
                        <div className="stage-distribution-name">
                          <span className="stage-distribution-dot" style={{ background: color }} />
                          <span>{stage.name}</span>
                        </div>
                        <div className="stage-distribution-meta">
                          <span>{formatCurrency(stage.stage_value || 0)}</span>
                          <span>{stage.deal_count} deals</span>
                        </div>
                      </div>
                      <div className="progress">
                        <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <div className="empty-state-title">No stage data</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-secondary-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Action queue</span>
          </div>
          <div className="card-body followup-grid">
            {summary.upcomingFollowUps.length ? (
              summary.upcomingFollowUps.map((deal) => {
                const followUpKey = String(deal.follow_up_date || "").slice(0, 10);
                const toneClass = followUpKey && followUpKey < todayKey ? "followup-item-critical" : deal.priority === "High" ? "followup-item-watch" : "";
                return (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className={`followup-item ${toneClass}`.trim()}>
                    <strong className="followup-title">{deal.title}</strong>
                    <span className="followup-account">{deal.account_name || "No account"}</span>
                    <div className="followup-meta-row">
                      <span className="followup-date">{formatDate(deal.follow_up_date)}</span>
                      <span className={`badge ${deal.priority === "High" ? "badge-danger" : deal.priority === "Low" ? "badge-secondary" : "badge-warning"}`}>
                        {deal.priority || "Medium"}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No follow-ups scheduled</div>
                <div className="empty-state-sub">Set follow-up dates on deals to surface them here.</div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Operating actions</span>
          </div>
          <div className="card-body action-stack">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="action-item">
                <div className="action-item-title">{action.title}</div>
                <div className="action-item-copy">{action.detail}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Top performers</span>
            <Link href="/performance" className="btn btn-outline-secondary btn-sm">
              Full report
            </Link>
          </div>
          <div className="card-body performer-list">
            {summary.topPerformers.length ? (
              summary.topPerformers.map((row, index) => (
                <div key={row.id} className="performer-row">
                  <div className="performer-rank">{index + 1}</div>
                  <div className="performer-copy">
                    <div className="performer-name">{row.name}</div>
                    <div className="performer-meta">
                      {row.won_deals} won deal{row.won_deals !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <strong className="performer-value">{formatCurrency(row.won_value || 0)}</strong>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">Rep ranking becomes visible for managers and admins</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

/* ── Icons ── */
const PDFIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 13h4m-4 3h4m-4-6h1"/>
  </svg>
);

const ExcelIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
  </svg>
);

const CSVIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
  </svg>
);

const EXPORT_PACKS = [
  {
    id:      "deals",
    title:   "Deals Pipeline",
    emoji:   "📊",
    desc:    "All deals with account, stage, owner, value, dates, and status.",
    formats: [
      { label: "Excel", href: "/api/export/deals",     icon: "excel", color: "#6ee7b7" },
      { label: "CSV",   href: "/api/export/deals-csv", icon: "csv",   color: "#a5b4fc" },
    ],
    roles: ["admin", "manager", "sales", "viewer"],
  },
  {
    id:      "performance",
    title:   "Team Performance",
    emoji:   "🏆",
    desc:    "Rep-level totals — close rates, won revenue, open vs. won vs. lost.",
    formats: [
      { label: "Excel", href: "/api/export/performance",     icon: "excel", color: "#6ee7b7" },
      { label: "CSV",   href: "/api/export/performance-csv", icon: "csv",   color: "#a5b4fc" },
    ],
    roles: ["admin", "manager"],
  },
  {
    id:      "workspace",
    title:   "Full Workspace Pack",
    emoji:   "🗃️",
    desc:    "Combined workbook: deals, accounts, performance, targets, audit logs, settings.",
    formats: [
      { label: "Excel (full pack)", href: "/api/export/workspace", icon: "excel", color: "#6ee7b7" },
    ],
    roles: ["admin", "manager"],
    featured: true,
  },
  {
    id:      "users",
    title:   "User Directory",
    emoji:   "👥",
    desc:    "Team list with roles, deal counts, won value, and login visibility.",
    formats: [
      { label: "Excel", href: "/api/export/users",     icon: "excel", color: "#6ee7b7" },
      { label: "CSV",   href: "/api/export/users-csv", icon: "csv",   color: "#a5b4fc" },
    ],
    roles: ["admin"],
  },
];

function FormatButton({ format }) {
  const icons = { pdf: <PDFIcon />, excel: <ExcelIcon />, csv: <CSVIcon /> };
  const bgColors = { pdf: "rgba(239,68,68,0.1)", excel: "rgba(16,185,129,0.1)", csv: "rgba(99,102,241,0.1)" };
  const borderColors = { pdf: "rgba(239,68,68,0.2)", excel: "rgba(16,185,129,0.2)", csv: "rgba(99,102,241,0.2)" };

  return (
    <a
      href={format.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 14px",
        background: bgColors[format.icon] || "rgba(255,255,255,0.06)",
        border: `1px solid ${borderColors[format.icon] || "rgba(255,255,255,0.1)"}`,
        borderRadius: 9,
        fontSize: 12.5,
        fontWeight: 600,
        color: format.color,
        textDecoration: "none",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      {icons[format.icon]}
      {format.label}
      <DownloadIcon />
    </a>
  );
}

function PrintPDFButton({ title }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 14px",
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: 9,
        fontSize: 12.5,
        fontWeight: 600,
        color: "#fca5a5",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
      title="Print or save as PDF using your browser"
    >
      <PDFIcon />
      PDF (Print)
      <DownloadIcon />
    </button>
  );
}

export function ExportClient({ userRole }) {
  const [copiedId, setCopiedId] = useState(null);

  const visiblePacks = EXPORT_PACKS.filter((p) => p.roles.includes(userRole));

  return (
    <div style={{ display: "grid", gap: 22 }}>
      {/* Quick-access bar */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Quick Export</span>
          <span className="badge badge-secondary">{visiblePacks.length} available</span>
        </div>
        <div className="card-body" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {visiblePacks.map((pack) => (
            <div
              key={pack.id}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span style={{ fontSize: 16 }}>{pack.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{pack.title}</span>
              {pack.formats.map((f) => (
                <a
                  key={f.label}
                  href={f.href}
                  className="badge badge-secondary"
                  style={{ textDecoration: "none", cursor: "pointer", transition: "all 0.15s", border: "1px solid var(--border-strong)" }}
                >
                  ↓ {f.label}
                </a>
              ))}
              {pack.id !== "workspace" && <PrintPDFButton title={pack.title} />}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed export cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        {visiblePacks.map((pack) => (
          <div
            key={pack.id}
            className="card"
            style={pack.featured ? {
              border: "1px solid rgba(99,102,241,0.25)",
              background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(13,19,33,1) 100%)"
            } : {}}
          >
            {pack.featured && (
              <div style={{
                padding: "7px 20px",
                background: "rgba(99,102,241,0.12)",
                borderBottom: "1px solid rgba(99,102,241,0.18)",
                fontSize: 10.5,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--accent-light)",
              }}>
                ✦ Full workspace included
              </div>
            )}
            <div className="card-body" style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{pack.emoji}</span>
                <div>
                  <div style={{
                    fontFamily: "var(--font-headline)",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 4,
                  }}>
                    {pack.title}
                  </div>
                  <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                    {pack.desc}
                  </p>
                </div>
              </div>

              {/* Format selector */}
              <div>
                <div style={{
                  fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8
                }}>
                  Choose format
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {pack.formats.map((f) => (
                    <FormatButton key={f.label} format={f} />
                  ))}
                  {/* PDF option for every pack except workspace */}
                  {pack.id !== "workspace" && <PrintPDFButton title={pack.title} />}
                </div>
              </div>

              {/* Metadata */}
              <div style={{
                background: "rgba(0,0,0,0.18)",
                borderRadius: 8,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {pack.id === "deals"       && "Includes: ID, Title, Account, Stage, Status, Owner, Values, Dates"}
                  {pack.id === "performance" && "Includes: Rep, Role, Total/Open/Won/Lost Deals, Revenue, Close Rate"}
                  {pack.id === "workspace"   && "Sheets: Deals, Accounts, Performance, Targets, Audit, Settings, Users"}
                  {pack.id === "users"       && "Admin only · Includes: Name, Email, Role, Activity, Deal Counts"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PDF note */}
      <div className="card" style={{ border: "1px solid rgba(245,158,11,0.15)", background: "rgba(245,158,11,0.04)" }}>
        <div className="card-body" style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 3 }}>
                Exporting as PDF
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Click <strong style={{ color: "var(--text-primary)" }}>PDF (Print)</strong> on any report to open your browser&apos;s print dialog.
                Choose <em>Save as PDF</em> as the destination — this exports exactly what you see, formatted for stakeholder sharing.
                For best results, use Chrome or Edge and enable &quot;Background graphics&quot; in print settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { SidebarNav } from "@/components/sidebar-nav";

const ChevronLeft = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
  </svg>
);

const ROLE_COLORS = {
  admin: { bg: "rgba(248, 113, 113, 0.14)", color: "#fca5a5" },
  manager: { bg: "rgba(251, 191, 36, 0.14)", color: "#fcd34d" },
  sales: { bg: "rgba(96, 165, 250, 0.14)", color: "#93c5fd" },
  viewer: { bg: "rgba(161, 161, 170, 0.14)", color: "#d4d4d8" }
};

export function Sidebar({
  user,
  workspaceName,
  collapsed = false,
  mobileOpen = false,
  onToggleCollapse,
  onCloseMobile
}) {
  const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.viewer;

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}>
      <div className="sidebar-logo">
        <div className="logo-icon brand-mark">TG</div>
        <div className="brand-copy">
          <div className="logo-text">{workspaceName}</div>
          <div className="sidebar-tagline">Finance & Sales</div>
          <div className="sidebar-system-status">
            <span className="status-dot" />
            Live workspace
          </div>
        </div>
      </div>

      <SidebarNav role={user.role} onNavigate={onCloseMobile} />

      <div className="sidebar-spotlight">
        <span className="sidebar-spotlight-label">Premium workflow</span>
        <strong className="sidebar-spotlight-title">Ops command center</strong>
        <span className="sidebar-spotlight-copy">
          Faster navigation, cleaner reporting, and color-coded execution views are now built in.
        </span>

        <div className="sidebar-quick-actions">
          {user.role !== "viewer" ? (
            <Link href="/deals/new" className="sidebar-quick-action" onClick={onCloseMobile}>
              + New deal
            </Link>
          ) : null}
          <Link
            href={user.role === "viewer" ? "/accounts" : "/export"}
            className="sidebar-quick-action"
            onClick={onCloseMobile}
          >
            {user.role === "viewer" ? "Accounts" : "Export pack"}
          </Link>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{String(user.name || "U").slice(0, 1).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  background: roleStyle.bg,
                  color: roleStyle.color
                }}
              >
                {user.role}
              </span>
            </div>
          </div>
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
    </aside>
  );
}

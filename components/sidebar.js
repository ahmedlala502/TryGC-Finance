"use client";

import Link from "next/link";
import { SidebarNav } from "@/components/sidebar-nav";

const ChevronLeft = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
  </svg>
);

const ROLE_COLORS = {
  admin:   { bg: "rgba(239,68,68,0.12)",   color: "#fca5a5",  border: "rgba(239,68,68,0.22)"   },
  manager: { bg: "rgba(245,158,11,0.12)",  color: "#fcd34d",  border: "rgba(245,158,11,0.22)"  },
  sales:   { bg: "rgba(99,102,241,0.14)",  color: "#a5b4fc",  border: "rgba(99,102,241,0.24)"  },
  viewer:  { bg: "rgba(148,163,184,0.10)", color: "#94a3b8",  border: "rgba(148,163,184,0.18)" }
};

export function Sidebar({
  user,
  workspaceName,
  workspaceMark = "TG",
  workspaceTagline = "Revenue OS",
  collapsed = false,
  mobileOpen = false,
  onToggleCollapse,
  onCloseMobile
}) {
  const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.viewer;

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon brand-mark">{String(workspaceMark || "TG").slice(0, 3).toUpperCase()}</div>
        {!collapsed && (
          <div className="brand-copy">
            <div className="logo-text">{workspaceName}</div>
            <div className="sidebar-tagline">{workspaceTagline}</div>
            <div className="sidebar-system-status">
              <span className="status-dot" />
              Live workspace sync
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <SidebarNav role={user.role} onNavigate={onCloseMobile} />

      {/* Spotlight card */}
      {!collapsed && (
        <div className="sidebar-spotlight">
          <span className="sidebar-spotlight-label">Command Center</span>
          <strong className="sidebar-spotlight-title">Pipeline control, without drag</strong>
          <span className="sidebar-spotlight-copy">
            Faster routing, sharper status contrast, and cleaner reporting flows for operators.
          </span>
          <div className="sidebar-quick-actions">
            {user.role !== "viewer" && (
              <Link href="/deals/new" className="sidebar-quick-action" onClick={onCloseMobile}>
                Open new deal
              </Link>
            )}
            <Link
              href={user.role === "viewer" ? "/accounts" : "/export"}
              className="sidebar-quick-action"
              onClick={onCloseMobile}
            >
              {user.role === "viewer" ? "Browse accounts" : "Export reports"}
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{String(user.name || "U").slice(0, 1).toUpperCase()}</div>
          {!collapsed && (
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1px 7px",
                  borderRadius: 5,
                  fontSize: 9.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  background: roleStyle.bg,
                  color: roleStyle.color,
                  border: `1px solid ${roleStyle.border}`,
                  marginTop: 2
                }}
              >
                {user.role}
              </span>
            </div>
          )}
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

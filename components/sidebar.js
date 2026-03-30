"use client";

import { useState } from "react";
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
  admin: { bg: "rgba(239,68,68,0.15)", color: "#f87171" },
  manager: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
  sales: { bg: "rgba(20,184,166,0.15)", color: "#5eead4" },
  viewer: { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" }
};

export function Sidebar({ user, workspaceName }) {
  const [collapsed, setCollapsed] = useState(false);
  const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.viewer;

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-logo">
        <div className="logo-icon brand-mark">TG</div>
        <div className="brand-copy">
          <div className="logo-text">{workspaceName}</div>
          <div className="sidebar-tagline">Finance & Sales</div>
        </div>
      </div>

      <SidebarNav role={user.role} />

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
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
    </aside>
  );
}

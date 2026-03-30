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

export function Sidebar({ user, workspaceName }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-logo">
        <div className="logo-icon brand-mark">TG</div>
        <div className="brand-copy">
          <div className="logo-text">{workspaceName}</div>
          <div className="sidebar-tagline">National Operations</div>
        </div>
      </div>

      <SidebarNav />

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{String(user.name || "U").slice(0, 1).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
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

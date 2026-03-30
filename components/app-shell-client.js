"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

const SIDEBAR_STORAGE_KEY = "trygc-sidebar-collapsed";

export function AppShellClient({ user, workspaceName, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    } catch {
      setCollapsed(false);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }

  return (
    <div className={`app-layout${mobileOpen ? " nav-open" : ""}${collapsed ? " sidebar-is-collapsed" : ""}`}>
      <Sidebar
        user={user}
        workspaceName={workspaceName}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapsed}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen ? <button className="app-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /> : null}

      <div className="main-wrapper">
        <Topbar
          user={user}
          onOpenSidebar={() => setMobileOpen(true)}
          onToggleSidebarCollapse={toggleCollapsed}
        />
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}

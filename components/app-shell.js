import Link from "next/link";
import { SidebarNav } from "@/components/sidebar-nav";
import { getWorkspaceConfig } from "@/lib/data";

export function AppShell({ user, children }) {
  const workspace = getWorkspaceConfig();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">S</div>
          <div>
            <div className="logo-text">{workspace.system_name}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>National Operations</div>
          </div>
        </div>

        <SidebarNav />

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{String(user.name || "U").slice(0, 1)}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        <header
          className="topbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px"
          }}
        >
          <div style={{ display: "grid", gap: 3 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
              Workspace
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Commercial command center</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <form action="/deals" method="get" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="search"
                name="search"
                placeholder="Search deals, contacts, email"
                style={{
                  minWidth: 280,
                  borderRadius: 999,
                  border: "1px solid var(--border-color)",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.78)"
                }}
              />
            </form>

            <Link href="/deals/new" className="btn btn-primary btn-sm">
              + Quick Deal
            </Link>

            <div className="topbar-chip">
              <span className="topbar-chip-label">Signed in</span>
              <strong>{user.email}</strong>
            </div>

            <form action="/api/logout" method="post">
              <button type="submit" className="btn btn-outline-secondary btn-sm">
                Log Out
              </button>
            </form>
          </div>
        </header>

        <main style={{ padding: "24px" }}>{children}</main>
      </div>
    </div>
  );
}

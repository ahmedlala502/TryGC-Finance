"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { buildThemeStyleText } from "@/lib/theme";

const SIDEBAR_STORAGE_KEY = "trygc-sidebar-collapsed";
const THEME_STORAGE_KEY = "trygc-theme";

const BASE_COMMANDS = [
  { href: "/", title: "Dashboard", copy: "Review the operating snapshot and revenue pressure.", icon: "DB", roles: ["admin", "manager", "sales", "viewer"] },
  { href: "/deals", title: "Deals", copy: "Open the full pipeline table and filters.", icon: "DL", roles: ["admin", "manager", "sales", "viewer"] },
  { href: "/deals/kanban", title: "Kanban Board", copy: "Move live opportunities stage by stage.", icon: "KB", roles: ["admin", "manager", "sales", "viewer"] },
  { href: "/accounts", title: "Accounts", copy: "Inspect account coverage and linked deals.", icon: "AC", roles: ["admin", "manager", "sales", "viewer"] },
  { href: "/performance", title: "Performance", copy: "See rep output, revenue, and close rates.", icon: "PF", roles: ["admin", "manager", "sales"] },
  { href: "/targets", title: "Targets", copy: "Track quota progress and monthly pacing.", icon: "TG", roles: ["admin", "manager", "sales"] },
  { href: "/import", title: "Import Templates", copy: "Bring in new data using spreadsheet templates.", icon: "IM", roles: ["admin", "manager", "sales"] },
  { href: "/export", title: "Export Reports", copy: "Generate finance and operations reporting packs.", icon: "EX", roles: ["admin", "manager", "sales"] },
  { href: "/audit", title: "Audit Trail", copy: "Review workspace changes and recent activity.", icon: "AT", roles: ["admin", "manager", "sales", "viewer"] },
  { href: "/users", title: "Users", copy: "Manage workspace access and role assignments.", icon: "US", roles: ["admin"] },
  { href: "/stages", title: "Stages", copy: "Tune stage order, probability, and color.", icon: "ST", roles: ["admin", "manager"] },
  { href: "/custom-fields", title: "Custom Fields", copy: "Extend account and deal metadata.", icon: "CF", roles: ["admin", "manager"] },
  { href: "/settings", title: "Settings", copy: "Adjust workspace defaults and business rules.", icon: "SE", roles: ["admin", "manager"] }
];

function syncTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AppShellClient({ user, workspace, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const commandInputRef = useRef(null);
  const deferredQuery = useDeferredValue(commandQuery);
  const workspaceName = workspace?.system_name || "TryGC Revenue OS";
  const workspaceTheme = workspace?.theme;

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      const configuredMode = workspaceTheme?.mode;
      const fallbackTheme = configuredMode === "light" || configuredMode === "dark" ? configuredMode : getSystemTheme();
      const initialTheme = saved === "light" || saved === "dark" ? saved : fallbackTheme;
      setTheme(initialTheme);
      syncTheme(initialTheme);
    } catch {
      setCollapsed(false);
    }
  }, [workspaceTheme?.mode]);

  useEffect(() => {
    if (!workspaceTheme) return;

    const styleId = "trygc-workspace-theme";
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = buildThemeStyleText(workspaceTheme);
  }, [workspaceTheme]);

  useEffect(() => {
    document.documentElement.dataset.density = workspace?.compact_mode ? "compact" : "comfortable";
  }, [workspace?.compact_mode]);

  useEffect(() => {
    setMobileOpen(false);
    setCommandOpen(false);
    setCommandQuery("");
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || commandOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [commandOpen, mobileOpen]);

  useEffect(() => {
    if (!commandOpen) return;
    commandInputRef.current?.focus();
  }, [commandOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemThemeChange(event) {
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "light" || saved === "dark") return;
      } catch {}

      const nextTheme = event.matches ? "dark" : "light";
      setTheme(nextTheme);
      syncTheme(nextTheme);
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  useEffect(() => {
    function handleGlobalKeydown(event) {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
        return;
      }

      if (event.key === "Escape" && commandOpen) {
        event.preventDefault();
        setCommandOpen(false);
        setCommandQuery("");
        return;
      }

      if (!typing && !commandOpen && event.key.toLowerCase() === "g") {
        event.preventDefault();
        setCommandOpen(true);
      }
    }

    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, [commandOpen]);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      syncTheme(next);
      return next;
    });
  }

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }

  function closeCommandPalette() {
    setCommandOpen(false);
    setCommandQuery("");
  }

  const commandRows = [
    ...(user.role !== "viewer"
      ? [
          {
            id: "new-deal",
            title: "New Deal",
            copy: "Create a fresh opportunity without leaving the keyboard.",
            icon: "ND",
            hint: "Create",
            action: () => router.push("/deals/new")
          }
        ]
      : []),
    ...BASE_COMMANDS.filter((item) => item.roles.includes(user.role)).map((item) => ({
      ...item,
      id: item.href,
      hint: item.href === pathname ? "Open" : "Go",
      action: () => router.push(item.href)
    })),
    {
      id: "toggle-theme",
      title: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      copy: "Flip the interface instantly with the new contrast-tuned theme.",
      icon: theme === "dark" ? "LT" : "DK",
      hint: "Theme",
      action: toggleTheme
    }
  ].filter((item) => {
    if (!deferredQuery.trim()) return true;
    const text = `${item.title} ${item.copy}`.toLowerCase();
    return text.includes(deferredQuery.trim().toLowerCase());
  });

  return (
    <div className={`app-layout${mobileOpen ? " nav-open" : ""}${collapsed ? " sidebar-is-collapsed" : ""}`}>
      <Sidebar
        user={user}
        workspaceName={workspaceName}
        workspaceMark={workspace?.workspace_mark}
        workspaceTagline={workspace?.workspace_tagline}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapsed}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen ? <button className="app-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /> : null}

      <div className="main-wrapper">
        <Topbar
          user={user}
          workspaceName={workspaceName}
          locale={workspace?.locale}
          timezone={workspace?.timezone}
          onOpenSidebar={() => setMobileOpen(true)}
          onToggleSidebarCollapse={toggleCollapsed}
          onOpenCommandPalette={() => setCommandOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="content-area">{children}</main>
      </div>

      {commandOpen ? (
        <>
          <button
            type="button"
            className="command-palette-backdrop"
            aria-label="Close command palette"
            onClick={closeCommandPalette}
          />
          <section className="command-palette" aria-label="Command palette">
            <div className="command-palette-header">
              <div className="command-palette-title">Command Center</div>
              <div className="command-palette-subtitle">
                Jump across the workspace, create records, and switch themes from one place.
              </div>
              <input
                ref={commandInputRef}
                type="search"
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                className="command-palette-search"
                placeholder="Search views, actions, and workspace controls"
                aria-label="Search commands"
              />
            </div>

            <div className="command-palette-list">
              {commandRows.length ? (
                commandRows.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`command-row${index === 0 ? " active" : ""}`}
                    onClick={() => {
                      item.action();
                      closeCommandPalette();
                    }}
                  >
                    <span className="command-row-icon">{item.icon}</span>
                    <span>
                      <span className="command-row-title">{item.title}</span>
                      <span className="command-row-copy">{item.copy}</span>
                    </span>
                    <span className="command-row-hint">{item.hint}</span>
                  </button>
                ))
              ) : (
                <div className="command-palette-empty">
                  No matching command yet. Try "deal", "export", "theme", or "dashboard".
                </div>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const PAGE_TITLES = {
  "/":              "Dashboard",
  "/deals":         "Deals",
  "/deals/kanban":  "Kanban Board",
  "/deals/new":     "New Deal",
  "/accounts":      "Accounts",
  "/performance":   "Performance",
  "/targets":       "Targets",
  "/import":        "Import & Templates",
  "/export":        "Export Reports",
  "/audit":         "Audit Trail",
  "/users":         "User Management",
  "/stages":        "Pipeline Stages",
  "/custom-fields": "Custom Fields",
  "/settings":      "Settings",
};

const PAGE_DESCRIPTIONS = {
  "/":              "Revenue health, follow-ups, and team momentum — all in one view.",
  "/deals":         "Pipeline table with filters, inline edit, and bulk actions.",
  "/deals/kanban":  "Drag-and-drop stage view — move deals without table overhead.",
  "/deals/new":     "Capture the essentials before the next customer touchpoint.",
  "/accounts":      "Account coverage, context, and linked deal history.",
  "/performance":   "Rep output, conversion rates, and closed revenue by owner.",
  "/targets":       "Quota progress before the month slips away.",
  "/import":        "Upload CSV or Excel — pipeline and commission templates supported.",
  "/export":        "Download PDF, Excel, or CSV reports — stakeholder-ready.",
  "/audit":         "Full change log with user, timestamp, and entity tracking.",
  "/users":         "Manage team access, roles, and workspace structure.",
  "/stages":        "Keep the pipeline model current and enforceable.",
  "/custom-fields": "Extend the CRM schema without database work.",
  "/settings":      "Workspace defaults, currencies, markets, and naming.",
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/deals/"))    return "Deal Detail";
  if (pathname.startsWith("/accounts/")) return "Account Detail";
  return "Dashboard";
}

function getPageDescription(pathname) {
  if (PAGE_DESCRIPTIONS[pathname]) return PAGE_DESCRIPTIONS[pathname];
  if (pathname.startsWith("/deals/"))    return "Review activity, ownership, and next actions for this deal.";
  if (pathname.startsWith("/accounts/")) return "Inspect account coverage, linked deals, and recent changes.";
  return PAGE_DESCRIPTIONS["/"];
}

/* ── Icons ── */
const BellIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h10M4 17h16" />
  </svg>
);

const CollapseIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
  </svg>
);

const SunIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

const SparkIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" />
  </svg>
);

export function Topbar({
  user,
  workspaceName,
  locale = "en-US",
  timezone,
  onOpenSidebar,
  onToggleSidebarCollapse,
  onOpenCommandPalette,
  theme,
  onToggleTheme
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef(null);
  const [now, setNow] = useState(() => new Date());

  const title         = getPageTitle(pathname);
  const description   = getPageDescription(pathname);
  const canCreateDeal = user.role !== "viewer";
  const searchValue   = searchParams.get("search") || "";
  const searchAction  = pathname.startsWith("/accounts") ? "/accounts" : "/deals";
  const searchPlaceholder = pathname.startsWith("/accounts")
    ? "Search accounts..."
    : "Search deals, contacts...";

  const workspaceLabel = String(workspaceName || "TryGC")
    .replace(/\s*-\s*/g, " ")
    .split(/\s+/)
    .slice(0, 2)
    .join(" ");

  /* clock tick */
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    function handleSlashShortcut(event) {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key === "Escape" && document.activeElement === searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }

    window.addEventListener("keydown", handleSlashShortcut);
    return () => window.removeEventListener("keydown", handleSlashShortcut);
  }, []);

  const nowLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale || "en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        ...(timezone ? { timeZone: timezone } : {})
      }).format(now),
    [locale, now, timezone]
  );

  return (
    <header className="topbar">
      {/* Mobile hamburger */}
      <button
        className="topbar-menu-btn"
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
      >
        <MenuIcon />
      </button>

      {/* Page title block */}
      <div className="topbar-title-area">
        <div className="topbar-breadcrumb">
          <span>{workspaceLabel}</span>
          <span className="topbar-breadcrumb-sep">/</span>
          <span className="topbar-breadcrumb-current">{title}</span>
        </div>
        <div className="topbar-page-row">
          <div className="topbar-page-name">{title}</div>
          <button
            type="button"
            className="topbar-collapse-btn"
            onClick={onToggleSidebarCollapse}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <CollapseIcon />
            Collapse
          </button>
        </div>
        <div className="topbar-page-subtitle">{description}</div>
      </div>

      {/* Right actions */}
      <div className="topbar-actions">
        {/* Search */}
        <form action={searchAction} method="get" className="topbar-search-form">
          <span className="topbar-search-icon"><SearchIcon /></span>
          <input
            ref={searchInputRef}
            type="search"
            name="search"
            defaultValue={searchValue}
            placeholder={searchPlaceholder}
            className="topbar-search-input"
            aria-label="Search workspace"
          />
          <span className="topbar-search-kbd" aria-hidden="true">/</span>
        </form>

        <button
          type="button"
          className="topbar-command-btn"
          onClick={onOpenCommandPalette}
          aria-label="Open command palette"
        >
          <span className="topbar-command-copy">
            <span className="topbar-command-label">Command</span>
            <span className="topbar-command-value">Jump anywhere</span>
          </span>
          <span className="topbar-command-kbd">Ctrl K</span>
        </button>

        {/* Status chip */}
        <div className="topbar-status-chip topbar-status-chip-rich">
          <span className="status-dot" />
          <div className="topbar-status-copy">
            <span className="topbar-status-label">Live sync</span>
            <span className="topbar-status-value">{nowLabel}</span>
          </div>
        </div>

        {/* New deal CTA */}
        {canCreateDeal && (
          <Link href="/deals/new" className="btn btn-primary btn-sm topbar-new-btn">
            <PlusIcon />
            New Deal
          </Link>
        )}

        {/* Theme toggle */}
        <button
          type="button"
          className="topbar-icon-btn"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        <button
          type="button"
          className="topbar-icon-btn"
          onClick={onOpenCommandPalette}
          title="Open command center"
          aria-label="Open command center"
        >
          <SparkIcon />
        </button>

        {/* Audit / notifications */}
        <Link
          href="/audit"
          className="topbar-icon-btn"
          title="Audit trail"
          aria-label="Audit trail"
        >
          <BellIcon />
          <span className="topbar-notif-dot" />
        </Link>

        {/* User chip */}
        <div className="topbar-user-chip">
          <div className="topbar-user-avatar">
            {String(user.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user.name}</span>
            <span className="topbar-user-role">{user.role}</span>
          </div>
        </div>

        {/* Sign out */}
        <form action="/api/logout" method="post">
          <button type="submit" className="btn btn-outline-secondary btn-sm">
            Sign Out
          </button>
        </form>
      </div>
    </header>
  );
}

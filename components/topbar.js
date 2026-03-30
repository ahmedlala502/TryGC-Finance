"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const PAGE_TITLES = {
  "/": "Dashboard",
  "/deals": "Deals",
  "/deals/kanban": "Kanban Board",
  "/deals/new": "New Deal",
  "/accounts": "Accounts",
  "/performance": "Performance",
  "/targets": "Targets",
  "/import": "Templates & Import",
  "/export": "Export Data",
  "/audit": "Audit Logs",
  "/users": "Users",
  "/stages": "Pipeline Stages",
  "/custom-fields": "Custom Fields",
  "/settings": "Settings",
};

const PAGE_DESCRIPTIONS = {
  "/": "Revenue, follow-ups, and team momentum in one view.",
  "/deals": "Review pipeline health, filter the table, and move deals faster.",
  "/deals/kanban": "Track each deal by stage with less table overhead.",
  "/deals/new": "Capture the essentials before the next customer touchpoint.",
  "/accounts": "Keep account history, context, and deal coverage tight.",
  "/performance": "Compare output, conversion, and closed revenue by rep.",
  "/targets": "Track quota progress before the month slips away.",
  "/import": "Bring in spreadsheets cleanly and reuse validated templates.",
  "/export": "Ship stakeholder-ready extracts without spreadsheet cleanup.",
  "/audit": "Review changes, ownership, and operational accountability.",
  "/users": "Control access, roles, and team structure.",
  "/stages": "Keep the pipeline model current and enforceable.",
  "/custom-fields": "Extend the CRM schema without database churn.",
  "/settings": "Adjust workspace-wide defaults and naming."
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/deals/")) return "Deal Detail";
  if (pathname.startsWith("/accounts/")) return "Account Detail";
  return "Dashboard";
}

function getPageDescription(pathname) {
  if (PAGE_DESCRIPTIONS[pathname]) return PAGE_DESCRIPTIONS[pathname];
  if (pathname.startsWith("/deals/")) return "Review activity, ownership, and next actions for this deal.";
  if (pathname.startsWith("/accounts/")) return "Inspect account coverage, linked deals, and recent changes.";
  return PAGE_DESCRIPTIONS["/"];
}

const BellIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export function Topbar({ user, workspaceName, onOpenSidebar, onToggleSidebarCollapse }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef(null);
  const [now, setNow] = useState(() => new Date());
  const title = getPageTitle(pathname);
  const description = getPageDescription(pathname);
  const canCreateDeal = user.role !== "viewer";
  const searchValue = searchParams.get("search") || "";
  const searchAction = pathname.startsWith("/accounts") ? "/accounts" : "/deals";
  const searchPlaceholder = pathname.startsWith("/accounts")
    ? "Search accounts, companies, contacts..."
    : "Search deals, contacts, email...";
  const workspaceLabel = String(workspaceName || "TryGC Revenue OS")
    .replace(/\s*-\s*/g, " ")
    .split(/\s+/)
    .slice(0, 3)
    .join(" ");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleKeydown(event) {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if (event.key === "/" && !isTypingTarget && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key === "Escape" && document.activeElement === searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const nowLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(now),
    [now]
  );

  return (
    <header className="topbar">
      <button
        className="topbar-menu-btn"
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
      >
        <MenuIcon />
      </button>

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
            aria-label="Toggle sidebar width"
            title="Toggle sidebar width"
          >
            Collapse
          </button>
        </div>
        <div className="topbar-page-subtitle">{description}</div>
      </div>

      <div className="topbar-actions">
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

        <div className="topbar-status-chip topbar-status-chip-rich">
          <span className="status-dot" />
          <div className="topbar-status-copy">
            <span className="topbar-status-label">Secure sync</span>
            <span className="topbar-status-value">{nowLabel}</span>
          </div>
        </div>

        {canCreateDeal && (
          <Link href="/deals/new" className="btn btn-primary btn-sm topbar-new-btn">
            <PlusIcon />
            New Deal
          </Link>
        )}

        <Link href="/audit" className="topbar-icon-btn" title="Open audit trail" aria-label="Open audit trail">
          <BellIcon />
          <span className="topbar-notif-dot" />
        </Link>

        <div className="topbar-user-chip">
          <div className="topbar-user-avatar">
            {String(user.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user.name}</span>
            <span className="topbar-user-role">{user.role}</span>
          </div>
        </div>

        <form action="/api/logout" method="post">
          <button type="submit" className="btn btn-outline-secondary btn-sm">
            Sign Out
          </button>
        </form>
      </div>
    </header>
  );
}

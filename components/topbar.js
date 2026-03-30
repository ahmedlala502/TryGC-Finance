"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/deals/")) return "Deal Detail";
  if (pathname.startsWith("/accounts/")) return "Account Detail";
  return "Dashboard";
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

export function Topbar({ user }) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="topbar">
      <div className="topbar-title-area">
        <div className="topbar-breadcrumb">
          <span>Workspace</span>
          <span className="topbar-breadcrumb-sep">/</span>
          <span className="topbar-breadcrumb-current">{title}</span>
        </div>
        <div className="topbar-page-name">{title}</div>
      </div>

      <div className="topbar-actions">
        <form action="/deals" method="get" className="topbar-search-form">
          <span className="topbar-search-icon"><SearchIcon /></span>
          <input
            type="search"
            name="search"
            placeholder="Search deals, contacts…"
            className="topbar-search-input"
          />
        </form>

        <Link href="/deals/new" className="btn btn-primary btn-sm topbar-new-btn">
          <PlusIcon />
          New Deal
        </Link>

        <button className="topbar-icon-btn" title="Notifications" aria-label="Notifications">
          <BellIcon />
          <span className="topbar-notif-dot" />
        </button>

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

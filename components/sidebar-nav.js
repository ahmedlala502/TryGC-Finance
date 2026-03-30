"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    title: "Workspace",
    items: [
      { href: "/", label: "Dashboard", icon: "◫" },
      { href: "/deals", label: "Deals", icon: "◩" },
      { href: "/deals/kanban", label: "Kanban", icon: "⋮" },
      { href: "/accounts", label: "Accounts", icon: "◎" }
    ]
  },
  {
    title: "Operations",
    items: [
      { href: "/performance", label: "Performance", icon: "↗" },
      { href: "/targets", label: "Targets", icon: "◉" },
      { href: "/import", label: "Templates", icon: "⇪" },
      { href: "/export", label: "Export", icon: "⇩" },
      { href: "/audit", label: "Audit", icon: "⌘" }
    ]
  },
  {
    title: "Admin",
    items: [
      { href: "/users", label: "Users", icon: "◎" },
      { href: "/stages", label: "Stages", icon: "≡" },
      { href: "/custom-fields", label: "Fields", icon: "⌗" },
      { href: "/settings", label: "Settings", icon: "◌" }
    ]
  }
];

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="sidebar-nav">
      {navGroups.map((group) => (
        <div key={group.title} className="nav-group">
          <div className="nav-group-title">{group.title}</div>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(pathname, item.href) ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function ExportPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Export</h1>
          <p className="page-subtitle">Download current CRM data as Excel workbooks from the Next.js build.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Deals Export</span>
          </div>
          <div className="card-body">
            <p style={{ marginBottom: 16 }}>Current active deals with account, stage, owner, dates, and value fields.</p>
            <a href="/api/export/deals" className="btn btn-primary">
              Download Deals
            </a>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Performance Export</span>
          </div>
          <div className="card-body">
            <p style={{ marginBottom: 16 }}>Rep-level output totals with close-rate and revenue metrics.</p>
            <a href="/api/export/performance" className="btn btn-warning">
              Download Performance
            </a>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Workspace Workbook</span>
          </div>
          <div className="card-body">
            <p style={{ marginBottom: 16 }}>
              Bulk download a combined workbook with deals, accounts, performance, targets, audit logs, settings, and admin-only users.
            </p>
            <a href="/api/export/workspace" className="btn btn-primary">
              Download Workspace Pack
            </a>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Users Export</span>
          </div>
          <div className="card-body">
            <p style={{ marginBottom: 16 }}>
              Admin-only export with role, activity, deal counts, and login visibility across the workspace.
            </p>
            <a href="/api/export/users" className="btn btn-outline-secondary">
              Download Users
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { ExportClient } from "./export-client";

export default async function ExportPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <AppShell user={user}>
      <div className="page-header" style={{ marginBottom: 22 }}>
        <div>
          <h1 className="page-title">Export Reports</h1>
          <p className="page-subtitle">
            Download your CRM data in PDF, Excel, or CSV — stakeholder-ready in one click.
          </p>
        </div>
        <div className="page-header-actions">
          <span className="badge badge-primary">PDF · Excel · CSV</span>
        </div>
      </div>

      <ExportClient userRole={user.role} />
    </AppShell>
  );
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getAuditEntries } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { AppShell } from "@/components/app-shell";

export default async function AuditPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["admin", "manager"].includes(user.role)) redirect("/");

  const rows = getAuditEntries(80);

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Trail</h1>
          <p className="page-subtitle">Recent create, update, import, export, and status-change activity.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.timestamp)}</td>
                    <td>{row.user_name || "System"}</td>
                    <td>{row.action}</td>
                    <td>
                      {row.entity_type || "—"}
                      {row.entity_id ? ` #${row.entity_id}` : ""}
                    </td>
                    <td>{row.detail || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

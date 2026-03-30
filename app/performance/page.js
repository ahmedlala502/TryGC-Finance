import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getPerformanceRows } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { AppShell } from "@/components/app-shell";

export default async function PerformancePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const rows = getPerformanceRows();

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance</h1>
          <p className="page-subtitle">Rep-level output generated from live deal history.</p>
        </div>
        <a href="/api/export/performance" className="btn btn-outline-secondary btn-sm">
          Export
        </a>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rep</th>
                  <th>Role</th>
                  <th>Total</th>
                  <th>Open</th>
                  <th>Won</th>
                  <th>Lost</th>
                  <th>Revenue</th>
                  <th>Close Rate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.role}</td>
                    <td>{row.total_deals}</td>
                    <td>{row.open_deals}</td>
                    <td>{row.won_deals}</td>
                    <td>{row.lost_deals}</td>
                    <td>{formatCurrency(row.revenue)}</td>
                    <td>{row.close_rate.toFixed(1)}%</td>
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

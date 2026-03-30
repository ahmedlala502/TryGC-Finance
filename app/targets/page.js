import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getTargets } from "@/lib/data";
import { AppShell } from "@/components/app-shell";

const metrics = ["revenue", "deals", "meetings", "quotations", "opportunities"];

export default async function TargetsPage({ searchParams }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const { month, rows, users } = getTargets(params?.month);

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Targets</h1>
          <p className="page-subtitle">Monthly targets stored in the shared CRM database.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Current Targets · {month}</span>
          </div>
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Metric</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.user_name}</td>
                      <td>{row.metric}</td>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Set Target</span>
          </div>
          <div className="card-body">
            <form method="post" action="/api/targets" style={{ display: "grid", gap: 12 }}>
              <div className="form-group">
                <label>Month</label>
                <input name="month" type="month" defaultValue={month} />
              </div>
              <div className="form-group">
                <label>User</label>
                <select name="user_id" defaultValue={users[0]?.id || ""}>
                  {users.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Metric</label>
                <select name="metric" defaultValue={metrics[0]}>
                  {metrics.map((metric) => (
                    <option key={metric} value={metric}>
                      {metric}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Value</label>
                <input name="value" type="number" step="0.01" required />
              </div>
              <button type="submit" className="btn btn-primary">
                Save Target
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

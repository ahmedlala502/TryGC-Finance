import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getActiveStages, getActiveUsers, getWorkspaceConfig, listAccounts, listDeals } from "@/lib/data";
import { AppShell } from "@/components/app-shell";
import { DealsTable } from "@/components/deals-table";

export default async function DealsPage({ searchParams }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const filters = {
    search: params?.search || "",
    status: params?.status || "",
    stageId: params?.stage_id || "",
    ownerId: params?.owner_id || ""
  };
  const deals = listDeals(user, filters);
  const stages = getActiveStages();
  const owners = getActiveUsers();
  const accounts = listAccounts({ role: "admin" });
  const settings = getWorkspaceConfig();

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Deals</h1>
          <p className="page-subtitle">Pipeline table on the shared CRM database.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/deals/kanban" className="btn btn-outline-secondary btn-sm">
            Kanban
          </Link>
          <Link href="/deals/new" className="btn btn-primary">
            + New Deal
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <form method="get" action="/deals" style={{ display: "grid", gap: 14 }}>
            <div className="form-row">
              <div className="form-group">
                <label>Search</label>
                <input name="search" defaultValue={filters.search} placeholder="Deal, contact, email" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" defaultValue={filters.status}>
                  <option value="">All statuses</option>
                  {["open", "won", "lost"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Stage</label>
                <select name="stage_id" defaultValue={filters.stageId}>
                  <option value="">All stages</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Owner</label>
                <select name="owner_id" defaultValue={filters.ownerId} disabled={user.role === "sales"}>
                  <option value="">All owners</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Apply Filters
              </button>
              <Link href="/deals" className="btn btn-outline-secondary btn-sm">
                Reset
              </Link>
              <div className="topbar-chip" style={{ minWidth: 0 }}>
                <span className="topbar-chip-label">Visible Deals</span>
                <strong>{deals.length}</strong>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <DealsTable deals={deals} stages={stages} owners={owners} accounts={accounts} settings={settings} user={user} />
        </div>
      </div>
    </AppShell>
  );
}

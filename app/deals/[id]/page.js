import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getActiveStages, getActiveUsers, getDealById, getWorkspaceConfig, listAccounts } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { AppShell } from "@/components/app-shell";
import { CustomFieldInputs } from "@/components/custom-field-inputs";

export default async function DealDetailPage({ params }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const payload = getDealById(user, Number(id));
  if (!payload) notFound();

  const { deal, auditEntries, customFields } = payload;
  const stages = getActiveStages();
  const users = getActiveUsers();
  const accounts = listAccounts({ role: "admin" });
  const settings = getWorkspaceConfig();
  const isViewer = user.role === "viewer";
  const canDelete = ["admin", "manager"].includes(user.role);

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{deal.title}</h1>
          <p className="page-subtitle">
            {deal.account_name || "No account"} · {deal.stage_name || deal.status}
          </p>
        </div>
        {!isViewer && (
          <div style={{ display: "flex", gap: 12 }}>
            <form method="post" action={`/api/deals/${deal.id}/status`}>
              <input type="hidden" name="action" value="won" />
              <button type="submit" className="btn btn-success btn-sm">Mark Won</button>
            </form>
            <form method="post" action={`/api/deals/${deal.id}/status`}>
              <input type="hidden" name="action" value="lost" />
              <button type="submit" className="btn btn-warning btn-sm">Mark Lost</button>
            </form>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Deal Details</span>
          </div>
          <div className="card-body">
            {isViewer && <div className="readonly-notice">👁 You have view-only access. Contact an admin to make changes.</div>}
            <form method="post" action={`/api/deals/${deal.id}`} style={{ display: "grid", gap: 16 }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Deal Title</label>
                  <input name="title" defaultValue={deal.title} required disabled={isViewer} />
                </div>
                <div className="form-group">
                  <label>Account</label>
                  <select name="account_id" defaultValue={deal.account_id || ""} disabled={isViewer}>
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact</label>
                  <input name="contact_name" defaultValue={deal.contact_name || ""} disabled={isViewer} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" defaultValue={deal.email || ""} disabled={isViewer} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" defaultValue={deal.phone || ""} disabled={isViewer} />
                </div>
                <div className="form-group">
                  <label>Expected Value</label>
                  <input name="expected_value" type="number" step="0.01" defaultValue={deal.expected_value || 0} disabled={isViewer} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Business Type</label>
                  <select name="business_type" defaultValue={deal.business_type || settings.business_types[0] || ""} disabled={isViewer}>
                    {settings.business_types.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Source</label>
                  <select name="source" defaultValue={deal.source || settings.lead_sources[0] || ""} disabled={isViewer}>
                    {settings.lead_sources.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stage</label>
                  <select name="stage_id" defaultValue={deal.stage_id || ""} disabled={isViewer}>
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assigned To</label>
                  <select name="assigned_to" defaultValue={deal.assigned_to || user.id} disabled={isViewer}>
                    {users.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expected Close Date</label>
                  <input name="expected_close_date" type="date" defaultValue={deal.expected_close_date || ""} disabled={isViewer} />
                </div>
                <div className="form-group">
                  <label>Follow Up Date</label>
                  <input name="follow_up_date" type="date" defaultValue={deal.follow_up_date || ""} disabled={isViewer} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" defaultValue={deal.priority || (settings.priorities.includes("Medium") ? "Medium" : settings.priorities[0])} disabled={isViewer}>
                    {settings.priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Market</label>
                  <select name="market" defaultValue={deal.market || settings.markets[0] || ""} disabled={isViewer}>
                    {settings.markets.map((market) => (
                      <option key={market} value={market}>
                        {market}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" rows={5} defaultValue={deal.notes || ""} disabled={isViewer} />
              </div>

              <CustomFieldInputs fields={customFields} />

              {!isViewer && (
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                  {canDelete && (
                    <button type="submit" name="action" value="delete" className="btn btn-danger">
                      Delete Deal
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Summary</span>
            </div>
            <div className="card-body" style={{ display: "grid", gap: 8 }}>
              <div>Status: {deal.status}</div>
              <div>Priority: {deal.priority || "Medium"}</div>
              <div>Market: {deal.market || "—"}</div>
              <div>Expected: {formatCurrency(deal.expected_value)}</div>
              <div>Closed: {formatCurrency(deal.closed_value)}</div>
              <div>Updated: {formatDate(deal.updated_at)}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Audit</span>
            </div>
            <div className="card-body" style={{ display: "grid", gap: 10 }}>
              {auditEntries.map((entry) => (
                <div key={entry.id} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 10 }}>
                  <div style={{ fontWeight: 700 }}>{entry.action}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>{entry.detail}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11 }}>
                    {entry.user_name || "System"} · {formatDate(entry.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

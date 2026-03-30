import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getActiveStages, getActiveUsers, getCustomFieldDefinitions, getWorkspaceConfig, listAccounts } from "@/lib/data";
import { AppShell } from "@/components/app-shell";
import { CustomFieldInputs } from "@/components/custom-field-inputs";

export default async function NewDealPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "viewer") redirect("/deals");

  const stages = getActiveStages().filter((stage) => stage.type === "open");
  const users = getActiveUsers();
  const accounts = listAccounts({ role: "admin" });
  const settings = getWorkspaceConfig();
  const customFields = getCustomFieldDefinitions("deal");

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Deal</h1>
          <p className="page-subtitle">Create a new deal in the Next.js CRM.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form method="post" action="/api/deals" style={{ display: "grid", gap: 16 }}>
            <div className="form-row">
              <div className="form-group">
                <label>Deal Title</label>
                <input name="title" required />
              </div>
              <div className="form-group">
                <label>Account</label>
                <select name="account_id" defaultValue="">
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
                <label>Contact Name</label>
                <input name="contact_name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" />
              </div>
              <div className="form-group">
                <label>Expected Value</label>
                <input name="expected_value" type="number" step="0.01" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Business Type</label>
                <select name="business_type" defaultValue={settings.business_types[0] || ""}>
                  {settings.business_types.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Source</label>
                <select name="source" defaultValue={settings.lead_sources[0] || ""}>
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
                <select name="stage_id" defaultValue={stages[0]?.id || ""}>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Assigned To</label>
                <select name="assigned_to" defaultValue={user.id}>
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
                <input name="expected_close_date" type="date" />
              </div>
              <div className="form-group">
                <label>Follow Up Date</label>
                <input name="follow_up_date" type="date" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" defaultValue={settings.priorities.includes("Medium") ? "Medium" : settings.priorities[0]}>
                  {settings.priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Market</label>
                <select name="market" defaultValue={settings.markets[0] || ""}>
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
              <textarea name="notes" rows={4} />
            </div>

            <CustomFieldInputs fields={customFields} />

            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="btn btn-primary">
                Save Deal
              </button>
              <Link href="/deals" className="btn btn-outline-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

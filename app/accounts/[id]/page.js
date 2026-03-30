import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getAccountById, getActiveUsers } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { AppShell } from "@/components/app-shell";
import { CustomFieldInputs } from "@/components/custom-field-inputs";

export default async function AccountDetailPage({ params }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const payload = getAccountById(user, Number(id));
  if (!payload) notFound();

  const { account, deals, customFields } = payload;
  const users = getActiveUsers();

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{account.name}</h1>
          <p className="page-subtitle">{account.industry || "No industry"}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Account Details</span>
          </div>
          <div className="card-body">
            <form method="post" action={`/api/accounts/${account.id}`} style={{ display: "grid", gap: 12 }}>
              <div className="form-group">
                <label>Name</label>
                <input name="name" defaultValue={account.name} required />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input name="industry" defaultValue={account.industry || ""} />
              </div>
              <div className="form-group">
                <label>Contact Name</label>
                <input name="contact_name" defaultValue={account.contact_name || ""} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" defaultValue={account.email || ""} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" defaultValue={account.phone || ""} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input name="location" defaultValue={account.location || ""} />
              </div>
              <div className="form-group">
                <label>Assigned To</label>
                <select name="assigned_to" defaultValue={account.assigned_to || user.id}>
                  {users.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" rows={4} defaultValue={account.notes || ""} />
              </div>
              <CustomFieldInputs fields={customFields} title="Account Custom Fields" />
              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" className="btn btn-primary">
                  Save Account
                </button>
                <button type="submit" name="action" value="delete" className="btn btn-danger">
                  Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Related Deals</span>
          </div>
          <div className="card-body" style={{ display: "grid", gap: 12 }}>
            {deals.map((deal) => (
              <div key={deal.id} style={{ border: "1px solid var(--border-color)", borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700 }}>{deal.title}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>{deal.status}</div>
                <div style={{ fontSize: 12 }}>{formatCurrency(deal.expected_value)}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatDate(deal.updated_at)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

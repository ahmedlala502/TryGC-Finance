import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getActiveUsers, getCustomFieldDefinitions, listAccounts } from "@/lib/data";
import { AppShell } from "@/components/app-shell";
import { CustomFieldInputs } from "@/components/custom-field-inputs";

export default async function AccountsPage({ searchParams }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const search = params?.search || "";
  const accounts = listAccounts(user, { search });
  const users = getActiveUsers();
  const customFields = getCustomFieldDefinitions("account");

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">Customer accounts tied to deals and owners.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.8fr", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Account Directory</span>
            <form method="get" action="/accounts" style={{ display: "flex", gap: 8 }}>
              <input name="search" defaultValue={search} placeholder="Search account, industry, contact" />
              <button type="submit" className="btn btn-outline-secondary btn-sm">
                Search
              </button>
            </form>
          </div>
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Industry</th>
                    <th>Contact</th>
                    <th>Owner</th>
                    <th>Deals</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id}>
                      <td>
                        <Link href={`/accounts/${account.id}`}>{account.name}</Link>
                      </td>
                      <td>{account.industry || "—"}</td>
                      <td>{account.contact_name || "—"}</td>
                      <td>{account.assignee_name || "—"}</td>
                      <td>{account.active_deals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">New Account</span>
          </div>
          <div className="card-body">
            <form method="post" action="/api/accounts" style={{ display: "grid", gap: 12 }}>
              <div className="form-group">
                <label>Name</label>
                <input name="name" required />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input name="industry" />
              </div>
              <div className="form-group">
                <label>Contact Name</label>
                <input name="contact_name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input name="location" />
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
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" rows={4} />
              </div>
              <CustomFieldInputs fields={customFields} title="Account Custom Fields" />
              <button type="submit" className="btn btn-primary">
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

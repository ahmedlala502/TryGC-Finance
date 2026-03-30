import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getWorkspaceConfig } from "@/lib/data";
import { AppShell } from "@/components/app-shell";

function listToText(values) {
  return values.join(", ");
}

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["admin", "manager"].includes(user.role)) redirect("/");

  const settings = getWorkspaceConfig();

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspace Settings</h1>
          <p className="page-subtitle">Customize naming, dropdown lists, and operational defaults across the CRM.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Workspace Configuration</span>
        </div>
        <div className="card-body">
          <form method="post" action="/api/settings" style={{ display: "grid", gap: 18 }}>
            <div className="form-row">
              <div className="form-group">
                <label>System Name</label>
                <input name="system_name" defaultValue={settings.system_name} />
              </div>
              <div className="form-group">
                <label>Currency</label>
                <input name="currency" defaultValue={settings.currency} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date Format</label>
                <input name="date_format" defaultValue={settings.date_format} />
              </div>
              <div className="form-group">
                <label>Markets</label>
                <textarea name="markets" rows={3} defaultValue={listToText(settings.markets)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Business Types</label>
                <textarea name="business_types" rows={4} defaultValue={listToText(settings.business_types)} />
              </div>
              <div className="form-group">
                <label>Lead Sources</label>
                <textarea name="lead_sources" rows={4} defaultValue={listToText(settings.lead_sources)} />
              </div>
            </div>

            <div className="form-group">
              <label>Priorities</label>
              <textarea name="priorities" rows={3} defaultValue={listToText(settings.priorities)} />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="btn btn-primary">
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

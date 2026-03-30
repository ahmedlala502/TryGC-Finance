import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getWorkspaceConfig } from "@/lib/data";

export default async function LoginPage({ searchParams }) {
  const user = await getSessionUser();
  if (user) {
    redirect("/");
  }

  const error = (await searchParams)?.error;
  const workspace = getWorkspaceConfig();

  return (
    <div className="auth-shell">
      <main className="auth-grid">
        <section className="auth-panel auth-showcase">
          <div className="auth-chip">
            <span className="status-dot" />
            Premium operating surface
          </div>

          <div className="brand-copy login-brand-copy">
            <div className="logo-text login-brand-name">{workspace.system_name}</div>
            <div className="login-brand-caption">{workspace.workspace_tagline}</div>
          </div>

          <div>
            <h1 className="auth-title">Faster pipeline control with cleaner signal and stronger contrast.</h1>
            <p className="auth-copy">
              The interface now runs on a sharper dark and light theme system, a faster shell, and a clearer dashboard composition that keeps reporting and execution in the same flow.
            </p>
          </div>

          <div className="auth-metric-grid">
            <div className="auth-metric">
              <div className="auth-metric-label">Visibility</div>
              <div className="auth-metric-value">Live pipeline pressure</div>
            </div>
            <div className="auth-metric">
              <div className="auth-metric-label">Speed</div>
              <div className="auth-metric-value">Keyboard command center</div>
            </div>
            <div className="auth-metric">
              <div className="auth-metric-label">Theme</div>
              <div className="auth-metric-value">Dark and light ready</div>
            </div>
          </div>

          <div className="auth-status">
            Workspace services are ready. Sign in to open dashboards, pipeline tools, templates, and executive reporting.
          </div>
        </section>

        <section className="auth-panel auth-form-panel">
          <div>
            <h2 className="auth-title" style={{ fontSize: "2.15rem", maxWidth: "none" }}>Sign in</h2>
            <p className="auth-copy" style={{ marginTop: 8 }}>
              Enter your credentials to access {workspace.system_name}.
            </p>
          </div>

          {error ? (
            <div className="flash flash-danger" style={{ marginTop: 18 }}>
              <span>{error}</span>
            </div>
          ) : null}

          <form method="post" action="/api/login" style={{ display: "grid", gap: 18, marginTop: 22 }}>
            <div className="form-group">
              <label htmlFor="email">Business email</label>
              <input id="email" name="email" type="email" required placeholder="name@company.com" />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required placeholder="••••••••••••" />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
              <input type="checkbox" name="remember" />
              Remember this device
            </label>

            <button type="submit" className="btn btn-primary w-100" style={{ justifyContent: "center" }}>
              Enter dashboard
            </button>
          </form>

          <div className="auth-demo-list">
            <div className="auth-demo-item">
              <div className="auth-demo-label">Admin access</div>
              <div className="auth-demo-value">admin@local</div>
              <div className="auth-demo-pass">Admin@12345</div>
            </div>
            <div className="auth-demo-item">
              <div className="auth-demo-label">Manager access</div>
              <div className="auth-demo-value">manager@local</div>
              <div className="auth-demo-pass">Manager@12345</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

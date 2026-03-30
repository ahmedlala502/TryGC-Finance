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
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at top left, rgba(218,226,253,0.9), transparent 32%), radial-gradient(circle at top right, rgba(211,228,254,0.85), transparent 30%), linear-gradient(180deg, #f8f9ff 0%, #eff4ff 100%)"
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: 1040,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          position: "relative"
        }}
      >
        <section
          className="card hero-panel"
          style={{ padding: 40, display: "grid", gap: 18, minHeight: 620, alignContent: "space-between" }}
        >
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
              <div className="logo-icon" style={{ width: 54, height: 54, fontSize: 24 }}>
                S
              </div>
              <div>
                <div className="logo-text" style={{ color: "var(--text-primary)", fontSize: 28 }}>
                  {workspace.system_name}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Precision Management for National Operations
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                Architectural CRM
              </div>
              <h1 style={{ fontFamily: "var(--font-headline)", fontSize: 52, lineHeight: 1.02, letterSpacing: "-0.04em" }}>
                Executive-grade sales operations, rebuilt in Next.js.
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 460 }}>
                The workspace now supports richer insights, workbook templates, editable CRM records, and admin controls without breaking the existing SQLite data.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
              {[
                ["Secure 256-bit", "verified_user"],
                ["Real-time sync", "analytics"],
                ["Priority ops", "support_agent"]
              ].map(([label, icon]) => (
                <div key={label} className="card" style={{ padding: 16, background: "rgba(255,255,255,0.65)" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{icon === "verified_user" ? "✓" : icon === "analytics" ? "↗" : "◎"}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="topbar-chip" style={{ minWidth: 0, maxWidth: 360 }}>
            <span className="topbar-chip-label">Operations status</span>
            <strong>All systems nominal</strong>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              Core pipeline engine is active and the shared SQLite workspace is ready for use.
            </span>
          </div>
        </section>

        <section className="card" style={{ padding: 34, alignSelf: "center", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(18px)" }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: 28, fontWeight: 800 }}>Sign In</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: 6 }}>
              Enter credentials to access {workspace.system_name}.
            </p>
          </div>

          {error ? (
            <div className="flash flash-danger" style={{ marginBottom: 16 }}>
              <span>{error}</span>
            </div>
          ) : null}

          <form method="post" action="/api/login" style={{ display: "grid", gap: 18 }}>
            <div className="form-group">
              <label htmlFor="email">Business Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@company.com"
                style={{ background: "var(--surface-container-low)" }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Security Key</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••••••"
                style={{ background: "var(--surface-container-low)" }}
              />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
              <input type="checkbox" name="remember" />
              Remember this device
            </label>

            <button type="submit" className="btn btn-primary w-100" style={{ justifyContent: "center", padding: "14px 18px" }}>
              Enter Dashboard
            </button>
          </form>

          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(198,198,205,0.4)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                Demo access
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(198,198,205,0.4)" }} />
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div className="topbar-chip" style={{ minWidth: 0 }}>
                <span className="topbar-chip-label">Admin</span>
                <strong>admin@local</strong>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Admin@12345</span>
              </div>

              <div className="topbar-chip" style={{ minWidth: 0 }}>
                <span className="topbar-chip-label">Manager</span>
                <strong>manager@local</strong>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Manager@12345</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

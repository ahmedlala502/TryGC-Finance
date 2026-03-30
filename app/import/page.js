import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getWorkbookTemplateInsights } from "@/lib/template-insights";
import { AppShell } from "@/components/app-shell";
import { ImportClient } from "./import-client";

export default async function ImportPage({ searchParams }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const templates = getWorkbookTemplateInsights();
  const params    = await searchParams;
  const analyzed  = params?.analyzed  || "";
  const created   = params?.created   || "";
  const registered = params?.registered || "";
  const errors    = params?.errors    || "";

  return (
    <AppShell user={user}>
      <div className="page-header" style={{ marginBottom: 22 }}>
        <div>
          <h1 className="page-title">Import & Templates</h1>
          <p className="page-subtitle">
            Upload CSV or Excel files — pipeline data goes into deals, commission sheets register as templates.
          </p>
        </div>
        <div className="page-header-actions">
          <span className="badge badge-secondary" style={{ fontSize: 11 }}>
            Supports .xlsx · .xls · .csv
          </span>
        </div>
      </div>

      {/* Result banner */}
      {(analyzed || created || registered || errors) && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            border: "1px solid rgba(16,185,129,0.2)",
            background: "rgba(16,185,129,0.05)"
          }}
        >
          <div className="card-body" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>✓</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Import completed</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
              {[
                { label: "Files Analyzed", value: analyzed || 0, color: "#a5b4fc" },
                { label: "Deals Created",  value: created  || 0, color: "#6ee7b7" },
                { label: "Templates",      value: registered || 0, color: "#fcd34d" },
                { label: "Errors",         value: errors   || 0, color: errors > 0 ? "#fca5a5" : "var(--text-muted)" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 4 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "var(--font-headline)", letterSpacing: "-0.03em" }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Client-side drag-and-drop uploader */}
      <ImportClient />

      {/* Template library */}
      {templates.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "var(--font-headline)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              Template Library
            </h2>
            <span className="badge badge-secondary">{templates.length} templates</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
            {templates.map((template) => (
              <div key={template.slug} className="card">
                <div className="card-header">
                  <span className="card-title">{template.title}</span>
                  <span className="badge badge-info">{template.sheetCount} sheets</span>
                </div>
                <div className="card-body" style={{ display: "grid", gap: 14 }}>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>Source file</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{template.sourceFile}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>Purpose</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{template.purpose}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 6 }}>Detection criteria</div>
                    <ul style={{ display: "grid", gap: 4 }}>
                      {template.criteria.map((c) => (
                        <li key={c} style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: 6 }}>
                          <span style={{ color: "var(--accent-light)", marginTop: 1 }}>›</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 6 }}>Sheets</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                      {template.sheetNames.map((sheet) => (
                        <span key={sheet} className="badge badge-secondary" style={{ fontSize: 10.5 }}>
                          {sheet}
                        </span>
                      ))}
                    </div>
                    <div className="table-wrapper" style={{ border: "1px solid var(--border-color)", borderRadius: 8 }}>
                      <table>
                        <tbody>
                          {template.preview.map((row, i) => (
                            <tr key={`${template.slug}-${i}`}>
                              {row.slice(0, 4).map((cell, j) => (
                                <td key={j} style={{ fontSize: 11.5 }}>{String(cell || "—").slice(0, 28)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ background: "rgba(0,0,0,0.18)", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 8 }}>Field mapping</div>
                    <div style={{ display: "grid", gap: 5 }}>
                      {Object.entries(template.recommendedMapping).map(([field, source]) => (
                        <div key={field} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
                          <strong style={{ color: "var(--accent-light)" }}>{field}</strong>
                          <span style={{ color: "var(--text-secondary)" }}>{source}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={`/api/templates/${template.slug}/download`}
                    className="btn btn-outline-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    ↓ Download Template
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

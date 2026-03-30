import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getWorkbookTemplateInsights } from "@/lib/template-insights";
import { AppShell } from "@/components/app-shell";

export default async function ImportPage({ searchParams }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const templates = getWorkbookTemplateInsights();
  const params = await searchParams;
  const analyzed = params?.analyzed || "";
  const created = params?.created || "";
  const registered = params?.registered || "";
  const errors = params?.errors || "";

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Import Templates</h1>
          <p className="page-subtitle">
            The uploaded workbooks have been classified into two reusable templates by workbook purpose.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Bulk Upload</span>
          <span className="badge badge-secondary">Multi-file ingestion</span>
        </div>
        <div className="card-body" style={{ display: "grid", gap: 16 }}>
          <p style={{ color: "var(--text-secondary)", maxWidth: 720 }}>
            Upload multiple Excel workbooks at once. Pipeline workbooks are imported into deals using sheet-aware mapping. Commission workbooks are analyzed and registered as planning templates.
          </p>

          <form method="post" action="/api/import/bulk" encType="multipart/form-data" style={{ display: "grid", gap: 14 }}>
            <div className="form-group">
              <label>Files</label>
              <input name="files" type="file" accept=".xlsx,.xls,.csv" multiple />
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button type="submit" className="btn btn-primary">
                Run Bulk Import
              </button>
              <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                Supported: sales pipeline workbooks and commission/target planning matrices.
              </div>
            </div>
          </form>

          {analyzed || created || registered || errors ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
              <div className="topbar-chip" style={{ minWidth: 0 }}>
                <span className="topbar-chip-label">Analyzed Files</span>
                <strong>{analyzed || 0}</strong>
              </div>
              <div className="topbar-chip" style={{ minWidth: 0 }}>
                <span className="topbar-chip-label">Deals Created</span>
                <strong>{created || 0}</strong>
              </div>
              <div className="topbar-chip" style={{ minWidth: 0 }}>
                <span className="topbar-chip-label">Templates Registered</span>
                <strong>{registered || 0}</strong>
              </div>
              <div className="topbar-chip" style={{ minWidth: 0 }}>
                <span className="topbar-chip-label">Errors</span>
                <strong>{errors || 0}</strong>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {templates.map((template) => (
          <div key={template.slug} className="card">
            <div className="card-header">
              <span className="card-title">{template.title}</span>
              <span className="badge badge-secondary">{template.sheetCount} sheets</span>
            </div>
            <div className="card-body" style={{ display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Source file</div>
                <div style={{ fontWeight: 700 }}>{template.sourceFile}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Purpose</div>
                <div>{template.purpose}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Detection criteria</div>
                <ul style={{ listStyle: "disc", paddingLeft: 18 }}>
                  {template.criteria.map((criterion) => (
                    <li key={criterion}>{criterion}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Workbook glimpse</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {template.sheetNames.map((sheet) => (
                    <span key={sheet} className="badge badge-secondary">
                      {sheet}
                    </span>
                  ))}
                </div>
                <div className="table-wrapper">
                  <table>
                    <tbody>
                      {template.preview.map((row, index) => (
                        <tr key={`${template.slug}-${index}`}>
                          {row.slice(0, 4).map((cell, cellIndex) => (
                            <td key={cellIndex}>{String(cell || "—").slice(0, 32)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Suggested mapping</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {Object.entries(template.recommendedMapping).map(([field, source]) => (
                    <div key={field} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <strong>{field}</strong>
                      <span style={{ color: "var(--text-secondary)" }}>{source}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a href={`/api/templates/${template.slug}/download`} className="btn btn-primary">
                Download Template
              </a>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

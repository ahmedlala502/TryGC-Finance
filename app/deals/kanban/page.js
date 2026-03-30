import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listDealsByStage } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { AppShell } from "@/components/app-shell";

export default async function DealsKanbanPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const stages = listDealsByStage(user);

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kanban</h1>
          <p className="page-subtitle">Open deals grouped by active pipeline stages.</p>
        </div>
        <Link href="/deals" className="btn btn-outline-secondary btn-sm">
          Table View
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {stages.map((stage) => (
          <div key={stage.id} className="card">
            <div className="card-header" style={{ borderTop: `4px solid ${stage.color}` }}>
              <span className="card-title">{stage.name}</span>
              <span className="badge badge-secondary">{stage.deals.length}</span>
            </div>
            <div className="card-body" style={{ display: "grid", gap: 12 }}>
              {stage.deals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  style={{ border: "1px solid var(--border-color)", borderRadius: 10, padding: 12, background: "#fff" }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{deal.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
                    {deal.account_name || "No account"}
                  </div>
                  <div style={{ fontSize: 12 }}>{formatCurrency(deal.expected_value)}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

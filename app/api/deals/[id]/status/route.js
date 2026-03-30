import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { asNullableNumber, recordAudit } from "@/lib/mutations";

export async function POST(request, { params }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const { id } = await params;
  const dealId = Number(id);
  const deal = get("select id, title, assigned_to, expected_value from deals where id = ?", dealId);
  if (!deal) {
    return NextResponse.redirect(new URL("/deals", request.url), 303);
  }
  if (user.role === "sales" && deal.assigned_to !== user.id) {
    return NextResponse.redirect(new URL("/deals", request.url), 303);
  }

  const formData = await request.formData();
  const action = String(formData.get("action") || "");

  if (action === "won") {
    const wonStage = get("select id from stages where type = 'won' limit 1");
    run(
      "update deals set status = 'won', stage_id = ?, closed_value = ?, updated_at = datetime('now') where id = ?",
      wonStage?.id || null,
      asNullableNumber(formData.get("closed_value")) ?? deal.expected_value ?? 0,
      dealId
    );
    recordAudit(user.id, "won", "deal", dealId, `Deal marked won: ${deal.title}`);
  } else if (action === "lost") {
    const lostStage = get("select id from stages where type = 'lost' limit 1");
    run(
      "update deals set status = 'lost', stage_id = ?, updated_at = datetime('now') where id = ?",
      lostStage?.id || null,
      dealId
    );
    recordAudit(user.id, "lost", "deal", dealId, `Deal marked lost: ${deal.title}`);
  } else if (action === "archive") {
    run("update deals set archived = case when archived = 1 then 0 else 1 end, updated_at = datetime('now') where id = ?", dealId);
    recordAudit(user.id, "archive", "deal", dealId, `Deal archive toggled: ${deal.title}`);
  }

  return NextResponse.redirect(new URL(`/deals/${dealId}`, request.url), 303);
}

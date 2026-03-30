import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { asDateString, asNullableNumber, asNullableText, deleteCustomFieldValues, getStageType, recordAudit, saveCustomFieldValues } from "@/lib/mutations";

export async function POST(request, { params }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const { id } = await params;
  const dealId = Number(id);
  const existing = get("select id, title, assigned_to from deals where id = ?", dealId);
  if (!existing) {
    return NextResponse.redirect(new URL("/deals", request.url), 303);
  }
  if (user.role === "sales" && existing.assigned_to !== user.id) {
    return NextResponse.redirect(new URL("/deals", request.url), 303);
  }

  const formData = await request.formData();
  if (formData.get("action") === "delete") {
    deleteCustomFieldValues("deal", dealId);
    run("delete from deals where id = ?", dealId);
    recordAudit(user.id, "delete", "deal", dealId, `Deal deleted: ${existing.title}`);
    return NextResponse.redirect(new URL("/deals", request.url), 303);
  }

  const stageId = Number(formData.get("stage_id") || 0) || null;
  const stage = stageId ? getStageType(stageId) : null;
  const title = String(formData.get("title") || existing.title).trim();

  run(
    `
      update deals
      set title = ?, account_id = ?, contact_name = ?, phone = ?, email = ?, business_type = ?, source = ?,
          assigned_to = ?, stage_id = ?, probability = ?, expected_value = ?, expected_close_date = ?, notes = ?,
          follow_up_date = ?, priority = ?, market = ?, updated_at = datetime('now')
      where id = ?
    `,
    title,
    asNullableNumber(formData.get("account_id")),
    asNullableText(formData.get("contact_name")),
    asNullableText(formData.get("phone")),
    asNullableText(formData.get("email")),
    asNullableText(formData.get("business_type")),
    asNullableText(formData.get("source")),
    Number(formData.get("assigned_to") || existing.assigned_to || user.id),
    stageId,
    stage?.probability ?? 50,
    asNullableNumber(formData.get("expected_value")) ?? 0,
    asDateString(formData.get("expected_close_date")),
    asNullableText(formData.get("notes")),
    asDateString(formData.get("follow_up_date")),
    asNullableText(formData.get("priority")) || "Medium",
    asNullableText(formData.get("market")),
    dealId
  );

  saveCustomFieldValues(formData, "deal", dealId);
  recordAudit(user.id, "update", "deal", dealId, `Deal updated: ${title}`);
  return NextResponse.redirect(new URL(`/deals/${dealId}`, request.url), 303);
}

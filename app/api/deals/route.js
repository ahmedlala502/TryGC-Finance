import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { run } from "@/lib/db";
import { asDateString, asNullableNumber, asNullableText, getStageType, recordAudit, saveCustomFieldValues } from "@/lib/mutations";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();
  if (!title) {
    return NextResponse.redirect(new URL("/deals/new", request.url), 303);
  }

  const stageId = Number(formData.get("stage_id") || 0) || null;
  const stage = stageId ? getStageType(stageId) : null;
  const result = run(
    `
      insert into deals (
        title, account_id, contact_name, phone, email, business_type, source, assigned_to,
        stage_id, status, probability, expected_value, expected_close_date, notes,
        follow_up_date, priority, market, created_at, updated_at, archived
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 0)
    `,
    title,
    asNullableNumber(formData.get("account_id")),
    asNullableText(formData.get("contact_name")),
    asNullableText(formData.get("phone")),
    asNullableText(formData.get("email")),
    asNullableText(formData.get("business_type")),
    asNullableText(formData.get("source")),
    Number(formData.get("assigned_to") || user.id),
    stageId,
    stage?.probability ?? 50,
    asNullableNumber(formData.get("expected_value")) ?? 0,
    asDateString(formData.get("expected_close_date")),
    asNullableText(formData.get("notes")),
    asDateString(formData.get("follow_up_date")),
    asNullableText(formData.get("priority")) || "Medium",
    asNullableText(formData.get("market"))
  );

  const dealId = Number(result.lastInsertRowid);
  saveCustomFieldValues(formData, "deal", dealId);
  recordAudit(user.id, "create", "deal", dealId, `Deal created: ${title}`);
  return NextResponse.redirect(new URL(`/deals/${dealId}`, request.url), 303);
}

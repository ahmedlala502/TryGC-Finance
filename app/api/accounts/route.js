import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { run } from "@/lib/db";
import { asNullableText, asNullableNumber, recordAudit, saveCustomFieldValues } from "@/lib/mutations";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  if (!name) {
    return NextResponse.redirect(new URL("/accounts", request.url), 303);
  }

  const result = run(
    `
      insert into accounts (name, industry, contact_name, phone, email, location, assigned_to, notes, created_at)
      values (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `,
    name,
    asNullableText(formData.get("industry")),
    asNullableText(formData.get("contact_name")),
    asNullableText(formData.get("phone")),
    asNullableText(formData.get("email")),
    asNullableText(formData.get("location")),
    asNullableNumber(formData.get("assigned_to")) ?? user.id,
    asNullableText(formData.get("notes"))
  );

  const accountId = Number(result.lastInsertRowid);
  saveCustomFieldValues(formData, "account", accountId);
  recordAudit(user.id, "create", "account", accountId, `Account created: ${name}`);
  return NextResponse.redirect(new URL(`/accounts/${accountId}`, request.url), 303);
}

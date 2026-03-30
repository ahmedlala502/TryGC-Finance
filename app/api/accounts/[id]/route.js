import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { asNullableNumber, asNullableText, deleteCustomFieldValues, recordAudit, saveCustomFieldValues } from "@/lib/mutations";

export async function POST(request, { params }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const { id } = await params;
  const accountId = Number(id);
  const existing = get("select id, name, assigned_to from accounts where id = ?", accountId);
  if (!existing) {
    return NextResponse.redirect(new URL("/accounts", request.url), 303);
  }
  if (user.role === "sales" && existing.assigned_to !== user.id) {
    return NextResponse.redirect(new URL("/accounts", request.url), 303);
  }

  const formData = await request.formData();
  if (formData.get("action") === "delete") {
    deleteCustomFieldValues("account", accountId);
    run("delete from accounts where id = ?", accountId);
    recordAudit(user.id, "delete", "account", accountId, `Account deleted: ${existing.name}`);
    return NextResponse.redirect(new URL("/accounts", request.url), 303);
  }

  const name = String(formData.get("name") || existing.name).trim();
  run(
    `
      update accounts
      set name = ?, industry = ?, contact_name = ?, phone = ?, email = ?, location = ?, assigned_to = ?, notes = ?
      where id = ?
    `,
    name,
    asNullableText(formData.get("industry")),
    asNullableText(formData.get("contact_name")),
    asNullableText(formData.get("phone")),
    asNullableText(formData.get("email")),
    asNullableText(formData.get("location")),
    asNullableNumber(formData.get("assigned_to")) ?? existing.assigned_to,
    asNullableText(formData.get("notes")),
    accountId
  );

  saveCustomFieldValues(formData, "account", accountId);
  recordAudit(user.id, "update", "account", accountId, `Account updated: ${name}`);
  return NextResponse.redirect(new URL(`/accounts/${accountId}`, request.url), 303);
}

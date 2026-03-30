import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { asNullableText, recordAudit, toJsonOptions } from "@/lib/mutations";

export async function POST(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  if (!["admin", "manager"].includes(user.role)) return NextResponse.redirect(new URL("/", request.url), 303);

  const { id } = await params;
  const fieldId = Number(id);
  const existing = get("select id, name from custom_fields where id = ?", fieldId);
  if (!existing) return NextResponse.redirect(new URL("/custom-fields", request.url), 303);

  const formData = await request.formData();
  if (formData.get("action") === "delete") {
    run("delete from custom_field_values where custom_field_id = ?", fieldId);
    run("delete from custom_fields where id = ?", fieldId);
    recordAudit(user.id, "delete", "custom_field", fieldId, `Custom field deleted: ${existing.name}`);
    return NextResponse.redirect(new URL("/custom-fields", request.url), 303);
  }

  const entityType = String(formData.get("entity_type") || "deal").trim();
  const name = String(formData.get("name") || existing.name).trim();
  const fieldType = String(formData.get("field_type") || "text").trim();

  run(
    `
      update custom_fields
      set entity_type = ?, name = ?, field_type = ?, options = ?
      where id = ?
    `,
    entityType,
    name,
    fieldType,
    fieldType === "select" ? toJsonOptions(formData.get("options")) : asNullableText(null),
    fieldId
  );

  recordAudit(user.id, "update", "custom_field", fieldId, `Custom field updated: ${name}`);
  return NextResponse.redirect(new URL("/custom-fields", request.url), 303);
}

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { run } from "@/lib/db";
import { asNullableText, recordAudit, toJsonOptions } from "@/lib/mutations";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  if (!["admin", "manager"].includes(user.role)) return NextResponse.redirect(new URL("/", request.url), 303);

  const formData = await request.formData();
  const entityType = String(formData.get("entity_type") || "deal").trim();
  const name = String(formData.get("name") || "").trim();
  const fieldType = String(formData.get("field_type") || "text").trim();

  if (!name) return NextResponse.redirect(new URL("/custom-fields", request.url), 303);

  const result = run(
    `
      insert into custom_fields (entity_type, name, field_type, options)
      values (?, ?, ?, ?)
    `,
    entityType,
    name,
    fieldType,
    fieldType === "select" ? toJsonOptions(formData.get("options")) : asNullableText(null)
  );

  recordAudit(user.id, "create", "custom_field", Number(result.lastInsertRowid), `Custom field created: ${name}`);
  return NextResponse.redirect(new URL("/custom-fields", request.url), 303);
}

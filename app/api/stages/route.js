import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { asNumber, asNullableText, recordAudit } from "@/lib/mutations";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  if (!["admin", "manager"].includes(user.role)) return NextResponse.redirect(new URL("/", request.url), 303);

  const formData = await request.formData();
  const name = String(formData.get("name") || "New Stage").trim();
  const maxOrder = get("select coalesce(max(`order`), 0) as max_order from stages");

  const result = run(
    `
      insert into stages (name, color, probability, type, active, \`order\`)
      values (?, ?, ?, ?, 1, ?)
    `,
    name,
    asNullableText(formData.get("color")) || "#1d7a72",
    asNumber(formData.get("probability"), 50),
    asNullableText(formData.get("type")) || "open",
    Number(maxOrder?.max_order || 0) + 1
  );

  recordAudit(user.id, "create", "stage", Number(result.lastInsertRowid), `Stage created: ${name}`);
  return NextResponse.redirect(new URL("/stages", request.url), 303);
}

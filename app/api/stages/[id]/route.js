import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { asNumber, asNullableText, recordAudit } from "@/lib/mutations";

export async function POST(request, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);

  const { id } = await params;
  const stageId = Number(id);
  const existing = get("select id, name from stages where id = ?", stageId);
  if (!existing) return NextResponse.redirect(new URL("/stages", request.url), 303);
  if (!["admin", "manager"].includes(user.role)) return NextResponse.redirect(new URL("/", request.url), 303);

  const formData = await request.formData();
  const action = String(formData.get("action") || "");

  if (action === "delete") {
    if (user.role !== "admin") return NextResponse.redirect(new URL("/stages", request.url), 303);
    run("update deals set stage_id = null where stage_id = ?", stageId);
    run("delete from stages where id = ?", stageId);
    recordAudit(user.id, "delete", "stage", stageId, `Stage deleted: ${existing.name}`);
    return NextResponse.redirect(new URL("/stages", request.url), 303);
  }

  const name = String(formData.get("name") || existing.name).trim();
  run(
    `
      update stages
      set name = ?, color = ?, probability = ?, type = ?, active = ?
      where id = ?
    `,
    name,
    asNullableText(formData.get("color")) || "#1d7a72",
    asNumber(formData.get("probability"), 50),
    asNullableText(formData.get("type")) || "open",
    formData.has("active") ? 1 : 0,
    stageId
  );

  recordAudit(user.id, "update", "stage", stageId, `Stage updated: ${name}`);
  return NextResponse.redirect(new URL("/stages", request.url), 303);
}

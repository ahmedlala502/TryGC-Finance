import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { run } from "@/lib/db";
import { recordAudit } from "@/lib/mutations";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  if (!["admin", "manager"].includes(user.role)) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await request.json();
  const order = Array.isArray(body?.order) ? body.order : [];

  for (const item of order) {
    run("update stages set `order` = ? where id = ?", Number(item.order || 0), Number(item.id || 0));
  }

  recordAudit(user.id, "reorder", "stage", null, "Stages reordered");
  return NextResponse.json({ ok: true });
}

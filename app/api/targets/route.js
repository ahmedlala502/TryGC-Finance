import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { asNumber, recordAudit } from "@/lib/mutations";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const formData = await request.formData();
  const month = String(formData.get("month") || "").trim();
  const metric = String(formData.get("metric") || "").trim();
  const userId = Number(formData.get("user_id") || 0);
  const value = asNumber(formData.get("value"));

  const existing = get(
    "select id from targets where user_id = ? and month = ? and metric = ?",
    userId,
    month,
    metric
  );

  if (existing) {
    run("update targets set value = ? where id = ?", value, existing.id);
  } else {
    run("insert into targets (user_id, month, metric, value) values (?, ?, ?, ?)", userId, month, metric, value);
  }

  recordAudit(user.id, "target_update", "target", existing?.id || null, `Target saved for user ${userId} / ${metric} / ${month}`);
  return NextResponse.redirect(new URL(`/targets?month=${month}`, request.url), 303);
}

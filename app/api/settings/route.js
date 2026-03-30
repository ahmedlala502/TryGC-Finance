import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { run } from "@/lib/db";
import { recordAudit } from "@/lib/mutations";

function toJsonList(value) {
  return JSON.stringify(
    String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  if (!["admin", "manager"].includes(user.role)) return NextResponse.redirect(new URL("/", request.url), 303);

  const formData = await request.formData();
  const values = {
    system_name: String(formData.get("system_name") || "TryGc - Finance & Sales Dashboard"),
    currency: String(formData.get("currency") || "USD"),
    date_format: String(formData.get("date_format") || "%Y-%m-%d"),
    markets: toJsonList(formData.get("markets")),
    business_types: toJsonList(formData.get("business_types")),
    lead_sources: toJsonList(formData.get("lead_sources")),
    priorities: toJsonList(formData.get("priorities"))
  };

  for (const [key, value] of Object.entries(values)) {
    run(
      `
        insert into settings (key, value) values (?, ?)
        on conflict(key) do update set value = excluded.value
      `,
      key,
      value
    );
  }

  recordAudit(user.id, "settings_update", "setting", null, "Workspace settings updated");
  return NextResponse.redirect(new URL("/settings", request.url), 303);
}

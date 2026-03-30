import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listDeals } from "@/lib/data";

function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const str = String(v ?? "");
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))
  ];
  return lines.join("\r\n");
}

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const rows = listDeals(user).map((deal) => ({
    ID: deal.id,
    Title: deal.title,
    Account: deal.account_name || "",
    Stage: deal.stage_name || "",
    Status: deal.status,
    Priority: deal.priority || "",
    Owner: deal.assignee_name || "",
    ExpectedValue: deal.expected_value || 0,
    ClosedValue: deal.closed_value || 0,
    ExpectedCloseDate: deal.expected_close_date || "",
    FollowUpDate: deal.follow_up_date || "",
    UpdatedAt: deal.updated_at || ""
  }));

  const csv = toCSV(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="deals_export.csv"'
    }
  });
}

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getPerformanceRows } from "@/lib/data";

function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const str = String(v ?? "");
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))
  ].join("\r\n");
}

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const rows = getPerformanceRows().map((row) => ({
    Rep: row.name,
    Role: row.role,
    TotalDeals: row.total_deals,
    OpenDeals: row.open_deals,
    WonDeals: row.won_deals,
    LostDeals: row.lost_deals,
    Revenue: row.revenue,
    CloseRate: Number(row.close_rate.toFixed(1))
  }));

  return new NextResponse(toCSV(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="performance_export.csv"'
    }
  });
}

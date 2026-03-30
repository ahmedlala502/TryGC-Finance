import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getSessionUser } from "@/lib/auth";
import { getPerformanceRows } from "@/lib/data";

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

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

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Performance");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="performance_export.xlsx"'
    }
  });
}

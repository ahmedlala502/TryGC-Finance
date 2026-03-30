import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getSessionUser } from "@/lib/auth";
import { listUsers } from "@/lib/data";

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  if (user.role !== "admin") return NextResponse.redirect(new URL("/", request.url), 303);

  const rows = listUsers().map((item) => ({
    Name: item.name,
    Email: item.email,
    Role: item.role,
    Active: item.active ? "Yes" : "No",
    TotalDeals: item.total_deals,
    WonValue: item.won_value,
    CreatedAt: item.created_at || "",
    LastLogin: item.last_login || ""
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Users");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="users_export.xlsx"'
    }
  });
}

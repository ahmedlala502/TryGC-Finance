import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listUsers } from "@/lib/data";

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
  if (user.role !== "admin") return NextResponse.redirect(new URL("/", request.url));

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

  return new NextResponse(toCSV(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="users_export.csv"'
    }
  });
}

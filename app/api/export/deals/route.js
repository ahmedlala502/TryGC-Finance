import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getSessionUser } from "@/lib/auth";
import { listDeals } from "@/lib/data";

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const rows = listDeals(user).map((deal) => ({
    ID: deal.id,
    Title: deal.title,
    Account: deal.account_name || "",
    Stage: deal.stage_name || "",
    Status: deal.status,
    Owner: deal.assignee_name || "",
    ExpectedValue: deal.expected_value || 0,
    ClosedValue: deal.closed_value || 0,
    ExpectedCloseDate: deal.expected_close_date || "",
    FollowUpDate: deal.follow_up_date || "",
    UpdatedAt: deal.updated_at || ""
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Deals");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="deals_export.xlsx"'
    }
  });
}

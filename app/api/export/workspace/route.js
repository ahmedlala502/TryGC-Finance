import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getSessionUser } from "@/lib/auth";
import {
  getAuditEntries,
  getPerformanceRows,
  getTargets,
  getWorkspaceConfig,
  listAccounts,
  listDeals,
  listUsers
} from "@/lib/data";

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      listDeals(user).map((deal) => ({
        ID: deal.id,
        Title: deal.title,
        Account: deal.account_name || "",
        Contact: deal.contact_name || "",
        Owner: deal.assignee_name || "",
        Stage: deal.stage_name || "",
        Status: deal.status,
        Priority: deal.priority || "",
        Market: deal.market || "",
        ExpectedValue: deal.expected_value || 0,
        ClosedValue: deal.closed_value || 0,
        FollowUpDate: deal.follow_up_date || "",
        UpdatedAt: deal.updated_at || ""
      }))
    ),
    "Deals"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      listAccounts(user).map((account) => ({
        ID: account.id,
        Name: account.name,
        Industry: account.industry || "",
        Contact: account.contact_name || "",
        Email: account.email || "",
        Phone: account.phone || "",
        Location: account.location || "",
        Owner: account.assignee_name || "",
        ActiveDeals: account.active_deals
      }))
    ),
    "Accounts"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      getPerformanceRows().map((row) => ({
        Name: row.name,
        Role: row.role,
        TotalDeals: row.total_deals,
        OpenDeals: row.open_deals,
        WonDeals: row.won_deals,
        LostDeals: row.lost_deals,
        Revenue: row.revenue,
        CloseRate: Number(row.close_rate.toFixed(1))
      }))
    ),
    "Performance"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      getTargets().rows.map((row) => ({
        User: row.user_name,
        Month: row.month,
        Metric: row.metric,
        Value: row.value
      }))
    ),
    "Targets"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      getAuditEntries(200).map((row) => ({
        When: row.timestamp || "",
        User: row.user_name || "System",
        Action: row.action,
        EntityType: row.entity_type || "",
        EntityId: row.entity_id || "",
        Detail: row.detail || ""
      }))
    ),
    "Audit"
  );

  if (user.role === "admin") {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        listUsers().map((item) => ({
          Name: item.name,
          Email: item.email,
          Role: item.role,
          Active: item.active ? "Yes" : "No",
          TotalDeals: item.total_deals,
          WonValue: item.won_value,
          LastLogin: item.last_login || ""
        }))
      ),
      "Users"
    );
  }

  const settings = getWorkspaceConfig();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      Object.entries(settings).map(([key, value]) => ({
        Key: key,
        Value: Array.isArray(value) ? value.join(", ") : value
      }))
    ),
    "Settings"
  );

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="workspace_export.xlsx"'
    }
  });
}

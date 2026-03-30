import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { getActiveUsers } from "@/lib/data";
import { detectWorkbookTemplate, parsePipelineRows, summarizeCommissionWorkbook } from "@/lib/import-engine";
import { recordAudit } from "@/lib/mutations";
import * as XLSX from "xlsx";

function matchUserIdByName(name, users, fallbackId) {
  const target = String(name || "").trim().toLowerCase();
  if (!target) return fallbackId;

  const exact = users.find((user) => user.name.toLowerCase() === target);
  if (exact) return exact.id;

  const partial = users.find((user) => target.includes(user.name.toLowerCase()) || user.name.toLowerCase().includes(target));
  return partial?.id || fallbackId;
}

function buildNotes(row) {
  const notes = [];
  for (const key of ["Comments", "1st call Feedback", "2nd call Feedback", "3rd call Feedback"]) {
    const value = String(row[key] || "").trim();
    if (value) notes.push(`${key}: ${value}`);
  }
  return notes.join(" | ");
}

export async function POST(request) {
  const actor = await getSessionUser();
  if (!actor) return NextResponse.redirect(new URL("/login", request.url), 303);
  if (!["admin", "manager"].includes(actor.role)) return NextResponse.redirect(new URL("/", request.url), 303);

  const formData = await request.formData();
  const files = formData.getAll("files").filter(Boolean);
  if (!files.length) {
    return NextResponse.redirect(new URL("/import?errors=1", request.url), 303);
  }

  const activeUsers = getActiveUsers();
  const openStage = get("select id, probability from stages where type = 'open' order by `order` limit 1");

  let createdDeals = 0;
  let registeredTemplates = 0;
  let analyzedFiles = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: "buffer", dense: true });
      const template = detectWorkbookTemplate(workbook, file.name);
      analyzedFiles += 1;

      if (template === "sales-pipeline-dashboard") {
        const rows = parsePipelineRows(workbook);
        for (const entry of rows) {
          const row = entry.row;
          const companyName = String(row["Company Name"] || "").trim();
          if (!companyName) continue;

          const title = `${companyName} Opportunity`;
          const existing = get("select id from deals where title = ? and email = ?", title, String(row.Email || "").trim());
          if (existing) continue;

          run(
            `
              insert into deals (
                title, contact_name, phone, email, business_type, source, assigned_to, stage_id,
                status, probability, expected_value, notes, priority, market, created_at, updated_at, archived
              ) values (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 0)
            `,
            title,
            String(row["Contact Person"] || "").trim() || null,
            String(row["Mobile Number"] || "").trim() || null,
            String(row.Email || "").trim() || null,
            String(row["Business Type"] || "").trim() || null,
            String(row.Status || entry.sheetName).trim() || entry.sheetName,
            matchUserIdByName(row["Sales Exec. Name"], activeUsers, actor.id),
            openStage?.id || null,
            openStage?.probability || 15,
            0,
            buildNotes(row) || null,
            String(row.Status || "").toLowerCase().includes("interested") ? "High" : "Medium",
            "Imported"
          );
          createdDeals += 1;
        }

        recordAudit(actor.id, "import", "deal", null, `Bulk pipeline import from ${file.name}: ${createdDeals} deals created so far`);
      } else if (template === "commission-target-matrix") {
        const summary = summarizeCommissionWorkbook(workbook);
        run(
          `
            insert into settings (key, value) values (?, ?)
            on conflict(key) do update set value = excluded.value
          `,
          "commission_template_summary",
          JSON.stringify({
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
            ...summary
          })
        );
        registeredTemplates += 1;
        recordAudit(actor.id, "import", "setting", null, `Commission planning workbook analyzed: ${file.name}`);
      } else {
        errors += 1;
      }
    } catch {
      errors += 1;
    }
  }

  return NextResponse.redirect(
    new URL(
      `/import?analyzed=${analyzedFiles}&created=${createdDeals}&registered=${registeredTemplates}&errors=${errors}`,
      request.url
    ),
    303
  );
}

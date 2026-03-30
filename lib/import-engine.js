import * as XLSX from "xlsx";

export function detectWorkbookTemplate(workbook, fileName = "") {
  const lowerName = fileName.toLowerCase();
  const sheetNames = workbook.SheetNames.map((sheet) => sheet.toLowerCase());

  if (
    lowerName.includes("sales_performance") ||
    sheetNames.includes("leads & calls") ||
    sheetNames.includes("meeting") ||
    sheetNames.includes("quotations")
  ) {
    return "sales-pipeline-dashboard";
  }

  if (
    lowerName.includes("comm") ||
    sheetNames.includes("over all") ||
    sheetNames.some((sheet) => /^\d+\s*$/.test(sheet))
  ) {
    return "commission-target-matrix";
  }

  return "unknown";
}

export function getWorkbookPreview(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer", dense: true });
  const template = detectWorkbookTemplate(workbook);
  return { workbook, template };
}

export function parsePipelineRows(workbook) {
  const preferredSheets = ["Leads & Calls", "Meeting", "Quotations", "Opportunities", "Close Deal"];
  const rows = [];

  for (const sheetName of preferredSheets) {
    if (!workbook.SheetNames.includes(sheetName)) continue;
    const sheet = workbook.Sheets[sheetName];
    const parsed = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    for (const row of parsed) {
      rows.push({ sheetName, row });
    }
  }

  return rows;
}

export function summarizeCommissionWorkbook(workbook) {
  const overAllSheetName = workbook.SheetNames.find((name) => name.trim().toLowerCase() === "over all");
  const summary = {
    sheetCount: workbook.SheetNames.length,
    salaryBands: workbook.SheetNames.filter((name) => /^\d+\s*$/.test(name.trim())).length
  };

  if (overAllSheetName) {
    const grid = XLSX.utils.sheet_to_json(workbook.Sheets[overAllSheetName], {
      header: 1,
      defval: "",
      blankrows: false
    });
    summary.preview = grid.slice(0, 6);
  }

  return summary;
}

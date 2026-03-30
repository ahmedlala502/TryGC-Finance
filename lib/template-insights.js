import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { importTemplates } from "@/lib/import-templates";

export function getWorkbookTemplateInsights() {
  return importTemplates.map((template) => {
    const workbookPath = path.join(process.cwd(), "uploads", template.sourceFile);
    let sheetCount = 0;
    let sheetNames = [];
    let preview = [];

    try {
      const workbookBuffer = fs.readFileSync(workbookPath);
      const workbook = XLSX.read(workbookBuffer, { type: "buffer", dense: true });
      sheetNames = workbook.SheetNames;
      sheetCount = sheetNames.length;
      const firstSheet = workbook.Sheets[sheetNames[0]];
      preview = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
        defval: "",
        blankrows: false
      }).slice(0, 4);
      sheetNames = sheetNames.slice(0, 6);
    } catch {
      // File not available in this environment — return template metadata only
    }

    return {
      ...template,
      sheetCount,
      sheetNames,
      preview
    };
  });
}

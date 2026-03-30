import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { importTemplates } from "@/lib/import-templates";

export function getWorkbookTemplateInsights() {
  return importTemplates.map((template) => {
    const workbookPath = path.join(process.cwd(), "uploads", template.sourceFile);
    const workbookBuffer = fs.readFileSync(workbookPath);
    const workbook = XLSX.read(workbookBuffer, { type: "buffer", dense: true });
    const sheetNames = workbook.SheetNames;
    const firstSheet = workbook.Sheets[sheetNames[0]];
    const preview = XLSX.utils.sheet_to_json(firstSheet, {
      header: 1,
      defval: "",
      blankrows: false
    }).slice(0, 4);

    return {
      ...template,
      sheetCount: sheetNames.length,
      sheetNames: sheetNames.slice(0, 6),
      preview
    };
  });
}

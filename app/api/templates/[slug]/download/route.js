import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getImportTemplate } from "@/lib/import-templates";

export async function GET(request, { params }) {
  const { slug } = await params;
  const template = getImportTemplate(slug);
  if (!template) {
    return new NextResponse("Template not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "uploads", template.sourceFile);
  const buffer = await fs.readFile(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${template.sourceFile}"`
    }
  });
}

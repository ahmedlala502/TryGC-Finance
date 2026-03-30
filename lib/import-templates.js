export const importTemplates = [
  {
    slug: "sales-pipeline-dashboard",
    title: "Sales Pipeline Dashboard Template",
    sourceFile: "Sales_Performance_Dashboard_Advanced_Final.xlsx",
    purpose:
      "Pipeline intake and sales-activity tracking across leads, calls, meetings, quotations, opportunities, plans, pending closure, and closed deals.",
    criteria: [
      "Workbook contains operational sheets such as 'Leads & Calls', 'Meeting', 'Quotations', and 'Close Deal'.",
      "Source rows describe company, contact, business type, salesperson, status, meeting progress, and comments.",
      "Best fit for importing prospect and deal records into the CRM."
    ],
    recommendedMapping: {
      title: "Company Name",
      contact_name: "Contact Person",
      phone: "Mobile Number",
      email: "Email",
      business_type: "Business Type",
      source: "Status",
      notes: "Comments"
    }
  },
  {
    slug: "commission-target-matrix",
    title: "Commission & Target Matrix Template",
    sourceFile: "GC_KSA_COMM.xlsx",
    purpose:
      "Commission planning workbook for salary bands, monthly targets, quarterly targets, achievement ladders, and salesperson-specific payout calculations.",
    criteria: [
      "Workbook is organized around salary or rep-specific sheets such as '5000', '6000', and named tabs.",
      "Primary values focus on salary, monthly target, secured revenue, achieved tiers, and commission outputs.",
      "Best fit as a planning/reference template for target-setting and incentive design, not raw lead import."
    ],
    recommendedMapping: {
      title: "Rep or salary band",
      expected_value: "Secured / target value",
      notes: "Commission tier details",
      market: "Sheet name"
    }
  }
];

export function getImportTemplate(slug) {
  return importTemplates.find((template) => template.slug === slug) || null;
}

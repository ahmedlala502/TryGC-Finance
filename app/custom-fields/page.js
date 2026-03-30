import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CustomFieldManager } from "@/components/custom-field-manager";
import { getSessionUser } from "@/lib/auth";
import { listCustomFields } from "@/lib/data";

export default async function CustomFieldsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["admin", "manager"].includes(user.role)) redirect("/");

  const fields = listCustomFields();

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Custom Fields</h1>
          <p className="page-subtitle">Add structured fields to deals and accounts without changing the schema again.</p>
        </div>
      </div>

      <CustomFieldManager fields={fields} />
    </AppShell>
  );
}

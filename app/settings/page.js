import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getWorkspaceConfig } from "@/lib/data";
import { AppShell } from "@/components/app-shell";
import { SettingsStudio } from "@/components/settings-studio";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["admin", "manager"].includes(user.role)) redirect("/");

  const settings = getWorkspaceConfig();

  return (
    <AppShell user={user}>
      <div className="page-header page-header-tight">
        <div>
          <h1 className="page-title">Workspace Settings Studio</h1>
          <p className="page-subtitle">
            Control identity, operational defaults, density, and a fully customizable workspace theme from one surface.
          </p>
        </div>
      </div>

      <SettingsStudio settings={settings} />
    </AppShell>
  );
}

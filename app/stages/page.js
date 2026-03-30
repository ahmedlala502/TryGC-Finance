import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StageManager } from "@/components/stage-manager";
import { getSessionUser } from "@/lib/auth";
import { listStages } from "@/lib/data";

export default async function StagesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["admin", "manager"].includes(user.role)) redirect("/");

  const stages = listStages();

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stage Management</h1>
          <p className="page-subtitle">Control stage names, colors, probabilities, visibility, and pipeline order.</p>
        </div>
      </div>

      <StageManager stages={stages} canDelete={user.role === "admin"} />
    </AppShell>
  );
}

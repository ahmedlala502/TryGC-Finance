import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/data";
import { AppShell } from "@/components/app-shell";
import { DashboardPage } from "@/components/pages/dashboard-page";

export default async function HomePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const summary = getDashboardSummary(user);
  return (
    <AppShell user={user}>
      <DashboardPage summary={summary} />
    </AppShell>
  );
}

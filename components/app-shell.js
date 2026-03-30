import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { getWorkspaceConfig } from "@/lib/data";

export function AppShell({ user, children }) {
  const workspace = getWorkspaceConfig();

  return (
    <div className="app-layout">
      <Sidebar user={user} workspaceName={workspace.system_name} />

      <div className="main-wrapper">
        <Topbar user={user} />
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}

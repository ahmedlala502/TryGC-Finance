import { AppShellClient } from "@/components/app-shell-client";
import { getWorkspaceConfig } from "@/lib/data";

export function AppShell({ user, children }) {
  const workspace = getWorkspaceConfig();

  return (
    <AppShellClient user={user} workspace={workspace}>
      {children}
    </AppShellClient>
  );
}

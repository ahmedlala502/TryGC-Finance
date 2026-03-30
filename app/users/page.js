import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listUsers } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { AppShell } from "@/components/app-shell";
import { UsersTable } from "@/components/users-table";

export default async function UsersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  const users = listUsers();
  const activeUsers = users.filter((item) => item.active);
  const salesUsers = users.filter((item) => item.role === "sales");

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Create, edit, deactivate, and review commercial workspace users.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-sub">Total Users</div>
          <div className="kpi-value">{users.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-sub">Active</div>
          <div className="kpi-value">{activeUsers.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-sub">Sales Reps</div>
          <div className="kpi-value">{salesUsers.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-sub">Managed Revenue</div>
          <div className="kpi-value">
            {formatCurrency(users.reduce((sum, item) => sum + Number(item.won_value || 0), 0))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Workspace Users</span>
          </div>
          <div className="card-body">
            <UsersTable users={users} currentUserId={user.id} />
          </div>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Create User</span>
            </div>
            <div className="card-body">
              <form method="post" action="/api/users" style={{ display: "grid", gap: 12 }}>
                <div className="form-group">
                  <label>Name</label>
                  <input name="name" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" defaultValue="sales">
                    {["admin", "manager", "sales", "viewer"].map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Temporary Password</label>
                  <input name="password" type="text" required placeholder="At least 8 characters" />
                </div>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Update Profile</span>
            </div>
            <div className="card-body">
              <form method="post" action={`/api/users/${user.id}`} style={{ display: "grid", gap: 12 }}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input name="name" defaultValue={user.name} required />
                </div>
                <div className="form-group">
                  <label>Your Email</label>
                  <input name="email" type="email" defaultValue={user.email} required />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input name="password" type="text" placeholder="Leave empty to keep current password" />
                </div>
                <button type="submit" className="btn btn-outline-secondary">
                  Save My Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

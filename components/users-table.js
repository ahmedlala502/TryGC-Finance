"use client";

import { useState } from "react";

export function UsersTable({ users, currentUserId }) {
  const [editingUser, setEditingUser] = useState(null);

  return (
    <>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Deals</th>
              <th>Won Value</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>{item.email}</div>
                </td>
                <td>
                  <span className="badge badge-secondary">{item.role}</span>
                </td>
                <td>
                  <span className={`badge ${item.active ? "badge-success" : "badge-secondary"}`}>
                    {item.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{item.total_deals}</td>
                <td>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(item.won_value || 0))}</td>
                <td>{item.last_login ? new Date(item.last_login).toLocaleDateString() : "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditingUser(item)}>
                      Edit
                    </button>
                    {item.id !== currentUserId ? (
                      <form method="post" action={`/api/users/${item.id}`}>
                        <input type="hidden" name="action" value="toggle_active" />
                        <button type="submit" className="btn btn-outline-secondary btn-sm">
                          {item.active ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser ? (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit User</div>
              <button type="button" className="modal-close" onClick={() => setEditingUser(null)}>
                ×
              </button>
            </div>
            <form method="post" action={`/api/users/${editingUser.id}`}>
              <div className="modal-body" style={{ display: "grid", gap: 14 }}>
                <div className="form-group">
                  <label>Name</label>
                  <input name="name" defaultValue={editingUser.name} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" defaultValue={editingUser.email} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <select name="role" defaultValue={editingUser.role}>
                      {["admin", "manager", "sales", "viewer"].map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, textTransform: "none", letterSpacing: 0 }}>
                      <input type="checkbox" name="active" defaultChecked={editingUser.active} disabled={editingUser.id === currentUserId} />
                      <span>{editingUser.id === currentUserId ? "Current user cannot be deactivated here" : "User can sign in"}</span>
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input name="password" type="text" placeholder="Leave empty to keep current password" />
                </div>
              </div>
              <div className="modal-footer">
                {editingUser.id !== currentUserId ? (
                  <button type="submit" name="action" value="delete" className="btn btn-danger">
                    Delete User
                  </button>
                ) : null}
                <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

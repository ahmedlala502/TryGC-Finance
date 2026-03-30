"use client";

import Link from "next/link";
import { useState } from "react";

export function DealsTable({ deals, stages, owners, accounts, settings, user }) {
  const [editingDeal, setEditingDeal] = useState(null);

  return (
    <>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Deal</th>
              <th>Account</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Expected Value</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id}>
                <td>
                  <div style={{ display: "grid", gap: 4 }}>
                    <Link href={`/deals/${deal.id}`}>{deal.title}</Link>
                    <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                      {deal.priority || "Medium"} · {deal.market || "No market"}
                    </div>
                  </div>
                </td>
                <td>{deal.account_name || "—"}</td>
                <td>{deal.stage_name || "—"}</td>
                <td>
                  <span className={`badge ${deal.status === "won" ? "badge-success" : deal.status === "lost" ? "badge-danger" : "badge-info"}`}>
                    {deal.status}
                  </span>
                </td>
                <td>{deal.assignee_name || "—"}</td>
                <td>
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: settings.currency || "USD", maximumFractionDigits: 0 }).format(
                    Number(deal.expected_value || 0)
                  )}
                </td>
                <td>{new Date(deal.updated_at).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditingDeal(deal)}>
                      Edit
                    </button>
                    {deal.status !== "won" ? (
                      <form method="post" action={`/api/deals/${deal.id}/status`}>
                        <input type="hidden" name="action" value="won" />
                        <button type="submit" className="btn btn-success btn-sm">
                          Won
                        </button>
                      </form>
                    ) : null}
                    {deal.status !== "lost" ? (
                      <form method="post" action={`/api/deals/${deal.id}/status`}>
                        <input type="hidden" name="action" value="lost" />
                        <button type="submit" className="btn btn-warning btn-sm">
                          Lost
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

      {editingDeal ? (
        <div className="modal-overlay" onClick={() => setEditingDeal(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 860 }}>
            <div className="modal-header">
              <div className="modal-title">Edit Deal</div>
              <button type="button" className="modal-close" onClick={() => setEditingDeal(null)}>
                ×
              </button>
            </div>
            <form method="post" action={`/api/deals/${editingDeal.id}`}>
              <div className="modal-body" style={{ display: "grid", gap: 14 }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Deal Title</label>
                    <input name="title" defaultValue={editingDeal.title} required />
                  </div>
                  <div className="form-group">
                    <label>Account</label>
                    <select name="account_id" defaultValue={editingDeal.account_id || ""}>
                      <option value="">Select account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact</label>
                    <input name="contact_name" defaultValue={editingDeal.contact_name || ""} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input name="email" type="email" defaultValue={editingDeal.email || ""} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" defaultValue={editingDeal.phone || ""} />
                  </div>
                  <div className="form-group">
                    <label>Expected Value</label>
                    <input name="expected_value" type="number" step="0.01" defaultValue={editingDeal.expected_value || 0} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Business Type</label>
                    <select name="business_type" defaultValue={editingDeal.business_type || ""}>
                      <option value="">Select business type</option>
                      {settings.business_types.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Source</label>
                    <select name="source" defaultValue={editingDeal.source || ""}>
                      <option value="">Select source</option>
                      {settings.lead_sources.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Stage</label>
                    <select name="stage_id" defaultValue={editingDeal.stage_id || ""}>
                      <option value="">Select stage</option>
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assigned To</label>
                    <select name="assigned_to" defaultValue={editingDeal.assigned_to || user.id} disabled={user.role === "sales"}>
                      {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expected Close Date</label>
                    <input name="expected_close_date" type="date" defaultValue={editingDeal.expected_close_date || ""} />
                  </div>
                  <div className="form-group">
                    <label>Follow Up Date</label>
                    <input name="follow_up_date" type="date" defaultValue={editingDeal.follow_up_date || ""} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select name="priority" defaultValue={editingDeal.priority || ""}>
                      {settings.priorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Market</label>
                    <select name="market" defaultValue={editingDeal.market || ""}>
                      {settings.markets.map((market) => (
                        <option key={market} value={market}>
                          {market}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea name="notes" rows={4} defaultValue={editingDeal.notes || ""} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" name="action" value="delete" className="btn btn-danger">
                  Delete Deal
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingDeal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

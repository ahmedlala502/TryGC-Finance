"use client";

import { useState } from "react";

export function StageManager({ stages, canDelete }) {
  const [orderedStages, setOrderedStages] = useState(stages);
  const [isCreating, setIsCreating] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  function moveStage(stageId, direction) {
    setOrderedStages((current) => {
      const index = current.findIndex((stage) => stage.id === stageId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  async function persistOrder() {
    setSavingOrder(true);
    try {
      await fetch("/api/stages/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: orderedStages.map((stage, index) => ({ id: stage.id, order: index + 1 }))
        })
      });
      window.location.reload();
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Pipeline Stages</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled={savingOrder} onClick={persistOrder}>
              {savingOrder ? "Saving..." : "Save Order"}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsCreating(true)}>
              + Add Stage
            </button>
          </div>
        </div>
        <div className="card-body" style={{ display: "grid", gap: 12 }}>
          {orderedStages.map((stage, index) => (
            <div key={stage.id} className="stage-row">
              <div style={{ display: "grid", gap: 8 }}>
                <button type="button" className="btn btn-outline-secondary btn-sm" disabled={index === 0} onClick={() => moveStage(stage.id, -1)}>
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  disabled={index === orderedStages.length - 1}
                  onClick={() => moveStage(stage.id, 1)}
                >
                  ↓
                </button>
              </div>

              <form method="post" action={`/api/stages/${stage.id}`} style={{ flex: 1, display: "grid", gap: 12 }}>
                <div className="form-row" style={{ gridTemplateColumns: "1.4fr 0.9fr 0.8fr 0.8fr 0.8fr auto" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Name</label>
                    <input name="name" defaultValue={stage.name} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Color</label>
                    <input name="color" type="color" defaultValue={stage.color} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Probability</label>
                    <input name="probability" type="number" min="0" max="100" defaultValue={stage.probability} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Type</label>
                    <select name="type" defaultValue={stage.type}>
                      {["open", "won", "lost"].map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Active</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, textTransform: "none", letterSpacing: 0 }}>
                      <input type="checkbox" name="active" defaultChecked={stage.active} />
                      <span>{stage.active ? "Visible" : "Hidden"}</span>
                    </label>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save
                    </button>
                    {canDelete ? (
                      <button type="submit" name="action" value="delete" className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </form>
            </div>
          ))}
        </div>
      </div>

      {isCreating ? (
        <div className="modal-overlay" onClick={() => setIsCreating(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create Stage</div>
              <button type="button" className="modal-close" onClick={() => setIsCreating(false)}>
                ×
              </button>
            </div>
            <form method="post" action="/api/stages">
              <div className="modal-body" style={{ display: "grid", gap: 14 }}>
                <div className="form-group">
                  <label>Name</label>
                  <input name="name" defaultValue="New Stage" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Color</label>
                    <input name="color" type="color" defaultValue="#1d7a72" />
                  </div>
                  <div className="form-group">
                    <label>Probability</label>
                    <input name="probability" type="number" min="0" max="100" defaultValue="50" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" defaultValue="open">
                    {["open", "won", "lost"].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setIsCreating(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

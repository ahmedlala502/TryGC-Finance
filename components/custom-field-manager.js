"use client";

import { useState } from "react";

const fieldTypes = ["text", "number", "date", "select"];
const entityTypes = ["deal", "account"];

function FieldModal({ field, onClose }) {
  const isEditing = Boolean(field?.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{isEditing ? "Edit Custom Field" : "Create Custom Field"}</div>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form method="post" action={isEditing ? `/api/custom-fields/${field.id}` : "/api/custom-fields"}>
          <div className="modal-body" style={{ display: "grid", gap: 14 }}>
            <div className="form-row">
              <div className="form-group">
                <label>Entity Type</label>
                <select name="entity_type" defaultValue={field?.entity_type || "deal"}>
                  {entityTypes.map((entityType) => (
                    <option key={entityType} value={entityType}>
                      {entityType}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Field Type</label>
                <select name="field_type" defaultValue={field?.field_type || "text"}>
                  {fieldTypes.map((fieldType) => (
                    <option key={fieldType} value={fieldType}>
                      {fieldType}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Name</label>
              <input name="name" defaultValue={field?.name || ""} required />
            </div>
            <div className="form-group">
              <label>Options</label>
              <textarea
                name="options"
                rows={4}
                defaultValue={field?.options?.join(", ") || ""}
                placeholder="Comma-separated options for select fields"
              />
            </div>
          </div>
          <div className="modal-footer">
            {isEditing ? (
              <button type="submit" name="action" value="delete" className="btn btn-danger">
                Delete Field
              </button>
            ) : null}
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Save Field" : "Create Field"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CustomFieldManager({ fields }) {
  const [editingField, setEditingField] = useState(null);

  return (
    <>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Custom Field Library</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditingField({})}>
            + Add Field
          </button>
        </div>
        <div className="card-body">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Entity</th>
                  <th>Type</th>
                  <th>Options</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.id}>
                    <td style={{ fontWeight: 700 }}>{field.name}</td>
                    <td>{field.entity_type}</td>
                    <td>{field.field_type}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                      {field.options.length ? field.options.join(", ") : "—"}
                    </td>
                    <td>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditingField(field)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {!fields.length ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 28, color: "var(--text-secondary)" }}>
                      No custom fields defined yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingField !== null ? <FieldModal field={editingField} onClose={() => setEditingField(null)} /> : null}
    </>
  );
}

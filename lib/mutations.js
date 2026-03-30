import { all, get, run } from "@/lib/db";

export function recordAudit(userId, action, entityType, entityId, detail) {
  run(
    "insert into audit_logs (user_id, action, entity_type, entity_id, detail, timestamp) values (?, ?, ?, ?, ?, datetime('now'))",
    userId || null,
    action,
    entityType || null,
    entityId || null,
    detail || ""
  );
}

export function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function asNullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function asNullableText(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

export function asDateString(value) {
  const text = String(value || "").trim();
  return text || null;
}

export function getStageType(stageId) {
  return get("select id, name, type, probability from stages where id = ?", stageId);
}

export function toJsonOptions(value) {
  const options = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return options.length ? JSON.stringify(options) : null;
}

export function saveCustomFieldValues(formData, entityType, entityId) {
  const fields = allCustomFields(entityType);

  for (const field of fields) {
    const inputName = `custom_field_${field.id}`;
    const rawValue = formData.get(inputName);
    const normalizedValue = String(rawValue || "").trim();
    const existing = get(
      "select id from custom_field_values where custom_field_id = ? and entity_id = ?",
      field.id,
      entityId
    );

    if (!normalizedValue) {
      if (existing) {
        run("delete from custom_field_values where id = ?", existing.id);
      }
      continue;
    }

    if (existing) {
      run("update custom_field_values set value = ? where id = ?", normalizedValue, existing.id);
    } else {
      run(
        "insert into custom_field_values (custom_field_id, entity_id, value) values (?, ?, ?)",
        field.id,
        entityId,
        normalizedValue
      );
    }
  }
}

export function deleteCustomFieldValues(entityType, entityId) {
  run(
    `
      delete from custom_field_values
      where entity_id = ?
        and custom_field_id in (select id from custom_fields where entity_type = ?)
    `,
    entityId,
    entityType
  );
}

function allCustomFields(entityType) {
  return all("select id from custom_fields where entity_type = ? order by name", entityType);
}

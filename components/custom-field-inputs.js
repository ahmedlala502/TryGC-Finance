export function CustomFieldInputs({ fields, title = "Custom Fields" }) {
  if (!fields?.length) return null;

  return (
    <div className="form-section">
      <div className="form-section-title">{title}</div>
      <div className="form-row">
        {fields.map((field) => {
          const name = `custom_field_${field.id}`;
          const value = field.value || "";

          return (
            <div className="form-group" key={field.id}>
              <label>{field.name}</label>
              {field.field_type === "select" ? (
                <select name={name} defaultValue={value}>
                  <option value="">Select {field.name}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={name}
                  type={field.field_type === "number" ? "number" : field.field_type === "date" ? "date" : "text"}
                  defaultValue={value}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

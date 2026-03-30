"use client";

import { useRef, useState, useCallback } from "react";

const UploadIcon = () => (
  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.4" style={{ color: "var(--accent-light)", opacity: 0.7 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
  </svg>
);

const FileIcon = ({ type }) => {
  const colors = {
    csv:  { bg: "#065f46", text: "#6ee7b7", label: "CSV" },
    xlsx: { bg: "#1e3a5f", text: "#93c5fd", label: "XLS" },
    xls:  { bg: "#1e3a5f", text: "#93c5fd", label: "XLS" },
  };
  const style = colors[type] || { bg: "#1e293b", text: "#94a3b8", label: "FILE" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: style.bg, color: style.text,
      fontSize: 9, fontWeight: 800, letterSpacing: "0.06em",
      padding: "3px 6px", borderRadius: 5, flexShrink: 0,
    }}>
      {style.label}
    </span>
  );
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportClient() {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const addFiles = useCallback((newFiles) => {
    const list = Array.from(newFiles).filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return ["xlsx", "xls", "csv"].includes(ext);
    });
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...list.filter((f) => !existing.has(f.name + f.size))];
    });
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));
  const clearAll   = () => setFiles([]);

  const getExt = (name) => name.split(".").pop()?.toLowerCase() || "file";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) return;
    setUploading(true);
    setProgress(10);

    const form = new FormData();
    files.forEach((f) => form.append("files", f));

    try {
      setProgress(35);
      const res = await fetch("/api/import/bulk", { method: "POST", body: form });
      setProgress(80);
      const data = await res.json().catch(() => ({}));
      setProgress(100);
      // Redirect with results
      const params = new URLSearchParams({
        analyzed:   data.analyzed   ?? files.length,
        created:    data.created    ?? 0,
        registered: data.registered ?? 0,
        errors:     data.errors     ?? 0,
      });
      window.location.href = `/import?${params}`;
    } catch {
      setProgress(0);
      setUploading(false);
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <div className="card" style={{ marginBottom: 22 }}>
      <div className="card-header">
        <span className="card-title">Bulk File Upload</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="badge badge-secondary">CSV · Excel</span>
          <span className="badge badge-info">Multi-file</span>
        </div>
      </div>
      <div className="card-body" style={{ display: "grid", gap: 16 }}>

        <p style={{ color: "var(--text-secondary)", maxWidth: 680, fontSize: 13, lineHeight: 1.6 }}>
          Drop one or more <strong style={{ color: "var(--text-primary)" }}>CSV or Excel</strong> files below.
          Pipeline workbooks create deals automatically. Commission sheets register as planning templates.
        </p>

        {/* Dropzone */}
        <form onSubmit={handleSubmit}>
          <div
            className={`dropzone${dragOver ? " drag-over" : ""}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
            style={{ cursor: "pointer" }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              multiple
              style={{ display: "none" }}
              onChange={(e) => addFiles(e.target.files)}
            />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <UploadIcon />
              <div>
                <div className="dropzone-title">
                  {dragOver ? "Drop files to add them" : "Drag & drop files here"}
                </div>
                <div className="dropzone-sub">
                  or <span style={{ color: "var(--accent-light)", fontWeight: 600 }}>click to browse</span> — .xlsx, .xls, .csv supported
                </div>
              </div>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div style={{ marginTop: 14, display: "grid", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {files.length} file{files.length !== 1 ? "s" : ""} queued
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--text-muted)" }}
                >
                  Clear all
                </button>
              </div>

              {files.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    background: "var(--surface)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 9,
                  }}
                >
                  <FileIcon type={getExt(f.name)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                      {formatBytes(f.size)} · {getExt(f.name).toUpperCase()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "#fca5a5",
                      width: 26, height: 26,
                      borderRadius: 7,
                      cursor: "pointer",
                      fontSize: 14, lineHeight: 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Progress bar */}
          {uploading && progress > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 5 }}>
                <span>Uploading and processing…</span>
                <span>{progress}%</span>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${progress}%`, transition: "width 0.4s ease" }} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!files.length || uploading}
            >
              {uploading ? "Processing…" : `Run Import${files.length ? ` (${files.length} file${files.length !== 1 ? "s" : ""})` : ""}`}
            </button>
            {files.length > 0 && !uploading && (
              <button type="button" className="btn btn-outline-secondary" onClick={clearAll}>
                Clear Queue
              </button>
            )}
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginLeft: 4 }}>
              Max file size: 50 MB per file
            </div>
          </div>
        </form>

        {/* Format guide */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
          marginTop: 4,
        }}>
          {[
            { label: "Pipeline Excel", ext: ".xlsx / .xls", desc: "Deal title, account, stage, value, close date", color: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.2)", text: "#a5b4fc" },
            { label: "CSV Import",     ext: ".csv",          desc: "Flat file — same column names as Excel template", color: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.18)", text: "#6ee7b7" },
            { label: "Commission Sheet", ext: ".xlsx / .xls", desc: "Rep targets and commission matrices", color: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.18)", text: "#fcd34d" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: item.color,
                border: `1px solid ${item.border}`,
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: item.text }}>{item.label}</span>
                <span style={{ fontSize: 10, background: "rgba(0,0,0,0.2)", color: item.text, padding: "1px 6px", borderRadius: 4 }}>{item.ext}</span>
              </div>
              <p style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const SOURCE_DB_PATH = path.join(process.cwd(), "trygc_finance_sales_dashboard.db");
const DB_PATH = process.env.VERCEL
  ? path.join("/tmp", "trygc_finance_sales_dashboard.db")
  : SOURCE_DB_PATH;
const SQL_WASM_PATH = path.join(process.cwd(), "public");
const require = createRequire(import.meta.url);
const initSqlJs = require("sql.js");

const SQL = globalThis.__tryGcSql || (globalThis.__tryGcSql = await initSqlJs({
  locateFile(file) {
    return path.join(SQL_WASM_PATH, file);
  }
}));

function createDatabase() {
  if (process.env.VERCEL && !fs.existsSync(DB_PATH) && fs.existsSync(SOURCE_DB_PATH)) {
    fs.copyFileSync(SOURCE_DB_PATH, DB_PATH);
  }
  const source = fs.existsSync(DB_PATH) ? fs.readFileSync(DB_PATH) : undefined;
  const db = source ? new SQL.Database(source) : new SQL.Database();
  db.exec("PRAGMA foreign_keys = ON");
  
  // Initialize settings table if it doesn't exist
  try {
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
    
    // Check if table has any data, if not insert defaults
    const result = db.exec("SELECT COUNT(*) as count FROM settings");
    const count = result[0]?.values[0]?.[0] || 0;
    
    if (count === 0) {
      const defaultSettings = [
        ["system_name", "TryGc - Finance & Sales Dashboard"],
        ["currency", "USD"],
        ["date_format", "%Y-%m-%d"],
        ["markets", JSON.stringify(["Local", "International", "MENA", "Europe"])],
        ["business_types", JSON.stringify(["Software", "Hardware", "Services", "Consulting", "Training"])],
        ["lead_sources", JSON.stringify(["Website", "Referral", "LinkedIn", "Cold Call", "Event", "Email Campaign"])],
        ["priorities", JSON.stringify(["Low", "Medium", "High", "Critical"])]
      ];
      
      for (const [key, value] of defaultSettings) {
        db.run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
      }
    }
  } catch (error) {
    console.error("[v0] Error initializing settings table:", error.message);
  }
  
  return db;
}

function persist() {
  const exported = getDb().export();
  fs.writeFileSync(DB_PATH, Buffer.from(exported));
}

export function getDb() {
  if (!globalThis.__tryGcDb) {
    globalThis.__tryGcDb = createDatabase();
  }
  return globalThis.__tryGcDb;
}

function normalizeParams(params) {
  return params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
}

export function all(sql, ...params) {
  const statement = getDb().prepare(sql);
  const rows = [];

  try {
    statement.bind(normalizeParams(params));
    while (statement.step()) {
      rows.push(statement.getAsObject());
    }
    return rows;
  } finally {
    statement.free();
  }
}

export function get(sql, ...params) {
  const statement = getDb().prepare(sql);

  try {
    statement.bind(normalizeParams(params));
    return statement.step() ? statement.getAsObject() : undefined;
  } finally {
    statement.free();
  }
}

export function run(sql, ...params) {
  const db = getDb();
  db.run(sql, normalizeParams(params));
  const lastInsertRow = get("select last_insert_rowid() as id");
  const changes = get("select changes() as count");
  persist();
  return {
    changes: Number(changes?.count || 0),
    lastInsertRowid: Number(lastInsertRow?.id || 0)
  };
}

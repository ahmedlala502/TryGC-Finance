import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "sales_crm.db");
const SQL_WASM_PATH = path.join(process.cwd(), "node_modules", "sql.js", "dist");
const require = createRequire(import.meta.url);
const initSqlJs = require("sql.js");

const SQL = globalThis.__salesCrmSql || (globalThis.__salesCrmSql = await initSqlJs({
  locateFile(file) {
    return path.join(SQL_WASM_PATH, file);
  }
}));

function createDatabase() {
  const source = fs.existsSync(DB_PATH) ? fs.readFileSync(DB_PATH) : undefined;
  const db = source ? new SQL.Database(source) : new SQL.Database();
  db.exec("PRAGMA foreign_keys = ON");
  return db;
}

function persist() {
  const exported = getDb().export();
  fs.writeFileSync(DB_PATH, Buffer.from(exported));
}

export function getDb() {
  if (!globalThis.__salesCrmDb) {
    globalThis.__salesCrmDb = createDatabase();
  }
  return globalThis.__salesCrmDb;
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

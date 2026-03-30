import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const SOURCE_DB_PATH = path.join(process.cwd(), "trygc_finance_sales_dashboard.db");
const DB_PATH = path.join(process.cwd(), "trygc_finance_sales_dashboard.db");
const SQL_WASM_PATH = path.join(process.cwd(), "public");
const require = createRequire(import.meta.url);
const initSqlJs = require("sql.js");

async function initializeDatabase() {
  const SQL = await initSqlJs({
    locateFile(file) {
      return path.join(SQL_WASM_PATH, file);
    }
  });

  let db;
  if (fs.existsSync(DB_PATH)) {
    const source = fs.readFileSync(DB_PATH);
    db = new SQL.Database(source);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON");

  // Create settings table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Insert default settings
  const settingsToInsert = [
    { key: "system_name", value: "TryGc - Finance & Sales Dashboard" },
    { key: "currency", value: "USD" },
    { key: "date_format", value: "%Y-%m-%d" },
    { key: "markets", value: JSON.stringify(["Local", "International", "MENA", "Europe"]) },
    { key: "business_types", value: JSON.stringify(["Software", "Hardware", "Services", "Consulting", "Training"]) },
    { key: "lead_sources", value: JSON.stringify(["Website", "Referral", "LinkedIn", "Cold Call", "Event", "Email Campaign"]) },
    { key: "priorities", value: JSON.stringify(["Low", "Medium", "High", "Critical"]) }
  ];

  for (const setting of settingsToInsert) {
    const existing = db.exec(`SELECT value FROM settings WHERE key = ?`, [setting.key]);
    if (existing.length === 0) {
      db.run(`INSERT INTO settings (key, value) VALUES (?, ?)`, [setting.key, setting.value]);
    }
  }

  const exported = db.export();
  const buffer = Buffer.from(exported);
  fs.writeFileSync(DB_PATH, buffer);
  console.log("[v0] Database initialized successfully");
  console.log("[v0] Settings table created with default values");
}

initializeDatabase().catch(console.error);

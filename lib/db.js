import crypto from "node:crypto";
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

function createPasswordHash(password) {
  const n = 32768;
  const r = 8;
  const p = 1;
  const salt = crypto
    .createHash("sha256")
    .update(`trygc-seed:${password}`)
    .digest("base64")
    .replace(/[+/=]/g, "")
    .slice(0, 16);
  const key = crypto.scryptSync(password, salt, 64, {
    N: n,
    r,
    p,
    maxmem: 64 * 1024 * 1024
  });
  return `scrypt:${n}:${r}:${p}$${salt}$${key.toString("hex")}`;
}

function getScalar(db, sql, params = []) {
  const statement = db.prepare(sql);

  try {
    statement.bind(Array.isArray(params) ? params : [params]);
    if (!statement.step()) return null;
    const row = statement.getAsObject();
    return Object.values(row)[0] ?? null;
  } finally {
    statement.free();
  }
}

function ensureSchema(db) {
  db.exec(`
    create table if not exists users (
      id integer primary key autoincrement,
      email text not null unique,
      name text not null,
      role text not null default 'sales',
      hashed_password text not null,
      active integer not null default 1,
      created_at text not null default (datetime('now')),
      last_login text
    );

    create table if not exists settings (
      key text primary key,
      value text
    );

    create table if not exists stages (
      id integer primary key autoincrement,
      name text not null,
      color text,
      probability integer not null default 0,
      type text not null default 'open',
      active integer not null default 1,
      "order" integer not null default 0
    );

    create table if not exists accounts (
      id integer primary key autoincrement,
      name text not null,
      industry text,
      contact_name text,
      phone text,
      email text,
      location text,
      assigned_to integer,
      notes text,
      created_at text not null default (datetime('now')),
      foreign key (assigned_to) references users(id) on delete set null
    );

    create table if not exists deals (
      id integer primary key autoincrement,
      title text not null,
      account_id integer,
      contact_name text,
      phone text,
      email text,
      business_type text,
      source text,
      assigned_to integer,
      stage_id integer,
      status text not null default 'open',
      probability integer not null default 0,
      expected_value real not null default 0,
      closed_value real,
      expected_close_date text,
      notes text,
      follow_up_date text,
      priority text not null default 'Medium',
      market text,
      created_at text not null default (datetime('now')),
      updated_at text not null default (datetime('now')),
      archived integer not null default 0,
      foreign key (account_id) references accounts(id) on delete set null,
      foreign key (assigned_to) references users(id) on delete set null,
      foreign key (stage_id) references stages(id) on delete set null
    );

    create table if not exists custom_fields (
      id integer primary key autoincrement,
      entity_type text not null,
      name text not null,
      field_type text not null,
      options text
    );

    create table if not exists custom_field_values (
      id integer primary key autoincrement,
      custom_field_id integer not null,
      entity_id integer not null,
      value text,
      unique(custom_field_id, entity_id),
      foreign key (custom_field_id) references custom_fields(id) on delete cascade
    );

    create table if not exists audit_logs (
      id integer primary key autoincrement,
      user_id integer,
      action text not null,
      entity_type text,
      entity_id integer,
      detail text,
      timestamp text not null default (datetime('now')),
      foreign key (user_id) references users(id) on delete set null
    );

    create table if not exists targets (
      id integer primary key autoincrement,
      user_id integer not null,
      month text not null,
      metric text not null,
      value real not null default 0,
      unique(user_id, month, metric),
      foreign key (user_id) references users(id) on delete cascade
    );

    create index if not exists idx_deals_assigned_to on deals(assigned_to);
    create index if not exists idx_deals_stage_id on deals(stage_id);
    create index if not exists idx_deals_status on deals(status);
    create index if not exists idx_accounts_assigned_to on accounts(assigned_to);
    create index if not exists idx_audit_logs_timestamp on audit_logs(timestamp desc);
  `);

  seedDatabase(db);
}

function seedDatabase(db) {
  const userCount = Number(getScalar(db, "select count(*) from users") || 0);
  if (!userCount) {
    const demoUsers = [
      ["admin@local", "Ava Admin", "admin", createPasswordHash("Admin@12345")],
      ["manager@local", "Marcus Manager", "manager", createPasswordHash("Manager@12345")],
      ["sales@local", "Sofia Sales", "sales", createPasswordHash("Sales@12345")],
      ["viewer@local", "Victor Viewer", "viewer", createPasswordHash("Viewer@12345")]
    ];

    for (const user of demoUsers) {
      db.run(
        "insert into users (email, name, role, hashed_password, active, created_at) values (?, ?, ?, ?, 1, datetime('now'))",
        user
      );
    }
  }

  const settingsCount = Number(getScalar(db, "select count(*) from settings") || 0);
  if (!settingsCount) {
    const defaults = [
      ["system_name", "TryGC Revenue OS"],
      ["currency", "USD"],
      ["date_format", "%Y-%m-%d"],
      ["markets", JSON.stringify(["North America", "MENA", "Europe", "Enterprise"])],
      ["business_types", JSON.stringify(["Software", "Advisory", "Hardware", "Services"])],
      ["lead_sources", JSON.stringify(["Website", "Referral", "Outbound", "Event", "Partner"])],
      ["priorities", JSON.stringify(["Low", "Medium", "High", "Critical"])]
    ];

    for (const setting of defaults) {
      db.run("insert into settings (key, value) values (?, ?)", setting);
    }
  }

  const stageCount = Number(getScalar(db, "select count(*) from stages") || 0);
  if (!stageCount) {
    const stages = [
      ["Lead In", "#60a5fa", 15, "open", 1, 1],
      ["Qualified", "#34d399", 35, "open", 1, 2],
      ["Proposal", "#f59e0b", 60, "open", 1, 3],
      ["Negotiation", "#a78bfa", 80, "open", 1, 4],
      ["Closed Won", "#22c55e", 100, "won", 1, 5],
      ["Closed Lost", "#f87171", 0, "lost", 1, 6]
    ];

    for (const stage of stages) {
      db.run(
        'insert into stages (name, color, probability, type, active, "order") values (?, ?, ?, ?, ?, ?)',
        stage
      );
    }
  }

  const adminId = Number(getScalar(db, "select id from users where lower(email) = 'admin@local' limit 1") || 1);
  const managerId = Number(getScalar(db, "select id from users where lower(email) = 'manager@local' limit 1") || adminId);
  const salesId = Number(getScalar(db, "select id from users where lower(email) = 'sales@local' limit 1") || managerId);

  const leadStageId = Number(getScalar(db, "select id from stages where name = 'Lead In' limit 1") || 1);
  const qualifiedStageId = Number(getScalar(db, "select id from stages where name = 'Qualified' limit 1") || leadStageId);
  const proposalStageId = Number(getScalar(db, "select id from stages where name = 'Proposal' limit 1") || qualifiedStageId);
  const negotiationStageId = Number(getScalar(db, "select id from stages where name = 'Negotiation' limit 1") || proposalStageId);
  const wonStageId = Number(getScalar(db, "select id from stages where type = 'won' limit 1") || negotiationStageId);
  const lostStageId = Number(getScalar(db, "select id from stages where type = 'lost' limit 1") || negotiationStageId);

  const accountCount = Number(getScalar(db, "select count(*) from accounts") || 0);
  if (!accountCount) {
    const accounts = [
      ["Northstar Retail", "Retail", "Emma Stone", "+1 555 102 998", "emma@northstar.example", "Austin", managerId, "Expansion opportunity across 14 stores."],
      ["Helio Logistics", "Logistics", "Youssef Karim", "+971 55 441 882", "ops@helio.example", "Dubai", salesId, "High-intent demo completed; pricing review pending."],
      ["BluePeak Capital", "Finance", "Daniel Reyes", "+1 555 301 112", "daniel@bluepeak.example", "New York", salesId, "Interested in premium reporting roll-up."],
      ["Aster Labs", "Healthcare", "Mia Turner", "+44 20 3123 990", "mia@aster.example", "London", managerId, "Needs stakeholder alignment before procurement."],
      ["Vertex Energy", "Energy", "Layla Hamdan", "+971 50 883 229", "layla@vertex.example", "Abu Dhabi", adminId, "Executive sponsor engaged."],
      ["Cedar Hotels", "Hospitality", "Noah Bennett", "+1 555 212 477", "noah@cedar.example", "Chicago", managerId, "Re-engagement campaign in progress."]
    ];

    for (const account of accounts) {
      db.run(
        "insert into accounts (name, industry, contact_name, phone, email, location, assigned_to, notes, created_at) values (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))",
        account
      );
    }
  }

  const northstarId = Number(getScalar(db, "select id from accounts where name = 'Northstar Retail' limit 1") || 1);
  const helioId = Number(getScalar(db, "select id from accounts where name = 'Helio Logistics' limit 1") || northstarId);
  const bluePeakId = Number(getScalar(db, "select id from accounts where name = 'BluePeak Capital' limit 1") || helioId);
  const asterId = Number(getScalar(db, "select id from accounts where name = 'Aster Labs' limit 1") || bluePeakId);
  const vertexId = Number(getScalar(db, "select id from accounts where name = 'Vertex Energy' limit 1") || asterId);
  const cedarId = Number(getScalar(db, "select id from accounts where name = 'Cedar Hotels' limit 1") || vertexId);

  const dealCount = Number(getScalar(db, "select count(*) from deals") || 0);
  if (!dealCount) {
    const today = new Date();
    const toDate = (offset) => {
      const value = new Date(today);
      value.setDate(value.getDate() + offset);
      return value.toISOString().slice(0, 10);
    };
    const toDateTime = (offset) => {
      const value = new Date(today);
      value.setDate(value.getDate() + offset);
      return value.toISOString().slice(0, 19).replace("T", " ");
    };

    const deals = [
      [
        "Northstar Expansion Renewal",
        northstarId,
        "Emma Stone",
        "+1 555 102 998",
        "emma@northstar.example",
        "Software",
        "Partner",
        managerId,
        negotiationStageId,
        "open",
        82,
        126000,
        null,
        toDate(12),
        "Multi-region rollout is approved pending finance sign-off.",
        toDate(0),
        "High",
        "North America",
        toDateTime(-6),
        toDateTime(-1),
        0
      ],
      [
        "Helio Fleet Visibility Suite",
        helioId,
        "Youssef Karim",
        "+971 55 441 882",
        "ops@helio.example",
        "Services",
        "Outbound",
        salesId,
        proposalStageId,
        "open",
        60,
        84000,
        null,
        toDate(18),
        "Awaiting procurement questions and deployment timeline.",
        toDate(-1),
        "High",
        "MENA",
        toDateTime(-10),
        toDateTime(-2),
        0
      ],
      [
        "BluePeak Portfolio Dashboard",
        bluePeakId,
        "Daniel Reyes",
        "+1 555 301 112",
        "daniel@bluepeak.example",
        "Advisory",
        "Referral",
        salesId,
        qualifiedStageId,
        "open",
        42,
        56000,
        null,
        toDate(24),
        "Board requested an executive summary tailored to private equity reporting.",
        toDate(2),
        "Medium",
        "Enterprise",
        toDateTime(-14),
        toDateTime(-3),
        0
      ],
      [
        "Aster Labs Forecast Hub",
        asterId,
        "Mia Turner",
        "+44 20 3123 990",
        "mia@aster.example",
        "Software",
        "Website",
        managerId,
        leadStageId,
        "open",
        25,
        31000,
        null,
        toDate(35),
        "Early discovery with clinical operations and finance teams.",
        toDate(4),
        "Low",
        "Europe",
        toDateTime(-4),
        toDateTime(-1),
        0
      ],
      [
        "Vertex Energy Control Tower",
        vertexId,
        "Layla Hamdan",
        "+971 50 883 229",
        "layla@vertex.example",
        "Hardware",
        "Executive Referral",
        adminId,
        wonStageId,
        "won",
        100,
        142000,
        148500,
        toDate(-3),
        "Closed with a premium services package and quarterly review cadence.",
        toDate(-5),
        "Critical",
        "MENA",
        toDateTime(-22),
        toDateTime(-3),
        0
      ],
      [
        "Cedar Hotels Multi-Site Rollout",
        cedarId,
        "Noah Bennett",
        "+1 555 212 477",
        "noah@cedar.example",
        "Services",
        "Event",
        managerId,
        lostStageId,
        "lost",
        0,
        68000,
        0,
        toDate(-10),
        "Budget shifted to the next planning cycle after vendor comparison.",
        toDate(-7),
        "Medium",
        "North America",
        toDateTime(-18),
        toDateTime(-8),
        0
      ]
    ];

    for (const deal of deals) {
      db.run(
        `
          insert into deals (
            title, account_id, contact_name, phone, email, business_type, source, assigned_to, stage_id,
            status, probability, expected_value, closed_value, expected_close_date, notes,
            follow_up_date, priority, market, created_at, updated_at, archived
          ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        deal
      );
    }
  }

  const fieldCount = Number(getScalar(db, "select count(*) from custom_fields") || 0);
  if (!fieldCount) {
    const customFields = [
      ["deal", "Sales Motion", "select", JSON.stringify(["Inbound", "Outbound", "Partner", "Expansion"])],
      ["deal", "Decision Window", "select", JSON.stringify(["0-30 days", "31-60 days", "60+ days"])],
      ["account", "Account Tier", "select", JSON.stringify(["Strategic", "Growth", "Scaled"])]
    ];

    for (const field of customFields) {
      db.run("insert into custom_fields (entity_type, name, field_type, options) values (?, ?, ?, ?)", field);
    }
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const targetCount = Number(getScalar(db, "select count(*) from targets") || 0);
  if (!targetCount) {
    const targets = [
      [managerId, currentMonth, "revenue", 250000],
      [managerId, currentMonth, "deals", 8],
      [salesId, currentMonth, "revenue", 140000],
      [salesId, currentMonth, "deals", 5]
    ];

    for (const target of targets) {
      db.run("insert into targets (user_id, month, metric, value) values (?, ?, ?, ?)", target);
    }
  }

  const auditCount = Number(getScalar(db, "select count(*) from audit_logs") || 0);
  if (!auditCount) {
    db.run(
      "insert into audit_logs (user_id, action, entity_type, entity_id, detail, timestamp) values (?, 'bootstrap', 'workspace', null, ?, datetime('now'))",
      [adminId, "Workspace initialized with demo data and premium defaults."]
    );
  }
}

function createDatabase() {
  if (process.env.VERCEL && !fs.existsSync(DB_PATH) && fs.existsSync(SOURCE_DB_PATH)) {
    fs.copyFileSync(SOURCE_DB_PATH, DB_PATH);
  }
  const source = fs.existsSync(DB_PATH) ? fs.readFileSync(DB_PATH) : undefined;
  const db = source ? new SQL.Database(source) : new SQL.Database();
  db.exec("PRAGMA foreign_keys = ON");
  ensureSchema(db);
  persistDatabase(db);
  return db;
}

function persistDatabase(db) {
  const exported = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(exported));
}

function persist() {
  persistDatabase(getDb());
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

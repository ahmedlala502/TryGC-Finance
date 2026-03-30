import crypto from "node:crypto";
import { cookies } from "next/headers";
import { get, run } from "@/lib/db";

const SESSION_COOKIE = "sales_crm_session";
const SESSION_SECRET =
  process.env.SALES_CRM_SESSION_SECRET || "sales-crm-next-local-secret";

function sign(value) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

function verifySignedValue(value) {
  const [payload, signature] = String(value || "").split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }
  return payload;
}

function parseWerkzeugScrypt(hash) {
  const [method, salt, hexDigest] = String(hash || "").split("$");
  if (!method || !salt || !hexDigest || !method.startsWith("scrypt:")) {
    return null;
  }
  const [, n, r, p] = method.split(":");
  return {
    salt,
    digest: hexDigest,
    n: Number(n),
    r: Number(r),
    p: Number(p)
  };
}

export function verifyPassword(password, storedHash) {
  const parsed = parseWerkzeugScrypt(storedHash);
  if (!parsed) return false;
  const keyLength = parsed.digest.length / 2;
  const derived = crypto.scryptSync(password, parsed.salt, keyLength, {
    N: parsed.n,
    r: parsed.r,
    p: parsed.p,
    maxmem: 64 * 1024 * 1024
  });
  const actual = Buffer.from(parsed.digest, "hex");
  return crypto.timingSafeEqual(derived, actual);
}

export function generatePasswordHash(password) {
  const n = 32768;
  const r = 8;
  const p = 1;
  const salt = crypto.randomBytes(16).toString("base64").replace(/[+/=]/g, "").slice(0, 16);
  const key = crypto.scryptSync(password, salt, 64, {
    N: n,
    r,
    p,
    maxmem: 64 * 1024 * 1024
  });
  return `scrypt:${n}:${r}:${p}$${salt}$${key.toString("hex")}`;
}

export function createSessionValue(userId) {
  const payload = String(userId);
  return `${payload}.${sign(payload)}`;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = verifySignedValue(session);
  if (!payload) return null;

  const user = get(
    "select id, email, name, role, active from users where id = ?",
    Number(payload)
  );

  if (!user || !user.active) return null;
  return user;
}

export function setSessionCookie(response, userId) {
  response.cookies.set(SESSION_COOKIE, createSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });
}

export function findUserByEmail(email) {
  return get(
    "select id, email, name, role, active, hashed_password from users where lower(email) = ?",
    String(email || "").trim().toLowerCase()
  );
}

export function touchLastLogin(userId) {
  run("update users set last_login = datetime('now') where id = ?", userId);
}

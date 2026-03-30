import { NextResponse } from "next/server";
import { generatePasswordHash, getSessionUser } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { recordAudit } from "@/lib/mutations";

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  if (user.role !== "admin") return NextResponse.redirect(new URL("/", request.url), 303);

  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "sales").trim();
  const password = String(formData.get("password") || "");

  if (!name || !email || password.length < 8) {
    return NextResponse.redirect(new URL("/users", request.url), 303);
  }

  const existing = get("select id from users where lower(email) = ?", email);
  if (existing) {
    return NextResponse.redirect(new URL("/users", request.url), 303);
  }

  const result = run(
    "insert into users (email, name, role, hashed_password, active, created_at) values (?, ?, ?, ?, 1, datetime('now'))",
    email,
    name,
    role,
    generatePasswordHash(password)
  );

  recordAudit(user.id, "create", "user", Number(result.lastInsertRowid), `User created: ${email}`);
  return NextResponse.redirect(new URL("/users", request.url), 303);
}

import { NextResponse } from "next/server";
import { generatePasswordHash, getSessionUser } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { recordAudit } from "@/lib/mutations";

export async function POST(request, { params }) {
  const actor = await getSessionUser();
  if (!actor) return NextResponse.redirect(new URL("/login", request.url), 303);

  const { id } = await params;
  const userId = Number(id);
  const target = get("select id, email, name, role, active from users where id = ?", userId);
  if (!target) return NextResponse.redirect(new URL("/users", request.url), 303);
  if (actor.role !== "admin" && actor.id !== userId) return NextResponse.redirect(new URL("/", request.url), 303);

  const formData = await request.formData();
  const action = String(formData.get("action") || "");

  if (action === "delete") {
    if (actor.id === userId) return NextResponse.redirect(new URL("/users", request.url), 303);
    run("delete from users where id = ?", userId);
    recordAudit(actor.id, "delete", "user", userId, `User deleted: ${target.email}`);
    return NextResponse.redirect(new URL("/users", request.url), 303);
  }

  if (action === "toggle_active") {
    if (actor.id === userId) return NextResponse.redirect(new URL("/users", request.url), 303);
    run("update users set active = case when active = 1 then 0 else 1 end where id = ?", userId);
    recordAudit(actor.id, "toggle", "user", userId, `User active toggled: ${target.email}`);
    return NextResponse.redirect(new URL("/users", request.url), 303);
  }

  const name = String(formData.get("name") || target.name).trim();
  const email = String(formData.get("email") || target.email).trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const active = formData.has("active") ? 1 : 0;

  if (actor.role === "admin") {
    const role = String(formData.get("role") || target.role).trim();
    const nextActive = actor.id === userId ? 1 : active;
    if (password) {
      run(
        "update users set name = ?, email = ?, role = ?, active = ?, hashed_password = ? where id = ?",
        name,
        email,
        role,
        nextActive,
        generatePasswordHash(password),
        userId
      );
    } else {
      run("update users set name = ?, email = ?, role = ?, active = ? where id = ?", name, email, role, nextActive, userId);
    }
  } else {
    if (password) {
      run("update users set name = ?, email = ?, hashed_password = ? where id = ?", name, email, generatePasswordHash(password), userId);
    } else {
      run("update users set name = ?, email = ? where id = ?", name, email, userId);
    }
  }

  recordAudit(actor.id, "update", "user", userId, `User updated: ${email}`);
  return NextResponse.redirect(new URL(actor.role === "admin" ? "/users" : "/", request.url), 303);
}

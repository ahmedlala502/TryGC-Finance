import { NextResponse } from "next/server";
import { findUserByEmail, setSessionCookie, touchLastLogin, verifyPassword } from "@/lib/auth";

export async function POST(request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = findUserByEmail(email);
  if (!user || !user.active || !verifyPassword(password, user.hashed_password)) {
    return NextResponse.redirect(new URL("/login?error=Invalid%20email%20or%20password.", request.url), 303);
  }

  touchLastLogin(user.id);
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  setSessionCookie(response, user.id);
  return response;
}

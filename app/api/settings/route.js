import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { run } from "@/lib/db";
import { recordAudit } from "@/lib/mutations";
import { normalizeThemeConfig } from "@/lib/theme";

function toJsonList(value) {
  return JSON.stringify(
    String(value || "")
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function parseCheckbox(value) {
  return value === "on" || value === "true" ? "true" : "false";
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  if (!["admin", "manager"].includes(user.role)) return NextResponse.redirect(new URL("/", request.url), 303);

  const formData = await request.formData();

  const themeConfig = normalizeThemeConfig({
    mode: String(formData.get("theme_mode") || "system"),
    preset: String(formData.get("theme_preset") || "executive-gold"),
    bodyFont: String(formData.get("theme_body_font") || "manrope"),
    headingFont: String(formData.get("theme_heading_font") || "space-grotesk"),
    maxWidth: Number(formData.get("theme_max_width") || 1480),
    radius: Number(formData.get("theme_radius") || 24),
    blur: Number(formData.get("theme_blur") || 22),
    customCss: String(formData.get("theme_custom_css") || ""),
    dark: {
      accent: String(formData.get("dark_accent") || ""),
      accentStrong: String(formData.get("dark_accentStrong") || ""),
      bodyBg: String(formData.get("dark_bodyBg") || ""),
      bodyBg2: String(formData.get("dark_bodyBg2") || ""),
      cardBg: String(formData.get("dark_cardBg") || ""),
      surface: String(formData.get("dark_surface") || ""),
      surface2: String(formData.get("dark_surface2") || ""),
      textPrimary: String(formData.get("dark_textPrimary") || ""),
      textSecondary: String(formData.get("dark_textSecondary") || ""),
      textMuted: String(formData.get("dark_textMuted") || ""),
      borderColor: String(formData.get("dark_borderColor") || ""),
      sidebarBg: String(formData.get("dark_sidebarBg") || ""),
      topbarBg: String(formData.get("dark_topbarBg") || "")
    },
    light: {
      accent: String(formData.get("light_accent") || ""),
      accentStrong: String(formData.get("light_accentStrong") || ""),
      bodyBg: String(formData.get("light_bodyBg") || ""),
      bodyBg2: String(formData.get("light_bodyBg2") || ""),
      cardBg: String(formData.get("light_cardBg") || ""),
      surface: String(formData.get("light_surface") || ""),
      surface2: String(formData.get("light_surface2") || ""),
      textPrimary: String(formData.get("light_textPrimary") || ""),
      textSecondary: String(formData.get("light_textSecondary") || ""),
      textMuted: String(formData.get("light_textMuted") || ""),
      borderColor: String(formData.get("light_borderColor") || ""),
      sidebarBg: String(formData.get("light_sidebarBg") || ""),
      topbarBg: String(formData.get("light_topbarBg") || "")
    }
  });

  const values = {
    system_name: String(formData.get("system_name") || "TryGC Revenue OS"),
    workspace_mark: String(formData.get("workspace_mark") || "TG").slice(0, 3).toUpperCase(),
    workspace_tagline: String(formData.get("workspace_tagline") || "Revenue OS"),
    currency: String(formData.get("currency") || "USD"),
    locale: String(formData.get("locale") || "en-US"),
    timezone: String(formData.get("timezone") || "Africa/Cairo"),
    date_format: String(formData.get("date_format") || "%Y-%m-%d"),
    default_home: String(formData.get("default_home") || "/"),
    compact_mode: parseCheckbox(String(formData.get("compact_mode") || "")),
    markets: toJsonList(formData.get("markets")),
    business_types: toJsonList(formData.get("business_types")),
    lead_sources: toJsonList(formData.get("lead_sources")),
    priorities: toJsonList(formData.get("priorities")),
    theme_config: JSON.stringify(themeConfig)
  };

  for (const [key, value] of Object.entries(values)) {
    run(
      `
        insert into settings (key, value) values (?, ?)
        on conflict(key) do update set value = excluded.value
      `,
      key,
      value
    );
  }

  recordAudit(user.id, "settings_update", "setting", null, "Workspace settings and theme studio updated");
  return NextResponse.redirect(new URL("/settings", request.url), 303);
}

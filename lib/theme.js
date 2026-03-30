const FONT_STACKS = {
  manrope: 'var(--font-manrope), "Manrope", "Segoe UI", sans-serif',
  "dm-sans": 'var(--font-dm-sans), "DM Sans", "Segoe UI", sans-serif',
  outfit: 'var(--font-outfit), "Outfit", "Segoe UI", sans-serif',
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  "space-grotesk": 'var(--font-space-grotesk), "Space Grotesk", "Segoe UI", sans-serif',
  playfair: 'var(--font-playfair), "Playfair Display", Georgia, serif'
};

export const FONT_OPTIONS = [
  { value: "manrope", label: "Manrope" },
  { value: "dm-sans", label: "DM Sans" },
  { value: "outfit", label: "Outfit" },
  { value: "system", label: "System UI" },
  { value: "space-grotesk", label: "Space Grotesk" },
  { value: "playfair", label: "Playfair Display" }
];

export const DEFAULT_THEME_CONFIG = {
  mode: "system",
  preset: "executive-gold",
  bodyFont: "manrope",
  headingFont: "space-grotesk",
  maxWidth: 1480,
  radius: 24,
  blur: 22,
  customCss: "",
  dark: {
    accent: "#e8b54b",
    accentStrong: "#f4c968",
    bodyBg: "#07111f",
    bodyBg2: "#0d1a2d",
    cardBg: "#0a1323",
    surface: "#101c2f",
    surface2: "#17253e",
    textPrimary: "#f8fbff",
    textSecondary: "#b8c7de",
    textMuted: "#7f92af",
    borderColor: "#24354d",
    sidebarBg: "#091221",
    topbarBg: "#0c1627"
  },
  light: {
    accent: "#c78a16",
    accentStrong: "#e2a62f",
    bodyBg: "#f3f5fa",
    bodyBg2: "#eef2f8",
    cardBg: "#ffffff",
    surface: "#f8fafd",
    surface2: "#edf2f8",
    textPrimary: "#0d1b2a",
    textSecondary: "#42526b",
    textMuted: "#73839b",
    borderColor: "#d7e0ea",
    sidebarBg: "#f4f7fb",
    topbarBg: "#f7f9fc"
  }
};

export const THEME_PRESETS = {
  "executive-gold": DEFAULT_THEME_CONFIG,
  "ocean-circuit": {
    ...DEFAULT_THEME_CONFIG,
    preset: "ocean-circuit",
    bodyFont: "outfit",
    headingFont: "space-grotesk",
    dark: {
      accent: "#38bdf8",
      accentStrong: "#7dd3fc",
      bodyBg: "#041521",
      bodyBg2: "#082032",
      cardBg: "#0a2236",
      surface: "#102b42",
      surface2: "#173751",
      textPrimary: "#f3fbff",
      textSecondary: "#b9d4e5",
      textMuted: "#7290a6",
      borderColor: "#26485e",
      sidebarBg: "#071825",
      topbarBg: "#0b1d2b"
    },
    light: {
      accent: "#0284c7",
      accentStrong: "#0ea5e9",
      bodyBg: "#eff7fb",
      bodyBg2: "#e6f2f8",
      cardBg: "#ffffff",
      surface: "#f3fbff",
      surface2: "#e1f0f8",
      textPrimary: "#0a2233",
      textSecondary: "#416175",
      textMuted: "#6b879b",
      borderColor: "#c9dfec",
      sidebarBg: "#f2fafc",
      topbarBg: "#f7fdff"
    }
  },
  "editorial-rose": {
    ...DEFAULT_THEME_CONFIG,
    preset: "editorial-rose",
    bodyFont: "dm-sans",
    headingFont: "playfair",
    dark: {
      accent: "#fb7185",
      accentStrong: "#fda4af",
      bodyBg: "#1b1020",
      bodyBg2: "#25122a",
      cardBg: "#2b1630",
      surface: "#371d3e",
      surface2: "#452652",
      textPrimary: "#fff7fa",
      textSecondary: "#e6c7d0",
      textMuted: "#b68f9c",
      borderColor: "#5f345f",
      sidebarBg: "#201124",
      topbarBg: "#29142d"
    },
    light: {
      accent: "#e11d48",
      accentStrong: "#fb7185",
      bodyBg: "#fff6f8",
      bodyBg2: "#fff1f4",
      cardBg: "#ffffff",
      surface: "#fff8fa",
      surface2: "#ffeaf0",
      textPrimary: "#341826",
      textSecondary: "#6e4759",
      textMuted: "#9d7384",
      borderColor: "#f1ccd8",
      sidebarBg: "#fff8fa",
      topbarBg: "#fff7f9"
    }
  }
};

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(numeric, min), max);
}

function sanitizeColor(value, fallback) {
  const normalized = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : fallback;
}

function normalizePalette(palette, fallback) {
  return {
    accent: sanitizeColor(palette?.accent, fallback.accent),
    accentStrong: sanitizeColor(palette?.accentStrong, fallback.accentStrong),
    bodyBg: sanitizeColor(palette?.bodyBg, fallback.bodyBg),
    bodyBg2: sanitizeColor(palette?.bodyBg2, fallback.bodyBg2),
    cardBg: sanitizeColor(palette?.cardBg, fallback.cardBg),
    surface: sanitizeColor(palette?.surface, fallback.surface),
    surface2: sanitizeColor(palette?.surface2, fallback.surface2),
    textPrimary: sanitizeColor(palette?.textPrimary, fallback.textPrimary),
    textSecondary: sanitizeColor(palette?.textSecondary, fallback.textSecondary),
    textMuted: sanitizeColor(palette?.textMuted, fallback.textMuted),
    borderColor: sanitizeColor(palette?.borderColor, fallback.borderColor),
    sidebarBg: sanitizeColor(palette?.sidebarBg, fallback.sidebarBg),
    topbarBg: sanitizeColor(palette?.topbarBg, fallback.topbarBg)
  };
}

export function normalizeThemeConfig(rawTheme) {
  let parsed = rawTheme;
  if (typeof rawTheme === "string") {
    try {
      parsed = JSON.parse(rawTheme);
    } catch {
      parsed = {};
    }
  }

  const presetKey = parsed?.preset && THEME_PRESETS[parsed.preset] ? parsed.preset : DEFAULT_THEME_CONFIG.preset;
  const preset = THEME_PRESETS[presetKey];
  const bodyFont = FONT_STACKS[parsed?.bodyFont] ? parsed.bodyFont : preset.bodyFont;
  const headingFont = FONT_STACKS[parsed?.headingFont] ? parsed.headingFont : preset.headingFont;

  return {
    mode: ["light", "dark", "system"].includes(parsed?.mode) ? parsed.mode : preset.mode,
    preset: presetKey,
    bodyFont,
    headingFont,
    maxWidth: clampNumber(parsed?.maxWidth, 1120, 1920, preset.maxWidth),
    radius: clampNumber(parsed?.radius, 10, 32, preset.radius),
    blur: clampNumber(parsed?.blur, 0, 40, preset.blur),
    customCss: String(parsed?.customCss || "").trim(),
    dark: normalizePalette(parsed?.dark, preset.dark),
    light: normalizePalette(parsed?.light, preset.light)
  };
}

export function getThemeFontStack(fontKey, fallback) {
  return FONT_STACKS[fontKey] || FONT_STACKS[fallback] || FONT_STACKS.manrope;
}

export function themeConfigToCssObject(themeConfig) {
  const theme = normalizeThemeConfig(themeConfig);
  const radius = theme.radius;

  return {
    "--font-sans": getThemeFontStack(theme.bodyFont, "manrope"),
    "--font-headline": getThemeFontStack(theme.headingFont, "space-grotesk"),
    "--shell-max-width": `${theme.maxWidth}px`,
    "--surface-blur": `${theme.blur}px`,
    "--radius-xs": `${Math.max(4, Math.round(radius * 0.22))}px`,
    "--radius-sm": `${Math.max(8, Math.round(radius * 0.5))}px`,
    "--radius-md": `${Math.max(12, Math.round(radius * 0.66))}px`,
    "--radius-lg": `${Math.max(16, Math.round(radius * 0.84))}px`,
    "--radius-xl": `${radius}px`,
    "--accent": theme.dark.accent,
    "--accent-strong": theme.dark.accentStrong
  };
}

function paletteToCssLines(selector, palette) {
  return `${selector}{${[
    `--accent:${palette.accent}`,
    `--accent-strong:${palette.accentStrong}`,
    `--body-bg:${palette.bodyBg}`,
    `--body-bg-2:${palette.bodyBg2}`,
    `--card-bg:${palette.cardBg}`,
    `--surface:${palette.surface}`,
    `--surface-2:${palette.surface2}`,
    `--text-primary:${palette.textPrimary}`,
    `--text-secondary:${palette.textSecondary}`,
    `--text-muted:${palette.textMuted}`,
    `--border-color:${palette.borderColor}`,
    `--sidebar-bg:${palette.sidebarBg}`,
    `--topbar-bg:${palette.topbarBg}`
  ].join(";")}}`;
}

export function buildThemeStyleText(themeConfig) {
  const theme = normalizeThemeConfig(themeConfig);
  const rootObject = themeConfigToCssObject(theme);
  const rootLines = Object.entries(rootObject).map(([key, value]) => `${key}:${value}`).join(";");

  return [
    `:root{${rootLines}}`,
    paletteToCssLines('[data-theme="dark"]', theme.dark),
    paletteToCssLines('[data-theme="light"]', theme.light),
    theme.customCss || ""
  ].join("\n");
}

"use client";

import { useMemo, useState } from "react";
import { FONT_OPTIONS, THEME_PRESETS, normalizeThemeConfig, themeConfigToCssObject } from "@/lib/theme";

function listToText(values) {
  return Array.isArray(values) ? values.join(", ") : "";
}

function buildInitialState(settings) {
  const theme = normalizeThemeConfig(settings.theme);
  return {
    system_name: settings.system_name,
    workspace_mark: settings.workspace_mark,
    workspace_tagline: settings.workspace_tagline,
    currency: settings.currency,
    locale: settings.locale,
    timezone: settings.timezone,
    date_format: settings.date_format,
    default_home: settings.default_home,
    compact_mode: Boolean(settings.compact_mode),
    markets: listToText(settings.markets),
    business_types: listToText(settings.business_types),
    lead_sources: listToText(settings.lead_sources),
    priorities: listToText(settings.priorities),
    theme_mode: theme.mode,
    theme_preset: theme.preset,
    theme_body_font: theme.bodyFont,
    theme_heading_font: theme.headingFont,
    theme_max_width: String(theme.maxWidth),
    theme_radius: String(theme.radius),
    theme_blur: String(theme.blur),
    theme_custom_css: theme.customCss,
    dark_accent: theme.dark.accent,
    dark_accentStrong: theme.dark.accentStrong,
    dark_bodyBg: theme.dark.bodyBg,
    dark_bodyBg2: theme.dark.bodyBg2,
    dark_cardBg: theme.dark.cardBg,
    dark_surface: theme.dark.surface,
    dark_surface2: theme.dark.surface2,
    dark_textPrimary: theme.dark.textPrimary,
    dark_textSecondary: theme.dark.textSecondary,
    dark_textMuted: theme.dark.textMuted,
    dark_borderColor: theme.dark.borderColor,
    dark_sidebarBg: theme.dark.sidebarBg,
    dark_topbarBg: theme.dark.topbarBg,
    light_accent: theme.light.accent,
    light_accentStrong: theme.light.accentStrong,
    light_bodyBg: theme.light.bodyBg,
    light_bodyBg2: theme.light.bodyBg2,
    light_cardBg: theme.light.cardBg,
    light_surface: theme.light.surface,
    light_surface2: theme.light.surface2,
    light_textPrimary: theme.light.textPrimary,
    light_textSecondary: theme.light.textSecondary,
    light_textMuted: theme.light.textMuted,
    light_borderColor: theme.light.borderColor,
    light_sidebarBg: theme.light.sidebarBg,
    light_topbarBg: theme.light.topbarBg
  };
}

function buildThemeFromForm(form) {
  return normalizeThemeConfig({
    mode: form.theme_mode,
    preset: form.theme_preset,
    bodyFont: form.theme_body_font,
    headingFont: form.theme_heading_font,
    maxWidth: Number(form.theme_max_width),
    radius: Number(form.theme_radius),
    blur: Number(form.theme_blur),
    customCss: form.theme_custom_css,
    dark: {
      accent: form.dark_accent,
      accentStrong: form.dark_accentStrong,
      bodyBg: form.dark_bodyBg,
      bodyBg2: form.dark_bodyBg2,
      cardBg: form.dark_cardBg,
      surface: form.dark_surface,
      surface2: form.dark_surface2,
      textPrimary: form.dark_textPrimary,
      textSecondary: form.dark_textSecondary,
      textMuted: form.dark_textMuted,
      borderColor: form.dark_borderColor,
      sidebarBg: form.dark_sidebarBg,
      topbarBg: form.dark_topbarBg
    },
    light: {
      accent: form.light_accent,
      accentStrong: form.light_accentStrong,
      bodyBg: form.light_bodyBg,
      bodyBg2: form.light_bodyBg2,
      cardBg: form.light_cardBg,
      surface: form.light_surface,
      surface2: form.light_surface2,
      textPrimary: form.light_textPrimary,
      textSecondary: form.light_textSecondary,
      textMuted: form.light_textMuted,
      borderColor: form.light_borderColor,
      sidebarBg: form.light_sidebarBg,
      topbarBg: form.light_topbarBg
    }
  });
}

function ColorField({ label, name, value, onChange }) {
  return (
    <label className="settings-color-field">
      <span>{label}</span>
      <div className="settings-color-input">
        <input type="color" name={name} value={value} onChange={onChange} />
        <input type="text" value={value} readOnly spellCheck="false" aria-label={`${label} hex value`} />
      </div>
    </label>
  );
}

export function SettingsStudio({ settings }) {
  const [form, setForm] = useState(() => buildInitialState(settings));
  const [previewMode, setPreviewMode] = useState("dark");

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    updateField(name, type === "checkbox" ? checked : value);
  }

  function applyPreset(presetKey) {
    const preset = normalizeThemeConfig(THEME_PRESETS[presetKey] || THEME_PRESETS["executive-gold"]);
    setForm((current) => ({
      ...current,
      theme_preset: presetKey,
      theme_mode: preset.mode,
      theme_body_font: preset.bodyFont,
      theme_heading_font: preset.headingFont,
      theme_max_width: String(preset.maxWidth),
      theme_radius: String(preset.radius),
      theme_blur: String(preset.blur),
      dark_accent: preset.dark.accent,
      dark_accentStrong: preset.dark.accentStrong,
      dark_bodyBg: preset.dark.bodyBg,
      dark_bodyBg2: preset.dark.bodyBg2,
      dark_cardBg: preset.dark.cardBg,
      dark_surface: preset.dark.surface,
      dark_surface2: preset.dark.surface2,
      dark_textPrimary: preset.dark.textPrimary,
      dark_textSecondary: preset.dark.textSecondary,
      dark_textMuted: preset.dark.textMuted,
      dark_borderColor: preset.dark.borderColor,
      dark_sidebarBg: preset.dark.sidebarBg,
      dark_topbarBg: preset.dark.topbarBg,
      light_accent: preset.light.accent,
      light_accentStrong: preset.light.accentStrong,
      light_bodyBg: preset.light.bodyBg,
      light_bodyBg2: preset.light.bodyBg2,
      light_cardBg: preset.light.cardBg,
      light_surface: preset.light.surface,
      light_surface2: preset.light.surface2,
      light_textPrimary: preset.light.textPrimary,
      light_textSecondary: preset.light.textSecondary,
      light_textMuted: preset.light.textMuted,
      light_borderColor: preset.light.borderColor,
      light_sidebarBg: preset.light.sidebarBg,
      light_topbarBg: preset.light.topbarBg
    }));
  }

  const previewTheme = useMemo(() => buildThemeFromForm(form), [form]);
  const previewPalette = previewMode === "light" ? previewTheme.light : previewTheme.dark;
  const previewStyle = useMemo(
    () => ({
      ...themeConfigToCssObject(previewTheme),
      "--accent": previewPalette.accent,
      "--accent-strong": previewPalette.accentStrong,
      "--body-bg": previewPalette.bodyBg,
      "--body-bg-2": previewPalette.bodyBg2,
      "--card-bg": previewPalette.cardBg,
      "--surface": previewPalette.surface,
      "--surface-2": previewPalette.surface2,
      "--text-primary": previewPalette.textPrimary,
      "--text-secondary": previewPalette.textSecondary,
      "--text-muted": previewPalette.textMuted,
      "--border-color": previewPalette.borderColor,
      "--sidebar-bg": previewPalette.sidebarBg,
      "--topbar-bg": previewPalette.topbarBg
    }),
    [previewPalette, previewTheme]
  );

  const paletteFieldDefs = [
    ["accent", "Accent"],
    ["accentStrong", "Accent strong"],
    ["bodyBg", "Page background"],
    ["bodyBg2", "Page background alt"],
    ["cardBg", "Card background"],
    ["surface", "Surface"],
    ["surface2", "Surface alt"],
    ["textPrimary", "Primary text"],
    ["textSecondary", "Secondary text"],
    ["textMuted", "Muted text"],
    ["borderColor", "Border"],
    ["sidebarBg", "Sidebar"],
    ["topbarBg", "Topbar"]
  ];

  return (
    <form method="post" action="/api/settings" className="settings-layout">
      <div className="settings-main">
        <section className="card settings-section">
          <div className="card-header">
            <span className="card-title">Workspace Identity</span>
          </div>
          <div className="card-body settings-stack">
            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="system_name">System name</label>
                <input id="system_name" name="system_name" value={form.system_name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="workspace_mark">Logo mark</label>
                <input id="workspace_mark" name="workspace_mark" maxLength={3} value={form.workspace_mark} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="workspace_tagline">Tagline</label>
                <input id="workspace_tagline" name="workspace_tagline" value={form.workspace_tagline} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <input id="currency" name="currency" value={form.currency} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="locale">Locale</label>
                <input id="locale" name="locale" value={form.locale} onChange={handleChange} placeholder="en-US" />
              </div>
              <div className="form-group">
                <label htmlFor="timezone">Time zone</label>
                <input id="timezone" name="timezone" value={form.timezone} onChange={handleChange} placeholder="Africa/Cairo" />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="date_format">Date format</label>
                <input id="date_format" name="date_format" value={form.date_format} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="default_home">Default landing page</label>
                <select id="default_home" name="default_home" value={form.default_home} onChange={handleChange}>
                  <option value="/">Dashboard</option>
                  <option value="/deals">Deals</option>
                  <option value="/accounts">Accounts</option>
                  <option value="/performance">Performance</option>
                  <option value="/settings">Settings</option>
                </select>
              </div>
              <label className="settings-toggle">
                <input type="checkbox" name="compact_mode" checked={form.compact_mode} onChange={handleChange} />
                <span>
                  <strong>Compact density</strong>
                  <small>Tighten shell spacing and cards by default.</small>
                </span>
              </label>
            </div>
          </div>
        </section>

        <section className="card settings-section">
          <div className="card-header">
            <span className="card-title">Operational Defaults</span>
          </div>
          <div className="card-body settings-stack">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="markets">Markets</label>
                <textarea id="markets" name="markets" rows={3} value={form.markets} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="priorities">Priorities</label>
                <textarea id="priorities" name="priorities" rows={3} value={form.priorities} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="business_types">Business types</label>
                <textarea id="business_types" name="business_types" rows={4} value={form.business_types} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="lead_sources">Lead sources</label>
                <textarea id="lead_sources" name="lead_sources" rows={4} value={form.lead_sources} onChange={handleChange} />
              </div>
            </div>
          </div>
        </section>

        <section className="card settings-section">
          <div className="card-header">
            <span className="card-title">Theme Studio</span>
          </div>
          <div className="card-body settings-stack">
            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="theme_preset">Preset</label>
                <select
                  id="theme_preset"
                  name="theme_preset"
                  value={form.theme_preset}
                  onChange={(event) => applyPreset(event.target.value)}
                >
                  <option value="executive-gold">Executive Gold</option>
                  <option value="ocean-circuit">Ocean Circuit</option>
                  <option value="editorial-rose">Editorial Rose</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="theme_mode">Default mode</label>
                <select id="theme_mode" name="theme_mode" value={form.theme_mode} onChange={handleChange}>
                  <option value="system">Follow system</option>
                  <option value="dark">Always dark</option>
                  <option value="light">Always light</option>
                </select>
              </div>
              <div className="settings-preview-toggle">
                <button type="button" className={`btn btn-sm ${previewMode === "dark" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setPreviewMode("dark")}>
                  Preview dark
                </button>
                <button type="button" className={`btn btn-sm ${previewMode === "light" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setPreviewMode("light")}>
                  Preview light
                </button>
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="theme_body_font">Body font</label>
                <select id="theme_body_font" name="theme_body_font" value={form.theme_body_font} onChange={handleChange}>
                  {FONT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="theme_heading_font">Heading font</label>
                <select id="theme_heading_font" name="theme_heading_font" value={form.theme_heading_font} onChange={handleChange}>
                  {FONT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="settings-slider-grid">
                <label className="settings-slider-field">
                  <span>Shell width</span>
                  <input type="range" min="1120" max="1920" step="20" name="theme_max_width" value={form.theme_max_width} onChange={handleChange} />
                  <strong>{form.theme_max_width}px</strong>
                </label>
                <label className="settings-slider-field">
                  <span>Radius</span>
                  <input type="range" min="10" max="32" step="1" name="theme_radius" value={form.theme_radius} onChange={handleChange} />
                  <strong>{form.theme_radius}px</strong>
                </label>
                <label className="settings-slider-field">
                  <span>Glass blur</span>
                  <input type="range" min="0" max="40" step="1" name="theme_blur" value={form.theme_blur} onChange={handleChange} />
                  <strong>{form.theme_blur}px</strong>
                </label>
              </div>
            </div>

            <div className="settings-palette-grid">
              <div className="settings-palette-card">
                <div className="settings-palette-title">Dark palette</div>
                <div className="settings-color-grid">
                  {paletteFieldDefs.map(([key, label]) => (
                    <ColorField
                      key={`dark-${key}`}
                      label={label}
                      name={`dark_${key}`}
                      value={form[`dark_${key}`]}
                      onChange={handleChange}
                    />
                  ))}
                </div>
              </div>

              <div className="settings-palette-card">
                <div className="settings-palette-title">Light palette</div>
                <div className="settings-color-grid">
                  {paletteFieldDefs.map(([key, label]) => (
                    <ColorField
                      key={`light-${key}`}
                      label={label}
                      name={`light_${key}`}
                      value={form[`light_${key}`]}
                      onChange={handleChange}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="theme_custom_css">Advanced custom CSS</label>
              <textarea
                id="theme_custom_css"
                name="theme_custom_css"
                rows={6}
                value={form.theme_custom_css}
                onChange={handleChange}
                placeholder=".topbar { letter-spacing: 0.02em; }"
              />
            </div>
          </div>
        </section>

        <div className="settings-actions">
          <button type="submit" className="btn btn-primary">Save settings</button>
        </div>
      </div>

      <aside className="settings-preview-column">
        <div className="theme-preview-shell" style={previewStyle} data-theme={previewMode}>
          <div className="theme-preview-topbar">
            <div>
              <div className="theme-preview-eyebrow">{form.workspace_tagline}</div>
              <div className="theme-preview-title">{form.system_name}</div>
            </div>
            <div className="theme-preview-chip">{previewMode} preview</div>
          </div>

          <div className="theme-preview-hero">
            <div className="theme-preview-mark">{String(form.workspace_mark || "TG").slice(0, 3).toUpperCase()}</div>
            <div>
              <div className="theme-preview-heading">Typography, colors, and shell tone update live as you edit.</div>
              <div className="theme-preview-copy">
                Use presets for a fast direction, then fine-tune every token or drop into custom CSS for full control.
              </div>
            </div>
          </div>

          <div className="theme-preview-cards">
            <div className="theme-preview-card">
              <span>Accent</span>
              <strong>{previewPalette.accent}</strong>
            </div>
            <div className="theme-preview-card">
              <span>Body font</span>
              <strong>{FONT_OPTIONS.find((item) => item.value === form.theme_body_font)?.label || form.theme_body_font}</strong>
            </div>
            <div className="theme-preview-card">
              <span>Heading font</span>
              <strong>{FONT_OPTIONS.find((item) => item.value === form.theme_heading_font)?.label || form.theme_heading_font}</strong>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}

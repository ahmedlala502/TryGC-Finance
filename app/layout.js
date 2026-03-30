import "./globals.css";
import "./theme-upscale.css";
import { DM_Sans, Manrope, Outfit, Playfair_Display, Space_Grotesk } from "next/font/google";
import { getWorkspaceConfig } from "@/lib/data";
import { buildThemeStyleText } from "@/lib/theme";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "700"],
  display: "swap"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
  display: "swap"
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "700"],
  display: "swap"
});

export const metadata = {
  title: "TryGC Revenue OS",
  description: "Premium revenue operations workspace for pipeline, performance, and reporting."
};

export default function RootLayout({ children }) {
  const workspace = getWorkspaceConfig();
  const workspaceThemeStyle = buildThemeStyleText(workspace.theme);
  const preferredThemeMode = workspace.theme.mode;
  const density = workspace.compact_mode ? "compact" : "comfortable";

  return (
    <html lang="en" data-theme="dark" data-density={density} suppressHydrationWarning>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${outfit.variable} ${playfair.variable}`}>
        <style id="trygc-workspace-theme" dangerouslySetInnerHTML={{ __html: workspaceThemeStyle }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const stored = localStorage.getItem("trygc-theme");
                  const configuredMode = ${JSON.stringify(preferredThemeMode)};
                  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  const fallbackTheme = configuredMode === "light" || configuredMode === "dark"
                    ? configuredMode
                    : (systemDark ? "dark" : "light");
                  const theme = stored === "light" || stored === "dark" ? stored : fallbackTheme;
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.colorScheme = theme;
                } catch {
                  document.documentElement.dataset.theme = "dark";
                  document.documentElement.style.colorScheme = "dark";
                }
              })();
            `
          }}
        />
        {children}
      </body>
    </html>
  );
}

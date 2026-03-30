import "./globals.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const headlineFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-headline-face",
  weight: ["600", "700", "800"],
  display: "swap"
});

export const metadata = {
  title: "TryGC Revenue OS",
  description: "Premium revenue operations workspace for pipeline, performance, and reporting."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${bodyFont.variable} ${headlineFont.variable}`}>{children}</body>
    </html>
  );
}

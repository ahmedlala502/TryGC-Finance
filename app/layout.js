import "./globals.css";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

const headlineFont = Sora({
  subsets: ["latin"],
  variable: "--font-headline-face"
});

export const metadata = {
  title: "TryGc - Finance & Sales Dashboard",
  description: "TryGc finance and sales dashboard built with Next.js"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headlineFont.variable}`}>{children}</body>
    </html>
  );
}

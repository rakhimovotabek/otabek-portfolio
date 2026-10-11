import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/data/site";
import { profile } from "@/data/portfolio";
import "./globals.css";
const display = localFont({
  src: "./fonts/Syne.ttf",
  variable: "--font-display",
  display: "swap",
  weight: "400 800",
});
const body = localFont({
  src: "./fonts/DMSans.ttf",
  variable: "--font-body",
  display: "swap",
  weight: "100 1000",
});
export const metadata: Metadata = {
  title: `${site.brand} — A working archive`,
  description: `${site.brand} is the personal portfolio of ${profile.name}, a student developer from ${profile.country}. Software projects, experiments, and pursuits beyond the screen.`,
};
export const viewport: Viewport = { themeColor: "#151619" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}

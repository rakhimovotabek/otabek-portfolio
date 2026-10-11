import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/data/site";
import { profile } from "@/data/portfolio";
import "./globals.css";
import "./archive.css";
const body = localFont({
  src: "./fonts/DMSans.ttf",
  variable: "--font-body",
  display: "swap",
  weight: "100 1000",
});
const editorial = localFont({
  src: [
    { path: "./fonts/Newsreader.woff2", weight: "200 800", style: "normal" },
    {
      path: "./fonts/Newsreader-Italic.woff2",
      weight: "200 800",
      style: "italic",
    },
  ],
  variable: "--font-reading",
  display: "swap",
});
export const metadata: Metadata = {
  title: `${site.brand} — ${site.title}`,
  description: `The personal archive of ${profile.name}, a student developer from ${profile.country}. Selected software, visual studies, and a place for writing and photographs.`,
};
export const viewport: Viewport = { themeColor: "#141711" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${editorial.variable} ${body.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

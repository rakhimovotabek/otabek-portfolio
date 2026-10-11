import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Otabek Rakhimov — Student Developer",
  description:
    "The personal portfolio of Otabek Rakhimov, a student developer from Uzbekistan exploring computer science, software, and ideas.",
};
export const viewport: Viewport = { themeColor: "#101114" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

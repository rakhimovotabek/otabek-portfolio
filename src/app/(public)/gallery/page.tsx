import type { Metadata } from "next";
import { site } from "@/data/site";
import { PrintRoom } from "@/components/default/gallery";
export const metadata: Metadata = { title: `Gallery — ${site.brand}` };
export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const selected = ["photography", "drawing", "visual-experiment", "albums"].includes(category ?? "") ? category! : "all";
  return <PrintRoom category={selected} />;
}

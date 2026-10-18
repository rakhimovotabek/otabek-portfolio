import type { Metadata } from "next";
import { site } from "@/data/site";
import { workCategories, type WorkCategory } from "@/data/universe";
import { WorkRooms } from "@/components/default/work";
export const metadata: Metadata = { title: `Work — ${site.brand}` };
export default async function WorkPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const selected = workCategories.some(item => item.id === category) ? category as WorkCategory : "all";
  return <WorkRooms selected={selected} />;
}

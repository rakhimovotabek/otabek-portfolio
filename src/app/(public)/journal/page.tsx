import type { Metadata } from "next";
import { site } from "@/data/site";
import { JournalRoom } from "@/components/default/rooms";
export const metadata: Metadata = { title: `Journal — ${site.brand}` };
export default function Page() { return <JournalRoom />; }

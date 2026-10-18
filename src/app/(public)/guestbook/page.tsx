import type { Metadata } from "next";
import { site } from "@/data/site";
import { VisitorRoom } from "@/components/default/rooms";
export const metadata: Metadata = { title: `Guestbook — ${site.brand}` };
export default function Page() { return <VisitorRoom />; }

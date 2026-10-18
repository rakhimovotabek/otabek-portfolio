import type { Metadata } from "next";
import { site } from "@/data/site";
import { PresenceRoom } from "@/components/default/rooms";
export const metadata: Metadata = { title: `About — ${site.brand}` };
export default function Page() { return <PresenceRoom />; }

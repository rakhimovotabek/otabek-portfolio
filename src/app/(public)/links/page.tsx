import type { Metadata } from "next";
import { site } from "@/data/site";
import { AddressRoom } from "@/components/default/rooms";
export const metadata: Metadata = { title: `Links — ${site.brand}` };
export default function Page() { return <AddressRoom />; }

"use client";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/data/site";
export function OpenMessage() {
  return (
    <button
      type="button"
      className="text-link"
      aria-haspopup="dialog"
      onClick={() => window.dispatchEvent(new Event("portfolio:open-contact"))}
    >
      {site.contact.action} <ArrowUpRight size={18} aria-hidden="true" />
    </button>
  );
}

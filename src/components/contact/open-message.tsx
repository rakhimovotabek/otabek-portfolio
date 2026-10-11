"use client";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/data/site";
export function OpenMessage({
  label = site.contact.action,
  message,
}: {
  label?: string;
  message?: string;
}) {
  return (
    <button
      type="button"
      className="text-link"
      aria-haspopup="dialog"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("portfolio:open-contact", { detail: { message } }),
        )
      }
    >
      {label} <ArrowUpRight size={18} aria-hidden="true" />
    </button>
  );
}

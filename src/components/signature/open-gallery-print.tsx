"use client";
import type { ReactNode } from "react";
export function OpenGalleryPrint({ index, label, children }: { index: number; label: string; children: ReactNode }) {
  return <button type="button" aria-haspopup="dialog" aria-label={`Open ${label}`} onClick={event => window.dispatchEvent(new CustomEvent("portfolio:open-gallery-study", { detail: { index, origin: event.currentTarget } }))}>{children}</button>;
}

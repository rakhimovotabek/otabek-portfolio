"use client";
import { useState } from "react";
import { site } from "@/data/site";

export function QuietDiscovery() {
  const [found, setFound] = useState(false);
  return (
    <button
      className={`quiet-discovery ${found ? "is-found" : ""}`}
      type="button"
      aria-expanded={found}
      onClick={() => setFound((value) => !value)}
    >
      <span aria-hidden="true" className="discovery-mark">
        ↗
      </span>
      <span>{found ? site.discovery : "One last detail"}</span>
    </button>
  );
}

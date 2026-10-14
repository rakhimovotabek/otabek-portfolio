"use client";
import { useEffect, useRef, useState } from "react";
import { Link as LinkIcon, Mail } from "lucide-react";
import type { PublicIdentity } from "@/data/universe";
import styles from "./identity-directory.module.css";

const categories = [
  { id: "code", title: "Code & projects" },
  { id: "social", title: "Social & personal" },
  { id: "gaming", title: "Games & play" },
  { id: "contact", title: "Contact" },
  { id: "other", title: "Elsewhere" },
];

function CopyAddress({ url }: { url: string }) {
  const [state, setState] = useState("Copy address");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <button
      type="button"
      className={styles.copy}
      onClick={async () => {
        clearTimeout(timer.current);
        try {
          await navigator.clipboard.writeText(url);
          setState("Copied");
          timer.current = setTimeout(() => setState("Copy address"), 1800);
        } catch {
          setState("Select the address to copy");
        }
      }}
    >
      <span aria-live="polite">{state}</span>
      <span aria-hidden>{state === "Copied" ? "✓" : "+"}</span>
    </button>
  );
}

export function IdentityDirectory({
  entries,
}: {
  entries: readonly PublicIdentity[];
}) {
  return (
    <div className={`identity-directory ${styles.directory}`}>
      {categories.map((category) => {
        const links = entries.filter((entry) => entry.category === category.id);
        if (!links.length) return null;
        return (
          <section key={category.id} aria-labelledby={`${category.id}-heading`}>
            <h2 id={`${category.id}-heading`}>{category.title}</h2>
            <div>
              {links.map((link) => {
                const Icon = link.icon === "mail" ? Mail : LinkIcon;
                return (
                  <article key={link.id} className={styles.record}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="identity-link"
                    >
                      <Icon size={23} aria-hidden="true" />
                      <span className="identity-platform">
                        {link.platform}
                        <small>{link.profileName}</small>
                      </span>
                      <span className="identity-description">
                        {link.description}
                      </span>
                      <span className={styles.arrow} aria-hidden>
                        ↗
                      </span>
                    </a>
                    <details className={styles.address}>
                      <summary>
                        Profile address <span aria-hidden>+</span>
                      </summary>
                      <div className={styles.addressBody}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.url}
                        </a>
                        <CopyAddress url={link.url} />
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

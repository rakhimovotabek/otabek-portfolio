"use client";
import { ArrowUpRight, Menu } from "lucide-react";
import { useEffect, useRef } from "react";
import { site } from "@/data/site";
const links = [
  { href: "#work", label: "The Vault" },
  { href: "#about", label: "About" },
  { href: "#side-quests", label: "Side Quests" },
  { href: "#contact", label: "Contact" },
];
export function Navigation() {
  const menu = useRef<HTMLDetailsElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const anchors = header.current?.querySelectorAll<HTMLAnchorElement>(
            `a[href="#${entry.target.id}"]`,
          );
          if (entry.isIntersecting) {
            header.current
              ?.querySelectorAll("[aria-current]")
              .forEach((anchor) => anchor.removeAttribute("aria-current"));
            anchors?.forEach((anchor) =>
              anchor.setAttribute("aria-current", "location"),
            );
          } else
            anchors?.forEach((anchor) =>
              anchor.removeAttribute("aria-current"),
            );
        }
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    links.forEach(({ href }) => {
      const section = document.querySelector(href);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <header className="site-header" ref={header}>
      <a
        className="wordmark"
        href="#top"
        aria-label={`${site.brand}, back to top`}
      >
        {site.brand}
        <span className="brand-dot">.</span>
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
            {link.href === "#contact" && (
              <ArrowUpRight size={15} aria-hidden="true" />
            )}
          </a>
        ))}
      </nav>
      <span className="header-location">UZBEKISTAN / UZT</span>
      <details ref={menu} className="mobile-menu">
        <summary aria-label="Toggle navigation">
          <Menu size={23} aria-hidden="true" />
        </summary>
        <nav aria-label="Mobile navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => {
                if (menu.current) menu.current.open = false;
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </details>
    </header>
  );
}

"use client";
import { ArrowUpRight, Menu } from "lucide-react";
import { useRef } from "react";
const links = [
  { href: "#work", label: "Selected work" },
  { href: "#about", label: "About me" },
  { href: "#contact", label: "Contact" },
];
export function Navigation() {
  const menu = useRef<HTMLDetailsElement>(null);
  return (
    <header className="site-header">
      <a
        className="wordmark"
        href="#top"
        aria-label="Otabek Rakhimov, back to top"
      >
        otabek<span className="brand-dot">.</span>
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

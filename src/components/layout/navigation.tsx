"use client";
import { ArrowUpRight, Menu } from "lucide-react";
import { useRef } from "react";
import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import { OpenMessage } from "@/components/contact/open-message";
const links = site.navigation;
export function Navigation() {
  const menu = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  return (
    <header className="site-header reference-navigation">
      <Link
        className="wordmark"
        href="/"
        aria-label={`${site.brand}, back to top`}
      >
        {site.brand}
        <span className="brand-dot">.</span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname.startsWith(link.href) ? "page" : undefined}
          >
            {link.label}
            {link.href === "/guestbook" && (
              <ArrowUpRight size={15} aria-hidden="true" />
            )}
          </Link>
        ))}
      </nav>
      <div className="nav-correspondence"><OpenMessage label="Message me" /></div>
      <details ref={menu} className="mobile-menu">
        <summary aria-label="Toggle navigation">
          <Menu size={23} aria-hidden="true" />
        </summary>
        <nav aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              onClick={() => {
                if (menu.current) menu.current.open = false;
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </details>
    </header>
  );
}

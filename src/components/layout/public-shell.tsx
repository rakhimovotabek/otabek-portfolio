"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { CommunityProvider } from "@/components/community/community-provider";
import { ContactLauncher } from "@/components/contact/contact-launcher";
import { PublicMotion } from "@/components/default/public-motion";
import { Navigation } from "./navigation";
import { Footer } from "./footer";

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current !== pathname) {
      document.getElementById("main")?.focus({ preventScroll: true });
      previous.current = pathname;
    }
  }, [pathname]);
  return (
    <div className="other-side archive-site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <CommunityProvider>
        <PublicMotion key={pathname}>
          <Navigation />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </PublicMotion>
        <ContactLauncher />
      </CommunityProvider>
    </div>
  );
}

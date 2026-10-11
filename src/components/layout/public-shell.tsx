"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CommunityProvider } from "@/components/community/community-provider";
import { ContactLauncher } from "@/components/contact/contact-launcher";
import { PageMotion } from "@/components/motion/page-motion";
import { Navigation } from "./navigation";
import { Footer } from "./footer";

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={pathname === "/" ? "reference-home" : "archive-site"}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <CommunityProvider>
        <PageMotion key={pathname}>
          <Navigation />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </PageMotion>
        <ContactLauncher />
      </CommunityProvider>
    </div>
  );
}

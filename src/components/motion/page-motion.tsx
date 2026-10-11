"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { heroTimeline } from "./hero-timeline";
import { editorialTimelines } from "./editorial-timelines";
import { motionTokens as m } from "./tokens";

export function PageMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      document.fonts.ready,
    ])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (disposed || !root.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        cleanup = () => media.revert();
        media.add(
          {
            motion: m.preference,
            desktop: m.desktop,
            pointer: "(hover: hover) and (pointer: fine)",
          },
          (context) => {
            if (!context.conditions?.motion || !root.current) return;
            const title = root.current.querySelector(
              "[data-page-title] > span",
            );
            if (title)
              gsap.from(title, {
                yPercent: 105,
                duration: 0.85,
                ease: "power3.out",
                clearProps: "transform",
              });
            const heroCleanup = heroTimeline(
              gsap,
              root.current,
              !!context.conditions.desktop,
            );
            const editorialCleanup = editorialTimelines(
              gsap,
              root.current,
              !!context.conditions.desktop,
              !!context.conditions.pointer,
            );
            return () => {
              heroCleanup();
              editorialCleanup();
            };
          },
          root,
        );
      })
      .catch(() => {
        cleanup?.(); /* Restore readable SSR if enhancement fails. */
      });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);
  return (
    <div id="top" ref={root}>
      {children}
    </div>
  );
}

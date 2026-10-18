"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { heroTimeline } from "./hero-timeline";
import { editorialTimelines } from "./editorial-timelines";
import { motionTokens as m } from "./tokens";
import { roomTimelines } from "./room-timelines";

export function PageMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // ScrollTrigger may refresh during the next room's layout effect, after
    // React has cleared this room's ref but before passive cleanup runs.
    const host = root.current;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      document.fonts.ready,
    ])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (disposed || !host) return;
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
            if (!context.conditions?.motion) return;
            const roomCleanup = roomTimelines(
              gsap,
              host,
              !!context.conditions.pointer,
            );
            const heroCleanup = heroTimeline(
              gsap,
              host,
              !!context.conditions.desktop,
            );
            const editorialCleanup = editorialTimelines(
              gsap,
              host,
              !!context.conditions.desktop,
              !!context.conditions.pointer,
            );
            return () => {
              heroCleanup();
              editorialCleanup();
              roomCleanup();
            };
          },
          host,
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

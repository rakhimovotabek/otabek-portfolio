"use client";
import { useEffect, useRef, type ReactNode } from "react";
export function HeroMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (disposed || !root.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add(
          "(prefers-reduced-motion: no-preference)",
          () => {
            gsap.from(root.current!.querySelectorAll("[data-hero-reveal]"), {
              y: 35,
              opacity: 0,
              duration: 0.9,
              stagger: 0.12,
              ease: "power3.out",
              clearProps: "all",
            });
            gsap.to(root.current!.querySelector(".orbital-art"), {
              y: -45,
              rotation: 8,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom top",
                scrub: 1,
              },
            });
          },
          root,
        );
        cleanup = () => media.revert();
      })
      .catch(() => {
        /* Server-rendered content remains readable if motion fails. */
      });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);
  return (
    <div ref={root} className="hero-motion">
      {children}
    </div>
  );
}

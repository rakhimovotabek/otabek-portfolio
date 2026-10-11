"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionTokens as m } from "@/components/motion/tokens";

/** Same-route filter changes keep the heading, query URL and scroll position.
 * Only the replaced exhibition body unfolds, including honest empty states. */
export function FilterScene({
  selected,
  children,
}: {
  selected: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef(selected);
  useEffect(() => {
    const changed = previous.current !== selected;
    previous.current = selected;
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add(
      { motion: m.preference, pointer: "(hover: hover) and (pointer: fine)" },
      (context) => {
        if (!context.conditions?.motion || !root.current) return;
        if (changed)
          gsap.from(root.current, {
            clipPath: "inset(0 0 100% 0)",
            duration: 0.55,
            ease: "power3.out",
            clearProps: "clipPath",
          });
        const removers: (() => void)[] = [];
        root.current
          .querySelectorAll<HTMLElement>(".work-index-art")
          .forEach((host, index) => {
            gsap.from(host, {
              clipPath: "inset(0 0 100% 0)",
              y: index % 2 ? 16 : -16,
              duration: 0.95,
              ease: "power3.inOut",
              clearProps: "transform,clipPath",
              scrollTrigger: {
                trigger: host,
                start: "top 92%",
                toggleActions: "play none none reverse",
              },
            });
            const art = host.querySelector<HTMLElement>(
              ".artwork, .media-image",
            );
            if (!art || !context.conditions?.pointer) return;
            const x = gsap.quickTo(art, "x", { duration: 0.5, ease: m.ease });
            const y = gsap.quickTo(art, "y", { duration: 0.5, ease: m.ease });
            const scale = gsap.quickTo(art, "scale", {
              duration: 0.5,
              ease: m.ease,
            });
            let bounds: DOMRect | null = null;
            const enter = () => {
              bounds = host.getBoundingClientRect();
              scale(1.025);
            };
            const move = (event: PointerEvent) => {
              if (!bounds) return;
              x(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
              y(((event.clientY - bounds.top) / bounds.height - 0.5) * 8);
            };
            const leave = () => {
              bounds = null;
              x(0);
              y(0);
              scale(1);
            };
            host.addEventListener("pointerenter", enter);
            host.addEventListener("pointermove", move);
            host.addEventListener("pointerleave", leave);
            removers.push(() => {
              host.removeEventListener("pointerenter", enter);
              host.removeEventListener("pointermove", move);
              host.removeEventListener("pointerleave", leave);
              x.tween.kill();
              y.tween.kill();
              scale.tween.kill();
            });
          });
        return () => removers.forEach((remove) => remove());
      },
      root,
    );
    return () => media.revert();
  }, [selected]);
  return (
    <div ref={root} className="filter-scene" data-category={selected}>
      {children}
    </div>
  );
}

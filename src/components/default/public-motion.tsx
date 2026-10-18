"use client";
import { useEffect, useRef, type ReactNode } from "react";
/** One GSAP clock per scene; SSR, touch and reduced motion use ordinary flow. */
export function PublicMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = root.current;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      document.fonts.ready,
    ])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (!host || disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        cleanup = () => media.revert();
        media.add(
          "(min-width: 1024px) and (min-height: 650px) and (prefers-reduced-motion: no-preference) and (pointer: fine)",
          () => {
            const scenes = Array.from(
              host.querySelectorAll<HTMLElement>("[data-od-scene]"),
            );
            scenes.forEach((scene) => {
              scene.classList.add("od-motion-ready");
              const select = (s: string) => scene.querySelector<HTMLElement>(s);
              const tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: scene,
                  start: "top 88px",
                  end: "bottom bottom",
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              });
              const kind = scene.dataset.odScene;
              if (kind === "home") {
                const threshold = select("[data-home-threshold]")!,
                  next = select("[data-home-next]")!;
                tl.to(
                  select(".od-portal"),
                  { scale: 1.7, xPercent: -28, rotation: 0, duration: 0.5 },
                  0,
                )
                  .to(
                    select(".od-home-title"),
                    {
                      xPercent: -17,
                      yPercent: -10,
                      opacity: 0.18,
                      duration: 0.55,
                    },
                    0,
                  )
                  .to(
                    threshold,
                    { scale: 0.93, opacity: 0.18, duration: 0.5 },
                    0.4,
                  )
                  .fromTo(
                    next,
                    { yPercent: 105 },
                    { yPercent: 0, duration: 0.6 },
                    0.35,
                  );
                tl.eventCallback("onUpdate", () => {
                  const covered = tl.progress() > 0.65;
                  threshold.inert = covered;
                  next.inert = !covered;
                });
                next.inert = true;
              } else if (kind === "sat") {
                tl.to(
                  select(".od-answer-sheet"),
                  {
                    xPercent: -32,
                    yPercent: -5,
                    rotation: 0,
                    scale: 1.28,
                    duration: 1,
                  },
                  0,
                )
                  .to(
                    select(".od-question-mark"),
                    {
                      xPercent: 28,
                      yPercent: -12,
                      rotation: 18,
                      opacity: 0.3,
                      duration: 1,
                    },
                    0,
                  )
                  .to(
                    select(".od-book-spine"),
                    { xPercent: 20, yPercent: 30, rotation: -14, duration: 1 },
                    0,
                  );
                const trace = select("[data-learning-trace]");
                if (trace)
                  tl.fromTo(
                    trace,
                    { strokeDasharray: 1, strokeDashoffset: 1 },
                    { strokeDashoffset: 0, duration: 0.85 },
                    0.15,
                  );
              } else if (kind === "law") {
                tl.fromTo(
                  select(".od-folio-page"),
                  { rotationY: -48, rotation: 13, xPercent: 7 },
                  { rotationY: 0, rotation: -4, xPercent: -14, duration: 1 },
                  0,
                )
                  .to(
                    select(".od-folio-back"),
                    { rotation: -13, xPercent: -8, duration: 1 },
                    0,
                  )
                  .to(
                    select(".od-section-mark"),
                    { yPercent: -10, duration: 1 },
                    0,
                  );
              } else if (kind === "gallery") {
                tl.fromTo(
                  select(".od-gallery-aperture"),
                  {
                    clipPath: "inset(8% 28% 8% 28%)",
                    rotation: -6,
                    scale: 0.84,
                  },
                  {
                    clipPath: "inset(0% 0% 0% 0%)",
                    rotation: 0,
                    scale: 1.05,
                    duration: 0.72,
                  },
                  0,
                )
                  .to(
                    select(".od-rail-top"),
                    { xPercent: -25, yPercent: -28, duration: 1 },
                    0,
                  )
                  .to(
                    select(".od-rail-bottom"),
                    { xPercent: 25, yPercent: 28, duration: 1 },
                    0,
                  )
                  .to(
                    select(".od-gallery-type"),
                    { xPercent: -12, opacity: 0.18, duration: 1 },
                    0,
                  );
              }
            });
            const trace = host.querySelector("[data-od-trace]");
            if (trace)
              gsap.fromTo(
                trace,
                { strokeDasharray: 1, strokeDashoffset: 1 },
                {
                  strokeDashoffset: 0,
                  ease: "none",
                  scrollTrigger: {
                    trigger: trace.parentElement,
                    start: "top 70%",
                    end: "bottom 75%",
                    scrub: true,
                  },
                },
              );
            ScrollTrigger.refresh();
            return () =>
              scenes.forEach((scene) => {
                scene.classList.remove("od-motion-ready");
                scene.querySelectorAll<HTMLElement>("[inert]").forEach((el) => {
                  el.inert = false;
                });
              });
          },
          host,
        );
        host.dataset.odReady = "true";
      })
      .catch(() => cleanup?.());
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);
  return (
    <div id="top" data-od-root ref={root}>
      {children}
    </div>
  );
}

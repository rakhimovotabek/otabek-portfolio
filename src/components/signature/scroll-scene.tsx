"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import type { MotionEngine } from "@/components/motion/tokens";
import styles from "./signature.module.css";
import { galleryMotion } from "./gallery-motion";

export type SceneKind = "work" | "gallery" | "about";

/** Native sticky layout, one progress clock, and one transform owner per scene.
 * SSR/mobile/reduced-motion remain normal document flow. */
export function ScrollScene({
  kind,
  children,
  className = "",
}: {
  kind: SceneKind;
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const host = root.current;
    // Reserve the enhanced document length before Next restores history scroll.
    // No-JS and reduced-motion HTML keep their ordinary flow and no empty range.
    if (
      window.matchMedia(
        "(min-width: 800px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)",
      ).matches
    )
      host?.classList.add(styles.reserved);
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
          "(min-width: 800px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)",
          () => {
            const host = root.current!;
            host.classList.add(styles.enhanced);
            const teardown = createTimeline(gsap, host, kind);
            ScrollTrigger.refresh();
            return () => {
              teardown();
              host.classList.remove(styles.enhanced);
              delete host.dataset.progress;
            };
          },
          root,
        );
      })
      .catch(() => {
        cleanup?.();
        host?.classList.remove(styles.reserved);
      });
    return () => {
      disposed = true;
      cleanup?.();
      host?.classList.remove(styles.reserved);
    };
  }, [kind]);
  return (
    <section
      ref={root}
      className={`${styles.scene} ${styles[kind]} ${className}`}
      data-signature={kind}
    >
      {children}
    </section>
  );
}

function createTimeline(
  gsap: MotionEngine,
  host: HTMLElement,
  kind: SceneKind,
) {
  const q = (s: string) => host.querySelectorAll<HTMLElement>(s);
  const stage = host.querySelector<HTMLElement>("[data-stage]")!;
  const panels = Array.from(q("[data-exhibit]"));
  let current = -1;
  const activate = (index: number) => {
    if (current === index) return;
    current = index;
    panels.forEach((panel, i) => {
      panel.inert = i !== index;
      panel.setAttribute("aria-hidden", String(i !== index));
    });
    q("[data-jump]").forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
  };
  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: host,
      start: "top top",
      end: () => `+=${host.offsetHeight - stage.offsetHeight}`,
      scrub: 0.3,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        host.dataset.progress = self.progress.toFixed(3);
      },
    },
  });
  const listeners: (() => void)[] = [];
  if (kind === "work") {
    activate(0);
    timeline.eventCallback("onUpdate", () =>
      activate(timeline.progress() < 0.48 ? 0 : 1),
    );
    panels.forEach((panel, i) => {
      const art = panel.querySelector("[data-exhibit-art]");
      const title = panel.querySelector("[data-exhibit-title]");
      const copy = panel.querySelector("[data-exhibit-copy]");
      const geometry = panel.querySelector("svg");
      const start = i * 0.5;
      if (i) gsap.set(panel, { yPercent: 100 });
      gsap.set(copy, { autoAlpha: 0, y: 35 });
      if (i) timeline.to(panel, { yPercent: 0, duration: 0.12 }, 0.4);
      timeline.to(
        art,
        {
          x: () => -stage.clientWidth * 0.42,
          y: () => stage.clientHeight * 0.05,
          scale: 0.73,
          rotation: i ? 3 : -4,
          duration: 0.17,
        },
        start + 0.06,
      );
      timeline.to(
        title,
        {
          x: () => stage.clientWidth * 0.47,
          y: () => -stage.clientHeight * 0.07,
          scale: 0.5,
          duration: 0.17,
        },
        start + 0.06,
      );
      timeline.to(copy, { autoAlpha: 1, y: 0, duration: 0.1 }, start + 0.17);
      if (geometry)
        timeline.to(
          geometry,
          { rotation: i ? -12 : 16, scale: 1.15, duration: 0.26 },
          start,
        );
      if (!i) {
        timeline.to(panel, { yPercent: -24, duration: 0.12 }, 0.4);
        timeline.to(art, { rotation: -10, scale: 0.62, duration: 0.12 }, 0.4);
      }
    });
    timeline.to(q("[data-stage-rule]"), { scaleX: 1, duration: 1 }, 0);
    q("[data-jump]").forEach((button, i) => {
      const jump = () => {
        const trigger = timeline.scrollTrigger!;
        window.scrollTo({
          top:
            trigger.start + (trigger.end - trigger.start) * (i ? 0.77 : 0.27),
          behavior: "instant",
        });
        trigger.update();
        trigger.getTween()?.progress(1);
      };
      button.addEventListener("click", jump);
      listeners.push(() => button.removeEventListener("click", jump));
    });
  } else if (kind === "gallery") {
    galleryMotion(gsap, timeline, host, stage);
  } else if (kind === "about") {
    const frames = Array.from(q("[data-story-frame]"));
    const chapters = Array.from(q("[data-story-chapter]"));
    gsap.set(frames, { rotation: (i) => [0, 8, -9][i] });
    gsap.set(chapters.slice(1), {
      autoAlpha: 0,
      clipPath: "inset(0% 0% 100% 0%)",
    });
    timeline.to(
      chapters[0],
      { yPercent: -35, autoAlpha: 0, duration: 0.16 },
      0.1,
    );
    timeline.to(
      frames[0],
      {
        x: () => -stage.clientWidth * 0.48,
        scale: 0.76,
        rotation: -5,
        duration: 0.27,
      },
      0.12,
    );
    timeline.to(
      frames[1],
      {
        x: () => -stage.clientWidth * 0.43,
        y: () => -stage.clientHeight * 0.03,
        scale: 0.65,
        rotation: 7,
        duration: 0.27,
      },
      0.12,
    );
    timeline.to(
      frames[2],
      {
        x: () => -stage.clientWidth * 0.13,
        y: () => stage.clientHeight * 0.12,
        scale: 0.55,
        rotation: -8,
        duration: 0.27,
      },
      0.12,
    );
    timeline.set(chapters[1], { autoAlpha: 1 }, 0.27);
    timeline.to(
      chapters[1],
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.18 },
      0.27,
    );
    timeline.to(stage, { backgroundColor: "#d5d0e1", duration: 0.2 }, 0.14);
    timeline.to(chapters[1], { autoAlpha: 0, y: -35, duration: 0.13 }, 0.62);
    timeline.to(
      frames,
      {
        x: (i) => -stage.clientWidth * [0.48, 0.58, 0.45][i],
        y: (i) => -stage.clientHeight * [0.1, 0.14, 0.29][i],
        scale: (i) => [0.44, 0.44, 0.44][i],
        rotation: 0,
        duration: 0.22,
      },
      0.65,
    );
    timeline.to(stage, { backgroundColor: "#f0eee8", duration: 0.22 }, 0.66);
    timeline.set(chapters[2], { autoAlpha: 1 }, 0.69);
    timeline.to(
      chapters[2],
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.18 },
      0.69,
    );
    timeline.fromTo(
      q("[data-story-rule]"),
      { scaleX: 0 },
      { scaleX: 1, duration: 0.22 },
      0.76,
    );
    const update = () => {
      const p = timeline.progress();
      chapters.forEach((chapter, i) => {
        chapter.inert =
          i !== (p < 0.26 ? 0 : p < 0.69 ? 1 : 2) || (i === 2 && p < 0.87);
      });
    };
    timeline.eventCallback("onUpdate", update);
    update();
    listeners.push(() =>
      chapters.forEach((chapter) => {
        chapter.inert = false;
      }),
    );
  }
  timeline.to({}, { duration: 0.001 }, 0.999);
  return () => {
    listeners.forEach((remove) => remove());
    panels.forEach((panel) => {
      panel.inert = false;
      panel.removeAttribute("aria-hidden");
    });
  };
}

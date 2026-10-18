import type { MotionEngine } from "@/components/motion/tokens";

/** One reversible sequence: scattered prints → immersive crop → asymmetrical hanging. */
export function galleryMotion(gsap: MotionEngine, timeline: gsap.core.Timeline, host: HTMLElement, stage: HTMLElement) {
  const frames = Array.from(host.querySelectorAll<HTMLElement>("[data-gallery-frame]"));
  const labels = host.querySelectorAll("[data-gallery-caption]");
  gsap.set(host.querySelector("[data-gallery-surface]"), { y: 0, yPercent: 100 });
  gsap.set(frames, {
    x: i => stage.clientWidth * [0, -.34, -.16][i],
    y: i => stage.clientHeight * [0, -.05, .40][i],
    scale: i => [1, .62, .45][i],
    rotation: i => [3, -9, 8][i],
  });
  gsap.set(labels, { autoAlpha: 0 });
  gsap.set(host.querySelectorAll("[data-gallery-focus],[data-gallery-index-title]"), { autoAlpha: 0 });
  timeline.to(host.querySelector("[data-gallery-title]"), { yPercent: -25, autoAlpha: 0, duration: .18 }, .05);
  timeline.to(frames[0], { x: () => -stage.clientWidth * .18, y: 0, scale: 2.4, rotation: 0, duration: .29 }, .12);
  frames.slice(1).forEach((frame, i) => {
    timeline.to(frame, { x: () => (i ? 1 : -1) * stage.clientWidth * .65, autoAlpha: 0, duration: .25 }, .12);
  });
  timeline.to(host.querySelector("[data-gallery-focus]"), { autoAlpha: 1, duration: .08 }, .35);
  timeline.to(host.querySelector("[data-gallery-focus]"), { autoAlpha: 0, duration: .08 }, .52);
  timeline.to(host.querySelector("[data-gallery-surface]"), { yPercent: 0, duration: .3 }, .59);
  timeline.to(frames, {
    x: i => stage.clientWidth * [-.39, -.05, .16][i],
    y: i => stage.clientHeight * [.03, .16, -.03][i],
    scale: i => [.66, .60, .60][i], rotation: i => [-4, 0, 5][i], autoAlpha: 1, duration: .30,
  }, .59);
  timeline.to(host.querySelector("[data-gallery-index-title]"), { autoAlpha: 1, duration: .1 }, .85);
  timeline.to(labels, { autoAlpha: 1, duration: .1 }, .86);
  timeline.to(host.querySelector("[data-gallery-rule]"), { scaleX: 1, duration: 1 }, 0);
}

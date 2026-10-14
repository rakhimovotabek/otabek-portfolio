import type { MotionEngine } from "@/components/motion/tokens";

/** Gallery only: folded depth -> cropped close-up -> an open triptych. */
export function galleryMotion(gsap: MotionEngine, timeline: gsap.core.Timeline, host: HTMLElement, stage: HTMLElement) {
  const frames = Array.from(host.querySelectorAll<HTMLElement>("[data-gallery-frame]"));
  const apertures = frames.map(frame => frame.querySelector("[data-gallery-aperture]")!);
  const labels = host.querySelectorAll("[data-gallery-caption]");
  gsap.set(host.querySelector("[data-gallery-surface]"), { y: 0, yPercent: 100 });
  gsap.set(frames, {
    x: i => i === 1 ? -stage.clientWidth * .14 : i === 2 ? stage.clientWidth * .14 : 0,
    y: i => i ? stage.clientHeight * .065 : 0,
    scale: i => i ? .82 : 1,
    rotationY: i => i === 1 ? 26 : i === 2 ? -26 : 0,
    transformPerspective: 1400,
  });
  gsap.set(apertures.slice(1), { clipPath: "inset(0% 12% 0% 12%)" });
  gsap.set(labels, { autoAlpha: 0 });
  gsap.set(host.querySelectorAll("[data-gallery-focus],[data-gallery-index-title]"), { autoAlpha: 0 });
  timeline.to(host.querySelector("[data-gallery-title]"), { yPercent: -35, autoAlpha: 0, duration: .17 }, .06);
  timeline.to(frames[0], {
    x: () => -stage.clientWidth * .19,
    y: () => stage.clientHeight * .005,
    scale: 2.7,
    duration: .27,
  }, .16);
  frames.slice(1).forEach((frame, i) => {
    timeline.to(frame, {
      x: () => (i ? 1 : -1) * stage.clientWidth * .52,
      y: () => stage.clientHeight * (i ? .1 : -.06),
      scale: .65,
      rotationY: i ? -38 : 38,
      autoAlpha: 0,
      duration: .27,
    }, .14);
  });
  timeline.to(host.querySelector("[data-gallery-focus]"), { autoAlpha: 1, duration: .1 }, .35);
  timeline.to(host.querySelector("[data-gallery-focus]"), { autoAlpha: 0, duration: .07 }, .56);
  timeline.to(frames, {
    x: i => stage.clientWidth * ([-.48, -.17, .14][i]),
    y: () => stage.clientHeight * .015,
    scale: .88,
    rotationY: 0,
    autoAlpha: 1,
    duration: .28,
  }, .62);
  timeline.to(apertures, { clipPath: "inset(0% 0% 0% 0%)", duration: .24 }, .65);
  timeline.to(host.querySelector("[data-gallery-surface]"), { yPercent: 0, duration: .28 }, .62);
  timeline.set(stage, { color: "#111114" }, .9);
  timeline.to(host.querySelector("[data-gallery-index-title]"), { autoAlpha: 1, duration: .1 }, .88);
  timeline.to(labels, { autoAlpha: 1, duration: .09 }, .86);
  timeline.to(host.querySelector("[data-gallery-rule]"), { scaleX: 1, duration: 1 }, 0);
}

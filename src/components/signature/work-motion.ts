import type { MotionEngine } from "@/components/motion/tokens";

/** The original poster → exhibit story, with media and provenance kept in frame. */
export function workMotion(gsap: MotionEngine, timeline: gsap.core.Timeline, host: HTMLElement, stage: HTMLElement) {
  const panels = Array.from(host.querySelectorAll<HTMLElement>("[data-exhibit]"));
  panels.forEach((panel, i) => {
    const start = i * .5;
    const art = panel.querySelector("[data-exhibit-art]");
    const title = panel.querySelector("[data-exhibit-title]");
    const copy = panel.querySelector("[data-exhibit-copy]");
    const caption = panel.querySelector("[data-exhibit-caption]");
    if (i) {
      gsap.set(panel, { yPercent: 100 });
      timeline.to(panel, { yPercent: 0, duration: .14 }, .37);
    }
    timeline.to(art, {
      x: () => -stage.clientWidth * .43,
      y: () => -stage.clientHeight * .01,
      scale: .82,
      rotation: i ? 2 : -2,
      duration: .24,
    }, start + .02);
    timeline.to(title, {
      x: () => stage.clientWidth * .51,
      y: () => -stage.clientHeight * (i ? .025 : .07),
      scale: i ? .55 : .5,
      duration: .24,
    }, start + .02);
    timeline.to(copy, {
      x: () => stage.clientWidth * .51,
      y: () => -stage.clientHeight * .07,
      duration: .24,
    }, start + .02);
    timeline.to(caption, {
      x: () => -stage.clientWidth * .38,
      duration: .24,
    }, start + .02);
    // A single compositional handoff. No extra geometry loops or blank reveal gap.
    if (!i) timeline.to(panel, { yPercent: -18, duration: .14 }, .37);
  });
  timeline.to(host.querySelector("[data-stage-rule]"), { scaleX: 1, duration: 1 }, 0);
}

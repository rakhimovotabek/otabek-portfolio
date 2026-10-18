import type { MotionEngine } from "@/components/motion/tokens";

/** Poster expands into a study desk; the next room arrives as a horizontal folio. */
export function workMotion(gsap: MotionEngine, timeline: gsap.core.Timeline, host: HTMLElement, stage: HTMLElement) {
  const panels = Array.from(host.querySelectorAll<HTMLElement>("[data-exhibit]"));
  const sat = panels[0], law = panels[1];
  timeline.to(sat.querySelector('[data-exhibit-title]'), { yPercent: -62, xPercent: -8, scale: 1.1, duration: .28 }, .03);
  timeline.to(sat.querySelector('[data-exhibit-art]'), { x: () => -stage.clientWidth * .15, y: () => -stage.clientHeight * .13, scale: 1.2, duration: .28 }, .03);
  timeline.to(sat.querySelector('[data-product-main]'), { rotation: 0, duration: .28 }, .03);
  timeline.to(sat.querySelector('[data-product-detail]'), { xPercent: 38, yPercent: -13, rotation: 0, duration: .28 }, .03);
  gsap.set(law, { xPercent: 100 });
  timeline.to(law, { xPercent: 0, duration: .18 }, .38);
  timeline.to(sat, { xPercent: -20, duration: .18 }, .38);
  timeline.to(law.querySelector('[data-product-main]'), { xPercent: -20, yPercent: 5, rotation: -9, duration: .24 }, .62);
  timeline.to(law.querySelector('[data-product-detail]'), { xPercent: 10, rotation: 13, duration: .24 }, .62);
  timeline.to(law.querySelector('[data-exhibit-title]'), { xPercent: -10, yPercent: -4, duration: .24 }, .62);
  timeline.to(host.querySelector('[data-stage-rule]'), { scaleX: 1, duration: 1 }, 0);
}

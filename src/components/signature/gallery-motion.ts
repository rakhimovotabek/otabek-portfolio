import type { MotionEngine } from "@/components/motion/tokens";

/** The aperture opens into a full field; the field breaks into a quiet contact sheet. */
export function galleryMotion(gsap: MotionEngine, timeline: gsap.core.Timeline, host: HTMLElement, stage: HTMLElement) {
  const frames = Array.from(host.querySelectorAll<HTMLElement>('[data-gallery-frame]'));
  const masks = host.querySelectorAll('[data-gallery-aperture]');
  gsap.set(host.querySelector('[data-gallery-surface]'), { y: 0, yPercent: 100 });
  gsap.set(frames, { x: i => stage.clientWidth * [0, -.37, .36][i], y: i => stage.clientHeight * [0, .32, .30][i], scale: i => [1, .25, .22][i], rotation: i => [0, -8, 6][i] });
  gsap.set(host.querySelectorAll('[data-gallery-caption],[data-gallery-focus],[data-gallery-index-title]'), { autoAlpha: 0 });
  timeline.to(host.querySelector('[data-gallery-title]'), { xPercent: -40, autoAlpha: 0, duration: .23 }, .05);
  timeline.to(host.querySelector('[data-stage] > span:not([data-gallery-focus])'), { autoAlpha: 0, duration: .15 }, .1);
  timeline.to(frames[0], { x: () => -stage.clientWidth * .005, scale: 1.65, duration: .25 }, .13);
  timeline.to(masks[0], { clipPath: 'inset(0% round 0%)', duration: .25 }, .13);
  timeline.to(frames.slice(1), { x: i => stage.clientWidth * (i ? .8 : -.8), autoAlpha: 0, duration: .23 }, .12);
  timeline.to(host.querySelector('[data-gallery-focus]'), { autoAlpha: 1, duration: .08 }, .36);
  timeline.to(host.querySelector('[data-gallery-focus]'), { autoAlpha: 0, duration: .08 }, .52);
  timeline.to(host.querySelector('[data-gallery-surface]'), { yPercent: 0, duration: .28 }, .6);
  timeline.to(frames, { x: i => stage.clientWidth * [-.345, -.01, .31][i], y: i => stage.clientHeight * [0, .075, -.12][i], scale: i => [.4, .34, .28][i], rotation: 0, autoAlpha: 1, duration: .28 }, .6);
  timeline.to(host.querySelector('[data-gallery-index-title]'), { autoAlpha: 1, duration: .1 }, .84);
  timeline.to(host.querySelectorAll('[data-gallery-caption]'), { autoAlpha: 1, duration: .1 }, .86);
  timeline.to(host.querySelector('[data-gallery-rule]'), { scaleX: 1, duration: 1 }, 0);
}

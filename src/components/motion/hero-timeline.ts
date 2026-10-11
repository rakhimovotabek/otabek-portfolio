import type { MotionEngine } from "./tokens";
import { motionTokens as m } from "./tokens";

export function heroTimeline(
  gsap: MotionEngine,
  root: HTMLElement,
  desktop: boolean,
) {
  const select = gsap.utils.selector(root);
  // Entrance owns inner layers; scroll owns their outer composition.
  const opening = gsap.timeline({
    defaults: { ease: m.ease, duration: m.entrance },
  });
  opening
    .from(select(".wordmark-reveal"), { yPercent: 105 }, 0)
    .from(
      select(".hero-intro .motion-line > span"),
      { yPercent: 110, stagger: 0.1 },
      0.18,
    )
    .from(
      select(".hero-art > svg"),
      { scale: 0.86, rotation: -7, opacity: 0, transformOrigin: "50% 50%" },
      0.12,
    )
    .from(
      select(".hero-art path"),
      { x: (i: number) => (i % 2 ? 12 : -12), duration: 1.1 },
      0.12,
    )
    .from(
      select(
        ".hero-kicker, .hero-intro .eyebrow, .hero-description, .hero-intro .text-link, .hero-art figcaption, .scroll-cue, .hero-footnote",
      ),
      {
        opacity: 0,
        y: 8,
        stagger: 0.055,
        duration: 0.6,
        clearProps: "opacity,transform",
      },
      0.45,
    );
  gsap
    .timeline({
      scrollTrigger: {
        trigger: root.querySelector(".hero"),
        start: "top top",
        end: "bottom top",
        scrub: m.scrub,
      },
      defaults: { ease: "none" },
    })
    .to(
      select(".hero-wordmark"),
      {
        y: desktop ? -65 : -24,
        scale: desktop ? 0.97 : 1,
        transformOrigin: "0 0",
      },
      0,
    )
    .to(select(".hero-art"), { y: desktop ? -85 : -28, rotation: 3 }, 0)
    .to(select(".hero-footnote"), { y: -12 }, 0);
}

import type { MotionEngine } from "./tokens";
import { motionTokens as m } from "./tokens";

export function heroTimeline(
  gsap: MotionEngine,
  root: HTMLElement,
  desktop: boolean,
) {
  const select = gsap.utils.selector(root);
  // Inner masks own the entrance; outer layers own the scroll composition.
  gsap
    .timeline({ defaults: { ease: "expo.out", duration: 1.35 } })
    .from(
      select(".hero-art-reveal"),
      { clipPath: "inset(90% 0 0 0)", y: 24, duration: 1.5 },
      0,
    )
    .from(
      select(".wordmark-reveal"),
      { yPercent: 112, rotation: 2, transformOrigin: "0 100%" },
      0.1,
    )
    .from(
      select(".hero-art .volume-page"),
      { y: 9, opacity: 0, stagger: 0.014, duration: 0.8 },
      0.35,
    )
    .from(
      select(".hero-intro .motion-line > span"),
      { yPercent: 115, stagger: 0.13, duration: 1.1 },
      0.38,
    )
    .from(
      select(
        ".hero-kicker, .hero-index, .hero-identity, .hero-description, .hero-intro .text-link, .hero-art figcaption, .scroll-cue, .hero-footnote",
      ),
      {
        opacity: 0,
        y: 7,
        stagger: 0.055,
        duration: 0.65,
        clearProps: "opacity,transform",
      },
      0.46,
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
        y: desktop ? -44 : -16,
        scale: desktop ? 1.025 : 1,
        transformOrigin: "0 50%",
      },
      0,
    )
    .to(select(".hero-art"), { y: desktop ? -110 : -38 }, 0)
    .to(
      select(".hero-art .study-volume"),
      {
        y: desktop ? 30 : 12,
        rotation: desktop ? -3 : 0,
        transformOrigin: "50% 50%",
      },
      0,
    )
    .to(select(".hero-index"), { y: -16 }, 0);
}

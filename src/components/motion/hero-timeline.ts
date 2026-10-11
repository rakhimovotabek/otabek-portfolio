import type { MotionEngine } from "./tokens";

/** Otabek's prototype timings, expressed as a normalized, reversible GSAP scene. */
export function heroTimeline(
  gsap: MotionEngine,
  root: HTMLElement,
  desktop: boolean,
) {
  const journey = root.querySelector<HTMLElement>("[data-hero-journey]");
  if (!journey) return () => {};
  const stage = journey.querySelector<HTMLElement>("[data-hero-stage]")!;
  const worlds = journey.querySelector<HTMLElement>("[data-hero-worlds]")!;
  const focus = journey.querySelector<HTMLElement>("[data-hero-focus]")!;
  const letters = journey.querySelectorAll("[data-hero-letter]");
  const cards = journey.querySelectorAll<HTMLElement>("[data-world]");
  const head = journey.querySelector("[data-hero-head]");
  const smooth = (value: number) => value * value * (3 - 2 * value);
  journey.classList.add("is-enhanced");
  let currentPhase = "";
  const activate = (progress: number) => {
    const phase =
      progress >= 0.83 ? "transition" : progress >= 0.38 ? "focus" : "opening";
    if (phase === currentPhase) return;
    currentPhase = phase;
    const disappearing = phase === "opening" ? focus : worlds;
    if (
      disappearing.contains(document.activeElement) ||
      (phase === "transition" && focus.contains(document.activeElement))
    ) {
      root
        .querySelector<HTMLAnchorElement>(".reference-navigation .wordmark")
        ?.focus({ preventScroll: true });
    }
    worlds.inert = phase !== "opening";
    worlds.setAttribute("aria-hidden", String(phase !== "opening"));
    focus.inert = phase !== "focus";
    focus.setAttribute("aria-hidden", String(phase !== "focus"));
    journey.dataset.heroPhase = phase;
  };
  activate(0);
  // Inner characters own entrance; their parent letters own scroll departure.
  gsap.from(journey.querySelectorAll("[data-character]"), {
    y: 70,
    opacity: 0,
    duration: 1,
    stagger: 0.033,
    ease: "expo.out",
    clearProps: "transform,opacity",
  });
  const scene = gsap.timeline({
    defaults: { ease: smooth },
    scrollTrigger: {
      id: "hero-worlds",
      trigger: journey,
      start: "top top",
      end: () => `+=${Math.max(1, journey.offsetHeight - stage.offsetHeight)}`,
      scrub: desktop ? 0.35 : 0.18,
      invalidateOnRefresh: true,
    },
    onUpdate: function () {
      activate(this.progress());
    },
  });
  scene
    .to(
      journey.querySelector("[data-hero-progress]"),
      { scaleX: 1, duration: 1, ease: "none" },
      0,
    )
    .to(head, { y: -60, opacity: 0.04, duration: 0.16 }, 0.07)
    .to(letters, { y: -84, scale: 0.79, opacity: 0.05, duration: 0.16 }, 0.07)
    .to(
      journey.querySelector("[data-hero-scroll]"),
      { opacity: 0, duration: 0.1 },
      0,
    );
  cards.forEach((card, i) => {
    scene.to(
      card,
      {
        y: Math.sin(i * 1.4) * 28,
        rotation: [0, -1, 1.5, 0][i],
        duration: 0.16,
      },
      0.07,
    );
    scene.to(
      card,
      {
        x: [-100, -30, 30, 100][i] * (desktop ? 1 : 0.5),
        y: Math.sin(i * 1.4) * 28 - 20,
        scale: 0.9,
        opacity: 0,
        duration: 0.29,
      },
      0.22,
    );
  });
  scene
    .fromTo(
      focus,
      { opacity: 0, clipPath: "inset(0 100% 0 0 round 5px)" },
      { opacity: 1, clipPath: "inset(0 0% 0 0 round 5px)", duration: 0.29 },
      0.22,
    )
    .fromTo(
      journey.querySelector("[data-focus-copy]"),
      { y: desktop ? 65 : 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.29 },
      0.22,
    )
    .fromTo(
      journey.querySelector("[data-focus-art]"),
      {
        transformPerspective: 700,
        rotationY: desktop ? -25 : -10,
        rotation: 11,
        x: desktop ? 150 : 45,
        y: 30,
      },
      {
        rotationY: desktop ? -17 : -6,
        rotation: desktop ? 6 : 3,
        x: 0,
        y: 0,
        duration: 0.29,
      },
      0.22,
    )
    .to(focus, { opacity: 0.3, duration: 0.24 }, 0.72)
    .to(
      journey.querySelector("[data-focus-copy]"),
      { y: -20, duration: 0.24 },
      0.72,
    )
    .fromTo(
      journey.querySelector("[data-hero-wipe]"),
      // Reset the prototype's computed pixel translation before using percent
      // transforms; otherwise the original 180% offset is applied twice.
      {
        x: 0,
        y: 0,
        yPercent: 180,
        rotation: -7,
        scale: 1.4,
        transformOrigin: "50% 100%",
      },
      { y: 0, yPercent: 0, duration: 0.24 },
      0.72,
    )
    .to({}, { duration: 0.04 }, 0.96);

  const editorial = root.querySelector<HTMLElement>("[data-hero-editorial]");
  if (editorial) {
    gsap.from(editorial.querySelector("[data-editorial-heading]"), {
      y: 25,
      clipPath: "inset(0 0 100% 0)",
      ease: "power2.out",
      scrollTrigger: {
        trigger: editorial,
        start: "top 93%",
        end: "top 44%",
        scrub: true,
      },
    });
    gsap.from(editorial.querySelectorAll("[data-editorial-card]"), {
      y: (i: number) => [65, 105, 45][i],
      x: (i: number) => [-25, 35, 12][i],
      opacity: 0,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: editorial.querySelector("[data-editorial-card]"),
        start: "top 97%",
        end: "top 42%",
        scrub: true,
      },
    });
  }
  return () => {
    journey.classList.remove("is-enhanced");
    delete journey.dataset.heroPhase;
    worlds.inert = false;
    worlds.removeAttribute("aria-hidden");
    focus.inert = true;
    focus.setAttribute("aria-hidden", "true");
  };
}

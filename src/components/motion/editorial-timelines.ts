import type { MotionEngine } from "./tokens";
import { motionTokens as m } from "./tokens";

export function editorialTimelines(
  gsap: MotionEngine,
  root: HTMLElement,
  desktop: boolean,
  pointer: boolean,
) {
  const select = gsap.utils.selector(root);
  [
    ".about-section",
    ".vault-section",
    ".quests-section",
    ".achievements-section",
    ".site-footer",
  ].forEach((selector) => {
    const section = root.querySelector(selector);
    gsap.fromTo(
      section,
      { "--handoff": 0.18 },
      {
        "--handoff": 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "top 20%",
          scrub: true,
        },
      },
    );
  });
  // Five handoffs: open the editorial frame, split the Vault title, fan the
  // collage, draw milestone rules, then unfold the closing signature.
  for (const selector of [
    ".about-head h2",
    ".vault-heading h2",
    ".quests-heading h2",
    ".achievements-heading h2",
    ".contact-heading h2",
  ]) {
    const heading = root.querySelector(selector);
    gsap.from(heading, {
      clipPath: "inset(0 0 100% 0)",
      y: 18,
      ease: m.ease,
      scrollTrigger: {
        trigger: heading,
        start: "top 92%",
        end: "top 58%",
        scrub: true,
      },
    });
  }
  gsap.from(select(".portrait-grid"), {
    clipPath: "inset(0 100% 0 0)",
    ease: "none",
    scrollTrigger: {
      trigger: ".about-feature",
      start: "top 90%",
      end: "top 50%",
      scrub: true,
    },
  });
  gsap.from(select(".portrait-initial"), {
    y: desktop ? 35 : 16,
    ease: "none",
    scrollTrigger: {
      trigger: ".about-feature",
      start: "top bottom",
      end: "bottom top",
      scrub: m.scrub,
    },
  });
  // Prose moves only at entry, never continuously as it is being read.
  gsap.utils
    .toArray<HTMLElement>(select(".about-story > p"))
    .forEach((paragraph) => {
      gsap.from(paragraph, {
        y: 12,
        ease: m.ease,
        scrollTrigger: {
          trigger: paragraph,
          start: "top 94%",
          end: "top 79%",
          scrub: true,
        },
      });
    });
  gsap.from(select(".vault-heading h2 > span:not(.vault-count)"), {
    x: desktop ? 50 : 16,
    ease: "none",
    scrollTrigger: {
      trigger: ".vault-heading",
      start: "top 90%",
      end: "top 40%",
      scrub: true,
    },
  });
  gsap.from(select(".vault-end .serif-word"), {
    x: desktop ? -25 : -10,
    ease: "none",
    scrollTrigger: {
      trigger: ".vault-end",
      start: "top 95%",
      end: "top 55%",
      scrub: true,
    },
  });
  const cards = gsap.utils.toArray<HTMLElement>(select(".quest"));
  cards.forEach((card, i) => {
    // Card transforms are scroll-owned; decorative inner layers are pointer-owned.
    gsap.from(card, {
      y: [38, 65, 22, 40, 55, 24, 35][i],
      rotation: desktop ? [-1.4, 1.4, 0, -0.8, 0.8, 0, -0.6][i] : 0,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 98%",
        end: "top 66%",
        scrub: true,
      },
    });
  });
  gsap.from(select(".quests-star"), {
    rotation: -55,
    scale: 0.7,
    ease: "none",
    scrollTrigger: {
      trigger: ".quests-heading",
      start: "top bottom",
      end: "bottom 35%",
      scrub: true,
    },
  });
  gsap.utils.toArray<HTMLElement>(select(".milestone")).forEach((milestone) => {
    gsap.from(milestone, {
      "--rule-progress": 0,
      ease: "none",
      scrollTrigger: {
        trigger: milestone,
        start: "top 88%",
        end: "top 55%",
        scrub: true,
      },
    });
    gsap.from(milestone.querySelector(".milestone-number"), {
      y: 20,
      clipPath: "inset(0 0 100% 0)",
      ease: m.ease,
      scrollTrigger: {
        trigger: milestone,
        start: "top 92%",
        end: "top 65%",
        scrub: true,
      },
    });
  });
  gsap.from(select(".contact-fold"), {
    y: 35,
    rotation: -8,
    scale: 0.9,
    ease: "none",
    scrollTrigger: {
      trigger: ".site-footer",
      start: "top bottom",
      end: "bottom bottom",
      scrub: m.scrub,
    },
  });
  gsap.from(select(".footer-wordmark"), {
    y: desktop ? 60 : 20,
    clipPath: "inset(0 0 100% 0)",
    ease: "none",
    scrollTrigger: {
      trigger: ".footer-wordmark",
      start: "top 98%",
      end: "bottom 98%",
      scrub: true,
    },
  });

  const removers: (() => void)[] = [];
  if (pointer) {
    cards.forEach((card) => {
      const artwork = card.querySelector<HTMLElement>(
        ".quest-maze, .debate-quote, .quest-lock",
      );
      if (!artwork) return;
      const x = gsap.quickTo(artwork, "x", { duration: 0.35, ease: m.ease });
      const rotate = gsap.quickTo(artwork, "rotation", {
        duration: 0.4,
        ease: m.ease,
      });
      // Measure once on entry, never on every pointer/scroll frame.
      let bounds: DOMRect;
      const enter = () => {
        bounds = card.getBoundingClientRect();
      };
      const move = (event: PointerEvent) => {
        if (!bounds) return;
        const relative = gsap.utils.clamp(
          -0.5,
          0.5,
          (event.clientX - bounds.left) / bounds.width - 0.5,
        );
        x(relative * 12);
        rotate(relative * 5);
      };
      const leave = () => {
        x(0);
        rotate(0);
      };
      card.addEventListener("pointerenter", enter);
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      removers.push(() => {
        card.removeEventListener("pointerenter", enter);
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
      });
    });
  }
  return () => removers.forEach((remove) => remove());
}

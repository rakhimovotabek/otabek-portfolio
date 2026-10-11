import type { MotionEngine } from "./tokens";
import { motionTokens as m } from "./tokens";

export function editorialTimelines(
  gsap: MotionEngine,
  root: HTMLElement,
  desktop: boolean,
  pointer: boolean,
) {
  const select = gsap.utils.selector(root);
  const reveal = (
    selector: string,
    from: gsap.TweenVars,
    start = "top 91%",
    end = "top 48%",
  ) => {
    const element = root.querySelector(selector);
    if (!element) return;
    gsap.from(element, {
      ...from,
      ease: m.ease,
      scrollTrigger: { trigger: element, start, end, scrub: true },
    });
  };
  // Different section identities share pacing, not identical fade-up effects.
  reveal(".about-head h2", { clipPath: "inset(0 0 100% 0)", y: 32 });
  reveal(".vault-heading h2", { clipPath: "inset(0 100% 0 0)", x: -18 });
  reveal(".vault-heading h2 > span:not(.vault-count)", {
    x: desktop ? 55 : 15,
  });
  reveal(".archive-heading h2", { x: desktop ? -28 : -10 });
  reveal(".sketchbook-heading h2", { clipPath: "inset(0 0 85% 0)", y: 18 });
  reveal(".quests-heading h2", { y: 22, rotation: -0.7 });
  reveal(".achievements-heading h2", { y: 16 });
  reveal(".guestbook-layout h2", { clipPath: "inset(0 0 100% 0)", y: 18 });
  reveal(".contact-heading h2", {
    clipPath: "inset(0 100% 0 0)",
    x: desktop ? -25 : -10,
  });

  // Unfold image masks once they approach the reader; prose itself stays steady.
  gsap.utils
    .toArray<HTMLElement>(select(".media-window"))
    .filter((el) => !el.closest(".archive-entry"))
    .filter((el) => !el.closest(".inner-page"))
    .forEach((frame, i) => {
      gsap.from(frame, {
        clipPath: i % 2 ? "inset(0 0 0 100%)" : "inset(100% 0 0 0)",
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: frame,
          start: "top 96%",
          end: "top 48%",
          scrub: true,
        },
      });
      if (desktop)
        gsap.fromTo(
          frame.querySelector(".media-image"),
          { yPercent: 4, scale: 1.08 },
          {
            yPercent: -4,
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: m.scrub,
            },
          },
        );
    });
  gsap.utils
    .toArray<HTMLElement>(select(".about-story > p"))
    .forEach((paragraph) => {
      gsap.from(paragraph, {
        y: 9,
        scrollTrigger: {
          trigger: paragraph,
          start: "top 95%",
          end: "top 82%",
          scrub: true,
        },
      });
    });
  reveal(".presence-afternote > div > p", { y: 15 }, "top 94%", "top 67%");
  reveal(".vault-end .serif-word", { x: desktop ? -24 : -8 });

  // This handoff closes the exhibition on a line, then opens the paper index.
  const archive = root.querySelector(".archive-section");
  if (archive)
    gsap.from(archive, {
      "--index-rule": 0,
      ease: "none",
      scrollTrigger: {
        trigger: archive,
        start: "top bottom",
        end: "top 30%",
        scrub: true,
      },
    });
  const writing = root.querySelector(".writing-piece");
  if (writing)
    gsap.from(select(".writing-line > span"), {
      yPercent: 110,
      rotation: 0.5,
      stagger: 0.12,
      ease: "power2.out",
      scrollTrigger: {
        trigger: writing,
        start: "top 85%",
        end: "top 37%",
        scrub: true,
      },
    });
  reveal(".writing-title h2", { x: desktop ? 28 : 10 });

  const cards = gsap.utils.toArray<HTMLElement>(select(".quest"));
  cards.forEach((card, i) =>
    gsap.from(card, {
      y: [30, 55, 18, 34, 46, 21, 28][i],
      rotation: desktop ? [-1, 1.2, 0, -0.5, 0.6, 0, -0.4][i] : 0,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 98%",
        end: "top 62%",
        scrub: true,
      },
    }),
  );
  gsap.utils.toArray<HTMLElement>(select(".milestone")).forEach((milestone) => {
    gsap.from(milestone, {
      "--rule-progress": 0,
      ease: "none",
      scrollTrigger: {
        trigger: milestone,
        start: "top 89%",
        end: "top 52%",
        scrub: true,
      },
    });
    gsap.from(milestone.querySelector(".milestone-number"), {
      x: -9,
      clipPath: "inset(0 100% 0 0)",
      ease: m.ease,
      scrollTrigger: {
        trigger: milestone,
        start: "top 92%",
        end: "top 62%",
        scrub: true,
      },
    });
  });
  reveal(
    ".footer-wordmark",
    { y: desktop ? 50 : 15, clipPath: "inset(0 0 100% 0)" },
    "top 99%",
    "bottom 98%",
  );

  // Small inner graphic responses: never move reading text under the pointer.
  const removers: (() => void)[] = [];
  if (pointer)
    cards.forEach((card) => {
      const art = card.querySelector<HTMLElement>(
        ".quest-maze, .debate-quote, .quest-lock",
      );
      if (!art) return;
      const x = gsap.quickTo(art, "x", { duration: 0.45, ease: m.ease });
      const rotate = gsap.quickTo(art, "rotation", {
        duration: 0.5,
        ease: m.ease,
      });
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
        x(relative * 10);
        rotate(relative * 4);
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
  return () => removers.forEach((remove) => remove());
}

import type { MotionEngine } from "./tokens";
import { motionTokens as m } from "./tokens";

/** Inner rooms own their media/illustration transforms. Existing homepage
 * choreography and editorial milestone transforms keep their original owner. */
export function roomTimelines(
  gsap: MotionEngine,
  root: HTMLElement,
  pointer: boolean,
) {
  const page = root.querySelector<HTMLElement>(".inner-page");
  if (!page) return () => {};
  const removers: (() => void)[] = [];
  const select = <T extends Element = HTMLElement>(selector: string) =>
    Array.from(page.querySelectorAll<T>(selector));
  const title = page.querySelector("[data-page-title] > span");
  const entry = () => {
    const timeline = gsap.timeline({ defaults: { ease: m.ease } });
    const reading = page.classList.contains("journal-page");
    const portrait = page.classList.contains("about-page");
    if (title)
      timeline.from(
        title,
        {
          yPercent: reading ? 18 : 104,
          x: portrait ? 18 : 0,
          clipPath: reading ? "inset(0 100% 0 0)" : "inset(0 0 0 0)",
          duration: reading ? 0.95 : 0.82,
          clearProps: "transform,clipPath",
        },
        0,
      );
    timeline.from(
      select(".page-label > *"),
      {
        opacity: 0,
        y: 7,
        stagger: 0.07,
        duration: 0.5,
        clearProps: "opacity,transform",
      },
      0.12,
    );
    // Supporting copy stays in place; no animated text while reading.
    timeline.from(
      select(".page-heading > p"),
      { opacity: 0, duration: 0.55, clearProps: "opacity" },
      0.27,
    );
    return timeline;
  };
  let entrance: gsap.Context | undefined;
  let entered = false;
  const enter = () => {
    if (!entered) {
      entered = true;
      entrance = gsap.context(() => {
        entry();
      }, page);
    }
  };
  // Wait for the cover handoff if dynamic imports resolve before the new room.
  // The revealed event also handles timeout/interruption without hidden content.
  if (document.documentElement.dataset.routeMotion) {
    window.addEventListener("portfolio:route-enter", enter, { once: true });
    window.addEventListener("portfolio:route-revealed", enter, { once: true });
  } else enter();

  select<HTMLElement>(".media-window")
    .filter((frame) => !frame.closest("dialog, .filter-scene"))
    .forEach((frame, index) => {
      gsap.from(frame, {
        clipPath: page.classList.contains("gallery-page")
          ? index % 2
            ? "inset(0 0 0 100%)"
            : "inset(0 100% 0 0)"
          : "inset(100% 0 0 0)",
        duration: 1.05,
        ease: "power3.inOut",
        clearProps: "clipPath",
        scrollTrigger: {
          trigger: frame,
          start: "top 92%",
          toggleActions: "play none none reverse",
        },
      });
      if (pointer && frame.querySelector(".media-image"))
        gsap.fromTo(
          frame.querySelector(".media-image"),
          { yPercent: -2, scale: 1.06 },
          {
            yPercent: 2,
            scale: 1.06,
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

  const rule = page.querySelector(".unwritten-rule");
  if (rule)
    gsap.from(rule, {
      scaleX: 0,
      transformOrigin: "left",
      duration: 1.3,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: rule,
        start: "top 92%",
        toggleActions: "play none none reverse",
      },
    });
  const reading = page.querySelector(".reading-column");
  if (reading)
    gsap.fromTo(
      page.querySelector(".reading-progress > span"),
      { scaleX: 0 },
      {
        scaleX: 1,
        transformOrigin: "left",
        ease: "none",
        scrollTrigger: {
          trigger: reading,
          start: "top 35%",
          end: "bottom 35%",
          scrub: true,
        },
      },
    );
  select(".about-notebook h2, .portrait-story h2").forEach((heading) =>
    gsap.from(heading, {
      clipPath: "inset(0 100% 0 0)",
      duration: 0.95,
      ease: m.ease,
      clearProps: "clipPath",
      scrollTrigger: {
        trigger: heading,
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
    }),
  );
  const project = page.querySelector(".work-detail-art");
  if (project)
    gsap.from(project, {
      scale: 0.96,
      clipPath: "inset(8% 8% 0 8%)",
      duration: 1,
      ease: m.ease,
      clearProps: "transform,clipPath",
      scrollTrigger: {
        trigger: project,
        start: "top 94%",
        toggleActions: "play none none reverse",
      },
    });

  // Inner SVG geometry responds to pointer only while exploring the artwork;
  // the outer link and its scroll reveal never share this transform owner.
  if (pointer)
    select<HTMLElement>(".album-preview").forEach((host) => {
      const inner = host.querySelector<HTMLElement>(
        ".artwork, .media-image > [role='img']",
      );
      if (!inner) return;
      const x = gsap.quickTo(inner, "x", { duration: 0.5, ease: m.ease });
      const y = gsap.quickTo(inner, "y", { duration: 0.5, ease: m.ease });
      const scale = gsap.quickTo(inner, "scale", {
        duration: 0.6,
        ease: m.ease,
      });
      let bounds: DOMRect | null = null;
      const enterPointer = () => {
        bounds = host.getBoundingClientRect();
        scale(1.025);
      };
      const move = (event: PointerEvent) => {
        if (!bounds) return;
        x(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
        y(((event.clientY - bounds.top) / bounds.height - 0.5) * 8);
      };
      const leave = () => {
        bounds = null;
        x(0);
        y(0);
        scale(1);
      };
      host.addEventListener("pointerenter", enterPointer);
      host.addEventListener("pointermove", move);
      host.addEventListener("pointerleave", leave);
      removers.push(() => {
        host.removeEventListener("pointerenter", enterPointer);
        host.removeEventListener("pointermove", move);
        host.removeEventListener("pointerleave", leave);
        x.tween.kill();
        y.tween.kill();
        scale.tween.kill();
      });
    });
  return () => {
    entrance?.revert();
    window.removeEventListener("portfolio:route-enter", enter);
    window.removeEventListener("portfolio:route-revealed", enter);
    removers.forEach((remove) => remove());
  };
}

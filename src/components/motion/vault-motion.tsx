"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motionTokens as m } from "./tokens";

export function VaultMotion({
  children,
  chapters,
}: {
  children: ReactNode;
  chapters: readonly { id: string; name: string }[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const [readList, setReadList] = useState(false);
  const restore = useRef<string | null>(null);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    let frame = 0;
    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      document.fonts.ready,
    ])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        const element = root.current;
        if (disposed || !element) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        cleanup = () => media.revert();
        media.add(
          { all: true, motion: m.preference, desktop: m.desktop },
          (context) => {
            const panels = Array.from(
              element.querySelectorAll<HTMLElement>(".project"),
            );
            if (!context.conditions?.motion) {
              // Explicit static restoration also covers a scrub tween's final
              // render during matchMedia teardown. No inline styles are authored
              // on these server-rendered layers.
              panels.forEach((panel) => {
                panel.inert = false;
                panel.removeAttribute("aria-hidden");
                panel.removeAttribute("style");
                panel
                  .querySelectorAll<HTMLElement>(
                    ".project-text, .project-text h3, .project-figure, .artwork > svg, .sat-geometry, .paper-stack, .project-screenshot img",
                  )
                  .forEach((layer) => layer.removeAttribute("style"));
              });
              return;
            }
            if (!context.conditions.desktop || readList) {
              panels.forEach((panel, i) => {
                gsap.from(panel.querySelector(".project-figure"), {
                  y: 20,
                  clipPath: `inset(${i % 2 ? "0 0 12% 0" : "12% 0 0 0"})`,
                  ease: "none",
                  scrollTrigger: {
                    trigger: panel,
                    start: "top 95%",
                    end: "top 64%",
                    scrub: true,
                  },
                });
                gsap.from(
                  panel.querySelector(
                    ".artwork > svg, .sat-geometry, .paper-stack, .project-screenshot img",
                  ),
                  {
                    y: i % 2 ? -16 : 16,
                    ease: "none",
                    scrollTrigger: {
                      trigger: panel,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: m.scrub,
                    },
                  },
                );
              });
              return;
            }

            element.classList.add("is-cinematic");
            const chapterLinks = Array.from(
              element.querySelectorAll<HTMLAnchorElement>(".vault-chapters a"),
            );
            let active = -1;
            const activate = (index: number) => {
              if (active === index) return;
              const focused = document.activeElement;
              // A focused outgoing panel must never become an invisible focus trap.
              if (active >= 0 && focused && panels[active].contains(focused))
                chapterLinks[index]?.focus({ preventScroll: true });
              active = index;
              element.dataset.activeProject = panels[index].id;
              panels.forEach((panel, i) => {
                panel.inert = i !== index;
                panel.setAttribute("aria-hidden", String(i !== index));
                panel.style.pointerEvents = i === index ? "auto" : "none";
                if (i === index)
                  chapterLinks[i].setAttribute("aria-current", "step");
                else chapterLinks[i].removeAttribute("aria-current");
              });
            };
            gsap.set(panels, { autoAlpha: 0, yPercent: 22, scale: 0.98 });
            gsap.set(panels[0], { autoAlpha: 1, yPercent: 0, scale: 1 });
            panels.forEach((panel, i) => {
              panel.style.zIndex = String(i + 1);
            });
            activate(0);
            const timeline = gsap.timeline({
              defaults: { ease: "power2.inOut" },
              scrollTrigger: {
                id: "vault-exhibition",
                trigger: element,
                start: "top 9%",
                end: () => `+=${window.innerHeight * panels.length * 0.9}`,
                pin: true,
                scrub: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });
            // Each chapter has a reading hold, then a short layered handoff.
            panels.forEach((panel, i) => {
              timeline.fromTo(
                panel.querySelector(".project-figure"),
                { scale: 1.035 },
                { scale: 1, duration: 0.64, ease: "none" },
                i,
              );
              timeline.fromTo(
                panel.querySelector(
                  ".artwork > svg, .paper-stack, .project-screenshot img",
                ),
                { y: 12 },
                { y: -8, duration: 0.64, ease: "none" },
                i,
              );
              if (i === panels.length - 1) return;
              const next = panels[i + 1];
              timeline
                .to(
                  panel,
                  { yPercent: -9, scale: 0.93, autoAlpha: 0, duration: 0.36 },
                  i + 0.64,
                )
                .fromTo(
                  next,
                  {
                    autoAlpha: 0,
                    yPercent: 22,
                    x: i % 2 ? -24 : 24,
                    scale: 0.98,
                  },
                  { autoAlpha: 1, yPercent: 0, x: 0, scale: 1, duration: 0.36 },
                  i + 0.64,
                )
                .fromTo(
                  next.querySelector(".project-figure"),
                  { clipPath: "inset(100% 0 0 0)" },
                  { clipPath: "inset(0% 0 0 0)", duration: 0.36 },
                  i + 0.64,
                )
                .fromTo(
                  next.querySelector(".project-text"),
                  { y: 22 },
                  { y: 0, duration: 0.36 },
                  i + 0.64,
                )
                .fromTo(
                  next.querySelector(".project-text h3"),
                  { clipPath: "inset(0 0 100% 0)", y: 14 },
                  { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.36 },
                  i + 0.64,
                );
            });
            // Preserve each chapter's reading hold and handoff for any collection size.
            timeline.to({}, { duration: 0.36 });
            timeline.eventCallback("onUpdate", () => {
              element.style.setProperty(
                "--vault-progress",
                String(timeline.progress()),
              );
              activate(
                Math.min(
                  panels.length - 1,
                  Math.floor(timeline.progress() * panels.length + 0.18),
                ),
              );
            });
            const trigger = timeline.scrollTrigger!;
            const goTo = (id: string) => {
              const index = panels.findIndex((panel) => panel.id === id);
              if (index < 0) return false;
              const progress = (index + 0.24) / panels.length;
              window.scrollTo({
                top: trigger.start + (trigger.end - trigger.start) * progress,
                behavior: "instant",
              });
              timeline.progress(progress);
              activate(index);
              return true;
            };
            const onAnchor = (event: MouseEvent) => {
              if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              const link = (event.target as Element).closest<HTMLAnchorElement>(
                'a[href^="#"]',
              );
              if (!link || !goTo(link.hash.slice(1))) return;
              event.preventDefault();
              history.pushState(null, "", link.hash);
            };
            const onHash = () => {
              goTo(location.hash.slice(1));
            };
            // Opening a full notes preview switches to the spacious original layout.
            const onToggle = (event: Event) => {
              const details = event.target as HTMLDetailsElement;
              if (!details.open || !details.matches(".project-comments"))
                return;
              restore.current = details.closest<HTMLElement>(".project")!.id;
              setReadList(true);
            };
            document.addEventListener("click", onAnchor);
            window.addEventListener("hashchange", onHash);
            element.addEventListener("toggle", onToggle, true);
            frame = requestAnimationFrame(() => {
              ScrollTrigger.refresh();
              onHash();
            });
            return () => {
              cancelAnimationFrame(frame);
              document.removeEventListener("click", onAnchor);
              window.removeEventListener("hashchange", onHash);
              element.removeEventListener("toggle", onToggle, true);
              element.classList.remove("is-cinematic");
              delete element.dataset.activeProject;
              element.style.removeProperty("--vault-progress");
              panels.forEach((panel) => {
                panel.inert = false;
                panel.removeAttribute("aria-hidden");
                panel.style.removeProperty("pointer-events");
                panel.style.removeProperty("z-index");
              });
              chapterLinks.forEach((link) =>
                link.removeAttribute("aria-current"),
              );
            };
          },
          element,
        );
        if (restore.current) {
          const id = restore.current;
          restore.current = null;
          frame = requestAnimationFrame(() => {
            ScrollTrigger.refresh();
            const panel = document.getElementById(id);
            panel?.scrollIntoView({ behavior: "instant", block: "start" });
            panel
              ?.querySelector<HTMLElement>("summary")
              ?.focus({ preventScroll: true });
          });
        }
      })
      .catch(() => {
        cleanup?.();
      });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanup?.();
    };
  }, [readList]);
  return (
    <div className="vault-motion" ref={root}>
      <div className="vault-controls">
        <span className="vault-progress" aria-hidden="true" />
        <nav className="vault-chapters" aria-label="Vault projects">
          {chapters.map((chapter, i) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              aria-label={`Show ${chapter.name}`}
            >
              0{i + 1}
            </a>
          ))}
        </nav>
        <span className="eyebrow">SCROLL TO EXPLORE</span>
        <button
          type="button"
          onClick={() => {
            restore.current =
              root.current?.dataset.activeProject ?? chapters[0].id;
            setReadList(true);
          }}
        >
          Read as list ↗
        </button>
      </div>
      {children}
    </div>
  );
}

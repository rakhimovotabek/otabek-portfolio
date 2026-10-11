"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import { motionTokens } from "./tokens";

type Room = {
  title: string;
  number: string;
  mode: string;
  color: string;
  ink: string;
};
function roomFor(path: string): Room {
  if (path.startsWith("/about"))
    return {
      title: "The person",
      number: "01",
      mode: "portrait",
      color: "#c8ad94",
      ink: "#24271f",
    };
  if (path.startsWith("/work"))
    return {
      title: path === "/work" ? "Selected & collected" : "A closer look",
      number: "02",
      mode: "exhibition",
      color: "#c5fb57",
      ink: "#0b1015",
    };
  if (path.startsWith("/journal"))
    return {
      title: "In the margins",
      number: "03",
      mode: "reading",
      color: "#392c2c",
      ink: "#f0eee8",
    };
  if (path.startsWith("/gallery"))
    return {
      title: "Ways of seeing",
      number: "04",
      mode: "gallery",
      color: "#d1d5c9",
      ink: "#24271f",
    };
  if (path.startsWith("/links"))
    return {
      title: "Elsewhere",
      number: "05",
      mode: "directory",
      color: "#243c46",
      ink: "#f0eee8",
    };
  if (path.startsWith("/guestbook"))
    return {
      title: "A trace of you",
      number: "06",
      mode: "portrait",
      color: "#dce0d2",
      ink: "#24271f",
    };
  return {
    title: "Back to the beginning",
    number: "00",
    mode: "exhibition",
    color: "#0b1015",
    ink: "#f0eee8",
  };
}

const TransitionContext = createContext<
  ((href: string, scroll?: boolean) => boolean) | null
>(null);

/** A normal Next Link until the persistent controller is mounted. Modified clicks,
 * external links, same-page anchors and reduced motion retain native semantics. */
export function TransitionLink(props: React.ComponentProps<typeof Link>) {
  const transition = useContext(TransitionContext);
  return (
    <Link
      {...props}
      onNavigate={(event) => {
        props.onNavigate?.(event);
        if (
          typeof props.href === "string" &&
          transition?.(props.href, props.scroll)
        )
          event.preventDefault();
      }}
    />
  );
}

function RouteArrival({ arrive }: { arrive: (key: string) => void }) {
  const path = usePathname();
  const query = useSearchParams();
  const key = path + (query.size ? `?${query.toString()}` : "");
  useEffect(() => arrive(key), [key, arrive]);
  return null;
}

/** Two folio leaves cover a route commit; we never transform the layout itself,
 * freeze the router tree, lock scrolling, or take over history restoration. */
export function RouteTransitions({ children }: { children: ReactNode }) {
  const router = useRouter();
  const cover = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{
    key: string;
    committed: boolean;
    covered: boolean;
    pop: boolean;
    scroll?: boolean;
  } | null>(null);

  const clearTimer = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
  }, []);
  const finish = useCallback(() => {
    timeline.current?.kill();
    clearTimer();
    if (cover.current) {
      gsap.set(cover.current, { autoAlpha: 0 });
      cover.current.dataset.state = "idle";
    }
    pending.current = null;
    delete document.documentElement.dataset.routeMotion;
    window.dispatchEvent(new Event("portfolio:route-revealed"));
  }, [clearTimer]);

  // Motion is optional: cancelling it before the cover completes must still
  // deliver the visitor's requested navigation, including on a stalled frame.
  const abandonMotion = useCallback(() => {
    const task = pending.current;
    if (task && !task.pop && !task.covered)
      router.push(task.key, {
        scroll: task.scroll ?? task.key.split("?")[0] !== location.pathname,
      });
    finish();
  }, [router, finish]);

  const reveal = useCallback(() => {
    const element = cover.current;
    const task = pending.current;
    if (!element || !task?.committed || !task.covered) return;
    clearTimer();
    timeline.current?.kill();
    element.dataset.state = "revealing";
    const panels = element.querySelectorAll(".route-leaf");
    const horizontal =
      element.dataset.mode === "reading" ||
      element.dataset.mode === "directory";
    const mobile = matchMedia("(max-width: 800px)").matches;
    window.dispatchEvent(new Event("portfolio:route-enter"));
    timeline.current = gsap.timeline({
      onComplete: () => {
        if (!task.pop && !task.key.includes("?"))
          document.getElementById("main")?.focus({ preventScroll: true });
        finish();
      },
    });
    timeline.current
      .to(
        element.querySelector(".route-caption"),
        { opacity: 0, y: -12, duration: 0.18 },
        0,
      )
      .to(
        panels,
        {
          xPercent: horizontal ? (i: number) => (i ? 101 : -101) : 0,
          yPercent: horizontal ? 0 : (i: number) => (i ? 101 : -101),
          duration: mobile ? 0.3 : 0.48,
          stagger: mobile ? 0 : 0.035,
          ease: motionTokens.ease,
        },
        0.045,
      );
  }, [clearTimer, finish]);

  const start = useCallback(
    (href: string, scroll?: boolean, pop = false) => {
      const url = new URL(href, location.href);
      if (
        url.origin !== location.origin ||
        url.pathname.startsWith("/admin") ||
        url.pathname.startsWith("/api/")
      )
        return false;
      const key = url.pathname + url.search;
      const current = location.pathname + location.search;
      if (
        (!pop && key === current && !pending.current) ||
        url.hash ||
        matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.querySelector("dialog[open]")
      )
        return false;
      const element = cover.current;
      if (!element) return false;
      const wasActive = Boolean(pending.current);
      timeline.current?.kill();
      clearTimer();
      const task = {
        key,
        committed: !pop && key === current,
        covered: false,
        pop,
        scroll,
      };
      pending.current = task;
      const room = roomFor(url.pathname);
      element.dataset.mode = room.mode;
      element.dataset.state = "covering";
      element.style.setProperty("--route-paper", room.color);
      element.style.setProperty("--route-ink", room.ink);
      element.querySelector("[data-room-number]")!.textContent = room.number;
      element.querySelector("[data-room-title]")!.textContent = room.title;
      document.documentElement.dataset.routeMotion = "pending";
      const panels = element.querySelectorAll(".route-leaf");
      const horizontal = room.mode === "reading" || room.mode === "directory";
      gsap.set(panels, { skewY: room.mode === "exhibition" ? -7 : 0 });
      if (!wasActive)
        gsap.set(panels, {
          xPercent: horizontal ? (i: number) => (i ? 101 : -101) : 0,
          yPercent: horizontal ? 0 : (i: number) => (i ? 101 : -101),
        });
      else gsap.set(panels, { xPercent: 0, yPercent: 0 });
      gsap.set(element, { autoAlpha: 1 });
      gsap.set(element.querySelector(".route-caption"), { opacity: 0, y: 10 });
      timeline.current = gsap.timeline({
        onComplete: () => {
          if (pending.current !== task) return;
          task.covered = true;
          if (!pop)
            router.push(url.pathname + url.search, {
              scroll: scroll ?? url.pathname !== location.pathname,
            });
          reveal();
        },
      });
      timeline.current
        .to(
          panels,
          {
            xPercent: 0,
            yPercent: 0,
            duration: wasActive ? 0.1 : 0.22,
            ease: "power2.inOut",
          },
          0,
        )
        .to(
          element.querySelector(".route-caption"),
          { opacity: 1, y: 0, duration: 0.15 },
          0.09,
        );
      // A failed/slow route never leaves a ghost overlay or disables the site.
      timeout.current = setTimeout(abandonMotion, 2400);
      return true;
    },
    [router, clearTimer, abandonMotion, reveal],
  );

  const arrive = useCallback(
    (key: string) => {
      const task = pending.current;
      if (!task || (!task.pop && task.key !== key)) return;
      task.committed = true;
      reveal();
    },
    [reveal],
  );

  useEffect(() => {
    const pop = () => start(location.href, undefined, true);
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      if (preference.matches) abandonMotion();
    };
    window.addEventListener("popstate", pop);
    preference.addEventListener("change", change);
    return () => {
      window.removeEventListener("popstate", pop);
      preference.removeEventListener("change", change);
      timeline.current?.kill();
      clearTimer();
      delete document.documentElement.dataset.routeMotion;
    };
  }, [start, clearTimer, abandonMotion]);

  return (
    <TransitionContext.Provider value={start}>
      {children}
      <Suspense fallback={null}>
        <RouteArrival arrive={arrive} />
      </Suspense>
      <div
        ref={cover}
        className="route-cover"
        aria-hidden="true"
        data-state="idle"
      >
        <div className="route-leaf leaf-first" />
        <div className="route-leaf leaf-second" />
        <div className="route-caption">
          <span data-room-number /> <span data-room-title />
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

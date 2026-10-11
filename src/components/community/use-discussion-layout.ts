"use client";
import { useEffect, type RefObject } from "react";
// Community content changes height asynchronously. Refresh existing trigger
// measurements after those changes, without owning any animation or scroll.
export function useDiscussionLayout(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!ref.current) return;
    let previous: number | undefined,
      timer: ReturnType<typeof setTimeout> | undefined,
      disposed = false;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height === undefined || height === previous) return;
      const initial = previous === undefined;
      previous = height;
      if (initial) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
          return;
        void import("gsap/ScrollTrigger")
          .then(({ ScrollTrigger }) => {
            if (!disposed && ScrollTrigger.getAll().length)
              ScrollTrigger.refresh();
          })
          .catch(() => {});
      }, 160);
    });
    observer.observe(ref.current);
    return () => {
      disposed = true;
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [ref]);
}

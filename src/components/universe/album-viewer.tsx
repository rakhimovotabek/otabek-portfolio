"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import type { ArchiveMedia } from "@/data/archive";
import { MediaFrame } from "@/components/archive/media-frame";
import styles from "./album-viewer.module.css";
import { galleryMedia } from "@/components/signature/gallery-media";

/** Native modal semantics, frame-origin expansion and directional image masks. */
export function AlbumViewer({ images, title, externalTriggers = false }: { images: readonly ArchiveMedia[]; title: string; externalTriggers?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const originBox = useRef<DOMRect | null>(null);
  const originMask = useRef("inset(0%)");
  const finalBox = useRef<DOMRect | null>(null);
  const visual = useRef<HTMLDivElement>(null);
  const incoming = useRef<HTMLDivElement>(null);
  const outgoing = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const closeAnimation = useRef<gsap.core.Timeline | null>(null);
  const opening = useRef(false);
  const closing = useRef(false);
  const direction = useRef(1);
  const current = useRef(0);
  const touch = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const image = images[index];
  const openAt = useCallback((i: number, trigger: HTMLElement) => {
    if (dialog.current?.open || !Number.isInteger(i) || i < 0 || i >= images.length) return;
    origin.current = trigger;
    originBox.current = (trigger.querySelector(".media-window") || trigger.parentElement?.querySelector(".media-window") || trigger).getBoundingClientRect();
    originMask.current = getComputedStyle(trigger.closest("[data-gallery-aperture]") || trigger).clipPath;
    current.current = i;
    setPrevious(null);
    setIndex(i);
    opening.current = true;
    closing.current = false;
    setOpen(true);
    dialog.current?.showModal();
  }, [images.length]);
  useEffect(() => {
    if (!externalTriggers) return;
    const openStudy = (event: Event) => {
      const detail = (event as CustomEvent<{ index: number; origin: HTMLElement }>).detail;
      if (detail?.origin instanceof HTMLElement) openAt(detail.index, detail.origin);
    };
    window.addEventListener("portfolio:open-gallery-study", openStudy);
    return () => window.removeEventListener("portfolio:open-gallery-study", openStudy);
  }, [externalTriggers, openAt]);
  const change = (step: number) => {
    if (images.length < 2 || closing.current) return;
    direction.current = step;
    setPrevious(matchMedia("(prefers-reduced-motion: reduce)").matches ? null : current.current);
    current.current = (current.current + step + images.length) % images.length;
    setIndex(current.current);
  };
  const requestClose = () => {
    if (closing.current || !dialog.current?.open) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !visual.current) {
      dialog.current.close();
      return;
    }
    closing.current = true;
    animation.current?.kill();
    const start = originBox.current;
    const end = finalBox.current;
    closeAnimation.current = gsap.timeline({ onComplete: () => dialog.current?.close() });
    if (start && end)
      closeAnimation.current.to(visual.current, {
        x: start.x + start.width / 2 - end.x - end.width / 2,
        y: start.y + start.height / 2 - end.y - end.height / 2,
        scaleX: start.width / end.width,
        scaleY: start.height / end.height,
        opacity: 0,
        duration: .42,
        ease: "power3.inOut",
      }, 0);
    closeAnimation.current.to(dialog.current, { backgroundColor: "transparent", duration: .35 }, .06);
  };
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { html.style.overflow = previousOverflow; };
  }, [open]);
  useEffect(() => () => { closeAnimation.current?.kill(); }, []);
  useLayoutEffect(() => {
    if (!open || !visual.current) return;
    const first = opening.current;
    opening.current = false;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ onComplete: () => setPrevious(null) });
      animation.current = timeline;
      if (first) {
        const start = originBox.current;
        const end = visual.current!.getBoundingClientRect();
        finalBox.current = end;
        if (start)
          timeline.fromTo(visual.current, {
            x: start.x + start.width / 2 - end.x - end.width / 2,
            y: start.y + start.height / 2 - end.y - end.height / 2,
            scaleX: start.width / end.width,
            scaleY: start.height / end.height,
            rotation: -5,
          }, { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1, duration: .78, ease: "power3.inOut", clearProps: "transform" });
        timeline.fromTo(incoming.current, { clipPath: externalTriggers && originMask.current !== "none" ? originMask.current : "inset(0%)" }, { clipPath: "inset(0% round 0%)", duration: .78, ease: "power3.inOut", clearProps: "clipPath" }, 0);
      } else {
        const forward = direction.current > 0;
        timeline.fromTo(incoming.current, {
          clipPath: forward ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)",
          x: direction.current * 72,
        }, { clipPath: "inset(0% 0% 0% 0%)", x: 0, duration: .55, ease: "power3.inOut", clearProps: "transform,clipPath" }, 0);
        if (outgoing.current)
          timeline.to(outgoing.current, { x: -direction.current * 64, opacity: .35, duration: .55, ease: "power3.inOut" }, 0);
      }
    }, dialog);
    return () => context.revert();
  }, [index, open, externalTriggers]);
  return (
    <>
      {!externalTriggers && <div className={`album-images ${styles.images}`}>
        {images.map((item, i) => (
          <div className={`album-mount ${styles.mount}`} key={item.id} id={item.id}>
            <MediaFrame media={galleryMedia(item)} sizes="(max-width: 799px) 95vw, 70vw" />
            <button
              type="button"
              className={`view-study ${styles.openButton}`}
              aria-haspopup="dialog"
              aria-label={`View ${item.caption} full screen`}
              onClick={event => openAt(i, event.currentTarget)}
            >Open image <span aria-hidden>↗</span></button>
          </div>
        ))}
      </div>}
      <dialog
        ref={dialog}
        className={`album-dialog ${styles.viewer}`}
        aria-labelledby="album-viewer-title"
        onCancel={event => { event.preventDefault(); requestClose(); }}
        onClose={() => {
          closing.current = false;
          closeAnimation.current?.kill();
          if (dialog.current) gsap.set(dialog.current, { clearProps: "backgroundColor" });
          setOpen(false);
          setPrevious(null);
          origin.current?.focus({ preventScroll: true });
        }}
        onKeyDown={event => {
          if (event.key === "Tab") {
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
          }
          if (event.key === "ArrowRight") { event.preventDefault(); change(1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); change(-1); }
        }}
      >
        <header className={`album-viewer-header ${styles.header}`}>
          <span id="album-viewer-title">{title}</span>
          <span className={styles.count} aria-hidden>{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
          <button type="button" onClick={requestClose} autoFocus aria-label="Close image viewer">Close ×</button>
        </header>
        {open && image && (
          <div className={`album-viewer-image ${styles.imageArea}`}
            onTouchStart={event => { touch.current = event.touches[0]?.clientX ?? null; }}
            onTouchCancel={() => { touch.current = null; }}
            onTouchEnd={event => {
              if (touch.current !== null) {
                const distance = (event.changedTouches[0]?.clientX ?? touch.current) - touch.current;
                if (Math.abs(distance) > 60) change(distance < 0 ? 1 : -1);
              }
              touch.current = null;
            }}
          >
            <div className={styles.visual} ref={visual} style={{ "--viewer-factor": image.width / image.height, "--viewer-ratio": `${image.width} / ${image.height}` } as CSSProperties}>
              {previous !== null && images[previous] && <div className={`${styles.plane} ${styles.outgoing}`} ref={outgoing} aria-hidden><MediaFrame media={galleryMedia(images[previous])} sizes="90vw" /></div>}
              <div className={styles.plane} ref={incoming} data-viewer-current><MediaFrame media={galleryMedia(image)} sizes="90vw" /></div>
            </div>
          </div>
        )}
        <nav className={`album-viewer-controls ${styles.controls}`} aria-label="Image navigation">
          <button type="button" onClick={() => change(-1)} disabled={images.length < 2}>← Previous</button>
          <p role="status" aria-live="polite">{open ? image?.caption : ""}</p>
          <button type="button" onClick={() => change(1)} disabled={images.length < 2}>Next →</button>
        </nav>
      </dialog>
    </>
  );
}

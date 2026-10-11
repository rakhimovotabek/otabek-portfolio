"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { ArchiveMedia } from "@/data/archive";
import { MediaFrame } from "@/components/archive/media-frame";

/** Real photographs and the explicitly labeled site studies share a native,
 * keyboard-accessible viewer. No image download or backdrop animation loop. */
export function AlbumViewer({
  images,
  title,
}: {
  images: readonly ArchiveMedia[];
  title: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const visual = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const touch = useRef<number | null>(null);
  const image = images[index];
  const change = (step: number) =>
    setIndex((value) => (value + step + images.length) % images.length);
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, [open]);
  useEffect(() => {
    if (
      !open ||
      !visual.current ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const context = gsap.context(() => {
      gsap.from(visual.current, {
        opacity: 0.4,
        scale: 0.97,
        duration: 0.38,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });
    }, visual);
    return () => context.revert();
  }, [index, open]);
  return (
    <>
      <div className="album-images">
        {images.map((item, i) => (
          <div className={`album-mount mount-${i % 3}`} key={item.id}>
            <MediaFrame media={item} sizes="(max-width: 800px) 95vw, 70vw" />
            <button
              type="button"
              className="view-study text-link"
              aria-haspopup="dialog"
              aria-label={`View ${item.caption} full screen`}
              onClick={(event) => {
                origin.current = event.currentTarget;
                setIndex(i);
                setOpen(true);
                dialog.current?.showModal();
              }}
            >
              View full screen <span aria-hidden="true">↗</span>
            </button>
          </div>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="album-dialog"
        aria-labelledby="album-viewer-title"
        onClose={() => {
          setOpen(false);
          origin.current?.focus({ preventScroll: true });
        }}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            const controls = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>(
                "button:not(:disabled)",
              ),
            );
            const first = controls[0],
              last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            change(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            change(-1);
          }
        }}
      >
        <header className="album-viewer-header">
          <span id="album-viewer-title">{title}</span>
          <span className="eyebrow" aria-hidden="true">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            autoFocus
            aria-label="Close image viewer"
          >
            Close ×
          </button>
        </header>
        {open && image && (
          <div
            className="album-viewer-image"
            ref={visual}
            onTouchStart={(event) => {
              touch.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              if (touch.current !== null) {
                const distance =
                  (event.changedTouches[0]?.clientX ?? touch.current) -
                  touch.current;
                if (Math.abs(distance) > 60) change(distance < 0 ? 1 : -1);
              }
              touch.current = null;
            }}
          >
            <MediaFrame media={image} sizes="95vw" />
          </div>
        )}
        <nav className="album-viewer-controls" aria-label="Image navigation">
          <button
            type="button"
            onClick={() => change(-1)}
            disabled={images.length < 2}
          >
            ← Previous
          </button>
          <p role="status" aria-live="polite">
            {open ? image?.caption : ""}
          </p>
          <button
            type="button"
            onClick={() => change(1)}
            disabled={images.length < 2}
          >
            Next →
          </button>
        </nav>
      </dialog>
    </>
  );
}

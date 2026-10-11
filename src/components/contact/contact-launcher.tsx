"use client";
import { useEffect, useRef, useState } from "react";
import { SubmissionForm } from "@/components/community/submission-form";
import { MessageSquare, ArrowUpRight, X } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
export function ContactLauncher() {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [activated, setActivated] = useState(false);
  const [prefill, setPrefill] = useState<{
    message: string;
    revision: number;
  }>();
  useEffect(() => {
    const show = (event: Event) => {
      const message = (event as CustomEvent<{ message?: string }>).detail
        ?.message;
      if (typeof message === "string" && message.length <= 4000)
        setPrefill((previous) => ({
          message,
          revision: (previous?.revision ?? 0) + 1,
        }));
      if (!dialog.current || dialog.current.open) return;
      dialog.current.showModal();
      setActivated(true);
      setOpen(true);
    };
    window.addEventListener("portfolio:open-contact", show);
    return () => window.removeEventListener("portfolio:open-contact", show);
  }, []);
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, [open]);
  return (
    <MotionConfig reducedMotion="user">
      <motion.button
        type="button"
        tabIndex={0}
        className="message-button"
        initial={{ y: 8 }}
        animate={{ y: 0 }}
        whileHover={reduced ? undefined : { y: -3 }}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        onClick={() => {
          dialog.current?.showModal();
          setActivated(true);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-label="Message me"
      >
        <MessageSquare size={18} aria-hidden="true" />
        <span className="message-label">Message me</span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </motion.button>
      <dialog
        ref={dialog}
        className="contact-dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onClose={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "button,input,textarea,select,a[href],iframe,[tabindex]",
            ),
          ).filter(
            (el) =>
              el.tabIndex >= 0 &&
              !el.matches(":disabled") &&
              el.getClientRects().length > 0,
          );
          const first = controls[0],
            last = controls[controls.length - 1];
          if (!first) return;
          if (
            event.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === document.body)
          ) {
            event.preventDefault();
            last.focus();
          } else if (
            !event.shiftKey &&
            (document.activeElement === last ||
              document.activeElement === document.body)
          ) {
            event.preventDefault();
            first.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <motion.div
          className="dialog-content"
          initial={false}
          animate={{ y: open ? 0 : 12 }}
          transition={{
            duration: reduced ? 0 : 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <button
            type="button"
            className="close-button"
            aria-label="Close contact panel"
            onClick={() => dialog.current?.close()}
            autoFocus
          >
            <X size={23} aria-hidden="true" />
          </button>
          <span className="eyebrow">PRIVATE CORRESPONDENCE</span>
          <h2 id="dialog-title">
            Leave a thought<span className="cyan-period">.</span>
          </h2>
          <p id="dialog-description">
            A private note about the work, an idea, or a question. No account is
            needed.
          </p>
          {activated && (
            <SubmissionForm
              id="private-contact"
              kind="contact"
              prefill={prefill}
            />
          )}
        </motion.div>
      </dialog>
    </MotionConfig>
  );
}

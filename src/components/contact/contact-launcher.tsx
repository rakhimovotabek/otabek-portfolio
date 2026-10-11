"use client";
import { useRef } from "react";
import { FormPreview } from "@/components/community/form-preview";
import { MessageSquare, ArrowUpRight, X } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
export function ContactLauncher() {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      <motion.button
        type="button"
        className="message-button"
        whileHover={reduced ? undefined : { y: -3 }}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        onClick={() => dialog.current?.showModal()}
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
        aria-describedby="dialog-description private-contact-status"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="dialog-content">
          <button
            type="button"
            className="close-button"
            aria-label="Close contact panel"
            onClick={() => dialog.current?.close()}
            autoFocus
          >
            <X size={23} aria-hidden="true" />
          </button>
          <span className="eyebrow">PRIVATE CORRESPONDENCE / PREVIEW</span>
          <h2 id="dialog-title">
            Leave a thought<span className="cyan-period">.</span>
          </h2>
          <p id="dialog-description">
            A private note about the work, an idea, or a question. No account
            will be needed.
          </p>
          <FormPreview id="private-contact" kind="contact" />
        </div>
      </dialog>
    </MotionConfig>
  );
}

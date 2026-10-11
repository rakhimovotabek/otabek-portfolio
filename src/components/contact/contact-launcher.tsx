"use client";
import { useRef } from "react";
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
      >
        <MessageSquare size={18} aria-hidden="true" />
        Message me
        <ArrowUpRight size={16} aria-hidden="true" />
      </motion.button>
      <dialog
        ref={dialog}
        className="contact-dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
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
          <span className="eyebrow">A FUTURE CONVERSATION</span>
          <h2 id="dialog-title">
            Let’s connect<span className="cyan-period">.</span>
          </h2>
          <p id="dialog-description">
            Messaging is not yet available. A private, no-account contact form
            will be added in a later phase.
          </p>
          <p className="dialog-note">
            This preview does not collect or send messages.
          </p>
        </div>
      </dialog>
    </MotionConfig>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import type { CommentTarget } from "@/types/community";
import { commentSchema, contactSchema } from "@/lib/backend/validation";
import {
  errorMessage,
  requestJson,
  RequestError,
} from "@/lib/community/client";
import { Turnstile } from "./turnstile";
import { useCommunity } from "./community-provider";
export function SubmissionForm({
  id,
  kind,
  target,
  prefill,
}: {
  id: string;
  kind: "contact" | "comment";
  target?: CommentTarget;
  prefill?: { message: string; revision: number };
}) {
  const features = useCommunity();
  const contact = kind === "contact";
  const form = useRef<HTMLFormElement>(null);
  const busy = useRef(false);
  const [token, setToken] = useState("");
  const [revision, setRevision] = useState(0);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const available = features.submissions && !!features.siteKey;
  const nameField = contact ? "name" : "displayName";
  useEffect(() => {
    if (!contact || !prefill) return;
    const field = form.current?.elements.namedItem("message");
    if (!(field instanceof HTMLTextAreaElement)) return;
    // Preserve an existing visitor draft instead of silently overwriting it.
    if (!field.value.includes(prefill.message))
      field.value = prefill.message + (field.value ? `\n\n${field.value}` : "");
    field.dispatchEvent(new Event("input", { bubbles: true }));
  }, [contact, prefill]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !available) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      ...values,
      ...(contact ? {} : { target }),
      turnstileToken: token,
    };
    const parsed = (contact ? contactSchema : commentSchema).safeParse(payload);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        fields[String(issue.path[0])] =
          issue.path[0] === "turnstileToken"
            ? "Please complete spam verification."
            : "Please check this field’s required length and content.";
      setErrors(fields);
      setSuccess(false);
      setNotice(
        fields.turnstileToken ?? "Please check the highlighted fields.",
      );
      const control = form.current?.elements.namedItem(Object.keys(fields)[0]);
      if (control instanceof HTMLElement) control.focus();
      return;
    }
    busy.current = true;
    setSending(true);
    setErrors({});
    setNotice("");
    setSuccess(false);
    try {
      const result = await requestJson<{ status: string }>(
        contact ? "/api/contact" : "/api/comments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
        201,
      );
      if (result.status !== (contact ? "received" : "pending"))
        throw new RequestError(503, "temporarily_unavailable");
      setSuccess(true);
      setNotice(
        contact
          ? "Your message has been saved to my private inbox. Thank you for writing."
          : "Your comment has been submitted and is awaiting approval.",
      );
      form.current?.reset();
      // A submit control becomes disabled during verification reset. Keep
      // keyboard focus in the native modal after a confirmed receipt.
      form.current
        ?.closest("dialog")
        ?.querySelector<HTMLButtonElement>(".close-button")
        ?.focus({ preventScroll: true });
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      busy.current = false;
      setSending(false);
      setToken("");
      setRevision((value) => value + 1);
    }
  }
  return (
    <form
      ref={form}
      className="form-preview community-form"
      method="post"
      noValidate
      onSubmit={submit}
      onInput={() => {
        if (success) {
          setSuccess(false);
          setNotice("");
        }
      }}
      aria-describedby={`${id}-status`}
      data-target-kind={target?.kind}
      data-project-id={
        target?.kind === "project" ? target.projectId : undefined
      }
    >
      <p className="preview-status" id={`${id}-status`}>
        {features.checking
          ? "Checking availability…"
          : available
            ? contact
              ? "A private note, delivered here. No account needed."
              : "Your words will be reviewed before they appear. No account needed."
            : `${contact ? "Messaging" : "Comment submission"} is unavailable: the backend and spam protection are not connected yet. Nothing will be sent.`}
      </p>
      <fieldset disabled={!available || sending}>
        <legend className="sr-only">
          {contact ? "Private message" : "Moderated comment"}
        </legend>
        <div className="preview-fields">
          <label htmlFor={`${id}-name`}>
            <span className="field-label" id={`${id}-name-label`}>
              {contact ? "Your name" : "Display name"}
            </span>
            <input
              aria-labelledby={`${id}-name-label`}
              id={`${id}-name`}
              name={nameField}
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              placeholder="How should you be called?"
              aria-invalid={!!errors[nameField]}
              aria-describedby={
                errors[nameField] ? `${id}-name-error` : undefined
              }
            />
            {errors[nameField] && (
              <span className="field-error" id={`${id}-name-error`}>
                {errors[nameField]}
              </span>
            )}
          </label>
          {contact && (
            <label htmlFor={`${id}-reply`}>
              Reply email or contact <span>(optional)</span>
              <input
                id={`${id}-reply`}
                name="replyContact"
                maxLength={254}
                autoComplete="off"
                placeholder="A way to reply to you"
                aria-invalid={!!errors.replyContact}
              />
            </label>
          )}
        </div>
        <label htmlFor={`${id}-message`}>
          <span className="field-label" id={`${id}-message-label`}>
            {contact ? "Your message" : "Your comment"}
          </span>
          <textarea
            aria-labelledby={`${id}-message-label`}
            id={`${id}-message`}
            name="message"
            rows={4}
            required
            minLength={contact ? 10 : 3}
            maxLength={contact ? 4000 : 2000}
            placeholder={
              contact
                ? "What’s on your mind?"
                : "Leave a thought about the work."
            }
            aria-invalid={!!errors.message}
            aria-describedby={`${id}-message-limit${errors.message ? ` ${id}-message-error` : ""}`}
          />
          <span id={`${id}-message-limit`}>
            {contact ? "10–4,000" : "3–2,000"} characters
          </span>
          {errors.message && (
            <span className="field-error" id={`${id}-message-error`}>
              {errors.message}
            </span>
          )}
        </label>
        <div className="honeypot" aria-hidden="true">
          <label>
            Leave this empty
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              maxLength={200}
            />
          </label>
        </div>
        {available && (
          <Turnstile
            siteKey={features.siteKey!}
            action={contact ? "contact" : "comment"}
            revision={revision}
            onToken={setToken}
          />
        )}
        <div className="preview-footer">
          <span>
            {contact
              ? "Private inbox · Only the owner can read this"
              : "Moderated before publication"}
          </span>
          <button type="submit" disabled={!available || sending || !token}>
            {sending
              ? "Sending…"
              : contact
                ? "Send private message ↗"
                : "Submit comment ↗"}
          </button>
        </div>
      </fieldset>
      <p
        className={`form-feedback${success ? " is-success" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice}
      </p>
    </form>
  );
}

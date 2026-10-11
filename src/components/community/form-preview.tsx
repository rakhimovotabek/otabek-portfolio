import type { CommentTarget } from "@/types/community";
interface PreviewProps {
  id: string;
  kind: "contact" | "comment";
  target?: CommentTarget;
}
// Presentation only: no form, handler, request, persistence, or invented success state.
export function FormPreview({ id, kind, target }: PreviewProps) {
  const contact = kind === "contact";
  return (
    <div
      className="form-preview"
      data-target-kind={target?.kind}
      data-project-id={
        target?.kind === "project" ? target.projectId : undefined
      }
    >
      <p className="preview-status" id={`${id}-status`}>
        {contact ? "Messaging" : "Commenting"} is not yet available. This
        preview does not collect or send anything.
      </p>
      <fieldset disabled aria-describedby={`${id}-status`}>
        <legend className="sr-only">
          {contact ? "Future private message" : "Future moderated comment"}
        </legend>
        <div className="preview-fields">
          <label htmlFor={`${id}-name`}>
            {contact ? "Your name" : "Display name"}
            <input
              id={`${id}-name`}
              name={contact ? "name" : "displayName"}
              autoComplete="off"
              placeholder="How should you be called?"
            />
          </label>
          {contact && (
            <label htmlFor={`${id}-reply`}>
              Reply email or contact <span>(optional)</span>
              <input
                id={`${id}-reply`}
                name="replyContact"
                placeholder="A way to reply to you"
                autoComplete="off"
              />
            </label>
          )}
        </div>
        <label htmlFor={`${id}-message`}>
          {contact ? "Your message" : "Your comment"}
          <textarea
            id={`${id}-message`}
            name="message"
            rows={3}
            placeholder={
              contact
                ? "What’s on your mind?"
                : "Leave a thought about the work."
            }
          />
        </label>
        <div className="preview-footer">
          <span>
            {contact
              ? "Private inbox · No account needed"
              : "Moderated before publication · No account needed"}
          </span>
          <button type="button" disabled>
            {contact ? "Messaging" : "Posting"} opens later ↗
          </button>
        </div>
      </fieldset>
    </div>
  );
}

import { Section } from "@/components/ui/section";
import { FormPreview } from "@/components/community/form-preview";
export function Guestbook() {
  return (
    <Section
      id="guestbook"
      label="05 / A SPACE FOR YOUR WORDS"
      className="guestbook-section"
    >
      <div className="guestbook-layout">
        <div>
          <h2 id="guestbook-heading">
            You were
            <br />
            <span className="serif-word">here.</span>
          </h2>
          <p className="guestbook-intro">
            A guestbook for thoughts, feedback,
            <br />
            and the occasional hello.
          </p>
          <p className="guestbook-empty">
            <span aria-hidden="true">↳</span> The first page is still unwritten.
            <br />
            <span>Public comments will open in a later phase.</span>
          </p>
        </div>
        <div className="guestbook-sheet">
          <span className="eyebrow">THE GUESTBOOK / PREVIEW</span>
          <FormPreview
            id="guestbook-comment"
            kind="comment"
            target={{ kind: "guestbook" }}
          />
        </div>
      </div>
    </Section>
  );
}

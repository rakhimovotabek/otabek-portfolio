import { Section } from "@/components/ui/section";
import { Comments } from "@/components/community/comments";
export function Guestbook() {
  return (
    <Section
      id="guestbook"
      label="08 / NOTES FROM VISITORS"
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
            <span aria-hidden="true">↳</span> A few words leave a trace.
            <br />
            <span>A moderated record of the people passing through.</span>
          </p>
        </div>
        <div className="guestbook-sheet">
          <span className="eyebrow">THE GUESTBOOK</span>
          <Comments id="guestbook-comment" target={{ kind: "guestbook" }} />
        </div>
      </div>
    </Section>
  );
}

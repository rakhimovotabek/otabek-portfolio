import { OpenMessage } from "@/components/contact/open-message";
import type { WorkEntry } from "@/data/universe";
export function WorkActions({ work }: { work: WorkEntry }) {
  return (
    <div className="work-actions">
      {work.openToCollaboration && work.showCollaborationButton && (
        <OpenMessage
          label="Collaborate on this project"
          message={
            work.collaborationMessage ??
            `I'd like to collaborate on ${work.title}.\n\nProject: ${work.id}`
          }
        />
      )}
      {work.contributionVerifiedPublic &&
        work.contributionUrl?.startsWith("https://github.com/") && (
          <a
            className="text-link"
            href={work.contributionUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contribute on GitHub ↗
          </a>
        )}
    </div>
  );
}

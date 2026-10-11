import { Section } from "@/components/ui/section";
import { ArchiveBrowser } from "@/components/archive/archive-browser";
import { archiveCopy, archiveEntries } from "@/data/archive";
export function Archive() {
  return (
    <Section
      id="archive"
      label="03 / THE PERSONAL COLLECTION"
      className="archive-section"
    >
      <div className="archive-heading">
        <h2 id="archive-heading">
          {archiveCopy.heading[0]}
          <br />
          <span className="serif-word">{archiveCopy.heading[1]}</span>
        </h2>
        <p>{archiveCopy.description}</p>
      </div>
      <ArchiveBrowser entries={archiveEntries} />
      <p className="archive-notice">{archiveCopy.sampleNotice}</p>
    </Section>
  );
}

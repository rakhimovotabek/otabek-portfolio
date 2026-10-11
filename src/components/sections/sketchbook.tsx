import { Section } from "@/components/ui/section";
import { MediaFrame } from "@/components/archive/media-frame";
import { archiveCopy, visualStudies } from "@/data/archive";
export function Sketchbook() {
  return (
    <Section
      id="sketchbook"
      label="05 / THE VISUAL NOTEBOOK"
      className="sketchbook-section"
    >
      <div className="sketchbook-heading">
        <h2 id="sketchbook-heading">
          {archiveCopy.sketchbookHeading[0]}
          <br />
          <span className="serif-word">{archiveCopy.sketchbookHeading[1]}</span>
        </h2>
        <p>{archiveCopy.sketchbookDescription}</p>
      </div>
      <div className="study-gallery">
        {visualStudies.map((media, i) => (
          <div className={`study-mount study-mount-${i + 1}`} key={media.id}>
            <span className="study-index" aria-hidden="true">
              0{i + 1}
            </span>
            <MediaFrame media={media} />
          </div>
        ))}
      </div>
    </Section>
  );
}

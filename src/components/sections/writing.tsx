import { Section } from "@/components/ui/section";
import { archiveCopy, categoryLabels, writingEntries } from "@/data/archive";
export function Writing() {
  return (
    <Section
      id="writing"
      label="04 / WORDS & FRAGMENTS"
      className="writing-section"
    >
      <div className="writing-title">
        <h2 id="writing-heading">{archiveCopy.writingHeading}</h2>
        <p>{archiveCopy.writingDescription}</p>
      </div>
      {writingEntries.map((entry) => (
        <article
          className="writing-piece"
          key={entry.id}
          aria-labelledby={`${entry.id}-heading`}
        >
          <div className="writing-meta">
            <span>
              {categoryLabels[entry.category]} / {entry.year ?? "UNDATED"}
            </span>
            <h3 id={`${entry.id}-heading`}>{entry.title}</h3>
            {entry.status === "sample" && (
              <span className="writing-sample">
                LAYOUT SAMPLE · NOT PERSONAL WRITING
              </span>
            )}
          </div>
          <div className="writing-body">
            <blockquote>
              {entry.excerpt.split("\n").map((line) => (
                <span className="writing-line" key={line}>
                  <span>{line}</span>
                </span>
              ))}
            </blockquote>
            {entry.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      ))}
      <div className="writing-colophon">
        <span>SPACE FOR WORDS, WITHOUT A DEADLINE.</span>
        <a href="#sketchbook">Turn the page ↓</a>
      </div>
    </Section>
  );
}

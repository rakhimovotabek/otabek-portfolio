import type { Metadata } from "next";
import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { publishedJournal, universeCopy } from "@/data/universe";
import { site } from "@/data/site";
import { PageHeading } from "@/components/universe/page-heading";
export const metadata: Metadata = { title: `Journal — ${site.brand}` };
export default function JournalPage() {
  const entries = publishedJournal();
  return (
    <div className="inner-page journal-page">
      <PageHeading
        label="03 / WORDS & EXPERIENCES"
        title={universeCopy.journal.title}
        description={universeCopy.journal.description}
      />
      {entries.length ? (
        <div className="journal-index">
          {entries.map((entry) => (
            <article key={entry.slug}>
              <div>
                <span className="eyebrow">{entry.category}</span>
                {entry.date && <time dateTime={entry.date}>{entry.date}</time>}
              </div>
              <div>
                <h2>
                  <Link href={`/journal/${entry.slug}`}>{entry.title} ↗</Link>
                </h2>
                <p>{entry.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="journal-unwritten">
          <span className="eyebrow">THE FIRST PAGE</span>
          <p>{universeCopy.journal.empty}</p>
          <span className="unwritten-rule" aria-hidden="true" />
        </div>
      )}
      <nav className="related-pages" aria-label="Connected collection">
        <span className="eyebrow">SOME STORIES WILL BE TOLD IN IMAGES</span>
        <Link href="/gallery">The visual archive ↗</Link>
      </nav>
    </div>
  );
}

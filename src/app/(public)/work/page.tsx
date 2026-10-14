import type { Metadata } from "next";
import { TransitionLink as Link } from "@/components/motion/route-transitions";
import {
  works,
  workCategories,
  universeCopy,
  publicIdentities,
  type WorkCategory,
} from "@/data/universe";
import { site } from "@/data/site";
import { WorkActions } from "@/components/universe/work-actions";
import { FilterScene } from "@/components/universe/filter-scene";
import { WorkExhibition } from "@/components/signature/work-exhibition";
import styles from "./work.module.css";

export const metadata: Metadata = { title: `Work — ${site.brand}` };

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const selected = workCategories.some((item) => item.id === category)
    ? (category as WorkCategory)
    : "all";
  const entries = works.filter(
    (work) => selected === "all" || work.category === selected,
  );
  const collaborations = works.filter(
    (work) => work.openToCollaboration && work.showCollaborationButton,
  );
  const github = publicIdentities.find(
    (identity) => identity.id === "github" && identity.visible && identity.verified,
  );

  return (
    <div className={`inner-page work-page ${styles.page}`}>
      <header className={styles.opening}>
        <h1 data-page-title>
          <span>Selected <em>work.</em></span>
        </h1>
        <span>Software / 01—{String(works.length).padStart(2, "0")}</span>
      </header>
      <WorkExhibition works={works} />
      <section
        className={styles.archive}
        id="work-directory"
        tabIndex={-1}
        aria-labelledby="work-index-title"
      >
        <header className={styles.indexHeading}>
          <h2 id="work-index-title">The index.</h2>
          <span>{String(works.length).padStart(2, "0")} projects / digital</span>
        </header>
        <nav
          className={`category-navigation ${styles.categories}`}
          aria-label="Work categories"
        >
          <Link href="/work" aria-current={selected === "all" ? "page" : undefined}>
            All work
          </Link>
          {workCategories.map((item) => (
            <Link
              key={item.id}
              href={`/work?category=${item.id}`}
              aria-current={selected === item.id ? "page" : undefined}
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <FilterScene selected={selected}>
          {entries.length ? (
            <div data-work-index>
              {entries.map((work, i) => (
                <article key={work.id} className={styles.entry}>
                  <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
                  <h3>
                    <Link href={`/work/${work.slug}`}>
                      {work.title}<span aria-hidden>↗</span>
                    </Link>
                  </h3>
                  <span className={styles.discipline}>{work.discipline}</span>
                  <details className={styles.notes}>
                    <summary>
                      <span className={styles.notesLabel}>Notes</span>
                      <span aria-hidden className={styles.plus}>+</span>
                      <span className="sr-only"> about {work.title}</span>
                    </summary>
                    <div className={styles.notesBody}>
                      <p>{work.description}</p>
                      <WorkActions work={work} />
                    </div>
                  </details>
                </article>
              ))}
            </div>
          ) : (
            <div className="quiet-empty">
              <span aria-hidden="true">—</span>
              <h2>{workCategories.find((item) => item.id === selected)?.title}</h2>
              <p>{universeCopy.work.empty}</p>
              <p>{workCategories.find((item) => item.id === selected)?.note}</p>
            </div>
          )}
        </FilterScene>
      </section>
      <section
        className={styles.ending}
        id="work-collaboration"
        aria-labelledby="work-collaboration-title"
      >
        <span className={styles.endingLabel}>An open invitation / SAT’chi</span>
        <h2 id="work-collaboration-title">Next,<br /><em>together.</em></h2>
        <div className={styles.endingActions}>
          {collaborations.map((work) => <WorkActions key={work.id} work={work} />)}
          {github && (
            <a href={github.url} target="_blank" rel="noopener noreferrer">
              GitHub <span aria-hidden>↗</span>
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

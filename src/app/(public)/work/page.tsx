import type { Metadata } from "next";
import Link from "next/link";
import {
  works,
  workCategories,
  universeCopy,
  type WorkCategory,
} from "@/data/universe";
import { site } from "@/data/site";
import { PageHeading } from "@/components/universe/page-heading";
import { WorkActions } from "@/components/universe/work-actions";
import { MediaFrame } from "@/components/archive/media-frame";
import { ProjectArt } from "@/components/visuals/project-art";
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
  return (
    <div className="inner-page work-page">
      <PageHeading
        label="02 / SELECTED & COLLECTED"
        title={universeCopy.work.title}
        description={universeCopy.work.description}
      />
      <nav className="category-navigation" aria-label="Work categories">
        <Link
          href="/work"
          aria-current={selected === "all" ? "page" : undefined}
        >
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
      {entries.length ? (
        <div className="work-index">
          {entries.map((work, i) => (
            <article
              key={work.id}
              className={`work-index-entry ${i === 0 ? "is-first" : ""}`}
            >
              <div className="work-index-number">
                {String(i + 1).padStart(2, "0")}
                <span className="eyebrow">{work.category}</span>
              </div>
              <Link
                href={`/work/${work.slug}`}
                className="work-index-art"
                aria-label={`Open ${work.title}`}
              >
                {work.images[0] ? (
                  <MediaFrame media={work.images[0]} />
                ) : work.commentProjectId ? (
                  <ProjectArt id={work.commentProjectId} />
                ) : (
                  <span className="work-no-image">Images to come.</span>
                )}
                <span className="work-art-label">
                  {work.images.length
                    ? "SELECTED IMAGE"
                    : "ORIGINAL CONCEPT ART / NOT A SCREENSHOT"}
                </span>
              </Link>
              <div className="work-index-copy">
                <span className="eyebrow">{work.discipline}</span>
                <h2>
                  <Link href={`/work/${work.slug}`}>{work.title}</Link>
                </h2>
                <p>{work.description}</p>
                <Link className="text-link" href={`/work/${work.slug}`}>
                  View the work ↗
                </Link>
                <WorkActions work={work} />
              </div>
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
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { getWork, works } from "@/data/universe";
import { site } from "@/data/site";
import { PageHeading } from "@/components/universe/page-heading";
import { WorkActions } from "@/components/universe/work-actions";
import { MediaFrame } from "@/components/archive/media-frame";
import { ProjectArt } from "@/components/visuals/project-art";
import { Comments } from "@/components/community/comments";
export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const work = getWork((await params).slug);
  return { title: `${work?.title ?? "Work not found"} — ${site.brand}` };
}
export default async function WorkDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const work = getWork((await params).slug);
  if (!work) notFound();
  const related = work.relatedWorkSlugs
    .map(getWork)
    .filter((item) => item !== undefined);
  return (
    <div className="inner-page work-detail" data-work-id={work.id}>
      <PageHeading
        label={`WORK / ${work.category.toUpperCase()}`}
        title={work.title}
        description={work.description}
        back={{ href: "/work", label: "All work" }}
      />
      <div className="work-detail-art">
        {work.images.length ? (
          work.images.map((image) => (
            <MediaFrame key={image.id} media={image} sizes="90vw" />
          ))
        ) : work.commentProjectId ? (
          <>
            <ProjectArt id={work.commentProjectId} />
            <p className="work-art-label">
              ORIGINAL CONCEPT ART / NOT AN APPLICATION SCREENSHOT
            </p>
          </>
        ) : (
          <div className="quiet-empty">Images have not been added yet.</div>
        )}
      </div>
      <section
        className="work-detail-context"
        aria-labelledby="work-context-heading"
      >
        <div>
          <span className="eyebrow">THE WORK</span>
          <h2 id="work-context-heading">An idea, taking shape.</h2>
          <p>{work.description}</p>
          <WorkActions work={work} />
        </div>
        <dl>
          <div>
            <dt>Discipline</dt>
            <dd>{work.discipline}</dd>
          </div>
          <div>
            <dt>Technologies / materials</dt>
            <dd>
              {work.technologiesOrMaterials.join(" / ") || "Not yet documented"}
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{work.status ?? "Not yet documented"}</dd>
          </div>
          {work.externalLinks.map((link) => (
            <div key={link.url}>
              <dt>External link</dt>
              <dd>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label} ↗
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </section>
      {related.length > 0 && (
        <nav className="related-pages" aria-label="Related work">
          <span className="eyebrow">RELATED WORK</span>
          {related.map((item) => (
            <Link key={item.id} href={`/work/${item.slug}`}>
              {item.title} ↗
            </Link>
          ))}
        </nav>
      )}
      {work.commentProjectId && (
        <section
          className="detail-discussion"
          aria-labelledby="project-comments-heading"
        >
          <span className="eyebrow">A PUBLIC CONVERSATION ABOUT THE WORK</span>
          <h2 id="project-comments-heading">Project notes.</h2>
          <p>Comments are reviewed before publication. No account needed.</p>
          <Comments
            id={`${work.commentProjectId}-comment`}
            target={{ kind: "project", projectId: work.commentProjectId }}
          />
        </section>
      )}
    </div>
  );
}

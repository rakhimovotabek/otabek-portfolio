import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { featuredWorkIds, getWork } from "@/data/universe";
import { WorkActions } from "@/components/universe/work-actions";
import { Section } from "@/components/ui/section";
import { projects } from "@/data/portfolio";
import { ProjectArt } from "@/components/visuals/project-art";
import { ProjectDiscussion } from "@/components/community/comments";
import { VaultMotion } from "@/components/motion/vault-motion";
export function ProjectIndex({ featured = false }: { featured?: boolean }) {
  const collection = featured
    ? projects.filter((project) =>
        featuredWorkIds.some((id) => id === project.id),
      )
    : projects;
  return (
    <Section id="work" label="02 / SELECTED WORK" className="vault-section">
      <div className="vault-heading">
        <h2 id="work-heading">
          The
          <br />
          <span>Vault</span>
          <span className="vault-count">
            ({String(collection.length).padStart(2, "0")})
          </span>
        </h2>
        <div className="vault-intro">
          <p>Selected software, each built around a different question.</p>
          <span className="eyebrow">SOFTWARE / PART OF THE COLLECTION</span>
        </div>
      </div>
      <div className="vault-rule">
        <span>EXPLORE THE COLLECTION</span>
        <span>2026 / PORTFOLIO EDITION</span>
      </div>
      <VaultMotion chapters={collection.map(({ id, name }) => ({ id, name }))}>
        <div className="project-exhibition">
          {collection.map((project, i) => (
            <article
              className={`project project-${project.id}`}
              id={project.id}
              data-project-id={project.id}
              key={project.id}
              aria-labelledby={`${project.id}-title`}
            >
              <div className="project-caption">
                <span className="project-number">0{i + 1}</span>
                <span className="eyebrow">{project.category}</span>
              </div>
              <figure className="project-figure">
                {project.image ? (
                  <div className="artwork project-screenshot">
                    <Image
                      src={project.image}
                      alt={`${project.name} application screenshot`}
                      fill
                      sizes="(max-width: 700px) 90vw, 55vw"
                    />
                  </div>
                ) : (
                  <ProjectArt id={project.id} />
                )}
                <figcaption>
                  <span>
                    FIG. 0{i + 1} —{" "}
                    {project.image
                      ? "APPLICATION SCREENSHOT"
                      : "ORIGINAL CONCEPT ART"}
                  </span>
                  {!project.image && <span>NOT AN APPLICATION SCREENSHOT</span>}
                </figcaption>
              </figure>
              <div className="project-text">
                <h3 id={`${project.id}-title`}>{project.name}</h3>
                <p>{project.description}</p>
                <dl className="project-facts">
                  <div>
                    <dt>Technology</dt>
                    <dd>{project.technology ?? "Stack to be documented"}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{project.status ?? "Not yet documented"}</dd>
                  </div>
                </dl>
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    Visit project <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                ) : (
                  <p className="project-link-note">
                    Verified project links coming later.
                  </p>
                )}
              </div>
              {featured ? (
                <div className="project-page-actions">
                  <Link href={`/work/${project.id}`} className="text-link">
                    Open project ↗
                  </Link>
                  <WorkActions work={getWork(project.id)!} />
                </div>
              ) : (
                <ProjectDiscussion
                  id={`${project.id}-comment`}
                  target={{ kind: "project", projectId: project.id }}
                />
              )}
            </article>
          ))}
        </div>
      </VaultMotion>
      <div className="vault-end">
        <span className="eyebrow">SELECTED / NOT THE WHOLE COLLECTION</span>
        <Link className="serif-word" href="/work">
          Explore all work ↗
        </Link>
        <span aria-hidden="true">↓</span>
      </div>
    </Section>
  );
}

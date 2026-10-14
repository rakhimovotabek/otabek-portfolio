import { TransitionLink as Link } from "@/components/motion/route-transitions";
import type { WorkEntry } from "@/data/universe";
import { MediaFrame } from "@/components/archive/media-frame";
import { ProjectArt } from "@/components/visuals/project-art";
import { WorkActions } from "@/components/universe/work-actions";
import { ScrollScene } from "./scroll-scene";
import styles from "./signature.module.css";

export function WorkExhibition({ works }: { works: readonly WorkEntry[] }) {
  if (works.length < 2) return null;
  return (
    <>
      <div className={styles.sceneIntro}>
        <span>Selected work / two exhibits</span>
        <a href="#work-directory">Skip to all projects ↓</a>
      </div>
      <ScrollScene kind="work">
        <div className={styles.stage} data-stage>
          {works.slice(0, 2).map((work, i) => (
            <article
              key={work.id}
              className={`${styles.exhibit} ${i ? styles.law : styles.learning}`}
              data-exhibit
            >
              <div className={styles.exhibitHeader}>
                <span>{work.discipline}</span>
                <span>Exhibit {String(i + 1).padStart(2, "0")} / 02</span>
              </div>
              <h2 className={styles.exhibitTitle} data-exhibit-title>
                {work.title}
              </h2>
              <Link
                href={`/work/${work.slug}`}
                className={styles.exhibitArt}
                data-exhibit-art
                aria-label={`Explore ${work.title}`}
              >
                {work.images[0] ? (
                  <MediaFrame media={work.images[0]} sizes="70vw" />
                ) : work.commentProjectId ? (
                  <ProjectArt id={work.commentProjectId} />
                ) : (
                  <span>Images to come.</span>
                )}
                <span className={styles.artCaption}>
                  {work.images.length
                    ? "Selected project image"
                    : "Original concept art / not an app screenshot"}
                </span>
              </Link>
              <div className={styles.exhibitCopy} data-exhibit-copy>
                <p>{work.description}</p>
                <Link href={`/work/${work.slug}`} className={styles.explore}>
                  Explore the project <span aria-hidden>→</span>
                </Link>
                <WorkActions work={work} />
              </div>
            </article>
          ))}
          <div className={styles.stageFooter}>
            <div className={styles.exhibitNav} aria-label="Choose an exhibit">
              {works.slice(0, 2).map((work, i) => (
                <button
                  type="button"
                  key={work.id}
                  data-jump
                  aria-pressed={i === 0}
                >
                  {work.title}
                </button>
              ))}
            </div>
            <a href="#work-directory">All projects ↓</a>
            <span className={styles.stageRule} data-stage-rule />
          </div>
        </div>
      </ScrollScene>
    </>
  );
}

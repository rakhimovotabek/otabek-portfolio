import { TransitionLink as Link } from "@/components/motion/route-transitions";
import type { WorkEntry } from "@/data/universe";
import { MediaFrame } from "@/components/archive/media-frame";
import { ProjectArt } from "@/components/visuals/project-art";
import { ScrollScene } from "./scroll-scene";
import styles from "./signature.module.css";
import artDirection from "./work-exhibition.module.css";
import { ProductExhibit } from "./product-exhibit";

export function WorkExhibition({ works }: { works: readonly WorkEntry[] }) {
  if (works.length < 2) return null;
  return (
    <>
      <ScrollScene kind="work" className={artDirection.exhibition}>
        <div className={styles.stage} data-stage>
          {works.slice(0, 2).map((work, i) => (
            <article
              key={work.id}
              className={`${styles.exhibit} ${i ? styles.law : styles.learning}`}
              data-exhibit
            >
              <div className={styles.exhibitHeader}>
                <span>
                  {String(i + 1).padStart(2, "0")} / {work.discipline}
                </span>
                <a href="#work-directory">Index ↓</a>
              </div>
              <h2 className={styles.exhibitTitle} data-exhibit-title>
                {work.id === "sat-chi" ? (
                  <>SAT<em>’chi</em></>
                ) : work.id === "huquq-test" ? (
                  <>Huquq<em>Test</em></>
                ) : work.title}
              </h2>
              <Link
                href={`/work/${work.slug}`}
                className={styles.exhibitArt}
                data-exhibit-art
                aria-label={`Explore ${work.title}`}
              >
                {work.id === "sat-chi" || work.id === "huquq-test" ? (
                  <ProductExhibit id={work.id} />
                ) : work.images[0] ? (
                  <MediaFrame media={work.images[0]} sizes="70vw" />
                ) : work.commentProjectId ? (
                  <ProjectArt id={work.commentProjectId} />
                ) : (
                  <span>Images to come.</span>
                )}
              </Link>
              <span className={artDirection.provenance} data-exhibit-caption>
                {work.id === "sat-chi" ? "Live interface / SAT’chi" : work.id === "huquq-test" ? "Live sign-in + source component demo" : "Selected project image"}
              </span>
              <div className={styles.exhibitCopy} data-exhibit-copy>
                <p>{work.description.split(/(?<=\.)\s/)[0]}</p>
                <Link href={`/work/${work.slug}`} className={styles.explore}>
                  View case study <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
          <div className={styles.stageFooter}>
            <div className={styles.exhibitNav} role="group" aria-label="Choose an exhibit">
              {works.slice(0, 2).map((work, i) => (
                <button
                  type="button"
                  key={work.id}
                  data-jump
                  aria-pressed={i === 0}
                >
                  {String(i + 1).padStart(2, "0")} <span>{work.title}</span>
                </button>
              ))}
            </div>
            <span>Scroll to explore</span>
            <span className={styles.stageRule} data-stage-rule />
          </div>
        </div>
      </ScrollScene>
    </>
  );
}

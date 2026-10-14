import { presence } from "@/data/archive";
import { profile } from "@/data/portfolio";
import { MediaFrame } from "@/components/archive/media-frame";
import { ScrollScene } from "./scroll-scene";
import styles from "./signature.module.css";

export function AboutStory() {
  return (
    <>
      <div className={styles.sceneIntro}>
        <span>A person, before a portfolio</span>
        <a href="#biography-heading">Read the biography ↓</a>
      </div>
      <ScrollScene kind="about">
        <div className={`${styles.stage} ${styles.aboutStage}`} data-stage>
          <div className={styles.storyFrames}>
            {presence.portraits.map((media, i) => (
              <div
                className={`${styles.storyFrame} ${styles[`portrait${i}`]}`}
                key={media.id}
                data-story-frame
              >
                <MediaFrame
                  media={media}
                  sizes="(max-width: 799px) 80vw, 40vw"
                />
              </div>
            ))}
          </div>
          <div
            className={`${styles.storyChapter} ${styles.chapter0}`}
            data-story-chapter
          >
            <h2>
              Learning
              <br />
              <em>by making.</em>
            </h2>
            <p>
              {profile.role}.<br />
              {profile.country}.
            </p>
            <span className={styles.storyNote}>
              Three frames reserved for real photographs.
            </span>
          </div>
          <div
            className={`${styles.storyChapter} ${styles.chapter1}`}
            data-story-chapter
          >
            <h2>
              And paying
              <br />
              <em>attention.</em>
            </h2>
            <p>{presence.note}</p>
            <span className={styles.storyNote}>
              Debate / public speaking / English sessions
            </span>
          </div>
          <div
            className={`${styles.storyChapter} ${styles.chapter2}`}
            data-story-chapter
          >
            <span className={styles.storyNote}>The record along the way</span>
            <h2>
              A few
              <br />
              <em>milestones.</em>
            </h2>
            <a href="#achievements" className={styles.explore}>
              Explore the record <span aria-hidden>↓</span>
            </a>
          </div>
          <div className={styles.storyFooter}>
            <span>Otabek Rakhimov</span>
            <span>Still learning.</span>
            <span className={styles.storyRule} data-story-rule />
          </div>
        </div>
      </ScrollScene>
    </>
  );
}

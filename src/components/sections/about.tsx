import Image from "next/image";
import Link from "next/link";
import { MediaFrame } from "@/components/archive/media-frame";
import { presence } from "@/data/archive";
import { profile } from "@/data/portfolio";
import { site } from "@/data/site";
import { heroCopy } from "@/data/hero";
import styles from "./hero-worlds.module.css";
export function About({ compact = false }: { compact?: boolean }) {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={`about-section ${styles.editorial} ${compact ? "about-compact" : ""}`}
      data-hero-editorial
    >
      <div className={styles["editorial-shape"]} aria-hidden="true" />
      <div className={styles["editorial-grid"]}>
        <div>
          <span className={styles.eyebrow}>{heroCopy.editorial.label}</span>
          <h2 id="about-heading" data-editorial-heading>
            {heroCopy.editorial.heading[0]}
            <br />
            <em>{heroCopy.editorial.heading[1]}</em>
          </h2>
          <p className={styles["editorial-copy"]}>
            {compact ? profile.introduction : heroCopy.editorial.description}
          </p>
          <Link className={styles["editorial-note"]} href="/about">
            MORE ABOUT THE PERSON ↗
          </Link>
        </div>
        <div className={styles["editorial-aside"]}>
          {heroCopy.editorial.tiles.map((tile) => (
            <div
              key={tile.color}
              className={styles["tile-motion"]}
              data-editorial-card
            >
              <Link
                className={`${styles["archive-card"]} ${styles[tile.color]}`}
                href={tile.href}
              >
                {tile.color === "yellow" && presence.portraits[0].src && (
                  <Image
                    src={presence.portraits[0].src}
                    alt={presence.portraits[0].alt}
                    fill
                    sizes="(max-width: 800px) 50vw, 25vw"
                  />
                )}
                <span className={styles["tile-label"]}>{tile.label}</span>
                <span className={styles["tile-status"]}>
                  {tile.color === "yellow" && presence.portraits[0].src
                    ? "SELECTED PORTRAIT"
                    : tile.status}
                </span>
                <h3>{tile.title}</h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
      {!compact && (
        <>
          <div className="about-feature" id="personal-story">
            <div className="presence-images">
              <MediaFrame
                media={presence.portraits[0]}
                className="presence-main"
              />
              <MediaFrame
                media={presence.portraits[1]}
                className="presence-secondary"
                sizes="(max-width: 700px) 45vw, 20vw"
              />
            </div>
            <div className="about-story">
              <span className="eyebrow">
                {profile.name.toUpperCase()} / ONLINE AS{" "}
                {site.brand.toUpperCase()}
              </span>
              <h3>
                {presence.storyHeading[0]}
                <br />
                <span className="serif-word">{presence.storyHeading[1]}</span>
              </h3>
              {profile.biography.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <div className="about-signoff">
                <span>{profile.country}</span>
                <span>{profile.role}</span>
              </div>
            </div>
          </div>
          <div className="presence-afternote">
            <div>
              <span className="eyebrow">THE OTHER PART OF THE STORY</span>
              <p>{presence.note}</p>
              <div className="interests-line">
                <span className="eyebrow">CURRENT INTERESTS</span>
                <p>{profile.interests.join(" / ")}</p>
              </div>
            </div>
            <MediaFrame
              media={presence.portraits[2]}
              className="presence-detail"
              sizes="(max-width: 700px) 40vw, 22vw"
            />
          </div>
        </>
      )}
      <div className={styles["editorial-foot"]}>
        <span>{site.brand.toUpperCase()} / A PERSONAL ARCHIVE</span>
        <span>
          {profile.country.toUpperCase()} / {profile.name.toUpperCase()}
        </span>
      </div>
    </section>
  );
}

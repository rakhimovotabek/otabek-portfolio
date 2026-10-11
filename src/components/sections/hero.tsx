import { ArrowDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { heroCopy, heroWorlds } from "@/data/hero";
import { site } from "@/data/site";
import { profile } from "@/data/portfolio";
import { presence, visualStudies } from "@/data/archive";
import styles from "./hero-worlds.module.css";

function WorldArt({ world }: { world: (typeof heroWorlds)[number] }) {
  const portrait = presence.portraits[0];
  const visual = visualStudies[0];
  if (world.id === "software")
    return (
      <>
        <div className={styles["sat-orbit"]} />
        <div className={styles["sat-orbit"]} />
        <div className={styles["sat-ui"]}>
          <header>
            <span>SAT’CHI / CONCEPT</span>
            <span>FIG. 01</span>
          </header>
          <div className={styles["ui-row"]} />
          <div className={`${styles["ui-row"]} ${styles.short}`} />
          {[0, 1, 2].map((i) => (
            <div className={styles["ui-choice"]} key={i}>
              <i />
              <span />
            </div>
          ))}
          <small className={styles["preview-note"]}>CONCEPT ART</small>
        </div>
      </>
    );
  if (world.id === "writings")
    return (
      <div className={styles["writing-art"]}>
        <div className={styles.serial}>{heroCopy.writing.label}</div>
        <div className={styles.poem}>
          {heroCopy.writing.lines.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </div>
        <span className={styles.line} />
        <span className={styles.line} />
        <div className={styles.mark}>&amp;</div>
        <small className={styles["writing-status"]}>
          {heroCopy.writing.status}
        </small>
      </div>
    );
  if (world.id === "visual")
    return (
      <>
        <div className={styles.orbital} />
        <div className={styles.orbital} />
        <div className={styles["experiment-screen"]}>
          {visual.src ? (
            <Image
              src={visual.src}
              alt={visual.alt}
              fill
              sizes="(max-width: 800px) 45vw, 25vw"
            />
          ) : (
            <>
              <small>{heroCopy.visual.label}</small>
              <b>{heroCopy.visual.title}</b>
              <svg
                className={styles["visual-lines"]}
                viewBox="0 0 250 75"
                fill="none"
              >
                {Array.from({ length: 7 }, (_, i) => (
                  <path
                    key={i}
                    d={`M${5 + i * 12} 72Q${85 + i * 10} ${-30 + i * 11} 245 ${12 + i * 7}`}
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </>
          )}
        </div>
        <small className={styles["visual-status"]}>
          {visual.src ? visual.caption : heroCopy.visual.status}
        </small>
      </>
    );
  return (
    <>
      <span className={styles["profile-caption"]}>
        {portrait.src
          ? profile.name.toUpperCase()
          : "AN ACTUAL PORTRAIT WILL GO HERE"}
      </span>
      <div className={styles["profile-frame"]}>
        {portrait.src ? (
          <Image
            src={portrait.src}
            alt={portrait.alt}
            fill
            sizes="(max-width: 800px) 40vw, 23vw"
          />
        ) : (
          <span className={styles["portrait-symbol"]}>
            {profile.name.charAt(0).toLowerCase()}.
          </span>
        )}
      </div>
    </>
  );
}

const worldStyle = {
  software: "sat",
  writings: "writing",
  visual: "experiment",
  about: "about",
} as const;
export function Hero() {
  const name = profile.name.toUpperCase();
  return (
    <section
      className={`hero-journey ${styles["hero-journey"]}`}
      aria-labelledby="hero-heading"
      data-hero-journey
    >
      <div className={styles.stage} data-hero-stage>
        <div
          className={styles["journey-progress"]}
          data-hero-progress
          aria-hidden="true"
        />
        <div className={styles.ambience} aria-hidden="true" />
        <div className={styles.stars} aria-hidden="true" />
        <div className={styles["hero-label"]}>{heroCopy.label}</div>
        <div className={styles["hero-right"]}>
          {profile.country.toUpperCase()} · UZT
        </div>
        <div className={styles.worlds} data-hero-worlds>
          {heroWorlds.map((world) => (
            <Link
              key={world.id}
              href={world.href}
              className={`${styles.world} ${styles[`world--${worldStyle[world.id]}`]}`}
              data-world={world.id}
              aria-label={`World ${world.number}: ${world.category}`}
            >
              <span className={styles["world-no"]}>
                WORLD {world.number} / {world.category.toUpperCase()}
              </span>
              <div className={styles["world-art"]} aria-hidden="true">
                <WorldArt world={world} />
              </div>
              <div className={styles["world-meta"]}>
                <span className={styles["world-kind"]}>{world.category}</span>
                <strong className={styles["world-title"]}>{world.title}</strong>
                <span className={styles["world-sub"]}>{world.description}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className={styles["hero-head"]} data-hero-head>
          <h1
            id="hero-heading"
            className={styles["hero-name"]}
            aria-label={name}
          >
            <span aria-hidden="true">
              {Array.from(name).map((char, i) => (
                <span className={styles.letter} data-hero-letter key={i}>
                  <span data-character>{char === " " ? "\u00a0" : char}</span>
                </span>
              ))}
            </span>
          </h1>
          <p className={styles["hero-caption"]}>{heroCopy.caption}</p>
        </div>
        <div
          className={styles["focus-scene"]}
          data-hero-focus
          inert
          aria-hidden="true"
        >
          <div className={styles["focus-grid"]} aria-hidden="true" />
          <div className={styles["focus-copy"]} data-focus-copy>
            <span className={styles["focus-index"]}>
              {heroCopy.focus.label}
            </span>
            <h2>
              {heroCopy.focus.project.name}
              <span>.</span>
            </h2>
            <p>{heroCopy.focus.project.description}</p>
            <Link
              className={styles["focus-link"]}
              href={`/work/${heroCopy.focus.project.id}`}
            >
              {heroCopy.focus.link}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div
            className={styles["focus-art"]}
            data-focus-art
            aria-hidden="true"
          >
            <div className={styles.display}>
              {heroCopy.focus.project.image ? (
                <Image
                  src={heroCopy.focus.project.image}
                  alt={`${heroCopy.focus.project.name} project screenshot`}
                  fill
                  sizes="(max-width: 800px) 85vw, 50vw"
                />
              ) : (
                <>
                  <div className={styles["screen-nav"]}>
                    SAT’CHI<span>CONCEPT STUDY</span>
                  </div>
                  <div className={styles["screen-body"]}>
                    <h3>Practice is a process.</h3>
                    <div className={styles.question}>
                      <em>Illustrative algebra prompt</em>Which expression is
                      equivalent to 2(x + 1)?
                      <div className={styles.options}>
                        <span>A　2x + 2</span>
                        <span>B　x − 2</span>
                        <span>C　3x</span>
                        <span>D　2x − 1</span>
                      </div>
                    </div>
                    <div className={styles.stat}>
                      <b>SAT</b>
                      <small>LEARNING STUDY</small>
                    </div>
                    <div className={`${styles.stat} ${styles["stat-green"]}`}>
                      <b>∑</b>
                      <small>ORIGINAL CONCEPT ART</small>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className={styles.floating}>
              <small>PROJECT NOTE</small>
              <b>
                Make it
                <br />
                matter. ↗
              </b>
            </div>
          </div>
          <div className={styles["focus-corner"]}>
            {heroCopy.focus.project.image
              ? "PROJECT SCREENSHOT"
              : heroCopy.focus.caption}
          </div>
        </div>
        <a className={styles["scroll-note"]} href="#about" data-hero-scroll>
          <span>
            <i />
          </span>
          SCROLL TO ENTER
          <ArrowDown size={12} aria-hidden="true" />
        </a>
        <div className={styles["index-note"]}>
          01 — 04 / {site.brand.toUpperCase()} ARCHIVE
        </div>
        <div className={styles["wipe-layer"]} data-hero-wipe aria-hidden="true">
          <span className={`${styles.stripe} ${styles.one}`} />
          <span className={`${styles.stripe} ${styles.two}`} />
          <span className={`${styles.stripe} ${styles.three}`} />
        </div>
      </div>
    </section>
  );
}

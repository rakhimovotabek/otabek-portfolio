import { ArrowDown, ArrowUpRight } from "lucide-react";
import { StudyArt } from "@/components/visuals/study-art";
import { site } from "@/data/site";
import { profile } from "@/data/portfolio";
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-motion">
        <div className="hero-kicker">
          <span>{site.opening.label}</span>
          <span>{profile.country} / UZT</span>
        </div>
        <figure className="hero-art">
          <div className="hero-art-reveal">
            <StudyArt />
          </div>
          <figcaption>
            <span>STUDY 00</span>
            <span>{site.opening.artworkCaption}</span>
          </figcaption>
        </figure>
        <div className="hero-index" aria-hidden="true">
          <span>01—</span>
          <span>
            ENTER
            <br />
            THE COLLECTION
          </span>
        </div>
        <div className="hero-identity">
          <span>{profile.name}</span>
          <span>{profile.role}</span>
        </div>
        <h1 id="hero-heading" className="hero-wordmark">
          <span className="wordmark-reveal">
            {site.brand}
            <span className="brand-period">.</span>
          </span>
        </h1>
        <div className="hero-lower">
          <div className="hero-intro">
            <h2>
              {site.opening.lines.map((line, i) => (
                <span className="motion-line" key={line}>
                  <span className={i ? "serif-word" : ""}>{line}</span>
                </span>
              ))}
            </h2>
            <p className="hero-description">{site.opening.note}</p>
            <a className="text-link" href="#archive">
              Open the archive <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <a className="scroll-cue" href="#about">
            <ArrowDown size={18} aria-hidden="true" />
            <span>A LITTLE FURTHER</span>
          </a>
        </div>
        <div className="hero-footnote">
          <span>A COLLECTION IN PROGRESS</span>
          <span>SOFTWARE / WORDS / IMAGES</span>
        </div>
      </div>
    </section>
  );
}

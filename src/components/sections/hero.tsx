import { ArrowDown, ArrowUpRight } from "lucide-react";
import { HeroMotion } from "@/components/motion/hero-motion";
import { FoldMark } from "@/components/visuals/fold-mark";
import { site } from "@/data/site";
import { profile } from "@/data/portfolio";
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <HeroMotion>
        <div className="hero-kicker" data-hero-reveal>
          <span>A PERSONAL WORKING ARCHIVE</span>
          <span>SOFTWARE / IDEAS / EXPLORATION</span>
        </div>
        <h1 id="hero-heading" className="hero-wordmark" data-hero-reveal>
          {site.brand}
          <span className="brand-period">.</span>
        </h1>
        <div className="hero-lower">
          <div className="hero-intro" data-hero-reveal>
            <p className="eyebrow">
              {profile.name} — {profile.role}
            </p>
            <h2>
              Code, questions
              <br />
              <span className="serif-word">& other pursuits.</span>
            </h2>
            <p className="hero-description">
              From Uzbekistan. Exploring computer science,
              <br className="desktop-break" /> building useful software, and
              learning as I go.
            </p>
            <a className="text-link" href="#work">
              Enter the Vault <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          </div>
          <figure className="hero-art">
            <FoldMark />
            <figcaption>
              <span>FIG. 01</span>
              <span>
                AN OPEN FRAME.
                <br />
                ROOM FOR WHAT COMES NEXT.
              </span>
            </figcaption>
          </figure>
          <a className="scroll-cue" href="#about">
            <ArrowDown size={18} aria-hidden="true" />
            <span>SCROLL TO EXPLORE</span>
          </a>
        </div>
        <div className="hero-footnote">
          <span>PERSONAL PORTFOLIO / WORKING COLLECTION</span>
          <span>UZBEKISTAN · UZT / UTC+5</span>
        </div>
      </HeroMotion>
    </section>
  );
}

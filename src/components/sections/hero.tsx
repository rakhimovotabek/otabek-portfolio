import { ArrowDown, ArrowUpRight, Asterisk } from "lucide-react";
import { HeroMotion } from "@/components/motion/hero-motion";
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <HeroMotion>
        <div className="hero-kicker" data-hero-reveal>
          <span className="status-dot" />
          STUDENT DEVELOPER · ALWAYS EXPLORING
        </div>
        <div className="hero-composition">
          <h1 id="hero-heading" data-hero-reveal>
            Curiosity.
            <br />
            <span className="serif-word">Made</span> real
            <span className="cyan-period">.</span>
          </h1>
          <div className="orbital-art" aria-hidden="true">
            <svg viewBox="0 0 600 600" fill="none">
              <defs>
                <linearGradient
                  id="orbit"
                  x1="70"
                  y1="60"
                  x2="520"
                  y2="530"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#8ae7ff" />
                  <stop offset=".45" stopColor="#3566ff" />
                  <stop offset="1" stopColor="#10173c" />
                </linearGradient>
              </defs>
              <circle
                cx="300"
                cy="300"
                r="240"
                stroke="#31343c"
                strokeDasharray="2 9"
              />
              <path d="M40 300h520M300 40v520" stroke="#232630" />
              <g stroke="url(#orbit)" strokeWidth="2">
                {Array.from({ length: 17 }, (_, i) => (
                  <ellipse
                    key={i}
                    cx="300"
                    cy="300"
                    rx="224"
                    ry={40 + i * 10}
                    transform={`rotate(${i * 11} 300 300)`}
                  />
                ))}
              </g>
              <circle cx="300" cy="300" r="5" fill="#ddff96" />
              <circle cx="462" cy="136" r="8" fill="#8ae7ff" />
            </svg>
            <span className="orbit-coordinate">
              41° N / 64° E<br />
              IDEAS IN ORBIT
            </span>
          </div>
        </div>
        <div className="hero-bottom" data-hero-reveal>
          <div className="hero-person">
            <Asterisk size={27} aria-hidden="true" />
            <p>
              Otabek Rakhimov
              <br />
              <span>Code. Questions. Possibilities.</span>
            </p>
          </div>
          <p className="hero-description">
            Exploring the space between
            <br />
            computer science and human ideas.
            <br />
            <a className="text-link" href="#work">
              Explore my work <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </p>
          <a
            className="scroll-cue"
            href="#about"
            aria-label="Scroll to about me"
          >
            <ArrowDown size={20} aria-hidden="true" />
          </a>
        </div>
        <div className="hero-footnote">
          <span>PERSONAL PORTFOLIO</span>
          <span>THE FIRST CHAPTER — 01</span>
        </div>
      </HeroMotion>
    </section>
  );
}

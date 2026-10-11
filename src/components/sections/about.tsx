import { Section } from "@/components/ui/section";
import { profile } from "@/data/portfolio";
import { site } from "@/data/site";
export function About() {
  return (
    <Section id="about" label="01 / FIELD NOTES" className="about-section">
      <div className="about-head">
        <h2 id="about-heading">
          The person
          <br />
          behind <span className="serif-word">the alias.</span>
        </h2>
        <p className="margin-note">
          A student, a developer,
          <br />
          and still figuring things out.
        </p>
      </div>
      <div className="about-feature">
        <figure className="portrait-placeholder">
          <div className="portrait-grid" aria-hidden="true">
            <span>
              O<span className="portrait-initial">R</span>
            </span>
          </div>
          <figcaption>
            <span>OTABEK RAKHIMOV</span>
            <span>PORTRAIT TO COME</span>
          </figcaption>
        </figure>
        <div className="about-story">
          <span className="eyebrow">THE SHORT VERSION</span>
          <h3>
            I’m Otabek.
            <br />
            Online, <span className="serif-word">{site.brand}.</span>
          </h3>
          {profile.biography.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="about-signoff">
            <span>{profile.country}</span>
            <span>STUDENT DEVELOPER</span>
          </div>
        </div>
      </div>
      <div className="interests-line">
        <span className="eyebrow">ON MY MIND</span>
        <p>{profile.interests.join(" / ")}</p>
      </div>
    </Section>
  );
}

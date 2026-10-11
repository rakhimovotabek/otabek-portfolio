import { Section } from "@/components/ui/section";
import { achievements, profile } from "@/data/portfolio";
export function About() {
  return (
    <Section
      id="about"
      label="01 / THE PERSON BEHIND THE CODE"
      className="about-section"
    >
      <div className="about-intro">
        <h2 id="about-heading">
          A curious mind.
          <br />
          <span className="serif-word">An open horizon.</span>
        </h2>
        <div className="about-copy">
          <p>{profile.introduction}</p>
          <p className="muted">
            Beyond the screen, debate, public speaking, and teaching help me
            connect ideas with people.
          </p>
        </div>
      </div>
      <div className="about-details">
        <div>
          <h3 className="eyebrow">FIELDS OF CURIOSITY</h3>
          <ul className="interest-list">
            {profile.interests.map((interest) => (
              <li key={interest}>{interest}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="eyebrow">A FEW MILESTONES</h3>
          <dl className="achievement-list">
            {achievements.slice(0, 3).map((item) => (
              <div key={item.id}>
                <dt>{item.title}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
          <p className="small-note">
            More achievements and experiences will appear in the next chapters.
          </p>
        </div>
      </div>
    </Section>
  );
}

import { Section } from "@/components/ui/section";
import { MediaFrame } from "@/components/archive/media-frame";
import { presence } from "@/data/archive";
import { profile } from "@/data/portfolio";
import { site } from "@/data/site";
export function About() {
  return (
    <Section id="about" label="01 / PRESENCE" className="about-section">
      <div className="about-head">
        <h2 id="about-heading">
          {presence.heading[0]}
          <br />
          <span className="serif-word">{presence.heading[1]}</span>
        </h2>
        <p className="margin-note">{presence.short}</p>
      </div>
      <div className="about-feature">
        <div className="presence-images">
          <MediaFrame media={presence.portraits[0]} className="presence-main" />
          <MediaFrame
            media={presence.portraits[1]}
            className="presence-secondary"
            sizes="(max-width: 700px) 45vw, 20vw"
          />
        </div>
        <div className="about-story">
          <span className="eyebrow">
            {profile.name.toUpperCase()} / ONLINE AS {site.brand.toUpperCase()}
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
    </Section>
  );
}

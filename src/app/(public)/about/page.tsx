import type { Metadata } from "next";
import { profile } from "@/data/portfolio";
import { presence } from "@/data/archive";
import { aboutDetails } from "@/data/universe";
import { PageHeading } from "@/components/universe/page-heading";
import { Achievements } from "@/components/sections/achievements";
import { site } from "@/data/site";
import { AboutStory } from "@/components/signature/about-story";
export const metadata: Metadata = { title: `About — ${site.brand}` };
export default function AboutPage() {
  return (
    <div className="inner-page about-page">
      <PageHeading
        label="01 / THE PERSON"
        title={profile.name}
        description={`${profile.role} from ${profile.country}. Online as ${site.brand}.`}
      />
      <AboutStory />
      <Achievements />
      <section
        className="portrait-story signature-biography"
        aria-labelledby="biography-heading"
      >
        <div className="about-story">
          <span className="eyebrow">BIOGRAPHY</span>
          <h2 id="biography-heading">
            {presence.storyHeading[0]}
            <em>{presence.storyHeading[1]}</em>
          </h2>
          {profile.biography.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>
      <section className="about-notebook" aria-labelledby="interests-heading">
        <div>
          <span className="eyebrow">NOT ONLY CODE</span>
          <h2 id="interests-heading">What holds my attention.</h2>
          <p className="interest-paragraph">{profile.interests.join(" / ")}</p>
          <p>{presence.note}</p>
          <div className="personal-record">
            <h3>Documented skills</h3>
            {aboutDetails.skills.map((skill) => (
              <p key={skill.title}>
                <strong>{skill.title}</strong> — {skill.detail}
              </p>
            ))}
            <h3>Education</h3>
            {aboutDetails.education.length ? (
              aboutDetails.education.map((item) => (
                <p key={item.title}>
                  {item.title} — {item.detail}
                  {item.dates && ` / ${item.dates}`}
                </p>
              ))
            ) : (
              <p>
                Student. School and education details have not been published.
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="page-afterword">
        <span className="eyebrow">EXPERIENCE / BEYOND THE SCREEN</span>
        <p>
          Debate, judging and English speaking sessions are part of the story
          alongside software. The record above keeps their verified details
          together.
        </p>
      </section>
    </div>
  );
}

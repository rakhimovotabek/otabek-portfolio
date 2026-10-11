import { Section } from "@/components/ui/section";
import { achievements } from "@/data/portfolio";
export function Achievements() {
  const highlights = achievements.filter((a) => a.display);
  const supporting = achievements.filter((a) =>
    ["district", "debate", "judge"].includes(a.id),
  );
  return (
    <Section
      id="achievements"
      label="07 / A FEW MILESTONES"
      className="achievements-section"
    >
      <div className="achievements-heading">
        <h2 id="achievements-heading">
          Small steps.
          <br />
          <span className="serif-word">Lasting marks.</span>
        </h2>
        <p>
          Competitions, language, and learning.
          <br />A record of the work along the way.
        </p>
      </div>
      <div className="milestone-list">
        {highlights.map((a, i) => (
          <article key={a.id} className="milestone">
            <span className="milestone-index">0{i + 1}</span>
            <span className="milestone-number" aria-hidden="true">
              {a.display?.value}
            </span>
            <div>
              <h3>{a.title}</h3>
              <p>{a.detail}</p>
            </div>
            <span className="milestone-note">{a.display?.label}</span>
          </article>
        ))}
      </div>
      <div className="supporting-milestones">
        {supporting.map((a) => (
          <div key={a.id}>
            <h3>{a.title}</h3>
            <p>{a.detail}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

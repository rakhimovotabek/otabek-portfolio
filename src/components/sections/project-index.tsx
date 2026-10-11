import { Section } from "@/components/ui/section";
import { projects } from "@/data/portfolio";
export function ProjectIndex() {
  return (
    <Section
      id="work"
      label="02 / SELECTED EXPLORATIONS"
      className="work-section"
    >
      <div className="work-heading">
        <h2 id="work-heading">
          Ideas into
          <br />
          <span className="serif-word">existence.</span>
        </h2>
        <p>
          A first look at my projects.
          <br />
          <span>Case studies are on the way.</span>
        </p>
      </div>
      <ol className="project-list">
        {projects.map((project, i) => (
          <li key={project.id}>
            <span className="project-number">0{i + 1}</span>
            <div className="project-info">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </div>
            <span className="project-category">{project.category}</span>
            <span className="project-status">Details coming soon</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

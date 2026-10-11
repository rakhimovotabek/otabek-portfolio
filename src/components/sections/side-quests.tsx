import { Section } from "@/components/ui/section";
import { sideQuests } from "@/data/portfolio";
export function SideQuests() {
  return (
    <Section
      id="side-quests"
      label="03 / OFF THE MAIN PATH"
      className="quests-section"
    >
      <div className="quests-heading">
        <h2 id="side-quests-heading">
          SIDE
          <br />
          <span className="serif-word">QUESTS</span>
          <span className="quests-star" aria-hidden="true">
            ✳
          </span>
        </h2>
        <p>
          The interests that don’t fit
          <br />
          inside a repository.
        </p>
      </div>
      <div className="quest-collage">
        {sideQuests.map((quest, i) => (
          <article key={quest.id} className={`quest quest-${quest.id}`}>
            <span className="eyebrow">
              0{i + 1} / {quest.label}
            </span>
            {quest.id === "problem-solving" && (
              <div className="quest-maze" aria-hidden="true">
                <svg viewBox="0 0 400 230" fill="none">
                  <path
                    d="M10 210V20h170v60H70v80h110v50h200V20H240v120h70V80h-30"
                    stroke="currentColor"
                    strokeWidth="18"
                  />
                  <path
                    d="M10 210h80M380 20v40"
                    stroke="var(--ink)"
                    strokeWidth="4"
                  />
                </svg>
              </div>
            )}
            {quest.id === "debate" && (
              <span className="debate-quote" aria-hidden="true">
                “
              </span>
            )}
            <div className="quest-copy">
              <h3>{quest.title}</h3>
              <p>{quest.description}</p>
            </div>
            {quest.id === "cybersecurity" && (
              <div className="quest-lock" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}

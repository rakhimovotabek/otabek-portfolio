import { TransitionLink as Link } from "@/components/motion/route-transitions";
import {
  works,
  workCategories,
  universeCopy,
  type WorkCategory,
} from "@/data/universe";
import { WorkActions } from "@/components/universe/work-actions";
import { LearningArt, LawArt } from "./artwork";
export function WorkRooms({ selected }: { selected: WorkCategory | "all" }) {
  const entries = works.filter(
    (work) => selected === "all" || work.category === selected,
  );
  const sat = works.find((work) => work.id === "sat-chi")!,
    law = works.find((work) => work.id === "huquq-test")!;
  return (
    <div className="od-work">
      <header className="od-work-cover">
        <div className="od-caption">
          <span>OTABEK RAKHIMOV / SELECTED & COLLECTED</span>
          <span>
            {String(works.length).padStart(2, "0")} VERIFIED PROJECT ENTRIES
          </span>
        </div>
        <h1>
          WORK<span className="od-title-dot">.</span>
        </h1>
        <div className="od-catalog-art" aria-hidden="true">
          <div className="od-catalog-law">
            §<small>HUQUQ TEST</small>
          </div>
          <div className="od-catalog-sat">
            ?<small>SAT’chi</small>
          </div>
          <div className="od-catalog-film">
            <span>↓</span>
            <small>MEDIA / PYTHON</small>
          </div>
        </div>
        <div className="od-work-cover-bottom">
          <p>
            Questions, turned into software.
            <br />
            An exhibition of things I’ve built.
          </p>
          <a href="#sat-room" className="od-underlink">
            Enter the exhibition ↓
          </a>
          <a href="#work-directory" className="od-underlink">
            Browse the index →
          </a>
        </div>
      </header>
      <section
        className="od-exhibit od-sat-room"
        data-od-scene="sat"
        id="sat-room"
        aria-labelledby="sat-title"
      >
        <div className="od-exhibit-stage">
          <div className="od-caption">
            <span>EDUCATION / A LEARNING PLATFORM</span>
            <span>EXHIBIT 01</span>
          </div>
          <div className="od-exhibit-copy">
            <h2 id="sat-title">
              SAT’chi<span>.</span>
            </h2>
            <p>{sat.description}</p>
            <Link className="od-solid-link" href={`/work/${sat.slug}`}>
              Open case study →
            </Link>
            <WorkActions work={sat} />
          </div>
          <LearningArt />
          <div className="od-room-foot">
            <span>THE QUESTION IS THE START.</span>
            <span>
              CONCEPT ARTWORK / GENUINE PRODUCT CAPTURES IN CASE STUDY
            </span>
          </div>
        </div>
      </section>
      <section
        className="od-exhibit od-law-room"
        data-od-scene="law"
        aria-labelledby="law-title"
      >
        <div className="od-exhibit-stage">
          <div className="od-caption">
            <span>EXAMINATIONS / AN INDEPENDENT PROJECT</span>
            <span>EXHIBIT 02</span>
          </div>
          <div className="od-exhibit-copy">
            <span className="od-kicker">QUESTIONS. CONSIDERED.</span>
            <h2 id="law-title">
              Huquq
              <br />
              <em>Test.</em>
            </h2>
            <p>{law.description}</p>
            <Link className="od-solid-link" href={`/work/${law.slug}`}>
              Unfold the case study →
            </Link>
            <WorkActions work={law} />
          </div>
          <LawArt />
          <div className="od-room-foot">
            <span>A DIFFERENT KIND OF EXAMINATION.</span>
            <span>CONCEPT FOLIO / NO OFFICIAL AFFILIATION</span>
          </div>
        </div>
      </section>
      <section
        className="od-work-index"
        id="work-directory"
        tabIndex={-1}
        aria-labelledby="work-index-title"
      >
        <header>
          <h2 id="work-index-title">
            The full
            <br />
            <em>working index.</em>
          </h2>
          <p>
            {works.length} projects.
            <br />
            More questions to follow.
          </p>
        </header>
        <nav className="od-filters" aria-label="Work categories">
          <Link
            href="/work#work-directory"
            aria-current={selected === "all" ? "page" : undefined}
          >
            All work
          </Link>
          {workCategories.map((category) => (
            <Link
              key={category.id}
              href={`/work?category=${category.id}#work-directory`}
              aria-current={selected === category.id ? "page" : undefined}
            >
              {category.title}
            </Link>
          ))}
        </nav>
        {entries.length ? (
          <div className="od-directory">
            {entries.map((work, i) => (
              <article key={work.id} data-work-id={work.id}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h3>
                  <Link href={`/work/${work.slug}`}>
                    {work.title}
                    <span aria-hidden="true">→</span>
                  </Link>
                </h3>
                <span className="od-directory-discipline">
                  {work.discipline}
                </span>
                <details>
                  <summary>
                    Project notes <span aria-hidden="true">+</span>
                  </summary>
                  <div>
                    <p>{work.description}</p>
                    <p>Status: {work.status ?? "Not yet documented"}</p>
                    <WorkActions work={work} />
                  </div>
                </details>
              </article>
            ))}
          </div>
        ) : (
          <div className="od-empty">
            <h3>
              {
                workCategories.find((category) => category.id === selected)
                  ?.title
              }
            </h3>
            <p>{universeCopy.work.empty}</p>
            <p>
              {
                workCategories.find((category) => category.id === selected)
                  ?.note
              }
            </p>
          </div>
        )}
      </section>
      <section className="od-collaboration" id="work-collaboration">
        <span className="od-kicker">STILL A WORK IN PROGRESS.</span>
        <h2>
          Leave your
          <br />
          <em>fingerprints.</em>
        </h2>
        <p>If you’d like to help shape something here, there’s a way in.</p>
        <WorkActions work={sat} />
      </section>
    </div>
  );
}

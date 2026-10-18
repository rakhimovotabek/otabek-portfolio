import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { site } from "@/data/site";
import { profile } from "@/data/portfolio";
import { latelyItems, works } from "@/data/universe";
import { PortalArt, LearningArt } from "./artwork";
export function ThresholdHome() {
  const featured = works.find((work) => work.id === "sat-chi")!;
  const lately = latelyItems.filter((item) => item.visible);
  return (
    <div className="od-home">
      <section
        className="od-home-sequence"
        data-od-scene="home"
        aria-label={`The other side of ${site.brand}`}
      >
        <div className="od-scene-sticky">
          <div className="od-threshold" data-home-threshold>
            <div className="od-caption">
              <span>
                {profile.name} / {profile.role}
              </span>
              <span>A PERSONAL WORLD, IN PROGRESS</span>
            </div>
            <h1 className="od-home-title">
              <span>THE OTHER</span>
              <span>SIDE OF</span>
              <span className="od-brand-line">
                {site.brand}
                <span>.</span>
              </span>
            </h1>
            <PortalArt />
            <p className="od-side-note">
              SOFTWARE.
              <br />
              THOUGHT.
              <br />
              THINGS IN
              <br />
              BETWEEN.
              <span>
                Based in
                <br />
                {profile.country}.
              </span>
            </p>
            <div className="od-threshold-bottom">
              <p>
                I’m Otabek. I build software, work through questions, and leave
                room for curiosity.
              </p>
              <Link className="od-underlink" href="/work">
                Enter the work <span aria-hidden="true">→</span>
              </Link>
              <a className="od-scroll-cue" href="#personal-index">
                SKIP TO THE INDEX ↓
              </a>
            </div>
          </div>
          <section
            className="od-home-selected"
            data-home-next
            id="home-selected"
            aria-labelledby="home-selected-title"
          >
            <div className="od-caption">
              <span>THROUGH THE APERTURE</span>
              <span>SELECTED SOFTWARE / EDUCATION</span>
            </div>
            <div className="od-home-selected-copy">
              <p className="od-kicker">A QUESTION BECOMES A PROJECT.</p>
              <h2 id="home-selected-title">
                Learning,
                <br />
                <em>by making.</em>
              </h2>
              <p>{featured.description}</p>
              <Link className="od-solid-link" href={`/work/${featured.slug}`}>
                Explore {featured.title} <span aria-hidden="true">→</span>
              </Link>
              <Link className="od-underlink" href="/work">
                All {works.length} projects →
              </Link>
            </div>
            <LearningArt />
            <div className="od-room-foot">
              <span>{featured.title} / A LEARNING PLATFORM</span>
              <span>CONCEPT ARTWORK — PRODUCT CAPTURES IN CASE STUDY</span>
            </div>
          </section>
        </div>
      </section>
      <section
        id="personal-index"
        className="od-personal-index"
        aria-labelledby="personal-index-title"
      >
        <div className="od-index-intro">
          <span className="od-kicker">THERE’S MORE IN HERE.</span>
          <h2 id="personal-index-title">
            A few different
            <br />
            <em>ways in.</em>
          </h2>
          <p>Software is one part of the story.</p>
          <Link href="/about" className="od-underlink">
            Meet the person →
          </Link>
        </div>
        <div className="od-index-objects">
          <Link href="/work" className="od-index-dossier">
            <span>SELECTED & COLLECTED</span>
            <b>WORK</b>
            <small>{works.length} software projects →</small>
          </Link>
          <Link href="/journal" className="od-index-note">
            <span>THE BOOK OF SMALL THINGS</span>
            <b>
              In the
              <br />
              <em>margins.</em>
            </b>
            <small>Open the journal →</small>
          </Link>
          <Link href="/gallery" className="od-index-print">
            <span>THE PRINT ROOM</span>
            <div aria-hidden="true" className="od-mini-aperture" />
            <small>Studies & space for photographs →</small>
          </Link>
        </div>
      </section>
      <aside className="od-lately">
        <span className="od-kicker">NOW / LATELY</span>
        {lately.length ? (
          lately.map((item) => (
            <div key={item.id}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              {item.href && <Link href={item.href}>Read more →</Link>}
            </div>
          ))
        ) : (
          <p>
            A space for what’s happening between projects.
            <br />
            <span>
              Personal updates will appear when there’s something to share.
            </span>
          </p>
        )}
      </aside>
    </div>
  );
}

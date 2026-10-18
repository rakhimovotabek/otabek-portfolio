import { profile, achievements } from "@/data/portfolio";
import { presence } from "@/data/archive";
import {
  publishedJournal,
  publicIdentities,
  universeCopy,
  aboutDetails,
} from "@/data/universe";
import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { Comments } from "@/components/community/comments";
import { OpenMessage } from "@/components/contact/open-message";
export function PresenceRoom() {
  return (
    <div className="od-about">
      <header className="od-presence-cover">
        <div className="od-caption">
          <span>THE PERSON BEHIND THE PROJECTS</span>
          <span>
            {profile.country} / {profile.role}
          </span>
        </div>
        <h1>
          OTABEK
          <br />
          <span>RAKHIMOV.</span>
        </h1>
        <div className="od-portrait-reservation">
          <span>THIS SPACE BELONGS TO A REAL PERSON.</span>
          <p>
            A portrait,
            <br />
            <em>in time.</em>
          </p>
          <small>
            Awaiting Otabek’s own photograph.
            <br />
            No substitute likeness.
          </small>
        </div>
        <div className="od-presence-bottom">
          <p>{profile.introduction}</p>
          <a href="#about-story" className="od-underlink">
            A little more about me ↓
          </a>
        </div>
      </header>
      <section
        className="od-biography"
        id="about-story"
        aria-labelledby="biography-title"
      >
        <span className="od-kicker">BEYOND THE SCREEN</span>
        <div>
          <h2 id="biography-title">
            Learning by making.
            <br />
            <em>And paying attention.</em>
          </h2>
          {profile.biography.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
      <section className="od-milestones" aria-labelledby="milestone-title">
        <header>
          <span className="od-kicker">A TRAJECTORY OF CURIOSITY</span>
          <h2 id="milestone-title">
            A few things
            <br />
            <em>along the way.</em>
          </h2>
          <p>
            Verified milestones.
            <br />
            Dates remain unpublished.
          </p>
        </header>
        <div className="od-milestone-list">
          <svg
            viewBox="0 0 80 1000"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path
              data-od-trace
              pathLength="1"
              d="M20 0V120Q20 160 48 160T48 240Q20 240 20 280V480Q20 520 48 520T48 600Q20 600 20 640V1000"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <ol>
            {achievements.map((item) => (
              <li key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="od-attention">
        <h2>
          What holds
          <br />
          <em>my attention.</em>
        </h2>
        <div>
          <p>{profile.interests.join(" / ")}</p>
          <p>{presence.note}</p>
          <details>
            <summary>
              A few factual details <span aria-hidden="true">+</span>
            </summary>
            {aboutDetails.skills.map((skill) => (
              <p key={skill.title}>
                <strong>{skill.title}</strong> — {skill.detail}
              </p>
            ))}
            <p>
              Student. School and education details have not been published.
            </p>
          </details>
          <Link className="od-underlink" href="/journal">
            Leave room for a thought →
          </Link>
        </div>
      </section>
    </div>
  );
}
export function JournalRoom() {
  const entries = publishedJournal();
  return (
    <div className="od-journal">
      <header className="od-journal-cover">
        <div className="od-caption">
          <span>THE BOOK OF SMALL THINGS</span>
          <span>NOTES / POEMS / EXPERIENCES</span>
        </div>
        <h1>
          In the
          <br />
          <em>margins.</em>
        </h1>
        <p>{universeCopy.journal.description}</p>
        <span className="od-journal-margin" aria-hidden="true">
          A PAGE LEFT OPEN
        </span>
      </header>
      {entries.length ? (
        <div className="od-journal-entries">
          {entries.map((entry) => (
            <article key={entry.slug}>
              <span>
                {entry.category}
                {entry.date && (
                  <>
                    {" "}
                    / <time dateTime={entry.date}>{entry.date}</time>
                  </>
                )}
              </span>
              <h2>
                <Link href={`/journal/${entry.slug}`}>{entry.title} →</Link>
              </h2>
              <p>{entry.excerpt}</p>
            </article>
          ))}
        </div>
      ) : (
        <details className="od-journal-leaf" open>
          <summary>
            <span>The first page.</span>
            <span className="od-fold-toggle">
              Open / fold <i aria-hidden="true">+</i>
            </span>
          </summary>
          <div>
            <p>{universeCopy.journal.empty}</p>
            <div className="od-unwritten-lines" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <small>UNTIL THERE ARE WORDS WORTH KEEPING.</small>
          </div>
        </details>
      )}
      <div className="od-journal-after">
        <span>Some stories will arrive as images.</span>
        <Link className="od-underlink" href="/gallery">
          Visit the print room →
        </Link>
      </div>
    </div>
  );
}
export function AddressRoom() {
  const entries = publicIdentities
    .filter((item) => item.visible && item.verified)
    .sort((a, b) => a.order - b.order);
  return (
    <div className="od-links">
      <header className="od-address-cover">
        <div className="od-caption">
          <span>AN ADDRESS BOOK TO ELSEWHERE</span>
          <span>
            {entries.length} CONFIRMED PUBLIC{" "}
            {entries.length === 1 ? "IDENTITY" : "IDENTITIES"}
          </span>
        </div>
        <h1>
          FIND ME
          <br />
          <em>elsewhere.</em>
        </h1>
        <p>A few public identities, collected in one place.</p>
        <div className="od-address-tabs" aria-hidden="true">
          <span>A—G</span>
          <span>H—N</span>
          <span>O—Z</span>
        </div>
      </header>
      <section className="od-addresses" aria-label="Verified public profiles">
        {entries.map((item) => (
          <a
            href={item.url}
            key={item.id}
            target="_blank"
            rel="noopener noreferrer"
            className="od-address"
          >
            <span>
              {item.category === "code" ? "Development" : item.category}
            </span>
            <div>
              <h2>
                {item.platform}
                <span aria-hidden="true">↗</span>
              </h2>
              <p>{item.profileName}</p>
            </div>
            <span>{item.description}</span>
          </a>
        ))}
      </section>
      <div className="od-address-after">
        <p>
          Social, creative, gaming and other addresses can join this book once
          their public links are confirmed.
        </p>
        <OpenMessage label="A private note works, too" />
      </div>
    </div>
  );
}
export function VisitorRoom() {
  return (
    <div className="od-guestbook">
      <header className="od-visitor-cover">
        <div className="od-caption">
          <span>LETTERS FROM VISITORS</span>
          <span>A PUBLIC, MODERATED GUESTBOOK</span>
        </div>
        <div className="od-envelope-corner" aria-hidden="true">
          A NOTE
          <br />
          FROM YOU
        </div>
        <h1>
          Dear
          <br />
          <em>visitor,</em>
        </h1>
        <p>
          Leave a thought about this little corner of the internet.
          <br />A few words leave a trace.
        </p>
        <a className="od-underlink" href="#visitor-notes">
          Write in the guestbook ↓
        </a>
      </header>
      <section
        className="od-correspondence"
        id="visitor-notes"
        aria-labelledby="visitor-notes-title"
      >
        <div>
          <span className="od-kicker">YOU WERE HERE.</span>
          <h2 id="visitor-notes-title">
            A little
            <br />
            <em>impression.</em>
          </h2>
          <p>
            No account needed. Entries are reviewed before appearing. Private
            correspondence belongs in a private note.
          </p>
          <OpenMessage />
        </div>
        <div className="od-visitor-sheet">
          <Comments id="guestbook-comment" target={{ kind: "guestbook" }} />
        </div>
      </section>
    </div>
  );
}

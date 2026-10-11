import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { MediaFrame } from "@/components/archive/media-frame";
import { latelyItems, universeCopy } from "@/data/universe";
export function Lately() {
  const entries = latelyItems
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
  return (
    <section
      className="lately-scene"
      id="lately"
      aria-labelledby="lately-heading"
    >
      <div className="lately-title">
        <span className="eyebrow">BETWEEN THE PAGES</span>
        <h2 id="lately-heading">{universeCopy.lately.title}</h2>
      </div>
      {entries.length ? (
        <div className="lately-items">
          {entries.map((item) => (
            <article key={item.id}>
              {item.image && <MediaFrame media={item.image} />}
              {item.date && <time dateTime={item.date}>{item.date}</time>}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.href && (
                <Link href={item.href} className="text-link">
                  Open the page ↗
                </Link>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="lately-empty">{universeCopy.lately.empty}</p>
      )}
      <nav className="universe-paths" aria-label="Explore the personal archive">
        <Link href="/journal">
          <span>01 / WORDS</span>Journal <i>↗</i>
        </Link>
        <Link href="/gallery">
          <span>02 / IMAGES</span>Gallery <i>↗</i>
        </Link>
        <Link href="/links">
          <span>03 / ELSEWHERE</span>Links <i>↗</i>
        </Link>
        <Link href="/guestbook">
          <span>04 / YOUR TRACE</span>Guestbook <i>↗</i>
        </Link>
      </nav>
    </section>
  );
}

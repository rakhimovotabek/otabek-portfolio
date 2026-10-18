import { TransitionLink as Link } from "@/components/motion/route-transitions";
import type { WorkEntry } from "@/data/universe";
import { ScrollScene } from "./scroll-scene";
import { ProductExhibit } from "./product-exhibit";
import styles from "./signature.module.css";
import art from "./work-exhibition.module.css";

export function WorkExhibition({ works }: { works: readonly WorkEntry[] }) {
  const featured = works.filter(w => w.id === "sat-chi" || w.id === "huquq-test");
  if (featured.length < 2) return null;
  return <ScrollScene kind="work" className={art.exhibition}>
    <div className={styles.stage} data-stage>
      {featured.map((work, i) => <article key={work.id} className={art.room} data-exhibit>
        <div className={art.roomHeader}><span>Selected work / {String(i + 1).padStart(2, "0")}</span><a href="#work-directory">The archive ↗</a></div>
        <h2 className={art.title} data-exhibit-title>{i ? <>Huquq<span>Test.</span></> : <>SAT<span>’chi</span></>}</h2>
        <Link href={`/work/${work.slug}`} className={art.artwork} data-exhibit-art aria-label={`Explore ${work.title}`}><ProductExhibit id={i ? "huquq-test" : "sat-chi"} /></Link>
        <div className={art.copy} data-exhibit-copy><p>{work.description.split(/(?<=\.)\s/)[0]}</p><Link href={`/work/${work.slug}`}>Explore project <span aria-hidden>↗</span></Link></div>
        <span className={art.provenance} data-exhibit-caption>Art-directed portfolio study / {i ? "Examination folio" : "Learning system"}</span>
      </article>)}
      <div className={art.controls}><div role="group" aria-label="Choose an exhibit">{featured.map((work, i) => <button key={work.id} type="button" data-jump aria-pressed={i === 0}>{String(i + 1).padStart(2, "0")} / {work.title}</button>)}</div><span className={art.scrollNote}>Scroll to turn the room ↓</span><i data-stage-rule /></div>
    </div>
  </ScrollScene>;
}

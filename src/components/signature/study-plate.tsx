import type { GalleryAlbum } from "@/data/universe";
import { MediaFrame } from "@/components/archive/media-frame";
import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { galleryMedia } from "./gallery-media";
import art from "./gallery-art.module.css";
import styles from "./study-plate.module.css";

/** Site studies get a still editorial plate. Photography keeps its own scene. */
export function StudyPlate({ albums }: { albums: readonly GalleryAlbum[] }) {
  const images = albums.flatMap(album => album.images.map(media => ({
    media, href: `/gallery/${album.slug}`,
  }))).slice(0, 3);
  if (!images.length) return null;

  return (
    <section className={`${styles.plate} ${art.art}`} data-study-plate aria-labelledby="gallery-title">
      <div className={styles.meta}>
        <span>Gallery / Original site studies</span>
        <a href="#gallery-collections">Collections ↓</a>
      </div>
      <div className={styles.composition}>
        <h1 id="gallery-title" data-page-title>Ways<br /><em>of seeing.</em></h1>
        <p className={styles.note}>Three geometric studies.<br />Personal photographs to come.</p>
        {images.map(({ media, href }, i) => (
          <Link className={`${styles.study} ${styles[`study${i}`]}`} href={href} key={media.id}
            aria-label={`View collection: ${media.caption}`}>
            <MediaFrame media={galleryMedia(media)} sizes={i === 0 ? "(max-width: 799px) 85vw, 32vw" : "(max-width: 799px) 42vw, 16vw"} />
            <span className={styles.caption}>{media.caption.replace(/^Study /, "")}</span>
          </Link>
        ))}
      </div>
      <div className={styles.footer}>
        <span>Studies for an open archive</span>
        <Link href={images[0].href}>View the studies <span aria-hidden>→</span></Link>
      </div>
    </section>
  );
}

import type { GalleryAlbum } from "@/data/universe";
import { MediaFrame } from "@/components/archive/media-frame";
import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { ScrollScene } from "./scroll-scene";
import shell from "./signature.module.css";
import styles from "./gallery-exhibition.module.css";
import art from "./gallery-art.module.css";
import { galleryMedia } from "./gallery-media";

/** A composed triptych of real published media, without invented photographs. */
export function GalleryCollage({ albums }: { albums: readonly GalleryAlbum[] }) {
  const images = albums.flatMap(album => album.images.map(media => ({
    media, href: `/gallery/${album.slug}#${media.id}`, siteArtwork: album.siteArtwork,
  }))).slice(0, 3);
  if (!images.length) return null;
  const Heading = images.every(image => image.siteArtwork) ? "h1" : "h2";
  return (
    <ScrollScene kind="gallery" className={`${styles.exhibition} ${art.art}`}>
      <div className={`${shell.stage} ${styles.stage}`} data-stage>
        <div className={styles.surface} data-gallery-surface aria-hidden />
        <div className={styles.meta}>
          <span>{images.every(image => image.siteArtwork) ? "Gallery / Original site artwork" : "Gallery / From the collection"}</span>
          <div className={styles.metaActions}>
            <a href="#gallery-collections">Collections ↓</a>
            <Link href={images[0].href.split("#")[0]} data-gallery-enter aria-label="Enter the collection">Enter ↗</Link>
          </div>
        </div>
        <Heading className={styles.title} data-gallery-title>
          Look<br /><em>again.</em>
        </Heading>
        <div className={styles.frames}>
          {images.map(({ media, href }, i) => (
            <div key={media.id} className={styles.frame} data-gallery-frame data-frame={i}>
              <div className={styles.aperture} data-gallery-aperture>
                <Link href={href} aria-label={`Open collection containing ${media.caption}`}>
                  <MediaFrame media={galleryMedia(media)} sizes="90vw" />
                </Link>
              </div>
              <span className={styles.caption} data-gallery-caption>{media.caption}</span>
            </div>
          ))}
        </div>
        <span className={styles.focusCaption} data-gallery-focus>{images[0].media.caption}</span>
        <h3 className={styles.indexTitle} data-gallery-index-title>A closer <em>look.</em></h3>
        <div className={styles.footer}>
          <span>{String(images.length).padStart(2, "0")} studies / scroll to explore</span>
          <Link href={images[0].href.split("#")[0]}>Enter the collection <span aria-hidden>→</span></Link>
          <i data-gallery-rule aria-hidden />
        </div>
      </div>
    </ScrollScene>
  );
}

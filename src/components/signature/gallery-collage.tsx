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
    media, href: `/gallery/${album.slug}`, siteArtwork: album.siteArtwork,
  }))).slice(0, 3);
  if (!images.length) return null;
  return (
    <ScrollScene kind="gallery" className={`${styles.exhibition} ${art.art}`}>
      <div className={`${shell.stage} ${styles.stage}`} data-stage>
        <div className={styles.surface} data-gallery-surface aria-hidden />
        <div className={styles.meta}>
          <span>{images.every(image => image.siteArtwork) ? "Original site studies" : "From the collection"}</span>
          <a href="#gallery-collections">Collections ↓</a>
        </div>
        <h2 className={styles.title} data-gallery-title>
          Ways<br /><em>of seeing.</em>
        </h2>
        <div className={styles.frames}>
          {images.map(({ media, href }, i) => (
            <div key={media.id} className={styles.frame} data-gallery-frame data-frame={i}>
              <div className={styles.aperture} data-gallery-aperture>
                {i === 0 ? (
                  <Link href={href} aria-label={`Open collection containing ${media.caption}`}>
                    <MediaFrame media={galleryMedia(media)} sizes="(max-width: 799px) 90vw, 90vw" />
                  </Link>
                ) : <MediaFrame media={galleryMedia(media)} sizes="(max-width: 799px) 90vw, 35vw" />}
              </div>
              <span className={styles.caption} data-gallery-caption>{media.caption}</span>
            </div>
          ))}
        </div>
        <span className={styles.focusCaption} data-gallery-focus>{images[0].media.caption}</span>
        <h3 className={styles.indexTitle} data-gallery-index-title>In <em>view.</em></h3>
        <div className={styles.footer}>
          <span>{String(images.length).padStart(2, "0")} frames / scroll to unfold</span>
          <Link href={images[0].href}>Open collection <span aria-hidden>→</span></Link>
          <i data-gallery-rule aria-hidden />
        </div>
      </div>
    </ScrollScene>
  );
}

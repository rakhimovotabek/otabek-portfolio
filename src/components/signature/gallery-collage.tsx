import { galleryReservations } from "@/data/archive";
import type { GalleryAlbum } from "@/data/universe";
import { MediaFrame } from "@/components/archive/media-frame";
import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { ScrollScene } from "./scroll-scene";
import styles from "./signature.module.css";

/** Future published album media replaces reservations without changing the motion.
 * No private photos, stock portraits or pretend owner photographs. */
export function GalleryCollage({
  albums,
}: {
  albums: readonly GalleryAlbum[];
}) {
  const images = albums.flatMap((album) =>
    album.images.map((media) => ({
      media,
      href: `/gallery/${album.slug}`,
      siteArtwork: album.siteArtwork,
    })),
  );
  const frames = [
    ...images.slice(0, 5),
    ...galleryReservations.map((media) => ({
      media,
      href: "#gallery-collections",
      siteArtwork: false,
    })),
  ].slice(0, 5);
  if (!images.length) return null;
  return (
    <>
      <div className={styles.sceneIntro}>
        <span>
          {images.some((image) => !image.siteArtwork)
            ? "Images from the collection"
            : "Site studies & reserved photographic frames"}
        </span>
        <a href="#gallery-collections">Browse collections ↓</a>
      </div>
      <ScrollScene kind="gallery">
        <div className={`${styles.stage} ${styles.galleryStage}`} data-stage>
          <h2 className={styles.collageTitle} data-collage-title>
            Look
            <br />
            <em>closer.</em>
          </h2>
          <div className={styles.collage}>
            {frames.map(({ media, href }, i) => (
              <Link
                key={media.id}
                href={href}
                className={`${styles.collageFrame} ${styles[`frame${i}`]}`}
                data-collage-frame
                aria-label={
                  media.src || media.study
                    ? `View ${media.caption}`
                    : "Browse future photographic collections"
                }
              >
                <MediaFrame
                  media={media}
                  sizes="(max-width: 799px) 60vw, 90vw"
                />
                <span className={styles.frameLabel}>{media.caption}</span>
              </Link>
            ))}
          </div>
          <div className={styles.featureCaption} data-feature-caption>
            <span>
              {images[0].siteArtwork
                ? "Original site artwork"
                : "From the photographic collection"}
            </span>
            <h3>{images[0].media.caption}</h3>
          </div>
          <div className={styles.contactTitle} data-contact-title>
            <h3>
              A collection,
              <br />
              <em>in view.</em>
            </h3>
            <p>
              {images.some((image) => !image.siteArtwork)
                ? "Open a frame to see the collection."
                : "Original site studies. Empty frames await real photographs."}
            </p>
          </div>
          <div className={styles.galleryFooter}>
            <span>From a single frame to the whole collection</span>
            <a href="#gallery-collections">Enter the collections ↓</a>
          </div>
        </div>
      </ScrollScene>
    </>
  );
}

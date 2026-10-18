import type { GalleryAlbum } from "@/data/universe";
import { MediaFrame } from "@/components/archive/media-frame";
import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { AlbumViewer } from "@/components/universe/album-viewer";
import { OpenGalleryPrint } from "./open-gallery-print";
import { ScrollScene } from "./scroll-scene";
import shell from "./signature.module.css";
import styles from "./gallery-exhibition.module.css";

export function GalleryCollage({ albums }: { albums: readonly GalleryAlbum[] }) {
  const album = albums[0];
  if (!album?.images.length) return null;
  const images = album.images.slice(0, 3);
  const Heading = albums.every(a => a.siteArtwork) ? "h1" : "h2";
  return <>
    <ScrollScene kind="gallery" className={styles.exhibition}>
      <div className={`${shell.stage} ${styles.stage}`} data-stage>
        <div className={styles.surface} data-gallery-surface aria-hidden />
        <div className={styles.meta}><span>Gallery / {album.siteArtwork ? "Original site studies" : album.category}</span><a href="#gallery-collections">Collection index ↗</a></div>
        <Heading className={styles.title} data-gallery-title>Un<em>framed.</em></Heading>
        <div className={styles.frames}>{images.map((media, i) => <div key={media.id} className={styles.frame} data-gallery-frame data-frame={i}>
          <div className={styles.aperture} data-gallery-aperture><OpenGalleryPrint index={i} label={media.caption}><MediaFrame media={media} eager sizes="(max-width: 799px) 95vw, 90vw" /></OpenGalleryPrint></div>
          <span className={styles.caption} data-gallery-caption>{media.caption}<span aria-hidden>↗</span></span>
        </div>)}</div>
        <span className={styles.notice}>An exhibition of form.<br />{album.siteArtwork ? "Site artwork. Personal photographs to come." : album.description}</span>
        <span className={styles.focusCaption} data-gallery-focus>01 / Enter the interval.</span>
        <h2 className={styles.indexTitle} data-gallery-index-title>All in<br /><em>the frame.</em></h2>
        <div className={styles.footer}><span>Click a print to open it ↗</span><Link href={`/gallery/${album.slug}`} data-gallery-enter>Explore the album <span aria-hidden>↗</span></Link><i data-gallery-rule aria-hidden /></div>
      </div>
    </ScrollScene>
    <AlbumViewer images={album.images} title={album.title} externalTriggers />
  </>;
}

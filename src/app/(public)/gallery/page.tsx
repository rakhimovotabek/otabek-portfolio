import type { Metadata } from "next";
import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { publishedGallery, universeCopy } from "@/data/universe";
import { site } from "@/data/site";
import { GalleryCollage } from "@/components/signature/gallery-collage";
import styles from "./gallery.module.css";
export const metadata: Metadata = { title: `Gallery — ${site.brand}` };
export default function GalleryPage() {
  const albums = publishedGallery();
  return (
    <div className={`inner-page gallery-page ${styles.page}`}>
      <header className={styles.opening}>
        <h1 data-page-title><span>Gallery<em>.</em></span></h1>
        <span>{albums.every(album => album.siteArtwork) ? "Original site artwork" : "Images & collections"}</span>
      </header>
      <GalleryCollage albums={albums} />
      <section className={styles.collections} id="gallery-collections" tabIndex={-1} aria-labelledby="collections-title">
        <header className={styles.collectionHeading}>
          <h2 id="collections-title">Collections.</h2>
          <span>{String(albums.length).padStart(2, "0")} published</span>
        </header>
        {albums.map((album, i) => (
          <article key={album.slug} className={styles.collectionEntry}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <h3><Link href={`/gallery/${album.slug}`}>{album.title}<span aria-hidden>→</span></Link></h3>
            <span>{album.images.length} images<br />{album.siteArtwork ? "Site studies" : album.category}</span>
          </article>
        ))}
        {!albums.length && <p>No collections published yet.</p>}
        <div className={styles.afterword}>
          {!albums.some(album => !album.siteArtwork) && (
            <details><summary>About these images <span aria-hidden>+</span></summary><p>{universeCopy.gallery.empty}</p></details>
          )}
          <Link href="/journal">The journal →</Link>
        </div>
      </section>
    </div>
  );
}

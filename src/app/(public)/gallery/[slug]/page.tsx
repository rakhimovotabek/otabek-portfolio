import { notFound } from "next/navigation";
import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { publishedGallery, publishedJournal } from "@/data/universe";
import { site } from "@/data/site";
import { AlbumViewer } from "@/components/universe/album-viewer";
import styles from "../gallery.module.css";
import art from "@/components/signature/gallery-art.module.css";
export function generateStaticParams() {
  return publishedGallery().map((album) => ({ slug: album.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: `${publishedGallery().find((album) => album.slug === slug)?.title ?? "Collection not found"} — ${site.brand}`,
  };
}
export default async function GalleryDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = publishedGallery().find((item) => item.slug === slug);
  if (!album) notFound();
  const entries = publishedJournal().filter(
    (entry) =>
      album.journalSlugs.includes(entry.slug) ||
      entry.gallerySlugs.includes(album.slug),
  );
  return (
    <div className={`inner-page gallery-page gallery-detail ${styles.detail} ${art.art}`}>
      <header className={styles.albumHeading}>
        <Link href="/gallery" className={styles.back}>← Gallery</Link>
        <span className={styles.albumKind}>{album.siteArtwork ? "Original site artwork" : album.category}</span>
        <h1 data-page-title><span>{album.title}</span></h1>
        <details className={styles.albumNotes}>
          <summary>About the collection <span aria-hidden>+</span></summary>
          <p>{album.description}</p>
        </details>
      </header>
      {album.date && (
        <time className="entry-date" dateTime={album.date}>
          {album.date}
        </time>
      )}
      <AlbumViewer images={album.images} title={album.title} />
      {entries.length > 0 && (
        <nav className="related-pages" aria-label="Associated journal entries">
          <span className="eyebrow">THE WORDS BEHIND THE IMAGES</span>
          {entries.map((entry) => (
            <Link key={entry.slug} href={`/journal/${entry.slug}`}>
              {entry.title} ↗
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

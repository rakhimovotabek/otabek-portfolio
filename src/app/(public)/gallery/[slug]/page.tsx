import { notFound } from "next/navigation";
import Link from "next/link";
import { publishedGallery, publishedJournal } from "@/data/universe";
import { site } from "@/data/site";
import { MediaFrame } from "@/components/archive/media-frame";
import { PageHeading } from "@/components/universe/page-heading";
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
    <div className="inner-page gallery-page gallery-detail">
      <PageHeading
        label={
          album.siteArtwork
            ? "ORIGINAL SITE ARTWORK / NOT PERSONAL DRAWINGS"
            : album.category.toUpperCase()
        }
        title={album.title}
        description={album.description}
        back={{ href: "/gallery", label: "Gallery" }}
      />
      {album.date && (
        <time className="entry-date" dateTime={album.date}>
          {album.date}
        </time>
      )}
      <div className="album-images">
        {album.images.map((image, i) => (
          <MediaFrame
            key={image.id}
            media={image}
            className={`album-mount mount-${i % 3}`}
            sizes="(max-width: 700px) 90vw, 70vw"
          />
        ))}
      </div>
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

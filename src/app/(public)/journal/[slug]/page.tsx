import { notFound } from "next/navigation";
import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { publishedJournal, publishedGallery } from "@/data/universe";
import { site } from "@/data/site";
import { PageHeading } from "@/components/universe/page-heading";
import { MediaFrame } from "@/components/archive/media-frame";
export function generateStaticParams() {
  return publishedJournal().map((entry) => ({ slug: entry.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  return {
    title: `${publishedJournal().find((item) => item.slug === slug)?.title ?? "Entry not found"} — ${site.brand}`,
  };
}
export default async function JournalDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = publishedJournal().find((item) => item.slug === slug);
  if (!entry) notFound();
  const galleries = publishedGallery().filter(
    (album) =>
      entry.gallerySlugs.includes(album.slug) ||
      album.journalSlugs.includes(entry.slug),
  );
  return (
    <article
      className={`inner-page journal-page journal-detail ${entry.category === "poem" ? "is-poem" : ""}`}
    >
      <div className="reading-progress" aria-hidden="true">
        <span />
      </div>
      <PageHeading
        label={entry.category.toUpperCase()}
        title={entry.title}
        back={{ href: "/journal", label: "Journal" }}
      />
      {entry.date && (
        <time className="entry-date" dateTime={entry.date}>
          {entry.date}
        </time>
      )}
      <div className="reading-column">
        {entry.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="entry-images">
        {entry.images.map((image) => (
          <MediaFrame key={image.id} media={image} />
        ))}
      </div>
      {galleries.length > 0 && (
        <nav className="related-pages" aria-label="Related albums">
          <span className="eyebrow">IMAGES FROM THE STORY</span>
          {galleries.map((album) => (
            <Link key={album.slug} href={`/gallery/${album.slug}`}>
              {album.title} ↗
            </Link>
          ))}
        </nav>
      )}
    </article>
  );
}

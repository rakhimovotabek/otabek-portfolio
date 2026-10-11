import type { Metadata } from "next";
import Link from "next/link";
import { publishedGallery, universeCopy } from "@/data/universe";
import { site } from "@/data/site";
import { MediaFrame } from "@/components/archive/media-frame";
import { PageHeading } from "@/components/universe/page-heading";
export const metadata: Metadata = { title: `Gallery — ${site.brand}` };
export default function GalleryPage() {
  const albums = publishedGallery();
  return (
    <div className="inner-page gallery-page">
      <PageHeading
        label="04 / IMAGES & COLLECTIONS"
        title={universeCopy.gallery.title}
        description={universeCopy.gallery.description}
      />
      {!albums.some((album) => !album.siteArtwork) && (
        <p className="collection-note">{universeCopy.gallery.empty}</p>
      )}
      <div className="gallery-albums">
        {albums.map((album, i) => (
          <article key={album.slug} className="gallery-album-entry">
            <Link
              href={`/gallery/${album.slug}`}
              aria-label={`Open ${album.title}`}
              className="album-preview"
            >
              {album.images[0] && <MediaFrame media={album.images[0]} />}
            </Link>
            <div>
              <span className="eyebrow">
                {String(i + 1).padStart(2, "0")} /{" "}
                {album.siteArtwork ? "ORIGINAL SITE ARTWORK" : album.category}
              </span>
              <h2>
                <Link href={`/gallery/${album.slug}`}>{album.title}</Link>
              </h2>
              <p>{album.description}</p>
              <Link className="text-link" href={`/gallery/${album.slug}`}>
                Enter the collection ↗
              </Link>
            </div>
          </article>
        ))}
      </div>
      {albums.length === 0 && (
        <div className="quiet-empty">
          <p>No collections published yet.</p>
        </div>
      )}
      <nav className="related-pages" aria-label="Connected collection">
        <span className="eyebrow">WORDS & IMAGES, SIDE BY SIDE</span>
        <Link href="/journal">The journal ↗</Link>
      </nav>
    </div>
  );
}

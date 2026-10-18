import { TransitionLink as Link } from "@/components/motion/route-transitions";
import { publishedGallery, type GalleryAlbum } from "@/data/universe";
import { MediaFrame } from "@/components/archive/media-frame";
import { AlbumViewer } from "@/components/universe/album-viewer";
import { OpenGalleryPrint } from "@/components/signature/open-gallery-print";
export function PrintRoom({ category }: { category: string }) {
  const albums = publishedGallery();
  const lead = albums.find((album) => album.images.length > 0);
  const selected = albums.filter(
    (album) =>
      category === "all" ||
      category === "albums" ||
      album.category === category ||
      (category === "drawing" && album.category === "sketch"),
  );
  const filters = [
    ["all", "All"],
    ["photography", "Photography"],
    ["drawing", "Drawings"],
    ["visual-experiment", "Experiments"],
    ["albums", "Albums"],
  ];
  return (
    <div className="od-gallery">
      <section
        className="od-print-scene"
        data-od-scene="gallery"
        aria-labelledby="print-room-title"
      >
        <div className="od-print-stage">
          <div className="od-caption">
            <span>A ROOM FOR IMAGES</span>
            <span>ORIGINAL SITE STUDIES / PERSONAL PHOTOS TO COME</span>
          </div>
          <h1 id="print-room-title" className="od-gallery-type">
            THE
            <br />
            PRINT
            <br />
            <em>ROOM.</em>
          </h1>
          <p className="od-gallery-note">
            A little space
            <br />
            to look closer.
            <span>
              Authored graphic studies.
              <br />
              The personal collection
              <br />
              is still to come.
            </span>
          </p>
          {lead && (
            <>
              <div className="od-print-rail od-rail-top" aria-hidden="true">
                {lead.images.map((image) => (
                  <div key={image.id}>
                    <MediaFrame media={image} sizes="180px" />
                  </div>
                ))}
              </div>
              <div className="od-print-rail od-rail-bottom" aria-hidden="true">
                {[...lead.images].reverse().map((image) => (
                  <div key={image.id}>
                    <MediaFrame media={image} sizes="150px" />
                  </div>
                ))}
              </div>
              <div className="od-gallery-aperture" data-gallery-aperture>
                <OpenGalleryPrint
                  index={0}
                  label={`${lead.title}, first image`}
                >
                  <MediaFrame
                    media={lead.images[0]}
                    sizes="(max-width: 600px) 75vw, 36vw"
                    eager
                  />
                </OpenGalleryPrint>
              </div>
            </>
          )}
          <div className="od-print-bottom">
            <span>CLICK THE PRINT TO OPEN</span>
            <a className="od-underlink" href="#gallery-collections">
              Browse the collection ↓
            </a>
            <span>LOOK AT YOUR OWN PACE.</span>
          </div>
        </div>
      </section>
      {lead && (
        <AlbumViewer images={lead.images} title={lead.title} externalTriggers />
      )}
      <section
        className="od-print-table"
        id="gallery-collections"
        tabIndex={-1}
        aria-labelledby="collections-title"
      >
        <header>
          <span className="od-kicker">ON THE TABLE</span>
          <h2 id="collections-title">
            Collected,
            <br />
            <em>in time.</em>
          </h2>
          <p>
            Design system demonstrated with authored abstract studies.
            <br />
            This gallery awaits personal photographs and drawings.
          </p>
        </header>
        <nav className="od-filters" aria-label="Gallery categories">
          {filters.map(([id, label]) => (
            <Link
              key={id}
              href={`/gallery${id === "all" ? "" : `?category=${id}`}#gallery-collections`}
              aria-current={category === id ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        {selected.length ? (
          selected.map((album) => (
            <PrintCollection key={album.slug} album={album} />
          ))
        ) : (
          <div className="od-empty">
            <h3>A place for the real thing.</h3>
            <p>
              No{" "}
              {category === "photography" ? "personal photographs" : "drawings"}{" "}
              published yet. This part of the collection is waiting for Otabek’s
              own work.
            </p>
          </div>
        )}
        <Link className="od-underlink" href="/journal">
          Some things take the shape of words →
        </Link>
      </section>
    </div>
  );
}
function PrintCollection({ album }: { album: GalleryAlbum }) {
  return (
    <article className="od-print-collection">
      <div className="od-collection-title">
        <h3>
          <Link href={`/gallery/${album.slug}`}>{album.title} →</Link>
        </h3>
        <p>{album.description}</p>
        <span>
          {album.images.length} prints /{" "}
          {album.siteArtwork ? "Site demonstration artwork" : album.category}
        </span>
      </div>
      <div className="od-print-mounts">
        {album.images.map((image, i) => (
          <Link
            key={image.id}
            href={`/gallery/${album.slug}#${image.id}`}
            className={`od-table-print od-table-print-${i}`}
            aria-label={`${image.caption}, open collection`}
          >
            <MediaFrame media={image} sizes="(max-width: 600px) 80vw, 30vw" />
          </Link>
        ))}
      </div>
    </article>
  );
}

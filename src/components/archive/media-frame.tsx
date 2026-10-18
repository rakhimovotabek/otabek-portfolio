import Image from "next/image";
import type { CSSProperties } from "react";
import type { ArchiveMedia } from "@/data/archive";
import { StudyArt } from "@/components/visuals/study-art";

export function MediaFrame({
  media,
  className = "",
  sizes = "(max-width: 700px) 90vw, 45vw",
  eager = false,
}: {
  media: ArchiveMedia;
  className?: string;
  sizes?: string;
  eager?: boolean;
}) {
  return (
    <figure className={`media-frame ${className}`} data-media-id={media.id}>
      <div
        className={`media-window ${media.study ? "is-study" : "is-photo"}`}
        style={
          {
            "--media-ratio": `${media.width} / ${media.height}`,
          } as CSSProperties
        }
      >
        <div className="media-image">
          {media.src ? (
            <Image loading={eager ? "eager" : undefined} src={media.src} alt={media.alt} fill sizes={sizes} />
          ) : media.study ? (
            <div role="img" aria-label={media.alt}>
              <StudyArt kind={media.study} />
            </div>
          ) : (
            <div className="photo-reservation">
              <span className="reservation-corner" aria-hidden="true" />
              <span className="reservation-type">{media.placeholderLabel}</span>
              <span className="reservation-status">IMAGE NOT YET ADDED</span>
            </div>
          )}
        </div>
      </div>
      <figcaption>
        <span>{media.caption}</span>
        {media.credit && <span>{media.credit}</span>}
      </figcaption>
    </figure>
  );
}

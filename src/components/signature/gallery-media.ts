import type { ArchiveMedia } from "@/data/archive";

/** Descriptions of the Gallery's local color treatment; source records stay intact. */
export function galleryMedia(media: ArchiveMedia): ArchiveMedia {
  if (media.id === "study-balance")
    return { ...media, alt: "Original composition of a dark circle and an ultramarine plane" };
  if (media.id === "study-contour")
    return { ...media, alt: "Original geometric line study, with an ultramarine opening across a dark field" };
  return media;
}

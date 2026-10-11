/** Editable personal archive. Samples are never presented as Otabek's work. */
export type ArchiveCategory =
  | "essay"
  | "note"
  | "poem"
  | "drawing"
  | "sketch"
  | "photograph"
  | "visual-experiment"
  | "talk"
  | "other";
export type StudyKind = "volume" | "contour" | "balance";
export interface ArchiveMedia {
  id: string;
  src: string | null; // Place verified assets in public/archive; use /archive/file.webp.
  alt: string;
  caption: string;
  width: number;
  height: number;
  placeholderLabel: string;
  study?: StudyKind;
  credit: string | null;
}
export interface ArchiveEntry {
  id: string;
  title: string;
  category: ArchiveCategory;
  year: number | null;
  description: string;
  preview: ArchiveMedia | null;
  excerpt: string | null;
  link: string | null;
  status: "published" | "draft" | "placeholder" | "site-study";
}
export interface WritingEntry {
  id: string;
  title: string;
  category: "essay" | "note" | "poem";
  year: number | null;
  excerpt: string;
  paragraphs: readonly string[];
  status: "published" | "sample";
}
export const presence = {
  heading: ["A person,", "before a portfolio."],
  short: "Otabek Rakhimov. Student developer. Uzbekistan.",
  storyHeading: ["Learning by making.", "And paying attention."],
  note: "Computer science is one part of the story. Debate, teaching, and the things I’m still learning are here too.",
  portraits: [
    {
      id: "portrait-main",
      src: null,
      alt: "Portrait of Otabek Rakhimov",
      caption: "01 / Otabek Rakhimov — portrait to be added",
      width: 900,
      height: 1200,
      placeholderLabel: "A portrait,\nin time.",
      credit: null,
    },
    {
      id: "portrait-place",
      src: null,
      alt: "A personal photograph selected by Otabek",
      caption: "02 / A place — photograph to be added",
      width: 1200,
      height: 900,
      placeholderLabel: "A place.",
      credit: null,
    },
    {
      id: "portrait-detail",
      src: null,
      alt: "A detail from Otabek’s personal archive",
      caption: "03 / A detail — photograph to be added",
      width: 900,
      height: 1100,
      placeholderLabel: "A detail.",
      credit: null,
    },
  ] satisfies ArchiveMedia[],
};
export const archiveCopy = {
  heading: ["An open", "collection."],
  description:
    "A place for writing, images, experiments, and ideas that take a different shape. The personal collection is still being assembled.",
  sampleNotice:
    "Personal works are not published yet. Reserved entries are placeholders; visual studies are original artwork made for this site.",
  writingHeading: "In the margins.",
  writingDescription:
    "Notes, fragments, poems, and longer thoughts. A quieter room in the archive.",
  sketchbookHeading: ["Ways of", "seeing."],
  sketchbookDescription:
    "A visual notebook for drawings, photographs, and experiments. These first studies belong to the site’s design; personal work will follow.",
};
export const visualStudies: readonly ArchiveMedia[] = [
  {
    id: "study-volume",
    src: null,
    alt: "Original abstract study of an open volume, formed from curved pages",
    caption: "Study 01 / Open volume",
    width: 800,
    height: 1000,
    placeholderLabel: "",
    study: "volume",
    credit: "Original site artwork · SVG",
  },
  {
    id: "study-contour",
    src: null,
    alt: "Original geometric line study, with a curved opening across a blue field",
    caption: "Study 02 / Lines around an absence",
    width: 1200,
    height: 900,
    placeholderLabel: "",
    study: "contour",
    credit: "Original site artwork · SVG",
  },
  {
    id: "study-balance",
    src: null,
    alt: "Original composition of a dark circle and a terracotta plane",
    caption: "Study 03 / A matter of balance",
    width: 900,
    height: 1100,
    placeholderLabel: "",
    study: "balance",
    credit: "Original site artwork · SVG",
  },
];
export const archiveEntries: readonly ArchiveEntry[] = [
  {
    id: "open-volume",
    title: "Open volume",
    category: "visual-experiment",
    year: 2026,
    description:
      "A curved paper form. Original concept artwork for this website, not a photograph or a personal drawing.",
    preview: visualStudies[0],
    excerpt: null,
    link: null,
    status: "site-study",
  },
  {
    id: "first-note",
    title: "A first note",
    category: "note",
    year: null,
    description:
      "Reserved for an original note. No personal writing has been published in this slot yet.",
    preview: null,
    excerpt: null,
    link: null,
    status: "placeholder",
  },
  {
    id: "lines-around-absence",
    title: "Lines around an absence",
    category: "drawing",
    year: 2026,
    description:
      "A geometric SVG composition made for the site's visual notebook. Replace it with a real drawing when ready.",
    preview: visualStudies[1],
    excerpt: null,
    link: null,
    status: "site-study",
  },
  {
    id: "poetry-page",
    title: "An unwritten poem",
    category: "poem",
    year: null,
    description: "A place for a poem, when there is one to share.",
    preview: null,
    excerpt: null,
    link: null,
    status: "placeholder",
  },
  {
    id: "photographic-notes",
    title: "Photographic notes",
    category: "photograph",
    year: null,
    description:
      "A place for photographs selected and captioned by Otabek. The personal collection has not been added yet.",
    preview: presence.portraits[1],
    excerpt: null,
    link: null,
    status: "placeholder",
  },
  {
    id: "longer-thought",
    title: "A longer thought",
    category: "essay",
    year: null,
    description:
      "Reserved for an essay. Longer writing will have a page of its own.",
    preview: null,
    excerpt: null,
    link: null,
    status: "placeholder",
  },
];
export const writingEntries: readonly WritingEntry[] = [
  {
    id: "reading-specimen",
    title: "A page left open",
    category: "note",
    year: null,
    excerpt:
      "A note takes shape.\nA sentence, a crossing-out,\na thought worth returning to.",
    paragraphs: [
      "This is a reading-layout sample, not Otabek’s published writing. Original notes, poems, and essays will appear here.",
    ],
    status: "sample",
  },
];
export const categoryLabels: Record<ArchiveCategory, string> = {
  essay: "Essay",
  note: "Note",
  poem: "Poem",
  drawing: "Drawing",
  sketch: "Sketch",
  photograph: "Photograph",
  "visual-experiment": "Visual study",
  talk: "Talk",
  other: "Other",
};

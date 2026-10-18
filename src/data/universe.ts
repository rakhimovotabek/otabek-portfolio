import { projects, type ProjectId } from "./portfolio";
import { exhibitionStudies, projectCaptures, type ArchiveMedia } from "./archive";

/** Public repository content. Future CMS adapters should return these contracts. */
export type WorkCategory = "digital" | "physical" | "creative";
export interface WorkEntry {
  id: string;
  slug: string;
  title: string;
  category: WorkCategory;
  discipline: string;
  description: string;
  images: readonly ArchiveMedia[];
  technologiesOrMaterials: readonly string[];
  status: string | null;
  externalLinks: readonly { label: string; url: string }[];
  relatedWorkSlugs: readonly string[];
  commentProjectId: ProjectId | null;
  openToCollaboration: boolean;
  showCollaborationButton: boolean;
  collaborationMessage: string | null;
  contributionUrl: string | null;
  contributionVerifiedPublic: boolean;
}
export const works: readonly WorkEntry[] = projects.map((project) => ({
  id: project.id,
  slug: project.id,
  title: project.name,
  category: "digital",
  discipline: project.category,
  description: project.description,
  images: projectCaptures[project.id] ?? (project.image
    ? [
        {
          id: `${project.id}-screenshot`,
          src: project.image,
          alt: `${project.name} application screenshot`,
          caption: "Verified application screenshot",
          width: 1440,
          height: 1000,
          placeholderLabel: "",
          credit: null,
        },
      ]
    : []),
  technologiesOrMaterials: project.technology ? [project.technology] : [],
  status: project.status,
  externalLinks: project.url
    ? [{ label: "Visit project", url: project.url }]
    : [],
  relatedWorkSlugs: project.id === "sat-chi" ? ["huquq-test"] : [],
  commentProjectId: project.id,
  // Editable owner preference; only the featured project is enabled initially.
  openToCollaboration: project.id === "sat-chi",
  showCollaborationButton: project.id === "sat-chi",
  collaborationMessage: null,
  contributionUrl: project.id === "sat-chi" ? "https://github.com/rakhimovotabek/sat-chi" : project.id === "huquq-test" ? "https://github.com/rakhimovotabek/huquqchi" : null,
  contributionVerifiedPublic: ["sat-chi", "huquq-test"].includes(project.id),
}));
export const workCategories = [
  {
    id: "digital",
    title: "Digital",
    note: "Software, applications and tools.",
  },
  {
    id: "physical",
    title: "Physical / tangible",
    note: "Objects, prototypes and work beyond the screen.",
  },
  {
    id: "creative",
    title: "Creative",
    note: "Designs, experiments and other forms of making.",
  },
] as const;
export const featuredWorkIds = [
  "sat-chi",
  "huquq-test",
] as const satisfies readonly ProjectId[];

export interface JournalEntry {
  slug: string;
  title: string;
  category:
    "note" | "poem" | "essay" | "thought" | "experience" | "photo-story";
  date: string | null;
  excerpt: string;
  paragraphs: readonly string[];
  images: readonly ArchiveMedia[];
  gallerySlugs: readonly string[];
  status: "published" | "draft";
}
// No fictional personal entries or the earlier reading specimen are published.
export const journalEntries: readonly JournalEntry[] = [];
export interface GalleryAlbum {
  slug: string;
  title: string;
  category: "photography" | "drawing" | "sketch" | "visual-experiment";
  description: string;
  date: string | null;
  images: readonly ArchiveMedia[];
  journalSlugs: readonly string[];
  status: "published" | "draft";
  siteArtwork: boolean;
}
export const galleryAlbums: readonly GalleryAlbum[] = [
  {
    slug: "site-studies",
    title: "Form studies",
    category: "visual-experiment",
    date: null,
    description:
      "Three original graphic studies created for this gallery. Demonstration artwork, not personal photographs.",
    images: exhibitionStudies,
    journalSlugs: [],
    status: "published",
    siteArtwork: true,
  },
];
export interface LatelyItem {
  id: string;
  title: string;
  date: string | null;
  description: string;
  image: ArchiveMedia | null;
  href: string | null;
  visible: boolean;
  order: number;
}
export const latelyItems: readonly LatelyItem[] = [];
export interface PublicIdentity {
  id: string;
  category: "code" | "social" | "gaming" | "contact" | "other";
  platform: string;
  profileName: string;
  url: string;
  icon?: "github" | "link" | "mail";
  description: string;
  visible: boolean;
  verified: boolean;
  order: number;
}
export const publicIdentities: readonly PublicIdentity[] = [
  {
    id: "github",
    category: "code",
    platform: "GitHub",
    profileName: "rakhimovotabek",
    url: "https://github.com/rakhimovotabek",
    icon: "github",
    description: "My public coding profile.",
    visible: true,
    verified: true,
    order: 1,
  },
];
export const aboutDetails = {
  skills: [
    {
      title: "Python",
      detail: "Used in the Telegram Media Downloader project.",
    },
  ],
  education: [] as readonly {
    title: string;
    detail: string;
    dates: string | null;
  }[],
};
export const universeCopy = {
  lately: {
    title: "Now / Lately",
    empty:
      "A small space for what’s happening between projects. Personal updates will appear here when there’s something to share.",
  },
  journal: {
    title: "In the margins.",
    description:
      "Notes, poems, experiences and thoughts. A quieter part of the archive.",
    empty:
      "No personal entries published yet. This page is left open for the real thing.",
  },
  gallery: {
    title: "Ways of seeing.",
    description:
      "Photographs, drawings, sketches and collections. Images have their own room here.",
    empty:
      "Personal photographs and drawings haven’t been added yet. The site studies below are labeled separately.",
  },
  work: {
    title: "Things I make.",
    description:
      "Digital, tangible and creative work. Different forms, one collection.",
    empty: "No works in this category have been published yet.",
  },
  links: {
    title: "Elsewhere, online.",
    description:
      "A few public identities, collected in one place. Only confirmed links belong here.",
  },
} as const;
export const publishedJournal = () =>
  journalEntries.filter((entry) => entry.status === "published");
export const publishedGallery = () =>
  galleryAlbums.filter((album) => album.status === "published");
export const getWork = (slug: string) =>
  works.find((work) => work.slug === slug);

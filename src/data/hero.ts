import { projects, profile } from "./portfolio";

export interface HeroWorld {
  id: "software" | "writings" | "visual" | "about";
  number: string;
  category: string;
  title: string;
  description: string;
  href: string;
}
export const heroWorlds: readonly HeroWorld[] = [
  {
    id: "software",
    number: "01",
    category: "Software",
    title: projects[0].name,
    description: "Selected technical projects.",
    href: "#work",
  },
  {
    id: "writings",
    number: "02",
    category: "Writings",
    title: "Writings.",
    description: "Poems, essays, notes — space to fill.",
    href: "#writing",
  },
  {
    id: "visual",
    number: "03",
    category: "Visual archive",
    title: "Visual archive.",
    description: "Drawings, photographs, experiments.",
    href: "#sketchbook",
  },
  {
    id: "about",
    number: "04",
    category: "About me",
    title: `${profile.name.split(" ")[0]}.`,
    description: "A person, beyond the projects.",
    href: "#about",
  },
];
export const heroCopy = {
  label: "CREATIVE ARCHIVE / VOL. 01",
  caption: "Four sides. One unfinished story.",
  writing: {
    label: "NOTEBOOK / OPEN PAGE",
    lines: ["A place for", "unfinished", "thoughts."],
    status: "PERSONAL WRITING TO BE ADDED",
  },
  visual: {
    label: "VISUAL STUDY / 003",
    title: "look again.",
    status: "ORIGINAL SITE STUDY / REPLACEABLE",
  },
  focus: {
    label: "01 / FEATURED WORK",
    project: projects[0],
    caption: "CONCEPT PREVIEW — NOT AN APPLICATION SCREENSHOT",
    link: "Explore the project",
  },
  editorial: {
    label: "02 / THE PERSON BEHIND THE ARCHIVE",
    heading: ["More", "than code."],
    description:
      "There’s more than one way to make something. Sometimes it’s code. Sometimes it’s a sentence, a photograph, or an idea that isn’t ready yet.",
    note: "THE COLLECTION IS STILL TAKING SHAPE",
    tiles: [
      {
        color: "yellow",
        label: "01 / THE PERSON",
        title: profile.name.replace(" ", "\n"),
        href: "#personal-story",
        status: "PORTRAIT TO BE ADDED",
      },
      {
        color: "blue",
        label: "02 / WORDS",
        title: "Notes &\nfragments",
        href: "#writing",
        status: "PERSONAL WRITING TO COME",
      },
      {
        color: "green",
        label: "03 / VISUAL",
        title: "Photography\n& sketches",
        href: "#sketchbook",
        status: "PERSONAL WORK TO COME",
      },
    ],
  },
} as const;

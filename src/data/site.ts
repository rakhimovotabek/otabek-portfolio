// Change this one value when the permanent nickname is chosen.
export const site = {
  brand: "default",
  title: "A personal archive",
  navigation: [
    { href: "/about", label: "About" },
    { href: "/work", label: "Work" },
    { href: "/journal", label: "Journal" },
    { href: "/gallery", label: "Gallery" },
    { href: "/links", label: "Links" },
    { href: "/guestbook", label: "Guestbook" },
  ],
  opening: {
    label: "A PERSONAL ARCHIVE",
    lines: ["Work, thought,", "& things in between."],
    note: "Software, studies, and space for the things that don’t belong in a repository.",
    artworkCaption: "Open volume — an original digital study",
  },
  contact: {
    action: "Write a private note",
    heading: "A little correspondence.",
    description:
      "A question, a thought about the work, or simply a hello. Send a private note through the Message me button. No account needed.",
    guestbook: "For a public trace, there’s the guestbook.",
  },
} as const;

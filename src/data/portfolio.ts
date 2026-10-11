export type ProjectId =
  | "sat-chi"
  | "huquq-test"
  | "sme-financial-assistant"
  | "telegram-media-downloader"
  | "ielts-progress-tracker";
export interface Project {
  id: ProjectId;
  name: string;
  category: string;
  description: string;
  technology: string | null;
  url: string | null;
  image: string | null;
}
export interface Achievement {
  id: string;
  title: string;
  detail: string;
}
export const profile = {
  name: "Otabek Rakhimov",
  country: "Uzbekistan",
  role: "Student developer",
  introduction:
    "I’m Otabek, a student developer from Uzbekistan. I explore computer science, build software, and enjoy the challenge of turning a question into something useful.",
  interests: [
    "Computer Science",
    "Cybersecurity",
    "Software Development",
    "Artificial Intelligence",
    "Competitive Programming",
    "Entrepreneurship",
    "Debate and public speaking",
  ],
  socialLinks: [],
} as const;
export const projects: readonly Project[] = [
  {
    id: "sat-chi",
    name: "SAT’chi",
    category: "Education",
    description:
      "A SAT learning platform. Project details and a verified demo will be added here.",
    technology: null,
    url: null,
    image: null,
  },
  {
    id: "huquq-test",
    name: "Huquq Test",
    category: "Examinations",
    description:
      "An online examination platform. A closer look at its design and implementation is coming later.",
    technology: null,
    url: null,
    image: null,
  },
  {
    id: "sme-financial-assistant",
    name: "SME Financial Assistant",
    category: "Hackathon",
    description:
      "A hackathon project focused on financial planning and business support for small and medium-sized enterprises.",
    technology: null,
    url: null,
    image: null,
  },
  {
    id: "telegram-media-downloader",
    name: "Telegram Media Downloader",
    category: "Python · Telegram",
    description:
      "A Python Telegram bot for downloading media. Supported sources and implementation details are awaiting verification.",
    technology: "Python",
    url: null,
    image: null,
  },
  {
    id: "ielts-progress-tracker",
    name: "IELTS Progress Tracker",
    category: "Learning",
    description:
      "A learning progress project centered on IELTS preparation. Features and screenshots will be documented later.",
    technology: null,
    url: null,
    image: null,
  },
];
export const achievements: readonly Achievement[] = [
  {
    id: "regional",
    title: "1st place",
    detail: "Khorezm regional Informatics Olympiad · 7th grade",
  },
  {
    id: "national",
    title: "17th place",
    detail: "National Informatics Olympiad · 7th grade",
  },
  { id: "stem", title: "3rd place", detail: "STEM Olympiad" },
  {
    id: "district",
    title: "Top-three finishes",
    detail: "Multiple district-level Informatics competitions",
  },
  {
    id: "debate",
    title: "Best Debater & Best Speaker nominations",
    detail: "Ibrat Debate",
  },
  {
    id: "judge",
    title: "Debate judging",
    detail: "Experience serving as a debate judge",
  },
  {
    id: "teaching",
    title: "English speaking sessions",
    detail: "Experience teaching speaking sessions",
  },
  { id: "ielts", title: "IELTS Academic · 6.5", detail: "Overall band score" },
];

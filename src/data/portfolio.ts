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
  status: string | null;
}
export interface Achievement {
  id: string;
  title: string;
  detail: string;
  display?: { value: string; label: string };
}
export interface SocialLink {
  label: string;
  url: `https://${string}`;
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
  biography: [
    "I’m Otabek Rakhimov, a student developer from Uzbekistan. Computer science, cybersecurity, and useful software are at the center of my technical interests. I learn through problems and through the projects I build.",
    "Those projects take different forms: SAT preparation, online examinations, a Python Telegram bot, IELTS learning progress, and a financial planning hackathon project. Artificial intelligence and entrepreneurship are other directions I’m interested in exploring.",
    "There is a part of the story away from the screen. I take part in debate and public speaking, have served as a debate judge, and have taught English speaking sessions. Working through a problem and finding a clear way to explain it are both things I care about.",
  ],
  socialLinks: [] as readonly SocialLink[],
} as const;
export const projects: readonly Project[] = [
  {
    id: "sat-chi",
    name: "SAT’chi",
    category: "Education",
    description:
      "A learning platform centered on SAT preparation. An exploration of how software can support studying.",
    technology: null,
    url: null,
    image: null,
    status: null,
  },
  {
    id: "huquq-test",
    name: "Huquq Test",
    category: "Examinations",
    description:
      "An online examination platform. A project at the intersection of education, assessment, and software.",
    technology: null,
    url: null,
    image: null,
    status: null,
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
    status: null,
  },
  {
    id: "telegram-media-downloader",
    name: "Telegram Media Downloader",
    category: "Python · Telegram",
    description:
      "A Python Telegram bot for downloading media. A practical exploration of bots and everyday automation.",
    technology: "Python",
    url: null,
    image: null,
    status: null,
  },
  {
    id: "ielts-progress-tracker",
    name: "IELTS Progress Tracker",
    category: "Learning",
    description:
      "A learning progress project centered on IELTS preparation. Exploring how to make a learning journey easier to follow.",
    technology: null,
    url: null,
    image: null,
    status: null,
  },
];
export const achievements: readonly Achievement[] = [
  {
    id: "regional",
    title: "1st place",
    detail: "Khorezm regional Informatics Olympiad · 7th grade",
    display: { value: "01", label: "INFORMATICS" },
  },
  {
    id: "national",
    title: "17th place",
    detail: "National Informatics Olympiad · 7th grade",
    display: { value: "17", label: "INFORMATICS" },
  },
  {
    id: "stem",
    title: "3rd place",
    detail: "STEM Olympiad",
    display: { value: "03", label: "STEM OLYMPIAD" },
  },
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
  {
    id: "ielts",
    title: "IELTS Academic · 6.5",
    detail: "Overall band score",
    display: { value: "6.5", label: "ACADEMIC / OVERALL BAND" },
  },
];

export interface SideQuest {
  id: string;
  label: string;
  title: string;
  description: string;
}
export const sideQuests: readonly SideQuest[] = [
  {
    id: "problem-solving",
    label: "COMPETITIVE PROGRAMMING",
    title: "The pleasure of a difficult problem.",
    description:
      "Algorithms, logic, and the search for a solution that finally makes sense.",
  },
  {
    id: "debate",
    label: "DEBATE",
    title: "A different kind of argument.",
    description:
      "Ibrat Debate nominations for Best Debater and Best Speaker, plus experience on the judging side.",
  },
  {
    id: "olympiads",
    label: "INFORMATICS OLYMPIADS",
    title: "Thinking under pressure.",
    description:
      "Regional, national, and district competitions have been part of my learning.",
  },
  {
    id: "teaching",
    label: "TEACHING ENGLISH",
    title: "Make room for a voice.",
    description:
      "Experience teaching English speaking sessions — giving ideas a chance to be spoken.",
  },
  {
    id: "cybersecurity",
    label: "CYBERSECURITY",
    title: "Look beneath the surface.",
    description:
      "An interest in how systems work and how they can be made safer.",
  },
  {
    id: "speaking",
    label: "PUBLIC SPEAKING",
    title: "An idea, out loud.",
    description: "Debate and public speaking are interests beyond the screen.",
  },
  {
    id: "hackathons",
    label: "HACKATHONS",
    title: "Build. Learn. Repeat.",
    description:
      "The SME Financial Assistant brought financial planning and business support into a hackathon project.",
  },
];

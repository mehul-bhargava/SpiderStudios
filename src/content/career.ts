// Career milestones (End City). From the resume — dates marked TBD need Mehul's input.

export type Milestone = {
  id: string;
  date: string;
  sortKey: number; // for ordering; TBD items are placed by best guess
  title: string;
  org?: string;
  kind: "work" | "project" | "achievement" | "creator";
  body: string;
  bullets?: string[];
  icon: string; // sprite id
};

export const milestones: Milestone[] = [
  {
    id: "channel",
    date: "TBD",
    sortKey: 1,
    title: "Started the YouTube gaming channel",
    kind: "creator",
    body: "Began creating and editing Valorant gameplay edits and short-form content aimed at audience growth and engagement.",
    bullets: ["Pacing, sound design and trend-driven techniques to optimise Shorts/Reels retention."],
    icon: "controller",
  },
  {
    id: "dance",
    date: "TBD",
    sortKey: 2,
    title: "1st place — inter-college dance competition",
    org: "Dance team lead",
    kind: "achievement",
    body: "Directed and coordinated a 15+ member dance team to first place through strong leadership and collaboration.",
    icon: "note_block",
  },
  {
    id: "cricket",
    date: "TBD",
    sortKey: 3,
    title: "All India Cricket Tournament",
    kind: "achievement",
    body: "Showed resilience, strategic thinking and a strong commitment to team dynamics in a high-stakes environment.",
    icon: "cricket_bat",
  },
  {
    id: "webathon",
    date: "TBD",
    sortKey: 4,
    title: "2nd Runner-Up — Webathon at SKIT",
    kind: "achievement",
    body: "Rapid problem-solving, technical skill and teamwork under a tight deadline.",
    icon: "redstone_dust",
  },
  {
    id: "bull-commander",
    date: "Sep 2024 – Present",
    sortKey: 5,
    title: "Freelance YouTube Thumbnail Designer",
    org: "Client: Bull Commander",
    kind: "work",
    body: "Designing high-CTR YouTube thumbnails optimised for engagement and branding.",
    bullets: ["Works closely with the creator to keep a consistent visual identity."],
    icon: "echo_shard",
  },
  {
    id: "innhouse",
    date: "Jul – Aug 2025",
    sortKey: 6,
    title: "Graphic Design & Video Editing Intern",
    org: "InnHouse",
    kind: "work",
    body: "Designed carousels and social posts for multiple brands, adapting the visual style to each brand's identity and audience.",
    bullets: [
      "Shifted toward minimal, clean layouts to improve readability, visual hierarchy and brand recall.",
      "Edited and produced short-form video in Premiere Pro and CapCut for social platforms.",
    ],
    icon: "tool_reel",
  },
  {
    id: "sid-and-co",
    date: "Jul – Aug 2025",
    sortKey: 7,
    title: "Web Developer",
    org: "Sid and Co.",
    kind: "work",
    body: "Designed and built a WordPress website in one month — themes, layouts and plugins customised to the brand.",
    bullets: ["Responsive, user-centric interfaces with consistent visuals."],
    icon: "tool_redstone",
  },
  {
    id: "streamico",
    date: "TBD",
    sortKey: 8,
    title: "Visual & UI Lead — Streamico",
    kind: "project",
    body: "Led the UI for a SaaS that lets YouTube streamers create and share timestamp-based clips — Figma flows to a working WordPress front end.",
    icon: "tool_pen",
  },
];

export const sortedMilestones = [...milestones].sort((a, b) => a.sortKey - b.sortKey);

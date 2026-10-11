// About Me quest — "The Missing Setup" (docs/PLAN.md §9.1).
// DRAFT COPY written from the resume. Mehul should approve or rewrite it.

export type Chapter = { id: string; title: string; item?: string; paragraphs: string[]; list?: string[] };

export const chapters: Chapter[] = [
  {
    id: "who",
    title: "Who I am",
    paragraphs: [
      "I'm Mehul — the editor behind SpiderStudios.",
      "I design thumbnails that earn the click and cut edits that earn the watch time. Graphic designer, video editor and YouTube gaming creator, based in Jaipur and working with creators anywhere.",
    ],
  },
  {
    id: "where",
    title: "Where I'm from",
    item: "camera",
    paragraphs: [
      "I grew up in the Pink City and started with graphic design — posters, logos, social posts, branding.",
      "Then gaming pulled me into YouTube, and Valorant clips turned into edits. Now I do both, and each one makes the other better.",
    ],
  },
  {
    id: "play",
    title: "How I play",
    item: "headphones",
    paragraphs: [
      "I've played the All India Cricket Tournament and finished on the podium at SKIT's Webathon.",
      "Both taught me the same thing: good teams win, and clear communication wins faster.",
    ],
  },
  {
    id: "lead",
    title: "How I lead",
    item: "memory_card",
    paragraphs: [
      "I once led a 15+ member dance crew to first place at an inter-college competition.",
      "Rhythm is how I think. It's why I love beat-sync edits — and why every cut I make lands on purpose.",
    ],
  },
  {
    id: "believe",
    title: "What I believe",
    paragraphs: ["Four rules I edit and design by:"],
    list: [
      "Clean beats cluttered — minimal layouts, clear hierarchy, instant recall.",
      "Every cut earns its place — pacing is retention.",
      "Sound is half the edit.",
      "The audience is the brief.",
    ],
  },
];

export const questItems = [
  { id: "camera", name: "Camera", sprite: "camera", where: "Hawa Mahal balcony", chapter: "where" },
  { id: "headphones", name: "Headphones", sprite: "headphones", where: "Cricket pitch", chapter: "play" },
  { id: "memory_card", name: "Memory Card", sprite: "memory_card", where: "Dance stage", chapter: "lead" },
] as const;

export type QuestItemId = (typeof questItems)[number]["id"];

export const npcLines = {
  greet: "Hey, I'm Mehul! My setup's missing three things and I can't render today's edit. Help me out?",
  progress: (n: number) => `${n}/3 found. The beams show where the rest are hiding.`,
  done: "That's everything — thanks! Let's render this thing.",
};

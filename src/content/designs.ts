import type { ToolId } from "./tools";

// Branding & social design (Ancient City → Archaeology Wing) and web/UI work
// (Crafting Room → Redstone Corner). `image: null` renders a generated stand-in.

export type DesignPiece = {
  slug: string;
  title: string;
  kind: "carousel" | "poster" | "logo" | "banner";
  client?: string;
  tools: ToolId[];
  description: string;
  image: string | null;
  art: { title: string; sub: string; bg: [string, string]; ink: string };
  sample?: boolean;
};

export const designs: DesignPiece[] = [
  {
    slug: "carousel-innhouse",
    title: "Brand Carousels",
    kind: "carousel",
    client: "InnHouse (internship)",
    tools: ["photoshop", "canva"],
    description:
      "Carousels and social posts for multiple brands, each adapted to the brand's identity. Moved toward minimal, clean layouts to improve readability, hierarchy and brand recall.",
    image: null,
    art: { title: "5 TIPS", sub: "swipe →", bg: ["#f4efe6", "#e9dfcc"], ink: "#1d1d1d" },
    sample: true,
  },
  {
    slug: "poster-event",
    title: "Event Posters",
    kind: "poster",
    tools: ["photoshop", "canva"],
    description: "Event posters and promotional creatives for campaigns.",
    image: null,
    art: { title: "FEST", sub: "LIVE · 8PM", bg: ["#1a0b3a", "#e0313f"], ink: "#ffff55" },
    sample: true,
  },
  {
    slug: "logo-pack",
    title: "Logos & Identity",
    kind: "logo",
    tools: ["photoshop", "figma"],
    description: "Cohesive branding assets — logos, marks and colour systems.",
    image: null,
    art: { title: "S/S", sub: "identity", bg: ["#0f0f12", "#2b2b33"], ink: "#e0313f" },
    sample: true,
  },
  {
    slug: "banner-series",
    title: "Banners & Marketing Creatives",
    kind: "banner",
    tools: ["photoshop"],
    description: "Channel banners and marketing creatives that keep a creator's identity consistent.",
    image: null,
    art: { title: "NEW VIDEO", sub: "every friday", bg: ["#06281f", "#11a36b"], ink: "#ffffff" },
    sample: true,
  },
];

export type WebProject = {
  slug: string;
  title: string;
  role: string;
  date: string;
  tools: ToolId[];
  summary: string;
  bullets: string[];
  url: string | null;
};

export const webProjects: WebProject[] = [
  {
    slug: "streamico",
    title: "Streamico",
    role: "Visual & UI design lead",
    date: "TBD", // TODO(Mehul)
    tools: ["figma", "photoshop", "wordpress"],
    summary: "A SaaS platform for YouTube streamers to create and share timestamp-based clips.",
    bullets: [
      "Led the visual and UI design of the platform.",
      "Designed the interface and user flows in Figma, then translated them into a working WordPress front end.",
      "Coordinated with development to align design intent with real-time processing and subscription features.",
    ],
    url: null,
  },
  {
    slug: "sid-and-co",
    title: "Sid and Co.",
    role: "Web Developer",
    date: "Jul–Aug 2025",
    tools: ["wordpress"],
    summary: "A visually compelling WordPress website, designed and built in one month.",
    bullets: [
      "Customised themes, layouts and plugins to match the brand identity.",
      "Built responsive, user-centric interfaces and refined visual consistency.",
      "Managed content structure and prepared for future design integrations.",
    ],
    url: null, // TODO(Mehul): live URL
  },
];

// Skills as crafting stations (docs/PLAN.md §9.5). Wording comes straight from the
// resume; `evidence` links each skill to the work that proves it.

export type StationId =
  | "crafting_table"
  | "enchanting_table"
  | "loom"
  | "cartography_table"
  | "jukebox"
  | "brewing_stand"
  | "redstone"
  | "lectern";

export type Skill = {
  id: string;
  station: StationId;
  stationName: string;
  name: string;
  description: string;
  skills: string[]; // exact resume wording
  evidence: { label: string; href: string }[];
};

export const skillStations: Skill[] = [
  {
    id: "video",
    station: "crafting_table",
    stationName: "Crafting Table",
    name: "Video Editing",
    description: "Short-form and gaming edits built for retention — the crafting table is where clips, music and effects become an edit.",
    skills: ["Short-Form Video Editing", "Gaming Video Editing", "Gameplay Editing", "Reels/Shorts Editing", "YouTube Video Production"],
    evidence: [
      { label: "1v4 Clutch — Velocity Edit", href: "/nether/valorant-velocity" },
      { label: "Brand Reels — InnHouse", href: "/the-end/innhouse-reels" },
      { label: "Play: Craft the Edit", href: "#game:craft" },
    ],
  },
  {
    id: "thumbs",
    station: "enchanting_table",
    stationName: "Enchanting Table",
    name: "Thumbnail Design",
    description: "Making videos irresistible before they're even played. High-CTR thumbnails for Bull Commander since September 2024.",
    skills: ["Thumbnail Design", "Audience Engagement"],
    evidence: [
      { label: "Bull Commander collection", href: "/ancient-city" },
      { label: "High-Stakes Clutch breakdown", href: "/ancient-city/bc-clutch" },
    ],
  },
  {
    id: "brand",
    station: "loom",
    stationName: "Loom",
    name: "Branding & Typography",
    description: "Banners, logos and identity systems — the loom weaves patterns, Mehul weaves brands.",
    skills: ["Branding & Visual Identity", "Typography", "Graphic Design", "Print Design"],
    evidence: [
      { label: "Logos & Identity", href: "/ancient-city?wing=archaeology" },
      { label: "Banners & Marketing Creatives", href: "/ancient-city?wing=archaeology" },
    ],
  },
  {
    id: "layout",
    station: "cartography_table",
    stationName: "Cartography Table",
    name: "Layout & Social Design",
    description: "Maps are layouts. Carousels and posts designed for readability, hierarchy and brand recall.",
    skills: ["Layout & Composition", "Social Media Design"],
    evidence: [{ label: "Brand Carousels — InnHouse", href: "/ancient-city?wing=archaeology" }],
  },
  {
    id: "sound",
    station: "jukebox",
    stationName: "Jukebox",
    name: "Pacing & Sound Design",
    description: "Rhythm is how Mehul thinks — cuts land on the beat and sound carries the moment.",
    skills: ["Pacing & Sound Design", "Entertainment Content"],
    evidence: [
      { label: "Phonk Beat-Sync Edit", href: "/nether/phonk-sync" },
      { label: "SpiderStudios Showreel", href: "/the-end/showreel" },
    ],
  },
  {
    id: "colour",
    station: "brewing_stand",
    stationName: "Brewing Stand",
    name: "Colour Theory",
    description: "Potions are colour. Contrast and palette choices that make a thumbnail pop on any feed.",
    skills: ["Color Theory"],
    evidence: [{ label: "Thumbnail breakdowns (value view)", href: "/ancient-city/bc-ranked" }],
  },
  {
    id: "web",
    station: "redstone",
    stationName: "Redstone Corner",
    name: "Web & UI",
    description: "Redstone is engineering. Figma flows turned into working WordPress sites.",
    skills: ["UI design (Figma)", "WordPress development", "Responsive layouts"],
    evidence: [
      { label: "Streamico", href: "/crafting#streamico" },
      { label: "Sid and Co.", href: "/crafting#sid-and-co" },
    ],
  },
  {
    id: "soft",
    station: "lectern",
    stationName: "Lectern",
    name: "How Mehul Works",
    description: "The soft skills behind the hard ones.",
    skills: ["Creativity", "Communication", "Leadership", "Team Collaboration", "Attention to Detail", "Problem Solving"],
    evidence: [
      { label: "Led a 15+ dance crew to 1st", href: "/end-city" },
      { label: "Webathon podium at SKIT", href: "/end-city" },
    ],
  },
];

export const creatorSkills = [
  "Gaming Content Creation",
  "YouTube Video Production",
  "Entertainment Content",
  "Gameplay Editing",
  "Thumbnail Design",
  "Audience Engagement",
];

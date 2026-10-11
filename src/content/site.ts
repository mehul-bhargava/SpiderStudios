// Global identity. Everything here comes from Mehul's resume unless marked TODO.

export const site = {
  brand: "SpiderStudios",
  edition: "Editor's Edition",
  version: "1.0",
  owner: "Mehul Bhargava",
  roles: ["Graphic Designer", "Video Editor", "YouTube Gaming Creator"],
  location: "Jaipur, Rajasthan, India",
  timezone: "IST (UTC+5:30)",
  coords: "26.91° N, 75.79° E",
  email: "mehulbhargava26@gmail.com",
  // Phone is intentionally NOT published (see docs/PLAN.md §2.4). Set to a string to show a WhatsApp button.
  whatsapp: null as string | null,
  // Drop a PDF into /public and set this to e.g. "/Mehul_Bhargava_Resume.pdf" to show the download button.
  resumeUrl: null as string | null,
  responseTime: "Usually replies within 24 hours",
  url: "https://spiderstudios.vercel.app", // TODO: replace with the real domain
  summary:
    "Creative graphic designer, video editor and YouTube gaming content creator with a strong foundation in visual storytelling and branding. Skilled in social media design, short-form video editing, thumbnail design and gaming content creation.",
};

export type Social = { id: string; label: string; url: string | null };

// TODO(Mehul): fill in real URLs. Socials with url === null are hidden.
export const socials: Social[] = [
  { id: "youtube", label: "YouTube", url: null },
  { id: "instagram", label: "Instagram", url: null },
  { id: "discord", label: "Discord", url: null },
  { id: "linkedin", label: "LinkedIn", url: null },
  { id: "behance", label: "Behance", url: null },
  { id: "x", label: "X", url: null },
];

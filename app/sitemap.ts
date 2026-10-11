import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { dimensions } from "@/content/dimensions";
import { projects } from "@/content/projects";
import { thumbnails } from "@/content/thumbnails";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  return [
    { url: `${base}/` },
    ...dimensions.filter((d) => !d.secret).map((d) => ({ url: `${base}${d.path}` })),
    ...projects.filter((p) => !p.locked && p.home !== "lab").map((p) => ({ url: `${base}/${p.home}/${p.slug}` })),
    ...thumbnails.map((t) => ({ url: `${base}/ancient-city/${t.slug}` })),
  ];
}

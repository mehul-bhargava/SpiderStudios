import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SceneMount } from "@/hud/SceneMount";
import { ClassicFrame } from "@/classic/ClassicFrame";
import { DimensionSection } from "@/classic/sections";
import { OpenButton } from "@/classic/islands";
import { isDimensionId } from "@/content/dimensions";
import { projects, projectBySlug } from "@/content/projects";
import { thumbnails, thumbBySlug } from "@/content/thumbnails";

// Deep links: /the-end/<project>, /nether/<project>, /ancient-city/<thumbnail>
export function generateStaticParams() {
  return [
    ...projects.filter((p) => !p.locked).map((p) => ({ dimension: p.home, slug: p.slug })),
    ...thumbnails.map((t) => ({ dimension: "ancient-city", slug: t.slug })),
  ];
}

export const dynamicParams = false;

function lookup(dimension: string, slug: string) {
  if (dimension === "ancient-city") {
    const t = thumbBySlug[slug];
    return t ? { kind: "thumb" as const, title: t.title, desc: t.brief } : null;
  }
  const p = projectBySlug[slug];
  return p && p.home === dimension && !p.locked ? { kind: "project" as const, title: p.title, desc: p.description } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ dimension: string; slug: string }> }): Promise<Metadata> {
  const { dimension, slug } = await params;
  const item = lookup(dimension, slug);
  return item ? { title: item.title, description: item.desc } : {};
}

export default async function WorkPage({ params }: { params: Promise<{ dimension: string; slug: string }> }) {
  const { dimension, slug } = await params;
  const item = lookup(dimension, slug);
  if (!item || !isDimensionId(dimension)) notFound();
  const overlay = item.kind === "thumb" ? ({ type: "thumb", slug } as const) : ({ type: "project", slug } as const);
  return (
    <>
      <SceneMount world={dimension} open={overlay} />
      <ClassicFrame active={dimension}>
        <section className="mc-dark readable">
          <h1 style={{ marginTop: 0 }}>{item.title}</h1>
          <p className="lede">{item.desc}</p>
          <OpenButton overlay={overlay} className="mc-btn">
            {item.kind === "thumb" ? "Open the breakdown" : "Watch ▶"}
          </OpenButton>
        </section>
        <DimensionSection id={dimension} />
      </ClassicFrame>
    </>
  );
}

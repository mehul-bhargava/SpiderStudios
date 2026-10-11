import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SceneMount } from "@/hud/SceneMount";
import { ClassicFrame } from "@/classic/ClassicFrame";
import { DimensionSection } from "@/classic/sections";
import { dimensionById, dimensions, isDimensionId } from "@/content/dimensions";

export function generateStaticParams() {
  return dimensions.map((d) => ({ dimension: d.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ dimension: string }> }): Promise<Metadata> {
  const { dimension } = await params;
  if (!isDimensionId(dimension)) return {};
  const d = dimensionById[dimension];
  return { title: `${d.purpose} — ${d.name}`, description: d.tagline };
}

export default async function DimensionPage({ params }: { params: Promise<{ dimension: string }> }) {
  const { dimension } = await params;
  if (!isDimensionId(dimension)) notFound();
  return (
    <>
      <SceneMount world={dimension} />
      <ClassicFrame active={dimension}>
        <DimensionSection id={dimension} />
      </ClassicFrame>
    </>
  );
}

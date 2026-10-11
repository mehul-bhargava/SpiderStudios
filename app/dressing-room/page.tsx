import type { Metadata } from "next";
import { SceneMount } from "@/hud/SceneMount";
import { ClassicFrame } from "@/classic/ClassicFrame";
import { DressingSection } from "@/classic/sections";

export const metadata: Metadata = { title: "Dressing Room", description: "Build your own explorer — and export it as a real 64×64 skin." };

export default function DressingRoom() {
  return (
    <>
      <SceneMount world="dressing" />
      <ClassicFrame active="dressing">
        <DressingSection />
      </ClassicFrame>
    </>
  );
}

import { SceneMount } from "@/hud/SceneMount";
import { ClassicFrame } from "@/classic/ClassicFrame";
import { HomeSection } from "@/classic/sections";

export default function Home() {
  return (
    <>
      <SceneMount world="title" />
      <ClassicFrame active="home">
        <HomeSection />
      </ClassicFrame>
    </>
  );
}

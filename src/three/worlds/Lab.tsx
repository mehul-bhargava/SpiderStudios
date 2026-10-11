"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { VoxelWorld } from "@/engine/voxel";
import { projectsIn } from "@/content/projects";
import { FRAME_COUNT } from "@/content/games";
import { useUi, type Poi } from "@/state/ui";
import { useProgress } from "@/state/progress";
import { usePois, useWorldBuild, useWorldReady } from "../runtime";
import { Env, Interactable, Label, Screen, Sign, VoxelMesh } from "../kit";
import { CameraRig, Explorer } from "../actors";
import { TravelPortal } from "./common";
import { colorMat, unitBox } from "../extrude";

const F = 4;

export function buildLab(): VoxelWorld {
  const w = new VoxelWorld(64, 26, 64);
  w.fill(-32, 0, -32, 31, F - 1, 31, "white_concrete");
  w.fill(-30, F, -30, 30, F, 30, "grid");
  // unfinished house
  w.room(-14, F, -14, -6, F + 6, -6, "oak_planks", "oak_planks", "light_gray_concrete");
  for (let i = 0; i < 18; i++) w.set(-14 + ((i * 7) % 9), F + 2 + (i % 4), -14 + ((i * 3) % 9), 0);
  w.clear(-13, F + 6, -13, -7, F + 6, -7);
  // scaffolding tower
  for (let y = F + 1; y < F + 14; y++) for (const [x, z] of [
    [8, -10],
    [10, -10],
    [8, -8],
    [10, -8],
  ]) w.set(x, y, z, "scaffold");
  // structure + command blocks
  w.set(-2, F + 1, 10, "structure_block");
  w.set(2, F + 1, 10, "command_block");
  w.fill(-1, F + 1, 10, 1, F + 1, 10, "light_gray_concrete");
  // screen wall
  w.fill(-8, F + 1, -20, 8, F + 7, -20, "gray_concrete");
  return w;
}

function Wireframe({ size, ...g }: { size: [number, number, number]; position: [number, number, number] }) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)), [size]);
  return (
    <lineSegments geometry={geo} {...g}>
      <lineBasicMaterial color="#3a8aff" />
    </lineSegments>
  );
}

export default function Lab() {
  const built = useWorldBuild("lab", buildLab);
  useWorldReady("lab", !!built);
  const frames = useProgress((s) => s.frames.length);
  const list = useMemo(() => projectsIn("lab"), []);
  const open = useUi((s) => s.open);

  const pois: Poi[] = useMemo(
    () => [
      { id: "spawn", label: "Snapshot Lab", sprite: "structure_block", stand: [0.5, F + 1, 6.5], look: [0.5, F + 4, -18], cam: [0.5, F + 8, 18] },
      { id: "screens", label: "Work in progress", sprite: "clapper", stand: [0.5, F + 1, -14.5], look: [0.5, F + 4, -19], cam: [0.5, F + 5, -8] },
      { id: "house", label: "Unfinished build", sprite: "pickaxe", stand: [-4.5, F + 1, -4.5], look: [-10, F + 3, -10], cam: [0, F + 7, 2] },
      { id: "exit", label: "Back to the Overworld", sprite: "grass_block", stand: [14.5, F + 1, 8.5], look: [18.5, F + 2.5, 10.5], cam: [10, F + 5, 16] },
    ],
    [],
  );
  usePois(pois, [built]);

  return (
    <>
      <Env bg="#e9edf2" fog={["#e9edf2", 30, 80]} ambient={1} sun={{ pos: [10, 30, 10], intensity: 0.8 }} />
      {built && <VoxelMesh built={built} look={{ sky: 1, ambient: "#202024", blockColor: "#ffffff" }} />}
      <CameraRig />
      <Explorer />
      {list.map((p, i) => {
        const locked = p.locked === "lost-frames" && frames < FRAME_COUNT;
        const x = -4 + i * 8;
        if (locked)
          return (
            <Interactable key={p.slug} tip={{ title: "Locked: " + p.title, color: "#aaaaaa", lore: [`Lost Frames: ${frames}/${FRAME_COUNT}`, "Find them in chests across every dimension"] }} position={[x + 0.5, F + 4, -19.4]} size={[5.4, 3.2, 0.3]} offset={[0, 0, 0]} onSelect={() => open({ type: "dialog", speaker: "Snapshot Lab", text: `This reel unlocks when you collect all ${FRAME_COUNT} Lost Frames (${frames}/${FRAME_COUNT}). Open the Map (key 8) to see where the chests are.` })} poi="screens">
              <mesh geometry={unitBox} material={colorMat("#2a2a30")} scale={[5.2, 3, 0.1]} />
              <Label text={`LOCKED · ${frames}/${FRAME_COUNT} Lost Frames`} position={[0, 0, 0.3]} size={0.6} color="#ffff55" />
            </Interactable>
          );
        return <Screen key={p.slug} project={p} width={5} position={[x + 0.5, F + 4, -19.4]} poi="screens" />;
      })}
      <Label text="SNAPSHOT 26w41a" position={[0.5, F + 9.5, -20]} size={1.3} color="#3a3a3a" bg="rgba(255,255,255,0.6)" />
      <Wireframe size={[6, 5, 6]} position={[12, F + 2.5, 8]} />
      <Wireframe size={[3, 8, 3]} position={[-16, F + 4, 12]} />
      <Sign position={[-4.5, F + 1, -2.5]} lines={["Under construction", "Come back soon!"]} />
      <TravelPortal to="overworld" position={[18.5, F + 1, 10.5]} rotation={[0, -Math.PI / 2, 0]} w={2.4} h={3.4} />
    </>
  );
}

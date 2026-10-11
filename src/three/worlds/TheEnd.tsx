"use client";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { VoxelWorld } from "@/engine/voxel";
import { fbm2, mulberry32 } from "@/engine/rng";
import { projectsIn, categoryLabels } from "@/content/projects";
import { useUi, type Poi } from "@/state/ui";
import { useProgress } from "@/state/progress";
import { usePois, useWorldBuild, useWorldReady } from "../runtime";
import { Env, Interactable, Label, Particles, PortalPlane, Screen, Stars, VoxelMesh } from "../kit";
import { CameraRig, EnderDragon, Explorer } from "../actors";
import { ChestSpot, TravelPortal } from "./common";
import { colorMat, unitBox } from "../extrude";

const TOP = 20;
const PILLARS = 8;
const PR = 21;

export function pillarInfo() {
  const r = mulberry32(88);
  return Array.from({ length: PILLARS }, (_, i) => {
    const a = (i / PILLARS) * Math.PI * 2 + 0.2;
    return { x: Math.round(Math.cos(a) * PR), z: Math.round(Math.sin(a) * PR), h: 7 + Math.floor(r() * 9), rad: 1 + (i % 3 === 0 ? 1 : 0), a };
  });
}

export function buildEnd(): VoxelWorld {
  const w = new VoxelWorld(92, 52, 92);
  w.sky = false;
  const R = 33;
  for (let x = -45; x <= 45; x++)
    for (let z = -45; z <= 45; z++) {
      const d = Math.hypot(x, z) + (fbm2(x * 0.08, z * 0.08, 3, 5) - 0.5) * 9;
      if (d > R) continue;
      const k = 1 - d / R;
      const top = TOP + Math.round(fbm2(x * 0.12, z * 0.12, 2, 2) * 1.6);
      const depth = Math.round(Math.pow(k, 0.55) * 16);
      for (let y = top - depth; y <= top; y++) w.set(x, y, z, "end_stone");
    }
  // flatten centre
  for (let x = -8; x <= 8; x++) for (let z = -8; z <= 8; z++) if (Math.hypot(x, z) < 8) {
    w.clear(x, TOP + 1, z, x, TOP + 4, z);
    w.set(x, TOP, z, "end_stone");
  }
  // exit portal fountain
  w.ring(0, TOP + 1, 0, 3.5, "bedrock", 1);
  w.disc(0, TOP, 0, 3, "bedrock");
  w.column(0, TOP + 1, 0, 4, "bedrock");
  // pillars
  for (const p of pillarInfo()) {
    w.cylinder(p.x, TOP - 2, p.z, p.rad, p.h + 2, "obsidian");
    w.set(p.x, TOP + p.h, p.z, "bedrock");
  }
  // chorus plants
  const r = mulberry32(3);
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const d = 11 + r() * 18;
    const x = Math.round(Math.cos(a) * d);
    const z = Math.round(Math.sin(a) * d);
    let y = w.top(x, z) + 1;
    if (!Number.isFinite(y) || y > TOP + 3) continue;
    const h = 2 + Math.floor(r() * 4);
    for (let k = 0; k < h; k++) {
      w.set(x, y + k, z, "chorus");
      if (k > 1 && r() < 0.5) w.set(x + (r() < 0.5 ? 1 : -1), y + k, z, "chorus");
    }
    w.set(x, y + h, z, "chorus_flower");
    y = 0;
  }
  // gateway platform
  w.fill(-2, TOP + 6, -30, 2, TOP + 6, -28, "end_stone_bricks");
  w.ring(0, TOP + 7, -29, 1.5, "bedrock", 1);
  return w;
}

function DragonEgg({ onSelect }: { onSelect: () => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.4;
  });
  return (
    <Interactable tip={{ title: "Dragon Egg", rarity: "epic", lore: ["SpiderStudios Showreel", "Click to free the egg"] }} onSelect={onSelect} position={[0.5, TOP + 5, 0.5]} size={[1.2, 1.4, 1.2]} offset={[0, 0.6, 0]} poi="egg">
      <group ref={ref}>
        <mesh geometry={unitBox} material={colorMat("#1a0f26")} scale={[0.75, 0.6, 0.75]} position={[0, 0.3, 0]} />
        <mesh geometry={unitBox} material={colorMat("#1a0f26")} scale={[0.6, 0.35, 0.6]} position={[0, 0.75, 0]} />
        <mesh geometry={unitBox} material={colorMat("#7a3cbf", true)} scale={[0.12, 0.12, 0.77]} position={[0.2, 0.4, 0]} />
        <mesh geometry={unitBox} material={colorMat("#7a3cbf", true)} scale={[0.77, 0.1, 0.12]} position={[0, 0.65, -0.1]} />
      </group>
      <pointLight color="#c58cff" intensity={6} distance={8} position={[0, 1, 0]} />
    </Interactable>
  );
}

function Crystal({ position, target }: { position: [number, number, number]; target: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 1.2;
    ref.current.rotation.x = clock.elapsedTime * 0.8;
  });
  const beam = useMemo(() => {
    const a = new THREE.Vector3(...position);
    const b = new THREE.Vector3(...target);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    return { mid, len, q };
  }, [position, target]);
  return (
    <>
      <group position={position}>
        <group ref={ref}>
          <mesh geometry={unitBox} material={colorMat("#ff8ad8", true)} scale={0.7} />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1.1, 1.1, 1.1)]} />
            <lineBasicMaterial color="#ffffff" />
          </lineSegments>
        </group>
      </group>
      <mesh position={beam.mid} quaternion={beam.q}>
        <cylinderGeometry args={[0.05, 0.05, beam.len, 4, 1, true]} />
        <meshBasicMaterial color="#e8b8ff" transparent opacity={0.5} />
      </mesh>
    </>
  );
}

export default function TheEnd() {
  const built = useWorldBuild("the-end", buildEnd);
  useWorldReady("the-end", !!built);
  const [swoop, setSwoop] = useState(false);
  const projects = useMemo(() => projectsIn("the-end").filter((p) => !p.locked), []);
  const showreel = projects.find((p) => p.slug === "showreel");
  const shelf = projects.filter((p) => p.slug !== "showreel");
  const pillars = useMemo(() => pillarInfo(), []);
  // assign projects to pillars facing the centre
  const slots = pillars.map((p, i) => ({ ...p, project: shelf[i % Math.max(1, pillars.length)] && i < shelf.length ? shelf[i] : null }));

  const freeEgg = () => {
    setSwoop(true);
    useProgress.getState().unlock("egg");
    window.setTimeout(() => {
      setSwoop(false);
      useUi.getState().open({ type: "project", slug: "showreel" });
    }, 900);
  };

  const pois: Poi[] = useMemo(() => {
    if (!built) return [];
    const list: Poi[] = [{ id: "arrival", label: "The End", sprite: "ender_eye", stand: [0.5, TOP + 1, 12.5], look: [0.5, TOP + 6, 0.5], cam: [0.5, TOP + 10, 26] }];
    list.push({ id: "egg", label: "Dragon Egg · Showreel", sprite: "dragon_egg", stand: [2.5, TOP + 1, 4.5], look: [0.5, TOP + 5.6, 0.5], cam: [4, TOP + 8, 10], actionLabel: "Free the egg", action: freeEgg });
    slots.forEach((s, i) => {
      if (!s.project) return;
      const top = TOP + s.h + 1;
      const toC = new THREE.Vector2(-s.x, -s.z).normalize();
      list.push({
        id: `pillar-${i}`,
        label: s.project.title,
        sprite: s.project.aspect === "9:16" ? "phone" : "clapper",
        stand: [s.x + 0.5, top, s.z + 0.5],
        look: [s.x + 0.5, top + 2.8, s.z + 0.5],
        cam: [s.x + 0.5 + toC.x * 7.5, top + 3.4, s.z + 0.5 + toC.y * 7.5],
        actionLabel: "Watch",
        action: () => useUi.getState().open({ type: "project", slug: s.project!.slug }),
      });
    });
    list.push({ id: "browse", label: "Browse all edits", sprite: "book", stand: [0.5, TOP + 1, 12.5], look: [0.5, TOP + 3, 0.5], cam: [0.5, TOP + 22, 30], actionLabel: "Open the edit inventory", action: () => useUi.getState().open({ type: "browse", scope: "videos" }) });
    list.push({ id: "gateway", label: "End Gateway → End City", sprite: "elytra", stand: [0.5, TOP + 7, -27.5], look: [0.5, TOP + 8.5, -29], cam: [0.5, TOP + 11, -18] });
    list.push({ id: "chest", label: "Hidden chest", sprite: "chest", stand: [-3.5, TOP + 1, -4.5], look: [-1, TOP + 1, -3], cam: [-7, TOP + 5, -10] });
    return list;
  }, [built]); // eslint-disable-line react-hooks/exhaustive-deps
  usePois(pois, [pois]);

  return (
    <>
      <Env bg="#0b0612" fog={["#140a20", 45, 120]} ambient={0.7} sun={{ pos: [10, 40, 10], intensity: 0.5, color: "#e8d8ff" }} />
      <Stars count={1400} color="#e6d8ff" />
      {built && <VoxelMesh built={built} look={{ sky: 0, ambient: "#4a3f5c", blockColor: "#e8c8ff" }} />}
      <Particles count={140} area={[70, 24, 70]} center={[0, TOP + 10, 0]} color="#c58cff" size={0.12} velocity={[0, 0.25, 0]} />
      <EnderDragon swoop={swoop} />
      <CameraRig />
      <Explorer />

      <PortalPlane w={6} h={6} stars rotation={[-Math.PI / 2, 0, 0]} position={[0.5, TOP + 1.02, 0.5]} a="#0a2a2a" b="#3ad6c4" />
      {showreel && <DragonEgg onSelect={freeEgg} />}

      {slots.map((s, i) => {
        const top = TOP + s.h + 1;
        const yaw = Math.atan2(-s.x, -s.z);
        if (s.project)
          return (
            <group key={i}>
              <Screen project={s.project} width={3.2} position={[s.x + 0.5, top + 2.8, s.z + 0.5]} rotation={[0, yaw, 0]} poi={`pillar-${i}`} />
              <Label text={s.project.categories.map((c) => categoryLabels[c]).join(" · ")} position={[s.x + 0.5, top + 5.2, s.z + 0.5]} size={0.6} color="#d6b8ff" />
            </group>
          );
        return <Crystal key={i} position={[s.x + 0.5, top + 1, s.z + 0.5]} target={[0.5, TOP + 5, 0.5]} />;
      })}

      <TravelPortal to="end-city" position={[0.5, TOP + 8, -29]} w={2.2} h={2.2} stars label />
      <ChestSpot chest="end-pillar" position={[-1, TOP + 1, -3]} />
    </>
  );
}

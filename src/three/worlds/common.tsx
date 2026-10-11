"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { useThree, type ThreeElements } from "@react-three/fiber";
import { mehulSkin } from "@/engine/skin";
import { chests } from "@/content/games";
import { useProgress } from "@/state/progress";
import { useUi } from "@/state/ui";
import { travel } from "@/lib/nav";
import { dimensionById, type DimensionId, type WorldId } from "@/content/dimensions";
import { Character, type Anim } from "../Character";
import { ChestModel, FloatingItem, Interactable, Label, PortalPlane } from "../kit";
import { extrudeSprite, itemMaterial } from "../extrude";

export function MehulNPC({ anim = "idle", onSelect, poi, label = true, ...g }: ThreeElements["group"] & { anim?: Anim; onSelect?: () => void; poi?: string; label?: boolean }) {
  const { camera } = useThree();
  return (
    <Interactable tip={{ title: "Mehul", color: "#ffff55", lore: ["The creator behind SpiderStudios", "Click to talk"] }} onSelect={onSelect} size={[1, 2, 1]} offset={[0, 1, 0]} poi={poi} {...g}>
      <Character config={mehulSkin} anim={anim} gaze={camera.position} />
      {label && <Label text="Mehul" position={[0, 2.25, 0]} size={0.5} color="#ffff55" />}
    </Interactable>
  );
}

export function ChestSpot({ chest: id, ...g }: ThreeElements["group"] & { chest: string }) {
  const opened = useProgress((s) => s.chests.includes(id));
  const chest = useMemo(() => chests.find((c) => c.id === id), [id]);
  if (!chest) return null;
  return (
    <Interactable
      tip={{ title: opened ? "Chest (opened)" : "Chest", lore: [chest.hint, opened ? "Click to look again" : "Something's inside…"] }}
      onSelect={() => useUi.getState().open({ type: "chest", id })}
      size={[0.95, 0.95, 0.95]}
      offset={[0, 0.45, 0]}
      {...g}
    >
      <ChestModel open={opened} />
    </Interactable>
  );
}

export function DroppedItem({ sprite, beam = true, color = "#ffff55", tip, onSelect, ...g }: ThreeElements["group"] & { sprite: string; beam?: boolean; color?: string; tip: string; onSelect: () => void }) {
  return (
    <Interactable tip={{ title: tip, color: "#ffff55", lore: ["Click to pick up"] }} onSelect={onSelect} size={[1, 1.2, 1]} offset={[0, 0.6, 0]} {...g}>
      <FloatingItem position={[0, 0.6, 0]}>
        <mesh geometry={extrudeSprite(sprite)} material={itemMaterial} scale={0.8} />
      </FloatingItem>
      {beam && (
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 8, 6, 1, true]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </Interactable>
  );
}

/** A framed portal you can click to travel. `facing` rotates around Y. */
export function TravelPortal({
  to,
  w = 3,
  h = 4,
  a,
  b,
  stars,
  label = true,
  ...g
}: ThreeElements["group"] & { to: WorldId; w?: number; h?: number; a?: string; b?: string; stars?: boolean; label?: boolean }) {
  const dim = to !== "title" && to !== "dressing" ? dimensionById[to as DimensionId] : null;
  const name = dim?.name ?? (to === "title" ? "Title Screen" : "Dressing Room");
  const accent = dim?.accent ?? "#c58cff";
  return (
    <Interactable tip={{ title: name, color: accent, lore: [dim?.purpose ?? "", "Click to travel"] }} onSelect={() => travel(to)} size={[w, h, 0.6]} offset={[0, h / 2, 0]} {...g}>
      <PortalPlane w={w} h={h} position={[0, h / 2, 0]} a={a ?? "#3a0a6a"} b={b ?? accent} stars={stars} />
      {/* nudged forward so the frame's lintel block can't hide it */}
      {label && <Label text={name} position={[0, h + 1.1, 0.8]} size={0.55} color={accent} />}
    </Interactable>
  );
}

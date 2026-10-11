"use client";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { meshWorld, type MeshData } from "@/engine/mesher";
import type { VoxelWorld } from "@/engine/voxel";
import { useUi, type Poi } from "@/state/ui";
import { useProgress } from "@/state/progress";
import { dimensionById, isDimensionId, type WorldId } from "@/content/dimensions";
import { startAmbience } from "@/lib/audio";

export type Built = {
  world: VoxelWorld;
  opaque: THREE.BufferGeometry;
  cutout: THREE.BufferGeometry;
  faces: number;
};

const cache = new Map<string, Built>();

function toGeometry(m: MeshData): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(m.position, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(m.uv, 2));
  g.setAttribute("shade", new THREE.BufferAttribute(m.color, 3));
  g.setAttribute("light", new THREE.BufferAttribute(m.light, 3));
  g.setIndex(new THREE.BufferAttribute(m.index, 1));
  g.computeBoundingSphere();
  return g;
}

export function getBuilt(key: string) {
  return cache.get(key) ?? null;
}

/** Builds (once, cached) a voxel world off the first paint so the loader can show. */
export function useWorldBuild(key: string, build: () => VoxelWorld): Built | null {
  const [built, setBuilt] = useState<Built | null>(() => cache.get(key) ?? null);
  useEffect(() => {
    if (built) return;
    useUi.getState().set({ loading: 0.25 });
    const id = window.setTimeout(() => {
      const world = build();
      const m = meshWorld(world);
      const b: Built = { world, opaque: toGeometry(m.opaque), cutout: toGeometry(m.cutout), faces: m.faces };
      cache.set(key, b);
      useUi.getState().set({ loading: 0.9 });
      setBuilt(b);
    }, 80);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return built;
}

const dimAdv: Record<string, string> = {
  "the-end": "end",
  nether: "nether",
  "ancient-city": "ancient",
  lab: "snapshot",
};

/** Call once the world's geometry is on screen. */
export function useWorldReady(id: WorldId, ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const ui = useUi.getState();
    const kind = isDimensionId(id) ? dimensionById[id].transition : "wipe";
    ui.set({ loading: null, transition: { phase: "in", kind } });
    const t1 = window.setTimeout(() => useUi.getState().set({ transition: { phase: "idle", kind } }), 700);
    let t2 = 0;
    if (isDimensionId(id)) {
      ui.set({ card: id });
      t2 = window.setTimeout(() => {
        if (useUi.getState().card === id) useUi.getState().set({ card: null });
      }, 2800);
      const p = useProgress.getState();
      p.visit(id);
      p.unlock("spawn");
      if (dimAdv[id]) p.unlock(dimAdv[id]);
    }
    startAmbience(id);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [id, ready]);
}

/** Registers the points of interest for the current world. */
export function usePois(pois: Poi[], deps: unknown[] = []) {
  useEffect(() => {
    const ui = useUi.getState();
    // keep index if same set (e.g. re-render), otherwise start at 0
    const sameIds = ui.pois.length === pois.length && ui.pois.every((p, i) => p.id === pois[i].id);
    ui.setPois(pois, sameIds ? ui.poiIndex : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => () => useUi.getState().setPois([]), []);
}

/** Feet position on top of the highest block at (x,z). */
export function standOn(w: VoxelWorld, x: number, z: number, yHint?: number): [number, number, number] {
  if (yHint !== undefined) {
    for (let y = yHint + 3; y >= yHint - 6; y--) if (w.get(Math.floor(x), y, Math.floor(z)) && !w.get(Math.floor(x), y + 1, Math.floor(z))) return [x, y + 1, z];
  }
  const t = w.top(Math.floor(x), Math.floor(z));
  return [x, (Number.isFinite(t) ? t : 0) + 1, z];
}

export function localHour() {
  return new Date().getHours();
}

/** 0 (night) .. 1 (day) based on the visitor's clock. */
export function daylight(): number {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  if (h >= 7 && h < 17.5) return 1;
  if (h >= 17.5 && h < 19.5) return 1 - (h - 17.5) / 2;
  if (h >= 5 && h < 7) return (h - 5) / 2;
  return 0;
}

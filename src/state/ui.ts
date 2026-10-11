"use client";
import { create } from "zustand";
import type { DimensionId, TransitionKind, WorldId } from "@/content/dimensions";

export type Overlay =
  | { type: "project"; slug: string; tab?: "watch" | "breakdown" | "raw" }
  | { type: "thumb"; slug: string }
  | { type: "browse"; scope: "videos" | "thumbs"; filter?: string }
  | { type: "book"; id: "about"; page?: number }
  | { type: "contact" }
  | { type: "timeline" }
  | { type: "station"; id: string }
  | { type: "tools" }
  | { type: "web"; slug: string }
  | { type: "craft" }
  | { type: "target" }
  | { type: "spike" }
  | { type: "archaeology" }
  | { type: "chest"; id: string }
  | { type: "credits" }
  | { type: "selectWorld" }
  | { type: "milestone"; id: string }
  | { type: "design"; slug: string }
  | { type: "dialog"; speaker: string; text: string; actions?: { label: string; run: () => void }[] };

export type Menu = null | "pause" | "options" | "inventory" | "chat" | "help";

export type Poi = {
  id: string;
  label: string;
  sprite?: string;
  /** where the explorer stands */
  stand: [number, number, number];
  /** what the camera looks at */
  look: [number, number, number];
  /** camera position (absolute). Defaults to an offset from `look`. */
  cam?: [number, number, number];
  actionLabel?: string;
  action?: () => void;
};

export type Tip = { title: string; lore?: string[]; rarity?: "common" | "rare" | "epic"; color?: string };

export type Toast = { key: number; id: string };

type UiState = {
  world: WorldId | null;
  overlay: Overlay | null;
  overlayStack: Overlay[];
  menu: Menu;
  tooltip: Tip | null;
  toasts: Toast[];
  pois: Poi[];
  poiIndex: number;
  transition: { phase: "idle" | "out" | "in"; kind: TransitionKind };
  card: DimensionId | null;
  loading: number | null; // 0..1 while a world is building
  webgl: boolean;
  hoverId: string | null;
  pose: "idle" | "walk" | "wave" | "dance";
  debug: boolean;
  stats: { fps: number; calls: number; tris: number; xyz: string };
  setWorld: (w: WorldId | null) => void;
  open: (o: Overlay) => void;
  push: (o: Overlay) => void;
  close: () => void;
  setMenu: (m: Menu) => void;
  setTooltip: (t: Tip | null) => void;
  toast: (id: string) => void;
  dropToast: (key: number) => void;
  setPois: (p: Poi[], index?: number) => void;
  goPoi: (i: number) => void;
  focusPoi: (id: string) => void;
  set: (p: Partial<UiState>) => void;
};

let toastKey = 0;

export const useUi = create<UiState>()((set, get) => ({
  world: null,
  overlay: null,
  overlayStack: [],
  menu: null,
  tooltip: null,
  toasts: [],
  pois: [],
  poiIndex: 0,
  transition: { phase: "idle", kind: "wipe" },
  card: null,
  loading: null,
  webgl: true,
  hoverId: null,
  pose: "idle",
  debug: false,
  stats: { fps: 0, calls: 0, tris: 0, xyz: "" },
  setWorld: (world) => set({ world }),
  open: (overlay) => set({ overlay, overlayStack: [], tooltip: null }),
  push: (o) => {
    const cur = get().overlay;
    set({ overlay: o, overlayStack: cur ? [...get().overlayStack, cur] : get().overlayStack, tooltip: null });
  },
  close: () => {
    const stack = get().overlayStack;
    if (stack.length) set({ overlay: stack[stack.length - 1], overlayStack: stack.slice(0, -1) });
    else set({ overlay: null });
  },
  setMenu: (menu) => set({ menu, tooltip: null }),
  setTooltip: (tooltip) => set({ tooltip }),
  toast: (id) => set({ toasts: [...get().toasts, { key: ++toastKey, id }] }),
  dropToast: (key) => set({ toasts: get().toasts.filter((t) => t.key !== key) }),
  setPois: (pois, index = 0) => set({ pois, poiIndex: Math.min(index, Math.max(0, pois.length - 1)) }),
  goPoi: (i) => {
    const n = get().pois.length;
    if (!n) return;
    set({ poiIndex: ((i % n) + n) % n });
  },
  focusPoi: (id) => {
    const i = get().pois.findIndex((p) => p.id === id);
    if (i >= 0) set({ poiIndex: i });
  },
  set: (p) => set(p),
}));

export const uiApi = () => useUi.getState();

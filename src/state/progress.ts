"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { advancementById } from "@/content/advancements";
import type { DimensionId } from "@/content/dimensions";
import { goldenPath } from "@/content/dimensions";
import { FRAME_COUNT } from "@/content/games";
import type { QuestItemId } from "@/content/about";
import { useUi } from "./ui";
import { sfx } from "@/lib/audio";

type ProgressState = {
  advancements: Record<string, number>;
  visited: DimensionId[];
  seen: string[];
  chests: string[];
  frames: number[];
  quest: { talked: boolean; found: QuestItemId[]; done: boolean; skipped: boolean };
  crafted: string[];
  toolsSeen: string[];
  brushed: string[];
  milestones: string[];
  unlock: (id: string) => void;
  visit: (d: DimensionId) => void;
  see: (slug: string) => void;
  openChest: (id: string) => void;
  collectFrame: (n: number) => void;
  setQuest: (p: Partial<ProgressState["quest"]>) => void;
  craft: (recipe: string) => void;
  seeTool: (id: string, total: number) => void;
  brush: (slug: string) => void;
  reachMilestone: (id: string) => void;
  reset: () => void;
};

const initial = {
  advancements: {} as Record<string, number>,
  visited: [] as DimensionId[],
  seen: [] as string[],
  chests: [] as string[],
  frames: [] as number[],
  quest: { talked: false, found: [] as QuestItemId[], done: false, skipped: false },
  crafted: [] as string[],
  toolsSeen: [] as string[],
  brushed: [] as string[],
  milestones: [] as string[],
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,
      unlock: (id) => {
        if (get().advancements[id] || !advancementById[id]) return;
        set({ advancements: { ...get().advancements, [id]: Date.now() } });
        useUi.getState().toast(id);
        sfx("advancement");
      },
      visit: (d) => {
        if (get().visited.includes(d)) return;
        const visited = [...get().visited, d];
        set({ visited });
        if (goldenPath.every((g) => visited.includes(g))) get().unlock("tourist");
      },
      see: (slug) => {
        if (!get().seen.includes(slug)) set({ seen: [...get().seen, slug] });
      },
      openChest: (id) => {
        if (get().chests.includes(id)) return;
        const chests = [...get().chests, id];
        set({ chests });
        if (chests.length >= 5) get().unlock("treasure");
      },
      collectFrame: (n) => {
        if (get().frames.includes(n)) return;
        const frames = [...get().frames, n];
        set({ frames });
        if (frames.length >= FRAME_COUNT) get().unlock("frames");
      },
      setQuest: (p) => set({ quest: { ...get().quest, ...p } }),
      craft: (recipe) => {
        if (get().crafted.includes(recipe)) return;
        const crafted = [...get().crafted, recipe];
        set({ crafted });
        if (crafted.length >= 3) get().unlock("crafter");
      },
      seeTool: (id, total) => {
        if (get().toolsSeen.includes(id)) return;
        const toolsSeen = [...get().toolsSeen, id];
        set({ toolsSeen });
        if (toolsSeen.length >= total) get().unlock("tools");
      },
      brush: (slug) => {
        if (get().brushed.includes(slug)) return;
        set({ brushed: [...get().brushed, slug] });
        get().unlock("brush");
      },
      reachMilestone: (id) => {
        if (!get().milestones.includes(id)) set({ milestones: [...get().milestones, id] });
      },
      reset: () => set({ ...initial }),
    }),
    { name: "ss-progress", version: 1 },
  ),
);

export const progressApi = () => useProgress.getState();
export const unlock = (id: string) => useProgress.getState().unlock(id);

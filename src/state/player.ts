"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultSkin, presets, type SkinConfig } from "@/engine/skin";

type PlayerState = {
  config: SkinConfig;
  customized: boolean;
  title: string | null;
  setConfig: (p: Partial<SkinConfig>) => void;
  applyPreset: (id: string) => void;
  replace: (c: SkinConfig) => void;
  setTitle: (t: string | null) => void;
};

// Starter look until the visitor customises: the "Spider" preset.
const starter = presets.find((p) => p.id === "spider")?.config ?? defaultSkin;

export const usePlayer = create<PlayerState>()(
  persist(
    (set, get) => ({
      config: starter,
      customized: false,
      title: null,
      setConfig: (p) => set({ config: { ...get().config, ...p }, customized: true }),
      applyPreset: (id) => {
        const pr = presets.find((x) => x.id === id);
        if (pr) set({ config: { ...pr.config }, customized: true });
      },
      replace: (c) => set({ config: c, customized: true }),
      setTitle: (title) => set({ title }),
    }),
    { name: "ss-player", version: 1 },
  ),
);

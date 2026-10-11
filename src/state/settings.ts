"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Quality = "auto" | "high" | "lite";
export type Mode = "3d" | "classic";
export type Motion = "system" | "reduced" | "full";

type SettingsState = {
  quality: Quality;
  mode: Mode;
  sound: boolean;
  music: number; // 0..1
  sfx: number; // 0..1
  motion: Motion;
  readable: boolean;
  set: (p: Partial<Omit<SettingsState, "set">>) => void;
};

export const SETTINGS_KEY = "ss-settings";

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      quality: "auto",
      mode: "3d",
      sound: false,
      music: 0.5,
      sfx: 0.7,
      motion: "system",
      readable: false,
      set: (p) => set(p),
    }),
    { name: SETTINGS_KEY, version: 1 },
  ),
);

export function prefersReducedMotion(motion: Motion): boolean {
  if (motion === "reduced") return true;
  if (motion === "full") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotion(): boolean {
  const motion = useSettings((s) => s.motion);
  return prefersReducedMotion(motion);
}

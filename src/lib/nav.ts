"use client";
import { dimensionById, isDimensionId, pathForWorld, type WorldId } from "@/content/dimensions";
import { useUi } from "@/state/ui";
import { useSettings, prefersReducedMotion } from "@/state/settings";
import { sfx } from "./audio";

type RouterLike = { push: (href: string) => void };
let router: RouterLike | null = null;

export function setRouter(r: RouterLike) {
  router = r;
}

/** Travel to a world (with a portal / tactical transition) or any internal path. */
export function travel(target: WorldId | string, opts: { hash?: string } = {}) {
  const path = target.startsWith("/") ? target : pathForWorld(target as WorldId);
  const href = path + (opts.hash ? `#${opts.hash}` : "");
  const ui = useUi.getState();
  const s = useSettings.getState();
  ui.set({ overlay: null, overlayStack: [], menu: null, tooltip: null });
  if (typeof window !== "undefined" && window.location.pathname === path) return;
  if (s.mode === "classic" || !ui.webgl) {
    router?.push(href);
    return;
  }
  const id = path.replace(/^\//, "") || "title";
  const kind = isDimensionId(id) ? dimensionById[id].transition : "wipe";
  ui.set({ transition: { phase: "out", kind }, card: null });
  sfx(kind === "wipe" ? "click" : "portal");
  const delay = prefersReducedMotion(s.motion) ? 0 : kind === "wipe" ? 380 : 650;
  window.setTimeout(() => router?.push(href), delay);
}

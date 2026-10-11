"use client";
import { useEffect } from "react";
import { useUi, type Overlay } from "@/state/ui";
import { getBuilt } from "@/three/runtime";
import type { WorldId } from "@/content/dimensions";

/** Placed on each page: tells the persistent canvas which world to show. */
export function SceneMount({ world, open }: { world: WorldId; open?: Overlay }) {
  useEffect(() => {
    const ui = useUi.getState();
    if (ui.world !== world) {
      if (!getBuilt(world) && world !== "dressing") ui.set({ loading: 0.1 });
      ui.setWorld(world);
    }
    let t = 0;
    if (open) t = window.setTimeout(() => useUi.getState().open(open), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world]);
  return null;
}

"use client";
import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSettings, prefersReducedMotion } from "@/state/settings";
import { useUi } from "@/state/ui";
import { useProgress } from "@/state/progress";
import { setRouter, travel } from "@/lib/nav";
import { unlockAudio, sfx } from "@/lib/audio";
import { dimensions } from "@/content/dimensions";
import { OverlayHost } from "@/overlays/OverlayHost";
import { Toasts } from "./Toasts";
import { CursorTooltip } from "./CursorTooltip";

const WorldCanvas = dynamic(() => import("@/three/WorldCanvas"), { ssr: false });
const Hud = dynamic(() => import("./Hud"), { ssr: false });

function hasWebGL2() {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

export function GameShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const mode = useSettings((s) => s.mode);
  const readable = useSettings((s) => s.readable);
  const motion = useSettings((s) => s.motion);
  const webgl = useUi((s) => s.webgl);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setRouter(router), [router]);

  useEffect(() => {
    const ok = hasWebGL2();
    useUi.getState().set({ webgl: ok });
    const q = new URLSearchParams(window.location.search).get("mode");
    if (q === "classic" || q === "3d") useSettings.getState().set({ mode: q });
    if (new Date().getHours() < 5) window.setTimeout(() => useProgress.getState().unlock("night"), 4000);
    setMounted(true);
  }, []);

  const is3D = mounted && mode === "3d" && webgl;

  useEffect(() => {
    if (!mounted) return;
    const d = document.documentElement;
    d.dataset.mode = is3D ? "3d" : "classic";
    d.dataset.readable = readable ? "true" : "false";
    d.dataset.motion = prefersReducedMotion(motion) ? "reduced" : "full";
  }, [mounted, is3D, readable, motion]);

  // first gesture unlocks audio
  useEffect(() => {
    const go = () => unlockAudio();
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
  }, []);

  // global keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
      const ui = useUi.getState();
      if (e.key === "Escape") {
        if (ui.menu) ui.setMenu(null);
        else if (ui.overlay) ui.close();
        else if (useSettings.getState().mode === "3d") ui.setMenu("pause");
        return;
      }
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      if (ui.overlay && ui.overlay.type !== "dialog") return;
      const three = useSettings.getState().mode === "3d" && ui.webgl;
      const k = e.key;
      if (/^[1-7]$/.test(k)) {
        const d = dimensions.find((x) => x.hotkey === Number(k));
        if (d) {
          e.preventDefault();
          travel(d.id);
        }
        return;
      }
      if (k === "8") return ui.open({ type: "selectWorld" });
      if (k === "9") return ui.setMenu("inventory");
      if (k === "e" || k === "E") {
        ui.setMenu(ui.menu === "inventory" ? null : "inventory");
        useProgress.getState().unlock("inventory");
        return;
      }
      if (k === "t" || k === "T" || k === "/") {
        e.preventDefault();
        ui.setMenu("chat");
        return;
      }
      if (k === "?") return ui.setMenu(ui.menu === "help" ? null : "help");
      if (k === "m" || k === "M") {
        const s = useSettings.getState();
        s.set({ sound: !s.sound });
        return;
      }
      if (k === "F3") {
        e.preventDefault();
        ui.set({ debug: !ui.debug });
        return;
      }
      if (!three || ui.menu) return;
      if (k === "ArrowRight" || k === "ArrowDown") {
        e.preventDefault();
        ui.goPoi(ui.poiIndex + 1);
        sfx("click");
      } else if (k === "ArrowLeft" || k === "ArrowUp") {
        e.preventDefault();
        ui.goPoi(ui.poiIndex - 1);
        sfx("click");
      } else if (k === "Enter" || k === " ") {
        const p = ui.pois[ui.poiIndex];
        if (p?.action && !ui.overlay) {
          e.preventDefault();
          p.action();
        }
      } else if (k === "f" || k === "F") {
        const w = ui.world;
        ui.open({ type: "browse", scope: w === "ancient-city" ? "thumbs" : "videos" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      {is3D && <WorldCanvas />}
      {is3D && <Hud />}
      <div id="content" className="page-layer">
        {children}
      </div>
      {mounted && <OverlayHost />}
      {mounted && <Toasts />}
      {mounted && <CursorTooltip />}
    </>
  );
}

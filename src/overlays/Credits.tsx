"use client";
import { useEffect } from "react";
import { site } from "@/content/site";
import { advancements } from "@/content/advancements";
import { goldenPath } from "@/content/dimensions";
import { useProgress } from "@/state/progress";
import { usePlayer } from "@/state/player";
import { useUi } from "@/state/ui";
import { useSettings, prefersReducedMotion } from "@/state/settings";
import { travel } from "@/lib/nav";

export function Credits() {
  const p = useProgress();
  const title = usePlayer((s) => s.title);
  const reduced = prefersReducedMotion(useSettings((s) => s.motion));
  useEffect(() => {
    const t = window.setTimeout(() => useProgress.getState().unlock("credits"), reduced ? 1500 : 30000);
    return () => window.clearTimeout(t);
  }, [reduced]);
  const close = () => useUi.getState().close();
  return (
    <div className="credits" role="dialog" aria-modal="true" aria-label="Credits">
      <div className="roll readable">
        <h2 style={{ fontSize: 32 }}>SPIDERSTUDIOS</h2>
        <p className="c-gray">{site.edition}</p>
        <h3>Created by</h3>
        <p>{site.owner}</p>
        <p className="c-gray">{site.roles.join(" · ")}</p>
        <h3>Your run</h3>
        <p>
          Explorer title: <b>{title ?? "Explorer"}</b>
        </p>
        <p>
          Dimensions visited: {p.visited.filter((v) => goldenPath.includes(v)).length}/{goldenPath.length}
        </p>
        <p>Pieces of work viewed: {p.seen.length}</p>
        <p>
          Advancements: {Object.keys(p.advancements).length}/{advancements.length}
        </p>
        <p>Chests opened: {p.chests.length} · Lost Frames: {p.frames.length}/8</p>
        <h3>Built with</h3>
        <p>Next.js · React Three Fiber · a hand-rolled voxel engine · procedural pixel art</p>
        <p className="c-gray">Minecraft-inspired. Not an official Minecraft product. Not affiliated with Mojang, Microsoft or Riot Games.</p>
        <h3>Thank you for playing</h3>
        <p>Every great edit starts with a conversation.</p>
        <p className="c-yellow">The End?</p>
      </div>
      <div style={{ position: "fixed", right: 16, bottom: 16, display: "flex", gap: 8 }}>
        <button className="mc-btn" autoFocus onClick={close}>
          Skip credits
        </button>
        <button
          className="mc-btn red"
          onClick={() => {
            close();
            travel("portal");
          }}
        >
          Start a Project
        </button>
      </div>
    </div>
  );
}

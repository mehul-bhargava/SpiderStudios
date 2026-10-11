"use client";
import { useEffect, useState } from "react";
import { useUi } from "@/state/ui";
import { useSettings } from "@/state/settings";
import { useProgress } from "@/state/progress";
import { splashes } from "@/content/splashes";
import { site } from "@/content/site";
import { travel } from "@/lib/nav";
import { sfx } from "@/lib/audio";
import { Wordmark } from "@/ui/Wordmark";
import { ItemIcon } from "@/ui/ItemIcon";

export function TitleMenu() {
  const [splash, setSplash] = useState(splashes[0]);
  const sound = useSettings((s) => s.sound);
  const frame0 = useProgress((s) => s.frames.includes(0));
  useEffect(() => setSplash(splashes[Math.floor(Math.random() * splashes.length)]), []);
  const open = useUi((s) => s.open);
  const overlay = useUi((s) => s.overlay);
  if (overlay?.type === "selectWorld") return null;

  return (
    <div className="title-screen">
      <header className="title-head">
        <h1 className="sr-only">
          SpiderStudios — {site.owner}, {site.roles.join(", ")}
        </h1>
        <Wordmark />
        <div>
          <span className="edition">{site.edition.toUpperCase()}</span>
        </div>
        <button
          className="splash"
          onClick={() => {
            sfx("pop");
            setSplash((s) => {
              let n = s;
              while (n === s) n = splashes[Math.floor(Math.random() * splashes.length)];
              return n;
            });
          }}
          aria-label={`Splash: ${splash} (click for another)`}
        >
          {splash}
        </button>
        {!frame0 && (
          <button
            className="hang-spider"
            aria-label="A spider dangling from the logo"
            onClick={() => {
              sfx("pop");
              useProgress.getState().collectFrame(0);
              useUi.getState().open({ type: "dialog", speaker: "Lost Frame 1/8", text: "You found a Lost Frame hiding on the logo! Seven more are tucked inside chests across the dimensions. Collect all eight to unlock the blooper reel in the Snapshot Lab." });
            }}
          >
            <i />
            <ItemIcon id="spider" size={28} />
          </button>
        )}
      </header>

      <nav className="title-menu" aria-label="Main menu">
        <button className="mc-btn wide" onClick={() => travel("overworld")}>
          Start Adventure
        </button>
        <button className="mc-btn wide" onClick={() => open({ type: "selectWorld" })}>
          Select World
        </button>
        <button className="mc-btn wide" onClick={() => travel("portal")}>
          Co-op: Hire Me
        </button>
        <button className="mc-btn wide" onClick={() => open({ type: "project", slug: "showreel" })}>
          Watch Showreel ▶
        </button>
        <div className="row">
          <button className="mc-btn" onClick={() => useUi.getState().setMenu("options")}>
            Options…
          </button>
          <button className="mc-btn" onClick={() => useSettings.getState().set({ mode: "classic" })}>
            Classic Mode
          </button>
          <button className="mc-btn icon" aria-label="Accessibility & keys" onClick={() => useUi.getState().setMenu("help")}>
            ?
          </button>
          <button className="mc-btn icon" aria-label={sound ? "Mute" : "Sound on"} onClick={() => useSettings.getState().set({ sound: !sound })}>
            <ItemIcon id={sound ? "speaker" : "speaker_off"} size={24} />
          </button>
        </div>
      </nav>

      <div className="dressing-cta">
        <button className="mc-btn" onClick={() => travel("dressing")}>
          <ItemIcon id="tunic" size={24} /> Dressing Room
        </button>
      </div>

      <footer className="title-foot">
        <span>
          {site.brand}: {site.edition} {site.version}
        </span>
        <span>
          © {site.owner}. Not an official Minecraft product.
          <br />
          Not affiliated with Mojang, Microsoft or Riot Games.
        </span>
      </footer>
    </div>
  );
}

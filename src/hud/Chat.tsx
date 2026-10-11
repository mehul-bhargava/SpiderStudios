"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useUi } from "@/state/ui";
import { useSettings } from "@/state/settings";
import { useProgress } from "@/state/progress";
import { projects } from "@/content/projects";
import { thumbnails } from "@/content/thumbnails";
import { site } from "@/content/site";
import { chests } from "@/content/games";
import { travel } from "@/lib/nav";
import { sfx } from "@/lib/audio";

const TP: Record<string, string> = {
  overworld: "overworld",
  home: "overworld",
  end: "the-end",
  "the-end": "the-end",
  videos: "the-end",
  ancient: "ancient-city",
  "ancient-city": "ancient-city",
  thumbnails: "ancient-city",
  nether: "nether",
  crafting: "crafting",
  skills: "crafting",
  endcity: "end-city",
  "end-city": "end-city",
  career: "end-city",
  portal: "portal",
  contact: "portal",
  lab: "lab",
  title: "title",
};

const COMMANDS = ["/help", "/tp ", "/hire", "/showreel", "/skin", "/gamemode classic", "/gamemode 3d", "/time set day", "/time set night", "/locate chest", "/resume", "/seed", "/give @s chai", "/snapshot", "/credits", "/mute", "/kill"];

let log: string[] = ["Type /help for commands, or search for any edit or thumbnail."];

export function Chat() {
  const setMenu = useUi((s) => s.setMenu);
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<string[]>(log);
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);

  const say = (...m: string[]) => {
    log = [...log, ...m].slice(-8);
    setLines(log);
  };

  const suggestions = useMemo(() => {
    const v = value.trim().toLowerCase();
    if (!v) return [];
    if (v.startsWith("/")) {
      if (v.startsWith("/tp ")) return Object.keys(TP).filter((k) => k.startsWith(v.slice(4))).map((k) => `/tp ${k}`).slice(0, 6);
      return COMMANDS.filter((c) => c.startsWith(v)).slice(0, 6);
    }
    const hits = [
      ...projects.filter((p) => !p.locked && (p.title + p.description + p.techniques.join(" ")).toLowerCase().includes(v)).map((p) => `▶ ${p.title}`),
      ...thumbnails.filter((t) => (t.title + t.collection + t.brief).toLowerCase().includes(v)).map((t) => `▣ ${t.title}`),
    ];
    return hits.slice(0, 6);
  }, [value]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return setMenu(null);
    if (cmd.startsWith("▶ ")) {
      const p = projects.find((x) => x.title === cmd.slice(2));
      if (p) {
        setMenu(null);
        useUi.getState().open({ type: "project", slug: p.slug });
      }
      return;
    }
    if (cmd.startsWith("▣ ")) {
      const t = thumbnails.find((x) => x.title === cmd.slice(2));
      if (t) {
        setMenu(null);
        useUi.getState().open({ type: "thumb", slug: t.slug });
      }
      return;
    }
    if (!cmd.startsWith("/")) {
      if (suggestions[0]) return run(suggestions[0]);
      say(`<You> ${cmd}`, "No edits or thumbnails matched. Try 'valorant', 'shorts' or 'clutch'.");
      return;
    }
    useProgress.getState().unlock("command");
    const [c, ...args] = cmd.slice(1).split(/\s+/);
    const close = () => setMenu(null);
    switch (c) {
      case "help":
        return say("/tp <place> · /hire · /showreel · /skin · /gamemode classic|3d · /time set day|night · /locate chest · /resume · /seed · /credits · /mute");
      case "tp": {
        const dest = TP[args[0]?.toLowerCase() ?? ""];
        if (!dest) return say(`Unknown place. Try: ${Object.keys(TP).slice(0, 8).join(", ")}…`);
        close();
        return travel(dest);
      }
      case "hire":
        close();
        return travel("portal");
      case "showreel":
        close();
        return useUi.getState().open({ type: "project", slug: "showreel" });
      case "skin":
        close();
        return travel("dressing");
      case "gamemode":
        if (args[0] === "classic" || args[0] === "3d" || args[0] === "creative") {
          close();
          if (args[0] === "creative") return travel("dressing");
          return useSettings.getState().set({ mode: args[0] });
        }
        return say("Usage: /gamemode classic | 3d");
      case "time":
        return say("Time follows your local clock here — it's " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " for you.");
      case "locate": {
        const left = chests.filter((x) => !useProgress.getState().chests.includes(x.id));
        return say(left.length ? `Nearest unopened chest: ${left[0].hint}.` : "You've opened every chest. Treasure hunter!");
      }
      case "resume":
        if (site.resumeUrl) {
          window.open(site.resumeUrl, "_blank");
          return say("Opening the resume…");
        }
        return say(`Resume coming soon — email ${site.email} for a copy.`);
      case "seed":
        return say("Seed: Jaipur-26.9124N-75.7873E");
      case "give":
        sfx("pop");
        return args.join(" ").includes("chai") ? say("Gave [Chai] × 1 to you. ☕ Fuel for the next edit.") : say("You can only /give @s chai here.");
      case "snapshot":
        close();
        return travel("lab");
      case "credits":
        close();
        return useUi.getState().open({ type: "credits" });
      case "mute": {
        const s = useSettings.getState();
        s.set({ sound: !s.sound });
        return say(s.sound ? "Sound off." : "Sound on.");
      }
      case "kill":
        close();
        say("You fell out of the timeline.");
        return travel("overworld");
      default:
        return say(`Unknown command: /${c}. Type /help.`);
    }
  };

  return (
    <div className="chat" role="dialog" aria-label="Chat and commands">
      <div className="chat-log" aria-live="polite">
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      {suggestions.length > 0 && (
        <div className="chat-suggest" role="listbox">
          {suggestions.map((s, i) => (
            <button key={s} role="option" aria-selected={i === sel} onClick={() => (s.endsWith(" ") ? setValue(s) : run(s))}>
              {s}
            </button>
          ))}
        </div>
      )}
      <input
        ref={input}
        value={value}
        aria-label="Chat input"
        placeholder="/help"
        onChange={(e) => {
          setValue(e.target.value);
          setSel(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const pick = suggestions[sel];
            const v = value.trim();
            run(pick && (!v.startsWith("/") || (pick.startsWith(v) && !COMMANDS.includes(v))) ? pick : value);
            setValue("");
          } else if (e.key === "Tab" && suggestions[sel]) {
            e.preventDefault();
            setValue(suggestions[sel]);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setSel((s) => Math.min(suggestions.length - 1, s + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSel((s) => Math.max(0, s - 1));
          } else if (e.key === "Escape") setMenu(null);
        }}
      />
    </div>
  );
}

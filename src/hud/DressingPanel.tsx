"use client";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/state/player";
import { useUi } from "@/state/ui";
import { useProgress } from "@/state/progress";
import { catalog, composeSkin, decodeSkin, dyes, encodeSkin, presets, randomSkin, skinTones, type SkinConfig } from "@/engine/skin";
import { travel } from "@/lib/nav";
import { sfx } from "@/lib/audio";
import { SkinPreview } from "@/ui/SkinPreview";

type Cat = { id: string; name: string; field?: keyof typeof catalog; color?: keyof SkinConfig; tones?: boolean };

const CATS: Cat[] = [
  { id: "skin", name: "Skin", color: "skin", tones: true },
  { id: "hair", name: "Hair", field: "hair", color: "hairColor" },
  { id: "eyes", name: "Eyes", field: "eyes", color: "eyeColor" },
  { id: "face", name: "Face", field: "face" },
  { id: "headwear", name: "Headwear", field: "headwear", color: "headwearColor" },
  { id: "shirt", name: "Shirt", field: "shirt", color: "shirtColor" },
  { id: "jacket", name: "Jacket", field: "jacket", color: "jacketColor" },
  { id: "trousers", name: "Trousers", field: "trousers", color: "trousersColor" },
  { id: "shoes", name: "Footwear", field: "shoes", color: "shoesColor" },
  { id: "accessory", name: "Accessories", field: "accessory", color: "accessoryColor" },
  { id: "held", name: "Held item", field: "held" },
  { id: "presets", name: "Loadouts" },
];

export function DressingPanel({ classic = false }: { classic?: boolean }) {
  const config = usePlayer((s) => s.config);
  const setConfig = usePlayer((s) => s.setConfig);
  const unlocked = useProgress((s) => s.advancements);
  const pose = useUi((s) => s.pose);
  const [cat, setCat] = useState<Cat>(CATS[1]);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // apply shared look from #skin=…
  useEffect(() => {
    const m = window.location.hash.match(/skin=([^&]+)/);
    if (m) {
      const c = decodeSkin(m[1]);
      if (c) {
        usePlayer.getState().replace(c);
        setMsg("Loaded a shared explorer look!");
      }
    }
  }, []);

  const save = () => {
    useProgress.getState().unlock("dressed");
    sfx("levelup");
  };

  const exportPng = () => {
    const c = composeSkin(config);
    const a = document.createElement("a");
    a.href = config.imported ?? c.toDataURL("image/png");
    a.download = "spiderstudios-skin.png";
    a.click();
    save();
  };
  const share = async () => {
    const url = `${window.location.origin}/dressing-room#skin=${encodeSkin(config)}`;
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Share link copied to clipboard!");
    } catch {
      setMsg(url);
    }
  };
  const importPng = (f: File) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== 64 || (img.height !== 64 && img.height !== 32)) {
          setMsg("That isn't a 64×64 skin file.");
          return;
        }
        setConfig({ imported: r.result as string });
        setMsg("Skin imported — wearing it now.");
        save();
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(f);
  };

  const options = cat.field ? (catalog[cat.field] as { id: string; name: string; unlock?: string }[]) : [];
  const colorField = cat.color;
  const palette = cat.tones ? skinTones : dyes;

  const left = (
    <div className="side left mc-panel" role="tablist" aria-label="Categories">
      <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>Dressing Room</h2>
      <div className="opt-grid">
        {CATS.map((c) => (
          <button key={c.id} role="tab" aria-selected={cat.id === c.id} className={`mc-btn small ${cat.id === c.id ? "selected" : ""}`} onClick={() => setCat(c)}>
            {c.name}
          </button>
        ))}
      </div>
      {config.imported && (
        <p style={{ fontSize: 13 }}>
          Wearing an imported skin.{" "}
          <button className="mc-btn small" onClick={() => setConfig({ imported: null })}>
            Remove
          </button>
        </p>
      )}
    </div>
  );

  const right = (
    <div className="side right mc-panel">
      <h3 style={{ margin: "0 0 10px", fontSize: 16 }}>{cat.name}</h3>
      {cat.id === "presets" ? (
        <div className="opt-grid">
          {presets.map((p) => (
            <button
              key={p.id}
              className="mc-btn small"
              onClick={() => {
                usePlayer.getState().applyPreset(p.id);
                sfx("pop");
              }}
            >
              {p.name}
            </button>
          ))}
          <button
            className="mc-btn small"
            onClick={() => {
              usePlayer.getState().replace(randomSkin());
              sfx("pop");
            }}
          >
            🎲 Randomize
          </button>
        </div>
      ) : (
        <>
          {options.length > 0 && (
            <div className="opt-grid" style={{ marginBottom: 12 }}>
              {options.map((o) => {
                const locked = !!o.unlock && !unlocked[o.unlock];
                const field = cat.field as keyof SkinConfig;
                return (
                  <button
                    key={o.id}
                    className={`mc-btn small ${config[field] === o.id ? "selected" : ""}`}
                    disabled={locked}
                    title={locked ? "Unlocked by an advancement" : undefined}
                    onClick={() => {
                      setConfig({ [field]: o.id, imported: null } as Partial<SkinConfig>);
                      sfx("click");
                    }}
                  >
                    {locked ? "🔒 " : ""}
                    {o.name}
                  </button>
                );
              })}
            </div>
          )}
          {colorField && (
            <>
              <p style={{ margin: "0 0 6px", fontSize: 13 }}>Colour</p>
              <div className="swatches">
                {palette.map((c) => (
                  <button key={c} aria-label={c} aria-pressed={config[colorField] === c} style={{ background: c }} onClick={() => setConfig({ [colorField]: c, imported: null } as Partial<SkinConfig>)} />
                ))}
              </div>
              <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, fontSize: 13 }}>
                Custom
                <input type="color" value={String(config[colorField])} onChange={(e) => setConfig({ [colorField]: e.target.value, imported: null } as Partial<SkinConfig>)} />
              </label>
            </>
          )}
        </>
      )}
      <hr style={{ border: 0, borderTop: "2px solid #8b8b8b", margin: "14px 0" }} />
      <div className="opt-grid">
        <button className="mc-btn small" onClick={() => fileRef.current?.click()}>
          Import skin
        </button>
        <button className="mc-btn small" onClick={exportPng}>
          Export skin
        </button>
        <button className="mc-btn small" onClick={share}>
          Share link
        </button>
        <button
          className="mc-btn small green"
          onClick={() => {
            save();
            travel(classic ? "/" : "title");
          }}
        >
          Done ✓
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/png" hidden onChange={(e) => e.target.files?.[0] && importPng(e.target.files[0])} />
      {msg && (
        <p role="status" style={{ fontSize: 12, wordBreak: "break-all" }}>
          {msg}
        </p>
      )}
    </div>
  );

  if (classic)
    return (
      <div className="grid-2" style={{ gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", alignItems: "start" }}>
        {left}
        <div style={{ textAlign: "center" }}>
          <SkinPreview config={config} scale={8} />
        </div>
        {right}
      </div>
    );

  return (
    <div className="dress">
      {left}
      <div className="center-bar">
        {(["idle", "walk", "wave", "dance"] as const).map((p) => (
          <button key={p} className={`mc-btn small ${pose === p ? "selected" : ""}`} onClick={() => useUi.getState().set({ pose: p })}>
            {p === "walk" ? "Turntable" : p[0].toUpperCase() + p.slice(1)}
          </button>
        ))}
        <span className="c-gray" style={{ fontSize: 12, alignSelf: "center" }}>
          Drag to rotate · scroll to zoom
        </span>
      </div>
      {right}
    </div>
  );
}

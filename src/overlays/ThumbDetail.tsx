"use client";
import { useEffect, useState } from "react";
import { thumbBySlug, thumbnails, collectionLabels } from "@/content/thumbnails";
import { thumbUrl } from "@/lib/media";
import { useProgress } from "@/state/progress";
import { useUi } from "@/state/ui";
import { Head, Modal } from "./Modal";

type Lens = "none" | "focal" | "thirds" | "value" | "squint" | "ab" | "feed";

export function ThumbDetail({ slug }: { slug: string }) {
  const t = thumbBySlug[slug];
  const [lens, setLens] = useState<Lens>("none");
  const [alt, setAlt] = useState(0);
  const [split, setSplit] = useState(50);
  useEffect(() => {
    useProgress.getState().see(slug);
    useProgress.getState().unlock("lens");
  }, [slug]);
  if (!t) return null;
  const url = thumbUrl(t);
  const hasAlt = !!t.alternates?.length;
  const lenses: [Lens, string][] = [
    ["none", "Clean"],
    ["focal", "Focal point"],
    ["thirds", "Thirds grid"],
    ["value", "Value view"],
    ["squint", "Squint test"],
    ["feed", "Feed preview"],
    ...(hasAlt ? ([["ab", "Draft vs final"]] as [Lens, string][]) : []),
  ];
  const i = thumbnails.findIndex((x) => x.slug === slug);
  const next = thumbnails[(i + 1) % thumbnails.length];
  const filter = lens === "value" ? "grayscale(1) contrast(1.15)" : lens === "squint" ? "blur(6px) saturate(1.2)" : "none";

  return (
    <Modal label={t.title}>
      <Head
        title={
          <span className={`rarity-${t.rarity}`}>
            {t.title} {t.sample && <span className="badge-sample">SAMPLE</span>}
          </span>
        }
      />
      <div className="grid-2">
        <div>
          <div className="chips" style={{ marginBottom: 8 }} role="toolbar" aria-label="Breakdown lens">
            {lenses.map(([id, label]) => (
              <button key={id} className={`mc-btn small ${lens === id ? "selected" : ""}`} aria-pressed={lens === id} onClick={() => setLens(id)} data-autofocus={id === "none" ? true : undefined}>
                {label}
              </button>
            ))}
          </div>
          {lens === "feed" ? (
            <div style={{ display: "grid", gap: 10 }}>
              {(["dark", "light"] as const).map((mode) => (
                <div key={mode} className={`feed ${mode}`}>
                  {[
                    [360, "Home feed (desktop)"],
                    [246, "Suggested (sidebar)"],
                    [168, "Mobile list"],
                  ].map(([w, label]) => (
                    <div key={String(w)} className="card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} width={Number(w)} height={Math.round(Number(w) * 0.5625)} alt="" style={{ borderRadius: 8 }} />
                      <span className="t">{t.title}</span>
                      <span style={{ opacity: 0.6 }}>{label} · {w}px</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="lens">
              {lens === "ab" && t.alternates ? (
                <div
                  className="ab"
                  onPointerMove={(e) => {
                    if (e.buttons !== 1 && e.pointerType === "mouse") return;
                    const r = e.currentTarget.getBoundingClientRect();
                    setSplit(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
                  }}
                  onPointerDown={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setSplit(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Final thumbnail" />
                  <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - split}% 0 0)` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbUrl(t, alt)} alt={`${t.alternates[alt].label}`} />
                  </div>
                  <div className="ab-line" style={{ left: `calc(${split}% - 2px)` }} />
                  <span className="chip" style={{ position: "absolute", left: 8, bottom: 8 }}>
                    {t.alternates[alt].label}
                  </span>
                  <span className="chip gold" style={{ position: "absolute", right: 8, bottom: 8 }}>
                    Final
                  </span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`${t.title} thumbnail`} style={{ filter }} />
              )}
              {lens === "thirds" && <div className="grid3" />}
              {lens === "focal" && <div className="focal" style={{ left: `${t.focal.x * 100}%`, top: `${t.focal.y * 100}%` }} />}
            </div>
          )}
          {lens === "ab" && t.alternates && (
            <div style={{ marginTop: 8 }}>
              <input className="slider" type="range" min={0} max={100} value={split} aria-label="Draft / final split" onChange={(e) => setSplit(Number(e.target.value))} />
              {t.alternates.length > 1 && (
                <div className="chips">
                  {t.alternates.map((a, k) => (
                    <button key={k} className={`mc-btn small ${alt === k ? "selected" : ""}`} onClick={() => setAlt(k)}>
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
              <p className="readable" style={{ fontSize: 14 }}>
                <span className="c-gray">Why it changed:</span> {t.alternates[alt].note}
              </p>
            </div>
          )}
          {lens === "squint" && <p className="c-gray readable" style={{ fontSize: 13 }}>Blur it like a thumb-scroll: if the face and the words still read, the thumbnail works.</p>}
          {lens === "value" && <p className="c-gray readable" style={{ fontSize: 13 }}>Without colour, only contrast is left. Strong thumbnails keep a clear light/dark split.</p>}
        </div>
        <aside className="readable">
          <dl className="lore-list">
            <div>
              <dt>Collection</dt>
              <dd className="c-aqua">{collectionLabels[t.collection]}</dd>
            </div>
            <div>
              <dt>Brief</dt>
              <dd>{t.brief}</dd>
            </div>
            <div>
              <dt>Audience</dt>
              <dd>{t.audience}</dd>
            </div>
            <div>
              <dt>Composition</dt>
              <dd>{t.breakdown.composition}</dd>
            </div>
            <div>
              <dt>Contrast</dt>
              <dd>{t.breakdown.contrast}</dd>
            </div>
            <div>
              <dt>Focal point</dt>
              <dd>{t.breakdown.focalPoint}</dd>
            </div>
            <div>
              <dt>Typography</dt>
              <dd>{t.breakdown.typography}</dd>
            </div>
            {t.result && (
              <div>
                <dt>Result</dt>
                <dd className="c-gold">{t.result}</dd>
              </div>
            )}
          </dl>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button className="mc-btn small" onClick={() => useUi.getState().open({ type: "thumb", slug: next.slug })}>
              Next thumbnail ▶
            </button>
            <button className="mc-btn small" onClick={() => useUi.getState().open({ type: "browse", scope: "thumbs" })}>
              All thumbnails
            </button>
          </div>
        </aside>
      </div>
    </Modal>
  );
}

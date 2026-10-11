"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { projectBySlug, projects, categoryLabels, type VideoProject, type VideoMedia } from "@/content/projects";
import { toolById } from "@/content/tools";
import { dimensionById } from "@/content/dimensions";
import { drawPlaceholderFrame } from "@/engine/placeholders";
import { fmtTime, projectMarkers } from "@/lib/media";
import { useProgress } from "@/state/progress";
import { useUi } from "@/state/ui";
import { ItemIcon } from "@/ui/ItemIcon";
import { Head, Modal } from "./Modal";

type Markers = { cuts: number[]; beats: number[] };

function XRay({ t, duration, markers, onSeek }: { t: number | null; duration: number; markers: Markers; onSeek?: (t: number) => void }) {
  return (
    <div
      className="xray"
      role="slider"
      aria-label="Edit X-Ray timeline: white ticks are cuts, red ticks are beats"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(t ?? 0)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (!onSeek || t === null) return;
        if (e.key === "ArrowRight") onSeek(Math.min(duration, t + 2));
        if (e.key === "ArrowLeft") onSeek(Math.max(0, t - 2));
      }}
      onPointerDown={(e) => {
        if (!onSeek) return;
        const r = e.currentTarget.getBoundingClientRect();
        onSeek(((e.clientX - r.left) / r.width) * duration);
      }}
    >
      {t !== null && <div className="fill" style={{ width: `${(t / duration) * 100}%` }} />}
      {markers.cuts.map((c, i) => (
        <span key={`c${i}`} className="cut" style={{ left: `${(c / duration) * 100}%` }} />
      ))}
      {markers.beats.map((b, i) => (
        <span key={`b${i}`} className="beat" style={{ left: `${(b / duration) * 100}%` }} />
      ))}
      {t !== null && <span className="head" style={{ left: `calc(${(t / duration) * 100}% - 2px)` }} />}
    </div>
  );
}

function PlaceholderPlayer({ p, raw = false, markers, autoPlay = true }: { p: VideoProject; raw?: boolean; markers: Markers; autoPlay?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const tRef = useRef(0);
  const vertical = p.aspect === "9:16";
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (playing) {
        tRef.current = (tRef.current + dt) % p.durationSec;
        setT(tRef.current);
      }
      const c = ref.current;
      if (c) drawPlaceholderFrame(c.getContext("2d")!, c.width, c.height, tRef.current, { title: p.title, palette: p.palette, cuts: raw ? [] : markers.cuts, bpm: raw ? undefined : p.bpm, vertical, raw, sample: p.sample });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, p, raw, markers, vertical]);
  return (
    <div>
      <div className={`player ${vertical ? "r916" : "r169"}`}>
        <canvas ref={ref} width={vertical ? 360 : 640} height={vertical ? 640 : 360} aria-label={`${p.title} — animated stand-in preview`} />
      </div>
      <div className="controls">
        <button className="mc-btn icon" onClick={() => setPlaying((v) => !v)} aria-label={playing ? "Pause" : "Play"}>
          {playing ? "❚❚" : "▶"}
        </button>
        <XRay
          t={t}
          duration={p.durationSec}
          markers={raw ? { cuts: [], beats: [] } : markers}
          onSeek={(x) => {
            tRef.current = x;
            setT(x);
          }}
        />
        <span style={{ fontSize: 12, minWidth: 74, textAlign: "right" }}>
          {fmtTime(t)} / {fmtTime(p.durationSec)}
        </span>
      </div>
    </div>
  );
}

function FilePlayer({ src, p, markers }: { src: string; p: VideoProject; markers: Markers }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(p.durationSec);
  return (
    <div>
      <div className={`player ${p.aspect === "9:16" ? "r916" : "r169"}`}>
        <video ref={ref} src={src} poster={p.media.poster} controls playsInline onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDur(e.currentTarget.duration || p.durationSec)} />
      </div>
      <div className="controls">
        <XRay
          t={t}
          duration={dur}
          markers={markers}
          onSeek={(x) => {
            if (ref.current) ref.current.currentTime = x;
          }}
        />
      </div>
    </div>
  );
}

function YouTubePlayer({ id, p, markers }: { id: string; p: VideoProject; markers: Markers }) {
  const [on, setOn] = useState(false);
  return (
    <div>
      <div className={`player ${p.aspect === "9:16" ? "r916" : "r169"}`}>
        {on ? (
          <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={p.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        ) : (
          <button className="mc-btn" style={{ position: "absolute", inset: 0, margin: "auto", width: 160, height: 56 }} onClick={() => setOn(true)}>
            ▶ Play
          </button>
        )}
      </div>
      <div className="controls">
        <XRay t={null} duration={p.durationSec} markers={markers} />
      </div>
    </div>
  );
}

function Player({ p, media, raw, markers }: { p: VideoProject; media: VideoMedia["full"]; raw?: boolean; markers: Markers }) {
  if (media.kind === "youtube") return <YouTubePlayer id={media.id} p={p} markers={markers} />;
  if (media.kind === "file") return <FilePlayer src={media.src} p={p} markers={markers} />;
  return <PlaceholderPlayer p={p} raw={raw} markers={markers} />;
}

function analyse(p: VideoProject, m: Markers) {
  const n = m.cuts.length;
  const avg = n ? p.durationSec / (n + 1) : p.durationSec;
  let onBeat = 0;
  if (m.beats.length)
    for (const c of m.cuts) {
      let best = Infinity;
      for (const b of m.beats) best = Math.min(best, Math.abs(b - c));
      if (best < 0.09) onBeat++;
    }
  return { n, avg, perMin: (n / p.durationSec) * 60, onBeat: n && m.beats.length ? Math.round((onBeat / n) * 100) : null };
}

export function ProjectFocus({ slug, initialTab }: { slug: string; initialTab?: "watch" | "breakdown" | "raw" }) {
  const p = projectBySlug[slug];
  const [tab, setTab] = useState(initialTab ?? "watch");
  const markers = useMemo(() => (p ? projectMarkers(p) : { cuts: [], beats: [] }), [p]);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!p) return;
    useProgress.getState().see(slug);
    if (slug === "showreel") useProgress.getState().unlock("egg");
  }, [slug, p]);
  if (!p) return null;
  const a = analyse(p, markers);
  const open = projects.filter((x) => !x.locked);
  const next = open.length > 1 ? open[(open.findIndex((x) => x.slug === slug) + 1) % open.length] : null;
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${p.home}/${p.slug}`);
      setCopied(true);
    } catch {}
  };

  return (
    <Modal label={p.title}>
      <Head
        title={
          <span className={`rarity-${p.rarity} ${p.rarity === "epic" ? "glint" : ""}`}>
            {p.title} {p.sample && <span className="badge-sample">SAMPLE</span>}
          </span>
        }
      >
        <button className="mc-btn small hide-m" onClick={share}>
          {copied ? "Link copied!" : "Share"}
        </button>
      </Head>
      <div className="mc-tabs" role="tablist" style={{ marginBottom: 10 }}>
        <button className="mc-btn small" role="tab" aria-selected={tab === "watch"} data-autofocus onClick={() => setTab("watch")} style={tab === "watch" ? { borderColor: "#fff", color: "#ffff55" } : undefined}>
          Watch
        </button>
        <button className="mc-btn small" role="tab" aria-selected={tab === "breakdown"} onClick={() => setTab("breakdown")} style={tab === "breakdown" ? { borderColor: "#fff", color: "#ffff55" } : undefined}>
          Edit Breakdown
        </button>
        {p.media.raw && (
          <button className="mc-btn small" role="tab" aria-selected={tab === "raw"} onClick={() => setTab("raw")} style={tab === "raw" ? { borderColor: "#fff", color: "#ffff55" } : undefined}>
            Raw vs Edit
          </button>
        )}
      </div>
      <div className="grid-2">
        <div>
          {tab === "watch" && <Player p={p} media={p.media.full} markers={markers} />}
          {tab === "raw" && p.media.raw && (
            <div style={{ display: "grid", gridTemplateColumns: p.aspect === "9:16" ? "1fr 1fr" : "1fr", gap: 10 }}>
              <div>
                <p className="c-gray" style={{ margin: "0 0 6px", fontSize: 12 }}>
                  RAW FOOTAGE
                </p>
                <Player p={p} media={p.media.raw} raw markers={{ cuts: [], beats: [] }} />
              </div>
              <div>
                <p className="c-yellow" style={{ margin: "0 0 6px", fontSize: 12 }}>
                  FINAL EDIT
                </p>
                <Player p={p} media={p.media.full} markers={markers} />
              </div>
            </div>
          )}
          {tab === "breakdown" && (
            <div className="readable">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 12 }}>
                {[
                  ["Cuts", String(a.n)],
                  ["Avg shot", `${a.avg.toFixed(2)}s`],
                  ["Cuts / min", a.perMin.toFixed(0)],
                  ["On the beat", a.onBeat === null ? "—" : `${a.onBeat}%`],
                  ["Tempo", p.bpm ? `${p.bpm} BPM` : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="mc-dark" style={{ padding: 10 }}>
                    <div className="c-gray" style={{ fontSize: 12 }}>
                      {k}
                    </div>
                    <div style={{ fontSize: 22 }}>{v}</div>
                  </div>
                ))}
              </div>
              <XRay t={null} duration={p.durationSec} markers={markers} />
              <p className="xray-stats">White ticks = cuts · red ticks = beats. {p.sample ? "Markers on samples are synthetic; real projects get them from cut detection on the source file." : ""}</p>
              <h3 style={{ fontSize: 15 }}>Techniques</h3>
              <div className="chips">
                {p.techniques.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <aside className="readable">
          <p className="prose" style={{ marginTop: 0 }}>
            {p.description}
          </p>
          <dl className="lore-list">
            <div>
              <dt>Platform</dt>
              <dd>{p.platform}</dd>
            </div>
            {p.client && (
              <div>
                <dt>Client</dt>
                <dd className="c-aqua">{p.client}</dd>
              </div>
            )}
            <div>
              <dt>Role</dt>
              <dd>{p.role}</dd>
            </div>
            <div>
              <dt>Date · Length</dt>
              <dd>
                {p.date} · {fmtTime(p.durationSec)}
              </dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{p.categories.map((c) => categoryLabels[c]).join(", ")}</dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd className="chips">
                {p.tools.map((t) => (
                  <span key={t} className="chip">
                    <ItemIcon id={toolById[t].sprite} size={16} /> {toolById[t].name}
                  </span>
                ))}
              </dd>
            </div>
            {p.stats?.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd className="c-gold">{s.value}</dd>
              </div>
            ))}
            <div>
              <dt>Lives in</dt>
              <dd>{dimensionById[p.home].name}</dd>
            </div>
          </dl>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {next && (
              <button className="mc-btn small" onClick={() => useUi.getState().open({ type: "project", slug: next.slug })}>
                Next edit ▶
              </button>
            )}
            <button className="mc-btn small" onClick={() => useUi.getState().open({ type: "browse", scope: "videos" })}>
              All edits
            </button>
          </div>
        </aside>
      </div>
    </Modal>
  );
}

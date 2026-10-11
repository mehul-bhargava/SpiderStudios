"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useUi, type Overlay } from "@/state/ui";
import { useSettings } from "@/state/settings";
import { projects } from "@/content/projects";
import { posterUrl } from "@/lib/posters";

export function OpenButton({ overlay, children, className = "work-card", label }: { overlay: Overlay; children: ReactNode; className?: string; label?: string }) {
  return (
    <button className={className} aria-label={label} onClick={() => useUi.getState().open(overlay)}>
      {children}
    </button>
  );
}

export function ModeToggle() {
  const webgl = useUi((s) => s.webgl);
  if (!webgl) return <span className="c-gray" style={{ fontSize: 12 }}>3D unavailable on this device</span>;
  return (
    <button className="mc-btn small" onClick={() => useSettings.getState().set({ mode: "3d" })}>
      Enter the 3D world
    </button>
  );
}

export function ClientPoster({ slug }: { slug: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const p = projects.find((x) => x.slug === slug);
    if (p) setSrc(posterUrl(p));
  }, [slug]);
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" /> : null;
}

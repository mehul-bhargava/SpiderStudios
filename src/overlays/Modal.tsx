"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useUi } from "@/state/ui";

export function Modal({ label, children, size = "", variant = "dark", onClose }: { label: string; children: ReactNode; size?: "" | "narrow" | "mid"; variant?: "dark" | "panel" | "bare"; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = onClose ?? (() => useUi.getState().close());
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const first = el?.querySelector<HTMLElement>("[data-autofocus]") ?? el?.querySelector<HTMLElement>("button, a[href], input, textarea, select");
    first?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !el) return;
      const f = [...el.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input, textarea, select, [tabindex='0']")].filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const a = f[0];
      const b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        b.focus();
      } else if (!e.shiftKey && document.activeElement === b) {
        e.preventDefault();
        a.focus();
      }
    };
    window.addEventListener("keydown", trap);
    return () => {
      window.removeEventListener("keydown", trap);
      prev?.focus?.();
    };
  }, []);
  const cls = variant === "dark" ? "mc-dark" : variant === "panel" ? "mc-panel" : "";
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={label} onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div ref={ref} className={`overlay-box ${size} ${cls}`}>
        {children}
      </div>
    </div>
  );
}

export function Head({ title, children, onClose, className = "" }: { title: ReactNode; children?: ReactNode; onClose?: () => void; className?: string }) {
  const close = onClose ?? (() => useUi.getState().close());
  return (
    <div className="overlay-head">
      <h2 className={className}>{title}</h2>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {children}
        <button className="mc-btn icon close-x" onClick={close} aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  );
}

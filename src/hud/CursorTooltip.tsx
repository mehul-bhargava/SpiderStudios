"use client";
import { useEffect, useRef } from "react";
import { useUi } from "@/state/ui";

export function CursorTooltip() {
  const tip = useUi((s) => s.tooltip);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      let x = e.clientX + 16;
      let y = e.clientY - h - 8;
      if (x + w > window.innerWidth - 8) x = e.clientX - w - 16;
      if (y < 8) y = e.clientY + 20;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  if (!tip) return null;
  return (
    <div ref={ref} className="cursor-tip" style={{ left: 0, top: 0 }}>
      <div className="mc-tooltip">
        <div className={tip.rarity ? `rarity-${tip.rarity}` : ""} style={tip.color ? { color: tip.color } : undefined}>
          {tip.title}
        </div>
        {tip.lore?.filter(Boolean).map((l, i) => (
          <div key={i} className="lore">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

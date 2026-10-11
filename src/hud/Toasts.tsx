"use client";
import { useEffect, useState } from "react";
import { useUi } from "@/state/ui";
import { advancementById } from "@/content/advancements";
import { ItemIcon } from "@/ui/ItemIcon";

function ToastItem({ k, id }: { k: number; id: string }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    const a = window.setTimeout(() => setOut(true), 4200);
    const b = window.setTimeout(() => useUi.getState().dropToast(k), 4600);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [k]);
  const adv = advancementById[id];
  if (!adv) return null;
  const head = adv.kind === "challenge" ? "Challenge Complete!" : adv.kind === "goal" ? "Goal Reached!" : "Advancement Made!";
  return (
    <div className={`toast ${adv.kind === "challenge" ? "challenge" : ""} ${out ? "out" : ""}`} role="status">
      <ItemIcon id={adv.icon} size={32} />
      <div>
        <b>{head}</b>
        <span>{adv.name}</span>
      </div>
    </div>
  );
}

export function Toasts() {
  const toasts = useUi((s) => s.toasts);
  return (
    <div className="toasts" aria-live="polite">
      {toasts.slice(0, 3).map((t) => (
        <ToastItem key={t.key} k={t.key} id={t.id} />
      ))}
    </div>
  );
}

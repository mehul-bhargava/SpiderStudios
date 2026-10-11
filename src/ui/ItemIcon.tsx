"use client";
import { useEffect, useState } from "react";
import { iconUrl } from "@/engine/sprites";

export function ItemIcon({ id, size = 32, alt = "", className = "" }: { id: string; size?: number; alt?: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    setSrc(iconUrl(id));
  }, [id]);
  if (!src) return <span aria-hidden="true" style={{ display: "inline-block", width: size, height: size }} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} width={size} height={size} alt={alt} className={`px ${className}`} draggable={false} />;
}

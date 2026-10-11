import { thumbBySlug } from "@/content/thumbnails";
import { thumbSvg } from "@/engine/placeholders";

// Generated stand-in thumbnails (replaced automatically once `image` is set in content).
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const t = thumbBySlug[slug];
  if (!t) return new Response("Not found", { status: 404 });
  const alt = new URL(req.url).searchParams.get("alt");
  const art = alt !== null ? t.alternates?.[Number(alt)]?.art ?? t.art : t.art;
  const svg = thumbSvg(art, { sample: t.sample, seed: slug + (alt ?? "") });
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" },
  });
}

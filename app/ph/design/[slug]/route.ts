import { designs } from "@/content/designs";
import { designSvg } from "@/engine/placeholders";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const d = designs.find((x) => x.slug === slug);
  if (!d) return new Response("Not found", { status: 404 });
  return new Response(designSvg(d), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" },
  });
}

import { site } from "@/content/site";

// Contact endpoint. Sends via Resend when RESEND_API_KEY is set; otherwise the
// client falls back to a pre-filled mailto: so no enquiry is ever lost.
const hits = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;
const LIMIT = 5;

const json = (data: unknown, status = 200) => Response.json(data, { status });
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[<>]/g, "").trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Bad request." }, 400);
  }

  // spam traps: honeypot field + inhumanly fast submissions get a silent "ok"
  if (clean(body.company, 100) || (typeof body.elapsed === "number" && body.elapsed < 2500)) return json({ ok: true });

  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const message = clean(body.message, 5000);
  const types = Array.isArray(body.types) ? body.types.map((t) => clean(t, 40)).filter(Boolean).slice(0, 6) : [];
  const budget = clean(body.budget, 80);
  const timeline = clean(body.timeline, 80);
  const link = clean(body.link, 500);

  if (name.length < 2) return json({ ok: false, error: "Please add your name." }, 422);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: "That email doesn't look right." }, 422);
  if (message.length < 10) return json({ ok: false, error: "Message is too short." }, 422);

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length >= LIMIT) return json({ ok: false, error: "Too many messages — please try again in a few minutes." }, 429);
  hits.set(ip, [...recent, now]);

  const key = process.env.RESEND_API_KEY;
  if (!key) return json({ ok: false, fallback: true });

  const text = [
    `New project enquiry from the SpiderStudios portfolio`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Project: ${types.join(", ") || "—"}`,
    `Budget: ${budget || "—"}`,
    `Timeline: ${timeline || "—"}`,
    `Reference: ${link || "—"}`,
    ``,
    message,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM ?? "SpiderStudios <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO ?? site.email],
        reply_to: email,
        subject: `Project enquiry: ${name}${types.length ? ` (${types.join(", ")})` : ""}`,
        text,
      }),
    });
    if (!res.ok) return json({ ok: false, fallback: true });
    return json({ ok: true });
  } catch {
    return json({ ok: false, fallback: true });
  }
}

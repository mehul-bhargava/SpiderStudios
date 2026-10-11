import { after } from "next/server";
import { site } from "@/content/site";

// Contact endpoint. Sends through EmailJS (server-side, private key) when it is configured;
// otherwise the client falls back to a pre-filled mailto: so no enquiry is ever lost.
//
// Two emails per enquiry:
//   1. notification  -> Mehul   (template: EMAILJS_TEMPLATE_NOTIFY)
//   2. auto-reply    -> visitor (template: EMAILJS_TEMPLATE_REPLY), sent after the response, best-effort
const hits = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;
const LIMIT = 5;

const EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";
const EMAILJS_GAP = 1100; // EmailJS allows 1 request / second

// ids from the ContactBook form -> human labels for the email
const TYPE_LABELS: Record<string, string> = {
  thumbnail: "Thumbnails",
  video: "Video edit",
  shorts: "Shorts / Reels pack",
  branding: "Branding / social",
  website: "Website / UI",
  other: "Something else",
};

const json = (data: unknown, status = 200) => Response.json(data, { status });
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[<>]/g, "").trim().slice(0, max) : "");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function sendEmailJS(templateId: string, templateParams: Record<string, string>) {
  const res = await fetch(EMAILJS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: templateParams,
    }),
  });
  return res.ok;
}

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
  const typeIds = Array.isArray(body.types) ? body.types.map((t) => clean(t, 40)).filter(Boolean).slice(0, 6) : [];
  const types = typeIds.map((t) => TYPE_LABELS[t] ?? t);
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

  const { EMAILJS_SERVICE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY, EMAILJS_TEMPLATE_NOTIFY, EMAILJS_TEMPLATE_REPLY } = process.env;
  if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY || !EMAILJS_TEMPLATE_NOTIFY) return json({ ok: false, fallback: true });

  // Variable names here must match the {{placeholders}} in the two EmailJS templates.
  const params = {
    name,
    email,
    reply_to: email,
    to_email: email,
    project_types: types.join(", ") || "—",
    budget: budget || "—",
    timeline: timeline || "—",
    link: link || "—",
    message,
    time: `${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST`,
    owner: site.owner,
    response_time: site.responseTime,
    site_url: site.url,
  };

  try {
    const ok = await sendEmailJS(EMAILJS_TEMPLATE_NOTIFY, params);
    if (!ok) return json({ ok: false, fallback: true });
  } catch {
    return json({ ok: false, fallback: true });
  }

  // Visitor auto-reply: runs after the response is sent, so the form doesn't wait on it.
  // If it fails the enquiry is still safely delivered, so we just swallow the error.
  if (EMAILJS_TEMPLATE_REPLY) {
    after(async () => {
      try {
        await sleep(EMAILJS_GAP);
        await sendEmailJS(EMAILJS_TEMPLATE_REPLY, params);
      } catch {}
    });
  }

  return json({ ok: true });
}

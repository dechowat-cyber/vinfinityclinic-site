import crypto from "node:crypto";
import { q, one } from "./db";
import { getSettings, type ClinicSettings } from "./settings";
import { availableSlots, book } from "./booking";
import { ensureLead, logTouch, recordConsent } from "./crm";
import { notifyStaff } from "./notify";
import { deepLink } from "./source";
import { newVisitCode } from "./attribution";
import { todayBkk, addDays, parts, thaiDate, thaiTime } from "./time";

// Web chat ("น้องวิน" on vinfinityclinic.com): answers from the site's own content, and hands booking to
// a deterministic form (slots + name + phone + consent) — the model never books or stores anything itself.
// Conversations are not stored; only a booking creates a client, a lead and an appointment.

export const ORIGINS = ["https://vinfinityclinic.com", "https://www.vinfinityclinic.com"];
export const cors = (req: Request): Record<string, string> => {
  const o = req.headers.get("origin");
  const ok = !!o && (ORIGINS.includes(o) || (process.env.VERCEL_ENV !== "production" && /^http:\/\/localhost(:\d+)?$/.test(o)));
  return ok ? { "Access-Control-Allow-Origin": o!, Vary: "Origin", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" } : {};
};

const KB_URL = "https://vinfinityclinic.com/kb.txt";
const g = globalThis as unknown as { __kb?: { text: string; at: number } };
/** The clinic's facts, prices, programs and FAQ, generated from the website at build time (kb.txt). Cached 30 min. */
export async function knowledge(fetcher: typeof fetch = fetch) {
  if (g.__kb && Date.now() - g.__kb.at < 30 * 60_000) return g.__kb.text;
  try {
    const r = await fetcher(KB_URL, { cache: "no-store" });
    if (r.ok) { const text = (await r.text()).slice(0, 60_000); g.__kb = { text, at: Date.now() }; return text; }
  } catch (e) { console.error("[webchat] kb", e); }
  return g.__kb?.text ?? "";
}

export function systemPrompt(kb: string, s: ClinicSettings, now = new Date()) {
  const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  const hours = days.map((d, i) => `${d} ${s.hours[i] ? `${s.hours[i]!.open}–${s.hours[i]!.close}` : "ปิด"}`).join(", ");
  return `You are "น้องวิน" (Nong Win), the friendly AI assistant mascot on the website of ${s.clinicName}, an aesthetic medicine clinic in Udon Thani, Thailand.
Today is ${thaiDate(now)} (${todayBkk(now)}), time ${thaiTime(now)} Bangkok. Opening hours: ${hours}. Phone ${s.phone}. LINE @vinfinityclinic.

How you answer
- Reply in the visitor's language (Thai by default; English or Lao if they write in it). Thai: polite, warm, female particle "ค่ะ/คะ", short. 1–4 short sentences, plain text, no markdown headings, at most a short list.
- Use ONLY the clinic information below. If something is not in it (a price, a product, a promotion, a schedule), say you are not sure and the team will confirm on LINE @vinfinityclinic or by phone. Never invent prices, promotions, doctors or results.
- You are an AI assistant, not a doctor or a person. You do not diagnose, recommend doses or say whether a treatment suits someone; the doctor assesses every case before treatment. Say results vary from person to person when talking about results.
- Never use: ดีที่สุด, อันดับ 1, 100%, การันตี, หายขาด, เห็นผลทันที, ถาวร, ไม่เจ็บ, เชี่ยวชาญ, ปลอดภัย 100% (English: best, guaranteed, permanent, instant, painless, expert, risk-free). Do not name botulinum toxin brands.
- Do not ask for health details, ID numbers or photos here. If someone describes pain, swelling, skin turning pale/blue, vision change, fever or another problem after a treatment: tell them to contact the clinic right now (phone ${s.phone}) and, if severe, go to the nearest hospital or call 1669.
- Off-topic or unsafe requests: politely steer back to the clinic.

Booking
- When the visitor wants to book, see the doctor, or asks about free times, say one short line and put the tag [[BOOK]] at the very end of your reply. If they named a day, use [[BOOK:YYYY-MM-DD]]. The website then shows free times and a short form; you never collect their name or phone in chat.
- A first consultation with the doctor is the usual first step.

Clinic information (from the website)
${kb || "(not available right now — answer only with the hours, phone and LINE above, and offer booking)"}`;
}

/** Calls the model (lib/ai.ts: Anthropic key or Vercel AI Gateway). */
export async function complete(system: string, messages: { role: "user" | "assistant"; content: string }[]) {
  if (process.env.WEBCHAT_FAKE === "1" && process.env.VERCEL_ENV !== "production") { // local UI testing without a model
    const last = messages[messages.length - 1].content;
    return /จอง|นัด|book/i.test(last) ? "ได้เลยค่ะ เลือกเวลาที่สะดวกด้านล่างนะคะ [[BOOK]]" : `น้องวินตอบ (ทดสอบ): ${last}`;
  }
  const { askAI } = await import("./ai");
  return askAI({ system, messages, fast: true, maxTokens: 500, temperature: 0.3 });
}

const BANNED = /ดีที่สุด|อันดับ\s?1|100\s?%|การันตี|หายขาด|เห็นผลทันที|ไม่เจ็บเลย|\bguarantee[ds]?\b|\bpainless\b|\brisk-free\b/gi;
/** Splits the booking tag off the reply and softens any banned claim that slipped through. */
export function parseReply(text: string): { reply: string; book: null | { date: string | null } } {
  const m = text.match(/\[\[BOOK(?::(\d{4}-\d{2}-\d{2}))?\]\]/);
  const reply = text.replace(/\[\[BOOK(?::[^\]]*)?\]\]/g, "").replace(BANNED, "").replace(/\*\*/g, "").replace(/[ \t]+\n/g, "\n").trim();
  return { reply, book: m ? { date: m[1] ?? null } : null };
}

/** Small abuse guard: per-visitor and whole-site daily caps. Only a salted hash of the IP is stored. */
export async function allow(ip: string, now = new Date(), perIp = 60, perDay = 3000) {
  await q("create table if not exists webchat_usage (k text not null, day date not null, n int not null default 0, primary key (k, day))");
  const day = todayBkk(now);
  const k = crypto.createHash("sha256").update(`${process.env.SESSION_SECRET || "vf"}|${ip}`).digest("hex").slice(0, 32);
  const r = await one("insert into webchat_usage(k, day, n) values ($1,$2,1) on conflict (k, day) do update set n = webchat_usage.n + 1 returning n", [k, day]);
  const t = await one("insert into webchat_usage(k, day, n) values ('*',$1,1) on conflict (k, day) do update set n = webchat_usage.n + 1 returning n", [day]);
  return Number(r?.n) <= perIp && Number(t?.n) <= perDay;
}

/** Free consult times for the widget: the next open days (or one day), a handful of times each. */
export async function freeDays(s: ClinicSettings, now = new Date(), from?: string | null, days = 5, perDay = 8) {
  const out: { date: string; label: string; times: { time: string; start: string }[] }[] = [];
  let d = from && /^\d{4}-\d{2}-\d{2}$/.test(from) && from >= todayBkk(now) ? from : todayBkk(now);
  for (let i = 0; i < s.horizonDays && out.length < days; i++, d = addDays(d, 1)) {
    const free = (await availableSlots(d, s, s.doctors[0], now)).filter((x) => x.available);
    if (free.length) out.push({ date: d, label: thaiDate(new Date(`${d}T12:00:00+07:00`)), times: free.slice(0, perDay).map((x) => ({ time: x.time, start: x.start })) });
  }
  return out;
}

export const normPhone = (p: string) => {
  const d = String(p || "").replace(/[^0-9]/g, "");
  return /^66\d{8,9}$/.test(d) ? "0" + d.slice(2) : d;
};

/** Booking from the website form. Requires the data consent box; links to LINE later through the visit code. */
export async function webBook(o: { name: string; phone: string; start: string; interest?: string; consent: boolean; marketing?: boolean; now?: Date }) {
  const now = o.now ?? new Date();
  const s = await getSettings();
  const name = String(o.name || "").trim().slice(0, 80), phone = normPhone(o.phone), interest = String(o.interest || "").trim().slice(0, 200);
  if (!o.consent) throw new Error("consent_required");
  if (name.length < 2) throw new Error("bad_name");
  if (!/^0\d{8,9}$|^856\d{8,10}$|^20\d{8}$/.test(phone)) throw new Error("bad_phone");
  let c = await one<{ id: number }>("select id from clients where phone_norm = $1 order by line_user_id is null, id limit 1", [phone]);
  if (!c) c = await one<{ id: number }>("insert into clients(name, phone, source, followed) values ($1,$2,'web',false) returning id", [name, phone]);
  const id = Number(c!.id);
  await q("update clients set name = coalesce(name, $2) where id = $1", [id, name]);
  await recordConsent(id, "data", true, s.consentVersion, "web");
  if (typeof o.marketing === "boolean") await recordConsent(id, "marketing", o.marketing, s.consentVersion, "web");
  await ensureLead(id, "web", interest ? `แชทเว็บ: ${interest}` : "แชทเว็บ");
  const apptId = await book({ clientId: id, startIso: o.start, s, source: "webchat", note: interest ? `จากแชทบนเว็บ · ${interest}` : "จากแชทบนเว็บ", createdBy: "client", now });
  await logTouch(id, "in", "webchat_booking", interest || null, "web");
  const code = newVisitCode();
  await q("insert into web_visits(code, src, landing, client_id, matched_at) values ($1,'web','webchat',$2,now()) on conflict (code) do nothing", [code, id]);
  const when = new Date(o.start);
  await notifyStaff(`📅 นัดใหม่จากแชทบนเว็บ\n${thaiDate(when)} ${thaiTime(when)}\nโทรยืนยันกับลูกค้า: ${process.env.APP_URL || ""}/staff/clients/${id}`, `webbook:${apptId}`);
  return { apptId, clientId: id, date: parts(when).date, when: `${thaiDate(when)} ${thaiTime(when)}`, lineUrl: deepLink("web", undefined, code) };
}

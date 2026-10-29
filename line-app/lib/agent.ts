import { q, one } from "./db";
import { getSettings, type ClinicSettings } from "./settings";
import { nextFreeSlots, isAck } from "./webhook";
import { askAI, aiConfigured } from "./ai";
import { knowledge, systemPrompt } from "./webchat";
import { thaiDate, thaiTime } from "./time";
import { bookUrl } from "./link";

// Lead agent: drafts the next message for every lead, in the lead's own language, so the team only reviews and sends.
// It never sends by itself. With an AI key it writes from the website's facts; without one it uses safe templates
// (greeting + three free times), so it works from day one and gets better when ANTHROPIC_API_KEY is added.

export type Lang = "th" | "en" | "lo" | "zh" | "ja" | "ko" | "ru" | "vi";
export const LANG_LABEL: Record<Lang, string> = { th: "ไทย", en: "EN", lo: "ລາວ", zh: "中文", ja: "日本語", ko: "한국어", ru: "RU", vi: "VI" };

/** Script-based guess; Thai wins when the message mixes Thai and English words. */
export function detectLang(text: string): Lang | null {
  const t = text.replace(/https?:\/\/\S+|[@#]\S+/g, "");
  if (/[฀-๿]/.test(t)) return "th";
  if (/[຀-໿]/.test(t)) return "lo";
  if (/[぀-ヿ]/.test(t)) return "ja";
  if (/[가-힯]/.test(t)) return "ko";
  if (/[一-鿿]/.test(t)) return "zh";
  if (/[Ѐ-ӿ]/.test(t)) return "ru";
  if (/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(t)) return "vi";
  if ((t.match(/[a-z]/gi) || []).length >= 3) return "en";
  return null;
}

const fmt = (iso: string, lang: Lang) => {
  const d = new Date(iso);
  if (lang === "th" || lang === "lo") return `${thaiDate(d).replace(/^วัน/, "")} ${thaiTime(d).replace(/\s*น\.?$/, "")} น.`;
  return d.toLocaleString(lang === "zh" ? "zh-CN" : lang === "ja" ? "ja-JP" : lang === "ko" ? "ko-KR" : "en-GB",
    { timeZone: "Asia/Bangkok", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

/** Template draft (no AI): safe in every language; never quotes a price or a medical opinion. */
export function templateDraft(o: { lang: Lang; kind: "reply" | "nudge"; name?: string | null; slots: string[]; link: string }) {
  const k = o.name ? (/^(คุณ|คุน|K\.|น้อง|พี่)/i.test(o.name.trim()) ? ` ${o.name.trim()}` : ` คุณ${o.name.trim()}`) : "";
  const s = o.slots.map((x) => `• ${fmt(x, o.lang)}`).join("\n");
  const th = o.kind === "reply"
    ? `สวัสดีค่ะ${k} ขอบคุณที่ทักมานะคะ 😊 สนใจปรึกษาเรื่องไหนเป็นพิเศษคะ คุณหมอจะประเมินและวางแผนให้ก่อนทุกครั้งค่ะ\n\nคิวว่างใกล้ๆ นี้${s ? `\n${s}` : " สอบถามได้เลยค่ะ"}\n\nสะดวกเวลาไหนบอกได้เลย หรือจองเองที่ ${o.link}`
    : `สวัสดีค่ะ${k} ยังสนใจนัดปรึกษาคุณหมออยู่ไหมคะ ช่วงนี้มีคิวว่าง${s ? `\n${s}` : ""}\n\nตอบกลับเวลาที่สะดวกได้เลยค่ะ หรือจองเองที่ ${o.link}`;
  const en = o.kind === "reply"
    ? `Hello${o.name ? ` ${o.name}` : ""}, thank you for contacting Vinfinity Clinic 😊 What would you like to consult about? The doctor assesses every case and plans the treatment with you first.\n\nUpcoming free times${s ? `\n${s}` : ": please ask us"}\n\nJust reply with the time that suits you, or book here: ${o.link}`
    : `Hello${o.name ? ` ${o.name}` : ""}, are you still interested in a consultation with our doctor? We have free times soon${s ? `\n${s}` : ""}\n\nReply with a time that suits you, or book here: ${o.link}`;
  const zh = o.kind === "reply"
    ? `您好${o.name ? ` ${o.name}` : ""}，感谢联系 Vinfinity Clinic 😊 请问您想咨询哪方面呢？医生会先为您评估并制定方案。\n\n近期可预约时间${s ? `\n${s}` : ""}\n\n请回复方便的时间，或在此预约：${o.link}`
    : `您好${o.name ? ` ${o.name}` : ""}，请问您还想预约医生咨询吗？近期有空档${s ? `\n${s}` : ""}\n\n请回复方便的时间，或在此预约：${o.link}`;
  return o.lang === "th" || o.lang === "lo" ? th : o.lang === "zh" ? zh : en; // other languages: English until the AI is on
}

const AGENT_RULES = (kind: "reply" | "nudge", lang: Lang) => `
You are now drafting a LINE chat message that a clinic team member will review and send as the clinic (not as "น้องวิน").
- Write in ${lang === "th" ? "Thai" : `the customer's language (${LANG_LABEL[lang]})`}, warm and short (2–5 short lines), plain text, no markdown.
- ${kind === "reply" ? "Answer what the customer asked, using only the clinic information. If a price or detail is not in it, say the team will confirm." : "This is a gentle follow-up to someone who has not booked yet. One soft nudge, no pressure, no discount unless it is in the clinic information."}
- Offer up to three of the free times given below as concrete options, and the booking link.
- Never diagnose, never say a treatment suits them, never promise results. Medical questions: the doctor will assess at the consultation.
- Output only the message text.`;

/** Three real choices instead of 10:00 / 10:30 / 11:00: at least 3 hours apart, so they usually fall on different days or parts of the day. */
export function spread(starts: string[], n = 3) {
  const out: string[] = [];
  for (const x of starts) if (out.every((y) => Math.abs(new Date(x).getTime() - new Date(y).getTime()) >= 3 * 3600e3)) { out.push(x); if (out.length >= n) break; }
  return out;
}

/** Builds and stores a draft for this client (pending drafts for them are replaced). Returns the draft id or null. */
export async function draftFor(clientId: number, kind: "reply" | "nudge" = "reply", now = new Date(), s?: ClinicSettings) {
  s = s ?? (await getSettings());
  const c = await one("select id, name, display_name, line_user_id, language from clients where id = $1", [clientId]);
  if (!c?.line_user_id) return null;
  const hist = (await q(`select direction, kind, body, created_at from touchpoints where client_id = $1 and kind = 'message' and body is not null
      order by created_at desc limit 8`, [clientId])).reverse();
  const lastIn = [...hist].reverse().find((h) => h.direction === "in");
  if (kind === "reply" && (!lastIn || isAck(String(lastIn.body)) || /^\[\w+\]$/.test(String(lastIn.body)))) return null;
  const lang: Lang = (detectLang(String(lastIn?.body || "")) || (c.language as Lang) || "th");
  if (lang !== "th" && c.language !== lang) await q("update clients set language = $2 where id = $1", [clientId, lang]);
  const slots = spread((await nextFreeSlots(s, now, s.doctors[0], 24)).map((x) => x.start), 3);
  const link = bookUrl(c.line_user_id, { src: `agent_${kind}` });
  const name = c.name || c.display_name || null;
  let text = "", engine = "template";
  if (aiConfigured()) {
    try {
      const kb = await knowledge();
      const free = slots.map((x) => fmt(x, lang)).join(" / ") || "(none in the next days — ask them which day suits)";
      const convo = hist.map((h) => `${h.direction === "in" ? "Customer" : "Clinic"}: ${String(h.body).slice(0, 400)}`).join("\n");
      text = (await askAI({ system: systemPrompt(kb, s, now) + AGENT_RULES(kind, lang), fast: true, maxTokens: 500, temperature: 0.3,
        messages: [{ role: "user", content: `Customer name: ${name ?? "-"}\nFree times: ${free}\nBooking link: ${link}\n\nConversation so far:\n${convo || "(none)"}\n\nWrite the ${kind === "reply" ? "reply" : "follow-up"}.` }] })).trim();
      if (text) engine = "ai";
    } catch (e) { console.error("[agent] ai", (e as Error).message); text = ""; }
  }
  if (!text) text = templateDraft({ lang, kind, name, slots, link });
  await q("update agent_drafts set status = 'superseded' where client_id = $1 and status = 'pending'", [clientId]);
  const d = await one(`insert into agent_drafts(client_id, kind, lang, body, engine, slots) values ($1,$2,$3,$4,$5,$6) returning id`,
    [clientId, kind, lang, text.slice(0, 1800), engine, JSON.stringify(slots)]);
  return Number(d!.id);
}

/** Proactive: leads the team already answered, who went quiet 20 h – 7 days without booking → one follow-up draft each. */
export async function nudgeTick(now = new Date(), limit = 30) {
  const rows = await q(`select l.client_id from leads l join clients c on c.id = l.client_id
    where l.status in ('New','Contacted','Qualified') and c.line_user_id is not null and c.followed
      and l.last_inbound_at between $1 and $2 and l.replied_at is not null and l.replied_at >= l.last_inbound_at
      and not exists (select 1 from appointments a where a.client_id = l.client_id and a.start_at >= $3 and a.status not in ('cancelled','no_show'))
      and not exists (select 1 from agent_drafts d where d.client_id = l.client_id and d.created_at > $4)
    order by l.last_inbound_at desc limit $5`,
    [new Date(now.getTime() - 7 * 864e5).toISOString(), new Date(now.getTime() - 20 * 3600e3).toISOString(), now.toISOString(),
      new Date(now.getTime() - 3 * 864e5).toISOString(), limit]);
  let n = 0;
  for (const r of rows) if (await draftFor(Number(r.client_id), "nudge", now).catch((e) => { console.error("[agent] nudge", e); return null; })) n++;
  return n;
}

export async function pendingDrafts(limit = 50) {
  return q(`select d.*, c.name, c.display_name, c.line_user_id, c.phone,
      (select body from touchpoints t where t.client_id = c.id and t.direction = 'in' and t.kind = 'message' order by t.created_at desc limit 1) as last_in
    from agent_drafts d join clients c on c.id = d.client_id where d.status = 'pending' order by d.created_at desc limit $1`, [limit]);
}

/** Leads in the last 7 days by language: the "foreign patients are rising" number. */
export async function leadLangStats(now = new Date()) {
  return q(`select coalesce(c.language, 'th') lang, count(*)::int n from leads l join clients c on c.id = l.client_id
    where l.created_at > $1 group by 1 order by 2 desc`, [new Date(now.getTime() - 7 * 864e5).toISOString()]);
}

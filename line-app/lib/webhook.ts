import { q, one } from "./db";
import { getSettings, ClinicSettings, saveSettings } from "./settings";
import { upsertClientByLine, markInbound, logTouch, recordConsent, consentState, getClientByLine } from "./crm";
import { setStatus } from "./booking";
import * as line from "./line";
import * as M from "./messages";
import { parts, minutes } from "./time";

export function isOpen(s: ClinicSettings, now = new Date()) {
  const p = parts(now);
  const h = s.hours[p.weekday];
  if (!h || s.closedDates.includes(p.date)) return false;
  const m = minutes(p.time);
  return m >= minutes(h.open) && m < minutes(h.close);
}

type Ev = Record<string, any>;
type Out = { replyToken: string; messages: line.Msg[] };

/** Handles one LINE event and returns what to reply (sending is done by the caller). */
export async function handleEvent(ev: Ev, now = new Date(), s?: ClinicSettings): Promise<Out | null> {
  s = s ?? (await getSettings());
  const src = ev.source || {};

  // Bot added to a group: remember it as a candidate staff group (BM confirms in settings).
  if (ev.type === "join" && src.groupId) {
    await q(`insert into settings(key, value) values ('candidate_group', $1)
             on conflict (key) do update set value = excluded.value, updated_at = now()`, [JSON.stringify({ groupId: src.groupId, at: now })]);
    return { replyToken: ev.replyToken, messages: [{ type: "text", text: "ระบบ Vinfinity พร้อมแจ้งเตือนในกลุ่มนี้แล้ว ให้ผู้จัดการสาขากดยืนยันกลุ่มในหน้าตั้งค่าของระบบค่ะ" }] };
  }
  if (src.type !== "user" || !src.userId) return null; // ignore other group chatter
  const userId = src.userId as string;

  if (ev.type === "unfollow") {
    await q("update clients set followed = false where line_user_id = $1", [userId]);
    return null;
  }

  if (ev.type === "follow") {
    const prof = await line.profile(userId);
    const c = await upsertClientByLine(userId, prof ?? {});
    await markInbound(c.id);
    await logTouch(c.id, "in", "follow");
    const st = await consentState(c.id);
    const msgs = st.data === undefined ? M.welcome(s) : [M.welcome(s)[0], M.bookingPrompt(userId)];
    await logTouch(c.id, "out", "welcome");
    return { replyToken: ev.replyToken, messages: msgs };
  }

  const c = (await getClientByLine(userId)) ?? (await upsertClientByLine(userId, (await line.profile(userId)) ?? {}));

  if (ev.type === "postback") {
    const p = new URLSearchParams(ev.postback?.data || "");
    if (p.get("consent")) {
      const type = p.get("consent") === "marketing" ? "marketing" : "data";
      const yes = p.get("v") === "1";
      await recordConsent(c.id, type, yes, s.consentVersion);
      await logTouch(c.id, "in", `consent_${type}_${yes ? "yes" : "no"}`);
      if (type === "data") return { replyToken: ev.replyToken, messages: yes ? [M.marketingAsk()] : [M.declinedDataReply(), M.marketingAsk()] };
      return { replyToken: ev.replyToken, messages: [M.thanksMarketing(yes), M.bookingPrompt(userId)] };
    }
    if (p.get("menu") === "book") return { replyToken: ev.replyToken, messages: [M.bookingPrompt(userId)] };
    if (p.get("menu") === "my") return { replyToken: ev.replyToken, messages: [M.myPrompt(userId)] };
    if (p.get("appt") === "confirm") {
      const a = await one(`select * from appointments where id = $1 and client_id = $2`, [Number(p.get("id")), c.id]);
      if (!a || !["booked", "confirmed"].includes(a.status)) {
        return { replyToken: ev.replyToken, messages: [{ type: "text", text: "ไม่พบนัดนี้แล้วค่ะ ดูนัดล่าสุดได้ที่เมนู นัดของฉัน นะคะ" }] };
      }
      await setStatus(a.id, "confirmed", "confirmed_at");
      await logTouch(c.id, "in", "appt_confirm", String(a.id));
      return { replyToken: ev.replyToken, messages: [M.confirmedReply(a as any)] };
    }
    return null;
  }

  if (ev.type === "message") {
    const text: string = ev.message?.type === "text" ? ev.message.text : `[${ev.message?.type}]`;
    await markInbound(c.id);
    await logTouch(c.id, "in", "message", text);
    const msgs: line.Msg[] = [];
    if (/จอง|นัด|คิว|book/i.test(text) && text.length < 40) msgs.push(M.bookingPrompt(userId));
    if (!isOpen(s, now)) {
      // FR-08: at most one off-hours reply per person per 12 hours
      const recent = await one(`select 1 from touchpoints where client_id = $1 and kind = 'off_hours' and created_at > $2`,
        [c.id, new Date(now.getTime() - 12 * 3600_000).toISOString()]);
      if (!recent) {
        await logTouch(c.id, "out", "off_hours");
        return { replyToken: ev.replyToken, messages: M.offHours(s, userId) };
      }
    }
    const st = await consentState(c.id);
    if (st.data === undefined) {
      const asked = await one(`select 1 from touchpoints where client_id = $1 and kind = 'consent_ask' and created_at > $2`,
        [c.id, new Date(now.getTime() - 24 * 3600_000).toISOString()]);
      if (!asked) { await logTouch(c.id, "out", "consent_ask"); msgs.push(M.consentAsk(s)); }
    }
    return msgs.length ? { replyToken: ev.replyToken, messages: msgs } : null; // humans answer in LINE OA Manager
  }
  return null;
}

export async function confirmStaffGroup() {
  const cand = await one<{ value: { groupId: string } }>("select value from settings where key = 'candidate_group'");
  if (!cand) return null;
  await saveSettings({ staffGroupId: cand.value.groupId });
  return cand.value.groupId;
}

import { q, one } from "./db";
import { captureSlip } from "./slips";
import { getSettings, ClinicSettings, saveSettings } from "./settings";
import { upsertClientByLine, markInbound, logTouch, recordConsent, consentState, getClientByLine } from "./crm";
import { setStatus, availableSlots, reschedule, SlotTakenError } from "./booking";
import { parseSource, applySource, ensureRefCode } from "./source";
import { notifyStaff, alertCare } from "./notify";
import { addDays, todayBkk } from "./time";
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
    if (p.get("resched")) {
      const a = await one(`select * from appointments where id = $1 and client_id = $2 and status in ('booked','confirmed')`, [Number(p.get("resched")), c.id]);
      if (!a) return { replyToken: ev.replyToken, messages: [{ type: "text", text: "ไม่พบนัดนี้แล้วค่ะ ดูนัดล่าสุดได้ที่เมนู นัดของฉัน นะคะ" }] };
      return { replyToken: ev.replyToken, messages: [M.reschedOptions(a.id, await nextFreeSlots(s, now, a.doctor), userId)] };
    }
    if (p.get("resched_to")) {
      try {
        const newId = await reschedule(Number(p.get("resched_to")), c.id, String(p.get("t")), s, now);
        const appt = await one("select * from appointments where id = $1", [newId]);
        await logTouch(c.id, "in", "appt_reschedule", `${p.get("resched_to")} -> ${newId}`);
        return { replyToken: ev.replyToken, messages: [M.confirmation(appt as any, s, userId)] };
      } catch (e) {
        const msg = e instanceof SlotTakenError ? "เวลานี้เพิ่งถูกจองไปค่ะ" : "เลื่อนนัดไม่สำเร็จค่ะ";
        return { replyToken: ev.replyToken, messages: [{ type: "text", text: `${msg} ลองเลือกเวลาอื่นได้ที่เมนู นัดของฉัน นะคะ` }] };
      }
    }
    if (p.get("care")) {
      const tid = Number(p.get("t")) || null;
      if (p.get("care") === "ok") { await logTouch(c.id, "in", "aftercare_ok", String(tid)); return { replyToken: ev.replyToken, messages: [M.careOk()] }; }
      await q("insert into care_requests(client_id, treatment_id) values ($1,$2)", [c.id, tid]);
      await logTouch(c.id, "in", "aftercare_ask", String(tid));
      await alertCare(c.id, "ลูกค้าขอให้คุณหมอดูอาการหลังทำ (รอรูป)");
      return { replyToken: ev.replyToken, messages: M.careAsk(isOpen(s, now), s) };
    }
    if (p.get("csat")) {
      const score = Math.max(1, Math.min(5, Number(p.get("csat")) || 0));
      const tr = await one("update treatments set csat_score = $3, csat_at = now() where id = $1 and client_id = $2 and csat_score is null returning id, name", [Number(p.get("t")), c.id, score]);
      if (!tr) return { replyToken: ev.replyToken, messages: [{ type: "text", text: "ได้รับคะแนนแล้วค่ะ ขอบคุณนะคะ" }] };
      await logTouch(c.id, "in", "csat", String(score));
      if (score <= 3) {
        await q("insert into issues(client_id, level, source, summary, owner_role) values ($1,'L2','csat',$2,'DR')", [c.id, `CSAT ${score}/5 หลังทำ ${tr.name}`]);
        await notifyStaff(`มีเรื่องต้องดูแล: ลูกค้าให้คะแนน CSAT ${score}/5 · เปิดดูในระบบ ${process.env.APP_URL || ""}/staff/care`, `csat-${tr.id}`);
      }
      const code = score >= 4 ? await ensureRefCode(c.id) : null;
      return { replyToken: ev.replyToken, messages: [M.csatThanks(score, code)] };
    }
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
    const leadId = await markInbound(c.id);
    await logTouch(c.id, "in", "message", text);
    // FR-01/02: source tag from the pre-filled CTA message
    if (ev.message?.type === "text") await applySource(c.id, leadId, parseSource(text));
    // FR-09: any reply stops nurture and puts the person back in the inbox
    await q("update leads set status = 'Contacted', nurture_started_at = null where id = $1 and status = 'Nurture'", [leadId]);
    // FR-33: photo for a pending "อยากให้หมอดู" request
    if (ev.message?.type === "image") {
      const cr = await one(`select id from care_requests where client_id = $1 and status in ('waiting_photo','waiting_review') and created_at > $2 order by id desc limit 1`,
        [c.id, new Date(now.getTime() - 48 * 3600_000).toISOString()]);
      if (cr) {
        const img = await line.content(ev.message.id).catch(() => null);
        if (img) await q("insert into photos(client_id, angle, mime, data) values ($1,'care',$2,$3)", [c.id, img.mime, img.data]);
        await q("update care_requests set status = 'waiting_review' where id = $1", [cr.id]);
        await alertCare(c.id, "ลูกค้าส่งรูปอาการหลังทำแล้ว รอพยาบาล/แพทย์ดู");
        return { replyToken: ev.replyToken, messages: [M.carePhotoThanks()] };
      }
      // otherwise it may be a transfer slip: kept for a cashier to confirm (never treated as a health photo)
      const img = await line.content(ev.message.id).catch(() => null);
      const kind = img ? await captureSlip(c.id, img, now).catch((e) => { console.error("[slip]", e); return null; }) : null;
      if (kind === "slip") {
        await logTouch(c.id, "in", "slip");
        await notifyStaff(`💳 มีสลิปโอนรอยืนยัน · ${process.env.APP_URL || ""}/staff/finance`, `slip:${c.id}:${Math.floor(now.getTime() / 600000)}`).catch(() => {});
        return { replyToken: ev.replyToken, messages: [{ type: "text", text: "ได้รับสลิปแล้วค่ะ ขอบคุณนะคะ ทีมจะตรวจสอบยอดและส่งใบเสร็จให้ค่ะ" }] };
      }
      if (kind === "duplicate") return { replyToken: ev.replyToken, messages: [{ type: "text", text: "สลิปนี้ได้รับแล้วค่ะ ไม่ต้องส่งซ้ำนะคะ 🙏" }] };
    }
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


/** FR-15: three nearest free slots from tomorrow on. */
export async function nextFreeSlots(s: ClinicSettings, now: Date, doctor: string, n = 3) {
  const out: { start: string }[] = [];
  for (let i = 0; i <= s.horizonDays && out.length < n; i++) {
    const d = addDays(todayBkk(now), i);
    for (const x of await availableSlots(d, s, doctor, now)) { if (x.available) out.push(x); if (out.length >= n) break; }
  }
  return out;
}

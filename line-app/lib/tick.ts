import { q, one } from "./db";
import { getSettings, ClinicSettings } from "./settings";
import { push } from "./line";
import * as M from "./messages";
import { logTouch } from "./crm";
import { once } from "./jobs";
import { notifyStaff } from "./notify";
import { isOpen } from "./webhook";
import { sendReminders, eveningRun } from "./cron";
import { seedOnce } from "./seed";
import { cardFor, careFlex, CARE_VERSION } from "./careCards";
import { dailyReport } from "./finance";
import { expireTiers } from "./loyalty";
/** marketing messages only between 09:00 and 20:00 */
const isQuiet = (now: Date) => { const m = minutes(parts(now).time); return m < 9 * 60 || m > 20 * 60; };
import { notifyExec } from "./notify";
import { recallTick } from "./recall";
import { sendCampaignBatch } from "./segments";
import { capiTick } from "./capi";
import { bkk, parts, todayBkk, addDays, minutes } from "./time";

const APP = () => process.env.APP_URL || "";
const REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJ2z9FVIedIzERYDruDs_3xeU";
const nameOf = (r: any) => r.name || r.display_name || "ลูกค้า";
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400_000);
const after = (now: Date, hhmm: string) => minutes(parts(now).time) >= minutes(hhmm);

async function safePush(to: string, msgs: any[], key: string) {
  try { await push(to, msgs, undefined); return true; } catch (e) { console.error("[tick] push", key, e); return false; }
}

/** FR-07: unanswered chats, counted in opening hours. 10 min → team, 30 min → BM. */
export async function sla(now: Date, s: ClinicSettings) {
  if (!isOpen(s, now)) return 0;
  const openAt = bkk(todayBkk(now), s.hours[parts(now).weekday]!.open).getTime();
  const rows = await q(`select l.id, l.last_inbound_at, c.name, c.display_name, st.name as owner from leads l
    join clients c on c.id = l.client_id left join staff st on st.id = l.owner_staff_id
    where l.last_inbound_at is not null and (l.replied_at is null or l.replied_at < l.last_inbound_at) and l.status <> 'Lost'`);
  const lv10: string[] = [], lv30: string[] = [];
  for (const r of rows) {
    const inbound = new Date(r.last_inbound_at).getTime();
    const waited = (now.getTime() - Math.max(inbound, openAt)) / 60000;
    const stamp = new Date(r.last_inbound_at).toISOString();
    const label = `• ${nameOf(r)}${r.owner ? ` (เจ้าของ: ${r.owner})` : ""}`;
    if (waited >= 30) { if (await once(`sla30:${r.id}:${stamp}`)) lv30.push(label); }
    else if (waited >= 10 && (await once(`sla10:${r.id}:${stamp}`))) lv10.push(label);
  }
  if (lv10.length) await notifyStaff(`⏱ แชทรอตอบเกิน 10 นาที ${lv10.length} ราย\n${lv10.join("\n")}\n${APP()}/staff/leads`);
  if (lv30.length) await notifyStaff(`🔴 แจ้ง BM: แชทรอตอบเกิน 30 นาที ${lv30.length} ราย\n${lv30.join("\n")}\n${APP()}/staff/leads`);
  return lv10.length + lv30.length;
}

/** FR-19: arrived and waiting > 10 min without a status change. */
export async function waitTimer(now: Date) {
  const rows = await q(`select a.id, c.name, c.display_name from appointments a join clients c on c.id = a.client_id
    where a.status = 'arrived' and a.arrived_at < $1`, [new Date(now.getTime() - 10 * 60000).toISOString()]);
  const list: string[] = [];
  for (const r of rows) if (await once(`wait:${r.id}`)) list.push(`• ${nameOf(r)}`);
  if (list.length) await notifyStaff(`⏳ ลูกค้ารอเกิน 10 นาที (FD + CS)\n${list.join("\n")}\n${APP()}/staff`);
  return list.length;
}

/** FR-15: 2 hours before. */
export async function reminder2h(now: Date, s: ClinicSettings) {
  const rows = await q(`select a.*, c.line_user_id, c.health_updated_at from appointments a join clients c on c.id = a.client_id
    where a.status in ('booked','confirmed') and a.reminder2_sent_at is null and c.line_user_id is not null and c.followed
      and a.start_at between $1 and $2 and a.created_at < a.start_at - interval '3 hours'`,
    [new Date(now.getTime() + 60 * 60000).toISOString(), new Date(now.getTime() + 130 * 60000).toISOString()]);
  let n = 0;
  for (const a of rows) {
    if (!(await once(`rem2:${a.id}`))) continue;
    if (await safePush(a.line_user_id, [M.reminder2h(a as any, s, a.line_user_id, !a.health_updated_at)], `rem2:${a.id}`)) {
      await q("update appointments set reminder2_sent_at = now() where id = $1", [a.id]);
      await logTouch(a.client_id, "out", "reminder_2h", String(a.id), "system"); n++;
    }
  }
  return n;
}

/** FR-16: 30 min past start with no check-in → no-show + one rebook message. */
export async function noShows(now: Date) {
  const rows = await q(`update appointments a set status = 'no_show' from clients c
    where c.id = a.client_id and a.status in ('booked','confirmed') and a.arrived_at is null and a.start_at < $1
    returning a.id, a.client_id, a.start_at, c.line_user_id, c.followed`, [new Date(now.getTime() - 30 * 60000).toISOString()]);
  for (const a of rows) {
    await logTouch(a.client_id, "out", "no_show", String(a.id), "system");
    const recent = new Date(a.start_at).getTime() > now.getTime() - 12 * 3600_000;
    if (recent && a.line_user_id && a.followed && (await once(`noshow:${a.id}`))) await safePush(a.line_user_id, [M.noShow(a.line_user_id)], `noshow:${a.id}`);
  }
  return rows.length;
}

/** FR-09/10: Nurture D1/D3/D7, then Lost. Runs once a day from 10:00. */
export async function nurture(now: Date) {
  const today = todayBkk(now);
  const rows = await q(`select l.id, l.client_id, l.nurture_started_at, l.nurture_step, c.line_user_id, c.followed,
      (select granted from consents x where x.client_id = c.id and x.type = 'marketing' order by created_at desc, id desc limit 1) as mkt
    from leads l join clients c on c.id = l.client_id where l.status = 'Nurture' and l.nurture_started_at is not null`);
  let sent = 0;
  for (const l of rows) {
    const days = daysBetween(parts(new Date(l.nurture_started_at)).date, today);
    const step = Number(l.nurture_step);
    const next = step === 0 && days >= 1 ? 1 : step === 1 && days >= 3 ? 3 : step === 3 && days >= 7 ? 7 : null;
    if (step === 7 && days >= 8) {
      await q("update leads set status = 'Lost', lost_reason = 'ไม่ตอบกลับ' where id = $1 and status = 'Nurture'", [l.id]);
      continue;
    }
    if (!next || !l.line_user_id || !l.followed || l.mkt === false) continue;
    if (!(await once(`nurture:${l.id}:${next}`))) continue;
    if (await safePush(l.line_user_id, [M.nurture(next as 1 | 3 | 7, l.line_user_id)], `nurture:${l.id}`)) {
      await q("update leads set nurture_step = $2 where id = $1", [l.id, next]);
      await logTouch(l.client_id, "out", `nurture_d${next}`, null, "system"); sent++;
    }
  }
  return sent;
}

/** FR-32: aftercare D0 (3 h after), D1, D3, D7 per treatment type. Off until the doctor approves the texts. */
export const aftercareLive = (s: { aftercareApproved?: boolean; aftercareVersion?: string }) => !!s.aftercareApproved && s.aftercareVersion === CARE_VERSION;

/** FR-32 + self-care card: the card goes out as soon as the treatment is marked done; texts D0 (3 h, only without a card), D1, D3, D7. */
export async function aftercare(now: Date, s: ClinicSettings & { aftercareApproved?: boolean; aftercareVersion?: string }) {
  if (!aftercareLive(s)) return 0;
  const today = todayBkk(now);
  const rows = await q(`select t.id, t.client_id, t.aftercare_key, t.done_at, c.line_user_id, c.followed from treatments t
    join clients c on c.id = t.client_id where t.done_at > $1 and c.line_user_id is not null`, [new Date(now.getTime() - 9 * 86400_000).toISOString()]);
  const tpl = await q("select key, day, body from aftercare_templates");
  const body = (k: string, d: number) => (tpl.find((x) => x.key === k && x.day === d) || tpl.find((x) => x.key === "general" && x.day === d))?.body;
  let sent = 0;
  for (const t of rows) {
    if (!t.followed) continue;
    const doneDate = parts(new Date(t.done_at)).date;
    const days = daysBetween(doneDate, today);
    const due: number[] = [];
    const card = cardFor(t.aftercare_key);
    if (days === 0 && card && minutes(parts(now).time) <= minutes("21:30") && await once(`card:${t.id}`)) {
      if (await safePush(t.line_user_id, [careFlex(card, s.phone)], `card:${t.id}`)) { await logTouch(t.client_id, "out", "aftercare_card", String(t.id), "system"); sent++; }
    }
    if (days === 0 && !card && now.getTime() - new Date(t.done_at).getTime() >= 3 * 3600_000 && minutes(parts(now).time) <= minutes("21:00")) due.push(0);
    if (after(now, "10:00")) for (const d of [1, 3, 7]) if (days === d || days === d + 1) due.push(d);
    for (const d of due) {
      const b = body(t.aftercare_key, d);
      if (!b || !(await once(`ac:${t.client_id}:${t.aftercare_key}:${doneDate}:${d}`))) continue;
      if (await safePush(t.line_user_id, [M.aftercare(b, d, t.id, s)], `ac:${t.id}:${d}`)) { await logTouch(t.client_id, "out", `aftercare_d${d}`, String(t.id), "system"); sent++; }
    }
  }
  return sent;
}

/** Day 3 after a visit, 11:00–20:00: ask for a Google review about the visit. Once per visit day, at most every 120 days per client. */
export async function reviewAsk(now: Date) {
  if (!after(now, "11:00") || after(now, "20:00")) return 0;
  const today = todayBkk(now);
  const rows = await q(`select distinct on (t.client_id) t.id, t.client_id, t.done_at, c.line_user_id, c.followed
    from treatments t join clients c on c.id = t.client_id
    where t.done_at between $1 and $2 and c.line_user_id is not null
      and not exists (select 1 from touchpoints p where p.client_id = t.client_id and p.kind = 'review_ask' and p.created_at > $3)
    order by t.client_id, t.done_at desc`,
    [bkk(addDays(today, -5), "00:00").toISOString(), bkk(addDays(today, -2), "00:00").toISOString(), new Date(now.getTime() - 120 * 86400_000).toISOString()]);
  let sent = 0;
  for (const t of rows) {
    if (!t.followed || !(await once(`review:${t.client_id}:${parts(new Date(t.done_at)).date}`))) continue;
    if (await safePush(t.line_user_id, [M.reviewAsk(REVIEW_URL)], `review:${t.id}`)) { await logTouch(t.client_id, "out", "review_ask", String(t.id), "system"); sent++; }
  }
  return sent;
}

/** FR-34/35: D14 CSAT to everyone, from 09:30. The review link rides along only if the day-3 ask was not sent. */
export async function csat(now: Date) {
  if (!after(now, "09:30")) return 0;
  const today = todayBkk(now);
  const rows = await q(`select distinct on (t.client_id, (t.done_at at time zone 'Asia/Bangkok')::date) t.id, t.client_id, t.done_at, c.line_user_id, c.followed
    from treatments t join clients c on c.id = t.client_id
    where t.done_at between $1 and $2 and t.csat_score is null and c.line_user_id is not null
    order by t.client_id, (t.done_at at time zone 'Asia/Bangkok')::date, t.id`,
    [bkk(addDays(today, -16), "00:00").toISOString(), bkk(addDays(today, -13), "00:00").toISOString()]);
  let sent = 0;
  for (const t of rows) {
    if (!t.followed || !(await once(`csat:${t.client_id}:${parts(new Date(t.done_at)).date}`))) continue;
    const asked = await one("select 1 from touchpoints where client_id = $1 and kind = 'review_ask' and created_at > $2 limit 1", [t.client_id, new Date(now.getTime() - 30 * 86400_000).toISOString()]);
    if (await safePush(t.line_user_id, [M.csat(t.id, asked ? null : REVIEW_URL)], `csat:${t.id}`)) { await logTouch(t.client_id, "out", "csat_d14", String(t.id), "system"); sent++; }
  }
  return sent;
}

/** FR-33: nobody picked up a care request in 15 minutes → BM. */
export async function careEscalation(now: Date) {
  const rows = await q(`select id from care_requests where ack_at is null and status in ('waiting_photo','waiting_review') and created_at < $1 and created_at > $2`,
    [new Date(now.getTime() - 15 * 60000).toISOString(), new Date(now.getTime() - 48 * 3600_000).toISOString()]);
  let n = 0;
  for (const r of rows) if (await once(`careesc:${r.id}`)) n++;
  if (n) await notifyStaff(`🔴 แจ้ง BM: มีเคสขอให้คุณหมอดู ${n} เคส ยังไม่มีคนรับเกิน 15 นาที\n${APP()}/staff/care`);
  return n;
}

/** FR-23 (A09): plan cards sent 2 days ago and not booked → follow-up list for CS. */
export async function planFollowUp(now: Date) {
  if (!after(now, "10:00")) return 0;
  const today = todayBkk(now);
  if (!(await once(`planfu:${today}`))) return 0;
  const rows = await q(`select p.id, c.name, c.display_name from plans p join clients c on c.id = p.client_id
    where p.status = 'sent' and p.card_sent_at between $1 and $2`, [bkk(addDays(today, -2), "00:00").toISOString(), bkk(addDays(today, -1), "00:00").toISOString()]);
  if (rows.length) await notifyStaff(`📋 ติดตามแผนการรักษา (ส่งการ์ดไป 2 วัน ยังไม่จอง) ${rows.length} ราย\n${rows.map((r) => `• ${nameOf(r)}`).join("\n")}\n${APP()}/staff/clients`);
  return rows.length;
}

/** Members-only offers: sends the personal codes of recent offers, consent re-checked at send time. */
export async function sendOfferBatch(limit = 150, now = new Date()) {
  const rows = await q(`select oc.id, oc.code, oc.expires_at, o.title, o.detail, c.id as client_id, c.line_user_id, c.followed,
      (select k.granted from consents k where k.client_id = c.id and k.type = 'marketing' order by k.created_at desc, k.id desc limit 1) as mk
    from offer_codes oc join offers o on o.id = oc.offer_id join clients c on c.id = oc.client_id
    where oc.sent_at is null and oc.expires_at > $2 order by oc.id limit $1`, [limit, now.toISOString()]);
  let sent = 0;
  for (const r of rows) {
    const ok = r.line_user_id && r.followed && r.mk === true;
    if (ok && !(await safePush(r.line_user_id, [M.offerCard(r.line_user_id, r.title, r.detail, r.code, new Date(r.expires_at))], `offer:${r.id}`))) continue;
    await q("update offer_codes set sent_at = now() where id = $1", [r.id]);
    if (ok) { await logTouch(Number(r.client_id), "out", "offer", String(r.id), "system"); sent++; }
  }
  return sent;
}

/** 19:00 money report (day + week + month) to the management group, once a day. */
export async function financeReport(now: Date, s: ClinicSettings) {
  if (!s.execGroupId || !after(now, "19:00")) return 0;
  const day = todayBkk(now);
  if (!(await once(`finreport:${day}`))) return 0;
  return (await notifyExec(await dailyReport(now))) ? 1 : 0;
}

/** One entry point, called every 5 minutes. Every step is idempotent and isolated. */
export async function runTick(now = new Date()) {
  const s = (await getSettings()) as ClinicSettings & { aftercareApproved?: boolean; paused?: boolean };
  await seedOnce();
  if (s.paused) return { paused: true };
  const out: Record<string, unknown> = {};
  const steps: [string, () => Promise<unknown>][] = [
    ["sla", () => sla(now, s)],
    ["wait", () => waitTimer(now)],
    ["reminder2h", () => reminder2h(now, s)],
    ["noShow", () => noShows(now)],
    ["careEscalation", () => careEscalation(now)],
    ["aftercare", () => aftercare(now, s)],
    ["reviewAsk", () => reviewAsk(now)],
    ["csat", () => csat(now)],
    ["nurture", async () => (after(now, "10:00") && (await once(`nurture-run:${todayBkk(now)}`)) ? nurture(now) : 0)],
    ["planFollowUp", () => planFollowUp(now)],
    ["formImport", async () => ((await once("import:form-oct69")) ? (await import("./salesForm")).importOct69() : 0)],
    ["financeReport", () => financeReport(now, s)],
    ["offers", () => (isQuiet(now) ? Promise.resolve(0) : sendOfferBatch(150, now))],
    ["tierExpiry", async () => ((await once(`tiers:${todayBkk(now)}`)) ? expireTiers(now) : 0)],
    ["walletExpiry", async () => ((await once(`wallet-exp:${todayBkk(now)}`)) ? (await import("./wallet")).expireWallets(now) : 0)],
    ["recall", () => recallTick(now, s)],
    ["campaigns", () => sendCampaignBatch(200)],
    ["capi", () => capiTick(now)],
    ["reminderD1", async () => (after(now, "18:00") && !after(now, "21:00") ? sendReminders(now) : 0)],
    ["evening", async () => (after(now, "20:00") && (await once(`eve-run:${todayBkk(now)}`)) ? eveningRun(now) : 0)],
  ];
  for (const [k, f] of steps) {
    try { out[k] = await f(); } catch (e) { console.error("[tick]", k, e); out[k] = `error: ${(e as Error).message}`; }
  }
  return out;
}

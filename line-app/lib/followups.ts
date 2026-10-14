import { q, one } from "./db";
import { logTouch } from "./crm";
import { addDays, todayBkk, parts } from "./time";

// Follow-up: the list of clients someone must contact, why, and every attempt.
// Built so a client cannot quietly drop off: each failed attempt schedules the next one on a
// different channel, three misses in a row mark the client "unreachable" (try again in 14 days,
// a new channel or the doctor), and the system adds clients itself (no next visit after a
// treatment, unused prepaid items or credit). A future appointment closes the follow-up.

export const REASONS: Record<string, string> = {
  next_visit: "ยังไม่มีนัดครั้งถัดไป",
  remaining: "มีบริการคงเหลือ",
  credit: "มีวงเงินคงเหลือ",
  owed: "ค้างชำระ",
  review: "ครบรอบดูผลหลังทำ",
  clinical: "แพทย์ต้องติดตามอาการ",
  lapsed: "หายไปนาน",
  due: "ถึงวันที่ควรกลับมา",
  vip: "ลูกค้ายอดสูง",
  other: "อื่นๆ",
};
export const CHANNELS: Record<string, string> = {
  line: "LINE", call: "โทร", call2: "โทรเบอร์สำรอง", sms: "SMS", messenger: "Messenger / FB", whatsapp: "WhatsApp", doctor: "หมอทักเอง", visit: "ลูกค้ามาที่คลินิก",
};
export const RESULTS: Record<string, string> = {
  booked: "นัดได้แล้ว", replied: "ตอบกลับ / คุยได้", later: "ลูกค้าขอติดต่อกลับเอง / ยังไม่สะดวก",
  unread: "ไม่อ่าน", read_no_reply: "อ่านไม่ตอบ", no_answer: "ไม่รับสาย", wrong_number: "เบอร์ติดต่อไม่ได้", declined: "ไม่ต้องการแล้ว",
};
export const STATUS: Record<string, string> = { open: "ต้องติดตาม", unreachable: "ติดต่อไม่ได้", booked: "นัดแล้ว", closed: "ปิดแล้ว" };
const FAIL = ["unread", "read_no_reply", "no_answer", "wrong_number"];
const GAP_AFTER_FAIL = [2, 4, 7]; // days before the next try, by consecutive misses
const OPEN = ["open", "unreachable"];

/** Opens (or reopens / updates) the single active follow-up of a client. Returns its id. */
export async function openFollowup(o: { clientId: number; reason: string; note?: string | null; nextOn: string; source?: string; staffId?: number | null }) {
  const reason = REASONS[o.reason] ? o.reason : "other";
  const cur = await one("select id, note from followups where client_id = $1 and status in ('open','unreachable')", [o.clientId]);
  if (cur) {
    await q(`update followups set reason = $2, note = coalesce($3, note), next_on = least(next_on, $4::date), updated_at = now() where id = $1`,
      [cur.id, reason, o.note ?? null, o.nextOn]);
    return Number(cur.id);
  }
  const r = await one(`insert into followups(client_id, reason, note, next_on, source, created_by) values ($1,$2,$3,$4,$5,$6) returning id`,
    [o.clientId, reason, o.note ?? null, o.nextOn, o.source ?? "staff", o.staffId ?? null]);
  return Number(r!.id);
}

/**
 * Logs one contact attempt and decides what happens next.
 * booked → done until the visit · declined → closed · replied/later → next check in 7 days (or the date given)
 * a miss → try again in 2 / 4 / 7 days; the third miss in a row marks the client unreachable and waits 14 days.
 */
export async function logAttempt(o: { followupId: number; channel: string; result: string; note?: string; nextOn?: string | null; staffId?: number | null; now?: Date }) {
  const now = o.now ?? new Date();
  const today = todayBkk(now);
  const f = await one("select * from followups where id = $1", [o.followupId]);
  if (!f) throw new Error("not_found");
  const channel = CHANNELS[o.channel] ? o.channel : "call";
  const result = RESULTS[o.result] ? o.result : "replied";
  await q("insert into contact_attempts(followup_id, client_id, channel, result, note, staff_id, created_at) values ($1,$2,$3,$4,$5,$6,$7)",
    [f.id, f.client_id, channel, result, o.note || null, o.staffId ?? null, now.toISOString()]);
  const fails = FAIL.includes(result) ? Number(f.fails) + 1 : 0;
  let status = "open", next = o.nextOn || addDays(today, 7);
  if (result === "booked") status = "booked";
  else if (result === "declined") status = "closed";
  else if (fails >= 3) { status = "unreachable"; next = o.nextOn || addDays(today, 14); }
  else if (fails > 0) next = o.nextOn || addDays(today, GAP_AFTER_FAIL[fails - 1]);
  await q(`update followups set attempts = attempts + 1, fails = $2, status = $3, next_on = $4, last_at = $5, last_channel = $6, last_result = $7,
      updated_at = now(), closed_at = case when $3 in ('booked','closed') then now() else null end where id = $1`,
    [f.id, fails, status, next, now.toISOString(), channel, result]);
  await logTouch(Number(f.client_id), "out", `followup_${result}`, [CHANNELS[channel], o.note].filter(Boolean).join(" · "), channel === "line" ? "line" : "staff");
  return { status, next, fails };
}

export async function setFollowupStatus(id: number, status: "open" | "closed", staffId: number | null, now = new Date()) {
  await q(`update followups set status = $2, fails = case when $2 = 'open' then 0 else fails end,
      next_on = case when $2 = 'open' then $3::date else next_on end, updated_at = now(),
      closed_at = case when $2 = 'closed' then now() else null end where id = $1`, [id, status, todayBkk(now)]);
  void staffId;
}

/** Channels not tried yet for this follow-up, in the order worth trying. A miss on one channel means switch, not repeat. */
export function nextChannels(c: { line_user_id?: string | null; phone?: string | null; phone2?: string | null; alt_contact?: string | null; value?: number },
  tried: string[]) {
  const all = [
    c.phone && "call", c.line_user_id && "line", c.phone && "sms", c.phone2 && "call2", c.alt_contact && "messenger",
    (c.value ?? 0) >= 80_000 && "doctor",
  ].filter(Boolean) as string[];
  const fresh = all.filter((x) => !tried.includes(x));
  return fresh.length ? fresh : all;
}

/** System-created follow-ups. Idempotent; runs daily and when the page opens. */
export async function syncFollowups(now = new Date()) {
  const today = todayBkk(now), nowIso = now.toISOString();
  // a future appointment closes an open follow-up
  await q(`update followups f set status = 'booked', closed_at = now(), updated_at = now() where f.status in ('open','unreachable')
    and exists (select 1 from appointments a where a.client_id = f.client_id and a.start_at >= $1 and a.status not in ('cancelled','no_show'))`, [nowIso]);
  const noFuture = `not exists (select 1 from appointments a where a.client_id = c.id and a.start_at >= $1 and a.status not in ('cancelled','no_show'))
    and not exists (select 1 from followups f where f.client_id = c.id and (f.status in ('open','unreachable') or f.updated_at > $2::date - 14))`;
  // treated in the last 2–14 days, no next appointment and no planned return date → the front desk books the next visit
  const a = await q(`insert into followups(client_id, reason, note, next_on, source)
    select c.id, 'next_visit', 'ทำหัตถการแล้วยังไม่มีนัดครั้งถัดไป', $3::date, 'auto' from clients c
    where exists (select 1 from treatments t where t.client_id = c.id and t.done_at >= $2::date - 14 and t.done_at < $2::date - 1)
      and (c.next_visit_due is null or c.next_visit_due < $2::date) and ${noFuture}
    on conflict do nothing returning id`, [nowIso, today, today]);
  // planned return date is a week away and nothing is booked
  const b = await q(`insert into followups(client_id, reason, note, next_on, source)
    select c.id, 'due', 'ใกล้ถึงวันที่ควรกลับมา', $3::date, 'auto' from clients c
    where c.next_visit_due is not null and c.next_visit_due <= $2::date + 7 and c.next_visit_due >= $2::date - 30 and ${noFuture}
    on conflict do nothing returning id`, [nowIso, today, today]);
  // prepaid items or credit left, no visit for 30+ days
  const lastVisit = `greatest(coalesce((select max(t.done_at)::date from treatments t where t.client_id = c.id), c.legacy_last_visit), c.legacy_last_visit)`;
  const d = await q(`insert into followups(client_id, reason, note, next_on, source)
    select c.id, case when exists (select 1 from entitlements e where e.client_id = c.id and e.used_at is null) then 'remaining' else 'credit' end,
      'มีบริการหรือวงเงินคงเหลือ และไม่ได้มาเกิน 30 วัน', $3::date, 'auto' from clients c
    where (exists (select 1 from entitlements e where e.client_id = c.id and e.used_at is null)
        or (select coalesce(sum(amount),0) from wallet_ledger w where w.client_id = c.id) > 0)
      and coalesce(${lastVisit}, c.created_at::date) <= $2::date - 30 and ${noFuture}
    on conflict do nothing returning id`, [nowIso, today, today]);
  return a.length + b.length + d.length;
}

/** Work list, most valuable and most overdue first. tab: due (to do today) | unreachable | booked | all */
export async function followupList(tab: string, now = new Date(), limit = 200) {
  const today = todayBkk(now);
  const where = tab === "unreachable" ? "f.status = 'unreachable'"
    : tab === "booked" ? "f.status = 'booked' and f.updated_at > now() - interval '30 days'"
    : tab === "all" ? "f.status in ('open','unreachable')"
    : "f.status in ('open','unreachable') and f.next_on <= $1::date";
  return q(`select f.*, c.hn, coalesce(c.name, c.display_name) as client_name, c.phone, c.phone2, c.alt_contact, c.line_user_id, c.followed,
      c.legacy_last_visit, c.next_visit_due, c.owed::float as owed,
      (c.legacy_spend + coalesce((select sum(p.amount) from payments p where p.client_id = c.id and p.voided_at is null and p.method <> 'wallet'), 0))::float as value,
      (select coalesce(sum(w.amount),0)::float from wallet_ledger w where w.client_id = c.id) as credit,
      (select string_agg(e.item, ' · ' order by e.id) from entitlements e where e.client_id = c.id and e.used_at is null) as remaining,
      (select max(t.done_at) from treatments t where t.client_id = c.id) as last_treat,
      (select json_agg(x order by x.created_at desc) from (select channel, result, note, created_at from contact_attempts a
        where a.followup_id = f.id order by created_at desc limit 5) x) as tries,
      (select min(a.start_at) from appointments a where a.client_id = c.id and a.start_at >= now() and a.status not in ('cancelled','no_show')) as next_appt
    from followups f join clients c on c.id = f.client_id where ${where}
    order by (f.next_on < $1::date) desc, value desc, f.next_on limit ${Number(limit)}`, [today]);
}

export async function followupCount(now = new Date()) {
  const r = await one("select count(*)::int n from followups where status in ('open','unreachable') and next_on <= $1::date", [todayBkk(now)]);
  return Number(r?.n ?? 0);
}

// ---------- Import: paste a staff list (Excel/Sheets copy, tab or comma separated) ----------

const HEAD: Record<string, string> = {
  hn: "hn", "ชื่อ": "name", name: "name", "เบอร์": "phone", "เบอร์โทร": "phone", phone: "phone", "เบอร์สำรอง": "phone2", phone2: "phone2",
  "ช่องทางอื่น": "alt", alt: "alt", "รับบริการล่าสุด": "last", last_visit: "last", "ยอดขาย": "spend", "ยอดสะสม": "spend", spend: "spend",
  "วงเงินคงเหลือ": "credit", credit: "credit", "ค้างชำระ": "owed", owed: "owed", "บริการคงเหลือ": "remaining", remaining: "remaining",
  "เหตุผล": "reason", reason: "reason", "ตามครั้งถัดไป": "next", next_on: "next", "นัดแล้ว": "appt", appt: "appt", "การติดตาม": "note", note: "note",
  "สถานะ": "status", status: "status",
};
const num = (v?: string) => Number(String(v ?? "").replace(/[^0-9.\-]/g, "")) || 0;
/** 06/06/69 · 6/6/2569 · 2026-06-06 → 2026-06-06 (two-digit and 25xx years are Buddhist era) */
export function parseDate(v?: string | null): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) { const y = Number(m[1]) > 2400 ? Number(m[1]) - 543 : Number(m[1]); return `${y}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`; }
  m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (!m) return null;
  let y = Number(m[3]);
  if (y < 100) y += 2500;
  if (y > 2400) y -= 543;
  const d = Number(m[1]), mo = Number(m[2]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function splitRow(line: string) {
  if (line.includes("\t")) return line.split("\t");
  const out: string[] = []; let cur = "", qd = false;
  for (const ch of line) {
    if (ch === '"') qd = !qd;
    else if (ch === "," && !qd) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}
export function parseImport(text: string) {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const head = splitRow(lines[0]).map((h) => HEAD[h.trim().toLowerCase()] ?? HEAD[h.trim()] ?? "");
  return lines.slice(1).map((l) => {
    const cells = splitRow(l);
    const r: Record<string, string> = {};
    head.forEach((k, i) => { if (k) r[k] = (cells[i] ?? "").trim(); });
    return r;
  }).filter((r) => r.hn || r.name);
}

/** Creates or updates clients by HN (or phone), their prepaid items and credit, and one follow-up each. Safe to run twice. */
export async function importFollowups(text: string, staffId: number | null, now = new Date()) {
  const today = todayBkk(now);
  const rows = parseImport(text);
  const res = { clients: 0, created: 0, followups: 0, items: 0, credit: 0, skipped: [] as string[] };
  for (const r of rows) {
    const hn = (r.hn || "").replace(/\s/g, "") || null;
    const phone = r.phone || null;
    let c = hn ? await one("select id from clients where hn = $1", [hn]) : null;
    if (!c && phone) c = await one("select id from clients where phone_norm = regexp_replace($1, '[^0-9]', '', 'g') order by line_user_id is null, id limit 1", [phone]);
    if (!c && !r.name) { res.skipped.push(hn || "?"); continue; }
    if (!c) {
      c = await one("insert into clients(name, phone, hn, source, followed) values ($1,$2,$3,'import',false) returning id", [r.name, phone, hn]);
      res.created++;
    }
    const id = Number(c!.id);
    res.clients++;
    await q(`update clients set hn = coalesce(hn, $2), name = coalesce(name, $3), phone = coalesce(phone, $4), phone2 = coalesce(nullif($5,''), phone2),
        alt_contact = coalesce(nullif($6,''), alt_contact), legacy_spend = greatest(legacy_spend, $7),
        legacy_last_visit = greatest(coalesce(legacy_last_visit, $8::date), $8::date), owed = case when $9::numeric > 0 then $9::numeric else owed end where id = $1`,
      [id, hn, r.name || null, phone, r.phone2 || "", r.alt || "", num(r.spend), parseDate(r.last), num(r.owed)]);
    const credit = num(r.credit);
    if (credit > 0) {
      const tag = `ยอดคงเหลือยกมาจากระบบเดิม${hn ? ` (HN ${hn})` : ""}`;
      const had = await one("select 1 from wallet_ledger where client_id = $1 and note = $2", [id, tag]);
      if (!had) { await q("insert into wallet_ledger(client_id, kind, amount, note, created_by) values ($1,'adjust',$2,$3,$4)", [id, credit, tag, staffId]); res.credit += credit; }
    }
    for (const item of (r.remaining || "").split(/[;|]/).map((x) => x.trim()).filter(Boolean)) {
      const had = await one("select 1 from entitlements where client_id = $1 and item = $2 and used_at is null", [id, item]);
      if (!had) { await q("insert into entitlements(client_id, item, source, created_by) values ($1,$2,'import',$3)", [id, item, staffId]); res.items++; }
    }
    const appt = parseDate(r.appt);
    const status = (r.status || "").trim();
    const reason = REASONS[r.reason] ? r.reason : (credit > 0 ? "credit" : r.remaining ? "remaining" : "vip");
    const fid = await openFollowup({ clientId: id, reason, note: r.note || null, nextOn: appt ? appt : parseDate(r.next) || today, source: "import", staffId });
    if (appt && appt >= today) await q("update followups set status = 'booked', next_on = $2, note = concat_ws(' · ', note, $3::text), updated_at = now() where id = $1", [fid, appt, `นัดไว้ ${appt}`]);
    else if (status === "unreachable" || status === "ติดต่อไม่ได้") await q("update followups set status = 'unreachable', fails = greatest(fails, 3) where id = $1", [fid]);
    res.followups++;
  }
  return res;
}

export async function addEntitlement(clientId: number, item: string, staffId: number | null) {
  if (!item.trim()) return;
  await q("insert into entitlements(client_id, item, created_by) values ($1,$2,$3)", [clientId, item.trim(), staffId]);
}
export async function useEntitlement(id: number, staffId: number | null) {
  return one("update entitlements set used_at = now(), used_by = $2 where id = $1 and used_at is null returning client_id", [id, staffId]);
}

export const dayOf = (d: string | Date | null | undefined) => (d ? (d instanceof Date ? parts(d).date : String(d).slice(0, 10)) : null);

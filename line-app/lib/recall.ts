import { q, one } from "./db";
import { push } from "./line";
import * as M from "./messages";
import { logTouch } from "./crm";
import { once } from "./jobs";
import { notifyStaff } from "./notify";
import { addDays, todayBkk, thaiDate, parts, minutes } from "./time";
import type { ClinicSettings } from "./settings";

// Recall: aesthetic results wear off on a known cycle (filler ~9 months, toxin ~4, skin booster monthly).
// Each treatment whose catalog item has recall_days gets a recall row; the newest treatment of an item wins.
// Status: due → sent (LINE) / contacted (staff) → booked, or dismissed / superseded.

export const RECALL_STATUS: Record<string, string> = {
  due: "ถึงรอบ", sent: "ส่ง LINE แล้ว", contacted: "ติดต่อแล้ว", booked: "จองแล้ว", dismissed: "ไม่ติดตาม", superseded: "ทำซ้ำแล้ว",
};
const OPEN = ["due", "sent", "contacted"];

/** Creates recall rows for new treatments, retires old ones and marks bookings. Idempotent. */
export async function syncRecalls(now = new Date()) {
  await q(`insert into recalls(client_id, treatment_id, catalog_id, name, due_on)
    select t.client_id, t.id, t.catalog_id, t.name, ((t.done_at at time zone 'Asia/Bangkok')::date + c.recall_days)
    from treatments t join catalog c on c.id = t.catalog_id
    where c.recall_days is not null and c.recall_days > 0
      and not exists (select 1 from treatments t2 where t2.client_id = t.client_id and t2.catalog_id = t.catalog_id and t2.done_at > t.done_at)
    on conflict (treatment_id) do nothing`);
  // a newer treatment of the same item replaces the old recall
  await q(`update recalls r set status = 'superseded', updated_at = now() where r.status in ('due','sent','contacted')
    and exists (select 1 from treatments t2 where t2.client_id = r.client_id and t2.catalog_id = r.catalog_id and t2.id <> r.treatment_id
      and t2.done_at > (select done_at from treatments where id = r.treatment_id))`);
  // an appointment made after the recall went out (or within its window) counts as booked
  await q(`update recalls r set status = 'booked', appointment_id = a.id, updated_at = now()
    from appointments a where a.client_id = r.client_id and r.status in ('due','sent','contacted')
      and a.status not in ('cancelled','no_show') and a.start_at >= $1
      and a.created_at >= coalesce(r.sent_at, r.contacted_at, (r.due_on - 30)::timestamptz)`, [now.toISOString()]);
}

/** Daily, from 10:00: LINE recall to clients who agreed to marketing; everyone else lands on the staff call list. */
export async function recallTick(now: Date, s: ClinicSettings) {
  if (minutes(parts(now).time) < minutes("10:00")) return 0;
  const today = todayBkk(now);
  if (!(await once(`recall-run:${today}`))) return 0;
  await syncRecalls(now);
  const lead = s.recallLeadDays ?? 7;
  const rows = await q(`
    select r.*, c.line_user_id, c.followed, coalesce(c.name, c.display_name) as client_name, t.done_at,
      (select granted from consents k where k.client_id = r.client_id and k.type = 'marketing' order by k.created_at desc, k.id desc limit 1) as mk
    from recalls r join clients c on c.id = r.client_id join treatments t on t.id = r.treatment_id
    where r.status = 'due' and r.due_on <= $1 and r.due_on > $2
      and not exists (select 1 from appointments a where a.client_id = r.client_id and a.start_at >= $3 and a.status not in ('cancelled','no_show'))`,
    [addDays(today, lead), addDays(today, -60), now.toISOString()]);
  let sent = 0;
  const call: string[] = [];
  for (const r of rows) {
    const canLine = s.recallAuto && r.line_user_id && r.followed && r.mk === true;
    if (!canLine) {
      if (await once(`recall-call:${r.id}`)) call.push(`• ${r.client_name || "ลูกค้า"} · ${r.name}`);
      continue;
    }
    if (!(await once(`recall:${r.id}`))) continue;
    try {
      await push(r.line_user_id, [M.recall(r.line_user_id, r.name, thaiDate(new Date(r.done_at)))], undefined);
      await q("update recalls set status = 'sent', sent_at = $2, updated_at = now() where id = $1", [r.id, now.toISOString()]);
      await logTouch(Number(r.client_id), "out", "recall", r.name, "system");
      sent++;
    } catch (e) { console.error("[recall] push", r.id, e); }
  }
  if (call.length) await notifyStaff(`🔁 ลูกค้าถึงรอบทำซ้ำ ต้องโทร/ทักเอง ${call.length} ราย\n${call.slice(0, 15).join("\n")}\n${process.env.APP_URL || ""}/staff/recall`);
  return sent;
}

/** Staff list: open recalls due within `ahead` days (and up to 60 days overdue). */
export async function recallList(now = new Date(), ahead = 14) {
  const today = todayBkk(now);
  return q(`
    select r.*, c.name as client_name, c.display_name, c.phone, c.line_user_id, t.done_at,
      (select granted from consents k where k.client_id = r.client_id and k.type = 'marketing' order by k.created_at desc, k.id desc limit 1) as mk
    from recalls r join clients c on c.id = r.client_id join treatments t on t.id = r.treatment_id
    where r.status = any($1) and r.due_on <= $2 and r.due_on > $3 order by r.due_on`, [OPEN, addDays(today, ahead), addDays(today, -60)]);
}

/** Lapsed: treated before, nothing in `days` days, nothing booked, no open recall. */
export async function lapsedClients(now = new Date(), days = 180) {
  return q(`
    select c.id, c.name, c.display_name, c.phone, c.line_user_id, max(t.done_at) as last_at, count(t.id)::int as visits,
      (select coalesce(sum(amount), 0)::float from payments p where p.client_id = c.id and p.voided_at is null) as revenue
    from clients c join treatments t on t.client_id = c.id
    where not exists (select 1 from appointments a where a.client_id = c.id and a.start_at >= $2 and a.status not in ('cancelled','no_show'))
      and not exists (select 1 from recalls r where r.client_id = c.id and r.status = any($3))
    group by c.id having max(t.done_at) < $1 order by max(t.done_at) desc limit 200`,
    [new Date(now.getTime() - days * 864e5).toISOString(), now.toISOString(), OPEN]);
}

export async function setRecallStatus(id: number, status: "contacted" | "dismissed" | "due", staffId: number, note?: string) {
  const r = await one(`update recalls set status = $2, contacted_at = case when $2 = 'contacted' then now() else contacted_at end,
    contacted_by = case when $2 = 'contacted' then $3 else contacted_by end, note = coalesce($4, note), updated_at = now() where id = $1 returning client_id`,
    [id, status, staffId, note?.trim() ? note.trim().slice(0, 300) : null]);
  return r ? Number(r.client_id) : null;
}

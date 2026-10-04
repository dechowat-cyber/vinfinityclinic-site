import { NextRequest } from "next/server";
import { q } from "./db";
import { push } from "./line";
import { getSettings } from "./settings";
import { reminder } from "./messages";
import { logTouch } from "./crm";
import { bkk, todayBkk, addDays, parts, thaiDate } from "./time";

export function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** D-1 reminder (FR-15). Idempotent via reminder_sent_at + LINE retry key. */
export async function sendReminders(now = new Date()) {
  const s = await getSettings();
  const t = todayBkk(now);
  const rows = await q(
    `select a.*, c.line_user_id, c.health_updated_at from appointments a join clients c on c.id = a.client_id
     where a.start_at >= $1 and a.start_at < $2 and a.status in ('booked','confirmed') and a.reminder_sent_at is null`,
    [bkk(addDays(t, 1), "00:00").toISOString(), bkk(addDays(t, 2), "00:00").toISOString()]);
  let sent = 0, noLine = 0, failed = 0;
  for (const a of rows) {
    if (!a.line_user_id) { noLine++; continue; }
    try {
      await push(a.line_user_id, [reminder(a as any, s, a.line_user_id, !a.health_updated_at)], `rem-${a.id}`);
      await q("update appointments set reminder_sent_at = now() where id = $1", [a.id]);
      await logTouch(a.client_id, "out", "reminder_d1", `appt ${a.id}`, "system");
      sent++;
    } catch { failed++; }
  }
  return { due: rows.length, sent, noLine, failed };
}

/** 20:00: mark stale no-shows, tell staff who is still unconfirmed for tomorrow. */
export async function eveningRun(now = new Date()) {
  const s = await getSettings();
  const t = todayBkk(now);
  const un = await q(
    `select a.start_at, c.name, c.display_name, c.phone, c.line_user_id from appointments a join clients c on c.id = a.client_id
     where a.start_at >= $1 and a.start_at < $2 and a.status = 'booked' order by a.start_at`,
    [bkk(addDays(t, 1), "00:00").toISOString(), bkk(addDays(t, 2), "00:00").toISOString()]);
  let listed = false;
  if (un.length && s.staffGroupId) {
    const lines = un.map((r) => `• ${parts(new Date(r.start_at)).time} ${r.name || r.display_name || "-"} ${r.phone || ""}${r.line_user_id ? "" : " (ไม่มี LINE โทรเตือน)"}`);
    await push(s.staffGroupId, [{ type: "text", text: `นัดพรุ่งนี้ ${thaiDate(new Date(bkk(addDays(t, 1), "12:00")))} ที่ยังไม่ยืนยัน ${un.length} ราย\n${lines.join("\n")}\nรบกวนโทรตามก่อนเที่ยงนะคะ` }], `eve-${addDays(t, 1)}`);
    listed = true;
  }
  return { unconfirmed: un.length, listed };
}

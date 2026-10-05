import { q, one } from "./db";
import { ClinicSettings } from "./settings";
import { bkk, parts, minutes, hhmm, todayBkk, addDays } from "./time";

export type Slot = { time: string; start: string; available: boolean };

/** Pure: list slots for a Bangkok date given settings and already-taken start instants (ISO). */
export function slotsFor(date: string, s: ClinicSettings, taken: Set<string>, doctor: string, now = new Date()): Slot[] {
  const wd = new Date(`${date}T00:00:00Z`).getUTCDay();
  const h = s.hours[wd];
  if (!h || s.closedDates.includes(date)) return [];
  if (date > addDays(todayBkk(now), s.horizonDays)) return [];
  const out: Slot[] = [];
  const earliest = now.getTime() + s.leadHours * 3600_000;
  for (let m = minutes(h.open); m + s.consultMinutes <= minutes(h.close); m += s.slotMinutes) {
    const start = bkk(date, hhmm(m));
    const iso = start.toISOString();
    out.push({ time: hhmm(m), start: iso, available: start.getTime() >= earliest && !taken.has(`${doctor}|${iso}`) });
  }
  return out;
}

export async function takenFor(date: string) {
  const from = bkk(date, "00:00"), to = bkk(addDays(date, 1), "00:00");
  const rows = await q<{ doctor: string; start_at: string | Date }>(
    `select doctor, start_at from appointments where start_at >= $1 and start_at < $2 and status not in ('cancelled','no_show')`,
    [from.toISOString(), to.toISOString()]);
  return new Set(rows.map((r) => `${r.doctor}|${new Date(r.start_at).toISOString()}`));
}

export async function availableSlots(date: string, s: ClinicSettings, doctor = s.doctors[0], now = new Date()) {
  return slotsFor(date, s, await takenFor(date), doctor, now);
}

export class SlotTakenError extends Error { constructor() { super("slot_taken"); } }

/**
 * Books a consult. The partial unique index appt_slot_lock makes double booking impossible
 * even if two people press confirm at the same moment (FR-12).
 */
export async function book(opts: {
  clientId: number; startIso: string; s: ClinicSettings; doctor?: string; source?: string | null; note?: string | null;
  createdBy?: string; now?: Date; skipRules?: boolean;
}) {
  const { s } = opts;
  const doctor = opts.doctor ?? s.doctors[0];
  const start = new Date(opts.startIso);
  if (isNaN(start.getTime())) throw new Error("bad_time");
  if (!opts.skipRules) {
    const p = parts(start);
    const ok = slotsFor(p.date, s, new Set(), doctor, opts.now).some((x) => x.start === start.toISOString() && x.available);
    if (!ok) throw new Error("outside_hours");
  }
  const end = new Date(start.getTime() + s.consultMinutes * 60000);
  try {
    const row = await one<{ id: number }>(
      `insert into appointments(client_id, branch, doctor, start_at, end_at, source, note, created_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
      [opts.clientId, s.branch, doctor, start.toISOString(), end.toISOString(), opts.source ?? null, opts.note ?? null, opts.createdBy ?? "client"]);
    await q(`update leads set status = 'Consult-Booked' where client_id = $1 and status not in ('Lost','Consult-Booked')`, [opts.clientId]);
    return row!.id as number;
  } catch (e: any) {
    if (String(e?.code) === "23505" || /appt_slot_lock|duplicate key/i.test(String(e?.message))) throw new SlotTakenError();
    throw e;
  }
}

export async function upcomingFor(clientId: number, now = new Date()) {
  return q(`select * from appointments where client_id = $1 and start_at >= $2 and status in ('booked','confirmed')
            order by start_at`, [clientId, new Date(now.getTime() - 3600_000).toISOString()]);
}

export async function setStatus(id: number, status: string, extra: "confirmed_at" | "arrived_at" | null = null) {
  const col = extra ? `, ${extra} = coalesce(${extra}, now())` : "";
  return one(`update appointments set status = $2${col} where id = $1 returning *`, [id, status]);
}

/** Moves a booking: books the new slot first, then cancels the old one, so the client never ends with nothing. */
export async function reschedule(apptId: number, clientId: number, newStartIso: string, s: ClinicSettings, now = new Date()) {
  const old = await one<{ id: number; client_id: number; doctor: string; source: string | null }>(
    "select * from appointments where id = $1 and client_id = $2 and status in ('booked','confirmed')", [apptId, clientId]);
  if (!old) throw new Error("not_found");
  const id = await book({ clientId, startIso: newStartIso, s, doctor: old.doctor, source: old.source, note: `rescheduled from #${apptId}`, now });
  await q("update appointments set status = 'cancelled' where id = $1", [apptId]);
  return id;
}

import { q, one } from "./db";
import { offerAudience, type Tier } from "./loyalty";

// Circle Talk and other member events: invite a tier over LINE, members reply with a button,
// seats are given in reply order up to capacity, then a waiting list.

export async function createEvent(o: { title: string; detail: string; startsAt: Date; capacity: number; minTier: Tier; staffId: number | null }) {
  const title = o.title.trim().slice(0, 60), detail = o.detail.trim().slice(0, 400);
  if (!title || !detail || !(o.startsAt.getTime() > Date.now())) throw new Error("bad_event");
  const who = await offerAudience({ minTier: o.minTier });
  if (!who.length) throw new Error("no_recipients");
  const e = await one("insert into events(title, detail, starts_at, capacity, min_tier, created_by) values ($1,$2,$3,$4,$5,$6) returning *",
    [title, detail, o.startsAt.toISOString(), Math.max(1, Math.min(200, o.capacity)), o.minTier, o.staffId]);
  await q("insert into event_rsvps(event_id, client_id, status) select $1, unnest($2::bigint[]), 'invited' on conflict do nothing", [e!.id, who.map((w) => w.id)]);
  return { event: e!, invited: who.length };
}

export async function sendInvites(eventId: number) {
  const e = await one("select * from events where id = $1", [eventId]);
  if (!e) return 0;
  const rows = await q(`select c.id, c.line_user_id from event_rsvps r join clients c on c.id = r.client_id where r.event_id = $1 and r.status = 'invited' and c.line_user_id is not null and c.followed`, [eventId]);
  const { push } = await import("./line");
  const M = await import("./messages");
  let n = 0;
  for (const r of rows) {
    try { await push(r.line_user_id, [M.eventInvite(r.line_user_id, e as any)], `event:${eventId}:${r.id}`); n++; }
    catch (err) { console.error("[event] invite", err); }
  }
  return n;
}

/** A member's reply from the invitation card. */
export async function rsvp(eventId: number, clientId: number, yes: boolean) {
  const e = await one("select id, title, starts_at, capacity from events where id = $1", [eventId]);
  const r = await one("select status from event_rsvps where event_id = $1 and client_id = $2", [eventId, clientId]);
  if (!e || !r) return { status: "not_invited" as const };
  if (new Date(e.starts_at) < new Date()) return { status: "past" as const, event: e };
  if (!yes) {
    await q("update event_rsvps set status = 'declined', replied_at = now() where event_id = $1 and client_id = $2", [eventId, clientId]);
    if (r.status === "going") await promote(eventId, e as any);
    return { status: "declined" as const, event: e };
  }
  if (r.status === "going") return { status: "going" as const, event: e };
  // seat if there is room (checked in the same statement, so two replies cannot both take the last seat)
  const got = await one(`update event_rsvps set status = 'going', replied_at = now() where event_id = $1 and client_id = $2
    and (select count(*) from event_rsvps x where x.event_id = $1 and x.status = 'going') < $3 returning status`, [eventId, clientId, e.capacity]);
  if (got) return { status: "going" as const, event: e };
  await q("update event_rsvps set status = 'waitlist', replied_at = now() where event_id = $1 and client_id = $2", [eventId, clientId]);
  return { status: "waitlist" as const, event: e };
}

export async function eventList(limit = 10) {
  return q(`select e.*, (select count(*)::int from event_rsvps r where r.event_id = e.id) invited,
      (select count(*)::int from event_rsvps r where r.event_id = e.id and r.status = 'going') going,
      (select count(*)::int from event_rsvps r where r.event_id = e.id and r.status = 'waitlist') waitlist,
      (select json_agg(json_build_object('id', c.id, 'name', coalesce(c.name, c.display_name), 'status', r.status) order by r.replied_at)
         from event_rsvps r join clients c on c.id = r.client_id where r.event_id = e.id and r.status in ('going','waitlist')) people
    from events e order by e.starts_at desc limit $1`, [limit]);
}

/** A seat came free: the first on the waiting list gets it and is told on LINE. */
async function promote(eventId: number, e: { title: string; starts_at: string }) {
  const w = await one(`update event_rsvps set status = 'going' where event_id = $1 and client_id = (
      select client_id from event_rsvps where event_id = $1 and status = 'waitlist' order by replied_at limit 1) returning client_id`, [eventId]);
  if (!w) return;
  const c = await one("select line_user_id, followed from clients where id = $1", [w.client_id]);
  if (!c?.line_user_id || !c.followed) return;
  const { push } = await import("./line");
  const when = new Date(e.starts_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok", dateStyle: "medium", timeStyle: "short" });
  await push(c.line_user_id, [{ type: "text", text: `มีที่นั่งว่างแล้วค่ะ 🎉 เรายืนยันที่นั่งของคุณใน ${e.title} (${when}) แล้วนะคะ ถ้าไม่สะดวก ตอบกลับในแชทนี้ได้เลยค่ะ` }], `event-up:${eventId}:${w.client_id}`).catch((err) => console.error("[event] promote", err));
}

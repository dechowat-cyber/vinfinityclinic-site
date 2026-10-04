import { q, one } from "./db";

// Identity resolution: the same person often arrives twice, once from LINE (line_user_id, no phone)
// and once at the counter or by phone (phone, no LINE). Clients are matched on the normalised phone
// (clients.phone_norm, a generated column: +66 / 66 / dashes → 0XXXXXXXXX) and merged by a manager.

/** Every table that points at a client. Moving these rows is what a merge is. */
const CLIENT_TABLES = ["leads", "touchpoints", "consents", "appointments", "consults", "photos", "photo_sessions", "plans", "treatments",
  "care_requests", "issues", "payments", "recalls", "health_access", "web_visits", "campaign_recipients", "conversions"];

/** Groups of clients sharing a phone number. */
export async function duplicateGroups() {
  const rows = await q(`
    select c.id, c.name, c.display_name, c.phone, c.phone_norm, c.line_user_id, c.source, c.created_at,
      (select count(*)::int from appointments a where a.client_id = c.id) as appts,
      (select coalesce(sum(amount), 0)::float from payments p where p.client_id = c.id and p.voided_at is null) as revenue
    from clients c
    where c.phone_norm in (select phone_norm from clients where phone_norm is not null group by phone_norm having count(*) > 1)
    order by c.phone_norm, (c.line_user_id is not null) desc, c.id`);
  const groups = new Map<string, typeof rows>();
  for (const r of rows) groups.set(r.phone_norm, [...(groups.get(r.phone_norm) ?? []), r]);
  return [...groups.values()];
}

/** Other clients with the same phone as this one (for the banner on the client page). */
export async function possibleDuplicates(clientId: number) {
  return q(`select d.id, d.name, d.display_name, d.line_user_id from clients c join clients d on d.phone_norm = c.phone_norm and d.id <> c.id
    where c.id = $1 and c.phone_norm is not null order by d.id`, [clientId]);
}

/**
 * Merges `secondaryId` into `primaryId`: every related row moves to the primary, empty fields on the
 * primary are filled from the secondary (LINE id, phone, name, referral code, health form), then the
 * secondary is deleted. A snapshot of the secondary is kept in client_merges.
 */
export async function mergeClients(primaryId: number, secondaryId: number, staffId: number | null) {
  if (!primaryId || !secondaryId || primaryId === secondaryId) throw new Error("bad_pair");
  const [p, s] = await Promise.all([one("select * from clients where id = $1", [primaryId]), one("select * from clients where id = $1", [secondaryId])]);
  if (!p || !s) throw new Error("not_found");
  if (p.line_user_id && s.line_user_id) throw new Error("two_line_accounts"); // two LINE accounts are two people (or need a human)
  const { data: _bin, ...snap } = s as Record<string, unknown>;
  await q("insert into client_merges(primary_id, secondary_id, snapshot, merged_by) values ($1,$2,$3,$4)", [primaryId, secondaryId, JSON.stringify(snap), staffId]);

  // rows that would collide on a unique index once moved
  await q(`update leads set status = 'Lost', lost_reason = 'merged_duplicate' where client_id = $2 and status not in ('Lost','Consult-Booked')
    and exists (select 1 from leads where client_id = $1 and status not in ('Lost','Consult-Booked'))`, [primaryId, secondaryId]);
  await q("delete from campaign_recipients where client_id = $2 and campaign_id in (select campaign_id from campaign_recipients where client_id = $1)", [primaryId, secondaryId]);

  // one statement, so the move and the delete succeed or fail together
  const moves = CLIENT_TABLES.map((t, i) => `m${i} as (update ${t} set client_id = $1 where client_id = $2)`);
  await q(`with ${moves.join(", ")},
    r1 as (update clients set referred_by = $1 where referred_by = $2),
    r2 as (update leads set referred_by = $1 where referred_by = $2)
    delete from clients where id = $2`, [primaryId, secondaryId]);

  // fill gaps on the primary now that the secondary's unique values are free
  await q(`update clients set line_user_id = coalesce(line_user_id, $2), display_name = coalesce(display_name, $3), picture_url = coalesce(picture_url, $4),
      name = coalesce(name, $5), phone = coalesce(phone, $6), ref_code = coalesce(ref_code, $7), referred_by = coalesce(referred_by, $8),
      source = coalesce(source, $9), health = coalesce(health, $10), health_updated_at = coalesce(health_updated_at, $11),
      followed = case when $2::text is not null and line_user_id is null then $12 else followed end,
      created_at = least(created_at, $13)
    where id = $1`,
    [primaryId, s.line_user_id, s.display_name, s.picture_url, s.name, s.phone, s.ref_code, s.referred_by === primaryId ? null : s.referred_by,
      s.source, s.health ? JSON.stringify(s.health) : null, s.health_updated_at, s.followed, s.created_at]);
  await q("update clients set referred_by = null where id = $1 and referred_by = $1", [primaryId]);
  return primaryId;
}

/** Picks which record survives: the one with LINE (messages keep working), else the older one. */
export function pickPrimary<T extends Record<string, any>>(a: T, b: T): [T, T] {
  if (!!a.line_user_id !== !!b.line_user_id) return a.line_user_id ? [a, b] : [b, a];
  return Number(a.id) < Number(b.id) ? [a, b] : [b, a];
}

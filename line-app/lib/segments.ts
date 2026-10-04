import { q, one } from "./db";
import { push } from "./line";
import * as M from "./messages";
import { logTouch } from "./crm";

// Segments: who to talk to, built from what the clinic already knows (channel, treatments, spend,
// last visit). Campaigns go out over LINE only to clients who agreed to marketing and still follow the OA.

export type Filters = {
  sources?: string[];
  /** catalog ids: has had any of these */
  treated?: number[];
  /** catalog ids: has never had any of these */
  notTreated?: number[];
  /** no treatment in at least N days (only clients treated before) */
  lapsedDays?: number;
  /** treated within the last N days */
  recentDays?: number;
  minSpend?: number;
  minVisits?: number;
  /** became a client within the last N days */
  newDays?: number;
  /** nothing booked from today on */
  noUpcoming?: boolean;
  /** only those who can receive a LINE campaign */
  reachableOnly?: boolean;
};

export const SEGMENT_ROLES = ["BM", "MK"];
export const SEND_ROLES = ["BM"];

/** Turns filters into SQL. Every value is a bind parameter. */
function where(f: Filters, now: Date, params: unknown[]) {
  const w: string[] = [];
  const p = (v: unknown) => { params.push(v); return `$${params.length}`; };
  if (f.sources?.length) w.push(`coalesce(x.source, 'unknown') = any(${p(f.sources)}::text[])`);
  if (f.treated?.length) w.push(`exists (select 1 from treatments t where t.client_id = x.id and t.catalog_id = any(${p(f.treated)}::bigint[]))`);
  if (f.notTreated?.length) w.push(`not exists (select 1 from treatments t where t.client_id = x.id and t.catalog_id = any(${p(f.notTreated)}::bigint[]))`);
  if (f.lapsedDays) w.push(`x.last_visit is not null and x.last_visit < ${p(new Date(now.getTime() - f.lapsedDays * 864e5).toISOString())}`);
  if (f.recentDays) w.push(`x.last_visit >= ${p(new Date(now.getTime() - f.recentDays * 864e5).toISOString())}`);
  if (f.minSpend) w.push(`x.spend >= ${p(f.minSpend)}`);
  if (f.minVisits) w.push(`x.visits >= ${p(f.minVisits)}`);
  if (f.newDays) w.push(`x.created_at >= ${p(new Date(now.getTime() - f.newDays * 864e5).toISOString())}`);
  if (f.noUpcoming) w.push(`not exists (select 1 from appointments a where a.client_id = x.id and a.start_at >= ${p(now.toISOString())} and a.status not in ('cancelled','no_show'))`);
  if (f.reachableOnly) w.push("x.reachable");
  return w.length ? `where ${w.join(" and ")}` : "";
}

const BASE = `
  select c.id, c.name, c.display_name, c.phone, c.source, c.created_at, c.line_user_id, c.followed,
    (select max(t.done_at) from treatments t where t.client_id = c.id) as last_visit,
    (select count(distinct (t.done_at at time zone 'Asia/Bangkok')::date)::int from treatments t where t.client_id = c.id) as visits,
    (select coalesce(sum(p.amount), 0)::float from payments p where p.client_id = c.id and p.voided_at is null) as spend,
    (c.line_user_id is not null and c.followed and coalesce((select k.granted from consents k where k.client_id = c.id and k.type = 'marketing'
      order by k.created_at desc, k.id desc limit 1), false)) as reachable
  from clients c`;

export async function segmentMembers(f: Filters, now = new Date(), limit = 5000) {
  const params: unknown[] = [];
  const w = where(f, now, params);
  return q(`select * from (${BASE}) x ${w} order by x.spend desc, x.id desc limit ${Math.min(limit, 5000)}`, params);
}

export async function segmentCounts(f: Filters, now = new Date()) {
  const params: unknown[] = [];
  const w = where(f, now, params);
  const r = await one(`select count(*)::int as total, count(*) filter (where x.reachable)::int as reachable, coalesce(sum(x.spend), 0)::float as spend from (${BASE}) x ${w}`, params);
  return { total: Number(r!.total), reachable: Number(r!.reachable), spend: Number(r!.spend) };
}

/** Reads filters from a form / query string. Unknown keys are ignored. */
export function filtersFrom(get: (k: string) => string | null, getAll: (k: string) => string[]): Filters {
  const n = (k: string) => { const v = Number(get(k)); return v > 0 ? Math.round(v) : undefined; };
  const ids = (k: string) => getAll(k).map(Number).filter((x) => x > 0);
  const f: Filters = {
    sources: getAll("source").filter(Boolean), treated: ids("treated"), notTreated: ids("not_treated"),
    lapsedDays: n("lapsed"), recentDays: n("recent"), minSpend: n("min_spend"), minVisits: n("min_visits"), newDays: n("new"),
    noUpcoming: get("no_upcoming") === "on" || get("no_upcoming") === "1", reachableOnly: get("reachable") === "on" || get("reachable") === "1",
  };
  for (const k of Object.keys(f) as (keyof Filters)[]) { const v = f[k]; if (v === undefined || v === false || (Array.isArray(v) && !v.length)) delete f[k]; }
  return f;
}

export function filtersQuery(f: Filters) {
  const p = new URLSearchParams();
  f.sources?.forEach((s) => p.append("source", s));
  f.treated?.forEach((s) => p.append("treated", String(s)));
  f.notTreated?.forEach((s) => p.append("not_treated", String(s)));
  const map: [keyof Filters, string][] = [["lapsedDays", "lapsed"], ["recentDays", "recent"], ["minSpend", "min_spend"], ["minVisits", "min_visits"], ["newDays", "new"]];
  for (const [k, qk] of map) if (f[k]) p.set(qk, String(f[k]));
  if (f.noUpcoming) p.set("no_upcoming", "1");
  if (f.reachableOnly) p.set("reachable", "1");
  return p.toString();
}

/** Creates a campaign for the reachable members and sends the first batch. The scheduler sends the rest. */
export async function createCampaign(o: { name: string; filters: Filters; message: string; withBooking: boolean; staffId: number | null; segmentId?: number | null; now?: Date }) {
  const message = o.message.trim().slice(0, 1000);
  if (!message) throw new Error("empty_message");
  const members = (await segmentMembers(o.filters, o.now)).filter((m) => m.reachable);
  if (!members.length) throw new Error("no_recipients");
  const c = await one(`insert into campaigns(segment_id, name, filters, message, with_booking, recipients, created_by) values ($1,$2,$3,$4,$5,$6,$7) returning id`,
    [o.segmentId ?? null, o.name.trim().slice(0, 120) || "แคมเปญ", JSON.stringify(o.filters), message, o.withBooking, members.length, o.staffId]);
  const id = Number(c!.id);
  await q("insert into campaign_recipients(campaign_id, client_id) select $1, unnest($2::bigint[]) on conflict do nothing", [id, members.map((m) => m.id)]);
  await sendCampaignBatch(50, id);
  return { id, recipients: members.length };
}

/** Sends up to `limit` pending messages (all campaigns, or one). Consent is re-checked at send time. */
export async function sendCampaignBatch(limit = 200, campaignId?: number) {
  const rows = await q(`
    select r.campaign_id, r.client_id, c.line_user_id, c.followed, k.message, k.with_booking,
      (select g.granted from consents g where g.client_id = c.id and g.type = 'marketing' order by g.created_at desc, g.id desc limit 1) as mk
    from campaign_recipients r join campaigns k on k.id = r.campaign_id join clients c on c.id = r.client_id
    where r.sent_at is null ${campaignId ? "and r.campaign_id = $2" : ""} order by r.campaign_id limit $1`, campaignId ? [limit, campaignId] : [limit]);
  let sent = 0;
  const one_ = async (r: (typeof rows)[number]) => {
    const ok = r.line_user_id && r.followed && r.mk === true;
    try {
      if (ok) await push(r.line_user_id, [M.campaign(r.line_user_id, r.message, r.with_booking, Number(r.campaign_id))], `camp:${r.campaign_id}:${r.client_id}`);
      await q("update campaign_recipients set sent_at = now() where campaign_id = $1 and client_id = $2", [r.campaign_id, r.client_id]);
      if (ok) { await logTouch(Number(r.client_id), "out", "campaign", String(r.campaign_id), "system"); sent++; }
    } catch (e) { console.error("[campaign] push", r.campaign_id, r.client_id, e); }
  };
  for (let i = 0; i < rows.length; i += 10) await Promise.all(rows.slice(i, i + 10).map(one_));
  if (rows.length) await q(`update campaigns k set sent = (select count(*) from campaign_recipients r where r.campaign_id = k.id and r.sent_at is not null)
    where k.id = any($1::bigint[])`, [[...new Set(rows.map((r) => Number(r.campaign_id)))]]);
  return sent;
}

/** Results: bookings made within 14 days and revenue within 30 days of each message. */
export async function campaignResults(limit = 20) {
  return q(`
    select k.id, k.name, k.created_at, k.recipients, k.sent, k.message,
      (select count(distinct r.client_id)::int from campaign_recipients r join appointments a on a.client_id = r.client_id
        where r.campaign_id = k.id and r.sent_at is not null and a.created_at between r.sent_at and r.sent_at + interval '14 days' and a.status <> 'cancelled') as booked,
      (select coalesce(sum(p.amount), 0)::float from campaign_recipients r join payments p on p.client_id = r.client_id
        where r.campaign_id = k.id and r.sent_at is not null and p.voided_at is null and p.created_at between r.sent_at and r.sent_at + interval '30 days') as revenue
    from campaigns k order by k.id desc limit $1`, [limit]);
}

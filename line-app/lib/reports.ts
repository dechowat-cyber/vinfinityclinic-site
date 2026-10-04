import { q, one } from "./db";
import { SOURCES } from "./source";
import { bkk, todayBkk, addDays } from "./time";

export const REPORT_ROLES = ["BM", "MK"];
export const SOURCE_LABEL: Record<string, string> = {
  ...Object.fromEntries(Object.entries(SOURCES).map(([k, v]) => [k, v.replace(/^จาก/, "")])),
  walkin: "Walk-in", ref: "เพื่อนแนะนำ", line: "LINE (เพิ่มเพื่อนเอง)", unknown: "ไม่ทราบ",
};
export const PERIODS: Record<string, string> = { month: "เดือนนี้", last: "เดือนที่แล้ว", d90: "90 วัน", year: "ปีนี้" };

/** [from, to) in Bangkok days for a named period */
export function periodRange(key: string, now = new Date()): [string, string] {
  const today = todayBkk(now);
  const [y, m] = today.split("-").map(Number);
  const first = (yy: number, mm: number) => `${yy}-${String(mm).padStart(2, "0")}-01`;
  const end = addDays(today, 1);
  if (key === "last") return [first(m === 1 ? y - 1 : y, m === 1 ? 12 : m - 1), first(y, m)];
  if (key === "d90") return [addDays(today, -89), end];
  if (key === "year") return [first(y, 1), end];
  return [first(y, m), end];
}
const iso = (d: string) => bkk(d, "00:00").toISOString();

export type FunnelRow = { src: string; clients: number; booked: number; arrived: number; treated: number; paid: number; repeat: number; revenue: number };

/**
 * Cohort funnel: new clients first seen in the period, by first-touch source, followed all the way to money
 * (revenue counts every payment those clients have made so far, not only inside the period).
 */
export async function funnel(from: string, to: string): Promise<FunnelRow[]> {
  const rows = await q(`
    with cohort as (
      select c.id, coalesce(nullif(c.source, ''), (select l.source from leads l where l.client_id = c.id order by l.id limit 1), 'unknown') as src
      from clients c where c.created_at >= $1 and c.created_at < $2
    ), f as (
      select src,
        exists (select 1 from appointments a where a.client_id = cohort.id) as booked,
        exists (select 1 from appointments a where a.client_id = cohort.id and (a.arrived_at is not null or a.status in ('arrived','in_consult','done'))) as arrived,
        exists (select 1 from treatments t where t.client_id = cohort.id) as treated,
        (select count(distinct (t.done_at at time zone 'Asia/Bangkok')::date) from treatments t where t.client_id = cohort.id) as visits,
        (select coalesce(sum(p.amount), 0) from payments p where p.client_id = cohort.id and p.voided_at is null) as revenue
      from cohort
    )
    select src, count(*)::int as clients, count(*) filter (where booked)::int as booked, count(*) filter (where arrived)::int as arrived,
      count(*) filter (where treated)::int as treated, count(*) filter (where revenue > 0)::int as paid,
      count(*) filter (where visits >= 2)::int as repeat, coalesce(sum(revenue), 0)::float as revenue
    from f group by src order by count(*) desc, src`, [iso(from), iso(to)]);
  return rows.map((r) => ({ src: r.src, clients: r.clients, booked: r.booked, arrived: r.arrived, treated: r.treated, paid: r.paid, repeat: r.repeat, revenue: Number(r.revenue) }));
}

/** Money and activity inside the period. */
export async function periodKpis(from: string, to: string) {
  const [f, t] = [iso(from), iso(to)];
  const [tot, methods, split, tx, rc] = await Promise.all([
    one(`select coalesce(sum(amount), 0)::float as revenue, count(*)::int as receipts, count(distinct client_id)::int as payers
      from payments where voided_at is null and created_at >= $1 and created_at < $2`, [f, t]),
    q(`select method, coalesce(sum(amount), 0)::float as amount, count(*)::int as n from payments
      where voided_at is null and created_at >= $1 and created_at < $2 group by method order by 2 desc`, [f, t]),
    // new = first ever payment falls inside the period
    one(`select coalesce(sum(p.amount) filter (where fp.first_at >= $1), 0)::float as new_rev, coalesce(sum(p.amount) filter (where fp.first_at < $1), 0)::float as returning_rev
      from payments p join (select client_id, min(created_at) first_at from payments where voided_at is null group by client_id) fp on fp.client_id = p.client_id
      where p.voided_at is null and p.created_at >= $1 and p.created_at < $2`, [f, t]),
    q(`select name, count(*)::int as n, count(distinct client_id)::int as clients from treatments where done_at >= $1 and done_at < $2 group by name order by 2 desc limit 10`, [f, t]),
    one(`select count(*) filter (where coalesce(sent_at, contacted_at) >= $1 and coalesce(sent_at, contacted_at) < $2)::int as reached,
        count(*) filter (where status = 'booked' and coalesce(sent_at, contacted_at) >= $1 and coalesce(sent_at, contacted_at) < $2)::int as booked,
        count(*) filter (where status in ('due','sent','contacted'))::int as open
      from recalls`, [f, t]),
  ]);
  return {
    revenue: Number(tot!.revenue), receipts: Number(tot!.receipts), payers: Number(tot!.payers),
    avgTicket: tot!.receipts ? Number(tot!.revenue) / Number(tot!.receipts) : 0,
    methods: methods.map((m) => ({ method: m.method, amount: Number(m.amount), n: m.n })),
    newRevenue: Number(split!.new_rev), returningRevenue: Number(split!.returning_rev),
    treatments: tx.map((x) => ({ name: x.name, n: x.n, clients: x.clients })),
    recall: { reached: Number(rc!.reached), booked: Number(rc!.booked), open: Number(rc!.open) },
  };
}

/** Revenue per calendar month (Bangkok), newest last. */
export async function monthlyRevenue(months = 6, now = new Date()) {
  const [y, m] = todayBkk(now).split("-").map(Number);
  const out: { month: string; revenue: number; payers: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    const from = d.toISOString().slice(0, 10);
    const to = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
    const r = await one(`select coalesce(sum(amount), 0)::float as revenue, count(distinct client_id)::int as payers from payments
      where voided_at is null and created_at >= $1 and created_at < $2`, [iso(from), iso(to)]);
    out.push({ month: from.slice(0, 7), revenue: Number(r!.revenue), payers: Number(r!.payers) });
  }
  return out;
}

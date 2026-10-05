import { q, one } from "./db";
import { bkk, addDays, todayBkk, thaiDate, parts } from "./time";
import { METHODS, baht } from "./payments";

// Daily money summary: receipts issued in the system, the card terminal and cash drawer counts entered at
// close, and slips still waiting. Week = Monday to today, month = the 1st to today (Bangkok time).

const range = (from: string, toIncl: string) => [bkk(from, "00:00").toISOString(), bkk(addDays(toIncl, 1), "00:00").toISOString()];
export const weekStart = (day: string) => { const wd = new Date(`${day}T12:00:00+07:00`).getUTCDay(); return addDays(day, -((wd + 6) % 7)); };
export const monthStart = (day: string) => `${day.slice(0, 8)}01`;

export async function totals(from: string, toIncl: string) {
  const [a, b] = range(from, toIncl);
  const rows = await q(`select method, count(*)::int n, coalesce(sum(amount),0)::float amt from payments
    where created_at >= $1 and created_at < $2 and voided_at is null group by method`, [a, b]);
  const voids = await one(`select count(*)::int n, coalesce(sum(amount),0)::float amt from payments where voided_at is not null and created_at >= $1 and created_at < $2`, [a, b]);
  const by: Record<string, { n: number; amt: number }> = {};
  for (const r of rows) by[r.method] = { n: Number(r.n), amt: Number(r.amt) };
  // money received: Wallet use is paid out of a top-up that was already counted when it was sold
  const cashRows = rows.filter((r) => r.method !== "wallet");
  const total = cashRows.reduce((s, r) => s + Number(r.amt), 0), n = cashRows.reduce((s, r) => s + Number(r.n), 0);
  // sales written on the staff form (pre-bot days, or posted in the group) that are not already a receipt here
  const { manualTotals } = await import("./salesForm");
  const man = await manualTotals(from, toIncl).catch(() => []);
  let mt = 0, mn = 0;
  for (const r of man) { const b0 = by[r.method] ?? { n: 0, amt: 0 }; by[r.method] = { n: b0.n + r.n, amt: b0.amt + r.amt }; mt += r.amt; mn += r.n; }
  return { by, total: total + mt, n: n + mn, manual: { n: mn, amt: mt }, voids: { n: Number(voids?.n ?? 0), amt: Number(voids?.amt ?? 0) } };
}

export async function dayClose(day: string) {
  return one<{ edc: string | null; cash: string | null; note: string | null; closed_at: string }>("select edc, cash, note, closed_at from day_closes where day = $1", [day]);
}

export async function saveDayClose(day: string, edc: number | null, cash: number | null, note: string, staffId: number) {
  await q(`insert into day_closes(day, edc, cash, note, closed_by) values ($1,$2,$3,$4,$5)
    on conflict (day) do update set edc = excluded.edc, cash = excluded.cash, note = excluded.note, closed_by = excluded.closed_by, closed_at = now()`,
    [day, edc, cash, note.slice(0, 300) || null, staffId]);
}

const fmt = (n: number) => Number(n).toLocaleString("th-TH", { maximumFractionDigits: 2 });
const diff = (declared: number, system: number) => { const d = Math.round((declared - system) * 100) / 100; return d === 0 ? "ตรง ✓" : d > 0 ? `เกิน ${fmt(d)} ⚠️` : `ขาด ${fmt(-d)} ⚠️`; };
const shortDate = (d: string) => thaiDate(new Date(`${d}T12:00:00+07:00`)).replace(/^วัน\S+ /, "");

export function closeLine(c: { edc: string | null; cash: string | null } | null, t: { by: Record<string, { amt: number }> }) {
  if (!c) return "ปิดยอด: ยังไม่ได้ปิดยอด";
  const card = t.by.card?.amt ?? 0, cash = t.by.cash?.amt ?? 0;
  const parts: string[] = [];
  if (c.edc !== null) parts.push(`เครื่องรูดบัตร ${fmt(Number(c.edc))} (${diff(Number(c.edc), card)})`);
  if (c.cash !== null) parts.push(`เงินสดนับได้ ${fmt(Number(c.cash))} (${diff(Number(c.cash), cash)})`);
  return `ปิดยอด: ${parts.join(" · ") || "-"}`;
}

/** Daily sales target (settings.salesTargetDay, default 50,000) over the days the clinic is open. */
export async function salesTarget(day: string) {
  const { getSettings } = await import("./settings");
  const s: any = await getSettings();
  const perDay = Number(s.salesTargetDay ?? 50000);
  if (!perDay) return { day: 0, month: 0, soFar: 0 };
  const open = (d: string) => !!s.hours?.[new Date(`${d}T12:00:00+07:00`).getUTCDay()] && !(s.closedDates ?? []).includes(d);
  let month = 0, soFar = 0;
  for (let d = monthStart(day); d.slice(0, 7) === day.slice(0, 7); d = addDays(d, 1)) { if (open(d)) { month += perDay; if (d <= day) soFar += perDay; } }
  return { day: open(day) ? perDay : 0, month, soFar };
}

/** The 19:00 message for the management group. */
export async function dailyReport(now = new Date()) {
  const day = todayBkk(now);
  const [t, w, m, close, pending] = await Promise.all([
    totals(day, day), totals(weekStart(day), day), totals(monthStart(day), day), dayClose(day),
    one("select count(*)::int n from slips where status = 'pending'"),
  ]);
  // same days last month, for a fair comparison
  const lmEnd = (() => { const [y, mo, d] = day.split("-").map(Number); const pm = mo === 1 ? 12 : mo - 1, py = mo === 1 ? y - 1 : y;
    const last = new Date(Date.UTC(py, pm, 0)).getUTCDate(); return `${py}-${String(pm).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`; })();
  const lm = await totals(monthStart(lmEnd), lmEnd);
  const target = await salesTarget(day);
  const { sellerTotals } = await import("./salesForm");
  const st = await sellerTotals(monthStart(day), day).catch(() => []);
  const bySeller: Record<string, number> = {};
  for (const r of st) bySeller[r.seller] = (bySeller[r.seller] ?? 0) + Number(r.amt);
  const sellers = Object.entries(bySeller).map(([k, v]) => `${k} ${fmt(v)}`);
  const wd = new Date(`${day}T12:00:00+07:00`).getUTCDay();
  const isLastOfMonth = addDays(day, 1).slice(8) === "01";
  const head = isLastOfMonth ? "📊 สรุปยอดประจำเดือน" : wd === 0 ? "📊 สรุปยอดประจำสัปดาห์" : "📊 สรุปยอดรายวัน";
  const methods = Object.entries(METHODS).filter(([k]) => k !== "wallet").map(([k, l]) => (t.by[k] ? `${l} ${fmt(t.by[k].amt)}` : null)).filter(Boolean).join(" · ") || "-";
  const topups = await one(`select coalesce(sum(amount),0)::float a, count(*)::int n from payments where kind = 'wallet_topup' and voided_at is null and created_at >= $1 and created_at < $2`,
    [bkk(day, "00:00").toISOString(), bkk(addDays(day, 1), "00:00").toISOString()]);
  const pct = lm.total > 0 ? ` (${m.total >= lm.total ? "+" : ""}${Math.round(((m.total - lm.total) / lm.total) * 100)}% เทียบช่วงเดียวกันเดือนก่อน)` : "";
  return [
    `${head} · ${thaiDate(new Date(`${day}T12:00:00+07:00`))}`,
    "",
    `วันนี้ ${baht(t.total)} · ${t.n} รายการ`,
    ...(t.manual.n ? [`  (รวมยอดจากฟอร์มพนักงาน ${t.manual.n} รายการ ${fmt(t.manual.amt)})`] : []),
    `  ${methods}`,
    ...(target.day ? [`  เป้าวันนี้ ${fmt(target.day)} · ทำได้ ${Math.round((t.total / target.day) * 100)}%`] : []),
    ...(t.voids.n ? [`  ยกเลิกใบเสร็จ ${t.voids.n} ใบ (${fmt(t.voids.amt)})`] : []),
    ...(Number(topups?.n) ? [`  ในยอดนี้เป็นการเติม Wallet ${topups!.n} รายการ ${fmt(Number(topups!.a))} (เงินรับล่วงหน้า)`] : []),
    ...(t.by.wallet ? [`  ลูกค้าใช้ Wallet จ่ายค่าบริการ ${fmt(t.by.wallet.amt)} (${t.by.wallet.n} ใบ · ไม่นับซ้ำในยอดรับ)`] : []),
    closeLine(close, t),
    ...(Number(pending?.n) ? [`สลิปโอนรอยืนยัน ${pending!.n} ใบ`] : []),
    "",
    `สัปดาห์นี้ (${shortDate(weekStart(day))} – ${shortDate(day)}) ${baht(w.total)}`,
    `เดือนนี้ (${shortDate(monthStart(day))} – ${shortDate(day)}) ${baht(m.total)}${pct}`,
    ...(target.month ? [`  เป้าเดือน ${fmt(target.month)} · ถึงวันนี้ ${Math.round((m.total / target.month) * 100)}% (ควรถึง ${fmt(target.soFar)})`] : []),
    ...(sellers.length ? ["  แยกคน (จากตารางรายวัน): " + sellers.join(" · ")] : []),
    "",
    `ยอดที่รับหลังส่งรายงานนี้ จะนับในยอดสัปดาห์/เดือนของรายงานพรุ่งนี้ · ${process.env.APP_URL || ""}/staff/finance`,
  ].join("\n");
}

export { parts };

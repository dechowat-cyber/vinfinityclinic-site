import crypto from "node:crypto";
import { q, one } from "./db";

// Vinfinity Circle. Tiers follow money actually received in the last 12 months (receipts, voids excluded),
// with the same thresholds as the Wallet top-ups in the menu book, so a Wallet purchase lifts the tier at once.
// A tier, once reached, is kept for 12 months even if spending slows.

export type Tier = "member" | "silver" | "gold" | "platinum";
export const TIERS: { key: Tier; name: string; min: number; color: string; perks: string[] }[] = [
  { key: "member", name: "Member", min: 0, color: "#3A5496", perks: [
    "โปรลับเฉพาะสมาชิกทาง LINE", "V Circle ชวนเพื่อน ได้เครดิตฝ่ายละ 1,000", "สิทธิพิเศษเดือนเกิด"] },
  { key: "silver", name: "Silver", min: 30_000, color: "#8A97B1", perks: [
    "ทุกสิทธิ์ของ Member", "ตรวจวิเคราะห์ผิวฟรีทุกครั้งที่มา", "โปรลับระดับ Silver ขึ้นไป"] },
  { key: "gold", name: "Gold", min: 75_000, color: "#B8975A", perks: [
    "ทุกสิทธิ์ของ Silver", "Aqua Peel ฟรี 2 ครั้งต่อปี", "เชิญร่วม Circle Talk กับคุณหมอ (กลุ่มเล็ก)", "ทดลองโปรแกรมใหม่ก่อนใคร"] },
  { key: "platinum", name: "Platinum", min: 150_000, color: "#0B142E", perks: [
    "ทุกสิทธิ์ของ Gold", "สมาชิก Architect Care 1 ปี", "นัดคิวพิเศษกับคุณหมอ นอกช่วงเวลาปกติ", "ผู้ดูแลส่วนตัวทาง LINE"] },
];
export const RANK: Record<Tier, number> = { member: 0, silver: 1, gold: 2, platinum: 3 };
export const tierInfo = (t: string | null | undefined) => TIERS.find((x) => x.key === t) ?? TIERS[0];

export async function spend12m(clientId: number, now = new Date()) {
  const r = await one(`select coalesce(sum(amount),0)::float s from payments where client_id = $1 and voided_at is null and created_at > $2`,
    [clientId, new Date(now.getTime() - 365 * 864e5).toISOString()]);
  return Number(r?.s ?? 0);
}
export const tierFor = (spend: number): Tier => [...TIERS].reverse().find((t) => spend >= t.min)!.key;

/**
 * Re-evaluates one client. Upgrades at once (held 12 months); downgrades only after the hold ends.
 * Returns the change, if any, so the caller can congratulate the client.
 */
export async function refreshTier(clientId: number, now = new Date()) {
  const c = await one<{ tier: Tier; tier_until: string | null }>("select tier, tier_until from clients where id = $1", [clientId]);
  if (!c) return null;
  const spend = await spend12m(clientId, now);
  const earned = tierFor(spend), cur = (c.tier || "member") as Tier;
  const held = c.tier_until && new Date(c.tier_until) > now;
  let next = cur;
  if (RANK[earned] > RANK[cur]) next = earned;
  else if (RANK[earned] < RANK[cur] && !held) next = earned;
  if (next === cur) {
    if (RANK[earned] === RANK[cur] && earned !== "member") await q("update clients set tier_until = greatest(tier_until, $2) where id = $1", [clientId, new Date(now.getTime() + 365 * 864e5).toISOString()]);
    return { from: cur, to: cur, spend, changed: false };
  }
  await q("update clients set tier = $2, tier_until = $3 where id = $1", [clientId, next, next === "member" ? null : new Date(now.getTime() + 365 * 864e5).toISOString()]);
  return { from: cur, to: next, spend, changed: true, up: RANK[next] > RANK[cur] };
}

/** Nightly: lets tiers whose 12-month hold ended fall back to what the spend now earns. */
export async function expireTiers(now = new Date()) {
  const rows = await q("select id from clients where tier <> 'member' and tier_until is not null and tier_until < $1", [now.toISOString()]);
  let n = 0;
  for (const r of rows) if ((await refreshTier(Number(r.id), now))?.changed) n++;
  return n;
}

export function progress(spend: number, tier: Tier) {
  const next = TIERS.find((t) => RANK[t.key] === RANK[tier] + 1);
  return next ? { next: next.name, need: Math.max(0, next.min - spend), pct: Math.min(100, Math.round((spend / next.min) * 100)) } : null;
}

// ---------- secret offers ----------
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
export function newCode() {
  const b = crypto.randomBytes(6);
  return "VC-" + Array.from(b, (x) => ALPHA[x % ALPHA.length]).join("");
}

/** Clients an offer goes to: reachable on LINE with marketing consent, tier at least min, optionally lapsed N days. */
export async function offerAudience(o: { minTier: Tier; lapsedDays?: number | null }, now = new Date()) {
  const params: unknown[] = [RANK[o.minTier]];
  let lapsed = "";
  if (o.lapsedDays) {
    params.push(new Date(now.getTime() - o.lapsedDays * 864e5).toISOString());
    lapsed = `and coalesce((select max(t.done_at) from treatments t where t.client_id = c.id), c.created_at) < $2`;
  }
  return q<{ id: number }>(`select c.id from clients c
    where c.line_user_id is not null and c.followed
      and coalesce((select k.granted from consents k where k.client_id = c.id and k.type = 'marketing' order by k.created_at desc, k.id desc limit 1), false)
      and (case c.tier when 'platinum' then 3 when 'gold' then 2 when 'silver' then 1 else 0 end) >= $1 ${lapsed}`, params);
}

export async function createOffer(o: { title: string; detail: string; minTier: Tier; lapsedDays?: number | null; validDays: number; staffId: number | null; now?: Date }) {
  const now = o.now ?? new Date();
  const title = o.title.trim().slice(0, 60), detail = o.detail.trim().slice(0, 400);
  if (!title || !detail) throw new Error("empty");
  const who = await offerAudience(o, now);
  if (!who.length) throw new Error("no_recipients");
  const off = await one("insert into offers(title, detail, min_tier, lapsed_days, valid_days, issued, created_by) values ($1,$2,$3,$4,$5,$6,$7) returning id",
    [title, detail, o.minTier, o.lapsedDays || null, o.validDays, who.length, o.staffId]);
  const exp = new Date(now.getTime() + o.validDays * 864e5).toISOString();
  for (const c of who) {
    for (let i = 0; i < 5; i++) {
      try { await q("insert into offer_codes(offer_id, client_id, code, expires_at) values ($1,$2,$3,$4)", [off!.id, c.id, newCode(), exp]); break; }
      catch (e) { if (!/unique|duplicate/i.test((e as Error).message) || /offer_id/.test((e as Error).message)) throw e; }
    }
  }
  return { id: Number(off!.id), recipients: who.length };
}

/** Active (unused, unexpired) codes of one client, newest first. */
export async function activeCodes(clientId: number, now = new Date()) {
  return q(`select oc.id, oc.code, oc.expires_at, o.title, o.detail from offer_codes oc join offers o on o.id = oc.offer_id
    where oc.client_id = $1 and oc.redeemed_at is null and oc.expires_at > $2 order by oc.id desc`, [clientId, now.toISOString()]);
}

export async function redeemCode(codeId: number, clientId: number, paymentId: number | null, staffId: number | null, now = new Date()) {
  const r = await one(`update offer_codes set redeemed_at = $4, payment_id = $3, redeemed_by = $5
    where id = $1 and client_id = $2 and redeemed_at is null and expires_at > $4 returning id`, [codeId, clientId, paymentId, now.toISOString(), staffId]);
  if (!r) throw new Error("code_invalid");
}

export async function offerResults(limit = 20) {
  return q(`select o.*, (select count(*)::int from offer_codes c where c.offer_id = o.id and c.sent_at is not null) as sent,
      (select count(*)::int from offer_codes c where c.offer_id = o.id and c.redeemed_at is not null) as redeemed,
      (select coalesce(sum(p.amount),0)::float from offer_codes c join payments p on p.id = c.payment_id where c.offer_id = o.id and p.voided_at is null) as revenue
    from offers o order by o.id desc limit $1`, [limit]);
}

/** After money is received: re-evaluate the tier and congratulate on an upgrade (service message, followers only). */
export async function afterPayment(clientId: number, now = new Date()) {
  const r = await refreshTier(clientId, now);
  if (!r?.changed || !r.up) return r;
  const c = await one("select line_user_id, followed from clients where id = $1", [clientId]);
  if (c?.line_user_id && c.followed) {
    const { push } = await import("./line");
    const M = await import("./messages");
    const t = tierInfo(r.to);
    await push(c.line_user_id, [M.tierUp(c.line_user_id, t.name, t.perks)], `tier:${clientId}:${r.to}:${now.toISOString().slice(0, 10)}`).catch((e) => console.error("[tier] push", e));
  }
  return r;
}

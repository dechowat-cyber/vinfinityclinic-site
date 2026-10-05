import { q, one } from "./db";
import { recordPayment } from "./payments";
import { tierInfo, type Tier } from "./loyalty";

// Vinfinity Wallet + credit, one ledger per client.
// - Top-up packages as printed in the menu book (page 13); credit valid 2 years from the latest top-up.
// - Credit back on money actually paid (not on Wallet use or top-ups), by tier.
// - V Circle: when a referred friend makes their first real payment, both get 1,000 credit.
// Top-ups are money received (a receipt is issued); paying with the Wallet issues a receipt with method "wallet".

export const PACKAGES = [
  { key: "silver", name: "Silver", pay: 50_000, get: 52_500 },
  { key: "gold", name: "Gold", pay: 75_000, get: 82_500 },
  { key: "platinum", name: "Platinum", pay: 150_000, get: 172_500 },
] as const;
export const CASHBACK: Record<Tier, number> = { member: 0, silver: 0.01, gold: 0.02, platinum: 0.03 };
export const REFERRAL_CREDIT = 1_000;
export const REFERRAL_MIN_PAYMENT = 5_000;
export const VALID_YEARS = 2;
export const KIND_TH: Record<string, string> = { topup: "เติม Wallet", bonus: "โบนัสเติมเงิน", cashback: "เครดิตคืน", referral: "V Circle ชวนเพื่อน", spend: "ใช้จ่าย", refund: "คืนเครดิต", expire: "หมดอายุ", adjust: "ปรับยอด" };

const validUntil = (now: Date) => new Date(now.getTime() + VALID_YEARS * 365 * 864e5).toISOString();

export async function balance(clientId: number) {
  const r = await one("select coalesce(sum(amount),0)::float b from wallet_ledger where client_id = $1", [clientId]);
  return Math.round(Number(r?.b ?? 0) * 100) / 100;
}
export async function history(clientId: number, limit = 20) {
  return q("select kind, amount::float amount, note, created_at from wallet_ledger where client_id = $1 order by id desc limit $2", [clientId, limit]);
}
async function add(clientId: number, kind: string, amount: number, o: { paymentId?: number | null; note?: string; staffId?: number | null; extend?: Date } = {}) {
  await q("insert into wallet_ledger(client_id, kind, amount, payment_id, note, created_by) values ($1,$2,$3,$4,$5,$6)",
    [clientId, kind, amount, o.paymentId ?? null, o.note ?? null, o.staffId ?? null]);
  if (o.extend) await q("update clients set wallet_expires_at = greatest(coalesce(wallet_expires_at, $2), $2) where id = $1", [clientId, validUntil(o.extend)]);
}

/** Cashier sells a package: one receipt for the money, top-up + bonus in the ledger. */
export async function topUp(o: { clientId: number; pkg: string; method: string; staffId: number | null; now?: Date }) {
  const p = PACKAGES.find((x) => x.key === o.pkg);
  if (!p) throw new Error("bad_package");
  if (o.method === "wallet") throw new Error("bad_method");
  const now = o.now ?? new Date();
  const pay = await recordPayment({ clientId: o.clientId, amount: p.pay, method: o.method, note: `เติม Vinfinity Wallet ${p.name}`, staffId: o.staffId, now: o.now });
  await q("update payments set kind = 'wallet_topup' where id = $1", [pay.id]);
  await add(o.clientId, "topup", p.pay, { paymentId: pay.id, note: p.name, staffId: o.staffId, extend: now });
  await add(o.clientId, "bonus", p.get - p.pay, { paymentId: pay.id, note: p.name, staffId: o.staffId, extend: now });
  return pay;
}

/** Pays for a service from the Wallet: a receipt with method "wallet" and a matching use in the ledger. */
export async function payWithWallet(o: { clientId: number; amount: number; planId?: number | null; note?: string; staffId: number | null; now?: Date }) {
  const amount = Math.round(Number(o.amount) * 100) / 100;
  if (!(amount > 0)) throw new Error("bad_amount");
  if ((await balance(o.clientId)) < amount) throw new Error("wallet_low");
  const pay = await recordPayment({ clientId: o.clientId, planId: o.planId, amount, method: "wallet", note: o.note, staffId: o.staffId, now: o.now });
  await add(o.clientId, "spend", -amount, { paymentId: pay.id, staffId: o.staffId });
  return pay;
}

/** A voided receipt reverses its ledger lines (top-up only if the credit is still there). */
export async function reverseForVoid(paymentId: number, staffId: number | null) {
  const lines = await q("select client_id, kind, amount::float amount from wallet_ledger where payment_id = $1 and kind in ('topup','bonus','spend','cashback')", [paymentId]);
  if (!lines.length) return;
  const clientId = Number(lines[0].client_id);
  const credit = lines.filter((l) => l.amount > 0).reduce((s, l) => s + l.amount, 0);
  if (credit > 0 && (await balance(clientId)) < credit) throw new Error("wallet_used");
  for (const l of lines) await add(clientId, l.kind === "spend" ? "refund" : "adjust", -l.amount, { note: `ยกเลิกใบเสร็จ #${paymentId}`, staffId });
}

/**
 * After real money is received: credit back by tier, and V Circle for the first payment of a referred client.
 * Idempotent per payment (unique index on payment_id + kind).
 */
export async function creditsFor(paymentId: number, now = new Date()) {
  const p = await one("select id, client_id, amount::float amount, method, kind, voided_at from payments where id = $1", [paymentId]);
  if (!p || p.voided_at || p.method === "wallet" || p.kind === "wallet_topup") return { cashback: 0, referral: false };
  const c = await one("select tier, referred_by, referral_paid_at from clients where id = $1", [p.client_id]);
  const rate = CASHBACK[(c?.tier ?? "member") as Tier] ?? 0;
  let cashback = 0;
  if (rate > 0) {
    cashback = Math.floor(p.amount * rate);
    if (cashback > 0) await add(Number(p.client_id), "cashback", cashback, { paymentId, note: `${tierInfo(c!.tier).name} ${Math.round(rate * 100)}%`, extend: now }).catch(() => { cashback = 0; });
  }
  let referral = false;
  if (c?.referred_by && !c.referral_paid_at && p.amount >= REFERRAL_MIN_PAYMENT) {
    const claimed = await one("update clients set referral_paid_at = $2 where id = $1 and referral_paid_at is null returning id", [p.client_id, now.toISOString()]);
    if (claimed) {
      await add(Number(p.client_id), "referral", REFERRAL_CREDIT, { note: "ได้รับคำชวนจากเพื่อน", extend: now });
      await add(Number(c.referred_by), "referral", REFERRAL_CREDIT, { note: "ชวนเพื่อนสำเร็จ", extend: now });
      referral = true;
    }
  }
  return { cashback, referral, referrer: referral ? Number(c!.referred_by) : null };
}

/** Nightly: credit past its date expires (one line that brings the balance to zero). */
export async function expireWallets(now = new Date()) {
  const rows = await q("select id from clients where wallet_expires_at is not null and wallet_expires_at < $1", [now.toISOString()]);
  let n = 0;
  for (const r of rows) {
    const b = await balance(Number(r.id));
    if (b > 0) { await add(Number(r.id), "expire", -b, { note: "เครดิตหมดอายุ" }); n++; }
    await q("update clients set wallet_expires_at = null where id = $1", [r.id]);
  }
  return n;
}

/** Outstanding credit and this month's movement, for the manager. */
export async function walletSummary(from: string) {
  const r = await one(`select coalesce(sum(amount),0)::float outstanding,
      coalesce(sum(amount) filter (where kind = 'topup' and created_at >= $1),0)::float topup,
      coalesce(sum(amount) filter (where kind in ('bonus','cashback','referral') and created_at >= $1),0)::float given,
      coalesce(-sum(amount) filter (where kind = 'spend' and created_at >= $1),0)::float used,
      (select count(distinct client_id)::int from wallet_ledger) as holders
    from wallet_ledger`, [from]);
  return { outstanding: Number(r!.outstanding), topup: Number(r!.topup), given: Number(r!.given), used: Number(r!.used), holders: Number(r!.holders) };
}

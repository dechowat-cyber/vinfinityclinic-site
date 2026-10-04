import crypto from "node:crypto";
import { q, one } from "./db";

// Web → LINE attribution. The website (assets/track.js) sends every LINE button through
// /r/web?v=CODE&utm_…&gclid=… ; we store the visit and open LINE with "(จากเว็บไซต์ #CODE)" in the
// pre-filled message. When that first message arrives, the webhook links the visit to the client,
// so ads, campaigns and click ids follow the client all the way to revenue.

export const VISIT_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "ttclid", "ga_cid", "fbp", "landing", "referrer"] as const;
export type VisitParams = Partial<Record<(typeof VISIT_PARAMS)[number], string>>;
const PAID = /^(cpc|ppc|paid|paid_social|paidsocial|ads?|cpm|display)$/i;

/** First-touch channel key from campaign parameters and referrer. */
export function deriveSource(v: VisitParams): string {
  const src = (v.utm_source || "").toLowerCase(), paid = PAID.test(v.utm_medium || "");
  if (v.gclid || (/google/.test(src) && paid)) return "gads";
  if (/facebook|^fb$|instagram|^ig$|meta/.test(src) && paid) return "fbads";
  if (/tiktok|^tt$/.test(src) && (paid || v.ttclid)) return "ttads";
  if (v.ttclid) return "ttads";
  if (/instagram|^ig$/.test(src)) return "ig";
  if (/facebook|^fb$/.test(src)) return "fb";
  if (/tiktok|^tt$/.test(src)) return "tt";
  if (/google/.test(src) && /gbp|maps|business|local/.test(`${v.utm_medium} ${v.utm_campaign}`.toLowerCase())) return "gbp";
  const ref = (v.referrer || "").toLowerCase();
  if (/google\./.test(ref)) return "seo";
  if (/facebook\.|fb\.|messenger/.test(ref)) return "fb";
  if (/instagram\./.test(ref)) return "ig";
  if (/tiktok\./.test(ref)) return "tt";
  return "web";
}

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const newVisitCode = () => Array.from(crypto.randomBytes(6), (x) => ALPHA[x % ALPHA.length]).join("");
export const isVisitCode = (c: string | null | undefined) => !!c && /^[A-HJ-NP-Z2-9]{6}$/.test(c);
const clip = (s: string | null | undefined, n = 300) => (s ? String(s).slice(0, n) : null);

/** Stores a visit (idempotent per code). Returns the code and the derived source. */
export async function recordVisit(code: string | null, v: VisitParams) {
  const c = isVisitCode(code) ? code! : newVisitCode();
  const src = deriveSource(v);
  await q(`insert into web_visits(code, src, utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, fbclid, ttclid, ga_cid, fbp, landing, referrer)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) on conflict (code) do nothing`,
    [c, src, ...VISIT_PARAMS.map((k) => clip(v[k], k === "landing" || k === "referrer" ? 500 : 200))]);
  return { code: c, src };
}

/** Called from the webhook when "(… #CODE)" arrives: binds the visit to the client and stamps the channel. */
export async function linkVisit(code: string, clientId: number, leadId: number | null) {
  const v = await one("update web_visits set client_id = $2, matched_at = now() where code = $1 and client_id is null returning src", [code, clientId]);
  if (!v) return null;
  await q("update clients set source = case when source is null or source = 'web' then $2 else source end where id = $1", [clientId, v.src]);
  if (leadId) await q("update leads set source = case when source is null or source = 'web' then $2 else source end where id = $1", [leadId, v.src]);
  return v.src as string;
}

/** Latest click ids for a client (for conversion APIs). */
export async function clickIds(clientId: number) {
  return one(`select gclid, fbclid, ttclid, ga_cid, fbp, extract(epoch from created_at)::bigint as at from web_visits
    where client_id = $1 order by created_at desc limit 1`, [clientId]);
}

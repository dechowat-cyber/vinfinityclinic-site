import crypto from "node:crypto";
import { q, one } from "./db";

// Conversion APIs: tell the ad platforms which clicks became chats, bookings and revenue, so campaigns
// optimise for real patients instead of clicks. Server-to-server, hashed identifiers only, never what the
// treatment was, and only for clients who agreed to marketing (PDPA). A platform is on when its env vars are set.
//   Meta:   META_PIXEL_ID + META_CAPI_TOKEN (optional META_TEST_EVENT_CODE)
//   TikTok: TIKTOK_PIXEL_ID + TIKTOK_ACCESS_TOKEN
//   GA4:    GA4_MEASUREMENT_ID + GA4_API_SECRET (needs the web visit's GA client id; import into Google Ads from GA4)

export type Platform = "meta" | "tiktok" | "ga4";
const env = (k: string) => process.env[k] || "";
export function platforms(): Platform[] {
  const on: Platform[] = [];
  if (env("META_PIXEL_ID") && env("META_CAPI_TOKEN")) on.push("meta");
  if (env("TIKTOK_PIXEL_ID") && env("TIKTOK_ACCESS_TOKEN")) on.push("tiktok");
  if (env("GA4_MEASUREMENT_ID") && env("GA4_API_SECRET")) on.push("ga4");
  return on;
}

export const sha256 = (s: string) => crypto.createHash("sha256").update(s.trim().toLowerCase()).digest("hex");
/** 0812345678 → 66812345678 (E.164 without +) */
export const e164 = (phoneNorm: string | null | undefined) => (phoneNorm && /^0[0-9]{8,9}$/.test(phoneNorm) ? `66${phoneNorm.slice(1)}` : null);

const NAMES: Record<string, Record<Platform, string>> = {
  lead: { meta: "Lead", tiktok: "Contact", ga4: "generate_lead" },
  schedule: { meta: "Schedule", tiktok: "SubmitForm", ga4: "book_appointment" },
  purchase: { meta: "Purchase", tiktok: "CompletePayment", ga4: "purchase" },
};
const META_SOURCE: Record<string, string> = { lead: "chat", schedule: "chat", purchase: "physical_store" };

/** Queues conversions from the last 7 days (platforms reject older events). Idempotent by event_id. */
export async function enqueueConversions(now = new Date()) {
  const since = new Date(now.getTime() - 7 * 864e5).toISOString();
  await q(`insert into conversions(event_id, client_id, event, value, event_at)
    select 'lead:' || l.client_id, l.client_id, 'lead', null, min(l.created_at) from leads l where l.created_at >= $1 group by l.client_id
    on conflict (event_id) do nothing`, [since]);
  await q(`insert into conversions(event_id, client_id, event, value, event_at)
    select 'schedule:' || a.id, a.client_id, 'schedule', null, a.created_at from appointments a where a.created_at >= $1 and a.status <> 'cancelled'
    on conflict (event_id) do nothing`, [since]);
  await q(`insert into conversions(event_id, client_id, event, value, event_at)
    select 'purchase:' || p.id, p.client_id, 'purchase', p.amount, p.created_at from payments p where p.created_at >= $1 and p.voided_at is null
    on conflict (event_id) do nothing`, [since]);
}

type Ctx = { phone: string | null; ext: string; fbc?: string; fbp?: string; ttclid?: string; gaCid?: string };

export function metaEvent(c: { event_id: string; event: string; value: number | null; event_at: string }, x: Ctx) {
  const user_data: Record<string, unknown> = { external_id: [sha256(x.ext)] };
  if (x.phone) user_data.ph = [sha256(x.phone)];
  if (x.fbc) user_data.fbc = x.fbc;
  if (x.fbp) user_data.fbp = x.fbp;
  return {
    event_name: NAMES[c.event].meta, event_time: Math.floor(new Date(c.event_at).getTime() / 1000), event_id: c.event_id,
    action_source: META_SOURCE[c.event], user_data, ...(c.value != null ? { custom_data: { currency: "THB", value: Number(c.value) } } : {}),
  };
}

export function tiktokEvent(c: { event_id: string; event: string; value: number | null; event_at: string }, x: Ctx) {
  const user: Record<string, unknown> = { external_id: sha256(x.ext) };
  if (x.phone) user.phone = sha256(`+${x.phone}`);
  if (x.ttclid) user.ttclid = x.ttclid;
  return {
    event: NAMES[c.event].tiktok, event_time: Math.floor(new Date(c.event_at).getTime() / 1000), event_id: c.event_id, user,
    ...(c.value != null ? { properties: { currency: "THB", value: Number(c.value) } } : {}),
  };
}

type Fetch = (url: string, init: RequestInit) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;

/** Sends pending conversions to every configured platform. */
export async function sendConversions(now = new Date(), doFetch: Fetch = fetch as unknown as Fetch, limit = 100) {
  const on = platforms();
  if (!on.length) return { sent: 0, skipped: 0, platforms: [] as Platform[] };
  const rows = await q(`select v.*, c.phone_norm,
      (select g.granted from consents g where g.client_id = v.client_id and g.type = 'marketing' order by g.created_at desc, g.id desc limit 1) as mk
    from conversions v join clients c on c.id = v.client_id
    where v.status in ('pending','error') and v.tries < 5 order by v.id limit $1`, [limit]);
  let sent = 0, skipped = 0;
  for (const r of rows) {
    const done = async (status: string, results: unknown) => {
      await q("update conversions set status = $2, results = $3, tries = tries + 1, sent_at = case when $2 = 'sent' then now() else sent_at end where id = $1",
        [r.id, status, JSON.stringify(results)]);
    };
    if (r.mk !== true) { skipped++; await done("skipped_consent", null); continue; }
    if (new Date(r.event_at).getTime() < now.getTime() - 7 * 864e5) { skipped++; await done("expired", null); continue; }
    const v = await one(`select gclid, fbclid, ttclid, ga_cid, fbp, created_at from web_visits where client_id = $1 order by created_at desc limit 1`, [r.client_id]);
    const x: Ctx = {
      phone: e164(r.phone_norm), ext: `vf-${r.client_id}`,
      fbc: v?.fbclid ? `fb.1.${new Date(v.created_at).getTime()}.${v.fbclid}` : undefined, fbp: v?.fbp || undefined,
      ttclid: v?.ttclid || undefined, gaCid: v?.ga_cid || undefined,
    };
    const ev = { event_id: r.event_id, event: r.event, value: r.value == null ? null : Number(r.value), event_at: new Date(r.event_at).toISOString() };
    const results: Record<string, unknown> = {};
    let failed = false;
    for (const p of on) {
      try {
        let res;
        if (p === "meta") {
          const body: Record<string, unknown> = { data: [metaEvent(ev, x)] };
          if (env("META_TEST_EVENT_CODE")) body.test_event_code = env("META_TEST_EVENT_CODE");
          res = await doFetch(`https://graph.facebook.com/v21.0/${env("META_PIXEL_ID")}/events?access_token=${encodeURIComponent(env("META_CAPI_TOKEN"))}`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        } else if (p === "tiktok") {
          res = await doFetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
            method: "POST", headers: { "Content-Type": "application/json", "Access-Token": env("TIKTOK_ACCESS_TOKEN") },
            body: JSON.stringify({ event_source: "web", event_source_id: env("TIKTOK_PIXEL_ID"), data: [tiktokEvent(ev, x)] }),
          });
        } else {
          if (!x.gaCid) { results.ga4 = "no_client_id"; continue; }
          res = await doFetch(`https://www.google-analytics.com/mp/collect?measurement_id=${env("GA4_MEASUREMENT_ID")}&api_secret=${encodeURIComponent(env("GA4_API_SECRET"))}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ client_id: x.gaCid, user_id: sha256(x.ext), timestamp_micros: new Date(ev.event_at).getTime() * 1000,
              events: [{ name: NAMES[ev.event].ga4, params: { currency: "THB", ...(ev.value != null ? { value: ev.value } : {}), transaction_id: ev.event_id } }] }),
          });
        }
        results[p] = res.ok ? "ok" : `${res.status} ${(await res.text()).slice(0, 200)}`;
        if (!res.ok) failed = true;
      } catch (e) { results[p] = `error ${(e as Error).message}`; failed = true; }
    }
    await done(failed ? "error" : "sent", results);
    if (!failed) sent++;
  }
  return { sent, skipped, platforms: on };
}

export async function capiTick(now: Date) {
  await enqueueConversions(now);
  return sendConversions(now);
}

export async function capiStatus() {
  const rows = await q("select status, count(*)::int n from conversions group by status");
  return { platforms: platforms(), counts: Object.fromEntries(rows.map((r) => [r.status, r.n])) as Record<string, number> };
}

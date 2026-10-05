import { clientFromRequest } from "@/lib/liffAuth";
import { refreshTier, tierInfo, progress, activeCodes, TIERS, type Tier } from "@/lib/loyalty";
import { logTouch } from "@/lib/crm";
import { one } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Member card: tier, 12-month spend, progress to the next tier, perks and the client's own secret offers. */
export async function GET(req: Request) {
  const client = await clientFromRequest(req);
  if (!client) return Response.json({ error: "unauthorized" }, { status: 401 });
  const r = await refreshTier(client.id);
  const c = await one("select tier, tier_until, ref_code, created_at from clients where id = $1", [client.id]);
  const t = tierInfo(c?.tier);
  await logTouch(client.id, "in", "member_card", null, "liff");
  return Response.json({
    name: client.name || client.display_name || "",
    tier: t.key, tierName: t.name, color: t.color, perks: t.perks,
    until: c?.tier_until ?? null, since: c?.created_at ?? null, refCode: c?.ref_code ?? null,
    spend: r?.spend ?? 0, progress: progress(r?.spend ?? 0, t.key as Tier),
    tiers: TIERS.map((x) => ({ key: x.key, name: x.name, min: x.min })),
    offers: (await activeCodes(client.id)).map((o) => ({ code: o.code, title: o.title, detail: o.detail, expires: o.expires_at })),
  });
}

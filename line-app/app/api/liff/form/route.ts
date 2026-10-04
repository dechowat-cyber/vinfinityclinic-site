import { clientFromRequest } from "@/lib/liffAuth";
import { consentState, logTouch } from "@/lib/crm";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";

import { HEALTH_FIELDS } from "@/lib/health";

// FR-14: pre-visit form. Answers are stored on the client record and shown only to DR / NS / CS / BM.

export async function GET(req: Request) {
  const client = await clientFromRequest(req);
  if (!client) return Response.json({ error: "unauthorized" }, { status: 401 });
  const c = await q("select name, phone, health, health_updated_at from clients where id = $1", [client.id]);
  return Response.json({ client: c[0], consent: await consentState(client.id) });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const client = await clientFromRequest(req, body);
  if (!client) return Response.json({ error: "unauthorized" }, { status: 401 });
  const st = await consentState(client.id);
  if (st.data !== true) return Response.json({ error: "consent_required" }, { status: 400 });
  const health: Record<string, string> = {};
  for (const k of HEALTH_FIELDS) health[k] = String(body[k] ?? "").trim().slice(0, 1000);
  const name = String(body.name || "").trim().slice(0, 80), phone = String(body.phone || "").replace(/[^\d+]/g, "").slice(0, 15);
  await q(`update clients set health = $2, health_updated_at = now(), name = coalesce(nullif($3,''), name), phone = coalesce(nullif($4,''), phone) where id = $1`,
    [client.id, JSON.stringify(health), name, phone]);
  await logTouch(client.id, "in", "previsit_form", null, "liff");
  return Response.json({ ok: true });
}

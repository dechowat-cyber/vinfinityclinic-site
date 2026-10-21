import { cors, webBook } from "@/lib/webchat";
import { SlotTakenError } from "@/lib/booking";

export const dynamic = "force-dynamic";
export async function OPTIONS(req: Request) { return new Response(null, { status: 204, headers: cors(req) }); }

/** POST { name, phone, start, interest, consent, marketing } → { ok, when, lineUrl } */
export async function POST(req: Request) {
  const h = cors(req);
  if (!("Access-Control-Allow-Origin" in h)) return Response.json({ error: "origin" }, { status: 403 });
  try {
    const b = await req.json();
    const r = await webBook({ name: b.name, phone: b.phone, start: b.start, interest: b.interest, consent: b.consent === true,
      marketing: typeof b.marketing === "boolean" ? b.marketing : undefined });
    return Response.json({ ok: true, when: r.when, lineUrl: r.lineUrl }, { headers: h });
  } catch (e) {
    const err = e instanceof SlotTakenError ? "slot_taken" : (e as Error).message;
    if (!["slot_taken", "consent_required", "bad_name", "bad_phone", "outside_hours", "bad_time"].includes(err)) console.error("[webchat/book]", e);
    return Response.json({ ok: false, error: err }, { status: 400, headers: h });
  }
}

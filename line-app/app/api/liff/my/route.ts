import { clientFromRequest } from "@/lib/liffAuth";
import { getSettings } from "@/lib/settings";
import { upcomingFor, reschedule, SlotTakenError } from "@/lib/booking";
import { consentState, logTouch, recordConsent } from "@/lib/crm";
import { q, one } from "@/lib/db";
import { push } from "@/lib/line";
import { confirmation } from "@/lib/messages";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const client = await clientFromRequest(req);
  if (!client) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({
    client: { name: client.name, phone: client.phone, displayName: client.display_name },
    consent: await consentState(client.id),
    appointments: await upcomingFor(client.id),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const client = await clientFromRequest(req, body);
  if (!client) return Response.json({ error: "unauthorized" }, { status: 401 });
  const s = await getSettings();
  const id = Number(body.id);

  if (body.action === "cancel") {
    const a = await one("update appointments set status = 'cancelled' where id = $1 and client_id = $2 and status in ('booked','confirmed') returning id", [id, client.id]);
    if (!a) return Response.json({ error: "not_found" }, { status: 404 });
    await logTouch(client.id, "in", "appt_cancel", String(id), "liff");
    return Response.json({ ok: true });
  }
  if (body.action === "reschedule") {
    try {
      const newId = await reschedule(id, client.id, String(body.start), s);
      const appt = await one("select * from appointments where id = $1", [newId]);
      await logTouch(client.id, "in", "appt_reschedule", `${id} -> ${newId}`, "liff");
      if (client.line_user_id) push(client.line_user_id, [confirmation(appt as any, s, client.line_user_id)], crypto.randomUUID()).catch((e) => console.error(e));
      return Response.json({ ok: true, appointment: appt });
    } catch (e) {
      if (e instanceof SlotTakenError) return Response.json({ error: "slot_taken" }, { status: 409 });
      return Response.json({ error: (e as Error).message }, { status: 400 });
    }
  }
  if (body.action === "marketing") {
    await recordConsent(client.id, "marketing", !!body.value, s.consentVersion, "liff");
    return Response.json({ ok: true });
  }
  if (body.action === "source" && body.src) {
    await q("update clients set source = coalesce(source, $2) where id = $1", [client.id, String(body.src).slice(0, 40)]);
    return Response.json({ ok: true });
  }
  return Response.json({ error: "bad_action" }, { status: 400 });
}

import { clientFromRequest } from "@/lib/liffAuth";
import { getSettings } from "@/lib/settings";
import { book, SlotTakenError, availableSlots } from "@/lib/booking";
import { ensureLead, recordConsent, logTouch, consentState } from "@/lib/crm";
import { q, one } from "@/lib/db";
import { push } from "@/lib/line";
import { confirmation } from "@/lib/messages";
import { parts } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const client = await clientFromRequest(req, body);
  if (!client) return Response.json({ error: "unauthorized" }, { status: 401 });
  const s = await getSettings();

  const name = String(body.name || "").trim().slice(0, 80);
  const phone = String(body.phone || "").replace(/[^\d+]/g, "").slice(0, 15);
  const interest = String(body.interest || "").trim().slice(0, 300);
  const src = String(body.src || "liff").slice(0, 40);
  if (!name || phone.length < 9) return Response.json({ error: "missing_fields" }, { status: 400 });

  // Data consent is required to book (we store name + phone); marketing is optional and separate (FR-11).
  const st = await consentState(client.id);
  if (!body.consentData && st.data !== true) return Response.json({ error: "consent_required" }, { status: 400 });
  if (body.consentData && st.data !== true) await recordConsent(client.id, "data", true, s.consentVersion, "liff");
  if (typeof body.consentMarketing === "boolean" && st.marketing !== body.consentMarketing)
    await recordConsent(client.id, "marketing", body.consentMarketing, s.consentVersion, "liff");

  await q("update clients set name = $2, phone = $3, source = coalesce(source, $4) where id = $1", [client.id, name, phone, src]);
  await ensureLead(client.id, src, interest || null);

  try {
    const id = await book({ clientId: client.id, startIso: String(body.start), s, source: src, note: interest || null });
    const appt = await one("select * from appointments where id = $1", [id]);
    await logTouch(client.id, "in", "booked", `#${id} ${appt!.start_at}`, "liff");
    if (client.line_user_id) {
      try { await push(client.line_user_id, [confirmation(appt as any, s, client.line_user_id)], crypto.randomUUID()); await logTouch(client.id, "out", "confirmation"); }
      catch (e) { console.error("[book] confirmation push failed", e); }
    }
    return Response.json({ ok: true, appointment: appt });
  } catch (e) {
    if (e instanceof SlotTakenError) {
      const date = parts(new Date(String(body.start))).date;
      const alt = (await availableSlots(date, s)).filter((x) => x.available).slice(0, 3);
      return Response.json({ error: "slot_taken", alternatives: alt }, { status: 409 });
    }
    if ((e as Error).message === "outside_hours") return Response.json({ error: "outside_hours" }, { status: 400 });
    throw e;
  }
}

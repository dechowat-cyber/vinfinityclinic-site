import { currentStaff } from "@/lib/session";
import { canSeeHealth, logHealthAccess } from "@/lib/health";
import { consentState } from "@/lib/crm";
import { ALL_ANGLES, saveShot } from "@/lib/photos";
import { one } from "@/lib/db";

export const dynamic = "force-dynamic";

/** FR-21: photos go straight from the clinic iPad into the database, never to a personal phone gallery. */
export async function POST(req: Request) {
  const me = await currentStaff();
  if (!me || !canSeeHealth(me)) return Response.json({ error: "forbidden" }, { status: 403 });
  const fd = await req.formData();
  const file = fd.get("file");
  const sessionId = Number(fd.get("session_id")) || null;
  const angle = String(fd.get("angle"));
  let clientId = Number(fd.get("client_id"));
  if (sessionId) clientId = Number((await one("select client_id from photo_sessions where id = $1", [sessionId]))?.client_id) || 0;
  if (!(file instanceof Blob) || !clientId || !ALL_ANGLES.includes(angle)) return Response.json({ error: "bad_request" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return Response.json({ error: "too_large" }, { status: 413 });
  const c = await one("select id from clients where id = $1", [clientId]);
  if (!c) return Response.json({ error: "not_found" }, { status: 404 });
  if ((await consentState(clientId)).data !== true) return Response.json({ error: "no_consent" }, { status: 409 }); // FR-11
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
  let id: number;
  if (sessionId) {
    let meta: unknown = null;
    try { meta = JSON.parse(String(fd.get("meta") || "null")); } catch { /* ignore */ }
    try {
      ({ id } = await saveShot({ sessionId, angle, mime, data: buf, width: Number(fd.get("width")) || 0, height: Number(fd.get("height")) || 0, meta, staffId: me.id }));
    } catch (e) {
      return Response.json({ error: (e as Error).message }, { status: 409 });
    }
  } else {
    const row = await one("insert into photos(client_id, consult_id, angle, mime, data, created_by) values ($1,$2,$3,$4,$5,$6) returning id",
      [clientId, Number(fd.get("consult_id")) || null, angle, mime, buf, me.id]);
    id = Number(row!.id);
  }
  await logHealthAccess(me.id, clientId, `photo_upload:${id}`);
  return Response.json({ ok: true, id });
}

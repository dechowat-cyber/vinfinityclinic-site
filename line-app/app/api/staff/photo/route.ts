import { currentStaff } from "@/lib/session";
import { canSeeHealth, logHealthAccess } from "@/lib/health";
import { q, one } from "@/lib/db";

export const dynamic = "force-dynamic";

const ANGLES = ["front", "left45", "right45", "left90", "right90", "other", "care"];

/** FR-21: photos go straight from the clinic iPad into the database, never to a personal phone gallery. */
export async function POST(req: Request) {
  const me = await currentStaff();
  if (!me || !canSeeHealth(me)) return Response.json({ error: "forbidden" }, { status: 403 });
  const fd = await req.formData();
  const file = fd.get("file");
  const clientId = Number(fd.get("client_id"));
  const angle = String(fd.get("angle"));
  if (!(file instanceof Blob) || !clientId || !ANGLES.includes(angle)) return Response.json({ error: "bad_request" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return Response.json({ error: "too_large" }, { status: 413 });
  const c = await one("select id from clients where id = $1", [clientId]);
  if (!c) return Response.json({ error: "not_found" }, { status: 404 });
  const buf = Buffer.from(await file.arrayBuffer());
  const row = await one("insert into photos(client_id, consult_id, angle, mime, data, created_by) values ($1,$2,$3,$4,$5,$6) returning id",
    [clientId, Number(fd.get("consult_id")) || null, angle, file.type || "image/jpeg", buf, me.id]);
  await logHealthAccess(me.id, clientId, `photo_upload:${row!.id}`);
  return Response.json({ ok: true, id: row!.id });
}

import { notFound, redirect } from "next/navigation";
import { one } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { HEALTH_ROLES, logHealthAccess } from "@/lib/health";
import { PROTOCOLS, KINDS, referencePhotos, shotsOf } from "@/lib/photos";
import { completePhotoSession, discardPhotoSession } from "@/lib/photoActions";
import { Studio } from "./studio";

export const dynamic = "force-dynamic";

export default async function Capture({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ session?: string }> }) {
  const me = await requireStaff(HEALTH_ROLES);
  const clientId = Number((await params).id);
  const sessionId = Number((await searchParams).session);
  const s = await one("select * from photo_sessions where id = $1 and client_id = $2", [sessionId, clientId]);
  if (!s) notFound();
  if (s.completed_at) redirect(`/staff/clients/${clientId}#photos`);
  const c = await one("select name, display_name from clients where id = $1", [clientId]);
  await logHealthAccess(me.id, clientId, `photo_capture:${sessionId}`);
  const [refs, shots] = await Promise.all([referencePhotos(clientId, sessionId), shotsOf(sessionId)]);
  const p = PROTOCOLS[s.protocol] ?? PROTOCOLS.face5;
  return (
    <Studio sessionId={sessionId} clientId={clientId} title={`${c?.name || c?.display_name || "ลูกค้า"} · ${KINDS[s.kind] ?? s.kind} · ${p.label}`}
      angles={p.angles} shots={shots} refs={refs} complete={completePhotoSession} discard={discardPhotoSession} />
  );
}

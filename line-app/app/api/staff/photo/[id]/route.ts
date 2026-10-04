import { currentStaff } from "@/lib/session";
import { canSeeHealth, logHealthAccess } from "@/lib/health";
import { one } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentStaff();
  if (!me || !canSeeHealth(me)) return new Response("forbidden", { status: 403 });
  const { id } = await params;
  const p = await one("select client_id, mime, data from photos where id = $1", [Number(id)]);
  if (!p) return new Response("not found", { status: 404 });
  await logHealthAccess(me.id, p.client_id, `photo_view:${id}`);
  const d = p.data;
  const data: Buffer = typeof d === "string" ? Buffer.from(d.replace(/^\\x/, ""), "hex") : Buffer.from(d);
  return new Response(new Uint8Array(data), { headers: { "Content-Type": p.mime, "Cache-Control": "private, no-store" } });
}

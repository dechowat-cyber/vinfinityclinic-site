import { currentStaff } from "@/lib/session";
import { canSeeHealth, logHealthAccess } from "@/lib/health";
import { q, one } from "@/lib/db";
import { reportData } from "@/lib/faceReport";
import { renderFaceReport } from "@/lib/faceReportDoc";

export const dynamic = "force-dynamic";

/** Staff preview of a report (print to PDF from the browser). Photos load through the staff photo route. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentStaff();
  if (!me || !canSeeHealth(me)) return new Response("forbidden", { status: 403 });
  const id = Number((await params).id);
  const r = await one(`select f.*, c.name, c.display_name from face_reports f join clients c on c.id = f.client_id where f.id = $1`, [id]);
  if (!r) return new Response("not found", { status: 404 });
  await logHealthAccess(me.id, r.client_id, `face_report_preview:${id}`);
  const photos = await q("select id, angle from photos where face_report_id = $1 order by id", [id]);
  const html = renderFaceReport(reportData(r, r.name || r.display_name || "ลูกค้า", photos.map((p) => ({ angle: p.angle, src: `/api/staff/photo/${p.id}` }))));
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" } });
}

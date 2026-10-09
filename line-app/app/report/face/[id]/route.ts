import { q, one } from "@/lib/db";
import { readLinkToken } from "@/lib/link";
import { logTouch } from "@/lib/crm";
import { reportData } from "@/lib/faceReport";
import { renderFaceReport } from "@/lib/faceReportDoc";

export const dynamic = "force-dynamic";

const bytes = (d: any): Buffer => (typeof d === "string" ? Buffer.from(d.replace(/^\\x/, ""), "hex") : Buffer.from(d));

/** The client's own report, opened from the personal link sent in LINE. Only after the doctor sent it. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const userId = readLinkToken(new URL(req.url).searchParams.get("t"));
  const r = userId ? await one(`select f.*, c.name, c.display_name, c.line_user_id from face_reports f join clients c on c.id = f.client_id where f.id = $1`, [id]) : null;
  if (!r || r.line_user_id !== userId || r.status !== "sent")
    return new Response("ลิงก์นี้หมดอายุหรือไม่ถูกต้อง กรุณาทักแชท LINE @vinfinityclinic เพื่อขอลิงก์ใหม่", { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  const photos = await q("select angle, mime, data from photos where face_report_id = $1 order by id", [id]);
  await logTouch(r.client_id, "in", "face_report_open", String(id));
  const html = renderFaceReport(reportData(r, r.name || r.display_name || "คุณ",
    photos.map((p) => ({ angle: p.angle, src: `data:${p.mime};base64,${bytes(p.data).toString("base64")}` }))));
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
}

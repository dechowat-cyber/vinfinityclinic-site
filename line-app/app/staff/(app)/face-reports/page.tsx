import { q } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { HEALTH_ROLES } from "@/lib/health";
import { FR_STATUS } from "@/lib/faceReport";

export const dynamic = "force-dynamic";

const hrs = (d: string | Date) => Math.round((Date.now() - new Date(d).getTime()) / 3600000);

export default async function FaceReports() {
  await requireStaff(HEALTH_ROLES);
  const rows = await q(`select f.id, f.client_id, f.status, f.source, f.created_at, f.updated_at, f.sent_at, c.name, c.display_name,
      (select count(*)::int from photos p where p.face_report_id = f.id) as n_photos
    from face_reports f join clients c on c.id = f.client_id
    where f.status not in ('cancelled') or f.created_at > now() - interval '14 days' order by (f.status in ('waiting_doctor','drafting')) desc, f.id desc limit 100`);
  return (
    <>
      <div><div className="eyebrow">FACE ARCHITECTURE REPORT</div><h1>คำขอรายงานใบหน้า</h1></div>
      <p className="muted" style={{ margin: 0 }}>ลูกค้าตอบ 3 คำถาม + ส่งรูป 3 มุมทาง LINE · เป้า: ส่งรายงานภายใน 2 วันทำการหลังรูปครบ</p>
      <table className="t">
        <thead><tr><th>#</th><th>ลูกค้า</th><th>สถานะ</th><th>รูป</th><th>รอมาแล้ว</th><th></th></tr></thead>
        <tbody>{rows.length === 0 && <tr><td colSpan={6} className="muted">ยังไม่มีคำขอ</td></tr>}
          {rows.map((r) => {
            const [label, cls] = FR_STATUS[r.status] ?? [r.status, ""];
            const late = ["waiting_doctor", "drafting"].includes(r.status) && hrs(r.updated_at) > 48;
            return (
              <tr key={r.id} className={late ? "late" : ""}>
                <td><small>FAR-{String(r.id).padStart(4, "0")}</small></td>
                <td><a href={`/staff/clients/${r.client_id}`}><b>{r.name || r.display_name}</b></a><br /><small className="muted">{r.source || ""}</small></td>
                <td><span className={`tag ${cls}`}>{label}</span></td>
                <td><small>{r.n_photos}/3</small></td>
                <td><small>{r.status === "sent" ? "-" : `${hrs(r.created_at)} ชม.`}</small></td>
                <td><a className="btn small" href={`/staff/face-reports/${r.id}`}>{["waiting_doctor", "drafting"].includes(r.status) ? "เขียนรายงาน" : "เปิด"}</a></td>
              </tr>);
          })}
        </tbody>
      </table>
    </>
  );
}

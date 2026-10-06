import { notFound } from "next/navigation";
import { q, one } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { HEALTH_ROLES, logHealthAccess } from "@/lib/health";
import { LAYERS } from "@/lib/faceReportDoc";
import { QUESTIONS, PHOTOS, planToText, refsToText, FR_STATUS, type Draft } from "@/lib/faceReport";
import { saveFaceReport, sendFaceReport, closeFaceReport } from "@/lib/frActions";

export const dynamic = "force-dynamic";

const PLAN_HINT = "เมื่อไร | ชั้น | การรักษา | เหตุผล/หลักฐาน [1] | จำนวนครั้ง\nครั้งที่ 1 · สัปดาห์ 0 | 04 · ไขมันชั้นลึก | ฟิลเลอร์ HA ความแข็งสูง รองรับแก้มส่วนบน | รองรับใต้ตาจากชั้นลึก [1] | 1 ครั้ง";

export default async function FaceReport({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireStaff(HEALTH_ROLES);
  const id = Number((await params).id);
  const r = await one(`select f.*, c.name, c.display_name from face_reports f join clients c on c.id = f.client_id where f.id = $1`, [id]);
  if (!r) notFound();
  await logHealthAccess(me.id, r.client_id, `face_report_view:${id}`);
  const photos = await q("select id, angle from photos where face_report_id = $1 order by id", [id]);
  const d = (r.report ?? null) as Draft | null;
  const layer = (k: string) => d?.layers.find((l) => l.key === k);
  const doctor = ["BM", "DR"].includes(me.role);
  const [label, cls] = FR_STATUS[r.status] ?? [r.status, ""];
  return (
    <>
      <div><div className="eyebrow">FAR-{String(id).padStart(4, "0")} · <span className={`tag ${cls}`}>{label}</span></div>
        <h1>{r.name || r.display_name}</h1></div>
      <section className="card">
        <div className="eyebrow">คำตอบจากลูกค้า</div>
        <table className="t"><tbody>{QUESTIONS.map((x) => <tr key={x.key}><td><small className="muted">{x.text}</small></td><td><b>{r.answers?.[x.key] || "-"}</b></td></tr>)}</tbody></table>
        <div className="photos" style={{ marginTop: 12 }}>
          {PHOTOS.map((p) => { const ph = photos.find((x) => x.angle === `fr_${p.key}`);
            return ph ? <a key={p.key} className="shot" href={`/api/staff/photo/${ph.id}`} target="_blank"><img src={`/api/staff/photo/${ph.id}`} alt={p.label} /><small>{p.label}</small></a>
              : <div key={p.key} className="shot muted"><small>{p.label} · ยังไม่ส่ง</small></div>; })}
        </div>
      </section>

      {doctor ? (
        <form action={saveFaceReport} className="card" style={{ display: "grid", gap: 14 }}>
          <input type="hidden" name="id" value={id} />
          <div className="eyebrow">รายงานของแพทย์</div>
          <label>สรุปจากแพทย์ (ย่อหน้าเดียว ภาษาคนไข้)<textarea name="summary" className="inp" rows={4} defaultValue={d?.summary ?? ""} required /></label>
          <table className="t"><thead><tr><th>ชั้น</th><th>สถานะ</th><th>สิ่งที่เห็น</th></tr></thead><tbody>
            {LAYERS.map((L) => (
              <tr key={L.key}><td><b>{L.no} {L.th}</b><br /><small className="muted">{L.what}</small></td>
                <td><select name={`st_${L.key}`} className="inp" defaultValue={layer(L.key)?.status ?? "good"}><option value="good">ดีอยู่แล้ว</option><option value="watch">ควรดูแล</option><option value="treat">แนะนำให้แก้</option></select></td>
                <td><input name={`fd_${L.key}`} className="inp" style={{ width: "100%" }} defaultValue={layer(L.key)?.finding ?? ""} /></td></tr>))}
          </tbody></table>
          <label>แผนการรักษา (1 บรรทัด = 1 ขั้น คั่นด้วย | )<textarea name="plan" className="inp" rows={6} placeholder={PLAN_HINT} defaultValue={planToText(d)} /></label>
          <label>ยังไม่แนะนำตอนนี้ (1 บรรทัด = 1 ข้อ)<textarea name="notNow" className="inp" rows={3} defaultValue={(d?.notNow ?? []).join("\n")} /></label>
          <div className="row"><label>ค่าใช้จ่ายโดยประมาณ<input name="priceRange" className="inp" placeholder="ประมาณ 35,000–45,000 บาท" defaultValue={d?.priceRange ?? ""} /></label>
            <label style={{ flex: 1 }}>หมายเหตุราคา<input name="priceNote" className="inp" style={{ width: "100%" }} defaultValue={d?.priceNote ?? ""} /></label></div>
          <label>เอกสารอ้างอิง (ชื่อ | ลิงก์) เรียงตามเลข [1] [2] ในแผน<textarea name="refs" className="inp" rows={3} defaultValue={refsToText(d)} /></label>
          <div className="row">
            <button className="btn">บันทึก</button>
            <button className="btn ghost" name="preview" value="1">บันทึกและดูตัวอย่าง (พิมพ์เป็น PDF ได้)</button>
          </div>
        </form>
      ) : <p className="muted">เฉพาะแพทย์และผู้จัดการสาขาเขียนรายงานได้</p>}

      {doctor && r.status !== "sent" && r.status !== "cancelled" && (
        <div className="row">
          {d?.summary && <form action={sendFaceReport}><input type="hidden" name="id" value={id} /><button className="btn">ส่งรายงานให้ลูกค้าทาง LINE</button></form>}
          <form action={closeFaceReport}><input type="hidden" name="id" value={id} /><button className="btn ghost small">ยกเลิกคำขอ</button></form>
        </div>)}
      {r.status === "sent" && <p className="muted">ส่งแล้ว {new Date(r.sent_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })} · ลูกค้าเปิดอ่านได้จากลิงก์ส่วนตัวใน LINE</p>}
    </>
  );
}

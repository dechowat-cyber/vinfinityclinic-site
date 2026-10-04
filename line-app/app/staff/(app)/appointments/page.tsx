import { q } from "@/lib/db";
import { apptStatus, staffBook } from "@/lib/actions";
import { bkk, todayBkk, addDays, parts, thaiDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function Appointments() {
  const today = todayBkk();
  const rows = await q(
    `select a.*, c.name, c.display_name, c.phone, c.line_user_id from appointments a join clients c on c.id = a.client_id
     where a.start_at >= $1 and a.start_at < $2 and a.status in ('booked','confirmed') order by a.start_at`,
    [bkk(today, "00:00").toISOString(), bkk(addDays(today, 15), "00:00").toISOString()]);
  let lastDay = "";
  return (
    <>
      <div><div className="eyebrow">APPOINTMENTS</div><h1>นัดหมาย 14 วันข้างหน้า</h1></div>
      <form className="card" action={staffBook}>
        <div className="eyebrow">จองแทนลูกค้า (โทร / walk-in / ทักช่องทางอื่น)</div>
        <div className="row" style={{ marginTop: 12, alignItems: "flex-end" }}>
          <div className="field" style={{ margin: 0 }}><label>ชื่อ</label><input name="name" required /></div>
          <div className="field" style={{ margin: 0 }}><label>เบอร์โทร</label><input name="phone" inputMode="tel" /></div>
          <div className="field" style={{ margin: 0 }}><label>วัน</label><input type="date" name="date" min={today} required /></div>
          <div className="field" style={{ margin: 0 }}><label>เวลา</label><input type="time" name="time" step={1800} required /></div>
          <div className="field" style={{ margin: 0 }}><label>ช่องทาง</label><select name="source"><option value="phone">โทร</option><option value="walkin">walk-in</option><option value="fb">Facebook</option><option value="ig">Instagram</option><option value="other">อื่นๆ</option></select></div>
          <div className="field" style={{ margin: 0, flex: 1, minWidth: 180 }}><label>เรื่องที่ปรึกษา</label><input name="interest" /></div>
          <button className="btn">จอง</button>
        </div>
      </form>
      <table className="t">
        <thead><tr><th>วัน / เวลา</th><th>ลูกค้า</th><th>เรื่อง</th><th>สถานะ</th><th></th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={5} className="muted">ยังไม่มีนัด</td></tr>}
          {rows.map((r) => {
            const d = new Date(r.start_at); const day = parts(d).date; const head = day !== lastDay; lastDay = day;
            return (
              <tr key={r.id}>
                <td>{head ? <b>{thaiDate(d)}<br /></b> : null}{parts(d).time}</td>
                <td>{r.name || r.display_name}<br /><small className="muted">{r.phone || ""}{r.line_user_id ? " · LINE" : " · ไม่มี LINE (โทรเตือน)"}</small></td>
                <td><small>{r.note || "-"}</small></td>
                <td><span className={`tag ${r.status === "confirmed" ? "ok" : ""}`}>{r.status === "confirmed" ? "ยืนยันแล้ว" : "จองแล้ว"}</span></td>
                <td><div className="row">
                  {r.status === "booked" && <form action={apptStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="confirmed" /><button className="btn ghost small">ยืนยันทางโทรศัพท์</button></form>}
                  <form action={apptStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="cancelled" /><button className="btn danger small">ยกเลิก</button></form>
                </div></td>
              </tr>);
          })}
        </tbody>
      </table>
    </>
  );
}

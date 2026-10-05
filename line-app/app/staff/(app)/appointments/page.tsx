import { q } from "@/lib/db";
import { apptStatus, staffBook } from "@/lib/actions";
import { bkk, todayBkk, addDays, parts, thaiDate } from "@/lib/time";
import { getSettings } from "@/lib/settings";
import { Chips } from "@/app/ui/chips";
import { CONCERNS } from "@/lib/options";

export const dynamic = "force-dynamic";

export default async function Appointments() {
  const today = todayBkk();
  const rows = await q(
    `select a.*, c.name, c.display_name, c.phone, c.line_user_id from appointments a join clients c on c.id = a.client_id
     where a.start_at >= $1 and a.start_at < $2 and a.status in ('booked','confirmed') order by a.start_at`,
    [bkk(today, "00:00").toISOString(), bkk(addDays(today, 15), "00:00").toISOString()]);
  let lastDay = "";
  // pick-lists instead of free date/time typing: open days for 14 days, slots inside opening hours
  const st = await getSettings();
  const days = Array.from({ length: 15 }, (_, i) => addDays(today, i)).filter((d) => {
    const dow = new Date(`${d}T12:00:00+07:00`).getDay();
    return st.hours[dow] && !st.closedDates.includes(d);
  });
  const open = st.hours.filter(Boolean).map((h) => h!.open).sort()[0] ?? "10:00", close = st.hours.filter(Boolean).map((h) => h!.close).sort().at(-1) ?? "19:00";
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const slots: string[] = [];
  for (let m = toMin(open); m + (st.consultMinutes || 30) <= toMin(close); m += st.slotMinutes || 30) slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  return (
    <>
      <div><div className="eyebrow">APPOINTMENTS</div><h1>นัดหมาย 14 วันข้างหน้า</h1></div>
      <form className="card" action={staffBook}>
        <div className="eyebrow">จองแทนลูกค้า (โทร / walk-in / ทักช่องทางอื่น)</div>
        <div className="row" style={{ marginTop: 12, alignItems: "flex-end" }}>
          <div className="field" style={{ margin: 0 }}><label>ชื่อ</label><input name="name" required /></div>
          <div className="field" style={{ margin: 0 }}><label>เบอร์โทร</label><input name="phone" inputMode="tel" /></div>
          <div className="field" style={{ margin: 0 }}><label>วัน</label><select name="date" required defaultValue={days[0]}>{days.map((d) => <option key={d} value={d}>{d === today ? "วันนี้ · " : ""}{thaiDate(new Date(`${d}T12:00:00+07:00`))}</option>)}</select></div>
          <div className="field" style={{ margin: 0 }}><label>เวลา</label><select name="time" required>{slots.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="field" style={{ margin: 0 }}><label>ช่องทาง</label><select name="source"><option value="phone">โทร</option><option value="walkin">walk-in</option><option value="fb">Facebook</option><option value="ig">Instagram</option><option value="other">อื่นๆ</option></select></div>
                  </div>
        <div className="field" style={{ margin: "12px 0 0" }}><label>เรื่องที่ปรึกษา (ไม่บังคับ)</label><Chips name="interest" options={CONCERNS} /></div>
        <button className="btn" style={{ marginTop: 12 }}>จองนัด</button>
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

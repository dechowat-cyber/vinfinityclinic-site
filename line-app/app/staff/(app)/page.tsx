import QRCode from "qrcode";
import { q } from "@/lib/db";
import { apptStatus, walkIn } from "@/lib/actions";
import { bkk, todayBkk, addDays, parts } from "@/lib/time";
import { bookUrl } from "@/lib/link";

export const dynamic = "force-dynamic";

const LABEL: Record<string, [string, string]> = {
  booked: ["จองแล้ว", ""], confirmed: ["ยืนยันแล้ว", "ok"], arrived: ["มาถึงแล้ว", "warn"], in_consult: ["กำลังปรึกษา", "warn"],
  done: ["เสร็จ", "ok"], no_show: ["ไม่มา", "bad"], cancelled: ["ยกเลิก", "bad"],
};
const NEXT: Record<string, [string, string][]> = {
  booked: [["arrived", "มาถึง"], ["no_show", "ไม่มา"]],
  confirmed: [["arrived", "มาถึง"], ["no_show", "ไม่มา"]],
  arrived: [["in_consult", "เข้าพบแพทย์"]],
  in_consult: [["done", "เสร็จ"]],
};

function mins(from: Date | string | null, now: Date) { return from ? Math.round((now.getTime() - new Date(from).getTime()) / 60000) : 0; }

export default async function Today() {
  const now = new Date();
  const today = todayBkk(now);
  const from = bkk(today, "00:00").toISOString(), to = bkk(addDays(today, 1), "00:00").toISOString();
  const tomorrowTo = bkk(addDays(today, 2), "00:00").toISOString();
  const [rows, unconfirmed, openLeads] = await Promise.all([
    q(`select a.*, c.name, c.display_name, c.phone, c.line_user_id from appointments a join clients c on c.id = a.client_id
       where a.start_at >= $1 and a.start_at < $2 and a.status <> 'cancelled' order by a.start_at`, [from, to]),
    q(`select count(*)::int n from appointments where start_at >= $1 and start_at < $2 and status = 'booked'`, [to, tomorrowTo]),
    q(`select count(*)::int n from leads where status in ('New','Contacted','Qualified') and (replied_at is null or replied_at < last_inbound_at)`),
  ]);
  const qr = await QRCode.toDataURL(bookUrl(null, { src: "walkin" }), { margin: 1, width: 220, color: { dark: "#0B142E", light: "#FFFFFF" } });
  const arrived = rows.filter((r) => ["arrived", "in_consult", "done"].includes(r.status)).length;

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div><div className="eyebrow">TODAY BOARD</div><h1>วันนี้ · {today.split("-").reverse().join("/")}</h1></div>
      </div>
      <div className="kpis">
        <div className="kpi"><b>{rows.length}</b><small>นัดวันนี้</small></div>
        <div className="kpi"><b>{arrived}</b><small>มาถึงแล้ว</small></div>
        <div className="kpi"><b>{unconfirmed[0].n}</b><small>นัดพรุ่งนี้ที่ยังไม่ยืนยัน</small></div>
        <div className="kpi"><b>{openLeads[0].n}</b><small>แชทรอตอบ</small></div>
      </div>
      <table className="t">
        <thead><tr><th>เวลา</th><th>ลูกค้า</th><th>เรื่อง</th><th>แพทย์</th><th>สถานะ</th><th>รอ</th><th></th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={7} className="muted">ยังไม่มีนัดวันนี้</td></tr>}
          {rows.map((r) => {
            const wait = r.status === "arrived" ? mins(r.arrived_at, now) : 0;
            const [lab, tone] = LABEL[r.status] || [r.status, ""];
            return (
              <tr key={r.id} className={wait > 10 ? "late" : ""}>
                <td>{parts(new Date(r.start_at)).time}</td>
                <td><b>{r.name || r.display_name || "-"}</b><br /><small className="muted">{r.phone || ""}{r.line_user_id ? " · LINE" : ""}{r.source ? ` · ${r.source}` : ""}</small></td>
                <td><small>{r.note || "-"}</small></td>
                <td><small>{r.doctor}</small></td>
                <td><span className={`tag ${tone}`}>{lab}</span></td>
                <td>{r.status === "arrived" ? <span className={`tag ${wait > 10 ? "bad" : ""}`}>{wait} นาที</span> : ""}</td>
                <td><div className="row">{(NEXT[r.status] || []).map(([st, l]) => (
                  <form key={st} action={apptStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value={st} />
                    <button className={`btn small ${st === "no_show" ? "danger" : ""}`}>{l}</button></form>))}</div></td>
              </tr>);
          })}
        </tbody>
      </table>
      <div className="grid2">
        <form className="card" action={walkIn}>
          <div className="eyebrow">WALK-IN</div>
          <h3 style={{ fontWeight: 500, margin: "6px 0 14px" }}>ลูกค้า walk-in มาถึงตอนนี้</h3>
          <div className="field"><label>ชื่อ</label><input name="name" required /></div>
          <div className="field"><label>เบอร์โทร</label><input name="phone" inputMode="tel" /></div>
          <div className="field"><label>อยากให้คุณหมอดูเรื่องไหน</label><input name="interest" /></div>
          <label className="check"><input type="checkbox" name="consent" /> ลูกค้ายินยอมให้เก็บข้อมูลเพื่อการรักษา (ขอด้วยวาจาแล้ว)</label>
          <button className="btn">บันทึก · มาถึงแล้ว</button>
        </form>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="eyebrow">ให้ลูกค้าสแกน</div>
          <h3 style={{ fontWeight: 500, margin: "6px 0 10px" }}>เพิ่มเพื่อน LINE และจองคิว</h3>
          <img src={qr} alt="QR เพิ่มเพื่อน LINE และจองคิว" width={220} height={220} />
          <p className="muted" style={{ fontSize: 13 }}>walk-in ทุกคนควรเข้า LINE แม้ไม่ได้ทำวันนี้ (source = walkin)</p>
        </div>
      </div>
    </>
  );
}

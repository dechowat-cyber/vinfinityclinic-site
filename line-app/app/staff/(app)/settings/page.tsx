import { q } from "@/lib/db";
import { saveClinic, setupRichMenu, useStaffGroup } from "@/lib/actions";
import { getSettings } from "@/lib/settings";
import { requireStaff } from "@/lib/session";

export const dynamic = "force-dynamic";
const DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const ok = (b: boolean) => <span className={`tag ${b ? "ok" : "bad"}`}>{b ? "พร้อม" : "ยังไม่ตั้งค่า"}</span>;

export default async function Settings() {
  await requireStaff(["BM"]);
  const s = await getSettings();
  const cand = await q("select value from settings where key = 'candidate_group'");
  const env = (k: string) => !!process.env[k];
  return (
    <>
      <div><div className="eyebrow">SETTINGS</div><h1>ตั้งค่า</h1></div>
      <div className="card">
        <div className="eyebrow">การเชื่อมต่อ</div>
        <table className="t" style={{ marginTop: 10 }}><tbody>
          <tr><td>LINE Messaging API (รับ/ส่งข้อความ)</td><td>{ok(env("LINE_CHANNEL_SECRET") && (env("LINE_CHANNEL_ACCESS_TOKEN") || env("LINE_CHANNEL_ID")))}</td></tr>
          <tr><td>หน้าจองคิว</td><td>{env("NEXT_PUBLIC_LIFF_ID") ? ok(true) : <span className="tag">ใช้ลิงก์ส่วนตัวจากบอท (ยังไม่มี LIFF)</span>}</td></tr>
          <tr><td>LINE Login (พนักงานเข้าระบบ)</td><td>{ok(env("LINE_LOGIN_CHANNEL_ID") && env("LINE_LOGIN_CHANNEL_SECRET"))}</td></tr>
          <tr><td>ฐานข้อมูล</td><td>{ok(env("DATABASE_URL"))}</td></tr>
          <tr><td>Cron เตือนนัด</td><td>{ok(env("CRON_SECRET"))}</td></tr>
          <tr><td>Rich menu</td><td>{ok(!!s.richMenuId)} <form action={setupRichMenu} style={{ display: "inline" }}><button className="btn ghost small">ติดตั้ง / อัปเดตเมนู</button></form></td></tr>
          <tr><td>กลุ่ม LINE ของพนักงาน (รับแจ้งเตือนนัดพรุ่งนี้)</td><td>{ok(!!s.staffGroupId)}
            {cand.length > 0 ? <form action={useStaffGroup} style={{ display: "inline" }}> <button className="btn ghost small">ใช้กลุ่มที่เพิ่งเชิญบอท</button></form> : <small className="muted"> เชิญบอทเข้ากลุ่ม แล้วพิมพ์ในกลุ่มหนึ่งข้อความ</small>}</td></tr>
        </tbody></table>
      </div>
      <form className="card" action={saveClinic}>
        <div className="eyebrow">เวลาทำการ</div>
        <table className="t" style={{ marginTop: 10 }}><tbody>
          {DAYS.map((d, i) => (
            <tr key={i}><td>{d}</td>
              <td><input type="time" name={`open_${i}`} defaultValue={s.hours[i]?.open || "10:00"} /> – <input type="time" name={`close_${i}`} defaultValue={s.hours[i]?.close || "19:00"} /></td>
              <td><label className="check"><input type="checkbox" name={`closed_${i}`} defaultChecked={!s.hours[i]} /> หยุด</label></td></tr>))}
        </tbody></table>
        <div className="row" style={{ marginTop: 14 }}>
          <div className="field"><label>ช่องจอง (นาที)</label><input name="slotMinutes" type="number" defaultValue={s.slotMinutes} /></div>
          <div className="field"><label>ปรึกษาครั้งละ (นาที)</label><input name="consultMinutes" type="number" defaultValue={s.consultMinutes} /></div>
          <div className="field"><label>จองล่วงหน้าอย่างน้อย (ชม.)</label><input name="leadHours" type="number" defaultValue={s.leadHours} /></div>
          <div className="field"><label>จองได้ไกลสุด (วัน)</label><input name="horizonDays" type="number" defaultValue={s.horizonDays} /></div>
        </div>
        <div className="grid2">
          <div className="field"><label>แพทย์ (บรรทัดละคน)</label><textarea name="doctors" rows={3} defaultValue={s.doctors.join("\n")} /></div>
          <div className="field"><label>วันหยุดพิเศษ (YYYY-MM-DD คั่นด้วยเว้นวรรค)</label><textarea name="closedDates" rows={3} defaultValue={s.closedDates.join(" ")} /></div>
        </div>
        <div className="field"><label>เบอร์โทรคลินิก (แสดงในข้อความ)</label><input name="phone" defaultValue={s.phone} /></div>
        <p className="muted" style={{ fontSize: 13 }}>ข้อความขอความยินยอมเวอร์ชัน {s.consentVersion} เป็นฉบับร่าง รอฝ่ายกฎหมาย/แพทย์ตรวจก่อนใช้จริง</p>
        <button className="btn">บันทึก</button>
      </form>
    </>
  );
}

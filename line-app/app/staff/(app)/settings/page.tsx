import { q } from "@/lib/db";
import { saveClinic, setupRichMenu, useStaffGroup, useExecGroup } from "@/lib/actions";
import { togglePause } from "@/lib/actions2";
import { capiStatus } from "@/lib/capi";
import { getSettings } from "@/lib/settings";
import { requireStaff } from "@/lib/session";

export const dynamic = "force-dynamic";
const DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const ok = (b: boolean) => <span className={`tag ${b ? "ok" : "bad"}`}>{b ? "พร้อม" : "ยังไม่ตั้งค่า"}</span>;

export default async function Settings() {
  await requireStaff(["BM"]);
  const s = await getSettings();
  const cand = await q("select value from settings where key = 'candidate_group'");
  const candId = (cand[0]?.value as { groupId?: string } | undefined)?.groupId;
  const newGroup = !!candId && candId !== s.staffGroupId && candId !== s.execGroupId; // a group the bot joined that isn't linked yet
  const env = (k: string) => !!process.env[k];
  const capi = await capiStatus();
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
            {newGroup ? <form action={useStaffGroup} style={{ display: "inline" }}> <button className="btn ghost small">ใช้กลุ่มที่เพิ่งเชิญบอท</button></form> : !s.staffGroupId && <small className="muted"> เชิญบอทเข้ากลุ่ม แล้วพิมพ์ในกลุ่มหนึ่งข้อความ</small>}</td></tr>
          <tr><td>กลุ่มผู้บริหาร (รายงานยอดเงิน 19:00)</td><td>{ok(!!s.execGroupId)}
            {newGroup && s.staffGroupId ? <form action={useExecGroup} style={{ display: "inline" }}> <button className="btn ghost small">ใช้กลุ่มที่เพิ่งเชิญบอทเป็นกลุ่มผู้บริหาร</button></form> : !s.execGroupId && <small className="muted"> สร้างกลุ่มใหม่เฉพาะผู้บริหาร เชิญบอท Vinfinity Clinic เข้ากลุ่ม แล้วกลับมากดปุ่มที่นี่</small>}</td></tr>
        </tbody></table>
      </div>
      <section className="card">
        <div className="eyebrow">CONVERSION API · ส่งผลลัพธ์กลับแพลตฟอร์มโฆษณา</div>
        <table className="t" style={{ marginTop: 10 }}><tbody>
          {([["meta", "Meta (Facebook / IG)", "META_PIXEL_ID + META_CAPI_TOKEN"], ["tiktok", "TikTok", "TIKTOK_PIXEL_ID + TIKTOK_ACCESS_TOKEN"], ["ga4", "Google Analytics 4 → Google Ads", "GA4_MEASUREMENT_ID + GA4_API_SECRET"]] as const).map(([k, l, v]) => (
            <tr key={k}><td>{l}</td><td>{capi.platforms.includes(k) ? <span className="tag ok">เปิด</span> : <span className="tag">ปิด</span>}</td><td><small className="muted">{v}</small></td></tr>))}
        </tbody></table>
        <p className="muted" style={{ fontSize: 13 }}>ส่งเฉพาะลูกค้าที่ยินยอมรับข่าวสาร · เบอร์โทรถูก hash · ไม่ส่งชื่อหัตถการ · เหตุการณ์: แชทครั้งแรก, จองนัด, ชำระเงิน (ย้อนหลังได้ 7 วัน)
          {Object.keys(capi.counts).length > 0 && <> · สถานะ: {Object.entries(capi.counts).map(([k, n]) => `${k} ${n}`).join(", ")}</>}</p>
      </section>
      <form className="card" action={togglePause}>
        <div className="eyebrow">ข้อความอัตโนมัติ (kill switch)</div>
        <p style={{ margin: "8px 0" }}>{s.paused ? "หยุดส่งข้อความอัตโนมัติทั้งหมดอยู่ (เตือนนัด nurture aftercare CSAT แจ้งเตือนทีม)" : "เปิดอยู่ · ระบบเช็คทุก 5 นาที"}</p>
        <input type="hidden" name="on" value={s.paused ? "0" : "1"} /><button className={`btn small ${s.paused ? "" : "danger"}`}>{s.paused ? "เปิดส่งอีกครั้ง" : "หยุดส่งทั้งหมดชั่วคราว"}</button>
      </form>
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

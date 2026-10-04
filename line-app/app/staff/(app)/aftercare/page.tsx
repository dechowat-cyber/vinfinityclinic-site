import { q } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { saveTemplate, approveAftercare } from "@/lib/actions2";

export const dynamic = "force-dynamic";
const KEYS: [string, string][] = [["general", "ทั่วไป"], ["filler", "ฟิลเลอร์"], ["toxin", "โบทูลินัม"], ["skinbooster", "สกินบูสเตอร์"], ["energy", "เครื่องยกกระชับ"]];
const DAYS: [number, string][] = [[0, "D0 · 3 ชม.หลังทำ"], [1, "D1 · เช็คอาการ (มีปุ่ม ปกติดี / อยากให้หมอดู)"], [3, "D3 · เคล็ดลับ"], [7, "D7 · ดูผล"]];

export default async function Aftercare() {
  const me = await requireStaff();
  const s = await getSettings();
  const rows = await q("select key, day, body from aftercare_templates");
  const can = ["BM", "DR", "NS"].includes(me.role);
  return (
    <>
      <div><div className="eyebrow">AFTERCARE TEMPLATES · FR-32</div><h1>ข้อความหลังทำ</h1></div>
      <div className={`card ${s.aftercareApproved ? "" : "err"}`}>
        {s.aftercareApproved
          ? <>ข้อความได้รับการอนุมัติโดย {s.aftercareApprovedBy} เมื่อ {s.aftercareApprovedAt ? new Date(s.aftercareApprovedAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }) : "-"} · ระบบส่งอัตโนมัติอยู่</>
          : <>ยังไม่เปิดส่ง: ข้อความทั้งหมดเป็นฉบับร่าง ต้องให้แพทย์อ่านและอนุมัติก่อน (แก้ข้อความใดก็ต้องอนุมัติใหม่)</>}
        {["DR", "BM"].includes(me.role) && <form action={approveAftercare} style={{ marginTop: 10 }}><input type="hidden" name="on" value={s.aftercareApproved ? "0" : "1"} />
          <button className={`btn small ${s.aftercareApproved ? "danger" : ""}`}>{s.aftercareApproved ? "หยุดส่งอัตโนมัติ" : "แพทย์อนุมัติข้อความทั้งหมดแล้ว · เปิดส่ง"}</button></form>}
      </div>
      <p className="muted" style={{ margin: 0 }}>D14 ส่งแบบสอบถามความพึงพอใจ + ลิงก์รีวิว Google ให้ทุกคนอัตโนมัติ (ไม่คัดเฉพาะคนพอใจ ตามกฎ Google) · ห้ามใส่คำรับประกันผลหรือคำเกินจริง</p>
      {KEYS.map(([k, label]) => (
        <section className="card" key={k}><div className="eyebrow">{label}</div>
          {DAYS.map(([d, dl]) => (
            <form key={d} action={saveTemplate} style={{ marginTop: 12 }}>
              <input type="hidden" name="key" value={k} /><input type="hidden" name="day" value={d} />
              <div className="field" style={{ margin: 0 }}><label>{dl}</label>
                <textarea name="body" rows={2} defaultValue={rows.find((r) => r.key === k && r.day === d)?.body ?? ""} disabled={!can} /></div>
              {can && <button className="btn ghost small" style={{ marginTop: 6 }}>บันทึก</button>}
            </form>))}
        </section>))}
    </>
  );
}

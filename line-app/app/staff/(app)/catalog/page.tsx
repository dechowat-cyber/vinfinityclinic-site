import { q } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { saveCatalog } from "@/lib/actions2";

export const dynamic = "force-dynamic";
const KEYS = ["general", "filler", "toxin", "skinbooster", "energy"];

export default async function Catalog() {
  const me = await requireStaff();
  const rows = await q("select * from catalog order by active desc, category, name");
  const bm = me.role === "BM";
  const Row = ({ r }: { r?: any }) => (
    <form action={saveCatalog} className="row" style={{ padding: "10px 12px", borderTop: "1px solid var(--line)", background: "#fff" }}>
      <input type="hidden" name="id" value={r?.id ?? ""} />
      <input name="name" className="inp" defaultValue={r?.name ?? ""} placeholder="ชื่อรายการ" style={{ flex: 2, minWidth: 200 }} disabled={!bm} />
      <input name="category" className="inp" defaultValue={r?.category ?? ""} placeholder="หมวด" style={{ width: 120 }} disabled={!bm} />
      <input name="unit" className="inp" defaultValue={r?.unit ?? "ครั้ง"} style={{ width: 80 }} disabled={!bm} />
      <input name="price" type="number" className="inp" defaultValue={r ? Number(r.price) : 0} style={{ width: 110 }} disabled={!bm} aria-label="ราคา" />
      <select name="aftercare_key" className="inp" defaultValue={r?.aftercare_key ?? "general"} disabled={!bm}>{KEYS.map((k) => <option key={k}>{k}</option>)}</select>
      <label className="row" style={{ gap: 4, fontSize: 13 }} title="เตือนลูกค้าให้กลับมาทำซ้ำหลังจากกี่วัน (เว้นว่าง = ไม่เตือน)">รอบ
        <input name="recall_days" type="number" min={0} className="inp" defaultValue={r?.recall_days ?? ""} style={{ width: 70 }} disabled={!bm} aria-label="รอบทำซ้ำ (วัน)" />วัน</label>
      <label className="check" style={{ margin: 0 }}><input type="checkbox" name="active" defaultChecked={r ? r.active : true} disabled={!bm} /> ใช้งาน</label>
      {bm && <button className="btn ghost small">{r ? "บันทึก" : "เพิ่ม"}</button>}
    </form>);
  return (
    <>
      <div><div className="eyebrow">PRICE CATALOG · FR-22</div><h1>แคตตาล็อกและราคากลาง</h1></div>
      <p className="muted" style={{ margin: 0 }}>แผนการรักษาดึงราคาจากตารางนี้เท่านั้น ที่ปรึกษาแก้ราคาในแผนไม่ได้ ส่วนลดต้องให้ BM อนุมัติ · แก้ราคาได้เฉพาะ BM ตามคำสั่งเป็นลายลักษณ์อักษรของเจ้าของคลินิก · ใช้ชื่อกลางของหัตถการ ไม่ใช้ชื่อยี่ห้อยา · <b>รอบ … วัน</b> = ระบบจะชวนลูกค้ากลับมาทำซ้ำเมื่อครบรอบ (หน้า “กลับมาทำซ้ำ”)</p>
      <div style={{ border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
        {rows.map((r) => <Row key={r.id} r={r} />)}
        {bm && <Row />}
      </div>
    </>
  );
}

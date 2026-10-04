"use client";
import { useMemo, useState } from "react";

type Cat = { id: number; name: string; unit: string; price: number; category: string | null };

/** FR-22: pick items from the catalog; prices are read-only and recomputed on the server. */
export function PlanBuilder({ clientId, consultId, catalog, action, isBM }: { clientId: number; consultId: number | null; catalog: Cat[]; action: (fd: FormData) => Promise<void>; isBM: boolean }) {
  const [rows, setRows] = useState<{ catalog_id: number; qty: number }[]>([{ catalog_id: catalog[0]?.id ?? 0, qty: 1 }]);
  const [discount, setDiscount] = useState(0);
  const sub = useMemo(() => rows.reduce((a, r) => a + (catalog.find((c) => c.id === r.catalog_id)?.price ?? 0) * r.qty, 0), [rows, catalog]);
  const zero = rows.some((r) => (catalog.find((c) => c.id === r.catalog_id)?.price ?? 0) === 0);
  return (
    <form action={action} className="card">
      <div className="eyebrow">TREATMENT PLAN · ออกแผน</div>
      <input type="hidden" name="client_id" value={clientId} />
      <input type="hidden" name="consult_id" value={consultId ?? ""} />
      <input type="hidden" name="items" value={JSON.stringify(rows)} />
      <div className="field" style={{ marginTop: 12 }}><label>เป้าหมาย (แสดงบนการ์ดที่ส่งลูกค้า)</label><input name="goal" placeholder="เช่น ใต้ตาดูสดชื่นขึ้น เป็นธรรมชาติ" /></div>
      {rows.map((r, i) => {
        const c = catalog.find((x) => x.id === r.catalog_id);
        return (
          <div className="row" key={i} style={{ marginBottom: 8 }}>
            <select value={r.catalog_id} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, catalog_id: Number(e.target.value) } : x)))} style={{ flex: 1, minWidth: 200 }} className="inp">
              {catalog.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.price ? `${c.price.toLocaleString()} / ${c.unit}` : "ยังไม่ตั้งราคา"}</option>)}
            </select>
            <input type="number" min={1} max={20} value={r.qty} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) || 1 } : x)))} className="inp" style={{ width: 70 }} aria-label="จำนวน" />
            <span className="muted" style={{ width: 110, textAlign: "right" }}>{((c?.price ?? 0) * r.qty).toLocaleString()} บาท</span>
            {rows.length > 1 && <button type="button" className="btn ghost small" onClick={() => setRows(rows.filter((_, j) => j !== i))}>ลบ</button>}
          </div>);
      })}
      <button type="button" className="btn ghost small" onClick={() => setRows([...rows, { catalog_id: catalog[0]?.id ?? 0, qty: 1 }])}>+ เพิ่มรายการ</button>
      <div className="row" style={{ marginTop: 14, alignItems: "flex-end" }}>
        <div className="field" style={{ margin: 0 }}><label>ส่วนลด (บาท){isBM ? "" : " · ต้องให้ BM อนุมัติ"}</label><input name="discount" type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} /></div>
        <div className="field" style={{ margin: 0 }}><label>ราคาใช้ได้ (วัน)</label><input name="valid_days" type="number" min={1} max={90} defaultValue={30} /></div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}><small className="muted">รวม</small><div style={{ fontSize: 22 }}>{Math.max(0, sub - discount).toLocaleString()} บาท</div></div>
      </div>
      {zero && <p className="err">มีรายการที่ยังไม่ตั้งราคาในแคตตาล็อก ให้ BM ตั้งราคาก่อนส่งการ์ด</p>}
      <button className="btn" style={{ marginTop: 12 }} disabled={zero}>บันทึกแผน</button>
    </form>
  );
}

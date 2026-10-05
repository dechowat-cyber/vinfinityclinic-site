import { q } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { saveTemplates, approveAftercare } from "@/lib/actions2";
import { CARE_CARDS, CARD_FOR, CARE_VERSION, type CareCard } from "@/lib/careCards";

export const dynamic = "force-dynamic";
const KEYS: [string, string][] = [["filler", "ฟิลเลอร์"], ["toxin", "โบท็อกซ์"], ["sculptra", "Sculptra"], ["hifu", "HIFU / New Doublo"], ["microneedle", "Microneedle"], ["skinbooster", "สกินบูสเตอร์"], ["energy", "เครื่องยกกระชับอื่นๆ"], ["general", "ทั่วไป (ใช้เมื่อไม่มีหมวด)"]];
const DAYS: [number, string][] = [[0, "D0 · 3 ชม.หลังทำ (ใช้เมื่อไม่มีการ์ด)"], [1, "D1 · เช็คอาการ (มีปุ่ม ปกติดี / อยากให้หมอดู)"], [3, "D3 · เคล็ดลับ"], [7, "D7 · ดูผล"]];

function CardPreview({ c, phone }: { c: CareCard; phone: string }) {
  const L = ({ head, items, cls }: { head: string; items: string[]; cls?: string }) => <div className={`cc-sec ${cls ?? ""}`}><b>{head}</b><ul>{items.map((x) => <li key={x}>{x}</li>)}</ul></div>;
  return (
    <div className="cc">
      <div className="cc-h"><small>AFTERCARE · VINFINITY CLINIC</small><div>{c.title}</div></div>
      <div className="cc-b">
        <p className="muted">{c.lead}</p>
        {c.special && <div className="cc-special"><b>{c.special.title}</b><ul>{c.special.lines.map((x) => <li key={x}>{x}</li>)}</ul></div>}
        <L head="ทำได้ / ควรทำ" items={c.doList} cls="do" />
        <L head="งดก่อน" items={c.avoid} />
        <L head="อาการที่พบได้ ไม่ต้องกังวล" items={c.normal} cls="muted" />
        <L head={`ติดต่อคลินิกทันที ${phone}`} items={c.urgent} cls="bad" />
      </div>
    </div>
  );
}

export default async function Aftercare() {
  const me = await requireStaff();
  const s = await getSettings();
  const rows = await q("select key, day, body from aftercare_templates");
  const can = ["BM", "DR", "NS"].includes(me.role);
  const live = !!s.aftercareApproved && s.aftercareVersion === CARE_VERSION;
  const stale = !!s.aftercareApproved && !live;
  return (
    <>
      <div><div className="eyebrow">AFTERCARE · การดูแลหลังทำ</div><h1>การ์ดและข้อความหลังทำ</h1></div>
      <div className={`card ${live ? "" : "err"}`}>
        {live
          ? <>แพทย์อนุมัติแล้วโดย {s.aftercareApprovedBy} เมื่อ {s.aftercareApprovedAt ? new Date(s.aftercareApprovedAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }) : "-"} · ระบบส่งอัตโนมัติอยู่</>
          : stale ? <>มีการ์ดดูแลตัวเองชุดใหม่ (Sculptra, HIFU, Microneedle และปรับฟิลเลอร์/โบท็อกซ์) · หยุดส่งไว้ก่อนจนกว่าแพทย์จะอ่านและอนุมัติอีกครั้ง</>
          : <>ยังไม่เปิดส่ง: การ์ดและข้อความทั้งหมดเป็นฉบับร่าง ต้องให้แพทย์อ่านและอนุมัติก่อน (แก้ข้อความใดก็ต้องอนุมัติใหม่)</>}
        {["DR", "BM"].includes(me.role) && <form action={approveAftercare} style={{ marginTop: 10 }}><input type="hidden" name="on" value={live ? "0" : "1"} />
          <button className={`btn small ${live ? "danger" : ""}`}>{live ? "หยุดส่งอัตโนมัติ" : "แพทย์อ่านการ์ดและข้อความทั้งหมดแล้ว · อนุมัติและเปิดส่ง"}</button></form>}
      </div>
      <p className="muted" style={{ margin: 0 }}>เมื่อกด “ทำแล้ว” ในหน้าลูกค้า ระบบส่งการ์ดดูแลตัวเองทาง LINE ทันที (ถึง 21:30) แล้วตามด้วยข้อความ D1 · D3 · D7 และแบบสอบถาม D14 อัตโนมัติ · ห้ามใส่คำรับประกันผลหรือคำเกินจริง</p>
      {KEYS.map(([k, label]) => {
        const card = CARE_CARDS[CARD_FOR[k]];
        return (
          <section className="card" key={k}>
            <div className="eyebrow">{label}{card ? " · มีการ์ดดูแลตัวเอง" : ""}</div>
            <div className={card ? "cc-grid" : undefined}>
              {card && <CardPreview c={card} phone={s.phone} />}
              <form action={saveTemplates}>
                <input type="hidden" name="key" value={k} />
                {DAYS.filter(([d]) => !(card && d === 0)).map(([d, dl]) => (
                  <div className="field" key={d} style={{ margin: "10px 0 0" }}><label>{dl}</label>
                    <textarea name={`body_${d}`} rows={3} defaultValue={rows.find((r) => r.key === k && r.day === d)?.body ?? ""} disabled={!can} /></div>))}
                {can && <button className="btn ghost small" style={{ marginTop: 10 }}>บันทึกข้อความ{label}</button>}
              </form>
            </div>
          </section>);
      })}
    </>
  );
}

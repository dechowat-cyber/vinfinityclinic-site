import { q } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { CASHIER_ROLES, METHODS, baht } from "@/lib/payments";
import { totals, dayClose, weekStart, monthStart } from "@/lib/finance";
import { todayBkk, thaiDate, thaiTime } from "@/lib/time";
import { slipConfirm, slipReject, closeDay, manualSaleAdd, manualSaleVoid, salesFormUpload } from "@/lib/crmActions";
import { listManual } from "@/lib/salesForm";

export const dynamic = "force-dynamic";

const ERR: Record<string, string> = { bad_amount: "ใส่ยอดเงินให้ถูกต้อง", slip_done: "สลิปนี้มีคนยืนยันไปแล้ว", bad_plan: "แผนไม่ตรงกับลูกค้า", no_file: "เลือกรูปฟอร์มก่อน", form_read: "อ่านรูปไม่สำเร็จ ลองรูปที่ชัดขึ้น หรือเพิ่มรายการเอง", not_form: "รูปนี้ไม่ใช่ฟอร์มยอดขาย" };
const n = (v: number) => Number(v).toLocaleString("th-TH", { maximumFractionDigits: 2 });

export default async function Finance({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const me = await requireStaff(CASHIER_ROLES);
  const { err } = await searchParams;
  const day = todayBkk();
  const [slips, t, w, m, close, recent, manual] = await Promise.all([
    q(`select s.id, s.client_id, s.status, s.qr_ref, s.created_at, c.name, c.display_name,
         coalesce((select json_agg(json_build_object('id', p.id, 'goal', p.goal, 'due', greatest(p.total - coalesce((select sum(amount) from payments x where x.plan_id = p.id and x.voided_at is null), 0), 0)) order by p.id desc)
           from plans p where p.client_id = s.client_id and p.created_at > now() - interval '60 days'), '[]') as plans
       from slips s join clients c on c.id = s.client_id where s.status in ('pending','duplicate') order by s.created_at`),
    totals(day, day), totals(weekStart(day), day), totals(monthStart(day), day), dayClose(day),
    q(`select p.id, p.receipt_no, p.amount, p.method, p.created_at, p.voided_at, c.name, c.display_name from payments p join clients c on c.id = p.client_id
       where p.created_at >= now() - interval '1 day' order by p.created_at desc limit 30`),
    listManual(monthStart(day), day),
  ]);
  const card = t.by.card?.amt ?? 0, cash = t.by.cash?.amt ?? 0;
  return (
    <>
      <div><div className="eyebrow">FINANCE · การเงิน</div><h1>รับเงิน · ปิดยอด</h1></div>
      {err && <p className="err">{ERR[err] ?? err}</p>}

      <section className="card">
        <div className="eyebrow">สลิปโอนจาก LINE รอยืนยัน · {slips.length}</div>
        {slips.length === 0 ? <p className="muted" style={{ marginBottom: 0 }}>ไม่มีสลิปค้าง · ลูกค้าส่งสลิปเข้า LINE คลินิกแล้วจะขึ้นที่นี่เอง</p> :
          <div className="slips">{slips.map((s) => {
            const plans = (s.plans as { id: number; goal: string | null; due: number }[]).filter((p) => Number(p.due) > 0);
            return (
              <div key={s.id} className="slip">
                <a href={`/api/staff/slip/${s.id}`} target="_blank"><img src={`/api/staff/slip/${s.id}`} alt="สลิป" /></a>
                <div className="slip-b">
                  <a href={`/staff/clients/${s.client_id}#payments`}><b>{s.name || s.display_name || "-"}</b></a>
                  <small className="muted">{thaiTime(new Date(s.created_at))} · {s.qr_ref ? "สลิปธนาคาร (มี QR)" : "รูปจากลูกค้า (ไม่พบ QR สลิป)"}</small>
                  {s.status === "duplicate" ? <><p className="err" style={{ margin: "6px 0" }}>สลิปนี้เคยส่งมาแล้ว อาจเป็นสลิปซ้ำ</p>
                    <form action={slipReject}><input type="hidden" name="id" value={s.id} /><button className="btn ghost small">รับทราบ · ไม่บันทึก</button></form></> :
                  <form action={slipConfirm} className="slip-f">
                    <input type="hidden" name="id" value={s.id} />
                    <select name="plan_id" className="inp" defaultValue={plans[0]?.id ?? ""}>
                      {plans.map((p) => <option key={p.id} value={p.id}>แผน #{p.id}{p.goal ? ` ${String(p.goal).slice(0, 20)}` : ""} · ค้าง {n(p.due)}</option>)}
                      <option value="">ไม่ผูกกับแผน</option></select>
                    <div className="row">
                      <input name="amount" className="inp" inputMode="decimal" required placeholder="ยอดในสลิป" defaultValue={plans[0] ? Number(plans[0].due) : ""} style={{ width: 130 }} aria-label="ยอดในสลิป (บาท)" />
                      <select name="method" className="inp" defaultValue="transfer"><option value="transfer">โอน</option><option value="qr">QR พร้อมเพย์</option></select>
                    </div>
                    <div className="row">
                      <button className="btn small">ยอดตรงสลิป · ออกใบเสร็จ</button>
                      <button className="btn ghost small" formAction={slipReject}>ไม่ใช่สลิป</button>
                    </div>
                  </form>}
                </div>
              </div>);
          })}</div>}
      </section>

      <div className="kpis">
        <div className="kpi"><b>{n(t.total)}</b><small>วันนี้ (บาท) · {t.n} รายการ</small></div>
        <div className="kpi"><b>{n(w.total)}</b><small>สัปดาห์นี้</small></div>
        <div className="kpi"><b>{n(m.total)}</b><small>เดือนนี้</small></div>
      </div>

      <div className="grid2">
        <section className="card">
          <div className="eyebrow">ยอดวันนี้ในระบบ แยกตามวิธีชำระ</div>
          <table className="t" style={{ marginTop: 10 }}><tbody>
            {Object.entries(METHODS).map(([k, l]) => <tr key={k}><td>{l}</td><td style={{ textAlign: "right" }}>{n(t.by[k]?.amt ?? 0)}</td><td className="muted">{t.by[k]?.n ?? 0} ใบ</td></tr>)}
            {t.voids.n > 0 && <tr><td className="muted">ยกเลิก</td><td style={{ textAlign: "right" }} className="muted">{n(t.voids.amt)}</td><td className="muted">{t.voids.n} ใบ</td></tr>}
          </tbody></table>
        </section>
        <form className="card" action={closeDay}>
          <div className="eyebrow">ปิดยอดวันนี้ {close ? `· ปิดแล้ว ${thaiTime(new Date(close.closed_at))} (แก้ได้)` : ""}</div>
          <p className="muted" style={{ fontSize: 13, margin: "6px 0 12px" }}>กดสรุปยอดที่เครื่องรูดบัตร และนับเงินสดในลิ้นชัก แล้วใส่ตัวเลขจริง ระบบเทียบกับใบเสร็จให้</p>
          <div className="row" style={{ alignItems: "flex-end" }}>
            <div className="field" style={{ margin: 0 }}><label>ยอดสรุปเครื่องรูดบัตร</label><input name="edc" inputMode="decimal" defaultValue={close?.edc ?? ""} placeholder={`ในระบบ ${n(card)}`} /></div>
            <div className="field" style={{ margin: 0 }}><label>เงินสดที่นับได้</label><input name="cash" inputMode="decimal" defaultValue={close?.cash ?? ""} placeholder={`ในระบบ ${n(cash)}`} /></div>
          </div>
          {close && <p style={{ margin: "10px 0 0", fontSize: 14 }}>
            {close.edc !== null && <>บัตร: {Number(close.edc) === card ? <span className="tag ok">ตรง</span> : <span className="tag bad">ต่าง {n(Number(close.edc) - card)}</span>} </>}
            {close.cash !== null && <>เงินสด: {Number(close.cash) === cash ? <span className="tag ok">ตรง</span> : <span className="tag bad">ต่าง {n(Number(close.cash) - cash)}</span>}</>}</p>}
          <div className="field" style={{ margin: "12px 0 0" }}><label>หมายเหตุ (ถ้ายอดไม่ตรง)</label><input name="note" defaultValue={close?.note ?? ""} placeholder="เช่น ทอนเงินผิด 100" /></div>
          <button className="btn" style={{ marginTop: 12 }}>{close ? "บันทึกการปิดยอดใหม่" : "ปิดยอดวันนี้"}</button>
        </form>
      </div>


      <section className="card" id="form">
        <div className="eyebrow">ยอดจากฟอร์มพนักงาน · เดือนนี้</div>
        <p className="muted" style={{ fontSize: 13, margin: "6px 0 10px" }}>รูปฟอร์มยอดขายที่พนักงานส่งในกลุ่ม ระบบอ่านและใส่ให้เอง · ถ้ายอดตรงกับใบเสร็จในระบบ (วันเดียวกัน ยอดเท่ากัน) จะไม่นับซ้ำ</p>
        {manual.length === 0 ? <p className="muted">-</p> : <table className="t"><tbody>{manual.map((r: any) => (
          <tr key={r.id} style={r.voided_at ? { opacity: 0.45 } : undefined}>
            <td><small>{r.day.slice(8)}/{r.day.slice(5, 7)}</small></td><td><small>{r.hn ?? ""}</small> {r.name ?? ""}</td>
            <td><small>{r.item ?? ""}{r.note ? ` · ${r.note}` : ""}</small></td><td><small>{METHODS[r.method] ?? r.method}{r.seller ? ` · ${r.seller}` : ""}</small></td>
            <td style={{ textAlign: "right" }}>{r.voided_at ? <s>{n(r.amount)}</s> : n(r.amount)}</td>
            <td><small className="muted">{r.voided_at ? "ยกเลิก" : r.payment_id ? "ตรงใบเสร็จ · ไม่นับซ้ำ" : "นับในยอด"}</small></td>
            <td>{me.role === "BM" && !r.voided_at && <form action={manualSaleVoid}><input type="hidden" name="id" value={r.id} /><button className="btn ghost small">ลบ</button></form>}</td>
          </tr>))}</tbody></table>}
        <form action={salesFormUpload} className="row" style={{ marginTop: 10, alignItems: "center" }}>
          <input type="file" name="file" accept="image/*" className="inp" aria-label="รูปฟอร์มยอดขาย" />
          <button className="btn small">อ่านรูปฟอร์ม</button>
        </form>
        <details style={{ marginTop: 10 }}><summary>เพิ่มรายการเอง (ถ้าระบบอ่านรูปไม่ได้)</summary>
          <form action={manualSaleAdd} className="row" style={{ flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
            <input type="date" name="day" className="inp" defaultValue={day} aria-label="วันที่" />
            <input name="hn" className="inp" placeholder="HN" style={{ width: 90 }} />
            <input name="name" className="inp" placeholder="ชื่อ" style={{ width: 130 }} />
            <input name="item" className="inp" placeholder="หัตถการ / มัดจำ" style={{ width: 180 }} />
            <select name="method" className="inp" defaultValue="transfer"><option value="transfer">โอน</option><option value="cash">เงินสด</option><option value="card">บัตร</option></select>
            <input name="amount" className="inp" inputMode="decimal" placeholder="ยอด" required style={{ width: 100 }} />
            <select name="seller" className="inp" defaultValue=""><option value="">ผู้ขาย</option><option>คุณหมอ</option><option>ยุ</option><option>เพลง</option></select>
            <select name="channel" className="inp" defaultValue=""><option value="">ช่องทาง</option><option>Walk in</option><option>Line OA</option><option>Online</option></select>
            <input name="note" className="inp" placeholder="หมายเหตุ" style={{ width: 160 }} />
            <button className="btn small">เพิ่ม</button>
          </form></details>
      </section>
      <section className="card">
        <div className="eyebrow">ใบเสร็จ 24 ชม.ล่าสุด</div>
        {recent.length === 0 ? <p className="muted">-</p> : <table className="t" style={{ marginTop: 8 }}><tbody>{recent.map((p) => (
          <tr key={p.id} style={p.voided_at ? { opacity: 0.5 } : undefined}><td><a href={`/staff/receipts/${p.id}`}>{p.receipt_no}</a></td><td><small>{thaiTime(new Date(p.created_at))}</small></td>
            <td>{p.name || p.display_name}</td><td><small>{METHODS[p.method] ?? p.method}</small></td><td style={{ textAlign: "right" }}>{p.voided_at ? <s>{n(Number(p.amount))}</s> : n(Number(p.amount))}</td></tr>))}</tbody></table>}
      </section>
      <p className="muted" style={{ fontSize: 13 }}>ทุกวัน 19:00 ระบบส่งสรุปยอด (วัน · สัปดาห์ · เดือน) เข้ากลุ่มผู้บริหาร · {me.role === "BM" ? "ตั้งกลุ่มได้ที่ ตั้งค่า" : "ยอดเงินไม่ถูกส่งเข้ากลุ่มทีม"} · {thaiDate(new Date())}</p>
    </>
  );
}

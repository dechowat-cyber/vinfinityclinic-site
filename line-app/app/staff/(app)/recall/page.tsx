import { requireStaff } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { syncRecalls, recallList, lapsedClients, RECALL_STATUS } from "@/lib/recall";
import { recallAction, saveRecallSettings } from "@/lib/crmActions";
import { baht } from "@/lib/payments";
import { thaiDate, todayBkk, parts } from "@/lib/time";

export const dynamic = "force-dynamic";

const day = (d: string | Date) => (d instanceof Date ? parts(d).date : String(d).slice(0, 10));
const short = (d: string | Date) => thaiDate(new Date(`${day(d)}T12:00:00+07:00`)).replace(/^วัน\S+ /, "");

/** Recall: clients whose treatment is due again, and clients who have drifted away. */
export default async function Recall({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const me = await requireStaff();
  const tab = (await searchParams).tab === "lapsed" ? "lapsed" : "due";
  const now = new Date();
  await syncRecalls(now);
  const [s, due, lapsed] = await Promise.all([getSettings(), recallList(now, 14), lapsedClients(now, 180)]);
  const today = todayBkk(now);
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div><div className="eyebrow">RECALL · กลับมาทำซ้ำ</div><h1>ลูกค้าถึงรอบทำซ้ำ</h1></div>
        <div className="row">
          <a className={`btn small ${tab === "due" ? "" : "ghost"}`} href="?tab=due">ถึงรอบ ({due.length})</a>
          <a className={`btn small ${tab === "lapsed" ? "" : "ghost"}`} href="?tab=lapsed">หายไปเกิน 6 เดือน ({lapsed.length})</a>
        </div>
      </div>

      {me.role === "BM" ? (
        <form className="card row" action={saveRecallSettings}>
          <label className="check" style={{ margin: 0 }}><input type="checkbox" name="auto" defaultChecked={!!s.recallAuto} /> ส่ง LINE ชวนจองอัตโนมัติ (เฉพาะลูกค้าที่ยินยอมรับข่าวสาร)</label>
          <label className="row" style={{ gap: 6 }}>ส่งล่วงหน้า <input name="lead" type="number" min={0} max={30} className="inp" defaultValue={s.recallLeadDays ?? 7} style={{ width: 64 }} /> วันก่อนครบรอบ</label>
          <button className="btn ghost small">บันทึก</button>
          <small className="muted" style={{ flexBasis: "100%" }}>{s.recallAuto ? "เปิดอยู่ · ส่งวันละครั้งหลัง 10:00" : "ปิดอยู่ · ทุกรายการจะขึ้นเป็นรายชื่อให้ทีมโทร/ทักเอง"} · ข้อความเป็นร่าง ให้แพทย์ตรวจก่อนเปิด · ตั้งรอบของแต่ละหัตถการได้ที่หน้า “ราคากลาง”</small>
        </form>
      ) : <p className="muted" style={{ margin: 0 }}>LINE อัตโนมัติ: {s.recallAuto ? "เปิด" : "ปิด (โทร/ทักเอง)"} · ตั้งค่าโดยผู้จัดการสาขา</p>}

      {tab === "due" ? (
        <table className="t">
          <thead><tr><th>ลูกค้า</th><th>หัตถการ</th><th>ทำล่าสุด</th><th>ครบรอบ</th><th>ช่องทาง</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            {due.length === 0 && <tr><td colSpan={7} className="muted">ไม่มีลูกค้าถึงรอบใน 14 วันนี้</td></tr>}
            {due.map((r) => {
              const overdue = day(r.due_on) < today;
              const line = r.line_user_id && r.mk === true;
              return (
                <tr key={r.id}>
                  <td><a href={`/staff/clients/${r.client_id}`}><b>{r.client_name || r.display_name || "-"}</b></a><br /><small className="muted">{r.phone || ""}</small></td>
                  <td>{r.name}</td>
                  <td><small>{short(r.done_at)}</small></td>
                  <td><span className={`tag ${overdue ? "bad" : "warn"}`}>{short(r.due_on)}{overdue ? " · เลยแล้ว" : ""}</span></td>
                  <td><small>{line ? "LINE ได้" : r.line_user_id ? "LINE (ไม่ยินยอมรับข่าวสาร → โทร)" : r.phone ? "โทร" : "-"}</small></td>
                  <td><span className="tag">{RECALL_STATUS[r.status]}</span>{r.note ? <><br /><small className="muted">{r.note}</small></> : null}</td>
                  <td><div className="row">
                    {r.phone && <a className="btn ghost small" href={`tel:${String(r.phone).replace(/[^0-9+]/g, "")}`}>โทร</a>}
                    <form action={recallAction} className="row"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="contacted" />
                      <input name="note" className="inp" placeholder="ผลการติดต่อ" style={{ width: 140 }} /><button className="btn small">ติดต่อแล้ว</button></form>
                    <form action={recallAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="dismissed" /><button className="btn ghost small">ไม่ติดตาม</button></form>
                  </div></td>
                </tr>);
            })}
          </tbody>
        </table>
      ) : (
        <table className="t">
          <thead><tr><th>ลูกค้า</th><th>มาครั้งล่าสุด</th><th>จำนวนครั้ง</th><th>ยอดสะสม</th><th></th></tr></thead>
          <tbody>
            {lapsed.length === 0 && <tr><td colSpan={5} className="muted">ไม่มี</td></tr>}
            {lapsed.map((c) => (
              <tr key={c.id}>
                <td><a href={`/staff/clients/${c.id}`}><b>{c.name || c.display_name || "-"}</b></a><br /><small className="muted">{c.phone || ""}{c.line_user_id ? " · LINE" : ""}</small></td>
                <td><small>{thaiDate(new Date(c.last_at))}</small></td><td>{c.visits}</td><td>{baht(Number(c.revenue))}</td>
                <td>{c.phone && <a className="btn ghost small" href={`tel:${String(c.phone).replace(/[^0-9+]/g, "")}`}>โทร</a>}</td>
              </tr>))}
          </tbody>
        </table>
      )}
      <p className="muted" style={{ fontSize: 13 }}>รายการจะเปลี่ยนเป็น “จองแล้ว” เองเมื่อลูกค้ามีนัดใหม่ และ “ทำซ้ำแล้ว” เมื่อบันทึกหัตถการเดิมครั้งใหม่</p>
    </>
  );
}

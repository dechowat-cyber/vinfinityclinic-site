import { requireStaff } from "@/lib/session";
import { syncFollowups, followupList, nextChannels, REASONS, CHANNELS, RESULTS, STATUS, dayOf } from "@/lib/followups";
import { followupAttempt, followupStatus, followupImport } from "@/lib/crmActions";
import { baht } from "@/lib/payments";
import { thaiDate, todayBkk, addDays } from "@/lib/time";

export const dynamic = "force-dynamic";

const short = (d: string | Date | null | undefined) => {
  const k = dayOf(d);
  return k ? thaiDate(new Date(`${k}T12:00:00+07:00`)).replace(/^วัน\S+ /, "") : "-";
};
const TABS: [string, string][] = [["due", "ต้องตามวันนี้"], ["unreachable", "ติดต่อไม่ได้"], ["booked", "นัดได้แล้ว (30 วัน)"], ["all", "ทั้งหมดที่ค้าง"]];
const SAMPLE = "HN\tชื่อ\tเบอร์\tรับบริการล่าสุด\tยอดสะสม\tวงเงินคงเหลือ\tค้างชำระ\tบริการคงเหลือ\tเหตุผล\tตามครั้งถัดไป\tนัดแล้ว\tสถานะ\tการติดตาม";

/** Follow-up: one list for every client someone must reach, with the next channel to try. */
export default async function Followups({ searchParams }: { searchParams: Promise<{ tab?: string; imported?: string; created?: string; items?: string; credit?: string }> }) {
  const me = await requireStaff();
  const sp = await searchParams;
  const tab = TABS.some(([k]) => k === sp.tab) ? sp.tab! : "due";
  const now = new Date();
  await syncFollowups(now).catch((e) => console.error("[followups] sync", e));
  const rows = await followupList(tab, now);
  const today = todayBkk(now);
  const bm = me.role === "BM";
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div><div className="eyebrow">FOLLOW-UP · ติดตามลูกค้า</div><h1>ลูกค้าที่ต้องติดต่อ</h1></div>
        <div className="row">{TABS.map(([k, l]) => <a key={k} className={`btn small ${tab === k ? "" : "ghost"}`} href={`?tab=${k}`}>{l}{k === tab ? ` (${rows.length})` : ""}</a>)}</div>
      </div>
      {sp.imported && <div className="card" style={{ borderColor: "var(--ok)" }}>นำเข้าแล้ว {sp.imported} ราย · ลูกค้าใหม่ {sp.created} · บริการคงเหลือ {sp.items} รายการ{bm ? ` · วงเงินยกมา ${baht(Number(sp.credit || 0))}` : ""}</div>}
      <p className="muted" style={{ margin: 0, fontSize: 14 }}>กติกา: ตามไม่ติดให้เปลี่ยนช่องทางทุกครั้ง (ระบบแนะนำช่องทางถัดไปให้) · พลาดติดกัน 3 ครั้ง ระบบย้ายไป “ติดต่อไม่ได้” และพักไว้ 14 วัน · ลูกค้าจองนัดใหม่ รายการจะปิดเอง</p>

      <table className="t">
        <thead><tr><th>ลูกค้า</th><th>ทำไมต้องตาม</th><th>คงเหลือกับคลินิก</th><th>ที่ผ่านมา</th><th>บันทึกการติดต่อ</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={5} className="muted">ไม่มีรายการในแท็บนี้</td></tr>}
          {rows.map((r) => {
            const tried = (r.tries ?? []).map((t: any) => t.channel);
            const suggest = nextChannels({ ...r, value: Number(r.value) }, tried);
            const overdue = dayOf(r.next_on)! < today;
            return (
              <tr key={r.id}>
                <td><a href={`/staff/clients/${r.client_id}#follow`}><b>{r.client_name || "-"}</b></a>{r.hn ? <small className="muted"> · HN {r.hn}</small> : null}
                  <br /><small className="muted">{[r.phone, r.phone2, r.alt_contact, r.line_user_id ? (r.followed ? "LINE" : "LINE (บล็อก/เลิกติดตาม)") : null].filter(Boolean).join(" · ") || "ไม่มีช่องทางติดต่อ ให้หาเพิ่ม"}</small>
                  {bm && Number(r.value) > 0 && <><br /><small className="tag">ยอดสะสม {baht(Number(r.value))}</small></>}</td>
                <td><span className="tag">{REASONS[r.reason] ?? r.reason}</span> <span className={`tag ${r.status === "unreachable" ? "bad" : r.status === "booked" ? "ok" : overdue ? "warn" : ""}`}>{STATUS[r.status]}{r.status !== "booked" ? ` · ตาม ${short(r.next_on)}` : ""}</span>
                  {r.note && <><br /><small>{r.note}</small></>}
                  <br /><small className="muted">มาล่าสุด {short(r.last_treat || r.legacy_last_visit)}{r.next_appt ? ` · นัดถัดไป ${short(r.next_appt)}` : ""}{r.next_visit_due ? ` · ควรกลับมา ${short(r.next_visit_due)}` : ""}</small></td>
                <td><small>{r.remaining || "-"}</small>
                  {Number(r.credit) > 0 && <><br /><small className="tag ok">วงเงิน {baht(Number(r.credit))}</small></>}
                  {Number(r.owed) > 0 && <><br /><small className="tag warn">ค้างชำระ {baht(Number(r.owed))}</small></>}</td>
                <td><small>{(r.tries ?? []).length === 0 ? "ยังไม่เคยติดต่อในระบบ" : (r.tries as any[]).map((t, i) => <span key={i}>{short(t.created_at)} {CHANNELS[t.channel] ?? t.channel}: {RESULTS[t.result] ?? t.result}{t.note ? ` (${t.note})` : ""}<br /></span>)}</small>
                  {r.fails > 0 && <small className="tag warn">พลาดติดกัน {r.fails} ครั้ง</small>}</td>
                <td>{r.status === "booked" ? <form action={followupStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="open" /><button className="btn ghost small">เปิดติดตามอีกครั้ง</button></form> : <>
                  <form action={followupAttempt} className="row" style={{ gap: 6 }}>
                    <input type="hidden" name="id" value={r.id} />
                    <select name="channel" className="inp" defaultValue={suggest[0] ?? "call"} aria-label="ช่องทาง">{Object.entries(CHANNELS).map(([k, l]) => <option key={k} value={k}>{l}{k === suggest[0] ? " (แนะนำ)" : ""}</option>)}</select>
                    <select name="result" className="inp" defaultValue="no_answer" aria-label="ผล">{Object.entries(RESULTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                    <input name="note" className="inp" placeholder="รายละเอียดสั้นๆ" style={{ width: 150 }} />
                    <input name="next_on" type="date" className="inp" min={today} max={addDays(today, 180)} title="นัดตามครั้งถัดไป (เว้นว่าง = ระบบกำหนดให้)" style={{ width: 140 }} />
                    <button className="btn small">บันทึก</button>
                  </form>
                  <div className="row" style={{ gap: 6, marginTop: 6 }}>
                    {r.phone && <a className="btn ghost small" href={`tel:${String(r.phone).replace(/[^0-9+]/g, "")}`}>โทร</a>}
                    {r.phone2 && <a className="btn ghost small" href={`tel:${String(r.phone2).replace(/[^0-9+]/g, "")}`}>โทรเบอร์สำรอง</a>}
                    {r.phone && <a className="btn ghost small" href={`sms:${String(r.phone).replace(/[^0-9+]/g, "")}`}>SMS</a>}
                    <form action={followupStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="closed" /><button className="btn ghost small">ปิด (ไม่ต้องตามแล้ว)</button></form>
                  </div></>}</td>
              </tr>);
          })}
        </tbody>
      </table>

      {bm && <details className="card">
        <summary style={{ cursor: "pointer" }}><b>นำเข้ารายชื่อจาก Excel / Google Sheets</b> <small className="muted">· คัดลอกทั้งตาราง (รวมหัวคอลัมน์) แล้ววาง</small></summary>
        <form action={followupImport} style={{ marginTop: 10 }}>
          <textarea name="rows" rows={8} className="inp" style={{ width: "100%", fontFamily: "monospace", fontSize: 12 }} placeholder={SAMPLE} required />
          <p className="muted" style={{ fontSize: 13 }}>หัวคอลัมน์ที่อ่านได้: {SAMPLE.split("\t").join(" · ")} · วันที่ใช้แบบ 06/06/69 ได้ · บริการคงเหลือหลายรายการคั่นด้วย ; · เหตุผล: {Object.keys(REASONS).join(", ")} · จับคู่ลูกค้าเดิมด้วย HN หรือเบอร์ · นำเข้าซ้ำได้ ไม่เพิ่มยอดซ้ำ</p>
          <button className="btn">นำเข้า</button>
        </form>
      </details>}
    </>
  );
}

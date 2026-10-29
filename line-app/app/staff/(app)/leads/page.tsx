import { q } from "@/lib/db";
import { leadUpdate } from "@/lib/actions";
import { requireStaff } from "@/lib/session";
import { pendingDrafts, leadLangStats, LANG_LABEL, type Lang } from "@/lib/agent";
import { sendDraft, doneDraft, dismissDraft } from "@/lib/agentActions";
import { botInfo, chatUrl } from "@/lib/line";
import { aiConfigured } from "@/lib/ai";
import { CopyOpen } from "./copy-open";

export const dynamic = "force-dynamic";

const STATUSES = ["New", "Contacted", "Qualified", "Consult-Booked", "Nurture", "Lost"];
const TH: Record<string, string> = { New: "ใหม่", Contacted: "ติดต่อแล้ว", Qualified: "สนใจจริง", "Consult-Booked": "นัดปรึกษาแล้ว", Nurture: "ติดตาม", Lost: "ไม่สำเร็จ" };
const LOST = ["ราคา", "ไม่สะดวกเดินทาง", "ไปที่อื่น", "ไม่ตอบกลับ", "แค่สอบถาม", "อื่นๆ"];

function ago(d: Date | string | null, now: Date) {
  if (!d) return "-";
  const m = Math.round((now.getTime() - new Date(d).getTime()) / 60000);
  return m < 60 ? `${m} นาที` : m < 1440 ? `${Math.floor(m / 60)} ชม.` : `${Math.floor(m / 1440)} วัน`;
}

export default async function Leads({ searchParams }: { searchParams: Promise<{ s?: string; agent?: string }> }) {
  await requireStaff(["BM", "AD", "CS", "MK"]);
  const { s, agent } = await searchParams;
  const [drafts, langs, bot] = await Promise.all([pendingDrafts(30), leadLangStats(), botInfo()]);
  const AGENT_ERR: Record<string, string> = { quota: "ส่งจากระบบไม่ได้ เพราะโควตาข้อความ LINE เดือนนี้หมด · ใช้ “คัดลอก + เปิดแชท” แทน (ตอบในแชทไม่นับโควตา)", fail: "ส่งไม่สำเร็จ ลองอีกครั้ง หรือใช้ “คัดลอก + เปิดแชท”", gone: "ร่างนี้ถูกใช้ไปแล้ว" };
  const now = new Date();
  const filter = s === "all" ? "" : s ? "where l.status = $1" : "where l.status in ('New','Contacted','Qualified','Nurture')";
  const rows = await q(
    `select l.*, c.name, c.display_name, c.phone, c.line_user_id,
       (select body from touchpoints t where t.client_id = c.id and t.kind = 'message' order by t.created_at desc limit 1) as last_msg,
       (select granted from consents x where x.client_id = c.id and x.type = 'data' order by x.created_at desc limit 1) as consent_data,
       st.name as owner_name
     from leads l join clients c on c.id = l.client_id left join staff st on st.id = l.owner_staff_id
     ${filter}
     order by (l.replied_at is null or l.replied_at < l.last_inbound_at) desc, l.last_inbound_at desc nulls last limit 200`,
    s && s !== "all" ? [s] : []);
  const waiting = rows.filter((r) => r.last_inbound_at && (!r.replied_at || new Date(r.replied_at) < new Date(r.last_inbound_at)));
  const byStatus = await q(`select status, count(*)::int n from leads where created_at > now() - interval '30 days' group by 1`);
  const bySource = await q(`select coalesce(source,'ไม่ทราบ') src, count(*)::int n, count(*) filter (where status = 'Consult-Booked')::int booked
                            from leads where created_at > now() - interval '30 days' group by 1 order by 2 desc`);

  return (
    <>
      <div><div className="eyebrow">LEAD INBOX · S09</div><h1>Leads / แชท</h1></div>
      <p className="muted" style={{ margin: 0 }}>ตอบลูกค้าในแอป LINE OA Manager ตามปกติ แล้วกด <b>ตอบแล้ว</b> ที่นี่ เพื่อนับเวลาตอบ (เป้า ≤ 5 นาที) แถวสีแดงคือรอเกิน 10 นาที</p>
      <section className="card" id="agent">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="eyebrow">AGENT · ร่างคำตอบให้แล้ว {drafts.length ? `(${drafts.length})` : ""}</div>
          <small className="muted">lead 7 วัน: {langs.map((l) => `${LANG_LABEL[l.lang as Lang] ?? l.lang} ${l.n}`).join(" · ") || "-"} · {aiConfigured() && process.env.ANTHROPIC_API_KEY ? "AI เขียน" : "แบบฟอร์มสำเร็จรูป (ใส่ ANTHROPIC_API_KEY เพื่อให้ AI เขียน)"}</small>
        </div>
        {agent && <div className="card err" style={{ marginTop: 8 }}>{AGENT_ERR[agent] ?? agent}</div>}
        {drafts.length === 0 ? <p className="muted" style={{ margin: "8px 0 0" }}>ยังไม่มีร่าง · ลูกค้าทักมาเมื่อไร ระบบจะร่างคำตอบภาษาเดียวกับลูกค้าให้ที่นี่ และร่างข้อความตามคนที่เงียบไป 1–7 วันให้เองวันละครั้ง</p> :
          drafts.map((d) => (
            <form key={d.id} id={`d${d.id}`} action={sendDraft} className="card" style={{ marginTop: 10, padding: 14 }}>
              <input type="hidden" name="id" value={d.id} />
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div><a href={`/staff/clients/${d.client_id}`}><b>{d.name || d.display_name || `#${d.client_id}`}</b></a>{" "}
                  <span className="tag">{LANG_LABEL[d.lang as Lang] ?? d.lang}</span>{" "}<span className="tag">{d.kind === "nudge" ? "ตามลูกค้า" : "ตอบแชท"}</span></div>
                <small className="muted">{ago(d.created_at, now)}</small>
              </div>
              {d.last_in && <p className="muted" style={{ margin: "6px 0" }}>ลูกค้า: {String(d.last_in).slice(0, 200)}</p>}
              <textarea name="body" rows={11} defaultValue={d.body} style={{ width: "100%" }} />
              <div className="row" style={{ marginTop: 6 }}>
                <CopyOpen formId={`d${d.id}`} url={chatUrl(bot?.userId, d.line_user_id)} />
                <button formAction={doneDraft} className="btn ghost small">ส่งในแชทแล้ว ✓</button>
                <button className="btn ghost small">ส่งจากระบบ (นับโควตา)</button>
                <button formAction={dismissDraft} className="btn ghost small">ไม่ใช้</button>
              </div>
            </form>))}
      </section>
      <div className="row">
        {[["", "กำลังดำเนินการ"], ...STATUSES.map((x) => [x, TH[x]]), ["all", "ทั้งหมด"]].map(([k, l]) =>
          <a key={k} className={`btn small ${(s || "") === k ? "" : "ghost"}`} href={`/staff/leads${k ? `?s=${k}` : ""}`}>{l}</a>)}
      </div>
      <div className="kpis">
        <div className="kpi"><b>{waiting.length}</b><small>รอตอบ</small></div>
        {bySource.slice(0, 3).map((b) => <div className="kpi" key={b.src}><b>{b.n}</b><small>{b.src} · นัดแล้ว {b.booked} (30 วัน)</small></div>)}
      </div>
      <div className="row">{STATUSES.map((x) => <span key={x} className="tag">{TH[x]} {byStatus.find((b) => b.status === x)?.n ?? 0}</span>)}<small className="muted">(lead ใหม่ 30 วัน) · ตั้งสถานะ “ติดตาม” แล้วระบบส่ง D1/D3/D7 ให้เอง หยุดทันทีเมื่อลูกค้าตอบ</small></div>
      <table className="t">
        <thead><tr><th>ลูกค้า</th><th>ข้อความล่าสุด</th><th>รอ</th><th>สถานะ</th><th>เจ้าของ</th><th></th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={6} className="muted">ไม่มีรายการ</td></tr>}
          {rows.map((r) => {
            const isWaiting = waiting.includes(r);
            const late = isWaiting && (now.getTime() - new Date(r.last_inbound_at).getTime()) > 10 * 60000;
            return (
              <tr key={r.id} className={late ? "late" : ""}>
                <td><a href={`/staff/clients/${r.client_id}`}><b>{r.name || r.display_name || "-"}</b></a><br /><small className="muted">{r.phone || ""} · {r.source || "line"} {r.consent_data === true ? "· ยินยอมแล้ว" : r.consent_data === false ? "· ไม่ยินยอม" : "· ยังไม่ถาม"}</small>
                  {r.interest && <><br /><small>{r.interest}</small></>}</td>
                <td style={{ maxWidth: 280 }}><small>{r.last_msg || "-"}</small></td>
                <td>{isWaiting ? <span className={`tag ${late ? "bad" : "warn"}`}>{ago(r.last_inbound_at, now)}</span> : <small className="muted">{ago(r.last_inbound_at, now)}</small>}</td>
                <td>
                  <form action={leadUpdate} className="row"><input type="hidden" name="id" value={r.id} />
                    <select name="status" defaultValue={r.status} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "6px 8px" }}>
                      {STATUSES.map((x) => <option key={x} value={x}>{TH[x]}</option>)}</select>
                    <select name="lost_reason" defaultValue={r.lost_reason || ""} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "6px 8px" }}>
                      <option value="">เหตุผล (ถ้าไม่สำเร็จ)</option>{LOST.map((x) => <option key={x}>{x}</option>)}</select>
                    <button className="btn ghost small">บันทึก</button></form>
                </td>
                <td><small>{r.owner_name || "-"}</small></td>
                <td>{isWaiting && <form action={leadUpdate}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="replied" value="1" /><button className="btn small">ตอบแล้ว</button></form>}</td>
              </tr>);
          })}
        </tbody>
      </table>
    </>
  );
}

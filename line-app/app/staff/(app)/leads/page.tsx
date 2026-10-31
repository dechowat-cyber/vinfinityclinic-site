import { q } from "@/lib/db";
import { leadUpdate } from "@/lib/actions";
import { requireStaff } from "@/lib/session";
import { pendingDrafts, leadLangStats, LANG_LABEL, type Lang } from "@/lib/agent";
import { sendDraft, doneDraft, dismissDraft, promoSent, promoClaimSet } from "@/lib/agentActions";
import { activePromos, promoProspects, promoStats, promoClaims } from "@/lib/promos";
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
  const promo = activePromos().find((p) => p.limit) ?? activePromos()[0] ?? null;
  const [prospects, pstats, claims] = promo ? await Promise.all([promoProspects(promo, 50), promoStats(promo), promo.limit ? promoClaims(promo) : Promise.resolve([])]) : [[], null, []];
  const liveClaims = claims.filter((c) => c.live);
  const oaLink = bot?.basicId ? `https://line.me/R/oaMessage/${bot.basicId}/?${encodeURIComponent("โปรเดือนนี้")}` : null;
  const toSend = prospects.filter((r) => !r.sent_at);
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
      {promo && (
        <section className="card" id="promo">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="eyebrow">โปรที่กำลังวิ่ง · {promo.label}</div>
            <small className="muted">ส่งแล้ว {pstats?.sent ?? 0} (บอทตอบเอง {pstats?.auto ?? 0}) · ตอบกลับ {pstats?.replied ?? 0} · จองแล้ว {pstats?.booked ?? 0}</small>
          </div>
          <p className="muted" style={{ margin: "6px 0" }}>ไม่กินโควตา LINE ทั้งสองทาง: ใครทักถามเรื่องนี้ บอทตอบรูปโปรให้เองครั้งเดียว · รายชื่อด้านล่างให้ทีมส่งเองในแชท OA Manager
            (1) <a href={promo.image} target="_blank" download>บันทึกรูปโปร</a> ไว้ในเครื่องครั้งเดียว (2) กด “คัดลอก + เปิดแชท” แนบรูป วางข้อความ ส่ง (3) กด “ส่งแล้ว ✓”
            · รายชื่อ = คนที่เคยถามเรื่องนี้เอง แล้วตามด้วยลูกค้าเก่าสายฟิลเลอร์/ยกกระชับที่ยินยอมรับข่าวสาร (ไม่รวมคนที่ปฏิเสธ)</p>
          {promo.limit ? (
            <div style={{ marginTop: 10 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <b>สิทธิ์ที่ถูกกดแล้ว {liveClaims.length}/{promo.limit}</b>
                <small className="muted">ลูกค้ากด “กดรับสิทธิ์” หรือพิมพ์ “รับสิทธิ์” → ได้ลำดับทันที ถือสิทธิ์ {promo.holdHours ?? 48} ชม. · จองนัดในเวลานั้น = ยืนยันอัตโนมัติ · ไม่จอง = คืนสิทธิ์เอง</small>
              </div>
              <table className="t" style={{ marginTop: 6 }}>
                <thead><tr><th>#</th><th>ลูกค้า</th><th>สถานะ</th><th></th></tr></thead>
                <tbody>
                  {claims.length === 0 && <tr><td colSpan={4} className="muted">ยังไม่มีคนกดรับสิทธิ์</td></tr>}
                  {claims.map((c) => {
                    const st = c.status === "released" ? "คืนสิทธิ์แล้ว" : c.status === "confirmed" ? "ยืนยันแล้ว" : c.booked ? "จองนัดแล้ว ✓" : c.live ? `รอจองนัด · เหลือ ${Math.max(0, Math.round((new Date(c.expires_at).getTime() - now.getTime()) / 3600000))} ชม.` : "หมดเวลา (สิทธิ์คืนแล้ว)";
                    return (
                      <tr key={c.id} style={c.live ? undefined : { opacity: .55 }}>
                        <td>{c.seat}</td>
                        <td><a href={`/staff/clients/${c.client_id}`}><b>{c.name || c.display_name || `#${c.client_id}`}</b></a>{c.phone ? <><br /><small className="muted">{c.phone}</small></> : null}</td>
                        <td><span className={`tag ${c.booked || c.status === "confirmed" ? "ok" : c.live ? "warn" : ""}`}>{st}</span></td>
                        <td className="row">
                          <a className="btn ghost small" href={chatUrl(bot?.userId, c.line_user_id)} target="_blank">เปิดแชท</a>
                          {c.live && c.status === "held" && <form action={promoClaimSet}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="to" value="confirmed" /><button className="btn ghost small">ยืนยันสิทธิ์</button></form>}
                          {c.live && <form action={promoClaimSet}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="to" value="released" /><button className="btn ghost small">คืนสิทธิ์</button></form>}
                        </td>
                      </tr>);
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
          {oaLink && <p className="muted" style={{ margin: "8px 0 0" }}>ลิงก์ให้ลูกค้ากดแล้วทักเข้ามาเอง (ใส่โพสต์ FB/IG/สตอรี่/เว็บ — บอทตอบโปรให้ฟรี): <code style={{ userSelect: "all" }}>{oaLink}</code></p>}
          <div className="row" style={{ alignItems: "flex-start", gap: 14, marginTop: 10 }}>
            <img src={promo.preview} alt="" style={{ width: 150, borderRadius: 10 }} />
            <form id="promo-msg" style={{ flex: 1, minWidth: 260 }}><textarea rows={11} defaultValue={promo.text} style={{ width: "100%" }} /></form>
          </div>
          <table className="t" style={{ marginTop: 10 }}>
            <thead><tr><th>ลูกค้า ({toSend.length} รอส่ง)</th><th>ทำไมอยู่ในรายชื่อ</th><th>ล่าสุด</th><th></th></tr></thead>
            <tbody>
              {prospects.length === 0 && <tr><td colSpan={4} className="muted">ยังไม่มีรายชื่อที่ตรง</td></tr>}
              {prospects.map((r) => {
                const nm = (r.name || r.display_name || "").trim();
                const hi = nm ? `สวัสดีค่ะ ${/^(คุณ|คุน|K\.|น้อง|พี่)/i.test(nm) ? nm : `คุณ${nm}`} 😊\n` : "สวัสดีค่ะ 😊\n";
                return (
                  <tr key={r.id} style={r.sent_at ? { opacity: .55 } : undefined}>
                    <td><a href={`/staff/clients/${r.id}`}><b>{nm || `#${r.id}`}</b></a>{r.phone ? <><br /><small className="muted">{r.phone}</small></> : null}</td>
                    <td><small>{r.inquired ? <span className="tag warn">เคยถามเอง</span> : null} {r.did ? `เคยทำ: ${r.did}` : ""}
                      {r.asked || r.interest ? <><br /><span className="muted">“{String(r.asked || r.interest).slice(0, 90)}”</span></> : null}</small></td>
                    <td><small className="muted">{ago(r.asked_at || r.last_in || r.did_at, now)}</small></td>
                    <td>{r.sent_at
                      ? <small>{r.sent_how === "promo" ? "บอทตอบแล้ว" : "ส่งแล้ว"} {ago(r.sent_at, now)}{r.booked ? <> · <span className="tag ok">จองแล้ว</span></> : null}</small>
                      : <div className="row">
                          <CopyOpen formId="promo-msg" url={chatUrl(bot?.userId, r.line_user_id)} prefix={hi} />
                          <form action={promoSent}><input type="hidden" name="client" value={r.id} /><input type="hidden" name="key" value={promo.key} /><button className="btn ghost small">ส่งแล้ว ✓</button></form>
                        </div>}</td>
                  </tr>);
              })}
            </tbody>
          </table>
        </section>
      )}
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

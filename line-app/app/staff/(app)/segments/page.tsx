import { q } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { SEGMENT_ROLES, SEND_ROLES, filtersFrom, filtersQuery, segmentMembers, segmentCounts, campaignResults, type Filters } from "@/lib/segments";
import { saveSegment, deleteSegment, sendCampaignAction } from "@/lib/cdpActions";
import { SOURCE_LABEL } from "@/lib/reports";
import { baht } from "@/lib/payments";
import { thaiDate } from "@/lib/time";

export const dynamic = "force-dynamic";

const ERR: Record<string, string> = { confirm: "ติ๊กยืนยันก่อนส่ง", paused: "ระบบหยุดส่งข้อความอัตโนมัติอยู่ (ตั้งค่า)", empty_message: "พิมพ์ข้อความก่อน", no_recipients: "ไม่มีลูกค้าในกลุ่มนี้ที่ส่ง LINE ได้" };
const PRESETS: [string, string][] = [
  ["หายไป 6 เดือน (ยังไม่มีนัด)", "lapsed=180&no_upcoming=1"],
  ["ลูกค้าใหม่ 30 วัน ยังไม่ได้ทำ", "new=30&min_visits=0&no_upcoming=1"],
  ["ลูกค้าประจำ (มา 3 ครั้งขึ้นไป)", "min_visits=3"],
  ["ใช้จ่าย 20,000 บาทขึ้นไป", "min_spend=20000"],
];
const day = (d: string | Date | null) => (d ? thaiDate(new Date(d)).replace(/^วัน\S+ /, "") : "-");

function describe(f: Filters, cat: Map<number, string>) {
  const out: string[] = [];
  if (f.sources?.length) out.push(`ช่องทาง ${f.sources.map((s) => SOURCE_LABEL[s] ?? s).join(", ")}`);
  if (f.treated?.length) out.push(`เคยทำ ${f.treated.map((i) => cat.get(i) ?? i).join(", ")}`);
  if (f.notTreated?.length) out.push(`ไม่เคยทำ ${f.notTreated.map((i) => cat.get(i) ?? i).join(", ")}`);
  if (f.lapsedDays) out.push(`ไม่ได้มา ${f.lapsedDays} วันขึ้นไป`);
  if (f.recentDays) out.push(`มาใน ${f.recentDays} วัน`);
  if (f.minSpend) out.push(`ใช้จ่าย ≥ ${baht(f.minSpend)}`);
  if (f.minVisits) out.push(`มา ≥ ${f.minVisits} ครั้ง`);
  if (f.newDays) out.push(`ลูกค้าใหม่ใน ${f.newDays} วัน`);
  if (f.noUpcoming) out.push("ยังไม่มีนัด");
  if (f.reachableOnly) out.push("ส่ง LINE ได้เท่านั้น");
  return out.join(" · ") || "ลูกค้าทั้งหมด";
}

/** Segment builder → preview → save → LINE campaign (marketing consent only) → results. */
export default async function Segments({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  const me = await requireStaff(SEGMENT_ROLES);
  const sp = await searchParams;
  const all = (k: string) => { const v = sp[k]; return v === undefined ? [] : Array.isArray(v) ? v : [v]; };
  const f = filtersFrom((k) => all(k)[0] ?? null, all);
  const now = new Date();
  const [cat, sources, counts, members, saved, results] = await Promise.all([
    q("select id, name from catalog order by category, name"),
    q("select distinct coalesce(source, 'unknown') s from clients order by 1"),
    segmentCounts(f, now), segmentMembers(f, now, 100), q("select * from segments order by id desc"), campaignResults(),
  ]);
  const catMap = new Map(cat.map((c) => [Number(c.id), c.name as string]));
  const canSend = SEND_ROLES.includes(me.role);
  const err = typeof sp.err === "string" ? sp.err : null;
  const hidden = (prefix = "") => <>{[...new URLSearchParams(filtersQuery(f))].map(([k, v], i) => <input key={prefix + k + i} type="hidden" name={k} value={v} />)}</>;

  return (
    <>
      <div><div className="eyebrow">CDP · SEGMENTS</div><h1>กลุ่มลูกค้าและแคมเปญ</h1></div>
      {err && <div className="card err">{ERR[err] ?? err}</div>}
      {sp.sent && <div className="card" style={{ borderColor: "var(--ok)" }}>เริ่มส่งแคมเปญ #{String(sp.sent)} แล้ว · ส่วนที่เหลือระบบจะทยอยส่งทุก 5 นาที</div>}

      <div className="row">{PRESETS.map(([l, qs]) => <a key={l} className="btn ghost small" href={`?${qs}`}>{l}</a>)}
        {saved.map((s) => <a key={s.id} className="btn ghost small" href={`?${filtersQuery(s.filters as Filters)}`}>★ {s.name}</a>)}</div>

      <form className="card seg-form" method="get">
        <div className="eyebrow">เงื่อนไข</div>
        <fieldset><legend>ช่องทางแรกที่รู้จักคลินิก</legend><div className="row">{sources.map((r) => (
          <label key={r.s} className="chip"><input type="checkbox" name="source" value={r.s} defaultChecked={f.sources?.includes(r.s)} />{SOURCE_LABEL[r.s] ?? r.s}</label>))}</div></fieldset>
        <div className="grid2">
          <label className="field">เคยทำ<select name="treated" multiple defaultValue={(f.treated ?? []).map(String)} size={4}>{cat.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="field">ไม่เคยทำ<select name="not_treated" multiple defaultValue={(f.notTreated ?? []).map(String)} size={4}>{cat.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        </div>
        <div className="row">
          <label className="field">ไม่ได้มาเกิน (วัน)<input name="lapsed" type="number" min={0} defaultValue={f.lapsedDays ?? ""} /></label>
          <label className="field">มาภายใน (วัน)<input name="recent" type="number" min={0} defaultValue={f.recentDays ?? ""} /></label>
          <label className="field">ใช้จ่ายอย่างน้อย (บาท)<input name="min_spend" type="number" min={0} defaultValue={f.minSpend ?? ""} /></label>
          <label className="field">มาอย่างน้อย (ครั้ง)<input name="min_visits" type="number" min={0} defaultValue={f.minVisits ?? ""} /></label>
          <label className="field">ลูกค้าใหม่ภายใน (วัน)<input name="new" type="number" min={0} defaultValue={f.newDays ?? ""} /></label>
        </div>
        <div className="row">
          <label className="check"><input type="checkbox" name="no_upcoming" defaultChecked={f.noUpcoming} /> ยังไม่มีนัด</label>
          <label className="check"><input type="checkbox" name="reachable" defaultChecked={f.reachableOnly} /> เฉพาะคนที่ส่ง LINE ได้</label>
          <button className="btn">ดูผล</button><a className="btn ghost" href="/staff/segments">ล้าง</a>
        </div>
      </form>

      <div className="kpis">
        <div className="kpi"><b>{counts.total}</b><small>ลูกค้าในกลุ่ม</small></div>
        <div className="kpi"><b>{counts.reachable}</b><small>ส่ง LINE ได้ (ยินยอมรับข่าวสาร + ยังเป็นเพื่อน)</small></div>
        <div className="kpi"><b>{baht(counts.spend)}</b><small>ยอดใช้จ่ายรวมของกลุ่ม</small></div>
      </div>
      <p className="muted" style={{ margin: 0 }}>{describe(f, catMap)}</p>

      <div className="grid2">
        <form className="card" action={saveSegment}>
          <div className="eyebrow">บันทึกกลุ่มนี้</div>{hidden("s")}
          <div className="row" style={{ marginTop: 10 }}><input name="name" className="inp" placeholder="ชื่อกลุ่ม เช่น ฟิลเลอร์ครบ 9 เดือน" required style={{ flex: 1 }} /><button className="btn ghost">บันทึก</button></div>
          {saved.length > 0 && <ul className="list">{saved.map((s) => <li key={s.id} className="row" style={{ justifyContent: "space-between" }}>
            <a href={`?${filtersQuery(s.filters as Filters)}`}>{s.name}</a>
            <button formAction={deleteSegment} name="id" value={s.id} className="btn ghost small">ลบ</button></li>)}</ul>}
        </form>
        {canSend ? (
          <form className="card" action={sendCampaignAction}>
            <div className="eyebrow">ส่ง LINE ถึงกลุ่มนี้ · {counts.reachable} คน</div>{hidden("c")}
            <div className="field" style={{ marginTop: 10 }}><label>ชื่อแคมเปญ (ภายใน)</label><input name="campaign_name" placeholder="เช่น ชวนกลับ ต.ค." /></div>
            <div className="field"><label>ข้อความ</label><textarea name="message" rows={4} maxLength={1000} required placeholder="สวัสดีค่ะ …" /></div>
            <label className="check"><input type="checkbox" name="with_booking" defaultChecked /> ใส่ปุ่ม “จองคิว”</label>
            <label className="check"><input type="checkbox" name="confirm" /> ยืนยันส่งถึง {counts.reachable} คน (นับโควตาข้อความ LINE OA · ข้อความโฆษณาต้องผ่าน ฆสพ.)</label>
            <button className="btn" disabled={!counts.reachable}>ส่งแคมเปญ</button>
          </form>
        ) : <div className="card muted">ส่งแคมเปญได้เฉพาะผู้จัดการสาขา</div>}
      </div>

      <table className="t">
        <thead><tr><th>ลูกค้า</th><th>ช่องทาง</th><th>มาล่าสุด</th><th>ครั้ง</th><th>ใช้จ่าย</th><th>LINE</th></tr></thead>
        <tbody>
          {members.length === 0 && <tr><td colSpan={6} className="muted">ไม่มีลูกค้าตามเงื่อนไข</td></tr>}
          {members.map((m) => (
            <tr key={m.id}><td><a href={`/staff/clients/${m.id}`}><b>{m.name || m.display_name || `#${m.id}`}</b></a><br /><small className="muted">{m.phone || ""}</small></td>
              <td><small>{SOURCE_LABEL[m.source] ?? m.source ?? "-"}</small></td><td><small>{day(m.last_visit)}</small></td><td>{m.visits}</td><td>{baht(m.spend)}</td>
              <td>{m.reachable ? <span className="tag ok">ส่งได้</span> : <span className="tag">{m.line_user_id ? "ไม่ยินยอม" : "ไม่มี LINE"}</span>}</td></tr>))}
        </tbody>
      </table>
      {counts.total > members.length && <p className="muted" style={{ margin: 0 }}>แสดง {members.length} จาก {counts.total} คน</p>}

      <section className="card" id="campaigns">
        <div className="eyebrow">แคมเปญที่ส่งแล้ว</div>
        {results.length === 0 ? <p className="muted">ยังไม่มี</p> :
          <table className="t" style={{ marginTop: 10 }}><thead><tr><th>แคมเปญ</th><th>ส่งแล้ว</th><th>จองใน 14 วัน</th><th>รายรับใน 30 วัน</th></tr></thead>
            <tbody>{results.map((r) => (
              <tr key={r.id}><td><b>{r.name}</b><br /><small className="muted">{day(r.created_at)} · {String(r.message).slice(0, 60)}</small></td>
                <td>{r.sent}/{r.recipients}</td><td>{r.booked} <small className="muted">{r.sent ? `${Math.round((r.booked / r.sent) * 100)}%` : ""}</small></td><td>{baht(r.revenue)}</td></tr>))}</tbody></table>}
      </section>
    </>
  );
}

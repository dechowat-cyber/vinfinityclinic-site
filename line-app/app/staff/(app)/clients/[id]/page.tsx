import { notFound } from "next/navigation";
import { q, one } from "@/lib/db";
import { requireStaff, ROLES } from "@/lib/session";
import { canSeeHealth, logHealthAccess, HEALTH_LABELS, HEALTH_FIELDS } from "@/lib/health";
import { saveConsult, savePlan, decideDiscount, sendPlan, markDone, openIssue } from "@/lib/actions2";
import { thaiDate, thaiTime } from "@/lib/time";
import { PROTOCOLS, KINDS, sessionsFor, suggestKind, autoPairs, angleLabel } from "@/lib/photos";
import { BeforeAfter } from "../../before-after";
import { startPhotoSession } from "@/lib/photoActions";
import { PlanBuilder } from "./plan";

export const dynamic = "force-dynamic";

const fmt = (d: string | Date) => `${thaiDate(new Date(d))} ${thaiTime(new Date(d))}`;
const PLAN_TH: Record<string, string> = { draft: "ร่าง", sent: "ส่งการ์ดแล้ว", booked: "จองแล้ว", done: "ทำแล้ว" };

export default async function ClientPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ photo?: string }> }) {
  const me = await requireStaff();
  const id = Number((await params).id);
  const c = await one(`select c.*, r.name as ref_name, r.display_name as ref_display from clients c left join clients r on r.id = c.referred_by where c.id = $1`, [id]);
  if (!c) notFound();
  const health = canSeeHealth(me);
  if (health) await logHealthAccess(me.id, id, "client_page");
  const photoMsg = (await searchParams).photo;
  const [lead, appts, consults, plans, treatments, photos, catalog, consent, touches, sessions, kind, pairs] = await Promise.all([
    one("select * from leads where client_id = $1 order by id desc limit 1", [id]),
    q("select * from appointments where client_id = $1 order by start_at desc limit 10", [id]),
    health ? q("select * from consults where client_id = $1 order by id desc limit 5", [id]) : Promise.resolve([]),
    q("select * from plans where client_id = $1 order by id desc limit 10", [id]),
    q("select * from treatments where client_id = $1 order by done_at desc limit 20", [id]),
    health ? q("select id, angle, session_id, created_at from photos where client_id = $1 order by created_at desc limit 60", [id]) : Promise.resolve([]),
    q("select id, name, unit, price::float as price, category from catalog where active order by category, name"),
    q(`select distinct on (type) type, granted, version, created_at from consents where client_id = $1 order by type, created_at desc`, [id]),
    q("select direction, kind, body, created_at from touchpoints where client_id = $1 order by created_at desc limit 15", [id]),
    health ? sessionsFor(id) : Promise.resolve([]),
    health ? suggestKind(id) : Promise.resolve("before"),
    health ? autoPairs(id) : Promise.resolve([]),
  ]);
  const pair = pairs[0];
  const day = (d: string) => thaiDate(new Date(d)).replace(/^วัน\S+ /, "");
  const consult = consults[0] ?? null;
  const h = (c.health || {}) as Record<string, string>;
  const legacy = photos.filter((p) => !p.session_id && p.angle !== "care").slice(0, 10);
  const care = photos.filter((p) => p.angle === "care").slice(0, 6);
  const dataOk = consent.find((x) => x.type === "data")?.granted === true;

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div><div className="eyebrow">CLIENT · #{id}</div><h1>{c.name || c.display_name || "-"}</h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>{c.phone || "ไม่มีเบอร์"} · {c.line_user_id ? "LINE" : "ไม่มี LINE"} · source {c.source || "-"}
            {c.ref_name || c.ref_display ? ` · แนะนำโดย ${c.ref_name || c.ref_display}` : ""}{c.ref_code ? ` · รหัสแนะนำของลูกค้า ${c.ref_code}` : ""}</p></div>
        <div className="row">{consent.map((x) => <span key={x.type} className={`tag ${x.granted ? "ok" : "bad"}`}>{x.type === "data" ? "ยินยอมข้อมูล" : "รับข่าวสาร"}: {x.granted ? "ใช่" : "ไม่"}</span>)}
          {lead && <span className="tag">{lead.status}</span>}</div>
      </div>

      {!dataOk && <div className="card err">ลูกค้ายังไม่ยินยอมให้เก็บข้อมูลเพื่อการรักษา ห้ามบันทึกข้อมูลสุขภาพหรือถ่ายภาพจนกว่าจะยินยอม (FR-11)</div>}

      {health ? (
        <div className="grid2">
          <section className="card">
            <div className="eyebrow">แบบฟอร์มก่อนมา {c.health_updated_at ? `· ${fmt(c.health_updated_at)}` : "· ยังไม่ได้กรอก"}</div>
            <dl className="kv">{HEALTH_FIELDS.map((k) => <div key={k}><dt>{HEALTH_LABELS[k]}</dt><dd>{h[k] || "-"}</dd></div>)}</dl>
          </section>
          <form className="card" action={saveConsult}>
            <div className="eyebrow">CONSULT FORM · บันทึกการปรึกษา</div>
            <input type="hidden" name="client_id" value={id} />
            <input type="hidden" name="id" value={consult?.id ?? ""} />
            <input type="hidden" name="appointment_id" value={appts.find((a) => ["arrived", "in_consult"].includes(a.status))?.id ?? ""} />
            <div className="field" style={{ marginTop: 12 }}><label>เรื่องที่กังวล</label><textarea name="concerns" rows={2} defaultValue={consult?.concerns ?? h.concerns ?? ""} /></div>
            <div className="field"><label>เป้าหมาย</label><textarea name="goals" rows={2} defaultValue={consult?.goals ?? h.goals ?? ""} /></div>
            <div className="field"><label>การประเมินของแพทย์</label><textarea name="assessment" rows={3} defaultValue={consult?.assessment ?? ""} /></div>
            <div className="field"><label>บันทึกเพิ่มเติม</label><textarea name="notes" rows={2} defaultValue={consult?.notes ?? ""} /></div>
            <button className="btn" disabled={!dataOk}>{consult ? "บันทึกการแก้ไข" : "บันทึกการปรึกษา"}</button>
          </form>
        </div>
      ) : <div className="card muted">ข้อมูลสุขภาพ ภาพ และบันทึกการปรึกษา เปิดดูได้เฉพาะแพทย์ ผู้ช่วยแพทย์ ที่ปรึกษา และผู้จัดการสาขา ({ROLES[me.role]} ดูไม่ได้)</div>}

      {health && dataOk && <section className="card" id="photos">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="eyebrow">PHOTO STUDIO · ภาพมาตรฐาน</div>
          {sessions.length > 1 && <a className="btn ghost small" href={`/staff/clients/${id}/compare`}>เปรียบเทียบก่อน-หลัง</a>}
        </div>
        {pair && <div className="ba-inline">
          <div className="eyebrow" style={{ margin: "12px 0 8px" }}>BEFORE &amp; AFTER ล่าสุด · {KINDS[pair.after.kind]} เทียบกับก่อนทำ {day(pair.before.created_at)}{pairs.length > 1 ? ` · มีอีก ${pairs.length - 1} คู่` : ""}</div>
          <BeforeAfter key={`${pair.before.id}-${pair.after.id}`} beforeLabel={day(pair.before.created_at)} afterLabel={day(pair.after.created_at)}
            angles={pair.angles.map((k) => ({ key: k, label: angleLabel(k), before: pair.before.shots[k], after: pair.after.shots[k] }))} />
        </div>}
        {photoMsg === "consent" && <p className="err">ลูกค้ายังไม่ยินยอมให้เก็บข้อมูล ถ่ายภาพไม่ได้</p>}
        <form action={startPhotoSession} className="row" style={{ margin: "12px 0 4px" }}>
          <input type="hidden" name="client_id" value={id} />
          <select name="kind" className="inp" defaultValue={kind}>{Object.entries(KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <select name="protocol" className="inp" defaultValue="face5">{Object.entries(PROTOCOLS).map(([k, p]) => <option key={k} value={k}>{p.label} · {p.angles.length} ภาพ</option>)}</select>
          <input name="note" className="inp" placeholder="หมายเหตุ เช่น หลังฉีด 1 cc" style={{ flex: 1, minWidth: 160 }} />
          <button className="btn">เปิดกล้อง</button>
        </form>
        {sessions.length === 0 ? <p className="muted" style={{ fontSize: 14 }}>ยังไม่มีชุดภาพ · ถ่ายชุด “ก่อนทำ” ก่อนเริ่มหัตถการทุกครั้ง</p> :
          <ul className="sessions">{sessions.map((s) => (
            <li key={s.id}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span><b>{KINDS[s.kind] ?? s.kind}</b> · {fmt(s.created_at)} · {PROTOCOLS[s.protocol]?.label ?? s.protocol} · {s.taken}/{s.expected}{s.note ? ` · ${s.note}` : ""}</span>
                {s.completed_at ? <span className="tag ok">บันทึกแล้ว</span> : <a className="btn small" href={`/staff/clients/${id}/capture?session=${s.id}`}>ถ่ายต่อ</a>}
              </div>
              <div className="photos">{(PROTOCOLS[s.protocol]?.angles ?? []).map((a) => s.shots[a.key]
                ? <a key={a.key} className="shot" href={`/api/staff/photo/${s.shots[a.key]}`} target="_blank"><img src={`/api/staff/photo/${s.shots[a.key]}`} alt={a.label} loading="lazy" /><small>{a.label}</small></a>
                : <span key={a.key} className="shot"><span className="ph">–</span><small>{a.label}</small></span>)}</div>
            </li>))}</ul>}
        {legacy.length > 0 && <><div className="eyebrow" style={{ marginTop: 14 }}>ภาพก่อนมีระบบชุดภาพ</div>
          <div className="photos" style={{ marginTop: 8 }}>{legacy.map((p) => <a key={p.id} className="shot" href={`/api/staff/photo/${p.id}`} target="_blank"><img src={`/api/staff/photo/${p.id}`} alt={p.angle} loading="lazy" /><small>{p.angle} · {fmt(p.created_at)}</small></a>)}</div></>}
      </section>}
      {health && care.length > 0 && <section className="card"><div className="eyebrow">รูปอาการหลังทำที่ลูกค้าส่งมา</div>
        <div className="photos" style={{ marginTop: 10 }}>{care.map((p) => <a key={p.id} className="shot" href={`/api/staff/photo/${p.id}`} target="_blank"><img src={`/api/staff/photo/${p.id}`} alt="รูปอาการ" /><small>{fmt(p.created_at)}</small></a>)}</div></section>}

      {health && dataOk && <PlanBuilder clientId={id} consultId={consult?.id ?? null} catalog={catalog as any} action={savePlan} isBM={me.role === "BM"} />}

      {plans.length > 0 && <table className="t">
        <thead><tr><th>แผน</th><th>รายการ</th><th>ราคา</th><th>สถานะ</th><th></th></tr></thead>
        <tbody>{plans.map((p) => (
          <tr key={p.id}>
            <td>#{p.id}<br /><small className="muted">{p.goal || ""}</small></td>
            <td><small>{(p.items as any[]).map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(", ")}</small></td>
            <td>{Number(p.total).toLocaleString()} บาท{Number(p.discount) > 0 && <><br /><small className="muted">ส่วนลด {Number(p.discount).toLocaleString()} ({p.discount_status === "pending" ? "รออนุมัติ" : p.discount_status === "approved" ? "อนุมัติแล้ว" : p.discount_status})</small></>}</td>
            <td><span className="tag">{PLAN_TH[p.status] || p.status}</span>{p.card_sent_at && <><br /><small className="muted">ส่ง {fmt(p.card_sent_at)}</small></>}</td>
            <td><div className="row">
              {p.discount_status === "pending" && me.role === "BM" && <>
                <form action={decideDiscount}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="ok" value="1" /><button className="btn small">อนุมัติส่วนลด</button></form>
                <form action={decideDiscount}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="ok" value="0" /><button className="btn danger small">ไม่อนุมัติ</button></form></>}
              {p.discount_status !== "pending" && c.line_user_id && health && <form action={sendPlan}><input type="hidden" name="id" value={p.id} /><button className="btn ghost small">{p.card_sent_at ? "ส่งการ์ดอีกครั้ง" : "ส่งการ์ดสรุปแผนทาง LINE"}</button></form>}
              {["BM", "DR", "NS"].includes(me.role) && p.status !== "done" && (p.items as any[]).map((i) => (
                <form key={i.catalog_id} action={markDone}><input type="hidden" name="client_id" value={id} /><input type="hidden" name="plan_id" value={p.id} /><input type="hidden" name="catalog_id" value={i.catalog_id} />
                  <button className="btn small" title="เริ่มข้อความ aftercare อัตโนมัติ">ทำแล้ว: {i.name}</button></form>))}
            </div></td>
          </tr>))}</tbody>
      </table>}

      <div className="grid2">
        <section className="card"><div className="eyebrow">นัดหมาย</div>
          {appts.length === 0 ? <p className="muted">ยังไม่มีนัด</p> : <ul className="list">{appts.map((a) => <li key={a.id}>{fmt(a.start_at)} · {a.kind === "treatment" ? "ทำหัตถการ" : "ปรึกษา"} · <span className="tag">{a.status}</span></li>)}</ul>}
          <div className="eyebrow" style={{ marginTop: 16 }}>หัตถการที่ทำแล้ว</div>
          {treatments.length === 0 ? <p className="muted">-</p> : <ul className="list">{treatments.map((t) => <li key={t.id}>{fmt(t.done_at)} · {t.name}{t.csat_score ? ` · CSAT ${t.csat_score}/5` : ""}</li>)}</ul>}
        </section>
        <section className="card"><div className="eyebrow">ไทม์ไลน์ล่าสุด</div>
          <ul className="list">{touches.map((t, i) => <li key={i}><small className="muted">{fmt(t.created_at)}</small> {t.direction === "in" ? "←" : "→"} {t.kind}{t.kind === "message" && t.body ? `: ${String(t.body).slice(0, 80)}` : ""}</li>)}</ul>
          <form action={openIssue} className="row" style={{ marginTop: 12 }}>
            <input type="hidden" name="client_id" value={id} />
            <select name="level" className="inp"><option value="L1">L1 บริการ</option><option value="L2">L2 ผลลัพธ์</option><option value="L3">L3 อาการผิดปกติ</option><option value="L4">L4 สาธารณะ</option></select>
            <input name="summary" className="inp" placeholder="เปิดเรื่องร้องเรียน/ปัญหา" style={{ flex: 1 }} />
            <button className="btn ghost small">เปิดเรื่อง</button>
          </form>
        </section>
      </div>
    </>
  );
}

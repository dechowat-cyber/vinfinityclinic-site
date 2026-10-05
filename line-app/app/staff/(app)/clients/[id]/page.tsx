import { notFound } from "next/navigation";
import { q, one } from "@/lib/db";
import { requireStaff, ROLES } from "@/lib/session";
import { canSeeHealth, logHealthAccess, HEALTH_LABELS, HEALTH_FIELDS } from "@/lib/health";
import { saveConsult, savePlan, decideDiscount, sendPlan, markDone, openIssue } from "@/lib/actions2";
import { thaiDate, thaiTime } from "@/lib/time";
import { PROTOCOLS, KINDS, sessionsFor, suggestKind, suggestProtocol, autoPairs, angleLabel } from "@/lib/photos";
import { BeforeAfter } from "../../before-after";
import { QuickShoot } from "../../quick-shoot";
import { startPhotoSession } from "@/lib/photoActions";
import { METHODS, CASHIER_ROLES, VOID_ROLES, paidByPlan, clientRevenue, baht } from "@/lib/payments";
import { takePayment, voidPaymentAction } from "@/lib/crmActions";
import { possibleDuplicates } from "@/lib/identity";
import { mergeAction } from "@/lib/cdpActions";
import { SOURCE_LABEL } from "@/lib/reports";
import { PlanBuilder } from "./plan";
import { Chips } from "@/app/ui/chips";
import { CONCERNS, GOALS, ASSESS } from "@/lib/options";

export const dynamic = "force-dynamic";

const fmt = (d: string | Date) => `${thaiDate(new Date(d))} ${thaiTime(new Date(d))}`;
const APPT_TH: Record<string, string> = { booked: "จองแล้ว", confirmed: "ยืนยันแล้ว", arrived: "มาถึงแล้ว", in_consult: "กำลังปรึกษา", done: "เสร็จ", no_show: "ไม่มา", cancelled: "ยกเลิก" };
const PLAN_TH: Record<string, string> = { draft: "ร่าง", sent: "ส่งการ์ดแล้ว", booked: "จองแล้ว", done: "ทำแล้ว" };

const PAY_ERR: Record<string, string> = { bad_amount: "จำนวนเงินไม่ถูกต้อง", bad_method: "เลือกวิธีชำระ", bad_plan: "แผนไม่ตรงกับลูกค้า", receipt_busy: "ระบบออกเลขใบเสร็จไม่ทัน ลองใหม่อีกครั้ง" };

export default async function ClientPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ photo?: string; pay?: string; merged?: string }> }) {
  const me = await requireStaff();
  const id = Number((await params).id);
  const c = await one(`select c.*, r.name as ref_name, r.display_name as ref_display from clients c left join clients r on r.id = c.referred_by where c.id = $1`, [id]);
  if (!c) notFound();
  const health = canSeeHealth(me);
  if (health) await logHealthAccess(me.id, id, "client_page");
  const sp = await searchParams;
  const photoMsg = sp.photo;
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
  const [paidMap, revenue, payments, dups, visit] = await Promise.all([
    paidByPlan(id), clientRevenue(id),
    q("select p.*, s.name as staff_name from payments p left join staff s on s.id = p.received_by where p.client_id = $1 order by p.created_at desc limit 30", [id]),
    possibleDuplicates(id),
    one("select src, utm_source, utm_medium, utm_campaign, gclid is not null as g, fbclid is not null as f, ttclid is not null as t, landing, created_at from web_visits where client_id = $1 order by created_at limit 1", [id]),
  ]);
  const cashier = CASHIER_ROLES.includes(me.role);
  const due = plans.map((p) => ({ id: Number(p.id), goal: p.goal, balance: Math.max(0, Number(p.total) - (paidMap.get(Number(p.id)) ?? 0)) })).filter((p) => p.balance > 0);
  const pair = pairs[0];
  const protocol = suggestProtocol([appts[0]?.note, lead?.interest].join(" "));
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
          <p className="muted" style={{ margin: "4px 0 0" }}>{c.phone || "ไม่มีเบอร์"} · {c.line_user_id ? "LINE" : "ไม่มี LINE"} · ช่องทาง {SOURCE_LABEL[c.source] ?? c.source ?? "-"}
            {visit ? ` · เว็บ: ${[visit.utm_source, visit.utm_medium, visit.utm_campaign].filter(Boolean).join(" / ") || visit.landing || "-"}${visit.g ? " · Google Ads click" : ""}${visit.f ? " · Meta click" : ""}${visit.t ? " · TikTok click" : ""}` : ""}
            {c.ref_name || c.ref_display ? ` · แนะนำโดย ${c.ref_name || c.ref_display}` : ""}{c.ref_code ? ` · รหัสแนะนำของลูกค้า ${c.ref_code}` : ""}</p></div>
        <div className="row">{health && dataOk && <QuickShoot clientId={id} kind={kind} protocol={protocol}
            openSession={sessions.find((x) => !x.completed_at)?.id ?? null} />}
          {revenue.total > 0 && <a href="#payments" className="tag ok" title={`ชำระ ${revenue.count} ครั้ง`}>ยอดสะสม {baht(revenue.total)}</a>}
          {consent.map((x) => <span key={x.type} className={`tag ${x.granted ? "ok" : "bad"}`}>{x.type === "data" ? "ยินยอมข้อมูล" : "รับข่าวสาร"}: {x.granted ? "ใช่" : "ไม่"}</span>)}
          {lead && <span className="tag">{lead.status}</span>}</div>
      </div>

      {sp.merged && <div className="card" style={{ borderColor: "var(--ok)" }}>รวมรายการ #{sp.merged} เข้ากับลูกค้ารายนี้แล้ว</div>}
      {dups.length > 0 && <div className="card warn-card">
        <b>อาจเป็นลูกค้าคนเดียวกัน (เบอร์โทรตรงกัน):</b> {dups.map((d) => <a key={d.id} href={`/staff/clients/${d.id}`} style={{ marginLeft: 8 }}>#{d.id} {d.name || d.display_name || ""}{d.line_user_id ? " (LINE)" : ""}</a>)}
        {me.role === "BM" && <div className="row" style={{ marginTop: 8 }}>{dups.map((d) => {
          const keepThis = !!c.line_user_id || !d.line_user_id;
          return <form key={d.id} action={mergeAction}><input type="hidden" name="primary" value={keepThis ? id : d.id} /><input type="hidden" name="secondary" value={keepThis ? d.id : id} />
            <button className="btn small">{keepThis ? `รวม #${d.id} เข้ารายการนี้` : `รวมรายการนี้เข้า #${d.id} (มี LINE)`}</button></form>;
        })}</div>}
      </div>}

      <nav className="subnav" aria-label="ส่วนของหน้านี้">
        {health && <a href="#overview">ประวัติ & ปรึกษา</a>}
        {health && dataOk && <a href="#photos">ภาพก่อน-หลัง</a>}
        <a href="#plans">แผนการรักษา</a>
        <a href="#payments">ชำระเงิน</a>
        <a href="#history">นัด & ไทม์ไลน์</a>
      </nav>

      {!dataOk && <div className="card err">ลูกค้ายังไม่ยินยอมให้เก็บข้อมูลเพื่อการรักษา ห้ามบันทึกข้อมูลสุขภาพหรือถ่ายภาพจนกว่าจะยินยอม (FR-11)</div>}

      {health ? (
        <div className="grid2" id="overview">
          <section className="card">
            <div className="eyebrow">แบบฟอร์มก่อนมา {c.health_updated_at ? `· ${fmt(c.health_updated_at)}` : "· ยังไม่ได้กรอก"}</div>
            <dl className="kv">{HEALTH_FIELDS.map((k) => <div key={k}><dt>{HEALTH_LABELS[k]}</dt><dd>{h[k] || "-"}</dd></div>)}</dl>
          </section>
          <form className="card" action={saveConsult}>
            <div className="eyebrow">CONSULT FORM · บันทึกการปรึกษา</div>
            <input type="hidden" name="client_id" value={id} />
            <input type="hidden" name="id" value={consult?.id ?? ""} />
            <input type="hidden" name="appointment_id" value={appts.find((a) => ["arrived", "in_consult"].includes(a.status))?.id ?? ""} />
            <div className="field" style={{ marginTop: 12 }}><label>เรื่องที่กังวล</label><Chips name="concerns" options={CONCERNS} defaultValue={consult?.concerns ?? h.concerns ?? ""} /></div>
            <div className="field"><label>เป้าหมาย</label><Chips name="goals" options={GOALS} defaultValue={consult?.goals ?? h.goals ?? ""} /></div>
            <div className="field"><label>การประเมินของแพทย์</label><Chips name="assessment" options={ASSESS} single otherLabel="รายละเอียดการประเมิน (ถ้ามี)" defaultValue={consult?.assessment ?? ""} /></div>
            <input type="hidden" name="notes" value={consult?.notes ?? ""} />
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
        <details style={{ margin: "12px 0 4px" }}><summary className="muted" style={{ fontSize: 14, cursor: "pointer" }}>เปิดกล้องแบบเลือกชุดภาพเอง (ปกติใช้ปุ่ม “ถ่ายภาพ” ด้านบนได้เลย)</summary>
        <form action={startPhotoSession} className="row" style={{ marginTop: 10 }}>
          <input type="hidden" name="client_id" value={id} />
          <select name="kind" className="inp" defaultValue={kind}>{Object.entries(KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <select name="protocol" className="inp" defaultValue={protocol}>{Object.entries(PROTOCOLS).map(([k, p]) => <option key={k} value={k}>{p.label} · {p.angles.length} ภาพ</option>)}</select>
          <input name="note" className="inp" placeholder="หมายเหตุ เช่น หลังฉีด 1 cc" style={{ flex: 1, minWidth: 160 }} />
          <button className="btn">เปิดกล้อง</button>
        </form></details>
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

      <div id="plans" style={{ display: "grid", gap: 18 }}>
      {health && dataOk && <PlanBuilder clientId={id} consultId={consult?.id ?? null} catalog={catalog as any} action={savePlan} isBM={me.role === "BM"} goal={consult?.goals ?? h.goals ?? ""} />}

      {plans.length > 0 && <table className="t">
        <thead><tr><th>แผน</th><th>รายการ</th><th>ราคา</th><th>ชำระแล้ว</th><th>สถานะ</th><th></th></tr></thead>
        <tbody>{plans.map((p) => (
          <tr key={p.id}>
            <td>#{p.id}<br /><small className="muted">{p.goal || ""}</small></td>
            <td><small>{(p.items as any[]).map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(", ")}</small></td>
            <td>{Number(p.total).toLocaleString()} บาท{Number(p.discount) > 0 && <><br /><small className="muted">ส่วนลด {Number(p.discount).toLocaleString()} ({p.discount_status === "pending" ? "รออนุมัติ" : p.discount_status === "approved" ? "อนุมัติแล้ว" : p.discount_status})</small></>}</td>
            <td>{(() => { const paid = paidMap.get(Number(p.id)) ?? 0, bal = Number(p.total) - paid;
              return <>{baht(paid)}<br />{bal > 0 ? <small className="tag warn">ค้าง {baht(bal)}</small> : Number(p.total) > 0 ? <small className="tag ok">ครบ</small> : null}</>; })()}</td>
            <td><span className="tag">{PLAN_TH[p.status] || p.status}</span>{p.card_sent_at && <><br /><small className="muted">ส่ง {fmt(p.card_sent_at)}</small></>}</td>
            <td><div className="row">
              {p.discount_status === "pending" && me.role === "BM" && <>
                <form action={decideDiscount}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="ok" value="1" /><button className="btn small">อนุมัติส่วนลด</button></form>
                <form action={decideDiscount}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="ok" value="0" /><button className="btn danger small">ไม่อนุมัติ</button></form></>}
              {p.discount_status !== "pending" && c.line_user_id && health && <form action={sendPlan}><input type="hidden" name="id" value={p.id} /><button className="btn ghost small">{p.card_sent_at ? "ส่งการ์ดอีกครั้ง" : "ส่งการ์ดสรุปแผนทาง LINE"}</button></form>}
              {["BM", "DR", "NS"].includes(me.role) && p.status !== "done" && (() => {
                const left = (p.items as any[]).filter((i) => !treatments.some((t) => Number(t.plan_id) === Number(p.id) && Number(t.catalog_id) === Number(i.catalog_id)));
                return left.length > 0 && (
                <form action={markDone} className="row"><input type="hidden" name="client_id" value={id} /><input type="hidden" name="plan_id" value={p.id} />
                  {left.length > 1
                    ? <select name="catalog_id" className="inp" aria-label="หัตถการที่ทำ">{left.map((i) => <option key={i.catalog_id} value={i.catalog_id}>{i.name}</option>)}</select>
                    : <input type="hidden" name="catalog_id" value={left[0].catalog_id} />}
                  <button className="btn small" title="บันทึกหัตถการ และส่งการ์ดดูแลตัวเองของหัตถการนั้นทาง LINE อัตโนมัติ">ทำแล้ว{left.length === 1 ? `: ${left[0].name}` : ""} · ส่งการ์ดดูแล</button>
                </form>);
              })()}
            </div></td>
          </tr>))}</tbody>
      </table>}

      {["BM", "DR", "NS"].includes(me.role) && dataOk && <form action={markDone} className="card row" style={{ alignItems: "center" }}>
        <input type="hidden" name="client_id" value={id} />
        <span className="eyebrow" style={{ margin: 0 }}>ทำหัตถการที่ไม่มีในแผน</span>
        <select name="catalog_id" className="inp" required defaultValue="" style={{ flex: 1, minWidth: 200 }} aria-label="หัตถการที่ทำ">
          <option value="" disabled>เลือกหัตถการที่ทำวันนี้…</option>
          {catalog.filter((x) => x.category !== "ปรึกษา").map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <button className="btn small">ทำแล้ว · ส่งการ์ดดูแล</button>
      </form>}
      </div>

      <section className="card" id="payments">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="eyebrow">การชำระเงิน · ยอดสะสม {baht(revenue.total)}</div>
        </div>
        {sp.pay && <p className="err">บันทึกไม่สำเร็จ: {PAY_ERR[sp.pay] ?? sp.pay}</p>}
        {cashier && <form action={takePayment} className="row" style={{ margin: "12px 0" }}>
          <input type="hidden" name="client_id" value={id} />
          <select name="plan_id" className="inp" defaultValue={due[0]?.id ?? ""}>
            {due.map((p) => <option key={p.id} value={p.id}>แผน #{p.id}{p.goal ? ` ${String(p.goal).slice(0, 24)}` : ""} · ค้าง {baht(p.balance)}</option>)}
            <option value="">ไม่ผูกกับแผน</option>
          </select>
          <input name="amount" className="inp" inputMode="decimal" required placeholder="จำนวนเงิน" defaultValue={due[0]?.balance || ""} style={{ width: 130 }} aria-label="จำนวนเงิน (บาท)" />
          <select name="method" className="inp" defaultValue="transfer">{Object.entries(METHODS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <input name="note" className="inp" placeholder="หมายเหตุ เช่น มัดจำ / งวดที่ 2" style={{ flex: 1, minWidth: 140 }} />
          <button className="btn">รับชำระ + ออกใบเสร็จ</button>
        </form>}
        {payments.length === 0 ? <p className="muted" style={{ fontSize: 14 }}>ยังไม่มีการชำระเงิน</p> :
          <table className="t" style={{ marginTop: 8 }}><thead><tr><th>เลขที่</th><th>วันที่</th><th>จำนวน</th><th>วิธี</th><th>แผน</th><th>ผู้รับ</th><th></th></tr></thead>
            <tbody>{payments.map((p) => (
              <tr key={p.id} style={p.voided_at ? { opacity: 0.55 } : undefined}>
                <td><a href={`/staff/receipts/${p.id}`}>{p.receipt_no}</a></td><td><small>{fmt(p.created_at)}</small></td>
                <td>{p.voided_at ? <s>{baht(Number(p.amount))}</s> : baht(Number(p.amount))}{p.note ? <><br /><small className="muted">{p.note}</small></> : null}</td>
                <td><small>{METHODS[p.method] ?? p.method}</small></td><td><small>{p.plan_id ? `#${p.plan_id}` : "-"}</small></td><td><small>{p.staff_name || "-"}</small></td>
                <td>{p.voided_at ? <span className="tag bad" title={p.void_reason || ""}>ยกเลิกแล้ว</span> : VOID_ROLES.includes(me.role) &&
                  <form action={voidPaymentAction} className="row"><input type="hidden" name="id" value={p.id} />
                    <input name="reason" className="inp" placeholder="เหตุผล" required style={{ width: 110 }} /><button className="btn danger small">ยกเลิก</button></form>}</td>
              </tr>))}</tbody></table>}
      </section>

      <div className="grid2" id="history">
        <section className="card"><div className="eyebrow">นัดหมาย</div>
          {appts.length === 0 ? <p className="muted">ยังไม่มีนัด</p> : <ul className="list">{appts.map((a) => <li key={a.id}>{fmt(a.start_at)} · {a.kind === "treatment" ? "ทำหัตถการ" : "ปรึกษา"} · <span className="tag">{APPT_TH[a.status] ?? a.status}</span></li>)}</ul>}
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

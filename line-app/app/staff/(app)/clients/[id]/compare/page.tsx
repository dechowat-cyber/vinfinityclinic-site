import { notFound } from "next/navigation";
import { one } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { HEALTH_ROLES, logHealthAccess } from "@/lib/health";
import { KINDS, sessionsFor, angleLabel, autoPairs, sharedAngles } from "@/lib/photos";
import { thaiDate } from "@/lib/time";
import { consentState } from "@/lib/crm";
import { BeforeAfter } from "../../../before-after";

export const dynamic = "force-dynamic";

const label = (s: { kind: string; created_at: string }) => `${KINDS[s.kind] ?? s.kind} · ${thaiDate(new Date(s.created_at))}`;
const short = (s: { created_at: string }) => thaiDate(new Date(s.created_at)).replace(/^วัน\S+ /, "");

/**
 * Before & after. With no choice made it opens the automatic pair: the newest after / follow-up
 * session against the before session of the same course. Any two sessions can still be picked.
 */
export default async function Compare({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ a?: string; b?: string; view?: string }> }) {
  const me = await requireStaff(HEALTH_ROLES);
  const clientId = Number((await params).id);
  const sp = await searchParams;
  const c = await one("select name, display_name from clients where id = $1", [clientId]);
  if (!c) notFound();
  const [all, pairs, consent] = await Promise.all([sessionsFor(clientId, 100).then((x) => x.filter((s) => Object.keys(s.shots).length > 0)), autoPairs(clientId), consentState(clientId)]);
  const exportOk = consent.marketing === true;
  const pickedB = all.find((s) => s.id === Number(sp.b));
  const auto = (pickedB && pairs.find((p) => p.after.id === pickedB.id)) || (!sp.b && pairs[0]) || null;
  const A = all.find((s) => s.id === Number(sp.a)) ?? auto?.before ?? [...all].reverse().find((s) => s.kind === "before") ?? all.at(-1);
  const B = pickedB ?? auto?.after ?? all.find((s) => s.id !== A?.id);
  await logHealthAccess(me.id, clientId, `photo_compare:${A?.id ?? "-"}:${B?.id ?? "-"}`);
  const view = sp.view === "side" ? "side" : "swipe";
  const angles = A && B ? sharedAngles(A, B) : [];

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div><div className="eyebrow">BEFORE &amp; AFTER · เปรียบเทียบผล</div><h1>{c.name || c.display_name || "-"}</h1></div>
        <a className="btn ghost small" href={`/staff/clients/${clientId}#photos`}>← กลับหน้าลูกค้า</a>
      </div>
      {all.length < 2 ? <div className="card muted">ต้องมีอย่างน้อย 2 ชุดภาพจึงจะเปรียบเทียบได้</div> : <>
        {pairs.length > 0 && <div className="row">{pairs.map((p) => (
          <a key={p.after.id} href={`?b=${p.after.id}`} className={`tag ${p.after.id === B?.id && p.before.id === A?.id ? "ok" : ""}`}>
            {short(p.before)} → {KINDS[p.after.kind]} {short(p.after)}</a>))}</div>}
        {angles.length === 0 ? <div className="card muted">สองชุดนี้ไม่มีมุมที่ตรงกัน</div> : view === "swipe"
          ? <section className="card"><BeforeAfter key={`${A!.id}-${B!.id}`} beforeLabel={short(A!)} afterLabel={short(B!)}
              angles={angles.map((k) => ({ key: k, label: angleLabel(k), before: A!.shots[k], after: B!.shots[k] }))} tools={{ exportOk }} /></section>
          : <div className="compare">{angles.map((k) => (
            <section key={k} className="card"><div className="eyebrow" style={{ marginBottom: 10 }}>{angleLabel(k)}</div>
              <div className="side-by">{[A!, B!].map((s) => <figure key={s.id}><img src={`/api/staff/photo/${s.shots[k]}`} alt={`${angleLabel(k)} ${label(s)}`} /><figcaption>{label(s)}</figcaption></figure>)}</div>
            </section>))}</div>}
        <details className="card">
          <summary>เลือกชุดภาพเอง</summary>
          <form className="row" method="get" style={{ marginTop: 12 }}>
            <label className="field" style={{ flex: 1 }}>ก่อน<select name="a" defaultValue={A?.id}>{all.map((s) => <option key={s.id} value={s.id}>{label(s)} · {s.taken}/{s.expected}</option>)}</select></label>
            <label className="field" style={{ flex: 1 }}>หลัง<select name="b" defaultValue={B?.id}>{all.map((s) => <option key={s.id} value={s.id}>{label(s)} · {s.taken}/{s.expected}</option>)}</select></label>
            <label className="field">มุมมอง<select name="view" defaultValue={view}><option value="swipe">เลื่อนปัด</option><option value="side">คู่กัน</option></select></label>
            <button className="btn">แสดง</button>
          </form>
        </details>
        {exportOk
          ? <p className="muted" style={{ fontSize: 13 }}>ลูกค้ายินยอมให้ใช้ภาพเพื่อการตลาดแล้ว — ก่อนโพสต์ต้องผ่านการขออนุญาตโฆษณา (ฆสพ.) และไม่ใช้ภาพที่ลูกค้าขอไม่ให้เห็นหน้า</p>
          : <div className="card" style={{ borderColor: "#F0C9C6", color: "var(--bad)", fontSize: 14 }}>ลูกค้ายังไม่ได้ยินยอมให้ใช้ภาพเพื่อการตลาด — ใช้ดูเพื่อการรักษาและอธิบายผลกับลูกค้าเท่านั้น ห้ามบันทึกหรือโพสต์</div>}
      </>}
    </>
  );
}

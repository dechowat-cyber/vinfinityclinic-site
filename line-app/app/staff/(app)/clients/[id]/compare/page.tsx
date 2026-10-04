import { notFound } from "next/navigation";
import { one } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { HEALTH_ROLES, logHealthAccess } from "@/lib/health";
import { PROTOCOLS, KINDS, sessionsFor, angleLabel } from "@/lib/photos";
import { thaiDate } from "@/lib/time";
import { Wipe } from "./wipe";

export const dynamic = "force-dynamic";

const label = (s: { kind: string; created_at: string }) => `${KINDS[s.kind] ?? s.kind} · ${thaiDate(new Date(s.created_at))}`;

/** Before / after / follow-up side by side or as a wipe, angle by angle. */
export default async function Compare({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ a?: string; b?: string; view?: string }> }) {
  const me = await requireStaff(HEALTH_ROLES);
  const clientId = Number((await params).id);
  const sp = await searchParams;
  const c = await one("select name, display_name from clients where id = $1", [clientId]);
  if (!c) notFound();
  const all = (await sessionsFor(clientId, 100)).filter((s) => s.taken > 0 || Object.keys(s.shots).length > 0);
  // default: earliest "before" vs the newest session
  const A = all.find((s) => s.id === Number(sp.a)) ?? [...all].reverse().find((s) => s.kind === "before") ?? all.at(-1);
  const B = all.find((s) => s.id === Number(sp.b)) ?? all.find((s) => s.id !== A?.id);
  await logHealthAccess(me.id, clientId, `photo_compare:${A?.id ?? "-"}:${B?.id ?? "-"}`);
  const view = sp.view === "side" ? "side" : "wipe";
  const order = [...new Set([...((A ? PROTOCOLS[A.protocol]?.angles : undefined) ?? []), ...((B ? PROTOCOLS[B.protocol]?.angles : undefined) ?? [])].map((x) => x.key))];
  const angles = order.filter((k) => A?.shots[k] && B?.shots[k]);

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div><div className="eyebrow">COMPARE · เปรียบเทียบผล</div><h1>{c.name || c.display_name || "-"}</h1></div>
        <a className="btn ghost small" href={`/staff/clients/${clientId}#photos`}>← กลับหน้าลูกค้า</a>
      </div>
      {all.length < 2 ? <div className="card muted">ต้องมีอย่างน้อย 2 ชุดภาพจึงจะเปรียบเทียบได้</div> : <>
        <form className="card row" method="get">
          <label className="field" style={{ flex: 1 }}>ภาพซ้าย (ก่อน)<select name="a" defaultValue={A?.id}>{all.map((s) => <option key={s.id} value={s.id}>{label(s)} · {s.taken}/{s.expected}</option>)}</select></label>
          <label className="field" style={{ flex: 1 }}>ภาพขวา (หลัง)<select name="b" defaultValue={B?.id}>{all.map((s) => <option key={s.id} value={s.id}>{label(s)} · {s.taken}/{s.expected}</option>)}</select></label>
          <label className="field">มุมมอง<select name="view" defaultValue={view}><option value="wipe">เลื่อนทับ</option><option value="side">คู่กัน</option></select></label>
          <button className="btn">แสดง</button>
        </form>
        {angles.length === 0 ? <div className="card muted">สองชุดนี้ไม่มีมุมที่ตรงกัน</div> :
          <div className="compare">{angles.map((k) => (
            <section key={k} className="card"><div className="eyebrow" style={{ marginBottom: 10 }}>{angleLabel(k)}</div>
              {view === "wipe" ? <Wipe a={A!.shots[k]} b={B!.shots[k]} la={label(A!)} lb={label(B!)} />
                : <div className="side-by">{[A!, B!].map((s) => <figure key={s.id}><img src={`/api/staff/photo/${s.shots[k]}`} alt={`${angleLabel(k)} ${label(s)}`} /><figcaption>{label(s)}</figcaption></figure>)}</div>}
            </section>))}</div>}
        <p className="muted" style={{ fontSize: 13 }}>ใช้ภายในเพื่อการรักษาเท่านั้น การเผยแพร่ภาพก่อน-หลังต้องมีหนังสือยินยอมจากลูกค้าและผ่าน ฆสพ. ก่อน</p>
      </>}
    </>
  );
}

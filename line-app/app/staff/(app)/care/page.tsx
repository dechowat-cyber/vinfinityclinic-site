import { q } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { ackCare, issueUpdate } from "@/lib/actions2";

export const dynamic = "force-dynamic";

const ST: Record<string, string> = { waiting_photo: "รอรูปจากลูกค้า", waiting_review: "รูปมาแล้ว รอดู", in_review: "กำลังดูแล", closed: "ปิดแล้ว" };
const mins = (d: string | Date) => Math.round((Date.now() - new Date(d).getTime()) / 60000);

export default async function Care() {
  const me = await requireStaff();
  const [reqs, issues] = await Promise.all([
    q(`select r.*, c.name, c.display_name, c.phone, s.name as ack_name from care_requests r join clients c on c.id = r.client_id
       left join staff s on s.id = r.ack_by where r.status <> 'closed' or r.created_at > now() - interval '3 days' order by r.id desc limit 50`),
    q(`select i.*, c.name, c.display_name from issues i left join clients c on c.id = i.client_id where i.status <> 'closed' or i.created_at > now() - interval '7 days' order by i.id desc limit 50`),
  ]);
  const clinical = ["BM", "DR", "NS"].includes(me.role);
  return (
    <>
      <div><div className="eyebrow">AFTERCARE · ISSUES</div><h1>ดูแลหลังทำ และเรื่องที่ต้องแก้</h1></div>
      <p className="muted" style={{ margin: 0 }}>เป้า: ตอบเคสอาการหลังทำภายใน 1 ชม. · ไม่มีคนรับ 15 นาที ระบบแจ้ง BM · อาการอันตรายให้โทรหาลูกค้าทันที</p>
      <table className="t">
        <thead><tr><th>ลูกค้า</th><th>สถานะ</th><th>รอ</th><th>ผู้รับเรื่อง</th><th></th></tr></thead>
        <tbody>{reqs.length === 0 && <tr><td colSpan={5} className="muted">ไม่มีเคส</td></tr>}
          {reqs.map((r) => (
            <tr key={r.id} className={!r.ack_at && mins(r.created_at) > 15 && r.status !== "closed" ? "late" : ""}>
              <td><a href={`/staff/clients/${r.client_id}`}><b>{r.name || r.display_name}</b></a><br /><small className="muted">{r.phone || ""}</small></td>
              <td><span className={`tag ${r.status === "waiting_review" ? "warn" : r.status === "closed" ? "ok" : ""}`}>{ST[r.status] || r.status}</span></td>
              <td><small>{mins(r.created_at)} นาที</small></td>
              <td><small>{r.ack_name || "-"}</small></td>
              <td>{clinical && r.status !== "closed" && <div className="row">
                {!r.ack_at && <form action={ackCare}><input type="hidden" name="id" value={r.id} /><button className="btn small">รับเรื่อง</button></form>}
                <form action={ackCare}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="close" value="1" /><button className="btn ghost small">ปิดเคส</button></form></div>}</td>
            </tr>))}
        </tbody>
      </table>
      <div className="eyebrow">ISSUES · TP11</div>
      <table className="t">
        <thead><tr><th>ระดับ</th><th>เรื่อง</th><th>ลูกค้า</th><th>เจ้าของ</th><th>สถานะ</th></tr></thead>
        <tbody>{issues.length === 0 && <tr><td colSpan={5} className="muted">ไม่มีเรื่องค้าง</td></tr>}
          {issues.map((i) => (
            <tr key={i.id}><td><span className={`tag ${i.level >= "L3" ? "bad" : "warn"}`}>{i.level}</span></td><td><small>{i.summary}</small><br /><small className="muted">{i.source} · {new Date(i.created_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</small></td>
              <td>{i.client_id ? <a href={`/staff/clients/${i.client_id}`}>{i.name || i.display_name}</a> : "-"}</td><td><small>{i.owner_role}</small></td>
              <td>{["BM", "DR"].includes(me.role) ? <form action={issueUpdate} className="row"><input type="hidden" name="id" value={i.id} />
                <select name="status" defaultValue={i.status} className="inp"><option value="open">เปิด</option><option value="in_progress">กำลังแก้</option><option value="closed">ปิด</option></select>
                <button className="btn ghost small">บันทึก</button></form> : <small>{i.status}</small>}</td></tr>))}
        </tbody>
      </table>
    </>
  );
}

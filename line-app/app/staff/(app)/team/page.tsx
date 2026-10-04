import { q } from "@/lib/db";
import { staffUpdate } from "@/lib/actions";
import { requireStaff, ROLES } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Team() {
  await requireStaff(["BM"]);
  const rows = await q("select * from staff order by active desc, created_at");
  return (
    <>
      <div><div className="eyebrow">TEAM</div><h1>ทีมงาน</h1></div>
      <p className="muted" style={{ margin: 0 }}>ทุกคนเข้าสู่ระบบด้วยบัญชี LINE ของตัวเอง คนใหม่จะอยู่สถานะ “รออนุมัติ” จนกว่าคุณจะเปิดสิทธิ์และเลือกบทบาท</p>
      <table className="t">
        <thead><tr><th>ชื่อ</th><th>บทบาท</th><th>ใช้งานได้</th><th></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><b>{r.name || "-"}</b>{!r.active && <> <span className="tag warn">รออนุมัติ</span></>}</td>
              <td colSpan={3}>
                <form action={staffUpdate} className="row">
                  <input type="hidden" name="id" value={r.id} />
                  <select name="role" defaultValue={r.role} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "6px 8px" }}>
                    {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                  <label className="check"><input type="checkbox" name="active" defaultChecked={r.active} /> เปิดใช้งาน</label>
                  <button className="btn ghost small">บันทึก</button>
                </form>
              </td>
            </tr>))}
        </tbody>
      </table>
    </>
  );
}

export const dynamic = "force-dynamic";

const ERR: Record<string, string> = {
  pending: "ลงทะเบียนแล้ว รอผู้จัดการสาขากดอนุมัติ (ระบบแจ้งในกลุ่ม LINE พนักงานให้แล้ว) อนุมัติแล้วกดเข้าสู่ระบบอีกครั้ง",
  cancel: "ยกเลิกการเข้าสู่ระบบ กดปุ่มด้านล่างเพื่อลองใหม่",
  state: "หมดเวลาเข้าสู่ระบบ ลองใหม่อีกครั้ง",
  login: "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ ลองใหม่อีกครั้ง",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string; n?: string }> }) {
  const { e, n } = await searchParams;
  return (
    <main className="login">
      <div className="card" style={{ maxWidth: 380, width: "100%", textAlign: "center", padding: 32 }}>
        <div className="login-mark"><img src="/brand/mark.svg" alt="" width={34} height={35} /></div>
        <div className="eyebrow">VINFINITY CLINIC · STAFF</div>
        <h1 style={{ fontWeight: 500, fontSize: 24, margin: "10px 0 6px" }}>ระบบหน้าร้าน</h1>
        <p className="muted" style={{ marginTop: 0 }}>เข้าสู่ระบบด้วยบัญชี LINE ของคุณ (1 คน 1 บัญชี)</p>
        {e && <p className={e === "pending" ? "muted" : "err"}>{e === "pending" && n ? <><b>{n}</b><br /></> : null}{ERR[e] || "เข้าสู่ระบบไม่สำเร็จ"}</p>}
        <a className="btn" style={{ width: "100%", background: "#06C755", marginTop: 8 }} href="/api/auth/login">เข้าสู่ระบบด้วย LINE</a>
      </div>
    </main>
  );
}

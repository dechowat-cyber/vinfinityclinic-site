export const dynamic = "force-dynamic";

const ERR: Record<string, string> = {
  pending: "ลงชื่อเข้าใช้แล้ว รอผู้จัดการสาขาอนุมัติสิทธิ์ในหน้า ทีม ก่อนนะคะ",
  state: "หมดเวลาเข้าสู่ระบบ ลองใหม่อีกครั้ง",
  login: "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ ลองใหม่อีกครั้ง",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <main className="login">
      <div className="card" style={{ maxWidth: 380, width: "100%", textAlign: "center", padding: 32 }}>
        <div className="login-mark"><img src="/brand/mark.svg" alt="" width={34} height={35} /></div>
        <div className="eyebrow">VINFINITY CLINIC · STAFF</div>
        <h1 style={{ fontWeight: 500, fontSize: 24, margin: "10px 0 6px" }}>ระบบหน้าร้าน</h1>
        <p className="muted" style={{ marginTop: 0 }}>เข้าสู่ระบบด้วยบัญชี LINE ของคุณ (1 คน 1 บัญชี)</p>
        {e && <p className="err">{ERR[e] || "เข้าสู่ระบบไม่สำเร็จ"}</p>}
        <a className="btn" style={{ width: "100%", background: "#06C755", marginTop: 8 }} href="/api/auth/login">เข้าสู่ระบบด้วย LINE</a>
      </div>
    </main>
  );
}

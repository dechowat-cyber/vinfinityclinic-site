"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const ANGLES: [string, string][] = [["front", "หน้าตรง"], ["left45", "เอียงซ้าย 45°"], ["right45", "เอียงขวา 45°"], ["left90", "ด้านซ้าย 90°"], ["right90", "ด้านขวา 90°"]];

async function shrink(file: File): Promise<Blob> {
  const img = await createImageBitmap(file);
  const r = Math.min(1, 1600 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob((b) => res(b!), "image/jpeg", 0.85));
}

/** FR-21: five standard angles, uploaded straight from the clinic iPad camera. */
export function PhotoCapture({ clientId, consultId, latest }: { clientId: number; consultId: number | null; latest: Record<string, { id: number; at: string }> }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  async function up(angle: string, f: File | undefined) {
    if (!f) return;
    setBusy(angle); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", await shrink(f), `${angle}.jpg`); fd.append("client_id", String(clientId)); fd.append("angle", angle);
      if (consultId) fd.append("consult_id", String(consultId));
      const r = await fetch("/api/staff/photo", { method: "POST", body: fd });
      if (!r.ok) setErr("อัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง");
      router.refresh();
    } finally { setBusy(null); }
  }
  return (
    <div>
      <div className="photos">
        {ANGLES.map(([k, label]) => (
          <label key={k} className="shot">
            {latest[k] ? <img src={`/api/staff/photo/${latest[k].id}`} alt={label} /> : <span className="ph">+</span>}
            <small>{busy === k ? "กำลังอัปโหลด…" : label}{latest[k] ? ` · ${latest[k].at}` : ""}</small>
            <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => up(k, e.target.files?.[0])} />
          </label>))}
      </div>
      {err && <p className="err">{err}</p>}
      <p className="muted" style={{ fontSize: 13, margin: "8px 0 0" }}>ถ่ายด้วย iPad ของคลินิกเท่านั้น ภาพเก็บในระบบ ไม่บันทึกลงอัลบั้มเครื่อง · ฉากหลังเรียบ แสงเดียวกันทุกครั้ง</p>
    </div>
  );
}

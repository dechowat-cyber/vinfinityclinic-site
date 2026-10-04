"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { prepare, compose, type Prepared } from "@/lib/align";

export type BAAngle = { key: string; label: string; before: number; after: number };

const src = (id: number) => `/api/staff/photo/${id}`;
// sweep path when a pair opens: centre → mostly before → mostly after → centre
const KEYS: [number, number][] = [[0, 50], [0.28, 12], [0.7, 88], [1, 50]];
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

function sweepAt(t: number) {
  for (let i = 1; i < KEYS.length; i++) {
    const [t0, v0] = KEYS[i - 1], [t1, v1] = KEYS[i];
    if (t <= t1) return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0));
  }
  return 50;
}

/**
 * Before & after slider: drag (or swipe) left-right anywhere on the photo. It sweeps once by itself
 * whenever a pair or an angle opens, and stops as soon as someone touches it.
 */
/** tools: shown on the compare page only. exportOk = the client has given marketing consent. */
export type BATools = { exportOk: boolean };

export function BeforeAfter({ angles, beforeLabel, afterLabel, auto = true, tools }: { angles: BAAngle[]; beforeLabel: string; afterLabel: string; auto?: boolean; tools?: BATools }) {
  const box = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const drag = useRef(false);
  const [x, setX] = useState(50);
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const a = angles[Math.min(i, angles.length - 1)];
  const [align, setAlign] = useState(true);
  const [blur, setBlur] = useState(false);
  const [prep, setPrep] = useState<Prepared | null>(null);
  const [busy, setBusy] = useState(false);

  // eye-based alignment (and optional eye blur), computed on this device
  useEffect(() => {
    setPrep(null);
    if (!a || (!align && !blur)) return;
    let off = false;
    prepare(a.before, a.after, { align, blur }).then((p) => { if (!off) setPrep(p); else { URL.revokeObjectURL(p.before); URL.revokeObjectURL(p.after); } }).catch(() => {});
    return () => { off = true; };
  }, [a?.before, a?.after, align, blur]);
  useEffect(() => () => { if (prep) { URL.revokeObjectURL(prep.before); URL.revokeObjectURL(prep.after); } }, [prep]);

  async function exportPng(layout: "side" | "stack") {
    if (!a) return;
    setBusy(true);
    try {
      const p = prep ?? await prepare(a.before, a.after, { align: false, blur: false });
      const blob = await compose(p, { before: beforeLabel, after: afterLabel, layout });
      const file = new File([blob], `before-after-${a.key}.png`, { type: "image/png" });
      const nav: any = navigator;
      if (nav.canShare?.({ files: [file] })) { await nav.share({ files: [file] }).catch(() => {}); }
      else { const u = URL.createObjectURL(blob); const l = document.createElement("a"); l.href = u; l.download = file.name; l.click(); setTimeout(() => URL.revokeObjectURL(u), 3000); }
    } finally { setBusy(false); }
  }

  const stop = () => cancelAnimationFrame(raf.current);
  const sweep = useCallback(() => {
    stop();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setX(50);
    const t0 = performance.now(), dur = 2600;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      setX(sweepAt(t));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  // wait for both photos before sweeping, otherwise the motion plays over a blank frame
  useEffect(() => {
    if (!auto || !a) return;
    let n = 0, off = false;
    const go = () => { if (++n === 2 && !off) sweep(); };
    for (const id of [a.before, a.after]) { const im = new Image(); im.onload = go; im.onerror = go; im.src = src(id); }
    return () => { off = true; stop(); };
  }, [a?.key, a?.before, a?.after, auto, sweep]);

  useEffect(() => {
    if (!full) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setFull(false); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [full]);

  function at(clientX: number) {
    const r = box.current!.getBoundingClientRect();
    setX(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  }
  function go(n: number) { stop(); setI((n + angles.length) % angles.length); }

  if (!a) return null;
  return (
    <div className={`ba ${full ? "full" : ""}`}>
      <div ref={box} className="ba-frame" role="slider" tabIndex={0} aria-label={`เลื่อนเปรียบเทียบ ${a.label}`}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(x)}
        onPointerDown={(e) => { stop(); drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); at(e.clientX); }}
        onPointerMove={(e) => { if (drag.current) at(e.clientX); }}
        onPointerUp={() => { drag.current = false; }} onPointerCancel={() => { drag.current = false; }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); stop(); setX((v) => Math.max(0, Math.min(100, v + (e.key === "ArrowLeft" ? -5 : 5)))); }
        }}>
        <img src={prep?.after ?? src(a.after)} alt={`${a.label} หลัง`} draggable={false} />
        <img src={prep?.before ?? src(a.before)} alt={`${a.label} ก่อน`} draggable={false} style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }} />
        <div className="ba-bar" style={{ left: `${x}%` }}><span>‹ ›</span></div>
        <span className="ba-lab l" style={{ opacity: x > 12 ? 1 : 0 }}>ก่อน · {beforeLabel}</span>
        <span className="ba-lab r" style={{ opacity: x < 88 ? 1 : 0 }}>หลัง · {afterLabel}</span>
      </div>
      <div className="ba-ctrl">
        {angles.length > 1 && <button type="button" className="btn ghost small" onClick={() => go(i - 1)} aria-label="มุมก่อนหน้า">‹</button>}
        <div className="ba-tabs">{angles.map((x, j) => (
          <button key={x.key} type="button" aria-pressed={j === i} onClick={() => go(j)}>{x.label}</button>))}</div>
        {angles.length > 1 && <button type="button" className="btn ghost small" onClick={() => go(i + 1)} aria-label="มุมถัดไป">›</button>}
        <button type="button" className="btn ghost small" onClick={sweep}>เล่นอีกครั้ง</button>
        <button type="button" className="btn ghost small" onClick={() => setFull(!full)}>{full ? "ปิดเต็มจอ" : "เต็มจอ"}</button>
      </div>
      {tools && !full && <div className="ba-tools">
        <label><input type="checkbox" checked={align} onChange={(e) => setAlign(e.target.checked)} /> จัดแนวตามดวงตา</label>
        <label><input type="checkbox" checked={blur} onChange={(e) => setBlur(e.target.checked)} /> ปิดดวงตา</label>
        {tools.exportOk
          ? <><button type="button" className="btn small" disabled={busy} onClick={() => exportPng("side")}>{busy ? "กำลังสร้างภาพ…" : "ส่งออกภาพ ซ้าย–ขวา"}</button>
              <button type="button" className="btn ghost small" disabled={busy} onClick={() => exportPng("stack")}>บน–ล่าง</button></>
          : <span className="ba-lock">ลูกค้ายังไม่ยินยอมให้ใช้ภาพเพื่อการตลาด — ส่งออกไม่ได้</span>}
      </div>}
      {(align || blur) && <div className="ba-note">{prep ? prep.note || (blur ? "ปิดดวงตาแล้ว" : "") : "กำลังหาตำแหน่งดวงตา…"}</div>}
    </div>
  );
}

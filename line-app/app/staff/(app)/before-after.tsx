"use client";
import { useCallback, useEffect, useRef, useState } from "react";

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
export function BeforeAfter({ angles, beforeLabel, afterLabel, auto = true }: { angles: BAAngle[]; beforeLabel: string; afterLabel: string; auto?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const drag = useRef(false);
  const [x, setX] = useState(50);
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const a = angles[Math.min(i, angles.length - 1)];

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
        <img src={src(a.after)} alt={`${a.label} หลัง`} draggable={false} />
        <img src={src(a.before)} alt={`${a.label} ก่อน`} draggable={false} style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }} />
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
    </div>
  );
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Angle, Guide } from "@/lib/photos";
import type { Pose } from "@/lib/face";
import { genericTarget, targetFromRef, judge, type Target, type Verdict } from "@/lib/assist";

type Ref = { id: number; at: string; kind: string | null };
type Props = {
  sessionId: number; clientId: number; title: string; angles: Angle[];
  shots: Record<string, number>; refs: Record<string, Ref>;
  complete: (fd: FormData) => Promise<void>; discard: (fd: FormData) => Promise<void>;
};

const RATIO = 3 / 4; // every photo is stored as a 3:4 portrait so the ghost of one visit lines up 1:1 with the next
const MAX_H = 2000;
const img = (id: number) => `/api/staff/photo/${id}`;
const d = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

/** Center-crops any frame (live video or a picked file) to 3:4 and returns a JPEG. */
function crop(src: CanvasImageSource, w: number, h: number) {
  let cw = w, ch = h;
  if (w / h > RATIO) cw = h * RATIO; else ch = w / RATIO;
  const s = Math.min(1, MAX_H / ch);
  const c = document.createElement("canvas");
  c.width = Math.round(cw * s); c.height = Math.round(ch * s);
  c.getContext("2d")!.drawImage(src, (w - cw) / 2, (h - ch) / 2, cw, ch, 0, 0, c.width, c.height);
  return new Promise<{ blob: Blob; w: number; h: number }>((res) => c.toBlob((b) => res({ blob: b!, w: c.width, h: c.height }), "image/jpeg", 0.9));
}

function Guides({ g }: { g: Guide }) {
  const line = { stroke: "rgba(255,255,255,.75)", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };
  const dash = { ...line, strokeDasharray: "6 6" };
  return (
    <svg className="guides" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden>
      {g === "close" ? <>
        <line x1="100" y1="0" x2="100" y2="400" {...dash} /><line x1="200" y1="0" x2="200" y2="400" {...dash} />
        <line x1="0" y1="133" x2="300" y2="133" {...dash} /><line x1="0" y1="267" x2="300" y2="267" {...dash} />
        <line x1="150" y1="0" x2="150" y2="400" {...line} />
      </> : <>
        <line x1="0" y1="165" x2="300" y2="165" {...line} />{/* eye line */}
        <line x1="0" y1="330" x2="300" y2="330" {...dash} />{/* chin */}
        <line x1="0" y1="45" x2="300" y2="45" {...dash} />{/* top of head */}
        {g === "front" && <><line x1="150" y1="0" x2="150" y2="400" {...line} /><ellipse cx="150" cy="190" rx="82" ry="122" fill="none" {...dash} /></>}
        {g === "oblique" && <line x1="150" y1="0" x2="150" y2="400" {...dash} />}
        {g === "profile" && <><line x1="0" y1="185" x2="300" y2="185" {...dash} /><line x1="150" y1="0" x2="150" y2="400" {...dash} /></>}
      </>}
    </svg>
  );
}

const HOLD_MS = 900;   // aligned this long → auto shot
const SLOW_MS = 700;   // slower than this per frame → assistant switches itself off

/** Target and live eye markers (frame fractions → 300×400 viewBox). */
function Marks({ t, cur, ok, mirror }: { t: Target | null; cur: Pose | null; ok: boolean; mirror: boolean }) {
  const X = (x: number) => (mirror ? 1 - x : x) * 300;
  const eyes = (p: { cx: number; cy: number; scale: number; roll: number }) => {
    const r = (p.roll * Math.PI) / 180, h = (p.scale * 300) / 2;
    const dx = Math.cos(r) * h * (mirror ? -1 : 1), dy = Math.sin(r) * h * (mirror ? -1 : 1);
    return [{ x: X(p.cx) - dx, y: p.cy * 400 - dy }, { x: X(p.cx) + dx, y: p.cy * 400 + dy }];
  };
  const tgt = t && t.cx !== undefined && t.cy !== undefined && t.scale !== undefined ? eyes({ cx: t.cx, cy: t.cy, scale: t.scale, roll: t.roll ?? 0 }) : null;
  const now = cur ? eyes(cur) : null;
  const col = ok ? "#3DDC97" : "#FFB547";
  return (
    <svg className="guides" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden>
      {tgt && tgt.map((e, k) => <circle key={k} cx={e.x} cy={e.y} r="7" fill="none" stroke="#fff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />)}
      {now && <line x1={now[0].x} y1={now[0].y} x2={now[1].x} y2={now[1].y} stroke={col} strokeWidth="2" vectorEffect="non-scaling-stroke" />}
      {now && now.map((e, k) => <circle key={k} cx={e.x} cy={e.y} r="3.5" fill={col} />)}
    </svg>
  );
}

/** Next Motion style capture: live camera, ghost of the earlier photo, alignment guides, fixed angle order. */
export function Studio({ sessionId, clientId, title, angles, shots: initial, refs, complete, discard }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [shots, setShots] = useState(initial);
  const [i, setI] = useState(() => Math.max(0, angles.findIndex((a) => !initial[a.key])));
  const [review, setReview] = useState(() => angles.every((x) => initial[x.key]));
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [live, setLive] = useState(false);
  const [ghost, setGhost] = useState(0.4);
  const [ghostOn, setGhostOn] = useState(true);
  const [guides, setGuides] = useState(true);
  const [timer, setTimer] = useState(0);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [peek, setPeek] = useState(false);
  const [flash, setFlash] = useState(false);
  const [err, setErr] = useState("");
  const [assist, setAssist] = useState(true);
  const [autoShot, setAutoShot] = useState(true);
  const [aiState, setAiState] = useState<"loading" | "on" | "slow" | "fail">("loading");
  const [pose, setPose] = useState<Pose | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [hold, setHold] = useState(0);
  const okSince = useRef<number | null>(null);
  const a = angles[i];
  const ref = refs[a.key];
  const shot = shots[a.key];
  const done = angles.filter((x) => shots[x.key]).length;

  useEffect(() => {
    let off = false;
    (async () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      setLive(false);
      if (!navigator.mediaDevices?.getUserMedia) { setErr("เบราว์เซอร์นี้เปิดกล้องสดไม่ได้ ใช้ปุ่ม “เลือกจากกล้องเครื่อง” แทน"); return; }
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } } });
        if (off) { s.getTracks().forEach((t) => t.stop()); return; }
        stream.current = s;
        if (video.current) { video.current.srcObject = s; await video.current.play().catch(() => {}); }
        setLive(true); setErr("");
      } catch {
        setErr("เปิดกล้องไม่ได้ ตรวจสิทธิ์กล้องใน Safari (aA → การตั้งค่าเว็บไซต์ → กล้อง) หรือใช้ปุ่ม “เลือกจากกล้องเครื่อง”");
      }
    })();
    return () => { off = true; stream.current?.getTracks().forEach((t) => t.stop()); };
  }, [facing]);

  // target pose for this angle: from the reference photo when there is one, otherwise from the guide
  useEffect(() => {
    let off = false;
    setTarget(null); okSince.current = null; setHold(0);
    if (!assist) return;
    (async () => {
      const g = angles[i].guide, r = refs[angles[i].key];
      if (r && g !== "profile") {
        try {
          const { detect } = await import("@/lib/face");
          const im = new Image(); im.src = img(r.id); await im.decode();
          const p = await detect(im);
          if (!off && p) return setTarget(targetFromRef(p, g));
        } catch { /* fall through to generic */ }
      }
      if (!off) setTarget(genericTarget(g));
    })();
    return () => { off = true; };
  }, [i, assist, angles, refs]);

  // live loop: one detection at a time, so a slow iPad simply runs fewer frames
  useEffect(() => {
    if (!assist || !live || review || a.guide === "profile") { setPose(null); setVerdict(null); return; }
    let off = false, slow = 0;
    (async () => {
      let face: typeof import("@/lib/face");
      try { face = await import("@/lib/face"); await face.loadFace(); setAiState("on"); }
      catch { setAiState("fail"); return; }
      while (!off) {
        const v = video.current;
        if (v && v.videoWidth) {
          const t0 = performance.now();
          const p = await face.detect(v).catch(() => null);
          const dt = performance.now() - t0;
          slow = dt > SLOW_MS ? slow + 1 : 0;
          if (slow >= 5) { setAiState("slow"); setAssist(false); return; }
          if (off) return;
          setPose(p);
        }
        await new Promise((r) => setTimeout(r, 60));
      }
    })();
    return () => { off = true; };
  }, [assist, live, review, a.guide]);

  useEffect(() => {
    if (!pose || !target) { setVerdict(pose ? null : null); okSince.current = null; setHold(0); return; }
    const v = judge(pose, target, facing === "user");
    setVerdict(v);
    if (!v.ok) { okSince.current = null; setHold(0); return; }
    okSince.current ??= performance.now();
    setHold(Math.min(1, (performance.now() - okSince.current) / HOLD_MS));
  }, [pose, target, facing]);

  const upload = useCallback(async (blob: Blob, w: number, h: number, meta: Record<string, unknown>) => {
    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", blob, `${a.key}.jpg`); fd.append("session_id", String(sessionId)); fd.append("angle", a.key);
      fd.append("width", String(w)); fd.append("height", String(h)); fd.append("meta", JSON.stringify(meta));
      const r = await fetch("/api/staff/photo", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error === "no_consent" ? "ลูกค้ายังไม่ยินยอมให้เก็บข้อมูล ถ่ายภาพไม่ได้" : j.error === "session_closed" ? "ชุดภาพนี้ปิดแล้ว เริ่มชุดใหม่เพื่อถ่ายเพิ่ม" : "อัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง"); return; }
      setShots((s) => ({ ...s, [a.key]: j.id }));
      setReview(true);
    } finally { setBusy(false); }
  }, [a.key, sessionId]);

  const shoot = useCallback(async () => {
    const v = video.current;
    if (!v || !live || busy || review) return;
    const t = stream.current?.getVideoTracks()[0];
    const st = (t?.getSettings?.() ?? {}) as MediaTrackSettings & { zoom?: number };
    const { blob, w, h } = await crop(v, v.videoWidth, v.videoHeight);
    setFlash(true); setTimeout(() => setFlash(false), 180);
    await upload(blob, w, h, { source: "live", facing, zoom: st.zoom ?? null, camera: t?.label ?? null, src: [v.videoWidth, v.videoHeight], ghost: ref?.id ?? null,
      assist: verdict ? { ok: verdict.ok, off: Math.round(verdict.off * 10) / 10, target: target?.fromRef ? "ref" : target ? "generic" : null, auto: autoShot } : null });
  }, [live, busy, review, upload, facing, ref, verdict, target, autoShot]);

  useEffect(() => {
    if (autoShot && assist && hold >= 1 && !count && !busy && !review) { okSince.current = null; setHold(0); shoot(); }
  }, [hold, autoShot, assist, count, busy, review, shoot]);

  const trigger = useCallback(() => {
    if (!timer) return void shoot();
    let n = timer; setCount(n);
    const iv = setInterval(() => { n -= 1; setCount(n); if (n <= 0) { clearInterval(iv); shoot(); } }, 1000);
  }, [timer, shoot]);

  // Bluetooth shutter remotes send Enter / space / volume-up
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if ([" ", "Enter", "AudioVolumeUp"].includes(e.key)) { e.preventDefault(); review ? next() : trigger(); }
    };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  });

  async function pick(f: File | undefined) {
    if (!f) return;
    const bm = await createImageBitmap(f);
    const { blob, w, h } = await crop(bm, bm.width, bm.height);
    await upload(blob, w, h, { source: "file", ghost: ref?.id ?? null });
  }
  function go(n: number) { setI(n); setReview(!!shots[angles[n].key]); setPeek(false); }
  function next() { const n = angles.findIndex((x, j) => j > i && !shots[x.key]); if (n >= 0) go(n); else if (i < angles.length - 1) go(i + 1); }

  return (
    <div className="studio">
      <div className="stage-wrap">
        <div className={`stage ${facing === "user" && !review ? "mirror" : ""}`}>
          <video ref={video} playsInline muted style={{ visibility: review ? "hidden" : "visible" }} />
          {review && shot && <img className="still" src={peek && ref ? img(ref.id) : img(shot)} alt={a.label} />}
          {!review && ref && ghostOn && <img className="ghost" src={img(ref.id)} alt="" style={{ opacity: ghost }} />}
          {!review && guides && <Guides g={a.guide} />}
          {!review && assist && <Marks t={target} cur={pose} ok={!!verdict?.ok} mirror={facing === "user"} />}
          {!review && assist && aiState === "on" && a.guide !== "profile" && (
            <div className={`coach ${verdict?.ok ? "ok" : ""}`}>
              {!target ? "ไม่มีภาพเดิมของมุมนี้ ใช้เส้นช่วยจัดเอง"
                : !pose ? "หาใบหน้าไม่พบ ให้ลูกค้าอยู่กลางจอ แสงพอ"
                : verdict?.ok ? (autoShot ? "ตรงแล้ว ค้างไว้…" : "ตรงแล้ว กดถ่ายได้")
                : verdict?.hints.join(" · ")}
              {verdict?.ok && autoShot && <i style={{ transform: `scaleX(${hold})` }} />}
            </div>)}
          {!review && assist && aiState === "loading" && <div className="coach">กำลังเตรียมตัวช่วยจัดหน้า…</div>}
          {count > 0 && <div className="count">{count}</div>}
          {flash && <div className="flash" />}
          <div className="badge">{a.label}{review && peek && ref ? ` · ภาพอ้างอิง ${d(ref.at)}` : ""}</div>
        </div>
      </div>

      <aside className="panel">
        <div>
          <div className="eyebrow">PHOTO STUDIO · {done}/{angles.length}</div>
          <h2>{title}</h2>
          <p className="hint">{a.hint}</p>
        </div>

        <ol className="steps">
          {angles.map((x, j) => (
            <li key={x.key}><button type="button" aria-current={j === i ? "step" : undefined} onClick={() => go(j)}>
              {shots[x.key] ? <img src={img(shots[x.key])} alt="" /> : refs[x.key] ? <img className="dim" src={img(refs[x.key].id)} alt="" /> : <span />}
              <small>{j + 1}. {x.label}{shots[x.key] ? " ✓" : ""}</small>
            </button></li>))}
        </ol>

        {review ? (
          <div className="ctrl">
            {ref && <button type="button" className="btn ghost" onPointerDown={() => setPeek(true)} onPointerUp={() => setPeek(false)} onPointerLeave={() => setPeek(false)}>กดค้างเพื่อเทียบกับภาพเดิม</button>}
            <div className="row">
              <button type="button" className="btn ghost" onClick={() => { setReview(false); setPeek(false); }}>ถ่ายใหม่</button>
              {done < angles.length && <button type="button" className="btn" onClick={next}>มุมถัดไป →</button>}
            </div>
          </div>
        ) : (
          <div className="ctrl">
            <button type="button" className="shutter" onClick={trigger} disabled={!live || busy} aria-label="ถ่ายภาพ">{busy ? "…" : ""}</button>
            <label className="field">ภาพเงาจากครั้งก่อน {ref ? `(${d(ref.at)})` : "(ยังไม่มี)"}
              <input type="range" min={0} max={0.8} step={0.05} value={ghost} disabled={!ref} onChange={(e) => setGhost(Number(e.target.value))} />
            </label>
            <div className="row">
              <button type="button" className="btn ghost small" aria-pressed={ghostOn} onClick={() => setGhostOn(!ghostOn)} disabled={!ref}>เงา {ghostOn ? "เปิด" : "ปิด"}</button>
              <button type="button" className="btn ghost small" aria-pressed={guides} onClick={() => setGuides(!guides)}>เส้นช่วย {guides ? "เปิด" : "ปิด"}</button>
              <button type="button" className="btn ghost small" aria-pressed={assist} onClick={() => { setAssist(!assist); if (aiState === "slow") setAiState("loading"); }}>ช่วยจัดหน้า {assist ? "เปิด" : "ปิด"}</button>
              <button type="button" className="btn ghost small" aria-pressed={autoShot} disabled={!assist} onClick={() => setAutoShot(!autoShot)}>ถ่ายอัตโนมัติ {autoShot ? "เปิด" : "ปิด"}</button>
              <button type="button" className="btn ghost small" onClick={() => setTimer(timer ? 0 : 3)}>ตั้งเวลา {timer ? "3 วิ" : "ปิด"}</button>
              <button type="button" className="btn ghost small" onClick={() => setFacing(facing === "environment" ? "user" : "environment")}>สลับกล้อง</button>
            </div>
            <label className="btn ghost small" style={{ textAlign: "center" }}>เลือกจากกล้องเครื่อง
              <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => pick(e.target.files?.[0])} /></label>
          </div>
        )}

        {err && <p className="err">{err}</p>}
        {aiState === "slow" && <p className="muted" style={{ fontSize: 12, margin: 0 }}>เครื่องนี้ประมวลผลใบหน้าช้า จึงปิดตัวช่วยจัดหน้าให้อัตโนมัติ ใช้ภาพเงาและเส้นช่วยแทน</p>}
        {aiState === "fail" && <p className="muted" style={{ fontSize: 12, margin: 0 }}>โหลดตัวช่วยจัดหน้าไม่สำเร็จ ใช้ภาพเงาและเส้นช่วยแทน</p>}

        <div className="ctrl end">
          <form action={complete}><input type="hidden" name="id" value={sessionId} />
            <button className="btn" style={{ width: "100%" }} disabled={done === 0}>{done < angles.length ? `จบชุดภาพ (${done}/${angles.length})` : "บันทึกชุดภาพ ✓"}</button></form>
          {done === 0 ? <form action={discard}><input type="hidden" name="id" value={sessionId} /><button className="btn ghost small" style={{ width: "100%" }}>ยกเลิกชุดนี้</button></form>
            : <a className="btn ghost small" href={`/staff/clients/${clientId}#photos`}>กลับไปหน้าลูกค้า (ถ่ายต่อทีหลังได้)</a>}
          <p className="muted" style={{ fontSize: 12, margin: 0 }}>ฉากหลังเดิม แสงเดิม ระยะเดิม · ภาพไม่ถูกบันทึกลงอัลบั้มเครื่อง</p>
        </div>
      </aside>
    </div>
  );
}

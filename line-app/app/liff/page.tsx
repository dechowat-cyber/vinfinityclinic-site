"use client";
import { useEffect, useMemo, useState, useCallback } from "react";

declare global { interface Window { liff: any } }

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || "";
const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

type Day = { date: string; open: boolean; free: number };
type Slot = { time: string; start: string; available: boolean };
type Appt = { id: number; start_at: string; doctor: string; status: string };

function fmt(iso: string) {
  const d = new Date(new Date(iso).getTime() + 7 * 3600_000);
  return `${DAYS[d.getUTCDay()]}. ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} · ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} น.`;
}

function loadSdk(): Promise<void> {
  return new Promise((res, rej) => {
    if (window.liff) return res();
    const s = document.createElement("script");
    s.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
    s.onload = () => res(); s.onerror = () => rej(new Error("sdk"));
    document.head.appendChild(s);
  });
}

export default function Liff() {
  const params = useMemo(() => (typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search)), []);
  const [ready, setReady] = useState(false);
  const [fatal, setFatal] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState(params.get("view") === "my" ? "my" : params.get("view") === "form" ? "form" : "book");
  const plan = params.get("plan");
  const devUser = params.get("dev_user");
  const link = params.get("t");
  const src = params.get("src") || "liff";

  useEffect(() => {
    (async () => {
      if (!LIFF_ID || link) { setReady(true); return; } // personal link from the bot, or local preview
      try {
        await loadSdk();
        await window.liff.init({ liffId: LIFF_ID });
        if (!window.liff.isLoggedIn()) { window.liff.login({ redirectUri: window.location.href }); return; }
        setToken(window.liff.getIDToken());
        setReady(true);
      } catch { setFatal("เปิดหน้านี้ใน LINE เพื่อจองคิวนะคะ"); }
    })();
  }, []);

  const api = useCallback(async (path: string, init: RequestInit & { json?: any } = {}) => {
    const url = devUser ? `${path}${path.includes("?") ? "&" : "?"}dev_user=${encodeURIComponent(devUser)}` : path;
    const res = await fetch(url, {
      method: init.json ? "POST" : "GET",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(link ? { "x-vf-link": link } : {}) },
      body: init.json ? JSON.stringify(init.json) : undefined,
    });
    const j = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, ...j };
  }, [token, devUser, link]);

  if (fatal) return <main className="liff"><div className="done"><div className="big">{fatal}</div><a className="btn" href="https://line.me/R/ti/p/@230eeqvl">เปิด LINE Vinfinity Clinic</a></div></main>;
  if (!ready) return <main className="liff"><div className="done muted">กำลังโหลด…</div></main>;
  if (view === "form") return <Form api={api} onMy={() => setView("my")} />;
  return view === "my" ? <My api={api} onBook={() => setView("book")} onForm={() => setView("form")} /> : <Book api={api} src={src} plan={plan} onMy={() => setView("my")} />;
}

function Header({ title, sub }: { title: string; sub: string }) {
  return <header className="liff-head"><div className="eyebrow" style={{ color: "#D5DDEE" }}>VINFINITY CLINIC · อุดรธานี</div><h1>{title}</h1><p>{sub}</p></header>;
}

function Picker({ api, value, onChange }: { api: any; value: string | null; onChange: (s: string | null) => void }) {
  const [days, setDays] = useState<Day[]>([]);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  useEffect(() => { api("/api/liff/slots?days=14").then((j: any) => {
    setDays(j.days || []); const first = (j.days || []).find((d: Day) => d.free > 0); if (first) setDate(first.date);
  }); }, [api]);
  useEffect(() => { if (!date) return; setSlots(null); onChange(null);
    api(`/api/liff/slots?date=${date}`).then((j: any) => setSlots(j.slots || [])); }, [date]); // eslint-disable-line
  return (
    <section className="card">
      <div className="eyebrow">เลือกวัน</div>
      <div className="days" style={{ marginTop: 10 }}>
        {days.map((d) => { const dt = new Date(`${d.date}T00:00:00Z`);
          return <button key={d.date} className="day" aria-pressed={date === d.date} disabled={!d.free} onClick={() => setDate(d.date)}>
            <small>{DAYS[dt.getUTCDay()]}</small><b>{dt.getUTCDate()}</b><small>{d.open ? (d.free ? MONTHS[dt.getUTCMonth()] : "เต็ม") : "ปิด"}</small></button>; })}
      </div>
      <div className="eyebrow" style={{ marginTop: 18 }}>เลือกเวลา</div>
      <div className="times" style={{ marginTop: 10 }}>
        {slots === null ? <span className="muted">กำลังโหลด…</span> : slots.length === 0 ? <span className="muted">วันนี้ไม่มีเวลาว่าง</span> :
          slots.map((s) => <button key={s.start} className="time" disabled={!s.available} aria-pressed={value === s.start} onClick={() => onChange(s.start)}>{s.time}</button>)}
      </div>
    </section>
  );
}

function Book({ api, src, plan, onMy }: { api: any; src: string; plan: string | null; onMy: () => void }) {
  const [start, setStart] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", interest: "", consentData: false, consentMarketing: false });
  const [step, setStep] = useState<"pick" | "form" | "done">("pick");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Appt | null>(null);
  const [known, setKnown] = useState(false);

  useEffect(() => { api("/api/liff/my").then((j: any) => {
    if (j.client) { setForm((f) => ({ ...f, name: j.client.name || "", phone: j.client.phone || "", consentData: !!j.consent?.data, consentMarketing: !!j.consent?.marketing })); setKnown(!!j.consent?.data); }
  }); }, [api]);

  async function submit() {
    setErr(""); setBusy(true);
    const j = await api("/api/liff/book", { json: { ...form, start, src, plan } });
    setBusy(false);
    if (j.ok) { setResult(j.appointment); setStep("done"); return; }
    if (j.error === "slot_taken") { setErr(`ช่วงเวลานี้เพิ่งถูกจองค่ะ ลองเลือก ${j.alternatives?.map((a: Slot) => a.time).join(", ") || "เวลาอื่น"} นะคะ`); setStep("pick"); setStart(null); return; }
    setErr(j.error === "consent_required" ? "กรุณายินยอมเรื่องข้อมูลส่วนตัวก่อนจองค่ะ" : j.error === "missing_fields" ? "กรุณากรอกชื่อและเบอร์โทรค่ะ" : "จองไม่สำเร็จ ลองใหม่อีกครั้งหรือทักแชทได้เลยค่ะ");
  }

  if (step === "done" && result) return (
    <main className="liff"><Header title="จองคิวเรียบร้อย" sub="ส่งการ์ดยืนยันเข้าแชท LINE ให้แล้วค่ะ" />
      <div className="done"><div className="tag ok">ยืนยันแล้ว</div><div className="big">{fmt(result.start_at)}</div>
        <p className="muted">ปรึกษากับ {result.doctor} · สาขาอุดรธานี<br />จะมีข้อความเตือนก่อนวันนัด 1 วัน กดยืนยันหรือเลื่อนนัดได้เองค่ะ</p>
        <div className="row" style={{ justifyContent: "center", marginTop: 18 }}>
          <button className="btn" onClick={() => window.liff?.isInClient?.() ? window.liff.closeWindow() : onMy()}>เสร็จสิ้น</button>
          <button className="btn ghost" onClick={onMy}>นัดของฉัน</button></div></div></main>);

  return (
    <main className="liff">
      <Header title={plan ? "จองคิวทำตามแผน" : "จองคิวปรึกษาคุณหมอ"} sub={plan ? "เลือกวันเวลาที่สะดวก ทีมจะเตรียมตามแผนที่คุณหมอออกไว้" : "ปรึกษาประมาณ 30 นาที · แพทย์ประเมินโครงหน้าก่อนวางแผนทุกครั้ง"} />
      <div className="liff-body">
        {err && <div className="card err">{err}</div>}
        {step === "pick" ? <Picker api={api} value={start} onChange={setStart} /> : (
          <section className="card">
            <div className="eyebrow">ข้อมูลสำหรับนัด</div>
            <p style={{ margin: "8px 0 16px" }}><b>{start && fmt(start)}</b> <button className="btn ghost small" onClick={() => setStep("pick")}>เปลี่ยน</button></p>
            <div className="field"><label htmlFor="n">ชื่อ-นามสกุล</label><input id="n" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="p">เบอร์โทร</label><input id="p" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="field"><label htmlFor="i">อยากปรึกษาเรื่องอะไร (ไม่บังคับ)</label><textarea id="i" rows={3} placeholder="เช่น ใต้ตาดูเหนื่อย อยากให้หน้าดูสดชื่นขึ้น" value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} /></div>
            {!known && <label className="check"><input type="checkbox" checked={form.consentData} onChange={(e) => setForm({ ...form, consentData: e.target.checked })} />
              <span>ยินยอมให้ Vinfinity Clinic เก็บและใช้ชื่อ เบอร์โทร และข้อมูลที่แจ้ง เพื่อการนัดหมาย ปรึกษา และดูแลการรักษา (จำเป็นสำหรับการจอง)</span></label>}
            <label className="check"><input type="checkbox" checked={form.consentMarketing} onChange={(e) => setForm({ ...form, consentMarketing: e.target.checked })} />
              <span>รับข่าวสารและสิทธิพิเศษทาง LINE (ไม่บังคับ ยกเลิกได้ทุกเมื่อ)</span></label>
          </section>)}
        <button className="btn ghost" onClick={onMy}>ดูนัดของฉัน</button>
      </div>
      <div className="sticky">
        {step === "pick"
          ? <button className="btn" disabled={!start} onClick={() => setStep("form")}>ถัดไป</button>
          : <button className="btn" disabled={busy || !form.name || form.phone.replace(/\D/g, "").length < 9 || (!known && !form.consentData)} onClick={submit}>{busy ? "กำลังจอง…" : "ยืนยันการจอง"}</button>}
      </div>
    </main>
  );
}

function My({ api, onBook, onForm }: { api: any; onBook: () => void; onForm: () => void }) {
  const [data, setData] = useState<any>(null);
  const [moving, setMoving] = useState<Appt | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const load = useCallback(() => api("/api/liff/my").then(setData), [api]);
  useEffect(() => { load(); }, [load]);

  async function cancel(a: Appt) {
    if (!window.confirm?.("ยกเลิกนัดนี้ใช่ไหมคะ")) return;
    const j = await api("/api/liff/my", { json: { action: "cancel", id: a.id } }); setMsg(j.ok ? "ยกเลิกนัดแล้วค่ะ" : "ยกเลิกไม่สำเร็จ"); load();
  }
  async function move() {
    if (!moving || !start) return;
    const j = await api("/api/liff/my", { json: { action: "reschedule", id: moving.id, start } });
    setMsg(j.ok ? "เลื่อนนัดเรียบร้อย ส่งการ์ดยืนยันใหม่เข้าแชทแล้วค่ะ" : j.error === "slot_taken" ? "เวลานี้เพิ่งถูกจอง ลองเลือกเวลาอื่นนะคะ" : "เลื่อนนัดไม่สำเร็จ");
    if (j.ok) { setMoving(null); setStart(null); } load();
  }

  return (
    <main className="liff">
      <Header title="นัดของฉัน" sub="ยืนยัน เลื่อน หรือยกเลิกนัดได้เอง" />
      <div className="liff-body">
        {msg && <div className="card">{msg}</div>}
        {!data ? <div className="muted">กำลังโหลด…</div> : data.error ? <div className="err">เปิดหน้านี้ใน LINE นะคะ</div> :
          data.appointments.length === 0 ? <div className="card"><p style={{ marginTop: 0 }}>ยังไม่มีนัดที่กำลังจะถึงค่ะ</p><button className="btn" onClick={onBook}>จองคิวปรึกษา</button></div> :
          data.appointments.map((a: Appt) => (
            <div className="card" key={a.id}>
              <div className="row" style={{ justifyContent: "space-between" }}><b>{fmt(a.start_at)}</b><span className={`tag ${a.status === "confirmed" ? "ok" : ""}`}>{a.status === "confirmed" ? "ยืนยันแล้ว" : "จองแล้ว"}</span></div>
              <p className="muted" style={{ margin: "6px 0 14px" }}>ปรึกษา · {a.doctor} · สาขาอุดรธานี</p>
              <div className="row"><button className="btn small" onClick={() => { setMoving(a); setStart(null); }}>เลื่อนนัด</button><button className="btn danger small" onClick={() => cancel(a)}>ยกเลิก</button></div>
            </div>))}
        {moving && <><div className="eyebrow">เลือกเวลาใหม่</div><Picker api={api} value={start} onChange={setStart} />
          <button className="btn" disabled={!start} onClick={move}>ยืนยันเวลาใหม่</button></>}
        {data?.appointments?.length > 0 && <button className="btn ghost" onClick={onForm}>กรอก / แก้แบบฟอร์มก่อนมา</button>}
        {data?.consent && <label className="check card"><input type="checkbox" checked={!!data.consent.marketing}
          onChange={async (e) => { await api("/api/liff/my", { json: { action: "marketing", value: e.target.checked } }); load(); }} />
          <span>รับข่าวสารและสิทธิพิเศษทาง LINE</span></label>}
      </div>
    </main>
  );
}

const FIELDS: [string, string, string][] = [
  ["birthYear", "ปีเกิด (พ.ศ.)", "เช่น 2535"],
  ["allergies", "แพ้ยา แพ้อาหาร หรือแพ้สารใดไหม", "ถ้าไม่มี พิมพ์ ไม่มี"],
  ["conditions", "โรคประจำตัว", "ถ้าไม่มี พิมพ์ ไม่มี"],
  ["medications", "ยาหรืออาหารเสริมที่ใช้อยู่", "เช่น ยาละลายลิ่มเลือด วิตามินอี น้ำมันปลา"],
  ["previous", "เคยทำหัตถการความงามอะไรมาบ้าง และประมาณเมื่อไหร่", "เช่น ฟิลเลอร์ใต้ตา ปี 2567"],
  ["concerns", "เรื่องที่กังวลหรืออยากปรึกษา", ""],
  ["goals", "อยากให้ผลลัพธ์ออกมาแบบไหน", "เช่น ดูสดชื่นขึ้นแต่ยังเป็นธรรมชาติ"],
];

function Form({ api, onMy }: { api: any; onMy: () => void }) {
  const [f, setF] = useState<Record<string, string>>({});
  const [state, setState] = useState<"load" | "edit" | "saving" | "done" | "consent">("load");
  useEffect(() => { api("/api/liff/form").then((j: any) => {
    if (j.consent?.data !== true) { setState("consent"); return; }
    setF({ name: j.client?.name || "", phone: j.client?.phone || "", ...(j.client?.health || {}) }); setState("edit");
  }); }, [api]);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  async function save() {
    setState("saving");
    const j = await api("/api/liff/form", { json: f });
    setState(j.ok ? "done" : "edit");
  }
  if (state === "done") return <main className="liff"><Header title="บันทึกแล้ว" sub="ขอบคุณค่ะ คุณหมอจะอ่านก่อนพบกัน วันนัดจะได้ไม่ต้องกรอกซ้ำ" />
    <div className="done"><button className="btn" onClick={() => window.liff?.isInClient?.() ? window.liff.closeWindow() : onMy()}>เสร็จสิ้น</button></div></main>;
  return (
    <main className="liff">
      <Header title="แบบฟอร์มก่อนมา" sub="ใช้เวลาประมาณ 2 นาที ข้อมูลนี้เห็นเฉพาะแพทย์และทีมดูแลการรักษา" />
      <div className="liff-body">
        {state === "load" ? <div className="muted">กำลังโหลด…</div> : state === "consent" ? <div className="card">ต้องยินยอมเรื่องข้อมูลส่วนตัวก่อนนะคะ ตอบ "ยินยอม" ในแชท หรือจองคิวผ่านปุ่มจองคิวก่อนค่ะ</div> : (
          <section className="card">
            <div className="field"><label htmlFor="fn">ชื่อ-นามสกุล</label><input id="fn" value={f.name || ""} onChange={set("name")} /></div>
            <div className="field"><label htmlFor="fp">เบอร์โทร</label><input id="fp" inputMode="tel" value={f.phone || ""} onChange={set("phone")} /></div>
            <div className="field"><label htmlFor="pg">ตั้งครรภ์หรือให้นมบุตรอยู่ไหม</label>
              <select id="pg" value={f.pregnant || ""} onChange={set("pregnant")}><option value="">เลือก</option><option>ไม่ใช่</option><option>ตั้งครรภ์</option><option>ให้นมบุตร</option><option>ไม่แน่ใจ</option></select></div>
            {FIELDS.map(([k, l, ph]) => <div className="field" key={k}><label htmlFor={k}>{l}</label>
              {k === "birthYear" ? <input id={k} inputMode="numeric" placeholder={ph} value={f[k] || ""} onChange={set(k)} /> :
                <textarea id={k} rows={2} placeholder={ph} value={f[k] || ""} onChange={set(k)} />}</div>)}
          </section>)}
      </div>
      {state !== "consent" && state !== "load" && <div className="sticky"><button className="btn" disabled={state === "saving"} onClick={save}>{state === "saving" ? "กำลังบันทึก…" : "บันทึก"}</button></div>}
    </main>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";

export type BoxGift = { title: string; price: string; was?: string; cond: string; limit: number; icon: string; claimText: string };
export type Box = { day: number; big: boolean; state: "past" | "today" | "locked"; gift?: BoxGift };

const WEEK = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
const LEAD = 1; // 1 Dec 2026 is a Tuesday (Monday-first grid)
const KEY = "vf-gifts-opened";

function readOpened(): number[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function saveOpened(d: number) {
  try { const s = new Set(readOpened()); s.add(d); localStorage.setItem(KEY, JSON.stringify([...s])); } catch { /* storage off: fine */ }
}

/** Next Bangkok midnight (or 1 Dec before the calendar starts). */
function nextOpen(now: number, before: boolean) {
  if (before) return Date.parse("2026-12-01T00:00:00+07:00");
  const bkk = new Date(now + 7 * 3600e3);
  return Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate() + 1) - 7 * 3600e3;
}
function hms(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return d ? `${d} วัน ${p(h)}:${p(m)}:${p(x)}` : `${p(h)}:${p(m)}:${p(x)}`;
}

export default function GiftCalendar({ boxes, today, before, after, left, oa, site, nowIso }:
  { boxes: Box[]; today: number | null; before: boolean; after: boolean; left: number | null; oa: string; site: string; nowIso: string }) {
  const [opened, setOpened] = useState<number[]>([]);
  const [show, setShow] = useState<Box | null>(null);
  const [lidOff, setLidOff] = useState(false);
  const [toast, setToast] = useState("");
  const [shake, setShake] = useState<number | null>(null);
  const offset = useMemo(() => Date.now() - Date.parse(nowIso), [nowIso]);
  const [tick, setTick] = useState(() => Date.now() - offset);

  useEffect(() => { setOpened(readOpened()); }, []);
  useEffect(() => { const t = setInterval(() => setTick(Date.now() - offset), 1000); return () => clearInterval(t); }, [offset]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2200); return () => clearTimeout(t); }, [toast]);

  const target = nextOpen(tick, before);
  const todayBox = today ? boxes[today - 1] : null;
  const pageUrl = `${site}/gifts?s=share`;
  const shareText = `มาเปิดปฏิทินของขวัญ สวยก่อนปีใหม่ ที่ Vinfinity Clinic ด้วยกัน 🎁 วันละกล่อง สิทธิ์จำกัดต่อวัน`;
  const claimUrl = (g: BoxGift) => `https://line.me/R/oaMessage/${encodeURIComponent(oa)}/?${encodeURIComponent(`${g.claimText} (จากปฏิทินของขวัญ)`)}`;

  function open(b: Box) {
    if (b.state === "locked") { setShake(b.day); setTimeout(() => setShake(null), 500); setToast(before || b.day > (today ?? 0) ? `กล่องนี้เปิดได้วันที่ ${b.day} ธ.ค. นะคะ` : ""); return; }
    setLidOff(opened.includes(b.day));
    setShow(b);
    if (!opened.includes(b.day)) setTimeout(() => { setLidOff(true); saveOpened(b.day); setOpened(readOpened()); }, 650);
  }
  async function share() {
    try {
      if (navigator.share) { await navigator.share({ title: "ปฏิทินของขวัญ สวยก่อนปีใหม่", text: shareText, url: pageUrl }); return; }
    } catch { return; }
    location.href = `https://line.me/R/share?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`;
  }
  async function copy() {
    try { await navigator.clipboard.writeText(pageUrl); setToast("คัดลอกลิงก์แล้ว ส่งให้เพื่อนได้เลย"); } catch { setToast(pageUrl); }
  }

  return (
    <>
      <section className="gf-status">
        {before && <><span className="gf-pill">เปิดกล่องแรกใน</span><b className="gf-count">{hms(target - tick)}</b></>}
        {today && <><span className="gf-pill">วันนี้เปิดกล่องวันที่ {today} ธ.ค.</span><span className="gf-next">กล่องถัดไปเปิดใน <b>{hms(target - tick)}</b></span></>}
        {after && <span className="gf-pill">ปฏิทินปิดแล้ว ขอบคุณที่ร่วมสนุกค่ะ 💙</span>}
      </section>

      <section className="gf-cal" aria-label="ปฏิทินเดือนธันวาคม">
        {WEEK.map((w) => <div key={w} className="gf-wd">{w}</div>)}
        {Array.from({ length: LEAD }, (_, i) => <div key={`e${i}`} />)}
        {boxes.map((b) => {
          const isOpen = b.state !== "locked" && opened.includes(b.day);
          return (
            <button key={b.day} type="button" onClick={() => open(b)}
              className={`gf-box ${b.state} ${b.big ? "big" : ""} ${isOpen ? "open" : ""} ${shake === b.day ? "shake" : ""}`}
              aria-label={`กล่องวันที่ ${b.day} ธ.ค.${b.state === "locked" ? " ยังไม่เปิด" : ""}`}>
              <span className="gf-day">{b.day}</span>
              <span className="gf-ico">{b.state === "locked" ? (b.big ? "⭐" : "") : isOpen ? b.gift?.icon : b.state === "today" ? "🎁" : ""}</span>
              {b.state === "past" && <span className="gf-gone">หมดเวลา</span>}
            </button>
          );
        })}
      </section>
      <p className="gf-legend"><span>⭐ กล่องใหญ่ 12 · 25 · 31</span><span>แตะกล่องที่เรืองแสงเพื่อเปิด</span></p>

      {todayBox?.gift && (
        <section className="gf-todaycard">
          <p className="gf-eyebrow">ของขวัญวันนี้ · {todayBox.day} ธ.ค.</p>
          {opened.includes(todayBox.day) ? (
            <>
              <h2>{todayBox.gift.icon} {todayBox.gift.title}</h2>
              <p className="gf-price">{todayBox.gift.price}{todayBox.gift.was && <s>ปกติ {todayBox.gift.was}</s>}</p>
              <p className="gf-cond">{todayBox.gift.cond}</p>
              <p className="gf-left">{left == null ? `เพียง ${todayBox.gift.limit} สิทธิ์` : left > 0 ? `🔥 เหลือ ${left} จาก ${todayBox.gift.limit} สิทธิ์` : "สิทธิ์วันนี้ครบแล้ว พรุ่งนี้มาเปิดกล่องใหม่นะคะ"}</p>
              {left !== 0 && <a className="gf-cta" href={claimUrl(todayBox.gift)}>กดรับสิทธิ์ใน LINE</a>}
            </>
          ) : (
            <button type="button" className="gf-cta" onClick={() => open(todayBox)}>🎁 เปิดกล่องวันนี้</button>
          )}
        </section>
      )}

      <section className="gf-share">
        <h2>ชวนเพื่อนมาเปิดด้วยกัน</h2>
        <p>ส่งปฏิทินให้เพื่อน แล้วมาสวยก่อนปีใหม่ไปด้วยกัน</p>
        <div className="gf-sharebtns">
          <a className="gf-line" href={`https://line.me/R/share?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`}>แชร์ทาง LINE</a>
          <a className="gf-fb" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener">แชร์ Facebook</a>
          <button type="button" onClick={share}>แชร์แบบอื่น</button>
          <button type="button" onClick={copy}>คัดลอกลิงก์</button>
        </div>
        <a className="gf-add" href={`https://line.me/R/ti/p/${encodeURIComponent(oa)}`}>เพิ่มเพื่อน LINE @vinfinityclinic เพื่อรับแจ้งเตือนกล่องใหญ่</a>
      </section>

      {show && (
        <div className="gf-modal" role="dialog" aria-modal="true" onClick={() => setShow(null)}>
          <div className="gf-sheet" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="gf-x" onClick={() => setShow(null)} aria-label="ปิด">×</button>
            <div className={`gf-gift ${lidOff ? "off" : ""}`} aria-hidden>
              <div className="gf-lid" /><div className="gf-base" /><div className="gf-ribbon" />
              <div className="gf-burst">{show.gift?.icon}</div>
            </div>
            {lidOff && show.gift && (
              <div className="gf-reveal">
                <p className="gf-eyebrow">กล่องวันที่ {show.day} ธ.ค.{show.state === "past" ? " · หมดเวลาแล้ว" : ""}</p>
                <h3>{show.gift.title}</h3>
                <p className="gf-price">{show.gift.price}{show.gift.was && <s>ปกติ {show.gift.was}</s>}</p>
                <p className="gf-cond">{show.gift.cond}</p>
                {show.state === "today" ? (
                  <>
                    <p className="gf-left">{left == null ? `เพียง ${show.gift.limit} สิทธิ์ วันนี้วันเดียว` : left > 0 ? `🔥 เหลือ ${left} จาก ${show.gift.limit} สิทธิ์ · ถึง 23:59 น.` : "สิทธิ์วันนี้ครบแล้ว พรุ่งนี้มาเปิดกล่องใหม่นะคะ"}</p>
                    {left !== 0 && <a className="gf-cta" href={claimUrl(show.gift)}>กดรับสิทธิ์ใน LINE</a>}
                    <button type="button" className="gf-ghost" onClick={share}>ชวนเพื่อนมาเปิดด้วย</button>
                  </>
                ) : (
                  <p className="gf-left">กล่องนี้หมดเวลาแล้ว กล่องใหม่เปิดทุกเที่ยงคืน อย่าพลาดกล่องถัดไปนะคะ</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {toast && <div className="gf-toast">{toast}</div>}
    </>
  );
}

"use client";
import { useState } from "react";

/** Before/after wipe: drag the handle across the frame. Both photos are 3:4 crops of the same framing. */
export function Wipe({ a, b, la, lb }: { a: number; b: number; la: string; lb: string }) {
  const [x, setX] = useState(50);
  return (
    <div className="wipe">
      <img src={`/api/staff/photo/${b}`} alt={lb} />
      <img src={`/api/staff/photo/${a}`} alt={la} style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }} />
      <div className="bar" style={{ left: `${x}%` }} />
      <span className="lab l">{la}</span><span className="lab r">{lb}</span>
      <input type="range" min={0} max={100} value={x} onChange={(e) => setX(Number(e.target.value))} aria-label="เลื่อนเปรียบเทียบ" />
    </div>
  );
}

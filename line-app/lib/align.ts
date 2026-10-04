"use client";
// Before & after helpers that run on the staff device only:
//  - align: scale/rotate/shift the "after" photo so both eyes land exactly where they are in the "before" photo
//  - blur: pixelate a band over brows + eyes (for anonymous posting)
//  - compose: one PNG with labels, logo and the required disclaimer
import { landmarks, eyes, Pt } from "./face";

export const DISCLAIMER = "ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล";
const photo = (id: number) => `/api/staff/photo/${id}`;
const ZOOM = 1.06; // small common crop so the shifted photo never shows an empty edge

async function load(src: string) { const i = new Image(); i.src = src; await i.decode(); return i; }

const marks = new Map<number, Promise<{ img: HTMLImageElement; pts: Pt[] | null }>>();
function get(id: number) {
  if (!marks.has(id)) marks.set(id, (async () => {
    const img = await load(photo(id));
    let pts: Pt[] | null = null;
    try { pts = await landmarks(img); } catch { /* model failed to load: fall back to unaligned */ }
    return { img, pts };
  })());
  return marks.get(id)!;
}

function pixelate(c: CanvasRenderingContext2D, pts: Pt[]) {
  const sel = pts.slice(17, 27).concat(pts.slice(36, 48));
  const xs = sel.map((p) => p.x), ys = sel.map((p) => p.y);
  const w0 = Math.max(...xs) - Math.min(...xs), pad = w0 * 0.1;
  const x = Math.max(0, Math.min(...xs) - pad), y = Math.max(0, Math.min(...ys) - pad);
  const w = Math.min(c.canvas.width - x, w0 + pad * 2), h = Math.min(c.canvas.height - y, Math.max(...ys) - Math.min(...ys) + pad * 2.6);
  const t = document.createElement("canvas"); t.width = 16; t.height = Math.max(3, Math.round((16 * h) / w));
  t.getContext("2d")!.drawImage(c.canvas, x, y, w, h, 0, 0, t.width, t.height);
  c.imageSmoothingEnabled = false; c.drawImage(t, 0, 0, t.width, t.height, x, y, w, h); c.imageSmoothingEnabled = true;
}

function source(img: HTMLImageElement, pts: Pt[] | null, blur: boolean) {
  const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const x = c.getContext("2d")!; x.drawImage(img, 0, 0);
  if (blur && pts) pixelate(x, pts);
  return c;
}

const toUrl = (c: HTMLCanvasElement) => new Promise<string>((res) => c.toBlob((b) => res(URL.createObjectURL(b!)), "image/jpeg", 0.92));

export type Prepared = { before: string; after: string; aligned: boolean; note: string; canvases: [HTMLCanvasElement, HTMLCanvasElement] };

/** Renders the pair at the before photo's size. Alignment is skipped when the faces can't be found or the fit is implausible. */
export async function prepare(beforeId: number, afterId: number, o: { align: boolean; blur: boolean }): Promise<Prepared> {
  const [A, B] = await Promise.all([get(beforeId), get(afterId)]);
  const W = A.img.naturalWidth, H = A.img.naturalHeight;
  const out = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d")!; x.fillStyle = "#0B142E"; x.fillRect(0, 0, W, H); return [c, x] as const; };
  const [ca, xa] = out(), [cb, xb] = out();
  const zoom = (x: CanvasRenderingContext2D) => { x.translate(W / 2, H / 2); x.scale(ZOOM, ZOOM); x.translate(-W / 2, -H / 2); };

  let note = "", aligned = false;
  let t: { s: number; ang: number; from: Pt; to: Pt } | null = null;
  if (o.align) {
    if (A.pts && B.pts) {
      const ea = eyes(A.pts), eb = eyes(B.pts);
      const va = { x: ea.r.x - ea.l.x, y: ea.r.y - ea.l.y }, vb = { x: eb.r.x - eb.l.x, y: eb.r.y - eb.l.y };
      const s = Math.hypot(va.x, va.y) / Math.max(1e-6, Math.hypot(vb.x, vb.y));
      const ang = Math.atan2(va.y, va.x) - Math.atan2(vb.y, vb.x);
      if (s > 0.6 && s < 1.6 && Math.abs(ang) < (20 * Math.PI) / 180) {
        t = { s, ang, from: { x: (eb.l.x + eb.r.x) / 2, y: (eb.l.y + eb.r.y) / 2 }, to: { x: (ea.l.x + ea.r.x) / 2, y: (ea.l.y + ea.r.y) / 2 } };
        aligned = true; note = "จัดแนวตามดวงตาแล้ว";
      } else note = "สองภาพต่างกันมากเกินจะจัดแนวอัตโนมัติ — แสดงภาพเดิม";
    } else note = "หาตำแหน่งดวงตาไม่พบ (เช่น ภาพด้านข้าง) — แสดงภาพเดิม";
  }

  zoom(xa); xa.drawImage(source(A.img, A.pts, o.blur), 0, 0);
  zoom(xb);
  const sb = source(B.img, B.pts, o.blur);
  if (t) { xb.translate(t.to.x, t.to.y); xb.rotate(t.ang); xb.scale(t.s, t.s); xb.translate(-t.from.x, -t.from.y); xb.drawImage(sb, 0, 0); }
  else xb.drawImage(sb, 0, 0, sb.width, sb.height, 0, 0, W, H);

  const [before, after] = await Promise.all([toUrl(ca), toUrl(cb)]);
  return { before, after, aligned, note, canvases: [ca, cb] };
}

let logo: Promise<HTMLImageElement | null> | null = null;
const getLogo = () => (logo ??= load("/logo-h.svg").catch(() => null));

/** One shareable PNG: two panels, date labels, dark gradient footer with the white logo and the disclaimer. */
export async function compose(p: Prepared, o: { before: string; after: string; layout: "side" | "stack"; caption?: string }) {
  const [a, b] = p.canvases;
  const s = Math.min(1, 1200 / a.height);
  const W = Math.round(a.width * s), H = Math.round(a.height * s);
  const side = o.layout === "side";
  const c = document.createElement("canvas"); c.width = side ? W * 2 : W; c.height = side ? H : H * 2;
  const x = c.getContext("2d")!;
  x.drawImage(a, 0, 0, W, H);
  x.drawImage(b, side ? W : 0, side ? 0 : H, W, H);
  x.fillStyle = "#fff"; if (side) x.fillRect(W - 2, 0, 4, H); else x.fillRect(0, H - 2, W, 4);

  await document.fonts?.ready;
  const font = getComputedStyle(document.body).fontFamily || "sans-serif";
  const u = c.width / 1800; // type scale
  const pill = (txt: string, px: number, py: number) => {
    x.font = `500 ${Math.round(34 * u)}px ${font}`;
    const bw = x.measureText(txt).width + 44 * u, bh = 58 * u;
    x.fillStyle = "rgba(11,20,46,.72)"; x.beginPath();
    if ((x as any).roundRect) (x as any).roundRect(px, py, bw, bh, bh / 2); else x.rect(px, py, bw, bh);
    x.fill(); x.fillStyle = "#fff"; x.textBaseline = "middle"; x.fillText(txt, px + 22 * u, py + bh / 2 + 1);
  };
  pill(`ก่อน · ${o.before}`, 28 * u, 28 * u);
  pill(`หลัง · ${o.after}`, (side ? W : 0) + 28 * u, (side ? 0 : H) + 28 * u);

  const fh = 220 * u, y0 = c.height - fh;
  const g = x.createLinearGradient(0, y0, 0, c.height);
  g.addColorStop(0, "rgba(11,20,46,0)"); g.addColorStop(1, "rgba(11,20,46,.88)");
  x.fillStyle = g; x.fillRect(0, y0, c.width, fh);
  const base = c.height - 44 * u;
  const L = await getLogo();
  if (L) { const lh = 60 * u, lw = (L.naturalWidth / L.naturalHeight) * lh || 220 * u; x.drawImage(L, 40 * u, base - lh + 10 * u, lw, lh); }
  x.textBaseline = "alphabetic"; x.textAlign = "right"; x.fillStyle = "rgba(255,255,255,.95)";
  x.font = `300 ${Math.round(30 * u)}px ${font}`; x.fillText(`*${DISCLAIMER}`, c.width - 40 * u, base);
  if (o.caption) { x.font = `300 ${Math.round(24 * u)}px ${font}`; x.fillStyle = "rgba(255,255,255,.75)"; x.fillText(o.caption, c.width - 40 * u, base - 42 * u); }
  x.textAlign = "left";
  return new Promise<Blob>((res) => c.toBlob((bl) => res(bl!), "image/png"));
}

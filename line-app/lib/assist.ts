// Live framing assistant for the photo studio: compares the face in the camera with where it was in the
// reference (ghost) photo — or with a generic target for the guide — and says, in plain Thai, what to fix.
import type { Pose } from "./face";
import type { Guide } from "./photos";

export type Target = { cx?: number; cy?: number; scale?: number; roll?: number; yaw?: number; yawAbs?: number; pitch?: number; fromRef: boolean };
export type Verdict = { ok: boolean; hints: string[]; off: number };

/** Generic targets match the studio's guide lines (eye line at 165/400 of the frame). */
export function genericTarget(g: Guide): Target | null {
  if (g === "front") return { cx: 0.5, cy: 0.41, roll: 0, yaw: 0, fromRef: false };
  if (g === "oblique") return { cy: 0.41, roll: 0, yawAbs: 0.2, fromRef: false };
  return null; // close-ups and profiles: only a reference photo gives a usable target
}

export function targetFromRef(p: Pose, g: Guide): Target {
  return g === "oblique" || g === "front" || g === "close"
    ? { cx: p.cx, cy: p.cy, scale: p.scale, roll: p.roll, yaw: p.yaw, pitch: p.pitch, fromRef: true }
    : { cy: p.cy, scale: p.scale, fromRef: true };
}

const TOL = { pos: 0.03, scale: 0.07, roll: 3, yaw: 0.04, yawAbs: 0.06, pitch: 0.05 };

/**
 * mirror = front (selfie) camera shown mirrored: left/right hints are then given as the person sees the screen.
 * Back camera: hints tell the photographer how to move the iPad.
 */
export function judge(cur: Pose, t: Target, mirror: boolean): Verdict {
  const hints: string[] = [];
  let off = 0;
  const sx = mirror ? -1 : 1; // screen-x direction
  const add = (bad: number, h: string) => { off += bad; hints.push(h); };

  if (t.scale !== undefined) {
    const r = cur.scale / t.scale - 1;
    if (Math.abs(r) > TOL.scale) add(Math.abs(r) / TOL.scale, r > 0 ? (mirror ? "ถอยห่างจากกล้องอีกนิด" : "ถอยกล้องออกอีกนิด") : (mirror ? "ขยับเข้าใกล้กล้องอีกนิด" : "ขยับกล้องเข้าใกล้อีกนิด"));
  }
  if (t.cx !== undefined) {
    const d = (cur.cx - t.cx) * sx; // + = face is right of target on screen
    if (Math.abs(d) > TOL.pos) add(Math.abs(d) / TOL.pos, mirror ? (d > 0 ? "ขยับหน้าไปทางซ้ายของจอ" : "ขยับหน้าไปทางขวาของจอ") : (d > 0 ? "เลื่อนกล้องไปทางขวา" : "เลื่อนกล้องไปทางซ้าย"));
  }
  if (t.cy !== undefined) {
    const d = cur.cy - t.cy; // + = face is lower than target
    if (Math.abs(d) > TOL.pos) add(Math.abs(d) / TOL.pos, mirror ? (d > 0 ? "ยกกล้องให้ต่ำลง หรือนั่งให้สูงขึ้น" : "ยกกล้องให้สูงขึ้น หรือนั่งให้ต่ำลง") : (d > 0 ? "ลดกล้องลงเล็กน้อย" : "ยกกล้องขึ้นเล็กน้อย"));
  }
  if (t.roll !== undefined) {
    const d = (cur.roll - t.roll) * sx; // + = head tilted clockwise on screen
    if (Math.abs(d) > TOL.roll) add(Math.abs(d) / TOL.roll, d > 0 ? "ให้ลูกค้าเอียงศีรษะไปทางซ้ายของจอเล็กน้อย" : "ให้ลูกค้าเอียงศีรษะไปทางขวาของจอเล็กน้อย");
  }
  if (t.yaw !== undefined) {
    const d = (cur.yaw - t.yaw) * sx; // + = nose points further right on screen
    if (Math.abs(d) > TOL.yaw) add(Math.abs(d) / TOL.yaw, d > 0 ? "ให้ลูกค้าหันหน้าไปทางซ้ายของจออีกนิด" : "ให้ลูกค้าหันหน้าไปทางขวาของจออีกนิด");
  } else if (t.yawAbs !== undefined) {
    const d = Math.abs(cur.yaw) - t.yawAbs;
    if (Math.abs(d) > TOL.yawAbs) add(Math.abs(d) / TOL.yawAbs, d > 0 ? "หันหน้ากลับมาทางกล้องอีกนิด" : "หันหน้าออกจากกล้องอีกนิด (ให้ได้ 45°)");
  }
  if (t.pitch !== undefined) {
    const d = cur.pitch - t.pitch;
    if (Math.abs(d) > TOL.pitch) add(Math.abs(d) / TOL.pitch, d > 0 ? "ให้ลูกค้าเงยหน้าขึ้นเล็กน้อย" : "ให้ลูกค้าก้มหน้าลงเล็กน้อย");
  }
  return { ok: hints.length === 0, hints: hints.slice(0, 2), off };
}

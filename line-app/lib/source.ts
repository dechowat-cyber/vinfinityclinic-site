import crypto from "node:crypto";
import { q, one } from "./db";

// FR-01: every CTA opens the LINE chat with a pre-filled message that carries a readable source tag.
// The webhook reads the tag from the first message and stamps it on the lead.
export const SOURCES: Record<string, string> = {
  gbp: "จาก Google",
  fb: "จาก Facebook",
  ig: "จาก Instagram",
  tt: "จาก TikTok",
  web: "จากเว็บไซต์",
  qr_store: "จากหน้าร้าน",
};

export const oaId = () => process.env.LINE_OA_ID || "@vinfinityclinic";

export function deepLink(src: string, refCode?: string, visitCode?: string) {
  const base = src === "ref" && refCode ? `รหัสแนะนำ ${refCode}` : SOURCES[src] || src;
  const tag = visitCode ? `${base} #${visitCode}` : base;
  const text = `สวัสดีค่ะ สนใจปรึกษาคุณหมอ (${tag})`;
  return `https://line.me/R/oaMessage/${encodeURIComponent(oaId())}/?${encodeURIComponent(text)}`;
}

/** Reads a source tag or referral code from a chat message. */
export function parseSource(text: string): { source?: string; refCode?: string; visitCode?: string } {
  const ref = /รหัสแนะนำ\s*([A-Z0-9]{5,8})/i.exec(text);
  if (ref) return { source: "ref", refCode: ref[1].toUpperCase() };
  const visitCode = /\(จาก[^)]*#([A-HJ-NP-Z2-9]{6})\)/.exec(text)?.[1];
  for (const [k, label] of Object.entries(SOURCES)) if (text.includes(`(${label})`) || text.includes(`(${label} #`)) return visitCode ? { source: k, visitCode } : { source: k };
  return {};
}

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newRefCode() {
  const b = crypto.randomBytes(5);
  return "V" + Array.from(b, (x) => ALPHA[x % ALPHA.length]).join("");
}

/** Gives a client a referral code (once). */
export async function ensureRefCode(clientId: number): Promise<string> {
  const c = await one<{ ref_code: string | null }>("select ref_code from clients where id = $1", [clientId]);
  if (c?.ref_code) return c.ref_code;
  for (let i = 0; i < 5; i++) {
    try {
      const r = await one<{ ref_code: string }>("update clients set ref_code = $2 where id = $1 and ref_code is null returning ref_code", [clientId, newRefCode()]);
      if (r) return r.ref_code;
      const again = await one<{ ref_code: string }>("select ref_code from clients where id = $1", [clientId]);
      if (again?.ref_code) return again.ref_code;
    } catch { /* code collision, retry */ }
  }
  throw new Error("ref_code");
}

/** FR-01/02: stamp source on the client and open lead; bind referrer (never self). */
export async function applySource(clientId: number, leadId: number, found: { source?: string; refCode?: string; visitCode?: string }) {
  if (!found.source) return null;
  if (found.visitCode) {
    const { linkVisit } = await import("./attribution");
    await linkVisit(found.visitCode, clientId, leadId);
  }
  await q("update clients set source = coalesce(source, $2) where id = $1", [clientId, found.source]);
  await q("update leads set source = coalesce(source, $2) where id = $1", [leadId, found.source]);
  if (found.refCode) {
    const ref = await one<{ id: number }>("select id from clients where ref_code = $1", [found.refCode]);
    if (ref && ref.id !== clientId) {
      await q("update clients set referred_by = coalesce(referred_by, $2) where id = $1", [clientId, ref.id]);
      await q("update leads set referred_by = coalesce(referred_by, $2) where id = $1", [leadId, ref.id]);
      return ref.id;
    }
  }
  return null;
}

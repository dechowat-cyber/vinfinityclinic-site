import crypto from "node:crypto";

// Personal booking links. Used when the Messaging API channel sits in a provider we cannot add
// a LIFF app to: the bot sends each customer a signed link instead of a LIFF URL.
const DAYS = 45;
const key = () => process.env.SESSION_SECRET || (process.env.VERCEL_ENV === "production" ? "" : "dev-only-secret");
const mac = (v: string) => crypto.createHmac("sha256", "link:" + key()).update(v).digest("base64url").slice(0, 32);

export function linkToken(userId: string, now = Date.now()) {
  const v = `${userId}.${Math.floor(now / 1000) + DAYS * 86400}`;
  return `${v}.${mac(v)}`;
}

export function readLinkToken(t: string | null | undefined, now = Date.now()): string | null {
  if (!t || !key()) return null;
  const parts = t.split(".");
  if (parts.length !== 3) return null;
  const [u, exp, sig] = parts;
  const want = mac(`${u}.${exp}`);
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  return Number(exp) * 1000 > now ? u : null;
}

export const useLiff = () => !!process.env.NEXT_PUBLIC_LIFF_ID;
export const addFriendUrl = () => `https://line.me/R/ti/p/${process.env.LINE_OA_ID || "@vinfinityclinic"}`;

/** URL of the booking page for this customer: LIFF when configured, otherwise a signed personal link. */
export function bookUrl(userId: string | null | undefined, params: Record<string, string> = {}) {
  const id = process.env.NEXT_PUBLIC_LIFF_ID;
  const p = new URLSearchParams(params);
  if (id) return `https://liff.line.me/${id}${p.size ? `?${p}` : ""}`;
  if (!userId) return addFriendUrl();
  p.set("t", linkToken(userId));
  return `${process.env.APP_URL || ""}/liff?${p}`;
}

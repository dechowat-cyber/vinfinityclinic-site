import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { one } from "./db";

const COOKIE = "vf_staff";
const MAX_AGE = 60 * 60 * 12; // one working day

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.VERCEL_ENV === "production") throw new Error("SESSION_SECRET missing");
  return s || "dev-only-secret";
}

export function sign(value: string) {
  const mac = crypto.createHmac("sha256", secret()).update(value).digest("base64url");
  return `${value}.${mac}`;
}

export function unsign(token: string | undefined | null) {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const value = token.slice(0, i);
  const a = Buffer.from(sign(value)), b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? value : null;
}

export function sessionCookie(staffId: number) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  return { name: COOKIE, value: sign(`${staffId}:${exp}`), httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: MAX_AGE };
}

export type Staff = { id: number; name: string; role: string; active: boolean; line_user_id: string; picture_url: string | null };
export const ROLES: Record<string, string> = { BM: "ผู้จัดการสาขา", AD: "แอดมินแชท", FD: "Front desk", CS: "ที่ปรึกษา", DR: "แพทย์", NS: "ผู้ช่วยแพทย์", MK: "Marketing" };

export async function currentStaff(): Promise<Staff | null> {
  const v = unsign((await cookies()).get(COOKIE)?.value);
  if (!v) return null;
  const [id, exp] = v.split(":").map(Number);
  if (!id || exp < Date.now() / 1000) return null;
  return one<Staff>("select * from staff where id = $1 and active", [id]);
}

/** Use at the top of every staff page / action. Redirects to sign-in when needed. */
export async function requireStaff(roles?: string[]) {
  const s = await currentStaff();
  if (!s) redirect("/staff/login");
  if (roles && !roles.includes(s.role)) redirect("/staff?denied=1");
  return s;
}

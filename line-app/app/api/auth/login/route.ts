import crypto from "node:crypto";
import { one } from "@/lib/db";
import { sessionCookie, sign } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = process.env.LINE_LOGIN_CHANNEL_ID;
  const base = process.env.APP_URL || url.origin;

  // Local development without a LINE Login channel: sign in as a test manager.
  if (!clientId) {
    if (process.env.VERCEL_ENV === "production") return new Response("LINE Login is not configured", { status: 500 });
    const s = await one<{ id: number }>(
      `insert into staff(line_user_id, name, role, active) values ('dev-bm', 'ทดสอบ BM', 'BM', true)
       on conflict (line_user_id) do update set active = true returning id`);
    const res = Response.redirect(`${base}/staff`, 302);
    const c = sessionCookie(s!.id);
    const headers = new Headers(res.headers);
    headers.append("Set-Cookie", `${c.name}=${c.value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${c.maxAge}`);
    return new Response(null, { status: 302, headers });
  }

  // signed + timestamped, so the callback can verify it even when LINE returns in another browser context (no cookie)
  const state = sign(`${crypto.randomBytes(12).toString("hex")}-${Math.floor(Date.now() / 1000)}`);
  const auth = new URL("https://access.line.me/oauth2/v2.1/authorize");
  auth.search = new URLSearchParams({
    response_type: "code", client_id: clientId, redirect_uri: `${base}/api/auth/callback`,
    state, scope: "openid profile", bot_prompt: "normal",
  }).toString();
  return new Response(null, { status: 302, headers: {
    Location: auth.toString(),
    "Set-Cookie": `vf_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
  } });
}

import { one } from "@/lib/db";
import { verifyIdToken } from "@/lib/line";
import { sessionCookie, unsign } from "@/lib/session";
import { notifyStaff } from "@/lib/notify";

function stateOk(state: string | null, cookie: string | undefined) {
  if (!state) return false;
  if (cookie && state === cookie) return true;
  const v = unsign(state);
  const ts = Number(v?.split("-")[1]);
  return !!ts && Date.now() / 1000 - ts < 900;
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = process.env.APP_URL || url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = /(?:^|;\s*)vf_state=([^;]+)/.exec(req.headers.get("cookie") || "")?.[1];
  if (url.searchParams.get("error")) {
    console.warn("[auth] LINE returned error", url.searchParams.get("error"), url.searchParams.get("error_description"));
    return Response.redirect(`${base}/staff/login?e=cancel`, 302);
  }
  if (!code || !stateOk(state, cookieState)) {
    console.warn("[auth] state rejected", { hasCode: !!code, hasCookie: !!cookieState });
    return Response.redirect(`${base}/staff/login?e=state`, 302);
  }

  const tok = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code", code, redirect_uri: `${base}/api/auth/callback`,
      client_id: (process.env.LINE_LOGIN_CHANNEL_ID || "").trim(), client_secret: (process.env.LINE_LOGIN_CHANNEL_SECRET || "").trim(),
    }),
  });
  const j: any = await tok.json().catch(() => ({}));
  if (!tok.ok) console.error("[auth] token exchange failed", tok.status, j.error, j.error_description);
  const who = j.id_token ? await verifyIdToken(j.id_token) : null;
  if (j.id_token && !who) console.error("[auth] id_token verify failed");
  if (!who) return Response.redirect(`${base}/staff/login?e=login`, 302);

  // The very first person to sign in becomes the branch manager (BM). Everyone after
  // that waits for a BM to approve them on the Team page.
  const any = await one<{ n: number }>("select count(*)::int as n from staff where active");
  const first = (any?.n ?? 0) === 0;
  const s = await one<{ id: number; active: boolean }>(
    `insert into staff(line_user_id, name, picture_url, role, active) values ($1,$2,$3,$4,$5)
     on conflict (line_user_id) do update set name = excluded.name, picture_url = excluded.picture_url
     returning id, active`,
    [who.sub, who.name ?? null, who.picture ?? null, first ? "BM" : "AD", first]);
  if (!s!.active) {
    console.info("[auth] pending approval", s!.id);
    await notifyStaff(`👤 ${who.name ?? "พนักงานใหม่"} ขอเข้าใช้ระบบหน้าร้าน\nผู้จัดการสาขากดอนุมัติได้ที่ ${base}/staff/team`, `staff-pending:${s!.id}`).catch(() => {});
    return Response.redirect(`${base}/staff/login?e=pending&n=${encodeURIComponent((who.name ?? "").slice(0, 40))}`, 302);
  }
  console.info("[auth] signed in", s!.id);

  const c = sessionCookie(s!.id);
  return new Response(null, { status: 302, headers: [
    ["Location", `${base}/staff`],
    ["Set-Cookie", `${c.name}=${c.value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${c.maxAge}`],
    ["Set-Cookie", "vf_state=; Path=/; Max-Age=0"],
  ] });
}

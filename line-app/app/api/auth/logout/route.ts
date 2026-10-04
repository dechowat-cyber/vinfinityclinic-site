export async function GET(req: Request) {
  const base = process.env.APP_URL || new URL(req.url).origin;
  return new Response(null, { status: 302, headers: { Location: `${base}/staff/login`, "Set-Cookie": "vf_staff=; Path=/; Max-Age=0" } });
}

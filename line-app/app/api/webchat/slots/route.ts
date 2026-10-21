import { cors, freeDays } from "@/lib/webchat";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export async function OPTIONS(req: Request) { return new Response(null, { status: 204, headers: cors(req) }); }

/** GET ?from=YYYY-MM-DD → next open days with free consult times */
export async function GET(req: Request) {
  const h = cors(req);
  const from = new URL(req.url).searchParams.get("from");
  const days = await freeDays(await getSettings(), new Date(), from);
  return Response.json({ days }, { headers: { ...h, "Cache-Control": "no-store" } });
}

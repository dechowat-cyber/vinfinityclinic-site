import { verifySignature, reply } from "@/lib/line";
import { handleEvent } from "@/lib/webhook";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  if (!verifySignature(body, req.headers.get("x-line-signature"))) {
    return new Response("bad signature", { status: 401 });
  }
  const { events = [] } = JSON.parse(body || "{}");
  const s = await getSettings();
  for (const ev of events) {
    try {
      const out = await handleEvent(ev, new Date(), s);
      if (out?.replyToken && out.messages.length) await reply(out.replyToken, out.messages);
    } catch (e) {
      // Never fail the whole batch: LINE would retry and duplicate replies. Log and continue.
      console.error("[webhook] event failed", ev?.type, e);
    }
  }
  return Response.json({ ok: true });
}

export async function GET() {
  return Response.json({ ok: true, service: "vinfinity-line webhook" });
}

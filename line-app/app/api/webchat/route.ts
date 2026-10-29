import { cors, allow, knowledge, kbFor, systemPrompt, complete, parseReply } from "@/lib/webchat";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function OPTIONS(req: Request) { return new Response(null, { status: 204, headers: cors(req) }); }

/** POST { messages: [{ role, content }] } → { reply, book: null | { date } } */
export async function POST(req: Request) {
  const h = cors(req);
  if (!("Access-Control-Allow-Origin" in h)) return Response.json({ error: "origin" }, { status: 403 });
  let body: any;
  try { body = await req.json(); } catch { return Response.json({ error: "bad_json" }, { status: 400, headers: h }); }
  const msgs = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string" && m.content.trim())
    .slice(-12).map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 1000) }));
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return Response.json({ error: "no_message" }, { status: 400, headers: h });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "0";
  if (!(await allow(ip).catch(() => true))) return Response.json({ reply: "วันนี้คุยกันเยอะแล้ว ทัก LINE @vinfinityclinic ต่อได้เลยนะคะ ทีมงานตอบให้ค่ะ", book: null, limited: true }, { headers: h });
  try {
    const s = await getSettings();
    const recent = msgs.filter((m: any) => m.role === "user").slice(-3).map((m: any) => m.content).join(" ");
    const text = await complete(systemPrompt(kbFor(await knowledge(), recent), s), msgs);
    return Response.json(parseReply(text), { headers: { ...h, "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[webchat]", e);
    return Response.json({ reply: "ขอโทษค่ะ ตอนนี้น้องวินตอบไม่ได้ชั่วคราว ทัก LINE @vinfinityclinic หรือโทร 082-462-2963 ได้เลยค่ะ", book: null, error: true }, { headers: h });
  }
}

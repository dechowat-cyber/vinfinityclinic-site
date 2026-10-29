// One way to call the model for every feature (web chat, sales-form photos, transfer slips).
// ANTHROPIC_API_KEY → Anthropic API directly (with prompt caching on the system text);
// otherwise Vercel AI Gateway (OIDC on Vercel, or AI_GATEWAY_API_KEY), which needs a card on the Vercel team.

export type AiImage = { data: Buffer; mime: string };
export type AiMsg = { role: "user" | "assistant"; content: string };
export class AiUnavailable extends Error { constructor(m: string) { super(m); this.name = "AiUnavailable"; } }

export const aiConfigured = () => !!(process.env.ANTHROPIC_API_KEY || process.env.AI_GATEWAY_API_KEY || process.env.VERCEL);

export async function askAI(o: { system?: string; messages: AiMsg[]; images?: AiImage[]; maxTokens?: number; temperature?: number; fast?: boolean }): Promise<string> {
  const imgs = o.images ?? [];
  const last = o.messages.length - 1;
  if (process.env.ANTHROPIC_API_KEY) {
    const model = o.fast ? (process.env.WEBCHAT_MODEL_DIRECT || "claude-haiku-4-5") : (process.env.VISION_MODEL_DIRECT || "claude-sonnet-5-5");
    const messages = o.messages.map((m, i) => ({ role: m.role, content: i === last && imgs.length
      ? [...imgs.map((x) => ({ type: "image", source: { type: "base64", media_type: x.mime, data: x.data.toString("base64") } })), { type: "text", text: m.content }]
      : m.content }));
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: o.maxTokens ?? 1500, ...(/haiku-4/.test(model) ? { temperature: o.temperature ?? 0 } : {}), // newer models reject temperature
        ...(o.system ? { system: [{ type: "text", text: o.system, cache_control: { type: "ephemeral" } }] } : {}), messages }),
    });
    if (res.status === 401 || res.status === 403) throw new AiUnavailable(`anthropic ${res.status}`);
    if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const j = await res.json();
    return String((j.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("")).trim();
  }
  const { getVercelOidcToken } = await import("@vercel/oidc");
  const token = process.env.AI_GATEWAY_API_KEY || (await getVercelOidcToken().catch(() => ""));
  if (!token) throw new AiUnavailable("no_ai_credentials");
  const model = o.fast ? (process.env.WEBCHAT_MODEL || "anthropic/claude-haiku-4.5") : (process.env.FORM_READER_MODEL || "anthropic/claude-sonnet-5.5");
  const messages = [...(o.system ? [{ role: "system", content: o.system }] : []), ...o.messages.map((m, i) => ({ role: m.role, content: i === last && imgs.length
    ? [{ type: "text", text: m.content }, ...imgs.map((x) => ({ type: "image_url", image_url: { url: `data:${x.mime};base64,${x.data.toString("base64")}` } }))]
    : m.content }))];
  const res = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ model, ...(/haiku-4/.test(model) ? { temperature: o.temperature ?? 0 } : {}), max_tokens: o.maxTokens ?? 1500, messages }),
  });
  const body = res.ok ? null : await res.text();
  if (res.status === 401 || res.status === 403) throw new AiUnavailable(`gateway ${res.status}: ${body!.slice(0, 160)}`);
  if (!res.ok) throw new Error(`gateway ${res.status}: ${body!.slice(0, 200)}`);
  const j = await res.json();
  return String(j.choices?.[0]?.message?.content ?? "").trim();
}

/** First JSON object in a model reply. */
export function jsonIn(text: string): any {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

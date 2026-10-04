import { q, one } from "./db";

export type Client = {
  id: number; line_user_id: string | null; display_name: string | null; name: string | null;
  phone: string | null; branch: string; language: string; source: string | null; followed: boolean;
};

export async function upsertClientByLine(lineUserId: string, profile: { displayName?: string; pictureUrl?: string } = {}, source?: string) {
  const row = await one<Client>(
    `insert into clients(line_user_id, display_name, picture_url, source)
     values ($1, $2, $3, $4)
     on conflict (line_user_id) do update set
       display_name = coalesce(excluded.display_name, clients.display_name),
       picture_url = coalesce(excluded.picture_url, clients.picture_url),
       source = coalesce(clients.source, excluded.source),
       followed = true
     returning *`,
    [lineUserId, profile.displayName ?? null, profile.pictureUrl ?? null, source ?? null],
  );
  return row!;
}

export async function getClientByLine(lineUserId: string) {
  return one<Client>("select * from clients where line_user_id = $1", [lineUserId]);
}

/** Returns the client's open lead, creating one (status New) if there is none. */
export async function ensureLead(clientId: number, source?: string | null, interest?: string | null) {
  const open = await one<{ id: number }>(
    "select id from leads where client_id = $1 and status not in ('Lost','Consult-Booked') order by id desc limit 1", [clientId]);
  if (open) {
    if (interest) await q("update leads set interest = coalesce(interest, $2) where id = $1", [open.id, interest]);
    return open.id as number;
  }
  const row = await one<{ id: number }>(
    "insert into leads(client_id, source, interest) values ($1, $2, $3) returning id", [clientId, source ?? null, interest ?? null]);
  return row!.id as number;
}

export async function logTouch(clientId: number | null, direction: "in" | "out", kind: string, body?: string | null, channel = "line") {
  await q("insert into touchpoints(client_id, channel, direction, kind, body) values ($1,$2,$3,$4,$5)",
    [clientId, channel, direction, kind, body ? body.slice(0, 2000) : null]);
}

export async function markInbound(clientId: number) {
  const leadId = await ensureLead(clientId);
  await q(`update leads set last_inbound_at = now(), first_inbound_at = coalesce(first_inbound_at, now()), replied_at = null
           where id = $1`, [leadId]);
  return leadId;
}

export async function recordConsent(clientId: number, type: "data" | "marketing", granted: boolean, version: string, channel = "line") {
  await q("insert into consents(client_id, type, version, granted, channel) values ($1,$2,$3,$4,$5)",
    [clientId, type, version, granted, channel]);
}

/** Latest decision per consent type; absent = never asked. */
export async function consentState(clientId: number) {
  const rows = await q<{ type: string; granted: boolean }>(
    `select distinct on (type) type, granted from consents where client_id = $1 order by type, created_at desc, id desc`, [clientId]);
  const s: Record<string, boolean | undefined> = {};
  for (const r of rows) s[r.type] = r.granted;
  return { data: s.data, marketing: s.marketing };
}

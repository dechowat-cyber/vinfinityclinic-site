import { getSettings } from "@/lib/settings";
import { availableSlots } from "@/lib/booking";
import { addDays, todayBkk } from "@/lib/time";

export const dynamic = "force-dynamic";

/** GET /api/liff/slots?date=YYYY-MM-DD  or  ?days=14 for a per-day summary */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const s = await getSettings();
  const date = u.searchParams.get("date");
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "bad_date" }, { status: 400 });
    return Response.json({ date, slots: await availableSlots(date, s) });
  }
  const days = Math.min(Number(u.searchParams.get("days") || 14), s.horizonDays);
  const today = todayBkk();
  const out = [];
  for (let i = 0; i <= days; i++) {
    const d = addDays(today, i);
    const slots = await availableSlots(d, s);
    out.push({ date: d, open: slots.length > 0, free: slots.filter((x) => x.available).length });
  }
  return Response.json({ days: out, doctor: s.doctors[0] });
}

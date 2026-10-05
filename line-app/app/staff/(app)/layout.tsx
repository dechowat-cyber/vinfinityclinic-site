import { requireStaff, ROLES } from "@/lib/session";
import { q } from "@/lib/db";
import { HEALTH_ROLES } from "@/lib/health";
import { bkk, todayBkk, addDays } from "@/lib/time";
import { Nav } from "./nav";

export const dynamic = "force-dynamic";

/** Counts behind the menu badges: what is waiting for someone right now. */
async function counts(clinical: boolean) {
  const today = todayBkk();
  const from = bkk(today, "00:00").toISOString(), to = bkk(addDays(today, 1), "00:00").toISOString();
  const [r] = await q(`select
      (select count(*)::int from leads where status in ('New','Contacted','Qualified') and (replied_at is null or replied_at < last_inbound_at)) as leads,
      (select count(*)::int from care_requests where status in ('waiting_photo','waiting_review')) as care,
      (select count(*)::int from recalls where status in ('due','sent','contacted') and due_on <= $3::date and due_on > ($3::date - 67)) as recall,
      (select count(*)::int from appointments a where a.start_at >= $1 and a.start_at < $2 and a.status in ('arrived','in_consult')
         and not exists (select 1 from photo_sessions s where s.client_id = a.client_id and s.kind = 'before' and s.created_at >= $1)) as photos,
      (select count(*)::int from staff where not active and role <> 'OFF') as team`,
    [from, to, addDays(today, 7)]);
  return { ...r, photos: clinical ? r.photos : 0 } as Record<string, number>;
}

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const me = await requireStaff();
  const c = await counts(HEALTH_ROLES.includes(me.role)).catch(() => ({}));
  return (
    <div className="staff">
      <Nav name={me.name || "พนักงาน"} role={me.role} roleLabel={ROLES[me.role] || me.role} counts={c} />
      <main className="main">{children}</main>
    </div>
  );
}

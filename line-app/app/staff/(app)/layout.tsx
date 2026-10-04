import { requireStaff, ROLES } from "@/lib/session";
import { Nav } from "./nav";

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const me = await requireStaff();
  return (
    <div className="staff">
      <Nav name={me.name || "พนักงาน"} role={me.role} roleLabel={ROLES[me.role] || me.role} />
      <main className="main">{children}</main>
    </div>
  );
}

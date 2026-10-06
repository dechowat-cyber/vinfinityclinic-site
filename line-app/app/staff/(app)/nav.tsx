"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";

const CLINICAL = ["BM", "DR", "NS", "CS"];
type Item = { href: string; label: string; icon: IconName; roles?: string[]; badge?: string; primary?: boolean };
const GROUPS: { title: string; items: Item[] }[] = [
  { title: "งานวันนี้", items: [
    { href: "/staff", label: "วันนี้", icon: "today" },
    { href: "/staff/photos", label: "Photo Studio", icon: "camera", roles: CLINICAL, badge: "photos", primary: true },
    { href: "/staff/leads", label: "แชท / Leads", icon: "chat", badge: "leads" },
    { href: "/staff/appointments", label: "นัดหมาย", icon: "calendar" },
  ] },
  { title: "ลูกค้า", items: [
    { href: "/staff/clients", label: "ลูกค้า", icon: "users" },
    { href: "/staff/care", label: "ดูแลหลังทำ", icon: "heart", badge: "care" },
    { href: "/staff/face-reports", label: "Face Report", icon: "target", roles: CLINICAL, badge: "fr" },
    { href: "/staff/recall", label: "กลับมาทำซ้ำ", icon: "repeat", badge: "recall" },
  ] },
  { title: "ธุรกิจ", items: [
    { href: "/staff/finance", label: "การเงิน / ปิดยอด", icon: "wallet", roles: ["BM", "FD", "CS"], badge: "slips" },
    { href: "/staff/reports", label: "รายงาน", icon: "chart", roles: ["BM", "MK"] },
    { href: "/staff/loyalty", label: "Circle · โปรลับ", icon: "star", roles: ["BM", "MK"] },
    { href: "/staff/segments", label: "กลุ่มลูกค้า / แคมเปญ", icon: "target", roles: ["BM", "MK"] },
    { href: "/staff/catalog", label: "ราคากลาง", icon: "tag" },
    { href: "/staff/links", label: "ลิงก์ช่องทาง", icon: "link" },
  ] },
  { title: "ตั้งค่า", items: [
    { href: "/staff/aftercare", label: "ข้อความหลังทำ", icon: "message" },
    { href: "/staff/settings", label: "ตั้งค่า", icon: "gear", roles: ["BM"] },
    { href: "/staff/team", label: "ทีม", icon: "team", roles: ["BM"], badge: "team" },
  ] },
];

export function Nav({ name, role, roleLabel, counts }: { name: string; role: string; roleLabel: string; counts: Record<string, number> }) {
  const path = usePathname();
  const active = (h: string) => (h === "/staff" ? path === h : path.startsWith(h));
  return (
    <nav className="side" aria-label="เมนูพนักงาน">
      <Link href="/staff" className="brand-lockup" aria-label="Vinfinity Clinic · หน้าแรก">
        <img src="/brand/mark.svg" alt="" width={30} height={31} />
        <span><b>VINFINITY</b><small>CLINIC · STAFF</small></span>
      </Link>
      {GROUPS.map((g) => {
        const items = g.items.filter((l) => !l.roles || l.roles.includes(role));
        if (!items.length) return null;
        return (
          <div key={g.title} className="group">
            <div className="group-title">{g.title}</div>
            {items.map((l) => {
              const n = l.badge ? counts[l.badge] ?? 0 : 0;
              return (
                <Link key={l.href} href={l.href} className={l.primary ? "primary" : undefined} aria-current={active(l.href) ? "page" : undefined}>
                  <Icon name={l.icon} /><span>{l.label}</span>{n > 0 && <em className="badge" aria-label={`${n} รายการรอ`}>{n > 99 ? "99+" : n}</em>}
                </Link>);
            })}
          </div>);
      })}
      <div className="me"><b>{name}</b><small>{roleLabel}</small><a href="/api/auth/logout">ออกจากระบบ</a></div>
    </nav>
  );
}

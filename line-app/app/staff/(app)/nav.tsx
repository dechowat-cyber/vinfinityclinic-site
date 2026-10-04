"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/staff", label: "วันนี้" },
  { href: "/staff/leads", label: "Leads / แชท" },
  { href: "/staff/appointments", label: "นัดหมาย" },
  { href: "/staff/settings", label: "ตั้งค่า", bm: true },
  { href: "/staff/team", label: "ทีม", bm: true },
];

export function Nav({ name, role, roleLabel }: { name: string; role: string; roleLabel: string }) {
  const path = usePathname();
  return (
    <nav className="side" aria-label="เมนูพนักงาน">
      <div className="brand">VINFINITY</div>
      {LINKS.filter((l) => !l.bm || role === "BM").map((l) => (
        <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>{l.label}</Link>
      ))}
      <div className="me">{name} · {roleLabel}<br /><a href="/api/auth/logout" style={{ padding: 0 }}>ออกจากระบบ</a></div>
    </nav>
  );
}

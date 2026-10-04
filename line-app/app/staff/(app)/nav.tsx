"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/staff", label: "วันนี้" },
  { href: "/staff/leads", label: "Leads / แชท" },
  { href: "/staff/appointments", label: "นัดหมาย" },
  { href: "/staff/clients", label: "ลูกค้า" },
  { href: "/staff/care", label: "ดูแลหลังทำ" },
  { href: "/staff/links", label: "ลิงก์ช่องทาง" },
  { href: "/staff/catalog", label: "ราคากลาง" },
  { href: "/staff/aftercare", label: "ข้อความหลังทำ" },
  { href: "/staff/settings", label: "ตั้งค่า", bm: true },
  { href: "/staff/team", label: "ทีม", bm: true },
];

export function Nav({ name, role, roleLabel }: { name: string; role: string; roleLabel: string }) {
  const path = usePathname();
  return (
    <nav className="side" aria-label="เมนูพนักงาน">
      <div className="brand">VINFINITY</div>
      {LINKS.filter((l) => !l.bm || role === "BM").map((l) => (
        <Link key={l.href} href={l.href} aria-current={(l.href === "/staff" ? path === l.href : path.startsWith(l.href)) ? "page" : undefined}>{l.label}</Link>
      ))}
      <div className="me">{name} · {roleLabel}<br /><a href="/api/auth/logout" style={{ padding: 0 }}>ออกจากระบบ</a></div>
    </nav>
  );
}

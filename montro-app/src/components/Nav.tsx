"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS: { href: string; label: string; icon: string }[] = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/inventory", label: "Inventory", icon: "💎" },
  { href: "/sales", label: "Sales", icon: "🧾" },
  { href: "/partners", label: "Partners", icon: "🤝" },
  { href: "/m/expenses", label: "Expenses", icon: "💷" },
  { href: "/m/building", label: "Building & Setup", icon: "🏗️" },
  { href: "/m/movements", label: "Stock Movement", icon: "📦" },
  { href: "/m/stocktake", label: "Stock Take", icon: "✅" },
  { href: "/m/suppliers", label: "Suppliers", icon: "🏭" },
  { href: "/m/customers", label: "Customers", icon: "👤" },
  { href: "/m/staff", label: "Staff", icon: "👥" },
  { href: "/m/returns", label: "Returns", icon: "↩️" },
  { href: "/audit", label: "Audit Log", icon: "🕑" },
];

// primary items shown in the phone bottom bar
const BOTTOM = ["/", "/inventory", "/sales", "/partners"];

export function Sidebar({ email, role }: { email: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <aside className="sidebar">
      <div style={{ padding: "1.1rem 1rem", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
        <div style={{ fontWeight: 800, letterSpacing: ".06em", color: "#fff" }}>MONTRO</div>
        <div style={{ fontSize: ".72rem", color: "var(--gold)" }}>Shop Manager</div>
      </div>
      <nav style={{ padding: ".5rem", flex: 1, overflowY: "auto" }}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={"navlink" + (active(l.href) ? " navlink-active" : "")}>
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
      <div style={{ padding: ".8rem 1rem", borderTop: "1px solid rgba(255,255,255,.1)", fontSize: ".75rem", color: "#cfd4df" }}>
        <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>
        <div style={{ color: "var(--gold)", textTransform: "capitalize" }}>{role}</div>
        <button onClick={signOut} className="btn-ghost" style={{ marginTop: ".5rem", color: "#fff", borderColor: "rgba(255,255,255,.25)", width: "100%", padding: ".4rem", borderRadius: 8, background: "transparent" }}>
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function BottomBar() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const items = LINKS.filter((l) => BOTTOM.includes(l.href));
  return (
    <nav className="bottombar">
      {items.map((l) => (
        <Link key={l.href} href={l.href} className={"bottomlink" + (active(l.href) ? " bottomlink-active" : "")}>
          <span style={{ fontSize: "1.1rem" }}>{l.icon}</span>
          <span style={{ fontSize: ".65rem" }}>{l.label}</span>
        </Link>
      ))}
      <Link href="/more" className={"bottomlink" + (active("/more") ? " bottomlink-active" : "")}>
        <span style={{ fontSize: "1.1rem" }}>⋯</span>
        <span style={{ fontSize: ".65rem" }}>More</span>
      </Link>
    </nav>
  );
}

export { LINKS };

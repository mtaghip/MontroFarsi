import Link from "next/link";

const LINKS = [
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

export default function More() {
  return (
    <div>
      <div className="page-h"><h1>All sections</h1></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="card" style={{ padding: "1rem", textDecoration: "none", color: "var(--navy)", display: "flex", alignItems: "center", gap: ".6rem", fontWeight: 600 }}>
            <span style={{ fontSize: "1.3rem" }}>{l.icon}</span>{l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

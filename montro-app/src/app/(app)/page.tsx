import { createClient } from "@/lib/supabase/server";
import { gbp, num } from "@/lib/format";
import { MonthlyChart, CategoryBar, SharePie } from "@/components/DashboardCharts";
import { CATEGORIES, PARTNERS } from "@/lib/constants";

export const dynamic = "force-dynamic";

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "red" | "gold" }) {
  return (
    <div className="card kpi">
      <div className="k-label">{label}</div>
      <div className="k-value" style={tone === "red" ? { color: "var(--red)" } : tone === "gold" ? { color: "var(--gold)" } : undefined}>{value}</div>
      {sub && <div className="k-sub">{sub}</div>}
    </div>
  );
}

export default async function Dashboard() {
  const supabase = await createClient();
  const [{ data: inv }, { data: sales }, { data: pc }, { data: exp }] = await Promise.all([
    supabase.from("inventory").select("stock_status,category,total_landed_cost,target_price,advertised_price,min_price,serial_number,location,date_sold,photo_url"),
    supabase.from("sales").select("sale_date,selling_price,gross_profit,category,salesperson"),
    supabase.from("partner_contributions").select("partner,amount,reimbursed_amount"),
    supabase.from("expenses").select("expense_date,gross_amount"),
  ]);

  const items = inv ?? [];
  const sl = sales ?? [];
  const contribs = pc ?? [];
  const expenses = exp ?? [];

  const now = new Date();
  const yStart = new Date(now.getFullYear(), 0, 1);
  const mStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const unsold = items.filter((i) => i.stock_status !== "Sold" && i.stock_status !== "Written Off");
  const stockCost = unsold.reduce((a, i) => a + (Number(i.total_landed_cost) || 0), 0);
  const retail = unsold.reduce((a, i) => a + (Number(i.target_price) || 0), 0);

  const sumBy = (arr: typeof sl, field: "selling_price" | "gross_profit", from: Date) =>
    arr.filter((s) => s.sale_date && new Date(s.sale_date) >= from).reduce((a, s) => a + (Number(s[field]) || 0), 0);

  const salesYear = sumBy(sl, "selling_price", yStart);
  const salesMonth = sumBy(sl, "selling_price", mStart);
  const gpYear = sumBy(sl, "gross_profit", yStart);
  const gpMonth = sumBy(sl, "gross_profit", mStart);
  const expYear = expenses.filter((e) => e.expense_date && new Date(e.expense_date) >= yStart).reduce((a, e) => a + (Number(e.gross_amount) || 0), 0);
  const netYear = gpYear - expYear;

  // partner balances
  const owed = (p: string) =>
    contribs.filter((c) => c.partner === p).reduce((a, c) => a + ((Number(c.amount) || 0) - (Number(c.reimbursed_amount) || 0)), 0);
  const totalOwed = PARTNERS.reduce((a, p) => a + owed(p), 0);

  // warnings
  const belowMin = items.filter((i) => i.advertised_price != null && i.min_price != null && Number(i.advertised_price) < Number(i.min_price)).length;
  const missing = items.filter((i) => i.stock_status === "Lost/Missing").length;
  const outside = unsold.filter((i) => !["Shop Display", "Shop Safe", "Office"].includes(i.location ?? "")).length;
  const noSerial = items.filter((i) => i.category === "Watch" && !i.serial_number).length;

  // monthly series
  const months = Array.from({ length: 12 }, (_, m) => {
    const from = new Date(now.getFullYear(), m, 1);
    const to = new Date(now.getFullYear(), m + 1, 1);
    const inMo = sl.filter((s) => s.sale_date && new Date(s.sale_date) >= from && new Date(s.sale_date) < to);
    return {
      month: from.toLocaleDateString("en-GB", { month: "short" }),
      sales: inMo.reduce((a, s) => a + (Number(s.selling_price) || 0), 0),
      profit: inMo.reduce((a, s) => a + (Number(s.gross_profit) || 0), 0),
    };
  });

  const stockByCat = CATEGORIES.map((c) => ({
    name: c,
    value: unsold.filter((i) => i.category === c).reduce((a, i) => a + (Number(i.total_landed_cost) || 0), 0),
  })).filter((d) => d.value > 0);

  const partnerShare = PARTNERS.map((p) => ({ name: p, value: owed(p) }));

  return (
    <div>
      <div className="page-h"><h1>Dashboard</h1></div>

      <div className="kpis">
        <Kpi label="Stock items" value={num(items.length)} sub={`${unsold.length} in stock`} />
        <Kpi label="Stock at cost" value={gbp(stockCost)} />
        <Kpi label="Retail value" value={gbp(retail)} />
        <Kpi label="Potential profit" value={gbp(retail - stockCost)} tone="gold" />
        <Kpi label="Sales this month" value={gbp(salesMonth)} />
        <Kpi label="Sales this year" value={gbp(salesYear)} />
        <Kpi label="Gross profit (month)" value={gbp(gpMonth)} />
        <Kpi label="Gross profit (year)" value={gbp(gpYear)} tone="gold" />
        <Kpi label="Expenses (year)" value={gbp(expYear)} />
        <Kpi label="Net trading (year)" value={gbp(netYear)} tone={netYear < 0 ? "red" : undefined} />
        <Kpi label="Owed to partners" value={gbp(totalOwed)} tone="gold" />
        <Kpi label="Items outside shop" value={num(outside)} tone={outside > 0 ? "red" : undefined} />
      </div>

      <h2 style={{ margin: "1.4rem 0 .6rem", color: "var(--navy)", fontSize: "1rem" }}>⚠ Warnings</h2>
      <div className="kpis">
        <Kpi label="Below min price" value={num(belowMin)} tone={belowMin ? "red" : undefined} />
        <Kpi label="Missing / lost" value={num(missing)} tone={missing ? "red" : undefined} />
        <Kpi label="Watches w/o serial" value={num(noSerial)} tone={noSerial ? "red" : undefined} />
        <Kpi label="Items outside shop" value={num(outside)} tone={outside ? "red" : undefined} />
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr", marginTop: "1.4rem" }}>
        <div className="card" style={{ padding: "1rem" }}>
          <h3 style={{ color: "var(--navy)", fontSize: ".95rem", marginBottom: ".6rem" }}>Monthly sales &amp; gross profit</h3>
          <MonthlyChart data={months} />
        </div>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr" }} className="two-col">
          <div className="card" style={{ padding: "1rem" }}>
            <h3 style={{ color: "var(--navy)", fontSize: ".95rem", marginBottom: ".6rem" }}>Stock value by category</h3>
            {stockByCat.length ? <CategoryBar data={stockByCat} /> : <p className="muted">No stock yet.</p>}
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <h3 style={{ color: "var(--navy)", fontSize: ".95rem", marginBottom: ".6rem" }}>Owed to each partner</h3>
            {totalOwed > 0 ? <SharePie data={partnerShare} /> : <p className="muted">Nothing outstanding.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

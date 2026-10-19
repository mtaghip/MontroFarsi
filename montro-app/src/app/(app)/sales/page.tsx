import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { gbp, ukDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Sales() {
  const supabase = await createClient();
  const { data } = await supabase.from("sales").select("*").order("sale_date", { ascending: false });
  const rows = data ?? [];
  return (
    <div>
      <div className="page-h">
        <h1>Sales</h1>
        <Link href="/sales/new" className="btn btn-gold">+ Record sale</Link>
      </div>
      <div className="card table-wrap">
        <table className="grid">
          <thead>
            <tr><th>Date</th><th>Sale ID</th><th>Item</th><th>Salesperson</th><th>Sold for</th><th>Cost</th><th>Gross profit</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{ukDate(r.sale_date)}</td>
                <td>{r.sale_id}</td>
                <td>{r.item_desc}</td>
                <td>{r.salesperson}</td>
                <td>{gbp(r.selling_price)}</td>
                <td>{gbp(r.cost_price)}</td>
                <td style={{ color: Number(r.gross_profit) < 0 ? "var(--red)" : "var(--green)", fontWeight: 600 }}>{gbp(r.gross_profit)}</td>
                <td>{r.payment_status}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="muted" style={{ textAlign: "center", padding: "1.5rem" }}>No sales yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

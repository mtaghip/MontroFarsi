import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { gbp, ukDate } from "@/lib/format";
import { PARTNERS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function Partners() {
  const supabase = await createClient();
  const { data } = await supabase.from("partner_contributions").select("*").order("txn_date", { ascending: false });
  const rows = data ?? [];

  const sum = (p: string, field: "amount" | "reimbursed_amount") =>
    rows.filter((r) => r.partner === p).reduce((a, r) => a + (Number(r[field]) || 0), 0);

  return (
    <div>
      <div className="page-h">
        <h1>Partners</h1>
        <Link href="/m/partnercontrib/new" className="btn btn-gold">+ Add contribution</Link>
      </div>

      <div className="kpis" style={{ gridTemplateColumns: "1fr", gap: ".7rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: ".7rem" }}>
          {PARTNERS.map((p) => {
            const intro = sum(p, "amount");
            const reimb = sum(p, "reimbursed_amount");
            return (
              <div key={p} className="card kpi">
                <div className="k-label">{p}</div>
                <div className="k-value" style={{ color: "var(--gold)" }}>{gbp(intro - reimb)}</div>
                <div className="k-sub">Introduced {gbp(intro)} · Reimbursed {gbp(reimb)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="muted" style={{ fontSize: ".8rem", margin: ".8rem 0" }}>
        “Owed” = money a partner introduced minus what the business has repaid. Paying for stock does not mean owning it.
      </p>

      <div className="card table-wrap">
        <table className="grid">
          <thead>
            <tr><th>Date</th><th>Partner</th><th>Type</th><th>Description</th><th>Amount</th><th>Reimbursed</th><th>Outstanding</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{ukDate(r.txn_date)}</td>
                <td>{r.partner}</td>
                <td>{r.txn_type}</td>
                <td>{r.description}</td>
                <td>{gbp(r.amount)}</td>
                <td>{gbp(r.reimbursed_amount)}</td>
                <td>{gbp((Number(r.amount) || 0) - (Number(r.reimbursed_amount) || 0))}</td>
                <td><Link href={`/m/partnercontrib/${r.id}`} style={{ color: "var(--gold)", fontWeight: 600 }}>Edit</Link></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="muted" style={{ textAlign: "center", padding: "1.5rem" }}>No contributions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

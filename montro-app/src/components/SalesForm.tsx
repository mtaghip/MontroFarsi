"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { nextSeq, gbp } from "@/lib/format";
import { PAYMENT_METHODS, PAYMENT_STATUS, VAT_TREATMENT } from "@/lib/constants";

type Row = Record<string, any>;

export default function SalesForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [stock, setStock] = useState<Row[]>([]);
  const [staff, setStaff] = useState<string[]>([]);
  const [f, setF] = useState<Row>({
    sale_date: new Date().toISOString().slice(0, 10),
    sale_id: "", stock_id: "", selling_price: "", deposit: "", balance: "",
    payment_status: "Paid", payment_method: "Bank Transfer",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: inv }, { data: sales }, { data: st }] = await Promise.all([
        supabase.from("inventory").select("stock_id,description,brand,model,category,total_landed_cost,advertised_price,min_price,stock_status").neq("stock_status", "Sold").order("stock_id"),
        supabase.from("sales").select("sale_id"),
        supabase.from("staff").select("name").eq("active", true),
      ]);
      setStock(inv ?? []);
      setStaff((st ?? []).map((s) => s.name));
      setF((p) => ({ ...p, sale_id: nextSeq("SALE", (sales ?? []).map((s) => s.sale_id)) }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const picked = stock.find((s) => s.stock_id === f.stock_id);
  const cost = Number(picked?.total_landed_cost) || 0;
  const sell = Number(f.selling_price) || 0;
  const gp = sell - cost;
  const belowMin = picked?.min_price != null && sell > 0 && sell < Number(picked.min_price);

  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!picked) { setErr("Choose a stock item."); return; }
    setBusy(true); setErr(null);
    const payload: Row = {
      sale_id: f.sale_id, sale_date: f.sale_date, stock_id: f.stock_id,
      item_desc: [picked.brand, picked.model].filter(Boolean).join(" ") || picked.description,
      category: picked.category, salesperson: f.salesperson || null, customer_ref: f.customer_ref || null,
      invoice_number: f.invoice_number || null, cost_price: cost,
      advertised_price: picked.advertised_price ?? null, selling_price: sell,
      vat_treatment: f.vat_treatment || null, payment_method: f.payment_method || null,
      deposit: Number(f.deposit) || 0, balance: Number(f.balance) || 0,
      payment_status: f.payment_status || null, notes: f.notes || null,
    };
    const { error: e1 } = await supabase.from("sales").insert(payload);
    if (e1) { setBusy(false); setErr(e1.message); return; }
    // mark the item sold
    const { error: e2 } = await supabase.from("inventory").update({
      stock_status: "Sold", date_sold: f.sale_date, actual_sell_price: sell,
      salesperson: f.salesperson || null, customer_ref: f.customer_ref || null,
    }).eq("stock_id", f.stock_id);
    setBusy(false);
    if (e2) { setErr("Sale saved, but updating stock failed: " + e2.message); return; }
    router.push("/sales");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card" style={{ padding: "1.1rem" }}>
      {err && <p style={{ color: "var(--red)", marginBottom: ".8rem" }}>{err}</p>}
      <div className="form-grid">
        <div>
          <label className="label">Sale ID</label>
          <input className="input" value={f.sale_id} onChange={(e) => set("sale_id", e.target.value)} />
        </div>
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={f.sale_date} onChange={(e) => set("sale_date", e.target.value)} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="label">Item sold</label>
          <select className="select" value={f.stock_id} onChange={(e) => set("stock_id", e.target.value)} required>
            <option value="">— choose stock item —</option>
            {stock.map((s) => (
              <option key={s.stock_id} value={s.stock_id}>
                {s.stock_id} · {[s.brand, s.model].filter(Boolean).join(" ") || s.description}
              </option>
            ))}
          </select>
        </div>

        {picked && (
          <div className="card" style={{ gridColumn: "1 / -1", padding: ".7rem", background: "#faf9f6" }}>
            <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", fontSize: ".85rem" }}>
              <span>Cost: <b>{gbp(cost)}</b></span>
              <span>Advertised: <b>{gbp(picked.advertised_price)}</b></span>
              <span>Min: <b>{gbp(picked.min_price)}</b></span>
              <span>Gross profit: <b style={{ color: gp < 0 ? "var(--red)" : "var(--green)" }}>{gbp(gp)}</b></span>
            </div>
          </div>
        )}

        <div>
          <label className="label">Selling price (£)</label>
          <input className="input" type="number" step="0.01" value={f.selling_price} onChange={(e) => set("selling_price", e.target.value)} required />
          {belowMin && <p style={{ color: "var(--red)", fontSize: ".78rem", marginTop: ".3rem" }}>⚠ Below the minimum price for this item.</p>}
        </div>
        <div>
          <label className="label">Salesperson</label>
          <select className="select" value={f.salesperson || ""} onChange={(e) => set("salesperson", e.target.value)}>
            <option value="" />{staff.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div><label className="label">Customer name / ref</label><input className="input" value={f.customer_ref || ""} onChange={(e) => set("customer_ref", e.target.value)} /></div>
        <div><label className="label">Invoice number</label><input className="input" value={f.invoice_number || ""} onChange={(e) => set("invoice_number", e.target.value)} /></div>
        <div><label className="label">Deposit received (£)</label><input className="input" type="number" step="0.01" value={f.deposit} onChange={(e) => set("deposit", e.target.value)} /></div>
        <div><label className="label">Balance received (£)</label><input className="input" type="number" step="0.01" value={f.balance} onChange={(e) => set("balance", e.target.value)} /></div>
        <div>
          <label className="label">Payment status</label>
          <select className="select" value={f.payment_status} onChange={(e) => set("payment_status", e.target.value)}>{PAYMENT_STATUS.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <div>
          <label className="label">Payment method</label>
          <select className="select" value={f.payment_method} onChange={(e) => set("payment_method", e.target.value)}>{PAYMENT_METHODS.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <div>
          <label className="label">VAT treatment</label>
          <select className="select" value={f.vat_treatment || ""} onChange={(e) => set("vat_treatment", e.target.value)}><option value="" />{VAT_TREATMENT.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}><label className="label">Notes</label><textarea className="textarea" rows={2} value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} /></div>
      </div>
      <div style={{ display: "flex", gap: ".6rem", marginTop: "1.1rem" }}>
        <button className="btn btn-gold" disabled={busy}>{busy ? "Saving…" : "Record sale"}</button>
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}

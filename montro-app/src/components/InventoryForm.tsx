"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { nextStockId } from "@/lib/format";
import {
  CATEGORIES, SUBCATEGORIES, STOCK_STATUS, LOCATIONS, PAID_BY, FUNDING_TYPES,
  SUPPLIER_TYPES, CONDITIONS, METAL_PURITY, CURRENCIES, MOVEMENTS,
} from "@/lib/constants";

type Row = Record<string, any>;

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div style={full ? { gridColumn: "1 / -1" } : undefined}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export default function InventoryForm({ initial }: { initial?: Row }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const editing = !!initial?.id;
  const [f, setF] = useState<Row>(
    initial ?? {
      stock_id: "", category: "Watch", purchase_currency: "GBP", stock_status: "Available",
      location: "Shop Safe", box_included: false, papers_included: false, warranty_included: false,
      purchase_price: "", additional_costs: "", date_purchased: new Date().toISOString().slice(0, 10),
    }
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // suggest a stock id for new items
  useEffect(() => {
    if (editing || f.stock_id) return;
    (async () => {
      const { data } = await supabase.from("inventory").select("stock_id");
      const ids = (data ?? []).map((r) => r.stock_id as string);
      const prefix = f.category === "Watch" ? "WAT" : "JWL";
      setF((p) => ({ ...p, stock_id: nextStockId(prefix, ids) }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.category]);

  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${f.stock_id || "item"}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
    if (error) { setErr("Photo upload failed: " + error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    set("photo_url", data.publicUrl);
    setUploading(false);
  }

  const toNum = (v: any) => (v === "" || v == null ? null : Number(v));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const payload: Row = {
      ...f,
      weight_g: toNum(f.weight_g), stone_carat: toNum(f.stone_carat), watch_year: toNum(f.watch_year),
      purchase_price: toNum(f.purchase_price) ?? 0, additional_costs: toNum(f.additional_costs) ?? 0,
      target_price: toNum(f.target_price), min_price: toNum(f.min_price), advertised_price: toNum(f.advertised_price),
      actual_sell_price: toNum(f.actual_sell_price),
    };
    delete payload.total_landed_cost; // generated column
    delete payload.created_at; delete payload.updated_at;
    let error;
    if (editing) {
      ({ error } = await supabase.from("inventory").update(payload).eq("id", initial!.id));
    } else {
      ({ error } = await supabase.from("inventory").insert(payload));
    }
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.push("/inventory");
    router.refresh();
  }

  const isWatch = f.category === "Watch";

  return (
    <form onSubmit={save} className="card" style={{ padding: "1.1rem" }}>
      {err && <p style={{ color: "var(--red)", marginBottom: ".8rem" }}>{err}</p>}

      <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
        {f.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={f.photo_url} alt="" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 10, border: "1px solid var(--line)" }} />
        ) : (
          <div style={{ width: 90, height: 90, borderRadius: 10, background: "var(--gold-soft)", display: "grid", placeItems: "center" }}>📷</div>
        )}
        <label className="btn btn-ghost" style={{ cursor: "pointer" }}>
          {uploading ? "Uploading…" : "Add / change photo"}
          <input type="file" accept="image/*" capture="environment" onChange={onPhoto} hidden />
        </label>
      </div>

      <div className="form-grid">
        <Field label="Stock ID"><input className="input" value={f.stock_id || ""} onChange={(e) => set("stock_id", e.target.value)} required /></Field>
        <Field label="Category">
          <select className="select" value={f.category || ""} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Subcategory">
          <select className="select" value={f.subcategory || ""} onChange={(e) => set("subcategory", e.target.value)}>
            <option value="" /> {SUBCATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Brand"><input className="input" value={f.brand || ""} onChange={(e) => set("brand", e.target.value)} /></Field>
        <Field label="Model"><input className="input" value={f.model || ""} onChange={(e) => set("model", e.target.value)} /></Field>
        <Field label="Model / Reference No."><input className="input" value={f.model_ref_number || ""} onChange={(e) => set("model_ref_number", e.target.value)} /></Field>
        <Field label="Serial number"><input className="input" value={f.serial_number || ""} onChange={(e) => set("serial_number", e.target.value)} /></Field>
        <Field label="Description" full><input className="input" value={f.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>

        {isWatch ? (
          <>
            <div className="section-title">Watch details</div>
            <Field label="Case size"><input className="input" value={f.watch_case_size || ""} onChange={(e) => set("watch_case_size", e.target.value)} /></Field>
            <Field label="Movement">
              <select className="select" value={f.watch_movement || ""} onChange={(e) => set("watch_movement", e.target.value)}>
                <option value="" />{MOVEMENTS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Year"><input className="input" type="number" value={f.watch_year || ""} onChange={(e) => set("watch_year", e.target.value)} /></Field>
          </>
        ) : (
          <>
            <div className="section-title">Jewellery / gold details</div>
            <Field label="Metal"><input className="input" value={f.metal || ""} onChange={(e) => set("metal", e.target.value)} /></Field>
            <Field label="Metal purity">
              <select className="select" value={f.metal_purity || ""} onChange={(e) => set("metal_purity", e.target.value)}>
                <option value="" />{METAL_PURITY.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Weight (g)"><input className="input" type="number" step="0.01" value={f.weight_g || ""} onChange={(e) => set("weight_g", e.target.value)} /></Field>
            <Field label="Stone type"><input className="input" value={f.stone_type || ""} onChange={(e) => set("stone_type", e.target.value)} /></Field>
            <Field label="Stone carat"><input className="input" type="number" step="0.01" value={f.stone_carat || ""} onChange={(e) => set("stone_carat", e.target.value)} /></Field>
            <Field label="Diamond colour"><input className="input" value={f.diamond_colour || ""} onChange={(e) => set("diamond_colour", e.target.value)} /></Field>
            <Field label="Diamond clarity"><input className="input" value={f.diamond_clarity || ""} onChange={(e) => set("diamond_clarity", e.target.value)} /></Field>
            <Field label="Ring size"><input className="input" value={f.ring_size || ""} onChange={(e) => set("ring_size", e.target.value)} /></Field>
          </>
        )}

        <div className="section-title">Purchase &amp; cost</div>
        <Field label="Date purchased"><input className="input" type="date" value={f.date_purchased || ""} onChange={(e) => set("date_purchased", e.target.value)} /></Field>
        <Field label="Condition">
          <select className="select" value={f.condition || ""} onChange={(e) => set("condition", e.target.value)}>
            <option value="" />{CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Supplier name"><input className="input" value={f.supplier_name || ""} onChange={(e) => set("supplier_name", e.target.value)} /></Field>
        <Field label="Supplier type">
          <select className="select" value={f.supplier_type || ""} onChange={(e) => set("supplier_type", e.target.value)}>
            <option value="" />{SUPPLIER_TYPES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Supplier invoice ref"><input className="input" value={f.supplier_invoice_ref || ""} onChange={(e) => set("supplier_invoice_ref", e.target.value)} /></Field>
        <Field label="Currency">
          <select className="select" value={f.purchase_currency || "GBP"} onChange={(e) => set("purchase_currency", e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label={`Purchase price (${f.purchase_currency || "GBP"})`}><input className="input" type="number" step="0.01" value={f.purchase_price ?? ""} onChange={(e) => set("purchase_price", e.target.value)} /></Field>
        <Field label="Additional costs"><input className="input" type="number" step="0.01" value={f.additional_costs ?? ""} onChange={(e) => set("additional_costs", e.target.value)} /></Field>

        <div className="section-title">Who paid &amp; ownership</div>
        <Field label="Paid by">
          <select className="select" value={f.paid_by || ""} onChange={(e) => set("paid_by", e.target.value)}>
            <option value="" />{PAID_BY.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Funding type">
          <select className="select" value={f.funding_type || ""} onChange={(e) => set("funding_type", e.target.value)}>
            <option value="" />{FUNDING_TYPES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Ownership / funding notes" full><input className="input" value={f.ownership_notes || ""} onChange={(e) => set("ownership_notes", e.target.value)} placeholder="Paid-by is not ownership — note loan/capital/business here" /></Field>

        <div className="section-title">Pricing &amp; status</div>
        <Field label="Target selling price"><input className="input" type="number" step="0.01" value={f.target_price ?? ""} onChange={(e) => set("target_price", e.target.value)} /></Field>
        <Field label="Minimum selling price"><input className="input" type="number" step="0.01" value={f.min_price ?? ""} onChange={(e) => set("min_price", e.target.value)} /></Field>
        <Field label="Advertised price"><input className="input" type="number" step="0.01" value={f.advertised_price ?? ""} onChange={(e) => set("advertised_price", e.target.value)} /></Field>
        <Field label="Location">
          <select className="select" value={f.location || ""} onChange={(e) => set("location", e.target.value)}>
            <option value="" />{LOCATIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Stock status">
          <select className="select" value={f.stock_status || ""} onChange={(e) => set("stock_status", e.target.value)}>
            {STOCK_STATUS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Notes" full><textarea className="textarea" rows={2} value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} /></Field>
      </div>

      <div style={{ display: "flex", gap: ".6rem", marginTop: "1.1rem" }}>
        <button className="btn btn-gold" disabled={busy || uploading}>{busy ? "Saving…" : editing ? "Save changes" : "Add item"}</button>
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}

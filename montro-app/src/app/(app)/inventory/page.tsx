import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { gbp } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InventoryList() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory")
    .select("id,stock_id,photo_url,brand,model,description,category,stock_status,total_landed_cost,advertised_price,purchase_currency,location")
    .order("created_at", { ascending: false });
  const items = data ?? [];

  return (
    <div>
      <div className="page-h">
        <h1>Inventory</h1>
        <Link href="/inventory/new" className="btn btn-gold">+ Add item</Link>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <p className="muted">No stock yet. Tap <b>Add item</b> to add your first piece.</p>
        </div>
      ) : (
        <div className="list">
          {items.map((i) => (
            <Link key={i.id} href={`/inventory/${i.id}`} className="card row" style={{ textDecoration: "none", color: "inherit" }}>
              {i.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="thumb" src={i.photo_url} alt="" />
              ) : (
                <div className="thumb" style={{ display: "grid", placeItems: "center" }}>💎</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{[i.brand, i.model].filter(Boolean).join(" ") || i.description || i.stock_id}</div>
                <div className="muted" style={{ fontSize: ".8rem" }}>{i.stock_id} · {i.category} · {i.location || "—"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>{gbp(i.advertised_price ?? i.total_landed_cost, i.purchase_currency || "GBP")}</div>
                <span className={"pill status-" + (i.stock_status || "").replace(/[^A-Za-z]/g, "")}>{i.stock_status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

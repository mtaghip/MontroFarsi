import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MODULES } from "@/lib/modules";
import { gbp, ukDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ModuleList({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const def = MODULES[module];
  if (!def) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from(def.table).select("*").order("created_at", { ascending: false });
  const rows = data ?? [];

  const fmt = (v: any, type?: string) =>
    type === "currency" ? gbp(v) : type === "date" ? ukDate(v) : type === "checkbox" ? (v ? "Yes" : "No") : (v ?? "");

  return (
    <div>
      <div className="page-h">
        <h1>{def.title}</h1>
        <Link href={`/m/${def.key}/new`} className="btn btn-gold">+ Add</Link>
      </div>
      {rows.length === 0 ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <p className="muted">Nothing here yet. Tap <b>Add</b> to create the first entry.</p>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="grid">
            <thead>
              <tr>{def.listColumns.map((c) => <th key={c.key}>{c.label}</th>)}<th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {def.listColumns.map((c) => <td key={c.key}>{fmt(r[c.key], c.type)}</td>)}
                  <td><Link href={`/m/${def.key}/${r.id}`} style={{ color: "var(--gold)", fontWeight: 600 }}>Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

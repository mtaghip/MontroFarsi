"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { nextSeq } from "@/lib/format";
import type { ModuleDef } from "@/lib/modules";

type Row = Record<string, any>;

export default function RecordForm({ def, initial }: { def: ModuleDef; initial?: Row }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const editing = !!initial?.id;
  const [f, setF] = useState<Row>(initial ?? {});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // default date fields + auto id for new records
    if (editing) return;
    (async () => {
      const patch: Row = {};
      for (const fl of def.fields) {
        if (fl.type === "date" && !f[fl.key]) patch[fl.key] = new Date().toISOString().slice(0, 10);
      }
      if (def.idField && def.idPrefix && !f[def.idField]) {
        const { data } = await supabase.from(def.table).select(def.idField);
        const ids = (data ?? []).map((r: Row) => r[def.idField!] as string);
        patch[def.idField] = nextSeq(def.idPrefix, ids);
      }
      if (Object.keys(patch).length) setF((p) => ({ ...p, ...patch }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const payload: Row = {};
    if (def.idField) payload[def.idField] = f[def.idField];
    for (const fl of def.fields) {
      let v = f[fl.key];
      if (fl.type === "number" || fl.type === "currency") v = v === "" || v == null ? null : Number(v);
      if (fl.type === "checkbox") v = !!v;
      payload[fl.key] = v ?? (fl.type === "checkbox" ? false : null);
    }
    let error;
    if (editing) {
      ({ error } = await supabase.from(def.table).update(payload).eq("id", initial!.id));
    } else {
      ({ error } = await supabase.from(def.table).insert(payload));
    }
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.push(`/m/${def.key}`);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card" style={{ padding: "1.1rem" }}>
      {err && <p style={{ color: "var(--red)", marginBottom: ".8rem" }}>{err}</p>}
      <div className="form-grid">
        {def.idField && (
          <div>
            <label className="label">{def.title} ID</label>
            <input className="input" value={f[def.idField] || ""} onChange={(e) => set(def.idField!, e.target.value)} />
          </div>
        )}
        {def.fields.map((fl) => (
          <div key={fl.key} style={fl.type === "textarea" ? { gridColumn: "1 / -1" } : undefined}>
            <label className="label">{fl.label}</label>
            {fl.type === "select" ? (
              <select className="select" value={f[fl.key] || ""} onChange={(e) => set(fl.key, e.target.value)}>
                <option value="" />
                {(fl.options ?? []).map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : fl.type === "checkbox" ? (
              <div style={{ paddingTop: ".4rem" }}>
                <input type="checkbox" checked={!!f[fl.key]} onChange={(e) => set(fl.key, e.target.checked)} style={{ width: 20, height: 20 }} />
              </div>
            ) : fl.type === "textarea" ? (
              <textarea className="textarea" rows={2} value={f[fl.key] || ""} onChange={(e) => set(fl.key, e.target.value)} />
            ) : (
              <input
                className="input"
                type={fl.type === "number" || fl.type === "currency" ? "number" : fl.type === "date" ? "date" : "text"}
                step={fl.type === "number" || fl.type === "currency" ? "0.01" : undefined}
                value={f[fl.key] ?? ""}
                required={fl.required}
                onChange={(e) => set(fl.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: ".6rem", marginTop: "1.1rem" }}>
        <button className="btn btn-gold" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add"}</button>
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}

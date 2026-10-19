import { createClient } from "@/lib/supabase/server";
import { ukDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Audit() {
  const supabase = await createClient();
  const { data } = await supabase.from("audit_log").select("*").order("at", { ascending: false }).limit(300);
  const rows = data ?? [];
  return (
    <div>
      <div className="page-h"><h1>Audit Log</h1></div>
      <p className="muted" style={{ fontSize: ".8rem", marginBottom: ".8rem" }}>
        Every add, edit and delete to stock, sales, partner and expense records is logged automatically with who did it and when.
      </p>
      <div className="card table-wrap">
        <table className="grid">
          <thead>
            <tr><th>When</th><th>User</th><th>Action</th><th>Table</th><th>Record</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{ukDate(r.at)} {new Date(r.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</td>
                <td>{r.user_email}</td>
                <td>{r.action}</td>
                <td>{r.table_name}</td>
                <td>{r.record_ref}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="muted" style={{ textAlign: "center", padding: "1.5rem" }}>No changes logged yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "1.5rem", background: "var(--navy)" }}>
      <form onSubmit={signIn} className="card" style={{ padding: "1.6rem", width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: ".04em", color: "var(--navy)" }}>MONTRO</div>
          <div className="muted" style={{ fontSize: ".8rem" }}>Jewellery &amp; Watch Shop Manager</div>
        </div>
        <label className="label">Email</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <div style={{ height: ".8rem" }} />
        <label className="label">Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        {err && <p style={{ color: "var(--red)", fontSize: ".85rem", marginTop: ".7rem" }}>{err}</p>}
        <button className="btn" style={{ width: "100%", marginTop: "1.1rem" }} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="muted" style={{ fontSize: ".75rem", marginTop: "1rem", textAlign: "center" }}>
          Accounts are created by a partner in Supabase.
        </p>
      </form>
    </div>
  );
}

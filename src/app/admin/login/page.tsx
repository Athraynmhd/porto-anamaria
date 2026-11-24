"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const form = new FormData(e.currentTarget);
    const { error } = await createClient().auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (error) { setError("Email atau password salah."); setBusy(false); return; }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="adm-login">
      <form onSubmit={submit} className="adm-card">
        <h1>Masuk Admin</h1>
        <label>Email<input name="email" type="email" required autoComplete="username" /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-btn" disabled={busy}>{busy ? "Memeriksa…" : "Masuk"}</button>
      </form>
    </main>
  );
}

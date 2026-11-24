"use server";
import { createClient } from "@supabase/supabase-js";

type Result = { ok: true } | { ok: false; error: string };
type Input = { name?: unknown; email?: unknown; message?: unknown; website?: unknown; elapsed?: unknown };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOO_MANY = "Terlalu banyak kiriman saat ini. Coba lagi beberapa saat lagi.";
const FAILED = "Gagal mengirim. Coba lagi sebentar lagi.";

/** Anonymous client: it can only do what the RLS policies allow an anonymous visitor (insert, never read). */
function anon() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Bots fill the hidden "website" field or submit within moments of loading the page; pretend it worked and drop it. */
const looksLikeBot = (i: Input) => String(i.website ?? "").length > 0 || Number(i.elapsed) < 2500;
const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max + 1);

async function insert(table: "messages" | "comments", row: Record<string, string>): Promise<Result> {
  const { error } = await anon().from(table).insert(row);
  if (!error) return { ok: true };
  return { ok: false, error: error.message.includes("rate_limited") ? TOO_MANY : FAILED };
}

export async function sendMessage(input: Input): Promise<Result> {
  const name = text(input.name, 100), email = text(input.email, 150), message = text(input.message, 3000);
  if (!name || !email || !message) return { ok: false, error: "Lengkapi nama, email, dan pesan." };
  if (name.length > 100 || email.length > 150 || message.length > 3000) return { ok: false, error: "Teks terlalu panjang." };
  if (!EMAIL.test(email)) return { ok: false, error: "Alamat email tidak valid." };
  if (looksLikeBot(input)) return { ok: true };
  return insert("messages", { name, email, message });
}

export async function sendComment(input: Input): Promise<Result> {
  const name = text(input.name, 80), message = text(input.message, 1000);
  if (!name || !message) return { ok: false, error: "Isi nama dan komentar terlebih dahulu." };
  if (name.length > 80 || message.length > 1000) return { ok: false, error: "Teks terlalu panjang." };
  if (looksLikeBot(input)) return { ok: true };
  return insert("comments", { name, message });
}

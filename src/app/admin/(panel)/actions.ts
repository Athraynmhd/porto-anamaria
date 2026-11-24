"use server";
import { revalidatePath, updateTag } from "next/cache";
import { getAdmin } from "@/lib/supabase/server";
import { MIN_ROWS, SETTINGS_FIELDS, TABLES, cleanRecord } from "../schema";

type Result = { ok: true; id?: string } | { ok: false; error: string };
type Values = Record<string, unknown>;

// Every action re-verifies the admin (JWT signature via getClaims). RLS enforces the same rule in the database.
async function guard() {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) throw new Error("Tidak diizinkan");
  return supabase;
}
const publish = () => { updateTag("content"); revalidatePath("/", "layout"); };
const fail = (error: string): Result => ({ ok: false, error });
const msg = (e: unknown) => (e instanceof Error ? e.message : "Terjadi kesalahan");
const tableOf = (name: string) => (Object.hasOwn(TABLES, name) ? TABLES[name] : null);

export async function saveSettings(input: Values): Promise<Result> {
  try {
    const supabase = await guard();
    const { values, error } = cleanRecord(SETTINGS_FIELDS, input);
    if (error || !values) return fail(error ?? "Data tidak valid");
    const { error: dbError } = await supabase.from("site_settings").update({ ...values, updated_at: new Date().toISOString() }).eq("id", 1);
    if (dbError) return fail(dbError.message);
    publish();
    return { ok: true };
  } catch (e) { return fail(msg(e)); }
}

export async function saveRow(table: string, input: Values, id?: string): Promise<Result> {
  try {
    const supabase = await guard();
    const def = tableOf(table);
    if (!def) return fail("Tabel tidak dikenal");
    const { values, error } = cleanRecord(def.fields, input);
    if (error || !values) return fail(error ?? "Data tidak valid");
    if (id) {
      // The slug is the page address and the "kind" decides where a row lives: both are locked after creation.
      delete values.slug;
      if (def.hasKind) delete values.kind;
      const { error: dbError } = await supabase.from(table).update({ ...values, ...(table === "projects" ? { updated_at: new Date().toISOString() } : {}) }).eq("id", id);
      if (dbError) return fail(dbError.message.includes("duplicate") ? "Slug sudah dipakai proyek lain" : dbError.message);
      publish();
      return { ok: true, id };
    }
    // New rows go to the end of their group.
    let q = supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
    if (def.hasKind) q = q.eq("kind", values.kind as string);
    const { data: last } = await q;
    const sort_order = ((last?.[0]?.sort_order as number | undefined) ?? -1) + 1;
    const { data, error: dbError } = await supabase.from(table).insert({ ...values, sort_order }).select("id").single();
    if (dbError) return fail(dbError.message.includes("duplicate") ? "Slug sudah dipakai proyek lain" : dbError.message);
    publish();
    return { ok: true, id: data.id as string };
  } catch (e) { return fail(msg(e)); }
}

export async function deleteRow(table: string, id: string): Promise<Result> {
  try {
    const supabase = await guard();
    if (!tableOf(table)) return fail("Tabel tidak dikenal");
    const min = MIN_ROWS[table];
    if (min) {
      const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
      if ((count ?? 0) <= min) return fail("Tidak bisa dihapus: situs harus punya minimal 1 isi di bagian ini. Tambahkan yang baru dulu, baru hapus yang lama.");
    }
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return fail(error.message);
    publish();
    return { ok: true };
  } catch (e) { return fail(msg(e)); }
}

/** Moves a row one step up or down inside its group (same kind) by rewriting the group's sort_order. */
export async function moveRow(table: string, id: string, direction: "up" | "down"): Promise<Result> {
  try {
    const supabase = await guard();
    const def = tableOf(table);
    if (!def) return fail("Tabel tidak dikenal");
    const { data: row } = await supabase.from(table).select(def.hasKind ? "id,kind" : "id").eq("id", id).single();
    if (!row) return fail("Data tidak ditemukan");
    let q = supabase.from(table).select("id").order("sort_order").order("created_at");
    if (def.hasKind) q = q.eq("kind", (row as unknown as { kind: string }).kind);
    const { data: group } = await q;
    const ids = (group ?? []).map(r => r.id as string);
    const from = ids.indexOf(id), to = direction === "up" ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= ids.length) return { ok: true };
    [ids[from], ids[to]] = [ids[to], ids[from]];
    for (const [i, rowId] of ids.entries()) {
      const { error } = await supabase.from(table).update({ sort_order: i }).eq("id", rowId);
      if (error) return fail(error.message);
    }
    publish();
    return { ok: true };
  } catch (e) { return fail(msg(e)); }
}

// ---- Inbox (messages) and moderation (comments) ----
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COMMENT_STATUS = ["pending", "approved", "archived"] as const;

export async function setMessageArchived(id: string, archived: boolean): Promise<Result> {
  try {
    const supabase = await guard();
    if (!UUID.test(id)) return fail("Data tidak valid");
    const { error } = await supabase.from("messages").update({ archived: Boolean(archived) }).eq("id", id);
    return error ? fail(error.message) : { ok: true };
  } catch (e) { return fail(msg(e)); }
}

export async function deleteMessage(id: string): Promise<Result> {
  try {
    const supabase = await guard();
    if (!UUID.test(id)) return fail("Data tidak valid");
    const { error } = await supabase.from("messages").delete().eq("id", id);
    return error ? fail(error.message) : { ok: true };
  } catch (e) { return fail(msg(e)); }
}

export async function setCommentStatus(id: string, status: (typeof COMMENT_STATUS)[number]): Promise<Result> {
  try {
    const supabase = await guard();
    if (!UUID.test(id) || !COMMENT_STATUS.includes(status)) return fail("Data tidak valid");
    const { error } = await supabase.from("comments").update({ status }).eq("id", id);
    if (error) return fail(error.message);
    publish(); // approved comments are part of the public page
    return { ok: true };
  } catch (e) { return fail(msg(e)); }
}

export async function deleteComment(id: string): Promise<Result> {
  try {
    const supabase = await guard();
    if (!UUID.test(id)) return fail("Data tidak valid");
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return fail(error.message);
    publish();
    return { ok: true };
  } catch (e) { return fail(msg(e)); }
}

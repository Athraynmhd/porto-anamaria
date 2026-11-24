"use client";
import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SETTINGS_SECTIONS, TABLES, type Field } from "../schema";
import { deleteRow, moveRow, saveRow, saveSettings } from "./actions";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Status = { kind: "ok" | "error"; text: string } | null;

const MAX_UPLOAD = 8 * 1024 * 1024;
const EXT: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "application/pdf": "pdf" };

async function uploadFile(file: File, pdf: boolean): Promise<string> {
  const allowed = pdf ? ["application/pdf"] : ["image/webp", "image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) throw new Error(pdf ? "Pilih file PDF." : "Pilih gambar WebP, JPG, atau PNG.");
  if (file.size > MAX_UPLOAD) throw new Error("Ukuran file maksimal 8 MB.");
  const path = `uploads/${crypto.randomUUID()}.${EXT[file.type]}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("portfolio").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Gagal mengunggah: " + error.message);
  return supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl;
}

function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const id = `f-${field.key}-${field.label.length}`;

  async function pick(file?: File) {
    if (!file) return;
    setUploading(true); setUploadError("");
    try { onChange(await uploadFile(file, field.type === "file")); }
    catch (e) { setUploadError(e instanceof Error ? e.message : "Gagal mengunggah"); }
    finally { setUploading(false); }
  }

  let control: ReactNode;
  switch (field.type) {
    case "textarea": control = <textarea id={id} rows={5} value={value ?? ""} maxLength={field.max} onChange={e => onChange(e.target.value)} />; break;
    case "tags": control = <textarea id={id} rows={3} value={(value ?? []).join("\n")} onChange={e => onChange(e.target.value.split("\n"))} />; break;
    case "bool": control = <input id={id} type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />; break;
    case "int": control = <input id={id} type="number" value={value ?? ""} onChange={e => onChange(e.target.value)} />; break;
    case "select": control = <select id={id} value={value ?? ""} onChange={e => onChange(e.target.value)}>{field.options!.map(o => <option key={o}>{o}</option>)}</select>; break;
    case "image": case "file":
      control = (
        <div className="adm-upload">
          {field.type === "image" && value && <img src={value} alt="" />}
          <input id={id} type="text" value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder="/content/foto.webp atau unggah" />
          <label className="adm-btn adm-btn-light">{uploading ? "Mengunggah…" : "Unggah"}
            <input type="file" hidden accept={field.type === "file" ? "application/pdf" : "image/webp,image/jpeg,image/png"} disabled={uploading} onChange={e => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
      ); break;
    default: control = <input id={id} type="text" value={value ?? ""} maxLength={field.max} onChange={e => onChange(e.target.value)} />;
  }
  return (
    <div className={`adm-field ${field.type === "bool" ? "adm-check" : ""}`}>
      <label htmlFor={id}>{field.label}{field.required && " *"}</label>
      {control}
      {field.hint && <small>{field.hint}</small>}
      {uploadError && <small className="adm-error">{uploadError}</small>}
    </div>
  );
}

const StatusLine = ({ s }: { s: Status }) => (s ? <span className={s.kind === "ok" ? "adm-ok" : "adm-error"} role="status">{s.text}</span> : null);

function SettingsForm({ settings }: { settings: Row }) {
  const router = useRouter();
  const [values, setValues] = useState<Row>(settings);
  const [status, setStatus] = useState<Status>(null);
  const [pending, start] = useTransition();
  const save = () => start(async () => {
    const res = await saveSettings(values);
    setStatus(res.ok ? { kind: "ok", text: "Tersimpan. Situs diperbarui." } : { kind: "error", text: res.error });
    if (res.ok) router.refresh();
  });
  return (
    <div>
      {SETTINGS_SECTIONS.map(section => (
        <section key={section.title} className="adm-card">
          <h2>{section.title}</h2>
          {section.fields.map(f => <FieldInput key={f.key} field={f} value={values[f.key]} onChange={v => setValues(s => ({ ...s, [f.key]: v }))} />)}
        </section>
      ))}
      <div className="adm-bar"><button className="adm-btn" onClick={save} disabled={pending}>{pending ? "Menyimpan…" : "Simpan semua"}</button><StatusLine s={status} /></div>
    </div>
  );
}

function RowCard({ table, row, fixed, isNew, canUp, canDown, onDone }: { table: string; row: Row; fixed?: string; isNew?: boolean; canUp?: boolean; canDown?: boolean; onDone?: () => void }) {
  const router = useRouter();
  const def = TABLES[table];
  const fields = def.fields.filter(f => !(fixed && f.key === "kind"));
  const [values, setValues] = useState<Row>(row);
  const [status, setStatus] = useState<Status>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const heading = (values[fields[0].key] as string) || (isNew ? "Entri baru" : "(tanpa judul)");

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okText: string, after?: () => void) => start(async () => {
    const res = await fn();
    setStatus(res.ok ? { kind: "ok", text: okText } : { kind: "error", text: res.error ?? "Gagal" });
    if (res.ok) { router.refresh(); after?.(); }
  });
  const save = () => run(() => saveRow(table, fixed ? { ...values, kind: fixed } : values, isNew ? undefined : row.id), "Tersimpan ✓", isNew ? onDone : undefined);

  return (
    <article className="adm-card adm-row">
      <header>
        <h3>{heading}</h3>
        {!isNew && (
          <div className="adm-actions">
            <button className="adm-btn adm-btn-light" disabled={!canUp || pending} onClick={() => run(() => moveRow(table, row.id, "up"), "Dipindah")} aria-label="Naik">↑</button>
            <button className="adm-btn adm-btn-light" disabled={!canDown || pending} onClick={() => run(() => moveRow(table, row.id, "down"), "Dipindah")} aria-label="Turun">↓</button>
          </div>
        )}
      </header>
      {fields.map(f => <FieldInput key={f.key} field={f} value={values[f.key]} onChange={v => setValues(s => ({ ...s, [f.key]: v }))} />)}
      <div className="adm-bar">
        <button className="adm-btn" onClick={save} disabled={pending}>{pending ? "Menyimpan…" : isNew ? "Tambahkan" : "Simpan"}</button>
        {isNew ? <button className="adm-btn adm-btn-light" onClick={onDone}>Batal</button> : confirming
          ? <button className="adm-btn adm-btn-danger" onClick={() => run(() => deleteRow(table, row.id), "Dihapus")} disabled={pending}>Yakin hapus?</button>
          : <button className="adm-btn adm-btn-light" onClick={() => { setConfirming(true); setTimeout(() => setConfirming(false), 4000); }}>Hapus</button>}
        <StatusLine s={status} />
      </div>
    </article>
  );
}

function Collection({ title, table, rows, fixed, note }: { title: string; table: string; rows: Row[]; fixed?: string; note?: string }) {
  const def = TABLES[table];
  const [adding, setAdding] = useState(false);
  const list = fixed ? rows.filter(r => r.kind === fixed) : rows;
  const blank: Row = Object.fromEntries(def.fields.map(f => [f.key, f.type === "tags" ? [] : f.type === "bool" ? true : f.type === "select" ? (fixed ?? f.options![0]) : f.type === "int" ? new Date().getFullYear() : ""]));
  return (
    <section>
      <div className="adm-head"><h2>{title} <small>({list.length})</small></h2><button className="adm-btn" onClick={() => setAdding(true)} disabled={adding}>+ Tambah</button></div>
      {note && <p className="adm-note">{note}</p>}
      {adding && <RowCard table={table} row={blank} fixed={fixed} isNew onDone={() => setAdding(false)} />}
      {list.map((row, i) => <RowCard key={row.id + JSON.stringify(row)} table={table} row={row} fixed={fixed} canUp={i > 0} canDown={i < list.length - 1} />)}
      {!list.length && !adding && <p className="adm-note">Belum ada isi. Klik “+ Tambah”.</p>}
    </section>
  );
}

function Account({ email }: { email: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(null);
  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const password = String(new FormData(form).get("password"));
    if (password.length < 6) { setStatus({ kind: "error", text: "Minimal 6 karakter. Disarankan 12 karakter atau lebih." }); return; }
    const { error } = await createClient().auth.updateUser({ password });
    setStatus(error ? { kind: "error", text: error.message } : { kind: "ok", text: "Password diganti." });
    if (!error) form.reset();
  }
  async function signOut() { await createClient().auth.signOut(); router.replace("/admin/login"); router.refresh(); }
  return (
    <section className="adm-card">
      <h2>Akun</h2>
      <p>Masuk sebagai <strong>{email}</strong></p>
      <form onSubmit={changePassword}>
        <div className="adm-field"><label htmlFor="newpw">Password baru</label><input id="newpw" name="password" type="password" autoComplete="new-password" required /><small>Gunakan password yang panjang dan unik.</small></div>
        <div className="adm-bar"><button className="adm-btn">Ganti password</button><StatusLine s={status} /></div>
      </form>
      <div className="adm-bar"><button className="adm-btn adm-btn-light" onClick={signOut}>Keluar</button></div>
    </section>
  );
}

const TABS = ["Profil & SEO", "Proyek", "Pengalaman", "Sertifikat", "Galeri", "Kontak", "Akun"] as const;

export function AdminApp({ email, settings, rows }: { email: string; settings: Row; rows: Record<string, Row[]> }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profil & SEO");
  return (
    <div className="adm-shell">
      <header className="adm-top">
        <strong>Panel Admin</strong>
        <a href="/" target="_blank" rel="noopener noreferrer">Lihat situs ↗</a>
      </header>
      <nav className="adm-tabs" role="tablist" aria-label="Bagian">
        {TABS.map(t => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}
      </nav>
      <main className="adm-main">
        {tab === "Profil & SEO" && <SettingsForm settings={settings} />}
        {tab === "Proyek" && <Collection title="Proyek & riset" table="projects" rows={rows.projects} note="Urutan di sini = urutan di situs. Proyek yang dimatikan “Tampilkan di situs”-nya tidak muncul untuk pengunjung." />}
        {tab === "Pengalaman" && <><Collection title="Pendidikan" table="timeline_entries" rows={rows.timeline_entries} fixed="education" /><Collection title="Pengalaman" table="timeline_entries" rows={rows.timeline_entries} fixed="experience" /></>}
        {tab === "Sertifikat" && <><Collection title="Sertifikat" table="credentials" rows={rows.credentials} fixed="certificate" /><Collection title="Penghargaan" table="credentials" rows={rows.credentials} fixed="award" /></>}
        {tab === "Galeri" && <Collection title="Foto galeri" table="gallery_photos" rows={rows.gallery_photos} note="Disarankan foto potret 4:5." />}
        {tab === "Kontak" && <Collection title="Kontak & publikasi" table="contact_links" rows={rows.contact_links} />}
        {tab === "Akun" && <Account email={email} />}
      </main>
    </div>
  );
}

"use client";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SETTINGS_SECTIONS, TABLES, slugify, type Field, type Level } from "../schema";
import { deleteRow, moveRow, saveRow, saveSettings } from "./actions";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Status = { kind: "ok" | "error"; text: string } | null;

const MAX_UPLOAD = 8 * 1024 * 1024;
const EXT: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "application/pdf": "pdf" };
const BADGE: Record<Exclude<Level, "safe">, string> = { careful: "Hati-hati", locked: "Jangan diubah" };

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

function FieldInput({ field, value, onChange, readOnly }: { field: Field; value: any; onChange: (v: any) => void; readOnly?: boolean }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const id = `f-${field.key}-${field.label.length}`;
  const level = readOnly ? "locked" : field.level ?? "safe";

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
    case "select": control = <select id={id} value={value ?? ""} disabled={readOnly} onChange={e => onChange(e.target.value)}>{field.options!.map(o => <option key={o}>{o}</option>)}</select>; break;
    case "image": case "file":
      control = (
        <div className="adm-upload">
          <div className="adm-upload-main">
            {field.type === "image" && (value ? <img src={value} alt="Pratinjau gambar saat ini" /> : <span className="adm-noimg">Belum ada gambar</span>)}
            {field.type === "file" && value && <a href={value} target="_blank" rel="noopener noreferrer">Lihat file saat ini ↗</a>}
            <label className="adm-btn adm-btn-light">{uploading ? "Mengunggah…" : field.type === "file" ? "Ganti file" : "Ganti gambar"}
              <input type="file" hidden accept={field.type === "file" ? "application/pdf" : "image/webp,image/jpeg,image/png"} disabled={uploading} onChange={e => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          </div>
          <details>
            <summary>Alamat file (lanjutan, jangan diubah kecuali paham)</summary>
            <input id={id} type="text" value={value ?? ""} onChange={e => onChange(e.target.value)} />
          </details>
        </div>
      ); break;
    default: control = <input id={id} type="text" value={value ?? ""} maxLength={field.max} readOnly={readOnly} onChange={e => onChange(e.target.value)} />;
  }
  return (
    <div className={`adm-field ${field.type === "bool" ? "adm-check" : ""} adm-lv-${level}`}>
      <label htmlFor={id}>
        {field.label}{field.required && " *"}
        {level !== "safe" && <span className={`adm-badge ${level}`}>{BADGE[level]}</span>}
      </label>
      {control}
      {(field.hint || readOnly) && <small className="adm-hint">{field.hint}</small>}
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
    setStatus(res.ok ? { kind: "ok", text: "Tersimpan. Situs sudah diperbarui." } : { kind: "error", text: res.error });
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
  const slugTouched = useRef(false);
  const heading = (values[fields[0].key] as string) || (isNew ? "Entri baru" : "(tanpa judul)");

  const change = (key: string, v: unknown) => setValues(s => {
    const next = { ...s, [key]: v };
    if (table === "projects" && isNew) {
      if (key === "slug") slugTouched.current = true;
      if (key === "title" && !slugTouched.current) next.slug = slugify(String(v));
    }
    return next;
  });
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
            <button className="adm-btn adm-btn-light" disabled={!canUp || pending} onClick={() => run(() => moveRow(table, row.id, "up"), "Dipindah ke atas")} aria-label="Pindah ke atas">↑</button>
            <button className="adm-btn adm-btn-light" disabled={!canDown || pending} onClick={() => run(() => moveRow(table, row.id, "down"), "Dipindah ke bawah")} aria-label="Pindah ke bawah">↓</button>
          </div>
        )}
      </header>
      {fields.map(f => <FieldInput key={f.key} field={f} value={values[f.key]} readOnly={f.key === "slug" && !isNew} onChange={v => change(f.key, v)} />)}
      <div className="adm-bar">
        <button className="adm-btn" onClick={save} disabled={pending}>{pending ? "Menyimpan…" : isNew ? "Tambahkan" : "Simpan perubahan"}</button>
        {isNew ? <button className="adm-btn adm-btn-light" onClick={onDone}>Batal</button> : confirming
          ? <button className="adm-btn adm-btn-danger" onClick={() => run(() => deleteRow(table, row.id), "Dihapus")} disabled={pending}>Klik lagi untuk menghapus permanen</button>
          : <button className="adm-btn adm-btn-light" onClick={() => { setConfirming(true); setTimeout(() => setConfirming(false), 5000); }}>Hapus</button>}
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

function Guide({ go }: { go: (tab: Tab) => void }) {
  return (
    <section className="adm-card adm-guide">
      <h2>Panduan singkat</h2>
      <p>Di sini Anda bisa mengubah isi situs tanpa menyentuh kode. Setelah menekan <strong>Simpan</strong>, perubahan langsung muncul di situs (kadang perlu muat ulang halaman).</p>

      <h3>Arti penanda di setiap kolom</h3>
      <ul className="adm-legend">
        <li><span className="adm-badge safe">Tanpa penanda</span> Teks biasa. Aman diubah kapan saja.</li>
        <li><span className="adm-badge careful">Hati-hati</span> Boleh diubah, tapi baca petunjuk kecil di bawah kolomnya dulu.</li>
        <li><span className="adm-badge locked">Jangan diubah</span> Dikunci. Kolom ini tidak bisa diubah dari sini.</li>
      </ul>

      <h3>Yang boleh dan sering diubah</h3>
      <ul>
        <li>Teks: nama, bio, judul, deskripsi proyek, tahun, keterangan.</li>
        <li>Menambah proyek, pengalaman, sertifikat, penghargaan, dan foto galeri baru.</li>
        <li>Mengatur urutan dengan tombol ↑ dan ↓.</li>
        <li>Mengganti gambar dengan tombol <strong>Ganti gambar</strong>. Pilih WebP, JPG, atau PNG, maksimal 8 MB, lalu tekan Simpan.</li>
      </ul>

      <h3>Yang jangan dilakukan</h3>
      <ul className="adm-dont">
        <li><strong>Jangan mengetik alamat gambar sendiri</strong> di kolom “Alamat file (lanjutan)”. Gunakan tombol Ganti gambar.</li>
        <li><strong>Jangan mengganti gambar hero, foto utama, dan foto pohon</strong> kecuali gambar penggantinya berukuran dan berposisi sama. Tampilan bisa berantakan.</li>
        <li><strong>Jangan mengubah “Jenis (menentukan ikon)”</strong> di Kontak kecuali tahu artinya.</li>
        <li><strong>Jangan menghapus</strong> sesuatu yang masih dipakai. Hapus tidak bisa dibatalkan. Untuk menyembunyikan proyek, matikan “Tampilkan di situs”.</li>
        <li><strong>Jangan membagikan password</strong> admin, dan jangan memakai password yang mudah ditebak.</li>
      </ul>

      <h3>Aturan yang sudah dijaga otomatis</h3>
      <ul>
        <li>Alamat halaman proyek (slug) dibuat otomatis dari judul dan dikunci setelah disimpan.</li>
        <li>Proyek dan foto galeri tidak bisa dihapus sampai habis. Minimal harus ada satu.</li>
        <li>Tautan harus diawali https://, mailto:, atau /. Isian yang tidak aman akan ditolak.</li>
      </ul>

      <p className="adm-note">Kalau ada yang tampak rusak setelah mengubah sesuatu, jangan panik: kembalikan isinya seperti semula lalu simpan, atau hubungi pengelola situs.</p>
      <div className="adm-bar"><button className="adm-btn" onClick={() => go("Profil & SEO")}>Mulai mengedit</button></div>
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
    if (password.length < 8) { setStatus({ kind: "error", text: "Minimal 8 karakter. Disarankan 12 karakter atau lebih." }); return; }
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
        <div className="adm-field"><label htmlFor="newpw">Password baru</label><input id="newpw" name="password" type="password" autoComplete="new-password" required /><small className="adm-hint">Gunakan password yang panjang dan unik, dan jangan dibagikan.</small></div>
        <div className="adm-bar"><button className="adm-btn">Ganti password</button><StatusLine s={status} /></div>
      </form>
      <div className="adm-bar"><button className="adm-btn adm-btn-light" onClick={signOut}>Keluar</button></div>
    </section>
  );
}

const TABS = ["Panduan", "Profil & SEO", "Proyek", "Pengalaman", "Sertifikat", "Galeri", "Kontak", "Akun"] as const;
type Tab = (typeof TABS)[number];

export function AdminApp({ email, settings, rows }: { email: string; settings: Row; rows: Record<string, Row[]> }) {
  const [tab, setTab] = useState<Tab>("Panduan");
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
        {tab === "Panduan" && <Guide go={setTab} />}
        {tab === "Profil & SEO" && <SettingsForm settings={settings} />}
        {tab === "Proyek" && <Collection title="Proyek & riset" table="projects" rows={rows.projects} note="Urutan di sini sama dengan urutan di situs. Alamat halaman dibuat otomatis dari judul. Matikan “Tampilkan di situs” untuk menyembunyikan proyek tanpa menghapusnya." />}
        {tab === "Pengalaman" && <><Collection title="Pendidikan" table="timeline_entries" rows={rows.timeline_entries} fixed="education" /><Collection title="Pengalaman" table="timeline_entries" rows={rows.timeline_entries} fixed="experience" /></>}
        {tab === "Sertifikat" && <><Collection title="Sertifikat" table="credentials" rows={rows.credentials} fixed="certificate" /><Collection title="Penghargaan" table="credentials" rows={rows.credentials} fixed="award" /></>}
        {tab === "Galeri" && <Collection title="Foto galeri" table="gallery_photos" rows={rows.gallery_photos} note="Minimal harus ada 1 foto. Foto potret 4:5 paling pas." />}
        {tab === "Kontak" && <Collection title="Kontak & publikasi" table="contact_links" rows={rows.contact_links} note="Pastikan setiap tautan benar-benar bisa dibuka setelah disimpan." />}
        {tab === "Akun" && <Account email={email} />}
      </main>
    </div>
  );
}

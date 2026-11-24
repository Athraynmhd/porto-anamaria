/** Single source of truth for what the admin can edit. Used by the UI and re-checked on the server. */
export type FieldType = "text" | "textarea" | "image" | "file" | "url" | "tags" | "select" | "bool" | "int";
/** safe = plain text, careful = follow the hint, locked = cannot be edited here. */
export type Level = "safe" | "careful" | "locked";
export type Field = { key: string; label: string; type: FieldType; max?: number; options?: string[]; required?: boolean; hint?: string; level?: Level };
export type TableDef = { label: string; fields: Field[]; ordered: boolean; hasKind: boolean };

/** Tables that must always keep at least this many rows, otherwise a page would break. */
export const MIN_ROWS: Record<string, number> = { projects: 1, gallery_photos: 1 };

export const SETTINGS_SECTIONS: { title: string; fields: Field[] }[] = [
  { title: "Identitas", fields: [
    { key: "name", label: "Nama lengkap", type: "text", required: true, max: 80, hint: "Tampil di judul tab browser dan hasil Google." },
    { key: "first_line", label: "Nama baris 1", type: "text", required: true, max: 40, level: "careful", hint: "Nama dipecah dua baris besar di halaman About. Jaga tiap baris tetap pendek." },
    { key: "second_line", label: "Nama baris 2", type: "text", required: true, max: 40, level: "careful", hint: "Lihat petunjuk di atas." },
    { key: "greeting", label: "Sapaan", type: "text", max: 40 },
    { key: "description", label: "Bio singkat", type: "textarea", max: 1200, hint: "Cukup 2–3 kalimat supaya tampilan tetap rapi." },
    { key: "email", label: "Email kontak", type: "text", max: 120, level: "careful", hint: "Harus email yang benar. Pengunjung memakainya untuk menghubungi Anda." },
    { key: "cv_url", label: "File CV (PDF)", type: "file", level: "careful", hint: "Ganti CV dengan tombol “Ganti file”. Jangan mengetik alamat sendiri." },
  ] },
  { title: "Hero (halaman pertama)", fields: [
    { key: "hero_title_1", label: "Judul baris 1", type: "text", max: 60 },
    { key: "hero_title_2", label: "Judul baris 2", type: "text", max: 60 },
    { key: "hero_garden", label: "Gambar latar", type: "image", level: "careful", hint: "Foto latar lebar (lanskap). Gambar yang salah ukuran bisa terlihat terpotong." },
    { key: "hero_foreground", label: "Foto utama (latar transparan)", type: "image", level: "careful", hint: "Harus PNG/WebP tanpa latar dengan ukuran dan posisi yang sama seperti sebelumnya. Salah gambar membuat tampilan berantakan." },
    { key: "hero_tree_left", label: "Pohon kiri (hanya layar lebar)", type: "image", level: "careful", hint: "Gambar pohon tanpa latar. Tidak tampil di HP." },
    { key: "hero_tree_right", label: "Pohon kanan (hanya layar lebar)", type: "image", level: "careful", hint: "Gambar pohon tanpa latar. Tidak tampil di HP." },
    { key: "hero_alt", label: "Deskripsi foto utama", type: "text", max: 160, hint: "Kalimat pendek yang menjelaskan foto, untuk pembaca layar." },
  ] },
  { title: "Foto di bagian About & Kontak", fields: [
    { key: "portrait", label: "Foto profil", type: "image", level: "careful", hint: "Gunakan foto persegi. Posisi kepala sebaiknya sama dengan foto saat kursor di atas profil." },
    { key: "portrait_reveal", label: "Foto saat kursor di atas profil", type: "image", level: "careful", hint: "Ukuran dan posisi kepala harus sama dengan foto profil." },
    { key: "event_image", label: "Foto kegiatan (bagian kontak)", type: "image", level: "careful", hint: "Foto lanskap paling pas." },
  ] },
  { title: "SEO & pratinjau tautan", fields: [
    { key: "seo_title", label: "Judul di Google", type: "text", max: 90 },
    { key: "seo_description", label: "Deskripsi di Google", type: "textarea", max: 300, hint: "Sekitar 1–2 kalimat." },
    { key: "seo_image", label: "Gambar pratinjau tautan", type: "image", level: "careful", hint: "Gambar yang muncul saat tautan dibagikan di WhatsApp atau LinkedIn. Ukuran lanskap (sekitar 1200×630) paling bagus." },
  ] },
  { title: "Footer", fields: [
    { key: "footer_label", label: "Nama di footer", type: "text", max: 60 },
    { key: "footer_text", label: "Teks footer", type: "text", max: 120 },
    { key: "footer_year", label: "Tahun", type: "int", level: "careful", hint: "Isi angka tahun, misalnya 2026." },
  ] },
];

export const SETTINGS_FIELDS = SETTINGS_SECTIONS.flatMap(s => s.fields);

export const TABLES: Record<string, TableDef> = {
  projects: { label: "Proyek", ordered: true, hasKind: false, fields: [
    { key: "title", label: "Judul", type: "text", required: true, max: 120 },
    { key: "slug", label: "Alamat halaman (slug)", type: "text", required: true, max: 80, level: "locked", hint: "Dibuat otomatis dari judul dan tidak bisa diubah setelah disimpan, supaya tautan yang sudah dibagikan tidak rusak." },
    { key: "description", label: "Deskripsi", type: "textarea", max: 5000 },
    { key: "img", label: "Gambar", type: "image", level: "careful", hint: "Ganti dengan tombol “Ganti gambar”. Gambar lanskap atau peta utuh paling pas." },
    { key: "tech_stack", label: "Metode / keahlian (satu per baris)", type: "tags" },
    { key: "features", label: "Poin tambahan (satu per baris)", type: "tags" },
    { key: "link", label: "Tautan proyek", type: "url", level: "careful", hint: "Kosongkan jika tidak ada. Jika diisi, harus diawali https://" },
    { key: "github", label: "Tautan GitHub", type: "url", level: "careful", hint: "Kosongkan jika tidak ada. Jika diisi, harus diawali https://" },
    { key: "published", label: "Tampilkan di situs", type: "bool", hint: "Matikan untuk menyembunyikan tanpa menghapus." },
  ] },
  timeline_entries: { label: "Pendidikan & pengalaman", ordered: true, hasKind: true, fields: [
    { key: "kind", label: "Jenis", type: "select", options: ["education", "experience"], required: true, level: "locked" },
    { key: "company", label: "Institusi / kegiatan", type: "text", required: true, max: 160 },
    { key: "role", label: "Peran / gelar", type: "text", max: 160 },
    { key: "year", label: "Tahun", type: "text", max: 40, hint: "Contoh: 2023–2026 atau Feb–Mei 2025." },
    { key: "logo", label: "Gambar", type: "image", level: "careful", hint: "Gambar kecil yang tampil di samping judul. Ganti dengan tombol “Ganti gambar”." },
    { key: "subtitle", label: "Keterangan", type: "text", max: 160 },
    { key: "tag", label: "Label", type: "text", max: 40, hint: "Kata singkat dalam kotak kecil, misalnya Riset." },
  ] },
  credentials: { label: "Sertifikat & penghargaan", ordered: true, hasKind: true, fields: [
    { key: "kind", label: "Jenis", type: "select", options: ["certificate", "award"], required: true, level: "locked" },
    { key: "title", label: "Judul", type: "text", required: true, max: 200 },
    { key: "img", label: "Gambar", type: "image", level: "careful", hint: "Foto atau scan sertifikat, paling pas lanskap 4:3." },
  ] },
  gallery_photos: { label: "Galeri", ordered: true, hasKind: false, fields: [
    { key: "src", label: "Foto", type: "image", required: true, level: "careful", hint: "Foto potret 4:5 paling pas. Ganti dengan tombol “Ganti gambar”." },
    { key: "alt", label: "Deskripsi foto", type: "text", max: 200, hint: "Satu kalimat singkat tentang isi foto. Dibaca oleh pembaca layar." },
  ] },
  contact_links: { label: "Kontak & publikasi", ordered: true, hasKind: false, fields: [
    { key: "name", label: "Nama", type: "text", required: true, max: 160 },
    { key: "handle", label: "Keterangan", type: "text", max: 160 },
    { key: "href", label: "Tautan", type: "url", required: true, level: "careful", hint: "Harus benar-benar bisa dibuka. Diawali https://, mailto: (untuk email), atau / (file di situs ini)." },
    { key: "kind", label: "Jenis (menentukan ikon)", type: "select", options: ["email", "cv", "publication", "link"], required: true, level: "careful", hint: "email = alamat email, cv = file CV, publication = jurnal, link = tautan lain." },
  ] },
};

const TEXT_MAX = 500;
const URL_OK = /^(https?:\/\/[^\s]+|mailto:[^\s]+|\/[^\s]*)$/i; // blocks javascript:, data:, etc.

/** Validates and normalises one field value. Returns the clean value or an error message. */
export function cleanField(f: Field, raw: unknown): { value?: unknown; error?: string } {
  switch (f.type) {
    case "bool": return { value: Boolean(raw) };
    case "int": {
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 1900 || n > 2100) return { error: `${f.label}: isi angka tahun yang valid` };
      return { value: n };
    }
    case "tags": {
      if (!Array.isArray(raw)) return { value: [] };
      const list = raw.map(x => String(x).trim()).filter(Boolean);
      if (list.length > 30 || list.some(x => x.length > 120)) return { error: `${f.label}: terlalu banyak atau terlalu panjang` };
      return { value: list };
    }
    case "select": {
      const v = String(raw ?? "");
      return f.options?.includes(v) ? { value: v } : { error: `${f.label}: pilihan tidak valid` };
    }
    default: {
      const v = String(raw ?? "").trim();
      const max = f.max ?? (f.type === "textarea" ? 5000 : TEXT_MAX);
      if (v.length > max) return { error: `${f.label}: maksimal ${max} karakter` };
      if (f.required && !v) return { error: `${f.label} wajib diisi` };
      if ((f.type === "url" || f.type === "image" || f.type === "file") && v && !URL_OK.test(v)) return { error: `${f.label}: gunakan tautan https://, mailto: atau alamat yang diawali /` };
      if (f.key === "slug" && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) return { error: "Slug hanya huruf kecil, angka, dan tanda hubung" };
      if (f.key === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { error: "Email kontak tidak valid" };
      return { value: v };
    }
  }
}

export function cleanRecord(fields: Field[], input: Record<string, unknown>): { values?: Record<string, unknown>; error?: string } {
  const values: Record<string, unknown> = {};
  for (const f of fields) {
    const r = cleanField(f, input[f.key]);
    if (r.error) return { error: r.error };
    values[f.key] = r.value;
  }
  return { values };
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

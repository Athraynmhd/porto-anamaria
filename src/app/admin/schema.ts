/** Single source of truth for what the admin can edit. Used by the UI and re-checked on the server. */
export type FieldType = "text" | "textarea" | "image" | "file" | "url" | "tags" | "select" | "bool" | "int";
export type Field = { key: string; label: string; type: FieldType; max?: number; options?: string[]; required?: boolean; hint?: string };
export type TableDef = { label: string; fields: Field[]; ordered: boolean; hasKind: boolean };

export const SETTINGS_SECTIONS: { title: string; fields: Field[] }[] = [
  { title: "Identitas", fields: [
    { key: "name", label: "Nama lengkap", type: "text", required: true, max: 80 },
    { key: "first_line", label: "Nama baris 1", type: "text", required: true, max: 40 },
    { key: "second_line", label: "Nama baris 2", type: "text", required: true, max: 40 },
    { key: "greeting", label: "Sapaan", type: "text", max: 40 },
    { key: "description", label: "Bio singkat", type: "textarea", max: 1200 },
    { key: "email", label: "Email kontak", type: "text", max: 120 },
    { key: "cv_url", label: "File CV (PDF)", type: "file", hint: "Unggah PDF atau isi tautan." },
  ] },
  { title: "Hero (halaman pertama)", fields: [
    { key: "hero_title_1", label: "Judul baris 1", type: "text", max: 60 },
    { key: "hero_title_2", label: "Judul baris 2", type: "text", max: 60 },
    { key: "hero_garden", label: "Gambar latar", type: "image" },
    { key: "hero_foreground", label: "Foto utama (transparan)", type: "image" },
    { key: "hero_tree_left", label: "Pohon kiri (desktop)", type: "image" },
    { key: "hero_tree_right", label: "Pohon kanan (desktop)", type: "image" },
    { key: "hero_alt", label: "Deskripsi foto utama", type: "text", max: 160 },
  ] },
  { title: "Foto di bagian About & Kontak", fields: [
    { key: "portrait", label: "Foto profil", type: "image" },
    { key: "portrait_reveal", label: "Foto saat kursor di atas profil", type: "image" },
    { key: "event_image", label: "Foto kegiatan (bagian kontak)", type: "image" },
  ] },
  { title: "SEO & pratinjau tautan", fields: [
    { key: "seo_title", label: "Judul di Google", type: "text", max: 90 },
    { key: "seo_description", label: "Deskripsi di Google", type: "textarea", max: 300 },
    { key: "seo_image", label: "Gambar pratinjau tautan", type: "image" },
  ] },
  { title: "Footer", fields: [
    { key: "footer_label", label: "Nama di footer", type: "text", max: 60 },
    { key: "footer_text", label: "Teks footer", type: "text", max: 120 },
    { key: "footer_year", label: "Tahun", type: "int" },
  ] },
];

export const SETTINGS_FIELDS = SETTINGS_SECTIONS.flatMap(s => s.fields);

export const TABLES: Record<string, TableDef> = {
  projects: { label: "Proyek", ordered: true, hasKind: false, fields: [
    { key: "title", label: "Judul", type: "text", required: true, max: 120 },
    { key: "slug", label: "Alamat halaman (slug)", type: "text", required: true, max: 80, hint: "Huruf kecil, angka, dan tanda hubung. Mengubahnya mengubah alamat halaman." },
    { key: "description", label: "Deskripsi", type: "textarea", max: 5000 },
    { key: "img", label: "Gambar", type: "image" },
    { key: "tech_stack", label: "Metode / keahlian (satu per baris)", type: "tags" },
    { key: "features", label: "Poin tambahan (satu per baris)", type: "tags" },
    { key: "link", label: "Tautan proyek", type: "url" },
    { key: "github", label: "Tautan GitHub", type: "url" },
    { key: "published", label: "Tampilkan di situs", type: "bool" },
  ] },
  timeline_entries: { label: "Pendidikan & pengalaman", ordered: true, hasKind: true, fields: [
    { key: "kind", label: "Jenis", type: "select", options: ["education", "experience"], required: true },
    { key: "company", label: "Institusi / kegiatan", type: "text", required: true, max: 160 },
    { key: "role", label: "Peran / gelar", type: "text", max: 160 },
    { key: "year", label: "Tahun", type: "text", max: 40 },
    { key: "logo", label: "Gambar", type: "image" },
    { key: "subtitle", label: "Keterangan", type: "text", max: 160 },
    { key: "tag", label: "Label", type: "text", max: 40 },
  ] },
  credentials: { label: "Sertifikat & penghargaan", ordered: true, hasKind: true, fields: [
    { key: "kind", label: "Jenis", type: "select", options: ["certificate", "award"], required: true },
    { key: "title", label: "Judul", type: "text", required: true, max: 200 },
    { key: "img", label: "Gambar", type: "image" },
  ] },
  gallery_photos: { label: "Galeri", ordered: true, hasKind: false, fields: [
    { key: "src", label: "Foto", type: "image", required: true },
    { key: "alt", label: "Deskripsi foto (untuk aksesibilitas)", type: "text", max: 200 },
  ] },
  contact_links: { label: "Kontak & publikasi", ordered: true, hasKind: false, fields: [
    { key: "name", label: "Nama", type: "text", required: true, max: 160 },
    { key: "handle", label: "Keterangan", type: "text", max: 160 },
    { key: "href", label: "Tautan", type: "url", required: true },
    { key: "kind", label: "Jenis (menentukan ikon)", type: "select", options: ["email", "cv", "publication", "link"], required: true },
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

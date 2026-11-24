# Portofolio Ana Maria

Situs portofolio dengan Next.js, TypeScript, Tailwind CSS, dan GSAP. Isinya disimpan di Supabase dan diedit lewat panel `/admin`.

## Menjalankan

```bash
npm install
cp .env.example .env.local   # isi URL dan publishable key Supabase
npm run dev
```

Buka http://127.0.0.1:3000. Perlu Node.js 20.9 atau lebih baru.

## Mengubah isi

Login di `/admin`, edit, lalu simpan. Situs publik langsung diperbarui tanpa deploy ulang. Panel mencakup profil, SEO, proyek, pendidikan, pengalaman, sertifikat, penghargaan, galeri, kontak, dan ganti password.

Folder `src/data/` hanya berisi salinan isi awal yang dipakai sebagai cadangan kalau Supabase tidak bisa dijangkau.

## Deploy (Vercel)

1. Import repo ke Vercel (preset Next.js).
2. Isi Environment Variables: `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (lihat `.env.example`).
3. Deploy.

Jangan pernah menaruh kunci `service_role` di repo atau di variabel `NEXT_PUBLIC_*`.

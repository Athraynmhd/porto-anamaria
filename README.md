# Portofolio Ana Maria

Situs portofolio statis dibuat dengan Next.js, TypeScript, Tailwind CSS, dan GSAP.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://127.0.0.1:3000. Perlu Node.js 20.9 atau lebih baru.

## Build

```bash
npm run build   # hasil di folder out/
npm start       # preview hasil build
```

## Mengubah isi

Semua teks dan gambar ada di `src/data/` dan `public/content/`. Panduan lengkap: [CONTENT_GUIDE.md](CONTENT_GUIDE.md).

## Deploy

Import repo ke Vercel (preset Next.js). Opsional, isi `NEXT_PUBLIC_SITE_URL` dengan domain situs.

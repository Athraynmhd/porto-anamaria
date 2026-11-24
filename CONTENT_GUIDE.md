# Mengganti isi portofolio

Konten portofolio Ana Maria ada di `src/data/` dan `public/content/`.

| Yang diganti | Sumber |
| --- | --- |
| Nama, sapaan, bio, CV, email | `src/data/site.ts` → `profile` |
| Dua baris judul, latar taman, potret transparan, dan daun hero | `src/data/site.ts` → `hero` |
| Foto profil, foto reveal, foto acara | `src/data/site.ts` → `images` |
| Judul Google, deskripsi dan gambar pratinjau tautan | `src/data/site.ts` → `seo` |
| Nama dan tahun footer | `src/data/site.ts` → `footer` |
| Proyek dan halaman detail | `src/data/projects.json` |
| Pengalaman | `src/data/experiences.json` |
| Pendidikan, sertifikat, penghargaan, tautan kontak | `src/data/portfolio.ts` |
| Foto galeri dan deskripsi aksesibel | `src/data/gallery.json` |

Taruh aset baru di `public/content/`. Path `/content/foto.webp` merujuk ke `public/content/foto.webp`. Nama berkas sebaiknya memakai huruf kecil dan tanda hubung. CV publik ada di `public/content/cv-ana-maria.pdf`.

Foto profil/reveal: gunakan PNG/WebP transparan berbentuk persegi, posisi kepala dan badan sejajar pada kedua gambar. Hero memakai latar taman, potret transparan, dan lapisan daun. Posisi potret dan bingkai daun diatur di `src/app/layout-overrides.css`. Proyek: thumbnail lanskap, subjek utama di tengah; kartu memakai crop berbeda di desktop dan ponsel. Sertifikat: lanskap 4:3 disarankan. Galeri: potret 4:5 disarankan. Hindari teks penting di tepi gambar karena `object-fit: cover`.

Pada proyek, isi `title`, `slug`, `description`, `img`, `tech_stack`, `features`, `link`, dan `github`. `slug` harus unik, huruf kecil/angka/tanda hubung; perubahan slug mengubah alamat halaman. Jumlah kartu dan jarak scroll dihitung otomatis. Pertahankan minimal satu proyek dan satu foto galeri. Kosongkan tautan yang belum tersedia; jangan memakai `#` untuk alamat proyek.

Untuk teks panjang, pertahankan nama dalam dua baris melalui `firstLine` dan `secondLine`. Panjang nama/bio yang jauh berbeda perlu diperiksa di ponsel. Jumlah folder dihitung dari data.

Setelah penggantian, jalankan `npm run content:check`, lalu `npm run build` dan cek hasilnya dengan `npm start`. Perubahan konten membutuhkan build ulang untuk deployment statis. Form dan komentar tetap frontend saja.

Pengaturan gerak terpisah di `src/lib/motion.ts`: durasi wheel, respons hero, carousel, galeri, dan entrance. Preferensi reduced motion tetap dihormati. Ukuran, grid, urutan bagian, dan geometri transisi tidak perlu diubah saat mengganti isi.

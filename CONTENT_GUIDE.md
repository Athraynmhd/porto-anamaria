# Mengganti isi portofolio

Semua isi diedit di `/admin` (login dengan akun admin). Yang bisa diubah: nama, bio, foto, hero, SEO, footer, proyek, pendidikan, pengalaman, sertifikat, penghargaan, galeri, kontak, dan CV.

Gambar: unggah langsung dari panel (WebP, JPG, atau PNG, maksimal 8 MB; CV berupa PDF). Foto profil dan foto saat kursor di atas profil sebaiknya persegi dengan posisi kepala yang sama. Hero memakai latar, foto utama transparan, dan dua pohon (pohon hanya tampil di layar lebar). Thumbnail proyek: lanskap atau peta utuh. Galeri: potret 4:5.

Proyek: `slug` harus unik (huruf kecil, angka, tanda hubung); mengubahnya mengubah alamat halaman. Matikan “Tampilkan di situs” untuk menyembunyikan proyek tanpa menghapus. Urutan di panel sama dengan urutan di situs.

Tata letak dan animasi ada di kode: `src/lib/motion.ts` (pengaturan gerak) dan `src/app/layout-overrides.css`.

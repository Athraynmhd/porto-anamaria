import galleryData from "./gallery.json";
import projectData from "./projects.json";
import experienceData from "./experiences.json";
import { site } from "./site";

export const projects = projectData;
export type Project = (typeof projects)[number];
export const experiences = experienceData;

export const education = [
  {
    company: "Universitas Syiah Kuala",
    role: "Sarjana Biologi",
    year: "2022?2026",
    logo: "/content/wisuda.webp",
    subtitle: "FMIPA – Minat Ekologi",
    tag: "IPK 3,51/4,00",
  },
];

export const certificates = [
  { title: "Presenter – ICeBES 2024", img: "/content/sertifikat-icebes.webp" },
  { title: "Student Mobility – TAR UMT", img: "/content/sertifikat-mobility.webp" },
  { title: "Kuliah Tamu Internasional – Konflik Manusia dan Harimau", img: "/content/sertifikat-konflik-harimau.webp" },
  { title: "Seminar dan Workshop Penanganan Mamalia Laut Terdampar", img: "/content/sertifikat-mamalia-laut.webp" },
  { title: "Anggota Bidang Kesenian – Himpunan Mahasiswa Biologi", img: "/content/sertifikat-himpunan.webp" },
  { title: "Guest Lecturer – Marine Biodiversity", img: "/content/sertifikat-kuliah-tamu.webp" },
  { title: "Pelatihan Bioplastik", img: "/content/sertifikat-bls.webp" },
];

export const awards = [
  { title: "Juara II Tunggal Putri – Turnamen Tenis Meja UKM UIN Ar-Raniry", img: "/content/juara-tenis-meja.webp" },
  { title: "Penghargaan Narasumber – Tour Laboratorium Biofair 2026", img: "/content/penghargaan-biofair.webp" },
];

export const gallery = galleryData;
export const profile = site.profile;
export { site };

export const contactLinks = [
  { name: "Email", handle: profile.email, href: `mailto:${profile.email}`, kind: "email" },
  { name: "CV Ana Maria", handle: "Pendidikan dan pengalaman", href: profile.cv, kind: "cv" },
  { name: "Keanekaragaman Burung Perkotaan", handle: "Jurnal Bioleuser – 2024", href: "https://jurnal.usk.ac.id/bioleuser/article/download/38644/22552", kind: "publication" },
  { name: "Paparan Nitrat pada Air Minum", handle: "J-KESMAS – 2026", href: "https://journal.lppm-unasman.ac.id/index.php/jikm/article/download/7132/pdf", kind: "publication" },
] as const;

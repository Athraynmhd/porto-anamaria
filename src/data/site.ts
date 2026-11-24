const name = "Ana Maria";

export const site = {
  profile: {
    name,
    firstLine: "Ana",
    secondLine: "Maria",
    greeting: "Hi, I'm",
    description: "Saya lulusan Biologi Universitas Syiah Kuala dengan minat pada ekologi, biodiversitas, dan analisis geospasial. Saya menggunakan ArcGIS dan Google Earth Engine untuk mengolah data lingkungan, dengan pengalaman penelitian vegetasi di Sabang dan pendampingan praktikum biologi.",
    cv: "/content/cv-ana-maria.pdf",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "aniemaria270205@gmail.com",
  },
  hero: {
    title: ["WELCOME TO MY", "PORTFOLIO"],
    garden: "/content/hero-garden.webp",
    foreground: "/content/hero-ana.webp",
    trees: { left: "/content/hero-tree-left.webp", right: "/content/hero-tree-right.webp" },
    foregroundAlt: "Ana Maria di taman",
  },
  images: {
    portrait: "/content/profil-ana.webp",
    portraitReveal: "/content/profil-itadori.webp",
    event: "/content/biofair.webp",
  },
  seo: {
    title: `${name} | Portofolio Ekologi dan GIS`,
    description: "Portofolio Ana Maria, lulusan Biologi Universitas Syiah Kuala. Riset ekologi, pemetaan GIS, dan dokumentasi kegiatan lapangan.",
    image: "/content/ana-preview.webp",
  },
  footer: { year: 2026, label: name, text: "All Rights Reserved." },
};

import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { site as fallbackSite } from "@/data/site";
import * as fallback from "@/data/portfolio";

/** Everything the public site renders. Same shapes the components already used. */
export type SiteData = typeof fallbackSite;
export type Project = { title: string; slug: string; img: string; description: string; tech_stack: string[]; features: string[]; link: string; github: string };
export type Entry = { company: string; role: string; year: string; logo: string; subtitle: string; tag: string };
export type Credential = { title: string; img: string };
export type Photo = { src: string; alt: string };
export type ContactLink = { name: string; handle: string; href: string; kind: string };
export type Content = {
  site: SiteData; projects: Project[]; education: Entry[]; experiences: Entry[];
  certificates: Credential[]; awards: Credential[]; gallery: Photo[]; contactLinks: ContactLink[];
};

/** Bundled copy of the original content, used when Supabase is unreachable or not configured. */
function bundled(): Content {
  return {
    site: fallbackSite,
    projects: fallback.projects.map(p => ({ features: [], github: "", ...p })) as Project[],
    education: fallback.education, experiences: fallback.experiences,
    certificates: fallback.certificates, awards: fallback.awards, gallery: fallback.gallery,
    contactLinks: fallback.contactLinks.map(l => ({ ...l })),
  };
}

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function loadFromSupabase(): Promise<Content> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase env not set");
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const ordered = (table: string) => db.from(table).select("*").order("sort_order").order("created_at");
  const [s, p, t, c, g, l] = await Promise.all([
    db.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ordered("projects"), ordered("timeline_entries"), ordered("credentials"), ordered("gallery_photos"), ordered("contact_links"),
  ]);
  for (const r of [s, p, t, c, g, l]) if (r.error) throw r.error;
  const r = s.data as Row | null;
  if (!r) throw new Error("site_settings is empty");

  const entry = (e: Row): Entry => ({ company: e.company, role: e.role, year: e.year, logo: e.logo, subtitle: e.subtitle, tag: e.tag });
  const timeline = (t.data ?? []) as Row[];
  const creds = (c.data ?? []) as Row[];
  return {
    site: {
      profile: { name: r.name, firstLine: r.first_line, secondLine: r.second_line, greeting: r.greeting, description: r.description, cv: r.cv_url, email: r.email },
      hero: { title: [r.hero_title_1, r.hero_title_2], garden: r.hero_garden, foreground: r.hero_foreground, trees: { left: r.hero_tree_left, right: r.hero_tree_right }, foregroundAlt: r.hero_alt },
      images: { portrait: r.portrait, portraitReveal: r.portrait_reveal, event: r.event_image },
      seo: { title: r.seo_title, description: r.seo_description, image: r.seo_image },
      footer: { year: r.footer_year, label: r.footer_label, text: r.footer_text },
    },
    projects: ((p.data ?? []) as Row[]).map(x => ({ title: x.title, slug: x.slug, img: x.img, description: x.description, tech_stack: x.tech_stack ?? [], features: x.features ?? [], link: x.link, github: x.github })),
    education: timeline.filter(e => e.kind === "education").map(entry),
    experiences: timeline.filter(e => e.kind === "experience").map(entry),
    certificates: creds.filter(e => e.kind === "certificate").map(e => ({ title: e.title, img: e.img })),
    awards: creds.filter(e => e.kind === "award").map(e => ({ title: e.title, img: e.img })),
    gallery: ((g.data ?? []) as Row[]).map(e => ({ src: e.src, alt: e.alt })),
    contactLinks: ((l.data ?? []) as Row[]).map(e => ({ name: e.name, handle: e.handle, href: e.href, kind: e.kind })),
  };
}

// Cached for an hour and invalidated instantly by updateTag("content") when the admin saves.
// Failures are not cached (unstable_cache only stores successful results).
const cached = unstable_cache(loadFromSupabase, ["content-v1"], { tags: ["content"], revalidate: 3600 });

export async function getContent(): Promise<Content> {
  try { return await cached(); }
  catch (error) { console.error("Content: using bundled fallback.", error); return bundled(); }
}

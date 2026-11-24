import { getContent } from "@/lib/content";
import { ContentProvider } from "@/components/content-provider";
import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./layout-overrides.css";

const funnelDisplay=localFont({
  src:"./fonts/FunnelDisplay.woff2",
  variable:"--font-funnel-display",
  weight:"300 800",
  display:"swap",
});

// Order: explicit override, then the production domain Vercel assigns at build time, then local dev.
const siteUrl=process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:"http://localhost:3000");
export async function generateMetadata(): Promise<Metadata>{
  const {site}=await getContent();
  return {
    metadataBase:new URL(siteUrl),
    title:{default:site.seo.title,template:`%s | ${site.profile.name}`},
    description:site.seo.description,
    openGraph:{title:site.seo.title,description:site.seo.description,type:"website",locale:"id_ID",images:[{url:site.seo.image,alt:site.seo.title}]},
    twitter:{card:"summary_large_image"},
    robots:{index:true,follow:true},
  };
}
export const viewport:Viewport={themeColor:"#030712",width:"device-width",initialScale:1};
export default async function RootLayout({children}:{children:React.ReactNode}) {
  const content=await getContent();
  return <html lang="id" className={funnelDisplay.variable}><body><a className="skip-link" href="#main-content">Lewati ke konten</a><ContentProvider value={content}><Providers>{children}</Providers></ContentProvider></body></html>;
}

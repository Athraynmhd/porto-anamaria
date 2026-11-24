import { site } from "@/data/site";
export function Footer(){return <footer className="footer">© {site.footer.year} <a href="/#Home">{site.footer.label}</a>. {site.footer.text}</footer>;}

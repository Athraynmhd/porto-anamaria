"use client";
import { useContent } from "./content-provider";

export function Footer(){
  const {footer}=useContent().site;
  return <footer className="footer">© {footer.year} <a href="/#Home">{footer.label}</a>. {footer.text}</footer>;
}

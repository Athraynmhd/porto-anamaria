"use client";
import { useRef,useState } from "react";
import Link from "next/link";
import { ArrowLeft,Box,ChevronDown,ChevronRight,Code,ExternalLink } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import type { Project } from "@/lib/content";
import { Button } from "./ui/button";
import { Footer } from "./footer";
import { Dialog,DialogContent,DialogTitle,DialogDescription } from "./ui/dialog";

export function ProjectDetail({project}:{project:Project}){
  const ref=useRef<HTMLElement>(null);
  const [expanded,setExpanded]=useState(false);
  const [preview,setPreview]=useState(false);
  useGSAP(()=>{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)gsap.from(".detail-reveal",{y:25,opacity:0,stagger:.1,duration:.65,ease:"power3.out"});},{scope:ref});
  return <main id="main-content" ref={ref} className="project-detail"><div className="detail-shell"><nav aria-label="Breadcrumb" className="detail-breadcrumb detail-reveal"><Button variant="outline" asChild><Link href="/#Portofolio-content"><ArrowLeft size={18}/>Back</Link></Button><Link href="/#Portofolio-content">Projects</Link><ChevronRight size={16}/><span>{project.title}</span></nav><div className="detail-grid"><div className="detail-copy detail-reveal"><h1>{project.title}</h1><p className={`detail-description ${!expanded&&project.description.length>500?"collapsed":""}`}>{project.description}</p>{project.description.length>500&&<button type="button" className="expand-description" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?"Lihat lebih sedikit":"Lihat selengkapnya"}<ChevronDown size={16} style={{transform:expanded?"rotate(180deg)":undefined}}/></button>}<h2><Code size={20}/>Metode & Keahlian</h2><ul className="tech-list">{project.tech_stack.map(t=><li key={t}>{["HTML","CSS","JavaScript","React","React JS"].includes(t)?<Code size={16}/>:<Box size={16}/>} {t}</li>)}</ul>{project.link&&<Button asChild><a href={project.link} target="_blank" rel="noopener noreferrer">Live Demo<ExternalLink size={16}/></a></Button>}</div><button className="detail-image detail-reveal" type="button" onClick={()=>setPreview(true)} aria-label={`Perbesar gambar ${project.title}`}><img src={project.img} alt={project.title} fetchPriority="high"/></button></div></div><Footer/><Dialog open={preview} onOpenChange={setPreview}><DialogContent className="image-dialog"><DialogTitle className="sr-only">{project.title}</DialogTitle><DialogDescription className="sr-only">Pratinjau karya {project.title}.</DialogDescription><img src={project.img} alt={project.title}/></DialogContent></Dialog></main>;
}

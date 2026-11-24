"use client";
import { revealOnScroll } from "@/lib/motion";
import { useEffect,useRef,useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Code,FileText } from "lucide-react";
import { useContent } from "./content-provider";
import { Button } from "./ui/button";
import { Topography } from "./topography";
import { useSmoothScroll } from "./providers";
import { GlassFolder } from "./ui/glass-folder";

type Entry={company:string;role:string;year:string;logo:string;subtitle:string;tag:string};
function Timeline({title,entries}:{title:string;entries:Entry[]}){
  const [active,setActive]=useState(0);
  return <div className="timeline-column"><h3>{title}</h3><div className="timeline-list" data-lenis-prevent={entries.length>3?"":undefined}>
    {entries.map((entry,i)=><button key={entry.company} type="button" className={`timeline-entry ${active===i?"selected":""}`} onMouseEnter={()=>setActive(i)} onClick={()=>setActive(i)} aria-pressed={active===i}>
      <span className="timeline-number">{i+1}</span><span className="timeline-content"><span className="timeline-heading"><img src={entry.logo} alt="" loading="lazy" decoding="async"/><strong title={entry.company}>{entry.company}</strong><small>{entry.year}</small></span><span className="timeline-role">{entry.role}</span><span className="timeline-meta">{entry.subtitle}<span>•</span><span className="timeline-tag">{entry.tag}</span></span></span>
    </button>)}
  </div>{entries.length>3&&<div className="timeline-bottom"/>}</div>;
}
export function About(){
  const {site,projects,certificates,awards,education,experiences}=useContent();const profile=site.profile;
  const ref=useRef<HTMLElement>(null);
  const [portraitPinned,setPortraitPinned]=useState(false);
  const [portraitHovered,setPortraitHovered]=useState(false);
  const [hint,setHint]=useState(false);
  const hintDone=useRef(false),photo=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const observer=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!hintDone.current){setHint(true);hintDone.current=true;}},{threshold:.2});if(photo.current)observer.observe(photo.current);return ()=>observer.disconnect();},[]);
  const {scrollTo}=useSmoothScroll();
  useGSAP(()=>{
    const mm=gsap.matchMedia();mm.add("(prefers-reduced-motion: no-preference)",()=>{
      revealOnScroll(".reveal",ref.current);
    });return ()=>mm.revert();
  },{scope:ref});
  const openTab=(tab:string)=>{window.dispatchEvent(new CustomEvent("portfolio-tab",{detail:tab}));scrollTo("#Portofolio-content");};
  return <section id="About" ref={ref} className="about"><Topography/><div className="section-inner">
    <h2 className="section-heading reveal">About Me</h2><div className="profile-grid">
      <div className="profile-intro reveal"><h3><span>{profile.greeting}</span>{profile.firstLine} <br/>{profile.secondLine}</h3><Button asChild><a href={profile.cv} target="_blank" rel="noopener noreferrer"><FileText size={16}/>View CV</a></Button></div>
      <button ref={photo} type="button" className={`profile-photo ${portraitHovered?"is-revealed":""} ${portraitPinned?"is-pinned":""} ${hint?"portrait-hint":""}`} onClick={()=>{
        setHint(false);
        setPortraitPinned(value=>!value);
      }} onPointerMove={event=>{
        if(event.pointerType==="touch")return;
        const bounds=event.currentTarget.getBoundingClientRect();
        const radius=Math.min(156,bounds.width*.25);
        event.currentTarget.style.setProperty("--reveal-mask",`radial-gradient(circle ${radius}px at ${event.clientX-bounds.left}px ${event.clientY-bounds.top}px,black 62%,transparent 100%)`);
        if(!portraitHovered){
          setHint(false);
          setPortraitHovered(true);
        }
      }} onPointerLeave={()=>setPortraitHovered(false)}
      onAnimationEnd={()=>setHint(false)} aria-label="Tampilkan potret Itadori" aria-pressed={portraitPinned}><img src={site.images.portrait} alt={profile.name} loading="lazy" decoding="async"/><img className="portrait-reveal" src={site.images.portraitReveal} alt="" loading="lazy" decoding="async"/></button>
      <div className="profile-description reveal"><p>{profile.description}</p><Button asChild><a href="#Portofolio" onClick={e=>{e.preventDefault();scrollTo("#Portofolio");}}><Code size={18}/>View Projects</a></Button></div>
      <div className="mobile-profile-actions"><Button asChild><a href={profile.cv} target="_blank" rel="noopener noreferrer"><FileText size={16}/>View CV</a></Button><Button asChild><a href="#Portofolio" onClick={e=>{e.preventDefault();scrollTo("#Portofolio");}}><Code size={18}/>View Projects</a></Button></div>
    </div><div className="timeline-grid reveal"><Timeline title="Education" entries={education}/><Timeline title="Experience" entries={experiences}/></div>
    <div className="folder-grid"><div className="reveal"><GlassFolder title="Projects" count={projects.length} images={projects.map(p=>p.img)} onExplore={()=>openTab("Projects")}/></div><div className="reveal"><GlassFolder title="Certificates" count={certificates.length} images={certificates.map(p=>p.img)} onExplore={()=>openTab("Certificates")}/></div><div className="reveal"><GlassFolder title="Awards" count={awards.length} images={awards.map(p=>p.img)} onExplore={()=>openTab("Awards")}/></div></div>
  </div></section>;
}

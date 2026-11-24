"use client";
import { motion } from "@/lib/motion";
import { useEffect,useRef,useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight,Award,ChevronLeft,ChevronRight,Code,Trophy,ZoomIn } from "lucide-react";
import { projects,certificates,awards } from "@/data/portfolio";
import { PortfolioTransition } from "./portfolio-transition";
import { Button } from "./ui/button";
import { Dialog,DialogContent,DialogTitle,DialogDescription } from "./ui/dialog";
import { useSmoothScroll } from "./providers";

const tabs=[{name:"Projects",icon:Code},{name:"Certificates",icon:Award},{name:"Awards",icon:Trophy}] as const;
type Tab=typeof tabs[number]["name"];
export function Portfolio({children}:{children:React.ReactNode}){
  const [tab,setTab]=useState<Tab>("Projects");
  const [preview,setPreview]=useState<{img:string;title:string}|null>(null);
  const [index,setIndex]=useState(0);
  const area=useRef<HTMLElement>(null);
  const track=useRef<HTMLDivElement>(null);
  const scrollTrigger=useRef<ScrollTrigger|null>(null);
  const dragStart=useRef<number|null>(null);
  const {scrollTo}=useSmoothScroll();
  const items=tab==="Projects"?projects:tab==="Certificates"?certificates:awards;
  const activate=(value:Tab)=>{setTab(value);setIndex(0);if(area.current){const y=area.current.getBoundingClientRect().top+window.scrollY;if(window.scrollY>y+5)scrollTo(y,{immediate:true});}};
  useEffect(()=>{const fn=(event:Event)=>{const value=(event as CustomEvent).detail;if(tabs.some(t=>t.name===value)){setTab(value);setIndex(0);}};window.addEventListener("portfolio-tab",fn);return ()=>window.removeEventListener("portfolio-tab",fn);},[]);
  useGSAP(()=>{
    if(!area.current||!track.current)return;
    const mm=gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)",()=>{
      const distance=()=>Math.max(0,(track.current?.scrollWidth??0)-innerWidth+innerWidth*(innerWidth>=768?.1:.05));
      const measure=()=>{if(area.current)area.current.style.height=`calc(100svh + ${Math.round(distance()*1.05)}px)`;};measure();
      const resizeObserver=new ResizeObserver(()=>{measure();ScrollTrigger.refresh();});resizeObserver.observe(track.current!);
      const tween=gsap.fromTo(track.current,{x:0},{x:()=>-distance(),ease:"none",scrollTrigger:{trigger:area.current,start:()=>`top+=${(area.current!.offsetHeight-innerHeight)*.04} top`,end:()=>`bottom-=${(area.current!.offsetHeight-innerHeight)*.04} bottom`,scrub:motion.carouselScrub,invalidateOnRefresh:true,onUpdate:self=>setIndex(distance()>0?Math.round(self.progress*(items.length-1)):0)}});
      scrollTrigger.current=tween.scrollTrigger??null;
      return ()=>{scrollTrigger.current=null;resizeObserver.disconnect();};
    });
    const frame=requestAnimationFrame(()=>ScrollTrigger.refresh());
    return ()=>{cancelAnimationFrame(frame);mm.revert();};
  },{scope:area,dependencies:[tab],revertOnUpdate:true});
  const move=(direction:number)=>{
    const next=Math.max(0,Math.min(items.length-1,index+direction));
    if(scrollTrigger.current){const st=scrollTrigger.current;scrollTo(st.start+(st.end-st.start)*next/Math.max(1,items.length-1));}
    else if(track.current){const card=track.current.children[next] as HTMLElement;card?.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"});setIndex(next);}
  };
  return <PortfolioTransition><section id="Portofolio-Gallery" className="portfolio-carousel" ref={area} style={{"--items":items.length} as React.CSSProperties} aria-label="Portofolio karya">
    <div className="portfolio-sticky"><div className="portfolio-heading"><h2>Portofolio</h2><div className="portfolio-tabs" role="tablist" aria-label="Kategori portofolio">{tabs.map(({name,icon:Icon})=><button key={name} role="tab" id={`tab-${name}`} aria-selected={tab===name} aria-controls="portfolio-panel" tabIndex={tab===name?0:-1} onClick={()=>activate(name)} onKeyDown={e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();const current=tabs.findIndex(t=>t.name===tab);const next=tabs[(current+(e.key==="ArrowRight"?1:2))%3].name;activate(next);document.getElementById(`tab-${next}`)?.focus();}}} className={tab===name?"selected":""}><Icon size={20}/>{name}</button>)}</div></div>
      <div className="carousel-window" id="portfolio-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0} onKeyDown={e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();move(e.key==="ArrowRight"?1:-1);}}} onPointerDown={e=>{dragStart.current=e.clientX;}} onPointerUp={e=>{if(dragStart.current!==null&&Math.abs(e.clientX-dragStart.current)>65)move(e.clientX<dragStart.current?1:-1);dragStart.current=null;}} onPointerCancel={()=>{dragStart.current=null;}}>
        <div className="carousel-track" ref={track}>{tab==="Projects"?projects.map(p=><article className="project-card" key={p.slug}><Link href={`/project/${p.slug}/`} tabIndex={-1} aria-hidden="true"><img src={p.img} alt={p.title} loading="lazy" width={430} height={215}/></Link><h3>{p.title}</h3><p>{p.description.replace(/\s+/g," ")}</p><Button size="sm" asChild><Link href={`/project/${p.slug}/`} aria-label={`Details ${p.title}`}>Details<ArrowRight size={16}/></Link></Button></article>):items.map((p,i)=><button className="certificate-card" key={p.img} type="button" onClick={()=>setPreview(p)} aria-label={`${tab==="Awards"?"Lihat penghargaan":"Lihat sertifikat"} ${i+1}: ${p.title}`}><img src={p.img} alt={p.title} loading="lazy"/><span><ZoomIn size={20}/>{tab==="Awards"?"View Award":"View Certificate"}</span></button>)}</div>
      </div>
      <button type="button" className="carousel-arrow carousel-prev" aria-label="Previous card" onClick={()=>move(-1)}><ChevronLeft/></button><button type="button" className="carousel-arrow carousel-next" aria-label="Next card" onClick={()=>move(1)}><ChevronRight/></button>
      <span className="sr-only" aria-live="polite">{tab}, kartu {index+1} dari {items.length}</span>
    </div>
  </section>{children}<Dialog open={!!preview} onOpenChange={open=>{if(!open)setPreview(null);}}><DialogContent className="image-dialog"><DialogTitle className="sr-only">{preview?.title??"Sertifikat"}</DialogTitle><DialogDescription className="sr-only">Tekan Escape untuk menutup pratinjau.</DialogDescription>{preview&&<img src={preview.img} alt={preview.title}/>}</DialogContent></Dialog></PortfolioTransition>;
}

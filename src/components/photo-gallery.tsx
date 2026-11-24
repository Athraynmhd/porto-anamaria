"use client";
import { motion } from "@/lib/motion";
import { useRef,useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useContent } from "./content-provider";
import { Dialog,DialogContent,DialogTitle,DialogDescription } from "./ui/dialog";
export function PhotoGallery(){
  const {site,gallery}=useContent();const profile=site.profile;
  const ref=useRef<HTMLElement>(null);
  const [selected,setSelected]=useState<number|null>(null);
  useGSAP(()=>{const mm=gsap.matchMedia();mm.add({motion:"(prefers-reduced-motion: no-preference)",mobile:"(max-width: 767px)"},context=>{
    if(!context.conditions?.motion)return;
    const mobile=context.conditions.mobile,photos=gsap.utils.toArray<HTMLElement>(".gallery-photo"),state={progress:0,x:0,y:0};
    const render=()=>{const progress=.14+state.progress*.88;photos.forEach((el,i)=>{const entry=i/photos.length*.45,local=Math.max(0,Math.min(1,(progress-entry)/.55)),z=(mobile?-1200:-1700)+local*(mobile?1550:2200),angle=137.5*i*Math.PI/180,x=Math.cos(angle)*innerWidth*(.28+i%3*.08)-state.x*(mobile?20:45),y=Math.sin(angle)*innerHeight*(.26+i%2*.09)-state.y*(mobile?20:45),rotation=(i%2===0?1:-1)*(3+i%5*2),opacity=local<.18?local/.18:local>.82?Math.max(0,1-(local-.82)/.16):1;const width=`${mobile?Math.max(135,Math.min(185,innerWidth*.38)):Math.max(195,Math.min(285,innerWidth*.19))}px`;if(el.style.width!==width)el.style.width=width;el.style.transform=`translate3d(calc(-50% + ${x}px),calc(-50% + ${y}px),${z}px) rotateZ(${rotation}deg)`;el.style.opacity=String(opacity);el.style.pointerEvents=local>.06&&local<.86?'auto':'none';});};
    gsap.to(state,{progress:1,ease:"none",onUpdate:render,scrollTrigger:{trigger:ref.current,start:"top 30%",end:"bottom bottom",scrub:motion.galleryScrub,invalidateOnRefresh:true}});
    const setX=gsap.quickTo(state,'x',{duration:.5,ease:'power2.out',onUpdate:render}),setY=gsap.quickTo(state,'y',{duration:.5,ease:'power2.out',onUpdate:render});
    const pointer=(e:PointerEvent)=>{if(ref.current){const r=ref.current.getBoundingClientRect();if(r.top>innerHeight+250||r.bottom< -250)return;}setX(2*(e.clientX/innerWidth-.5));setY(2*(e.clientY/innerHeight-.5));};window.addEventListener('pointermove',pointer,{passive:true});render();return ()=>window.removeEventListener('pointermove',pointer);
  });return ()=>mm.revert();},{scope:ref});
  return <section id="Gallery" className="photo-gallery" ref={ref} aria-label="Galeri kegiatan"><div className="gallery-sticky"><div className="gallery-orbit">{gallery.map((p,i)=><button key={p.src} type="button" className="gallery-photo" onClick={()=>setSelected(i)} aria-label={`Buka foto kegiatan ${i+1}`} style={{zIndex:i+1}}><img src={p.src} alt={p.alt} loading="lazy" decoding="async"/></button>)}</div></div><Dialog open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className="image-dialog"><DialogTitle className="sr-only">Galeri kegiatan</DialogTitle><DialogDescription className="sr-only">Foto kegiatan {profile.name}.</DialogDescription>{selected!==null&&<img src={gallery[selected].src} alt={gallery[selected].alt}/>}</DialogContent></Dialog></section>;
}

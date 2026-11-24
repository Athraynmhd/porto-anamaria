"use client";
import { site } from "@/data/site";
import { motion } from "@/lib/motion";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP,ScrollTrigger);

export function Hero(){
  const ref=useRef<HTMLElement>(null);
  useGSAP(()=>{
    const mm=gsap.matchMedia();
    mm.add({
      motion:"(prefers-reduced-motion: no-preference)",
      mobile:"(max-width: 767px)",
      pointer:"(hover: hover) and (pointer: fine)",
    },context=>{
      if(!context.conditions?.motion)return;
      const {mobile,pointer}=context.conditions;
      const scene=ref.current?.querySelector(".hero-sticky");
      const frame=scene?.querySelector(".hero-garden-frame");
      if(!scene||!frame)return;

      const timeline=gsap.timeline({
        scrollTrigger:{trigger:ref.current,start:"top top",end:"bottom bottom",scrub:motion.heroScrub},
      });
      timeline
        .to(".hero-tree-left",{xPercent:-76,scale:1.18,opacity:0,ease:"power2.inOut",duration:.34},0)
        .to(".hero-tree-right",{xPercent:76,scale:1.15,opacity:0,ease:"power2.inOut",duration:.32},.02)
        .to(".hero-sky",{yPercent:mobile?-8:-12,ease:"none",duration:.8},.2)
        .to(".hero-mountain",{yPercent:mobile?-15:-24,scale:1.04,ease:"none",duration:.8},.2)
        .to(".hero-person",{yPercent:mobile?-17:-21,ease:"none",duration:.8},.2)
        .to(".hero-title",{y:mobile?-8:-16,ease:"none",duration:.66},.34)
        .to(".hero-title",{opacity:0,ease:"power1.in",duration:.18},.72)
        .to(".hero-person img",{opacity:0,ease:"power1.inOut",duration:.25},.75);

      // Phones have no trees, so the title is visible from the start; larger screens reveal it as the trees part.
      if(mobile)gsap.set(".hero-title",{opacity:1,y:0});
      else timeline.fromTo(".hero-title",{opacity:0,y:14},{opacity:1,y:0,ease:"power2.out",duration:.18},.15);

      if(!pointer)return;
      const moveX=gsap.quickTo(frame,"x",{duration:.65,ease:"power3.out"});
      const moveY=gsap.quickTo(frame,"y",{duration:.65,ease:"power3.out"});
      const follow=(event:Event)=>{
        const {clientX,clientY,pointerType}=event as PointerEvent;
        if(pointerType==="touch")return;
        const {left,top,width,height}=scene.getBoundingClientRect();
        moveX((clientX-left)/width*24-12);
        moveY((clientY-top)/height*14-7);
      };
      const reset=()=>{moveX(0);moveY(0);};
      scene.addEventListener("pointermove",follow,{passive:true});
      scene.addEventListener("pointerleave",reset);
      return ()=>{
        scene.removeEventListener("pointermove",follow);
        scene.removeEventListener("pointerleave",reset);
      };
    });
    return ()=>mm.revert();
  },{scope:ref});
  return <section id="Home" className="hero" ref={ref} aria-label={`Portofolio ${site.profile.name}`}><div className="hero-sticky">
    <div className="hero-layer hero-sky"><img src={site.hero.garden} alt="" fetchPriority="high" /></div>
    <div className="hero-layer hero-mountain"><img src={site.hero.garden} alt="" fetchPriority="high"/><div className="hero-layer-fade"/></div>
    <div className="hero-title"><h1>{site.hero.title.map((line,i)=><span key={i}>{line}</span>)}</h1></div>
    <div className="hero-layer hero-person"><img src={site.hero.foreground} alt={site.hero.foregroundAlt} fetchPriority="high"/><div className="hero-layer-fade"/></div>
    <div className="hero-layer hero-garden-frame" aria-hidden="true">
      <div className="hero-tree hero-tree-left"><img src={site.hero.trees.left} alt="" fetchPriority="high"/></div>
      <div className="hero-tree hero-tree-right"><img src={site.hero.trees.right} alt="" fetchPriority="high"/></div>
    </div>
    <div className="hero-bottom-fade"/>
  </div></section>;
}

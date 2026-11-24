"use client";
import { motion } from "@/lib/motion";
import { createContext, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Toaster } from "sonner";

gsap.registerPlugin(ScrollTrigger);
type ScrollOptions = { offset?: number; immediate?: boolean };
const MotionContext = createContext<{ scrollTo: (target: string | number, options?: ScrollOptions) => void }>({scrollTo:()=>{}});
export const useSmoothScroll = () => useContext(MotionContext);

export function Providers({children}:{children:React.ReactNode}) {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();
  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const setup=()=>{
      if(media.matches) return;
      const instance=new Lenis({lerp:motion.wheelLerp,smoothWheel:true,syncTouch:false,anchors:false, prevent:node=>!!node.closest("[data-lenis-prevent]")});
      gsap.ticker.lagSmoothing(0); // keep Lenis and ScrollTrigger on the same clock after frame drops
      lenis.current=instance;
      instance.on("scroll",ScrollTrigger.update);
      const tick=(time:number)=>instance.raf(time*1000);
      gsap.ticker.add(tick);
      return ()=>{gsap.ticker.remove(tick);instance.destroy();lenis.current=null;};
    };
    let cleanup=setup();
    const change=()=>{cleanup?.();cleanup=setup();ScrollTrigger.refresh();};
    media.addEventListener("change",change);
    return ()=>{cleanup?.();media.removeEventListener("change",change);};
  },[]);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>ScrollTrigger.refresh());
    return ()=>cancelAnimationFrame(frame);
  },[pathname]);
  const scrollTo=(target:string|number,options:ScrollOptions={})=>{
    const top=typeof target==="number"?target:(document.querySelector(target)?.getBoundingClientRect().top??0)+window.scrollY;
    // Numeric coordinates avoid applying CSS scroll-padding twice when an explicit
    // offset is supplied. Native hash links still use the CSS scroll padding.
    if(lenis.current){lenis.current.scrollTo(top,{duration:Math.min(1.65,Math.max(.75,Math.abs(top-window.scrollY)/4500)),...options});return;}
    window.scrollTo({top:Math.max(0,top+(options.offset??0)),behavior:options.immediate||window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  };
  return <MotionContext.Provider value={{scrollTo}}>{children}<Toaster style={{fontFamily:"var(--font-sans)"}} richColors position="bottom-right" closeButton /></MotionContext.Provider>;
}

"use client";
import { useEffect,useState } from "react";
import { useSmoothScroll } from "./providers";
import { cn } from "@/lib/utils";

const items=[{name:"Home",id:"Home"},{name:"About",id:"About"},{name:"Portfolio",id:"Portofolio"},{name:"Contact",id:"Contact"}];
export function Navigation(){
  const [active,setActive]=useState("Home");
  const [light,setLight]=useState(false);
  const {scrollTo}=useSmoothScroll();
  useEffect(()=>{
    let frame=0;
    const update=()=>{frame=0;let current="Home";for(const item of items){const el=document.getElementById(item.id);if(el&&el.getBoundingClientRect().top<=innerHeight*.38)current=item.id;}setActive(current);const el=document.getElementById("Portofolio-content");setLight(!!el&&el.getBoundingClientRect().top<=120);};
    const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update();window.addEventListener("scroll",onScroll,{passive:true});window.addEventListener("resize",onScroll);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",onScroll);};
  },[]);
  return <header className="nav-wrap"><nav className={cn("nav-pill",light&&"nav-light")} aria-label="Navigasi utama">
    {items.map(item=><a key={item.id} href={`#${item.id}`} aria-current={active===item.id?"location":undefined} className={cn("nav-item",active===item.id&&"nav-active")} onClick={e=>{e.preventDefault();setActive(item.id);history.replaceState(null,"",`#${item.id}`);scrollTo(`#${item.id}`,{offset:item.id==="Home"||item.id==="Portofolio"?0:-80});}}>
      {item.name}
    </a>)}
  </nav></header>;
}

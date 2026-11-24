"use client";
import {useId,useLayoutEffect,useRef} from "react";
import {Topography} from "./topography";

const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(a:number,b:number,v:number)=>{const p=clamp((v-a)/(b-a));return p*p*(3-2*p);};
type Focus={x:number;y:number;radius:number;index:number};
const word="PORTOFOLIO";
function interior(ctx:CanvasRenderingContext2D,char:string,font:string){
 ctx.font=`800 300px ${font}`;const m=ctx.measureText(char),left=Math.ceil(m.actualBoundingBoxLeft||0),ascent=Math.ceil(m.actualBoundingBoxAscent||80),pad=8;
 ctx.canvas.width=Math.ceil((m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight||m.width))+16;ctx.canvas.height=Math.ceil((m.actualBoundingBoxAscent||80)+(m.actualBoundingBoxDescent||20))+16;
 ctx.font=`800 300px ${font}`;ctx.fontKerning="none";ctx.fillText(char,pad+left,pad+ascent);
 const {width,height}=ctx.canvas,pixels=ctx.getImageData(0,0,width,height).data,heights=new Uint16Array(width+1);let size=0,endX=0,endY=0;
 for(let y=0;y<height;y++){let diagonal=0;for(let x=0;x<width;x++){const old=heights[x+1];heights[x+1]=pixels[(y*width+x)*4+3]>245?Math.min(old,heights[x],diagonal)+1:0;diagonal=old;if(heights[x+1]>size){size=heights[x+1];endX=x;endY=y;}}}
 return size<3?null:{x:(endX+1-size/2-pad-left)/3,y:(endY+1-size/2-pad-ascent)/3,radius:(size/2-1)/3};
}
export function PortfolioTransition({children}:{children:React.ReactNode}){
 const root=useRef<HTMLElement>(null),pin=useRef<HTMLDivElement>(null),clip=useRef<SVGClipPathElement>(null),glyph=useRef<SVGTextElement>(null),field=useRef<SVGRectElement>(null),svg=useRef<SVGSVGElement>(null),content=useRef<HTMLDivElement>(null),choices=useRef<HTMLDivElement>(null);
 const id=useId().replace(/[^a-zA-Z0-9]/g,"");
 useLayoutEffect(()=>{
  const el=root.current,scene=pin.current,text=glyph.current,cp=clip.current,rect=field.current,art=svg.current,body=content.current,buttons=choices.current?.querySelectorAll('button');if(!el||!scene||!text||!cp||!rect||!art||!body||!buttons)return;
  const ctx=document.createElement('canvas').getContext('2d',{willReadFrequently:true});if(!ctx)return;
  const font=getComputedStyle(text).fontFamily;
  let disposed=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,w=0,h=0,scale=1,zoom=1,center={x:0,y:0},focus:Focus|null=null,focuses:Focus[]=[],selected=-1;
  const draw=()=>{
   frame=0;const progress=reduced.matches?0:clamp(-el.getBoundingClientRect().top/(h*1.7)),p=clamp(progress/.78),e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
   const magnify=Math.exp(Math.log(scale)+Math.log(zoom/scale)*e),pan=zoom===scale?0:(1/magnify-1/scale)/(1/zoom-1/scale),x=center.x+((focus?.x??center.x)-center.x)*pan,y=center.y+((focus?.y??center.y)-center.y)*pan,rotation=-4*smooth(.06,.5,p)*(1-smooth(.62,.92,p)),angle=rotation*Math.PI/180;
   const px=w/2/magnify,py=(.46*h+.04*h*e)/magnify;
   cp.setAttribute('transform',`scale(${magnify}) rotate(${rotation})`);text.setAttribute('transform',`translate(${Math.cos(angle)*px+Math.sin(angle)*py-x} ${-Math.sin(angle)*px+Math.cos(angle)*py-y})`);
   rect.style.clipPath=p>=1?'none':`url(#${id})`;
   scene.style.setProperty('--caption',String(1-smooth(.01,.16,progress)));body.style.opacity=String(reduced.matches?1:smooth(.78,.92,progress));body.style.pointerEvents=progress>=.88||reduced.matches?'auto':'none';
   el.dataset.progress=progress.toFixed(5);el.dataset.focusIndex=String(focus?.index??-1);el.dataset.choosing=String(progress<.04&&!reduced.matches);
   choices.current!.inert=progress>=.04||reduced.matches;
   buttons.forEach((b,i)=>{b.setAttribute('aria-checked',String(i===selected));b.tabIndex=i===selected?0:-1;});
  };
  const select=(index:number)=>{focus=focuses.find(f=>f.index===index)??focus;selected=focus?.index??-1;zoom=focus?Math.max(scale,Math.hypot(w,h)/(1.35*focus.radius)):scale;draw();};
  const measure=()=>{
   w=scene.clientWidth;h=reduced.matches?Math.min(innerHeight*.75,480):innerHeight;scene.style.height=`${h}px`;art.setAttribute('viewBox',`0 0 ${w} ${h}`);
   ctx.font=`800 100px ${font}`;ctx.fontKerning='none';const metrics=ctx.measureText(word),width=(metrics.actualBoundingBoxLeft||0)+(metrics.actualBoundingBoxRight||metrics.width),height=(metrics.actualBoundingBoxAscent||75)+(metrics.actualBoundingBoxDescent||20),bx=-(metrics.actualBoundingBoxLeft||0),by=-(metrics.actualBoundingBoxAscent||75);
   center={x:bx+width/2,y:by+height/2};scale=Math.max(.1,Math.min(.84*w/width,.38*h/height));focuses=[];
   for(let i=0;i<word.length;i++){
    ctx.font=`800 100px ${font}`;ctx.fontKerning='none';const offset=ctx.measureText(word.slice(0,i)).width,m=ctx.measureText(word[i]),letterWidth=(m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight||m.width),letterHeight=(m.actualBoundingBoxAscent||75)+(m.actualBoundingBoxDescent||20);
    Object.assign(buttons[i].style,{left:`${w/2+(offset-(m.actualBoundingBoxLeft||0)-center.x)*scale}px`,top:`${.46*h+(-(m.actualBoundingBoxAscent||75)-center.y)*scale-Math.max(0,44-letterHeight*scale)/2}px`,width:`${letterWidth*scale}px`,height:`${Math.max(44,letterHeight*scale)}px`});
    const hit=interior(ctx,word[i],font);if(hit)focuses.push({...hit,x:hit.x+offset,index:i});
   }
   select(selected>=0?selected:[...focuses].sort((a,b)=>b.radius-a.radius||Math.abs(a.x-center.x)-Math.abs(b.x-center.x))[0]?.index??0);
  };
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  const choose=(e:Event)=>{if(Number(el.dataset.progress)>=.04)return;const b=(e.target as HTMLElement).closest<HTMLButtonElement>('button[data-letter]');if(b)select(Number(b.dataset.letter));};
  const key=(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?word.length-1:(selected+(e.key==='ArrowLeft'?-1:1)+word.length)%word.length;select(index);buttons[index].focus({preventScroll:true});};
  const observer=new ResizeObserver(measure);observer.observe(scene);window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',measure);reduced.addEventListener('change',measure);choices.current?.addEventListener('pointerover',choose);choices.current?.addEventListener('click',choose);choices.current?.addEventListener('focusin',choose);choices.current?.addEventListener('keydown',key);measure();
  void document.fonts.ready.then(()=>{if(!disposed)measure();});
  const picker=choices.current;return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',scroll);window.removeEventListener('resize',measure);reduced.removeEventListener('change',measure);picker?.removeEventListener('pointerover',choose);picker?.removeEventListener('click',choose);picker?.removeEventListener('focusin',choose);picker?.removeEventListener('keydown',key);};
 },[id]);
 return <section id="Portofolio" className="portfolio-shell" ref={root}><div className="transition-sticky" ref={pin}><Topography/><svg ref={svg} className="transition-art" aria-hidden="true"><defs><clipPath id={id} ref={clip} clipPathUnits="userSpaceOnUse"><text ref={glyph} x="0" y="0" style={{fontFamily:"var(--font-sans)",fontWeight:800,fontSize:100,fontKerning:'none',fontVariantLigatures:'none',letterSpacing:0}}>{word}</text></clipPath></defs><rect ref={field} x="0" y="0" width="100%" height="100%" fill="#fafafa" clipPath={`url(#${id})`}/></svg><div ref={choices} className="transition-choices" role="radiogroup" aria-label="Choose the letter to enter through">{[...word].map((char,i)=><button key={i} data-letter={i} type="button" role="radio" aria-checked="false" tabIndex={-1} aria-label={`${char}, letter ${i+1} of 10`}/>)}</div><a className="transition-enter" href="#Portofolio-content" aria-label="Lihat portofolio">↘</a></div><div ref={content} id="Portofolio-content" className="portfolio-content"><Topography tone="light"/>{children}</div></section>;
}

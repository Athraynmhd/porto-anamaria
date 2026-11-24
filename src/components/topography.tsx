"use client";
import {useEffect,useRef} from "react";
import {vertexShader,fragmentShader} from "@/lib/topography-shaders";

export function Topography({tone="dark",paused=false}:{tone?:"dark"|"light";paused?:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null);
 const pause=useRef(paused);pause.current=paused;
 useEffect(()=>{
  const el=canvas.current,host=el?.parentElement;if(!el||!host)return;
  const gl=el.getContext("webgl",{premultipliedAlpha:true,antialias:false});if(!gl||!gl.getExtension("OES_standard_derivatives"))return;
  const compile=(type:number,source:string)=>{const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);return null;}return shader;};
  const vertex=compile(gl.VERTEX_SHADER,vertexShader),fragment=compile(gl.FRAGMENT_SHADER,fragmentShader);if(!vertex||!fragment)return;
  const program=gl.createProgram()!;gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,"position");gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const names=["size","dpr","feature","z","step","range","amount","lift","hillRadius","hill","ripples","reach","rippleWidth","color","lineOpacity"];
  const u=Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(program,n)]));
  let width=1,height=1,raf=0,visible=false,clock=0,last=0,lastDraw=0,disposed=false;
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  const pointer={x:0,y:0,targetX:0,targetY:0,lift:0,targetLift:0};
  const ripples:{x:number;y:number;age:number}[]=[];
  const color=tone==="dark"?[100/255,116/255,139/255]:[161/255,161/255,170/255];
  const draw=()=>{
   gl.useProgram(program);gl.viewport(0,0,el.width,el.height);gl.uniform2f(u.size,el.width,el.height);gl.uniform1f(u.dpr,.85);gl.uniform1f(u.feature,280);gl.uniform1f(u.z,.00005*clock*(tone==="dark"?.45:.8));gl.uniform1f(u.step,1.9/(tone==="dark"?12:14));gl.uniform1f(u.range,.95);gl.uniform1f(u.amount,1);gl.uniform1f(u.lift,pointer.lift*.85*1.5);gl.uniform1f(u.hillRadius,90);gl.uniform2f(u.hill,pointer.x,pointer.y);
   const waves=new Float32Array(16);ripples.slice(-4).forEach((r,i)=>waves.set([r.x,r.y,r.age/1500,1],i*4));gl.uniform4fv(u.ripples,waves);gl.uniform1f(u.reach,.8*Math.hypot(width,height));gl.uniform1f(u.rippleWidth,60);gl.uniform3f(u.color,color[0],color[1],color[2]);gl.uniform1f(u.lineOpacity,tone==="dark"?.38:.55);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);
  };
  const tick=(time:number)=>{if(disposed)return;const dt=last?Math.min(time-last,50):0;last=time;if(!pause.current)clock+=dt;const follow=1-Math.exp(-dt/90);pointer.x+=(pointer.targetX-pointer.x)*follow;pointer.y+=(pointer.targetY-pointer.y)*follow;pointer.lift+=(pointer.targetLift-pointer.lift)*follow;for(const r of ripples)r.age+=dt;while(ripples[0]?.age>1500)ripples.shift();if(time-lastDraw>=(tone==="dark"||matchMedia('(pointer: coarse)').matches?1000/30:1000/60)-1){draw();lastDraw=time;}raf=requestAnimationFrame(tick);};
  const update=()=>{cancelAnimationFrame(raf);last=0;if(visible&&!document.hidden&&!motion.matches)raf=requestAnimationFrame(tick);else draw();};
  const resize=()=>{width=host.clientWidth;height=host.clientHeight;el.width=Math.max(1,Math.round(width*.85));el.height=Math.max(1,Math.round(height*.85));pointer.targetX=pointer.x=width/2;pointer.targetY=pointer.y=height/2;draw();};
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();});observer.observe(host);
  const move=(e:PointerEvent)=>{if(tone!=="light"||e.pointerType==="touch")return;const r=host.getBoundingClientRect();pointer.targetX=e.clientX-r.left;pointer.targetY=e.clientY-r.top;pointer.targetLift=pointer.targetX>=0&&pointer.targetX<=width&&pointer.targetY>=0&&pointer.targetY<=height?1:0;};
  const down=(e:PointerEvent)=>{if(tone!=="light")return;const r=host.getBoundingClientRect();if(e.clientY>=r.top&&e.clientY<=r.bottom)ripples.push({x:e.clientX-r.left,y:e.clientY-r.top,age:0});};
  window.addEventListener("pointermove",move,{passive:true});window.addEventListener("pointerdown",down,{passive:true});document.addEventListener("visibilitychange",update);motion.addEventListener("change",update);resize();
  return ()=>{disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();observer.disconnect();window.removeEventListener("pointermove",move);window.removeEventListener("pointerdown",down);document.removeEventListener("visibilitychange",update);motion.removeEventListener("change",update);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);};
 },[tone]);
 return <div className={`topography topography-${tone}`} aria-hidden="true"><div className="topography-sticky"><canvas ref={canvas}/></div></div>;
}

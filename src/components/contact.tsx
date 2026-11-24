"use client";
import { useEffect,useRef,useState,type FormEvent,type ChangeEvent } from "react";
import { BookOpen,FileText,ImagePlus,Mail,MessageCircle,MessageSquare,Send,User,ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { revealOnScroll } from "@/lib/motion";
import { useContent } from "./content-provider";
import { Button } from "./ui/button";
import { Dialog,DialogContent,DialogTitle,DialogDescription } from "./ui/dialog";

const contactIcons={email:Mail,cv:FileText,publication:BookOpen};

type Comment={id:string;name:string;message:string;photo:string;createdAt:string};
const key="ana-maria-portfolio-comments-v1";
export function Contact(){
  const {site,contactLinks}=useContent();const profile=site.profile;
  const [comments,setComments]=useState<Comment[]>([]);
  const [photo,setPhoto]=useState("");
  const [fileName,setFileName]=useState("");
  const [draft,setDraft]=useState("");
  const [preview,setPreview]=useState(false);
  const fileRef=useRef<HTMLInputElement>(null);
  const section=useRef<HTMLElement>(null);
  useGSAP(()=>{
    const mm=gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)",()=>{revealOnScroll(".contact > h2, .contact-card, .event-photo",section.current);});
    return ()=>mm.revert();
  },{scope:section});
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(saved))setComments(saved.filter(c=>c&&typeof c.id==="string"&&typeof c.name==="string"&&typeof c.message==="string"&&typeof c.createdAt==="string"&&typeof c.photo==="string").slice(0,50));}catch{/* A fresh empty list remains usable when storage is unavailable. */}},[]);
  const changePhoto=async(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024){toast.error("Pilih JPG, PNG, atau WebP maksimal 5MB.");event.target.value="";return;}
    try{
      const bitmap=await createImageBitmap(file);const canvas=document.createElement("canvas");const size=160;canvas.width=size;canvas.height=size;const ctx=canvas.getContext("2d");if(!ctx)throw Error();const edge=Math.min(bitmap.width,bitmap.height);ctx.drawImage(bitmap,(bitmap.width-edge)/2,(bitmap.height-edge)/2,edge,edge,0,0,size,size);bitmap.close();setPhoto(canvas.toDataURL("image/webp",.75));setFileName(file.name);
    }catch{toast.error("Foto tidak dapat dibaca. Pilih gambar lain.");event.target.value="";}
  };
  const addComment=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();const form=event.currentTarget;const data=new FormData(form);const name=String(data.get("name")||"").trim();const message=String(data.get("comment")||"").trim();
    if(!name||!message){toast.error("Isi nama dan komentar terlebih dahulu.");return;}
    const next=[{id:crypto.randomUUID(),name,message,photo,createdAt:new Date().toISOString()},...comments].slice(0,50);
    try{localStorage.setItem(key,JSON.stringify(next));setComments(next);form.reset();setPhoto("");setFileName("");toast.success("Komentar disimpan di browser ini.");}catch{toast.error("Penyimpanan browser penuh atau tidak tersedia. Komentar belum tersimpan.");}
  };
  const contact=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();const data=new FormData(event.currentTarget);const name=String(data.get("sender")||"").trim(),email=String(data.get("email")||"").trim(),message=String(data.get("message")||"").trim();
    if(!name||!email||!message){toast.error("Lengkapi nama, email, dan pesan.");return;}
    const text=`Nama: ${name}\nEmail: ${email}\n\n${message}`;setDraft(text);
    if(profile.email){window.location.href=`mailto:${profile.email}?subject=${encodeURIComponent(`Pesan portofolio dari ${name}`)}&body=${encodeURIComponent(text)}`;toast.info("Draf dibuka di aplikasi email. Kirim dari aplikasi tersebut.");}else setPreview(true);
  };
  return <section id="Contact" ref={section} className="contact section-inner"><h2>Hubungi Saya</h2><div className="contact-grid"><div className="contact-left">
    <div className="contact-card"><h3 className="contact-title">Hubungi</h3><p>Tertarik berdiskusi tentang ekologi, GIS, atau peluang kolaborasi? Silakan kirim pesan.</p><form onSubmit={contact} className="contact-form"><label className="icon-field"><User size={19}/><input name="sender" aria-label="Nama Anda" placeholder="Nama Anda" required maxLength={100} autoComplete="name"/></label><label className="icon-field"><Mail size={19}/><input name="email" type="email" aria-label="Email Anda" placeholder="Email Anda" required maxLength={150} autoComplete="email"/></label><label className="icon-field message-field"><MessageSquare size={19}/><textarea name="message" aria-label="Pesan Anda" placeholder="Pesan Anda" required maxLength={3000} rows={5}/></label><Button type="submit" className="w-full"><Send size={19}/>Kirim Pesan</Button></form></div>
    <div className="contact-card social-card"><h3>Kontak & Publikasi</h3>{contactLinks.map(link=>{const Icon=(contactIcons as Record<string,typeof Mail>)[link.kind]??ExternalLink;return <a key={link.name} href={link.href} target={link.kind==="email"?undefined:"_blank"} rel="noopener noreferrer"><Icon className="contact-link-icon" aria-hidden="true"/><span><strong>{link.name}</strong><small>{link.handle}</small></span><ExternalLink size={16}/></a>;})}</div>
    <div className="event-photo"><img src={site.images.event} alt="Ana Maria mendampingi peserta Biofair dalam tur laboratorium" loading="lazy" decoding="async"/></div>
  </div><div className="contact-right"><div className="contact-card"><div className="card-title"><span><MessageCircle size={22}/></span><h3>Tulis Komentar</h3></div><form className="comment-form" onSubmit={addComment}><label htmlFor="comment-name">Nama</label><input id="comment-name" name="name" placeholder="Masukkan nama kamu" required maxLength={80} autoComplete="name"/><label htmlFor="comment-message">Komentar</label><textarea id="comment-message" name="comment" placeholder="Tulis komentar kamu di sini..." required maxLength={1000} rows={4}/><label htmlFor="profile-photo">Foto Profil <span>(opsional)</span></label><input ref={fileRef} id="profile-photo" className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={changePhoto}/><button type="button" className="photo-upload" onClick={()=>fileRef.current?.click()}>{photo?<img src={photo} alt="Pratinjau foto profil"/>:<ImagePlus size={20}/>}<span>{fileName||"Choose Profile Photo"}</span></button><small className="file-help">Max file size: 5MB</small><Button type="submit" className="w-full"><Send size={16}/>Kirim Komentar</Button></form></div>
    <div className="contact-card comments-card"><div className="card-title"><span><MessageCircle size={22}/></span><h3>Komentar <em>({comments.length})</em></h3></div><div className="comments-list" data-lenis-prevent="" aria-live="polite">{comments.length===0?<div className="empty-comments"><MessageCircle size={34}/><p>No comments yet. Start the conversation!</p><small className="storage-note">Komentar tersimpan hanya di browser ini.</small></div>:comments.map(c=><article key={c.id} className="comment"><div className="comment-avatar">{c.photo?<img src={c.photo} alt=""/>:c.name.charAt(0).toUpperCase()}</div><div><div className="comment-meta"><strong>{c.name}</strong><time dateTime={c.createdAt}>{new Date(c.createdAt).toLocaleDateString("id-ID",{day:"numeric",month:"short"})}</time></div><p>{c.message}</p></div></article>)}</div></div>
  </div></div><Dialog open={preview} onOpenChange={setPreview}><DialogContent className="message-dialog"><DialogTitle>Draf pesan</DialogTitle><DialogDescription>Tujuan email belum diatur. Salin pesan ini lalu hubungi melalui salah satu akun sosial di bawah.</DialogDescription><pre>{draft}</pre><Button onClick={async()=>{try{await navigator.clipboard.writeText(draft);toast.success("Pesan disalin.");}catch{toast.error("Belum bisa menyalin otomatis. Pilih teks pesan untuk menyalin.");}}}>Salin pesan</Button><div className="draft-socials">{contactLinks.map(s=><a href={s.href} target="_blank" rel="noopener noreferrer" key={s.name}>{s.name}<ExternalLink size={14}/></a>)}</div></DialogContent></Dialog></section>;
}


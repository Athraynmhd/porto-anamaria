"use client";
import { useRef, useState, type FormEvent } from "react";
import { BookOpen, ExternalLink, FileText, Mail, MessageCircle, MessageSquare, Send, User } from "lucide-react";
import { toast } from "sonner";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { revealOnScroll } from "@/lib/motion";
import { sendComment, sendMessage } from "@/app/actions";
import { useContent } from "./content-provider";
import { Button } from "./ui/button";

const contactIcons = { email: Mail, cv: FileText, publication: BookOpen };

/** Hidden field that real visitors never see or fill; bots usually do. */
const Honeypot = () => (
  <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
    <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
  </div>
);

export function Contact() {
  const { site, contactLinks, comments } = useContent();
  const section = useRef<HTMLElement>(null);
  const openedAt = useRef(Date.now());
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => { revealOnScroll(".contact > h2, .contact-card, .event-photo", section.current); });
    return () => mm.revert();
  }, { scope: section });

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget, data = new FormData(form);
    setSendingMessage(true);
    const res = await sendMessage({ name: data.get("sender"), email: data.get("email"), message: data.get("message"), website: data.get("website"), elapsed: Date.now() - openedAt.current });
    setSendingMessage(false);
    if (res.ok) { form.reset(); toast.success("Pesan terkirim. Terima kasih, saya akan membalas lewat email."); }
    else toast.error(res.error);
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget, data = new FormData(form);
    setSendingComment(true);
    const res = await sendComment({ name: data.get("name"), message: data.get("comment"), website: data.get("website"), elapsed: Date.now() - openedAt.current });
    setSendingComment(false);
    if (res.ok) { form.reset(); toast.success("Komentar terkirim. Komentar akan tampil setelah disetujui."); }
    else toast.error(res.error);
  }

  return (
    <section id="Contact" ref={section} className="contact section-inner">
      <h2>Hubungi Saya</h2>
      <div className="contact-grid">
        <div className="contact-left">
          <div className="contact-card">
            <h3 className="contact-title">Hubungi</h3>
            <p>Tertarik berdiskusi tentang ekologi, GIS, atau peluang kolaborasi? Silakan kirim pesan.</p>
            <form onSubmit={submitMessage} className="contact-form">
              <label className="icon-field"><User size={19} /><input name="sender" aria-label="Nama Anda" placeholder="Nama Anda" required maxLength={100} autoComplete="name" /></label>
              <label className="icon-field"><Mail size={19} /><input name="email" type="email" aria-label="Email Anda" placeholder="Email Anda" required maxLength={150} autoComplete="email" /></label>
              <label className="icon-field message-field"><MessageSquare size={19} /><textarea name="message" aria-label="Pesan Anda" placeholder="Pesan Anda" required maxLength={3000} rows={5} /></label>
              <Honeypot />
              <Button type="submit" className="w-full" disabled={sendingMessage}><Send size={19} />{sendingMessage ? "Mengirim…" : "Kirim Pesan"}</Button>
              <small className="privacy-note">Nama dan email hanya dipakai untuk membalas pesan Anda.</small>
            </form>
          </div>
          <div className="contact-card social-card">
            <h3>Kontak & Publikasi</h3>
            {contactLinks.map(link => {
              const Icon = (contactIcons as Record<string, typeof Mail>)[link.kind] ?? ExternalLink;
              return (
                <a key={link.name} href={link.href} target={link.kind === "email" ? undefined : "_blank"} rel="noopener noreferrer">
                  <Icon className="contact-link-icon" aria-hidden="true" />
                  <span><strong>{link.name}</strong><small>{link.handle}</small></span>
                  <ExternalLink size={16} />
                </a>
              );
            })}
          </div>
          <div className="event-photo"><img src={site.images.event} alt="Ana Maria mendampingi peserta Biofair dalam tur laboratorium" loading="lazy" decoding="async" /></div>
        </div>
        <div className="contact-right">
          <div className="contact-card">
            <div className="card-title"><span><MessageCircle size={22} /></span><h3>Tulis Komentar</h3></div>
            <form className="comment-form" onSubmit={submitComment}>
              <label htmlFor="comment-name">Nama</label>
              <input id="comment-name" name="name" placeholder="Masukkan nama kamu" required maxLength={80} autoComplete="name" />
              <label htmlFor="comment-message">Komentar</label>
              <textarea id="comment-message" name="comment" placeholder="Tulis komentar kamu di sini..." required maxLength={1000} rows={4} />
              <Honeypot />
              <Button type="submit" className="w-full" disabled={sendingComment}><Send size={16} />{sendingComment ? "Mengirim…" : "Kirim Komentar"}</Button>
              <small className="privacy-note">Komentar akan tampil setelah disetujui.</small>
            </form>
          </div>
          <div className="contact-card comments-card">
            <div className="card-title"><span><MessageCircle size={22} /></span><h3>Komentar <em>({comments.length})</em></h3></div>
            <div className="comments-list" data-lenis-prevent="" aria-live="polite">
              {comments.length === 0 ? (
                <div className="empty-comments"><MessageCircle size={34} /><p>Belum ada komentar. Jadilah yang pertama!</p></div>
              ) : comments.map(c => (
                <article key={c.id} className="comment">
                  <div className="comment-avatar">{c.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="comment-meta"><strong>{c.name}</strong><time dateTime={c.createdAt} suppressHydrationWarning>{new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</time></div>
                    <p>{c.message}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Shared motion tuning. Content changes do not need animation changes. */
export const motion = {
  wheelLerp: .075, // smaller = floatier scroll, larger = snappier
  heroScrub: 1.2,
  carouselScrub: .7,
  galleryScrub: .8,
  reveal: { distance: 36, duration: 1, exitDuration: .45, stagger: .09, ease: "expo.out" },
};

/**
 * Fade/slide elements in when they enter the viewport and back out when the user
 * scrolls up past them. Elements entering together are staggered. Call inside
 * gsap.matchMedia/useGSAP so ScrollTriggers are reverted on cleanup.
 */
export function revealOnScroll(selector: string, scope?: Element | null) {
  const targets = gsap.utils.toArray<HTMLElement>(selector, scope ?? undefined);
  if (!targets.length) return;
  const { distance, duration, exitDuration, stagger, ease } = motion.reveal;
  gsap.set(targets, { opacity: 0, y: distance });
  ScrollTrigger.batch(targets, {
    start: "top 90%",
    batchMax: 4,
    interval: .08,
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration, ease, stagger, overwrite: true }),
    onLeaveBack: batch => gsap.to(batch, { opacity: 0, y: distance, duration: exitDuration, ease: "power2.in", stagger: { each: .04, from: "end" }, overwrite: true }),
  });
}

import { prefersReducedMotion } from "./utils.js";

/**
 * Scroll marks dirty; a single rAF applies transform (no per-scroll layout work).
 */
export function initParallaxHero() {
  const hero = document.querySelector(".hero");
  const media = document.querySelector(".hero-media");
  if (!hero || !media) return;
  if (prefersReducedMotion()) return;
  if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) return;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn && conn.saveData) return;

  let dirty = true;
  let rafId = 0;

  function apply() {
    const r = hero.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const t = Math.max(
      0,
      Math.min(1, 1 - r.bottom / (vh + Math.max(r.height, 1)))
    );
    const y = (t - 0.5) * 48;
    media.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
  }

  function flush() {
    rafId = 0;
    if (!dirty) return;
    dirty = false;
    apply();
  }

  function schedule() {
    dirty = true;
    if (!rafId) rafId = requestAnimationFrame(flush);
  }

  media.style.willChange = "transform";
  dirty = true;
  flush();

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

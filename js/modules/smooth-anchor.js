import {
  isModifiedClick,
  prefersReducedMotion,
  scrollToElement,
} from "./utils.js";

export function initSmoothAnchors() {
  document.addEventListener("click", (e) => {
    if (isModifiedClick(e)) return;
    const a = e.target.closest("a[href^='#']");
    if (!a || !a.getAttribute("href")) return;
    const href = a.getAttribute("href");
    if (href === "#" || href === "#top") return;
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();

    const header = document.querySelector("[data-header]");
    const offset = (header && header.offsetHeight) || 0;
    const extra = 12;

    if (prefersReducedMotion()) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    } else {
      scrollToElement(el, {
        offset: offset + extra,
        durationMs: 1040,
      });
    }
    try {
      history.pushState(null, "", href);
    } catch (err) {
      /* ignore */
    }
  });
}

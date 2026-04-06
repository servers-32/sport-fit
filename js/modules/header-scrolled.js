import { rafThrottle } from "./utils.js";

export function initHeaderScrolled() {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const onScroll = rafThrottle(() => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  });

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

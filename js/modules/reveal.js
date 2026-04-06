import { prefersReducedMotion } from "./utils.js";

/** One-time reveal: unobserve after first intersection; batch DOM writes in rAF. */
export function initRevealOnScroll() {
  document.documentElement.classList.add("sportfit-js");

  function assignRevealDelays() {
    const step = 0.06;
    const maxDelay = 1.1;
    document.querySelectorAll("main section").forEach((sec) => {
      sec.querySelectorAll(".reveal[data-reveal]").forEach((el, i) => {
        el.style.setProperty(
          "--reveal-delay",
          `${Math.min(i * step, maxDelay)}s`
        );
      });
    });
  }

  if (!window.IntersectionObserver) {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("is-visible");
    });
    return;
  }

  const els = document.querySelectorAll(".reveal[data-reveal]");
  if (prefersReducedMotion()) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  assignRevealDelays();

  /**
   * Нижний отступ расширяет зону пересечения: анимация начинается чуть раньше,
   * пока блок ещё заходит в экран — визуально мягче при прокрутке.
   */
  const io = new IntersectionObserver(
    (entries) => {
      const targets = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target);
      if (!targets.length) return;
      /* Двойной rAF: стабильный layout после скролла, без рывков кадра */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          targets.forEach((target) => {
            target.classList.add("is-visible");
            io.unobserve(target);
          });
        });
      });
    },
    {
      root: null,
      rootMargin: "6% 0px 14% 0px",
      threshold: [0, 0.06, 0.14],
    }
  );

  els.forEach((el) => io.observe(el));

  if (typeof io.takeRecords === "function") {
    const initial = io
      .takeRecords()
      .filter((e) => e.isIntersecting)
      .map((e) => e.target);
    if (initial.length) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          initial.forEach((target) => {
            target.classList.add("is-visible");
            io.unobserve(target);
          });
        });
      });
    }
  }
}

/**
 * history.scrollRestoration = manual.
 * Валидный hash → прокрутка к секции (сразу после init + повтор после load для стабильной высоты).
 */
export function initScrollRestore() {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function scrollToTopHard() {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }

  function applyHashOrTop() {
    const raw = (location.hash || "").replace(/^#/, "");
    if (!raw) {
      scrollToTopHard();
      return;
    }
    if (raw === "top") {
      scrollToTopHard();
      try {
        history.replaceState(null, "", location.pathname + location.search);
      } catch (e) {
        /* ignore */
      }
      return;
    }
    const el = document.getElementById(raw);
    if (!el) {
      scrollToTopHard();
      try {
        history.replaceState(null, "", location.pathname + location.search);
      } catch (e) {
        /* ignore */
      }
      return;
    }
    const header = document.querySelector("[data-header]");
    const offset = (header && header.offsetHeight) || 0;
    const extra = 12;
    const rect = el.getBoundingClientRect();
    const y = rect.top + window.scrollY - offset - extra;
    window.scrollTo({ top: Math.max(0, y), left: 0, behavior: "auto" });
  }

  function runAfterLayout() {
    requestAnimationFrame(() => {
      requestAnimationFrame(applyHashOrTop);
    });
  }

  const hasHash = !!(location.hash || "").replace(/^#/, "");

  if (!hasHash) {
    scrollToTopHard();
  }

  runAfterLayout();
  if (document.readyState !== "complete") {
    window.addEventListener("load", runAfterLayout, { once: true });
  }

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      runAfterLayout();
    }
  });
}

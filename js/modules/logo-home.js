import { isModifiedClick, prefersReducedMotion, scrollWindowToY } from "./utils.js";

export function initLogoHome() {
  function closeMobileNavFromLogo() {
    const nav = document.getElementById("site-nav");
    const toggle = document.querySelector(".nav-toggle");
    if (!nav || !toggle) return;
    if (!window.matchMedia("(max-width: 900px)").matches) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    const lang = window.SPORTFIT_getLang ? window.SPORTFIT_getLang() : "ru";
    const T = window.SPORTFIT_T;
    if (T) {
      const closedKey = toggle.getAttribute("data-i18n-aria-closed") || "navOpen";
      const o = T[closedKey];
      if (o) toggle.setAttribute("aria-label", o[lang] || o.ru);
    } else {
      toggle.setAttribute("aria-label", "Открыть меню");
    }
  }

  document
    .querySelectorAll(
      'a.logo[href="#top"], a.logo[href="index.html"], a.footer-brand[href="#top"], a.footer-brand[href="index.html"]'
    )
    .forEach((a) => {
      a.addEventListener("click", (e) => {
        if (isModifiedClick(e)) return;
        const href = a.getAttribute("href") || "";
        if (href === "index.html") {
          closeMobileNavFromLogo();
          return;
        }
        e.preventDefault();
        closeMobileNavFromLogo();
        if (prefersReducedMotion()) {
          window.scrollTo({ top: 0, behavior: "auto" });
        } else {
          scrollWindowToY(0, 640);
        }
        try {
          if (window.history && window.history.replaceState) {
            history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search + "#top"
            );
          }
        } catch (err) {
          /* ignore */
        }
      });
    });
}

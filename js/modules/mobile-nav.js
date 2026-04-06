export function initMobileNav() {
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  if (!nav || !toggle) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    const lang = window.SPORTFIT_getLang ? window.SPORTFIT_getLang() : "ru";
    const T = window.SPORTFIT_T;
    if (T) {
      const openKey = toggle.getAttribute("data-i18n-aria-open") || "navClose";
      const closedKey = toggle.getAttribute("data-i18n-aria-closed") || "navOpen";
      const k = open ? openKey : closedKey;
      const o = T[k];
      if (o) toggle.setAttribute("aria-label", o[lang] || o.ru);
    } else {
      toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    }
  }

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 900px)").matches) {
        setOpen(false);
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

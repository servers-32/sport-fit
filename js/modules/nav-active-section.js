import { rafThrottle } from "./utils.js";

export function initNavActiveSection() {
  const nav = document.getElementById("site-nav");
  const rail = document.querySelector("[data-section-rail]");
  if (!nav && !rail) return;

  const links = nav
    ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'))
    : [];
  const railLinks = rail
    ? Array.prototype.slice.call(rail.querySelectorAll('a[href^="#"]'))
    : [];

  const idToLinks = {};
  links.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    if (!idToLinks[id]) idToLinks[id] = [];
    idToLinks[id].push(a);
  });

  const idSet = new Set(Object.keys(idToLinks));
  railLinks.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    if (id) idSet.add(id);
  });

  const sectionIds = [...idSet]
    .filter((id) => document.getElementById(id))
    .sort((a, b) => {
      const ea = document.getElementById(a);
      const eb = document.getElementById(b);
      return (ea?.offsetTop ?? 0) - (eb?.offsetTop ?? 0);
    });

  if (!sectionIds.length) return;

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el) => el instanceof HTMLElement);

  function clearActive() {
    links.forEach((a) => {
      a.classList.remove("is-active");
      a.removeAttribute("aria-current");
    });
    railLinks.forEach((a) => {
      a.classList.remove("is-active");
      a.removeAttribute("aria-current");
    });
  }

  function setActive(id) {
    clearActive();
    const group = idToLinks[id];
    if (group) {
      group.forEach((a, i) => {
        a.classList.add("is-active");
        if (i === 0) a.setAttribute("aria-current", "page");
      });
    }
    railLinks.forEach((a) => {
      const rid = a.getAttribute("href").slice(1);
      if (rid === id) {
        a.classList.add("is-active");
        a.setAttribute("aria-current", "location");
      }
    });
  }

  const update = rafThrottle(() => {
    const header = document.querySelector("[data-header]");
    const offset = (header && header.offsetHeight) || 100;
    const y = window.scrollY + offset + 12;
    let current = null;
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (sec.offsetTop <= y) current = sec.id;
    }
    const nearBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 80;
    if (nearBottom) current = sectionIds[sectionIds.length - 1];
    if (!current) {
      clearActive();
      return;
    }
    setActive(current);
  });

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
}

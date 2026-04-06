export function initGallery() {
  const root = document.querySelector("[data-gallery]");
  if (!root) return;

  const track = root.querySelector("[data-gallery-track]");
  if (!track) return;

  const slides = root.querySelectorAll("[data-gallery-slide]");
  const prevBtn = root.querySelector("[data-gallery-prev]");
  const nextBtn = root.querySelector("[data-gallery-next]");
  const dots = root.querySelectorAll("[data-gallery-dot]");
  const currentEl = root.querySelector("[data-gallery-current]");
  const totalEl = root.querySelector("[data-gallery-total]");
  const live = root.querySelector("[data-gallery-live]");

  const n = slides.length;
  if (totalEl) totalEl.textContent = String(n);

  function prefersReduce() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function getSlideWidth() {
    return track.clientWidth || 1;
  }

  function getIndex() {
    const w = getSlideWidth();
    let i = Math.round(track.scrollLeft / w);
    if (i < 0) i = 0;
    if (i >= n) i = n - 1;
    return i;
  }

  function goTo(i, smooth) {
    if (n === 0) return;
    if (i < 0) i = n - 1;
    if (i >= n) i = 0;
    const w = getSlideWidth();
    const behavior = smooth === false || prefersReduce() ? "auto" : "smooth";
    track.scrollTo({ left: i * w, top: 0, behavior });
  }

  function announce(idx) {
    if (!live) return;
    const slide = slides[idx];
    if (!slide) return;
    const t = slide.querySelector("[data-gallery-title]");
    const title = t ? t.textContent.trim() : "";
    live.textContent = `${idx + 1} / ${n}${title ? `: ${title}` : ""}`;
  }

  let lastIdx = -1;

  function thumbLabels() {
    const T = window.SPORTFIT_T;
    const lang = window.SPORTFIT_getLang ? window.SPORTFIT_getLang() : "ru";
    const pat =
      T && T.galThumbAria
        ? T.galThumbAria[lang] || T.galThumbAria.ru
        : "Show photo %n%";
    dots.forEach((d) => {
      const j = parseInt(d.getAttribute("data-gallery-dot"), 10);
      if (Number.isNaN(j)) return;
      d.setAttribute("aria-label", pat.replace("%n%", String(j + 1)));
    });
  }

  function scrollActiveThumb() {
    const row = root.querySelector("[data-gallery-thumbs]");
    const activeDot = root.querySelector(".gallery-show-thumb.is-active");
    if (!row || !activeDot) return;
    const rowW = row.clientWidth;
    const dotCenter = activeDot.offsetLeft + activeDot.offsetWidth / 2;
    const target = dotCenter - rowW / 2;
    const max = Math.max(0, row.scrollWidth - rowW);
    const next = Math.max(0, Math.min(target, max));
    row.scrollTo({
      left: next,
      behavior: prefersReduce() ? "auto" : "smooth",
    });
  }

  function syncUI() {
    const idx = getIndex();
    if (currentEl) currentEl.textContent = String(idx + 1);
    dots.forEach((d) => {
      const j = parseInt(d.getAttribute("data-gallery-dot"), 10);
      const on = j === idx;
      d.classList.toggle("is-active", on);
      d.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (idx !== lastIdx) {
      lastIdx = idx;
      scrollActiveThumb();
    }
    announce(idx);
  }

  let scrollLock = false;
  track.addEventListener(
    "scroll",
    () => {
      if (!scrollLock) {
        scrollLock = true;
        requestAnimationFrame(() => {
          scrollLock = false;
          syncUI();
        });
      }
    },
    { passive: true }
  );

  track.addEventListener("scrollend", syncUI);

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      goTo(getIndex() - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goTo(getIndex() + 1);
    });
  }

  dots.forEach((d) => {
    d.addEventListener("click", () => {
      const j = parseInt(d.getAttribute("data-gallery-dot"), 10);
      if (!Number.isNaN(j)) goTo(j);
    });
  });

  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(getIndex() - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(getIndex() + 1);
    }
  });

  window.addEventListener(
    "resize",
    () => {
      const idx = getIndex();
      goTo(idx, false);
      syncUI();
    },
    { passive: true }
  );

  document.addEventListener("sportfit:i18n", thumbLabels);

  thumbLabels();
  goTo(0, false);
  syncUI();
}

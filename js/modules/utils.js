/** @param {string} key */
export function i18nText(key) {
  const T = window.SPORTFIT_T;
  const lang = window.SPORTFIT_getLang ? window.SPORTFIT_getLang() : "ru";
  if (!T || !T[key]) return "";
  const o = T[key];
  return o[lang] || o.ru || "";
}

export function prefersReducedMotion() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * @param {(...args: unknown[]) => void} fn
 * @param {number} ms
 */
export function debounce(fn, ms) {
  let t = 0;
  return (...args) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  };
}

/**
 * @param {() => void} fn
 */
export function rafThrottle(fn) {
  let scheduled = false;
  return () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fn();
    });
  };
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Плавнее к концу движения — для якорного скролла */
export function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

/**
 * @param {number} targetY
 * @param {number} durationMs
 * @param {() => void} [onDone]
 */
export function scrollWindowToY(targetY, durationMs, onDone) {
  const maxY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const y = Math.max(0, Math.min(targetY, maxY));

  if (prefersReducedMotion()) {
    window.scrollTo(0, y);
    onDone?.();
    return;
  }

  const startY = window.scrollY;
  const dy = y - startY;
  if (Math.abs(dy) < 1) {
    onDone?.();
    return;
  }

  const t0 = performance.now();
  function step(now) {
    const elapsed = now - t0;
    const p = Math.min(1, elapsed / durationMs);
    const e = easeInOutCubic(p);
    window.scrollTo(0, startY + dy * e);
    if (p < 1) requestAnimationFrame(step);
    else onDone?.();
  }
  requestAnimationFrame(step);
}

/**
 * @param {Element} el
 * @param {{ offset?: number; durationMs?: number; onDone?: () => void }} [opts]
 */
export function scrollToElement(el, opts = {}) {
  const offset = opts.offset ?? 0;
  const durationMs = opts.durationMs ?? 900;
  const rect = el.getBoundingClientRect();
  const targetY = rect.top + window.scrollY - offset;
  scrollWindowToY(targetY, durationMs, opts.onDone);
}

export function isModifiedClick(/** @type {MouseEvent} */ e) {
  return (
    e.defaultPrevented ||
    e.button !== 0 ||
    e.ctrlKey ||
    e.metaKey ||
    e.shiftKey ||
    e.altKey
  );
}

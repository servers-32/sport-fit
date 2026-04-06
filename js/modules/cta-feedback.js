const SELECTOR =
  ".hero-actions .btn, .cta-action-buttons .btn, .program-card-pick, .program-card-secondary, .fit-card .btn, .fit-card-link, .btn-cta-mega, .workout-chip";

export function initCtaFeedback() {
  function pulse(el) {
    el.classList.add("is-cta-pressed");
    window.setTimeout(() => {
      el.classList.remove("is-cta-pressed");
    }, 140);
  }

  document.addEventListener(
    "click",
    (e) => {
      const btn = e.target.closest(SELECTOR);
      if (!btn) return;
      pulse(btn);
    },
    true
  );

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType !== "touch") return;
      const btn = e.target.closest(SELECTOR);
      if (!btn) return;
      btn.classList.add("is-cta-touch");
    },
    true
  );

  document.addEventListener(
    "pointerup",
    (e) => {
      const btn = e.target.closest(".is-cta-touch");
      if (btn) btn.classList.remove("is-cta-touch");
    },
    true
  );

  document.addEventListener(
    "pointercancel",
    () => {
      document.querySelectorAll(".is-cta-touch").forEach((el) => {
        el.classList.remove("is-cta-touch");
      });
    },
    true
  );
}

import { prefersReducedMotion } from "./utils.js";

const ORDER = ["strength", "cardio", "recovery"];

export function initWorkoutChips() {
  const tablist = document.querySelector(".workout-chips");
  if (!tablist) return;

  const chips = Array.prototype.slice.call(
    tablist.querySelectorAll(".workout-chip[data-workout]")
  );
  const hintsRoot = document.querySelector(".workout-hints");
  if (!hintsRoot || !chips.length) return;

  const reduce = prefersReducedMotion();

  /** @type {string | null} */
  let active = null;

  function hintKey(key) {
    return key || "default";
  }

  function syncTabindex() {
    chips.forEach((btn) => {
      const w = btn.getAttribute("data-workout");
      const on = w === active;
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (active === null) {
      chips.forEach((b, i) => {
        b.tabIndex = i === 0 ? 0 : -1;
      });
    } else {
      chips.forEach((b) => {
        b.tabIndex = b.getAttribute("data-workout") === active ? 0 : -1;
      });
    }
  }

  function showHints(key) {
    const h = hintKey(key);
    hintsRoot.setAttribute("data-active-hint", h);
    hintsRoot.querySelectorAll(".workout-hint").forEach((el) => {
      const k = el.getAttribute("data-workout-hint");
      const show = k === h;
      el.classList.toggle("workout-hint--shown", show);
      el.hidden = !show;
      el.setAttribute("aria-hidden", show ? "false" : "true");
    });
  }

  function select(key) {
    active = key;
    chips.forEach((btn) => {
      const w = btn.getAttribute("data-workout");
      btn.classList.toggle("is-active", !!key && w === key);
    });
    if (!reduce) {
      hintsRoot.classList.add("workout-hints--animating");
      requestAnimationFrame(() => {
        showHints(key);
        requestAnimationFrame(() => {
          hintsRoot.classList.remove("workout-hints--animating");
        });
      });
    } else {
      showHints(key);
    }
    syncTabindex();
  }

  tablist.setAttribute("role", "tablist");

  chips.forEach((btn) => {
    btn.setAttribute("role", "tab");
    const w = btn.getAttribute("data-workout");
    if (!btn.id) btn.id = `wtab-${w}`;
    const panel = hintsRoot.querySelector(`[data-workout-hint="${w}"]`);
    if (panel && !panel.id) panel.id = `wpanel-${w}`;
    if (panel) btn.setAttribute("aria-controls", panel.id);

    btn.addEventListener("click", () => {
      select(btn.getAttribute("data-workout"));
    });
  });

  const defPanel = hintsRoot.querySelector('[data-workout-hint="default"]');
  if (defPanel && !defPanel.id) defPanel.id = "wpanel-default";

  tablist.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && active) {
      e.preventDefault();
      select(null);
      chips[0]?.focus();
      return;
    }
    const idx = chips.findIndex(
      (b) => b.getAttribute("data-workout") === active
    );
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = idx < 0 ? 0 : (idx + 1) % chips.length;
      const w = chips[next].getAttribute("data-workout");
      select(w);
      chips[next].focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const next =
        idx < 0 ? chips.length - 1 : (idx - 1 + chips.length) % chips.length;
      const w = chips[next].getAttribute("data-workout");
      select(w);
      chips[next].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      select(ORDER[0]);
      chips
        .find((b) => b.getAttribute("data-workout") === ORDER[0])
        ?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      select(ORDER[ORDER.length - 1]);
      chips
        .find(
          (b) => b.getAttribute("data-workout") === ORDER[ORDER.length - 1]
        )
        ?.focus();
    }
  });

  document.addEventListener("sportfit:i18n", () => {
    select(active);
  });

  select(null);
}

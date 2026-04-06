import { i18nText } from "./utils.js";

export function initPricing() {
  const grid = document.querySelector("[data-pricing-grid]");
  if (!grid) return;

  function syncPricingSkeleton() {
    if (grid.querySelector(".price-card.is-visible")) {
      grid.classList.add("pricing-grid--shown-cards");
      return true;
    }
    return false;
  }
  if (!syncPricingSkeleton()) {
    const mo = new MutationObserver(() => {
      if (syncPricingSkeleton()) mo.disconnect();
    });
    mo.observe(grid, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  const cards = grid.querySelectorAll("[data-pricing-card]");
  const hint = document.getElementById("pricing-pick-hint");
  const STORAGE_KEY = "sportfit-pick-plan";

  function renderHint(plan) {
    if (!hint) return;
    const key =
      plan === "monthly"
        ? "prPickMonthly"
        : plan === "annual"
          ? "prPickAnnual"
          : "prPickPrompt";
    hint.textContent = i18nText(key);
    hint.classList.toggle("is-active", !!plan);
  }

  function applyPicked(plan) {
    cards.forEach((c) => {
      c.classList.toggle(
        "price-card--picked",
        c.getAttribute("data-plan") === plan
      );
    });
    renderHint(plan);
    try {
      document.dispatchEvent(
        new CustomEvent("sportfit:track", {
          detail: { event: "pricing_plan_selected", payload: { plan: plan || "none" } },
        })
      );
    } catch (e) {
      /* ignore */
    }
    try {
      if (plan) localStorage.setItem(STORAGE_KEY, plan);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  function pickFromCard(card) {
    const plan = card.getAttribute("data-plan");
    let current = null;
    cards.forEach((c) => {
      if (c.classList.contains("price-card--picked")) {
        current = c.getAttribute("data-plan");
      }
    });
    if (current === plan) {
      applyPicked(null);
    } else {
      applyPicked(plan);
    }
  }

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      pickFromCard(card);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (e.target.closest("a")) return;
      e.preventDefault();
      pickFromCard(card);
    });
  });

  grid.querySelectorAll('a[href*="checkout.html?plan="]').forEach((link) => {
    link.addEventListener("click", () => {
      const card = link.closest("[data-pricing-card]");
      const plan = card ? card.getAttribute("data-plan") : "";
      try {
        document.dispatchEvent(
          new CustomEvent("sportfit:track", {
            detail: { event: "pricing_checkout_click", payload: { plan: plan || "unknown" } },
          })
        );
      } catch (e) {
        /* ignore */
      }
    });
  });

  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    /* ignore */
  }
  if (saved === "monthly" || saved === "annual") {
    applyPicked(saved);
  } else {
    renderHint(null);
  }

  document.addEventListener("sportfit:i18n", () => {
    let p = null;
    try {
      p = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    if (p === "monthly" || p === "annual") {
      renderHint(p);
    } else {
      renderHint(null);
    }
  });
}

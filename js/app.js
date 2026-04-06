/**
 * SportFit — точка входа (ES modules).
 * Требует предзагрузки js/i18n.js (глобальные SPORTFIT_T, SPORTFIT_getLang, …).
 */
import { initI18n } from "./modules/i18n-boot.js";
import { initScrollRestore } from "./modules/scroll-restore.js";
import { initMobileNav } from "./modules/mobile-nav.js";
import { initLogoHome } from "./modules/logo-home.js";
import { initHeaderScrolled } from "./modules/header-scrolled.js";
import { initParallaxHero } from "./modules/parallax-hero.js";
import { initRevealOnScroll } from "./modules/reveal.js";
import { initNavActiveSection } from "./modules/nav-active-section.js";
import { initSmoothAnchors } from "./modules/smooth-anchor.js";
import { initForms } from "./modules/forms.js";
import { initGallery } from "./modules/gallery.js";
import { initPricing } from "./modules/pricing.js";
import { initWorkoutChips } from "./modules/workout-chips.js";
import { initCalorieCalculator } from "./modules/calculator.js";
import { initCtaFeedback } from "./modules/cta-feedback.js";
import { initTracking } from "./modules/tracking.js";

window.__SPORTFIT_BOOTED = true;

function safeInit(fn) {
  try {
    fn();
  } catch (err) {
    console.error("[SportFit]", fn.name || "init", err);
  }
}

/* Критично для первого экрана и навигации */
const criticalInits = [
  initI18n,
  initMobileNav,
  initLogoHome,
  initHeaderScrolled,
  initRevealOnScroll,
  initSmoothAnchors,
  initForms,
  initCtaFeedback,
  initScrollRestore,
];

/* Тяжелые блоки — после загрузки страницы в idle */
const deferredInits = [
  initParallaxHero,
  initNavActiveSection,
  initGallery,
  initPricing,
  initWorkoutChips,
  initCalorieCalculator,
  initTracking,
];

function scheduleDeferredInits() {
  const queue =
    "requestIdleCallback" in window
      ? (fn) => window.requestIdleCallback(() => safeInit(fn), { timeout: 1500 })
      : (fn) => window.setTimeout(() => safeInit(fn), 220);

  deferredInits.forEach((fn) => queue(fn));
}

function boot() {
  criticalInits.forEach((fn) => safeInit(fn));

  if (document.readyState === "complete") {
    scheduleDeferredInits();
  } else {
    window.addEventListener("load", scheduleDeferredInits, { once: true });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

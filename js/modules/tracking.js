export function initTracking() {
  if (window.__SPORTFIT_TRACKING_READY) return;
  window.__SPORTFIT_TRACKING_READY = true;

  function emit(eventName, payload) {
    const data = payload || {};
    try {
      if (!Array.isArray(window.dataLayer)) window.dataLayer = [];
      window.dataLayer.push({ event: eventName, ...data });
    } catch (err) {
      /* ignore */
    }
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, data);
      }
    } catch (err) {
      /* ignore */
    }
  }

  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-track]");
    if (!target) return;
    const eventName = target.getAttribute("data-track");
    if (!eventName) return;
    emit(eventName, { location: window.location.pathname });
  });

  document.querySelectorAll('a[href*="tel:"]').forEach((link) => {
    link.addEventListener("click", () => {
      emit("phone_click", { location: window.location.pathname });
    });
  });

  document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
    link.addEventListener("click", () => {
      emit("whatsapp_click", { location: window.location.pathname });
    });
  });

  document.addEventListener("sportfit:track", (e) => {
    if (!e.detail || !e.detail.event) return;
    emit(e.detail.event, e.detail.payload || {});
  });
}

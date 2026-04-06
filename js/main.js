(function () {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function scrollToTopHard() {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }

  function applyHashOrTop() {
    var raw = (location.hash || "").replace(/^#/, "");
    if (!raw) {
      scrollToTopHard();
      return;
    }
    if (raw === "top") {
      scrollToTopHard();
      try {
        history.replaceState(null, "", location.pathname + location.search);
      } catch (e) {}
      return;
    }
    var el = document.getElementById(raw);
    if (!el) {
      scrollToTopHard();
      try {
        history.replaceState(null, "", location.pathname + location.search);
      } catch (e) {}
      return;
    }
    var header = document.querySelector("[data-header]");
    var offset = (header && header.offsetHeight) || 0;
    var extra = 12;
    var rect = el.getBoundingClientRect();
    var y = rect.top + window.scrollY - offset - extra;
    window.scrollTo({ top: Math.max(0, y), left: 0, behavior: "auto" });
  }

  function runAfterLayout() {
    requestAnimationFrame(function () {
      requestAnimationFrame(applyHashOrTop);
    });
  }

  var hasHash = !!(location.hash || "").replace(/^#/, "");
  if (!hasHash) {
    scrollToTopHard();
  }

  runAfterLayout();
  if (document.readyState !== "complete") {
    window.addEventListener("load", runAfterLayout, { once: true });
  }

  window.addEventListener("pageshow", function (e) {
    if (e.persisted) runAfterLayout();
  });
})();

(function () {
  var T = window.SPORTFIT_T;
  var STORAGE_KEY = "sportfit-lang";

  function getLang() {
    return document.documentElement.getAttribute("lang") === "en" ? "en" : "ru";
  }

  function txt(key, lang) {
    if (!T || !T[key]) return "";
    var o = T[key];
    return o[lang] || o.ru || "";
  }

  function applyLang(lang) {
    if (lang !== "en" && lang !== "ru") lang = "ru";
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (!k || !T[k]) return;
      el.textContent = txt(k, lang);
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-html");
      if (!k || !T[k]) return;
      el.innerHTML = txt(k, lang);
    });

    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-alt");
      if (!k || !T[k]) return;
      el.setAttribute("alt", txt(k, lang));
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-aria");
      if (!k || !T[k]) return;
      el.setAttribute("aria-label", txt(k, lang));
    });

    document.querySelectorAll("[data-i18n-aria-group]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-aria-group");
      if (!k || !T[k]) return;
      el.setAttribute("aria-label", txt(k, lang));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-placeholder");
      if (!k || !T[k]) return;
      el.setAttribute("placeholder", txt(k, lang));
    });

    document.title = txt("metaTitle", lang);

    var md = document.getElementById("meta-desc");
    if (md) md.setAttribute("content", txt("metaDesc", lang));
    var ogd = document.getElementById("og-desc");
    if (ogd) ogd.setAttribute("content", txt("metaDesc", lang));
    var ogt = document.getElementById("og-title");
    if (ogt) ogt.setAttribute("content", txt("metaTitle", lang));

    document.querySelectorAll(".lang-switch-btn").forEach(function (btn) {
      var isRu = btn.getAttribute("data-lang") === "ru";
      var active = (isRu && lang === "ru") || (!isRu && lang === "en");
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var toggle = document.querySelector(".nav-toggle");
    if (toggle) {
      var open = toggle.getAttribute("aria-expanded") === "true";
      var openKey = toggle.getAttribute("data-i18n-aria-open") || "navClose";
      var closedKey = toggle.getAttribute("data-i18n-aria-closed") || "navOpen";
      toggle.setAttribute("aria-label", txt(open ? openKey : closedKey, lang));
    }

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}

    window.SPORTFIT_LANG = lang;
    document.dispatchEvent(new CustomEvent("sportfit:i18n"));
  }

  function bootLang() {
    document.querySelectorAll(".lang-switch-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var l = btn.getAttribute("data-lang");
        applyLang(l === "en" ? "en" : "ru");
      });
    });
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    if (saved === "en" || saved === "ru") applyLang(saved);
    else applyLang("ru");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootLang);
  } else {
    bootLang();
  }

  window.SPORTFIT_applyLang = applyLang;
  window.SPORTFIT_getLang = getLang;
})();

(function () {
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  if (!nav || !toggle) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    var lang = window.SPORTFIT_getLang ? window.SPORTFIT_getLang() : "ru";
    var T = window.SPORTFIT_T;
    if (T) {
      var openKey = toggle.getAttribute("data-i18n-aria-open") || "navClose";
      var closedKey = toggle.getAttribute("data-i18n-aria-closed") || "navOpen";
      var k = open ? openKey : closedKey;
      var o = T[k];
      if (o) toggle.setAttribute("aria-label", o[lang] || o.ru);
    } else {
      toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    }
  }

  toggle.addEventListener("click", function () {
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 900px)").matches) {
        setOpen(false);
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
})();

(function () {
  function isModifiedClick(e) {
    return (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey
    );
  }

  function closeMobileNavFromLogo() {
    var nav = document.getElementById("site-nav");
    var toggle = document.querySelector(".nav-toggle");
    if (!nav || !toggle) return;
    if (!window.matchMedia("(max-width: 900px)").matches) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    var lang = window.SPORTFIT_getLang ? window.SPORTFIT_getLang() : "ru";
    var T = window.SPORTFIT_T;
    if (T) {
      var closedKey = toggle.getAttribute("data-i18n-aria-closed") || "navOpen";
      var o = T[closedKey];
      if (o) toggle.setAttribute("aria-label", o[lang] || o.ru);
    } else {
      toggle.setAttribute("aria-label", "Открыть меню");
    }
  }

  document
    .querySelectorAll('a.logo[href="#top"], a.footer-brand[href="#top"]')
    .forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (isModifiedClick(e)) return;
        e.preventDefault();
        closeMobileNavFromLogo();
        var reduce =
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({
          top: 0,
          behavior: reduce ? "auto" : "smooth",
        });
        try {
          if (window.history && window.history.replaceState) {
            history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search + "#top"
            );
          }
        } catch (err) {}
      });
    });
})();

(function () {
  function formTxt(key) {
    var T = window.SPORTFIT_T;
    var lang = window.SPORTFIT_getLang ? window.SPORTFIT_getLang() : "ru";
    if (!T || !T[key]) return "";
    var o = T[key];
    return o[lang] || o.ru || "";
  }

  function showFieldErr(id, message) {
    var err = document.getElementById(id);
    var inputId = id.replace("-err", "");
    var input = document.getElementById(inputId);
    if (err) {
      err.textContent = message;
      err.hidden = !message;
    }
    if (input) input.classList.toggle("field-invalid", !!message);
  }

  function clearContactErrors() {
    ["contact-interest-err", "contact-name-err", "contact-reach-err"].forEach(
      function (eid) {
        var base = eid.replace("-err", "");
        showFieldErr(eid, "");
        var el = document.getElementById(base);
        if (el) el.classList.remove("field-invalid");
      }
    );
  }

  var trainForm = document.getElementById("training-signup-form");
  if (trainForm) {
    var trainSuccess = document.getElementById("training-form-success");
    function hideTrainSuccess() {
      if (trainSuccess) trainSuccess.hidden = true;
    }
    function clearTrainErrors() {
      showFieldErr("train-name-err", "");
      showFieldErr("train-goal-err", "");
      showFieldErr("train-contact-err", "");
    }
    trainForm.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        hideTrainSuccess();
        var id = el.id;
        if (id === "train-name") showFieldErr("train-name-err", "");
        if (id === "train-goal") showFieldErr("train-goal-err", "");
        if (id === "train-contact") showFieldErr("train-contact-err", "");
      });
    });
    trainForm.addEventListener("submit", function (e) {
      e.preventDefault();
      hideTrainSuccess();
      clearTrainErrors();
      var name = (trainForm.querySelector("#train-name") || {}).value || "";
      var goal = (trainForm.querySelector("#train-goal") || {}).value || "";
      var contact = (trainForm.querySelector("#train-contact") || {}).value || "";
      name = name.trim();
      goal = goal.trim();
      contact = contact.trim();
      var ok = true;
      if (!name) {
        showFieldErr("train-name-err", formTxt("trainErrEmpty"));
        ok = false;
      }
      if (!goal) {
        showFieldErr("train-goal-err", formTxt("trainErrEmpty"));
        ok = false;
      }
      if (!contact) {
        showFieldErr("train-contact-err", formTxt("trainErrContact"));
        ok = false;
      }
      if (!ok) return;
      if (trainSuccess) {
        trainSuccess.hidden = false;
        trainSuccess.focus();
      }
      trainForm.reset();
    });
  }

  var form = document.querySelector(".contact-form");
  if (!form) return;
  var hp = form.querySelector('input[name="company"]');
  var success = document.getElementById("form-success");
  function hideSuccess() {
    if (success) success.hidden = true;
  }
  form.querySelectorAll("input, textarea, select").forEach(function (el) {
    if (el.getAttribute("name") === "company") return;
    el.addEventListener("focus", hideSuccess);
    el.addEventListener("input", clearContactErrors);
    el.addEventListener("change", clearContactErrors);
  });
  form.addEventListener("submit", function (e) {
    if (hp && hp.value) {
      e.preventDefault();
      return;
    }
    clearContactErrors();
    var interest = form.querySelector("#contact-interest");
    var nameEl = form.querySelector("#contact-name");
    var reach = form.querySelector("#contact-reach");
    var interestOk = interest && interest.value;
    var nameOk = nameEl && nameEl.value.trim();
    var reachOk = reach && reach.value.trim();
    var valid = true;
    if (!interestOk) {
      showFieldErr("contact-interest-err", formTxt("formErrInterest"));
      valid = false;
    }
    if (!nameOk) {
      showFieldErr("contact-name-err", formTxt("formErrName"));
      valid = false;
    }
    if (!reachOk) {
      showFieldErr("contact-reach-err", formTxt("formErrContact"));
      valid = false;
    }
    if (!valid) {
      e.preventDefault();
      return;
    }
    if (form.getAttribute("data-netlify") === "true") {
      return;
    }
    e.preventDefault();
    if (success) {
      success.hidden = false;
      success.focus();
    }
    form.reset();
    clearContactErrors();
  });
})();

(function () {
  var header = document.querySelector("[data-header]");
  if (!header) return;

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

(function () {
  var hero = document.querySelector(".hero");
  var media = document.querySelector(".hero-media");
  if (!hero || !media) return;
  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  var ticking = false;
  function update() {
    ticking = false;
    var r = hero.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    var t = Math.max(0, Math.min(1, 1 - r.bottom / (vh + Math.max(r.height, 1))));
    var y = (t - 0.5) * 48;
    media.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  media.style.willChange = "transform";
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
})();

(function () {
  function assignRevealDelays() {
    var step = 0.09;
    var maxDelay = 0.9;
    document.querySelectorAll("main section").forEach(function (sec) {
      var nodes = sec.querySelectorAll(".reveal[data-reveal]");
      nodes.forEach(function (el, i) {
        el.style.setProperty(
          "--reveal-delay",
          Math.min(i * step, maxDelay) + "s"
        );
      });
    });
  }

  function bootReveal() {
    if (!window.IntersectionObserver) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var els = document.querySelectorAll(".reveal[data-reveal]");
    if (reduce) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    assignRevealDelays();

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: [0.06, 0.14] }
    );

    els.forEach(function (el) {
      io.observe(el);
    });

    if (typeof io.takeRecords === "function") {
      io.takeRecords().forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }

    document.documentElement.classList.add("sportfit-js");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootReveal);
  } else {
    bootReveal();
  }
})();

(function () {
  var nav = document.getElementById("site-nav");
  if (!nav) return;

  var links = Array.prototype.slice.call(
    nav.querySelectorAll('a[href^="#"]')
  );
  var idToLinks = {};
  links.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    if (!idToLinks[id]) idToLinks[id] = [];
    idToLinks[id].push(a);
  });

  var sectionIds = Object.keys(idToLinks).filter(function (id) {
    return document.getElementById(id);
  });
  if (!sectionIds.length) return;

  var sections = sectionIds
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  function clearActive() {
    links.forEach(function (a) {
      a.classList.remove("is-active");
      a.removeAttribute("aria-current");
    });
  }

  function setActive(id) {
    clearActive();
    var group = idToLinks[id];
    if (!group) return;
    group.forEach(function (a, i) {
      a.classList.add("is-active");
      if (i === 0) a.setAttribute("aria-current", "page");
    });
  }

  var ticking = false;
  function update() {
    ticking = false;
    var header = document.querySelector("[data-header]");
    var offset = (header && header.offsetHeight) || 100;
    var y = window.scrollY + offset + 12;
    var current = null;
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      if (sec.offsetTop <= y) current = sec.id;
    }
    var nearBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 80;
    if (nearBottom) current = sectionIds[sectionIds.length - 1];
    if (!current) {
      clearActive();
      return;
    }
    setActive(current);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
})();

(function () {
  var root = document.querySelector("[data-gallery]");
  if (!root) return;

  var track = root.querySelector("[data-gallery-track]");
  if (!track) return;

  var slides = root.querySelectorAll("[data-gallery-slide]");
  var prevBtn = root.querySelector("[data-gallery-prev]");
  var nextBtn = root.querySelector("[data-gallery-next]");
  var dots = root.querySelectorAll("[data-gallery-dot]");
  var currentEl = root.querySelector("[data-gallery-current]");
  var totalEl = root.querySelector("[data-gallery-total]");
  var live = root.querySelector("[data-gallery-live]");

  var n = slides.length;
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
    var w = getSlideWidth();
    var i = Math.round(track.scrollLeft / w);
    if (i < 0) i = 0;
    if (i >= n) i = n - 1;
    return i;
  }

  function goTo(i, smooth) {
    if (n === 0) return;
    if (i < 0) i = n - 1;
    if (i >= n) i = 0;
    var w = getSlideWidth();
    var behavior = smooth === false || prefersReduce() ? "auto" : "smooth";
    track.scrollTo({ left: i * w, top: 0, behavior: behavior });
  }

  function announce(idx) {
    if (!live) return;
    var slide = slides[idx];
    if (!slide) return;
    var t = slide.querySelector("[data-gallery-title]");
    var title = t ? t.textContent.trim() : "";
    live.textContent = idx + 1 + " / " + n + (title ? ": " + title : "");
  }

  var lastIdx = -1;

  function thumbLabels() {
    var T = window.SPORTFIT_T;
    var lang = window.SPORTFIT_getLang ? window.SPORTFIT_getLang() : "ru";
    var pat =
      T && T.galThumbAria
        ? T.galThumbAria[lang] || T.galThumbAria.ru
        : "Show photo %n%";
    dots.forEach(function (d) {
      var j = parseInt(d.getAttribute("data-gallery-dot"), 10);
      if (isNaN(j)) return;
      d.setAttribute("aria-label", pat.replace("%n%", String(j + 1)));
    });
  }

  function scrollActiveThumb() {
    var row = root.querySelector("[data-gallery-thumbs]");
    var activeDot = root.querySelector(".gallery-show-thumb.is-active");
    if (!row || !activeDot) return;
    var rowW = row.clientWidth;
    var dotCenter = activeDot.offsetLeft + activeDot.offsetWidth / 2;
    var target = dotCenter - rowW / 2;
    var max = Math.max(0, row.scrollWidth - rowW);
    var next = Math.max(0, Math.min(target, max));
    row.scrollTo({
      left: next,
      behavior: prefersReduce() ? "auto" : "smooth",
    });
  }

  function syncUI() {
    var idx = getIndex();
    if (currentEl) currentEl.textContent = String(idx + 1);
    dots.forEach(function (d) {
      var j = parseInt(d.getAttribute("data-gallery-dot"), 10);
      var on = j === idx;
      d.classList.toggle("is-active", on);
      d.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (idx !== lastIdx) {
      lastIdx = idx;
      scrollActiveThumb();
    }
    announce(idx);
  }

  var scrollLock = false;
  track.addEventListener(
    "scroll",
    function () {
      if (!scrollLock) {
        scrollLock = true;
        requestAnimationFrame(function () {
          scrollLock = false;
          syncUI();
        });
      }
    },
    { passive: true }
  );

  track.addEventListener("scrollend", syncUI);

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      goTo(getIndex() - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      goTo(getIndex() + 1);
    });
  }

  dots.forEach(function (d) {
    d.addEventListener("click", function () {
      var j = parseInt(d.getAttribute("data-gallery-dot"), 10);
      if (!isNaN(j)) goTo(j);
    });
  });

  track.addEventListener("keydown", function (e) {
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
    function () {
      var idx = getIndex();
      goTo(idx, false);
      syncUI();
    },
    { passive: true }
  );

  document.addEventListener("sportfit:i18n", thumbLabels);

  thumbLabels();
  syncUI();
})();

(function () {
  var grid = document.querySelector("[data-pricing-grid]");
  if (!grid) return;

  function syncPricingSkeleton() {
    if (grid.querySelector(".price-card.is-visible")) {
      grid.classList.add("pricing-grid--shown-cards");
      return true;
    }
    return false;
  }
  if (!syncPricingSkeleton()) {
    var skMo = new MutationObserver(function () {
      if (syncPricingSkeleton()) skMo.disconnect();
    });
    skMo.observe(grid, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  var cards = grid.querySelectorAll("[data-pricing-card]");
  var hint = document.getElementById("pricing-pick-hint");
  var STORAGE_KEY = "sportfit-pick-plan";

  function txt(key) {
    var T = window.SPORTFIT_T;
    var lang = window.SPORTFIT_getLang ? window.SPORTFIT_getLang() : "ru";
    if (!T || !T[key]) return "";
    var o = T[key];
    return o[lang] || o.ru || "";
  }

  function renderHint(plan) {
    if (!hint) return;
    var key =
      plan === "monthly"
        ? "prPickMonthly"
        : plan === "annual"
          ? "prPickAnnual"
          : "prPickPrompt";
    hint.textContent = txt(key);
    hint.classList.toggle("is-active", !!plan);
  }

  function applyPicked(plan) {
    cards.forEach(function (c) {
      c.classList.toggle(
        "price-card--picked",
        c.getAttribute("data-plan") === plan
      );
    });
    renderHint(plan);
    try {
      if (plan) localStorage.setItem(STORAGE_KEY, plan);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function pickFromCard(card) {
    var plan = card.getAttribute("data-plan");
    var current = null;
    cards.forEach(function (c) {
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

  cards.forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;
      pickFromCard(card);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (e.target.closest("a")) return;
      e.preventDefault();
      pickFromCard(card);
    });
  });

  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {}
  if (saved === "monthly" || saved === "annual") {
    applyPicked(saved);
  } else {
    renderHint(null);
  }

  document.addEventListener("sportfit:i18n", function () {
    var p = null;
    try {
      p = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    if (p === "monthly" || p === "annual") {
      renderHint(p);
    } else {
      renderHint(null);
    }
  });
})();

(function () {
  function isModifiedClick(e) {
    return (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey
    );
  }

  document.addEventListener("click", function (e) {
    if (isModifiedClick(e)) return;
    var a = e.target.closest("a[href^='#']");
    if (!a || !a.getAttribute("href")) return;
    var href = a.getAttribute("href");
    if (href === "#" || href === "#top") return;
    var id = href.slice(1);
    var el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    var reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    try {
      history.pushState(null, "", href);
    } catch (err) {}
  });
})();

(function () {
  function showWorkoutHint(key) {
    document.querySelectorAll(".workout-hint").forEach(function (p) {
      var k = p.getAttribute("data-workout-hint");
      p.hidden = key ? k !== key : k !== "default";
    });
    document.querySelectorAll(".workout-chip").forEach(function (b) {
      b.classList.toggle("is-active", !!key && b.getAttribute("data-workout") === key);
    });
  }

  document.querySelectorAll(".workout-chip").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showWorkoutHint(btn.getAttribute("data-workout"));
    });
  });

  document.addEventListener("sportfit:i18n", function () {
    var active = document.querySelector(".workout-chip.is-active");
    showWorkoutHint(active ? active.getAttribute("data-workout") : null);
  });

  showWorkoutHint(null);
})();

(function () {
  var submit = document.getElementById("calc-submit");
  var wrap = document.getElementById("calc-result-wrap");
  var errEl = document.getElementById("calc-error");
  var kcalSpan = document.getElementById("calc-kcal-value");
  var wEl = document.getElementById("calc-weight");
  var metEl = document.getElementById("calc-activity");
  var durEl = document.getElementById("calc-duration");
  if (!submit || !wrap || !errEl || !kcalSpan || !wEl || !metEl || !durEl) return;

  var lastErr = null;
  var debounceTimer = null;

  function txt(key) {
    var T = window.SPORTFIT_T;
    var lang = window.SPORTFIT_getLang ? window.SPORTFIT_getLang() : "ru";
    if (!T || !T[key]) return "";
    var o = T[key];
    return o[lang] || o.ru || "";
  }

  function parseNum(el) {
    var v = parseFloat(String(el.value).replace(",", "."), 10);
    return isNaN(v) ? NaN : v;
  }

  function showError(code) {
    lastErr = code;
    var msg = code === "empty" ? txt("calcErrEmpty") : txt("calcErrInvalid");
    errEl.textContent = msg;
    errEl.hidden = false;
    wrap.hidden = true;
  }

  function clearError() {
    lastErr = null;
    errEl.hidden = true;
    errEl.textContent = "";
  }

  function compute() {
    var wStr = String(wEl.value).trim();
    var dStr = String(durEl.value).trim();
    if (!wStr || !dStr) {
      showError("empty");
      return false;
    }
    var w = parseNum(wEl);
    var met = parseNum(metEl);
    var mins = parseNum(durEl);
    if (isNaN(w) || isNaN(met) || isNaN(mins) || w < 30 || w > 200 || mins < 10 || mins > 180 || met <= 0) {
      showError("invalid");
      return false;
    }
    clearError();
    var hours = mins / 60;
    var kcal = met * w * hours;
    kcalSpan.textContent = String(Math.round(kcal));
    wrap.hidden = false;
    return true;
  }

  function debouncedCompute() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      var wStr = String(wEl.value).trim();
      var dStr = String(durEl.value).trim();
      if (!wStr || !dStr) return;
      compute();
    }, 400);
  }

  submit.addEventListener("click", function () {
    compute();
  });

  [wEl, metEl, durEl].forEach(function (el) {
    el.addEventListener("input", debouncedCompute);
    el.addEventListener("change", debouncedCompute);
  });

  document.addEventListener("sportfit:i18n", function () {
    if (lastErr === "empty") showError("empty");
    else if (lastErr === "invalid") showError("invalid");
    else if (!wrap.hidden) compute();
  });
})();

(function () {
  document.addEventListener(
    "click",
    function (e) {
      var btn = e.target.closest(
        ".hero-actions .btn, .cta-action-buttons .btn, .program-card-pick, .program-card-secondary, .fit-card .btn, .fit-card-link, .btn-cta-mega"
      );
      if (!btn) return;
      btn.classList.add("is-cta-pressed");
      window.setTimeout(function () {
        btn.classList.remove("is-cta-pressed");
      }, 180);
    },
    true
  );
})();

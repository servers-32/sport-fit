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

  function pageMetaKey(attrName, fallback) {
    var body = document.body;
    if (!body) return fallback;
    return body.getAttribute(attrName) || fallback;
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

    var titleKey = pageMetaKey("data-meta-title-key", "payCheckoutMetaTitle");
    var descKey = pageMetaKey("data-meta-desc-key", "payCheckoutMetaDesc");
    var ogTitleKey = pageMetaKey("data-og-title-key", titleKey);
    var ogDescKey = pageMetaKey("data-og-desc-key", descKey);
    var md = document.getElementById("meta-desc");
    var ogd = document.getElementById("og-desc");
    var ogt = document.getElementById("og-title");

    document.title = txt(titleKey, lang) || txt("payCheckoutMetaTitle", lang);
    if (md) md.setAttribute("content", txt(descKey, lang) || txt("payCheckoutMetaDesc", lang));
    if (ogd) ogd.setAttribute("content", txt(ogDescKey, lang) || txt(descKey, lang) || txt("payCheckoutMetaDesc", lang));
    if (ogt) ogt.setAttribute("content", txt(ogTitleKey, lang) || txt(titleKey, lang) || txt("payCheckoutMetaTitle", lang));

    document.querySelectorAll(".lang-switch-btn").forEach(function (btn) {
      var isRu = btn.getAttribute("data-lang") === "ru";
      var active = (isRu && lang === "ru") || (!isRu && lang === "en");
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}

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

  function digitsOnly(s) {
    return String(s || "").replace(/\D/g, "");
  }

  function luhnValid(numStr) {
    var s = digitsOnly(numStr);
    if (s.length < 13 || s.length > 19) return false;
    var sum = 0;
    var alt = false;
    for (var i = s.length - 1; i >= 0; i--) {
      var n = parseInt(s.charAt(i), 10);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function parseExpiry(raw) {
    var s = String(raw || "")
      .replace(/\s/g, "")
      .replace(/^(\d{2})\/(\d{2})$/, "$1$2");
    var m = s.match(/^(\d{2})(\d{2})$/);
    if (!m) return null;
    var mm = parseInt(m[1], 10);
    var yy = parseInt(m[2], 10);
    if (mm < 1 || mm > 12) return null;
    var yyyy = 2000 + yy;
    return { m: mm, y: yyyy };
  }

  function expiryValid(parsed) {
    if (!parsed) return false;
    var now = new Date();
    var y = now.getFullYear();
    var mo = now.getMonth() + 1;
    if (parsed.y > y) return true;
    if (parsed.y < y) return false;
    return parsed.m >= mo;
  }

  function ageFromIsoDate(iso) {
    if (!iso) return 0;
    var parts = iso.split("-");
    if (parts.length !== 3) return 0;
    var bd = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
    var today = new Date();
    var age = today.getFullYear() - bd.getFullYear();
    var m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
    return age;
  }

  function setBirthMax() {
    var el = document.getElementById("ch-birth");
    if (!el) return;
    var d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    el.max = d.toISOString().slice(0, 10);
  }

  function getPaymentBase() {
    var meta = document.querySelector('meta[name="sportfit-payment-url"]');
    var raw = meta && meta.getAttribute("content");
    return raw ? String(raw).trim() : "";
  }

  function getStripePublishableKey() {
    var meta = document.querySelector('meta[name="stripe-publishable-key"]');
    var v = meta && meta.getAttribute("content");
    return v ? String(v).trim() : "";
  }

  function getStripeApiUrl() {
    var meta = document.querySelector('meta[name="stripe-api-url"]');
    var v = meta && meta.getAttribute("content");
    var t = v ? String(v).trim() : "";
    return t || "/create-payment-intent";
  }

  function syncExternalPay(plan) {
    var wrap = document.getElementById("checkout-external-wrap");
    var link = document.getElementById("checkout-external-pay");
    if (!wrap || !link || !plan) {
      if (wrap) wrap.hidden = true;
      return;
    }
    var base = getPaymentBase();
    if (
      !base ||
      /^https?:\/\/example\.com/i.test(base) ||
      base === "#"
    ) {
      wrap.hidden = true;
      return;
    }
    try {
      var u = new URL(base, location.href);
      u.searchParams.set("plan", plan);
      link.href = u.toString();
    } catch (e) {
      var sep = base.indexOf("?") >= 0 ? "&" : "?";
      link.href = base + sep + "plan=" + encodeURIComponent(plan);
    }
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    wrap.hidden = false;
  }

  function loadStripeJs() {
    return new Promise(function (resolve, reject) {
      if (window.Stripe) {
        resolve(window.Stripe);
        return;
      }
      var s = document.createElement("script");
      s.src = "https://js.stripe.com/v3/";
      s.async = true;
      s.onload = function () {
        if (window.Stripe) resolve(window.Stripe);
        else reject(new Error("Stripe"));
      };
      s.onerror = function () {
        reject(new Error("load"));
      };
      document.head.appendChild(s);
    });
  }

  function initStripeElements(publishableKey) {
    var StripeCtor = window.Stripe;
    if (!StripeCtor) return Promise.reject(new Error("no Stripe"));

    var stripe = StripeCtor(publishableKey);
    var elements = stripe.elements();
    var style = {
      base: {
        color: "#f8fafc",
        fontFamily: "Outfit, system-ui, sans-serif",
        fontSize: "16px",
        "::placeholder": { color: "#64748b" },
      },
      invalid: { color: "#fecaca" },
    };
    var card = elements.create("card", {
      style: style,
      hidePostalCode: true,
    });

    var mountEl = document.getElementById("card-element");
    if (!mountEl) return Promise.reject(new Error("no mount"));
    card.mount("#card-element");

    var cardComplete = false;
    card.on("change", function (ev) {
      cardComplete = ev.complete;
      var er = document.getElementById("card-element-errors");
      if (er) {
        er.textContent = ev.error ? ev.error.message : "";
      }
    });

    window.__sportfitStripe = {
      stripe: stripe,
      card: card,
      getComplete: function () {
        return cardComplete;
      },
    };
    window.__sportfitUseStripe = true;

    var leg = document.getElementById("legacy-card-fields");
    var st = document.getElementById("stripe-card-mount-wrap");
    if (leg) leg.hidden = true;
    if (st) st.hidden = false;

    ["ch-card-number", "ch-card-exp", "ch-card-cvc"].forEach(function (id) {
      var inp = document.getElementById(id);
      if (inp) {
        inp.required = false;
        inp.disabled = true;
      }
    });

    return Promise.resolve();
  }

  function tryInitStripeFromMeta() {
    var params = new URLSearchParams(location.search);
    var plan = params.get("plan");
    if (plan !== "monthly" && plan !== "annual") return;

    var pk = getStripePublishableKey();
    if (!pk || pk.indexOf("pk_") !== 0) return;

    loadStripeJs()
      .then(function () {
        return initStripeElements(pk);
      })
      .catch(function () {
        var er = document.getElementById("card-element-errors");
        if (er) er.textContent = txt("payStripeLoadError", getLang());
        var st = document.getElementById("stripe-card-mount-wrap");
        if (st) st.hidden = true;
        var leg = document.getElementById("legacy-card-fields");
        if (leg) leg.hidden = false;
        ["ch-card-number", "ch-card-exp", "ch-card-cvc"].forEach(function (id) {
          var inp = document.getElementById(id);
          if (inp) {
            inp.disabled = false;
            inp.required = true;
          }
        });
        window.__sportfitUseStripe = false;
        window.__sportfitStripe = null;
      });
  }

  function showFieldError(inputId, errId, messageKey) {
    var input = document.getElementById(inputId);
    var err = document.getElementById(errId);
    if (err) {
      err.textContent = txt(messageKey, getLang());
      err.hidden = false;
    }
    if (input) input.classList.add("field-invalid");
  }

  function clearFieldError(inputId, errId) {
    var input = document.getElementById(inputId);
    var err = document.getElementById(errId);
    if (err) {
      err.textContent = "";
      err.hidden = true;
    }
    if (input) input.classList.remove("field-invalid");
  }

  function clearFormErrors(form) {
    form.querySelectorAll(".field-error").forEach(function (el) {
      el.textContent = "";
      el.hidden = true;
    });
    form.querySelectorAll(".field-invalid").forEach(function (el) {
      el.classList.remove("field-invalid");
    });
    var stripeErr = document.getElementById("card-element-errors");
    if (stripeErr) stripeErr.textContent = "";
  }

  function validateContractFields() {
    var ok = true;
    var L = getLang();

    function need(cond, inputId, errId, key) {
      if (!cond) {
        showFieldError(inputId, errId, key);
        ok = false;
      } else {
        clearFieldError(inputId, errId);
      }
    }

    var fn = (document.getElementById("ch-firstname") || {}).value || "";
    var ln = (document.getElementById("ch-lastname") || {}).value || "";
    need(fn.trim().length >= 2, "ch-firstname", "ch-firstname-err", "payCheckoutErrRequired");
    need(ln.trim().length >= 2, "ch-lastname", "ch-lastname-err", "payCheckoutErrRequired");

    var birth = (document.getElementById("ch-birth") || {}).value || "";
    if (!birth) {
      showFieldError("ch-birth", "ch-birth-err", "payCheckoutErrRequired");
      ok = false;
    } else {
      var age = ageFromIsoDate(birth);
      if (age < 18) {
        showFieldError("ch-birth", "ch-birth-err", "payCheckoutErrAge");
        ok = false;
      } else {
        clearFieldError("ch-birth", "ch-birth-err");
      }
    }

    var email = (document.getElementById("ch-email") || {}).value || "";
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    need(emailOk, "ch-email", "ch-email-err", "payCheckoutErrEmail");

    var phoneDigits = digitsOnly((document.getElementById("ch-phone") || {}).value);
    need(phoneDigits.length >= 8, "ch-phone", "ch-phone-err", "payCheckoutErrPhone");

    var street = (document.getElementById("ch-street") || {}).value || "";
    need(street.trim().length >= 3, "ch-street", "ch-street-err", "payCheckoutErrRequired");

    var zip = ((document.getElementById("ch-zip") || {}).value || "").trim();
    var country = (document.getElementById("ch-country") || {}).value || "";
    if (country === "DE") {
      need(/^\d{5}$/.test(zip), "ch-zip", "ch-zip-err", "payCheckoutErrZip");
    } else {
      need(zip.length >= 3, "ch-zip", "ch-zip-err", "payCheckoutErrRequired");
    }

    var city = (document.getElementById("ch-city") || {}).value || "";
    need(city.trim().length >= 2, "ch-city", "ch-city-err", "payCheckoutErrRequired");

    var idType = (document.getElementById("ch-id-type") || {}).value || "";
    var idNum = (document.getElementById("ch-id-number") || {}).value || "";
    if (idType === "passport" || idType === "idcard") {
      need(idNum.trim().length >= 3, "ch-id-number", "ch-id-number-err", "payCheckoutErrIdNumber");
    } else {
      clearFieldError("ch-id-number", "ch-id-number-err");
    }

    var adult = document.getElementById("ch-adult");
    var adultOk = adult && adult.checked;
    var adultErr = document.getElementById("ch-adult-err");
    if (!adultOk) {
      if (adultErr) {
        adultErr.textContent = txt("payCheckoutErrAdult", L);
        adultErr.hidden = false;
      }
      ok = false;
    } else if (adultErr) {
      adultErr.textContent = "";
      adultErr.hidden = true;
    }

    var terms = document.getElementById("ch-terms");
    var termsOk = terms && terms.checked;
    var termsErr = document.getElementById("ch-terms-err");
    if (!termsOk) {
      if (termsErr) {
        termsErr.textContent = txt("payCheckoutErrTerms", L);
        termsErr.hidden = false;
      }
      ok = false;
    } else if (termsErr) {
      termsErr.textContent = "";
      termsErr.hidden = true;
    }

    return ok;
  }

  function validateLegacyCardFields() {
    var ok = true;
    function need(cond, inputId, errId, key) {
      if (!cond) {
        showFieldError(inputId, errId, key);
        ok = false;
      } else {
        clearFieldError(inputId, errId);
      }
    }

    var cname = (document.getElementById("ch-card-name") || {}).value || "";
    need(cname.trim().length >= 3, "ch-card-name", "ch-card-name-err", "payCheckoutErrRequired");

    var cnum = digitsOnly((document.getElementById("ch-card-number") || {}).value);
    if (cnum.length < 13 || cnum.length > 19) {
      showFieldError("ch-card-number", "ch-card-number-err", "payCheckoutErrCard");
      ok = false;
    } else if (!luhnValid(cnum)) {
      showFieldError("ch-card-number", "ch-card-number-err", "payCheckoutErrCardLuhn");
      ok = false;
    } else {
      clearFieldError("ch-card-number", "ch-card-number-err");
    }

    var expRaw = (document.getElementById("ch-card-exp") || {}).value || "";
    var exp = parseExpiry(expRaw);
    var expOk = exp && expiryValid(exp);
    need(expOk, "ch-card-exp", "ch-card-exp-err", "payCheckoutErrExp");

    var cvc = digitsOnly((document.getElementById("ch-card-cvc") || {}).value);
    need(cvc.length === 3 || cvc.length === 4, "ch-card-cvc", "ch-card-cvc-err", "payCheckoutErrCvc");

    return ok;
  }

  function validateCardNameOnly() {
    var cname = (document.getElementById("ch-card-name") || {}).value || "";
    if (cname.trim().length >= 3) {
      clearFieldError("ch-card-name", "ch-card-name-err");
      return true;
    }
    showFieldError("ch-card-name", "ch-card-name-err", "payCheckoutErrRequired");
    return false;
  }

  function buildBillingDetails() {
    var fn = (document.getElementById("ch-firstname") || {}).value || "";
    var ln = (document.getElementById("ch-lastname") || {}).value || "";
    var cname = (document.getElementById("ch-card-name") || {}).value || "";
    var country = (document.getElementById("ch-country") || {}).value || "DE";
    var iso = country === "OTHER" ? "DE" : country;
    return {
      name: (cname.trim() || (fn + " " + ln).trim()).slice(0, 200),
      email: ((document.getElementById("ch-email") || {}).value || "").trim(),
      phone: (document.getElementById("ch-phone") || {}).value || "",
      address: {
        line1: ((document.getElementById("ch-street") || {}).value || "").trim(),
        postal_code: ((document.getElementById("ch-zip") || {}).value || "").trim(),
        city: ((document.getElementById("ch-city") || {}).value || "").trim(),
        country: iso,
      },
    };
  }

  function wipeSensitiveFields() {
    ["ch-card-number", "ch-card-cvc", "ch-card-exp"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = "";
    });
  }

  function unmountStripeCard() {
    if (window.__sportfitStripe && window.__sportfitStripe.card) {
      try {
        window.__sportfitStripe.card.unmount();
      } catch (e) {}
    }
    window.__sportfitStripe = null;
    window.__sportfitUseStripe = false;
  }

  function showCheckoutSuccess(stripePaid) {
    var pci = document.getElementById("checkout-pci-banner");
    var form = document.getElementById("checkout-contract-form");
    var foot = document.getElementById("checkout-footnote");
    var success = document.getElementById("checkout-success");
    var ext = document.getElementById("checkout-external-wrap");
    var titleEl = document.getElementById("checkout-success-title");
    var bodyEl = document.getElementById("checkout-success-body");
    var L = getLang();

    if (pci) pci.hidden = true;
    if (form) form.hidden = true;
    if (ext) ext.hidden = true;
    if (foot) foot.hidden = true;

    if (titleEl) {
      titleEl.textContent = txt(
        stripePaid ? "payCheckoutSuccessStripeTitle" : "payCheckoutSuccessTitle",
        L
      );
    }
    if (bodyEl) {
      bodyEl.innerHTML = txt(
        stripePaid ? "payCheckoutSuccessStripeHtml" : "payCheckoutSuccessHtml",
        L
      );
    }
    if (success) {
      success.hidden = false;
      success.focus();
      success.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function submitStripePayment(form) {
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    var api = getStripeApiUrl();
    var plan =
      (document.getElementById("checkout-plan-field") || {}).value || "monthly";
    var email = ((document.getElementById("ch-email") || {}).value || "").trim();

    fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: plan, email: email }),
    })
      .then(function (r) {
        return r.text().then(function (text) {
          var j = {};
          try {
            j = text ? JSON.parse(text) : {};
          } catch (e) {}
          return { ok: r.ok, data: j };
        });
      })
      .then(function (res) {
        if (!res.ok || (res.data && res.data.error)) {
          throw new Error(
            (res.data && res.data.error) || txt("payStripeNetworkError", getLang())
          );
        }
        var clientSecret = res.data && res.data.clientSecret;
        if (!clientSecret) throw new Error(txt("payStripeNetworkError", getLang()));
        return window.__sportfitStripe.stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: window.__sportfitStripe.card,
            billing_details: buildBillingDetails(),
          },
        });
      })
      .then(function (result) {
        if (result.error) {
          throw new Error(result.error.message);
        }
        if (
          result.paymentIntent &&
          result.paymentIntent.status === "succeeded"
        ) {
          unmountStripeCard();
          showCheckoutSuccess(true);
        } else {
          throw new Error(txt("payStripePaymentFailed", getLang()));
        }
      })
      .catch(function (err) {
        var el = document.getElementById("card-element-errors");
        var msg =
          err && err.message
            ? err.message
            : txt("payStripePaymentFailed", getLang());
        if (el) el.textContent = msg;
      })
      .finally(function () {
        if (btn) btn.disabled = false;
      });
  }

  function initContractForm() {
    var form = document.getElementById("checkout-contract-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFormErrors(form);

      if (!validateContractFields()) return;

      var useStripe =
        window.__sportfitUseStripe && window.__sportfitStripe;

      if (useStripe) {
        if (!validateCardNameOnly()) return;
        if (!window.__sportfitStripe.getComplete()) {
          var er = document.getElementById("card-element-errors");
          if (er) {
            er.textContent = txt("payStripeCardIncomplete", getLang());
          }
          return;
        }
        submitStripePayment(form);
        return;
      }

      if (!validateLegacyCardFields()) return;

      wipeSensitiveFields();
      showCheckoutSuccess(false);
    });

    function clearThisFieldError(el) {
      var field = el.closest(".field");
      if (!field) return;
      var err = field.querySelector(".field-error");
      if (err) {
        err.textContent = "";
        err.hidden = true;
      }
      el.classList.remove("field-invalid");
    }
    form.querySelectorAll(".field input, .field select, .field textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        clearThisFieldError(el);
      });
      el.addEventListener("change", function () {
        clearThisFieldError(el);
      });
    });
    [["ch-adult", "ch-adult-err"], ["ch-terms", "ch-terms-err"]].forEach(function (pair) {
      var inp = document.getElementById(pair[0]);
      if (!inp) return;
      inp.addEventListener("change", function () {
        var err = document.getElementById(pair[1]);
        if (err) {
          err.textContent = "";
          err.hidden = true;
        }
      });
    });
  }

  function bootPlan() {
    var params = new URLSearchParams(location.search);
    var plan = params.get("plan");
    var monthlyEl = document.getElementById("checkout-plan-monthly");
    var annualEl = document.getElementById("checkout-plan-annual");
    var unknownEl = document.getElementById("checkout-plan-unknown");
    var formWrap = document.getElementById("checkout-form-wrapper");
    var successEl = document.getElementById("checkout-success");
    var planField = document.getElementById("checkout-plan-field");

    if (plan === "monthly") {
      if (monthlyEl) monthlyEl.hidden = false;
      if (planField) planField.value = "monthly";
      if (formWrap) formWrap.hidden = false;
      if (successEl) successEl.hidden = true;
      var form = document.getElementById("checkout-contract-form");
      if (form) form.hidden = false;
      setBirthMax();
      syncExternalPay("monthly");
    } else if (plan === "annual") {
      if (annualEl) annualEl.hidden = false;
      if (planField) planField.value = "annual";
      if (formWrap) formWrap.hidden = false;
      if (successEl) successEl.hidden = true;
      var formA = document.getElementById("checkout-contract-form");
      if (formA) formA.hidden = false;
      setBirthMax();
      syncExternalPay("annual");
    } else {
      if (unknownEl) unknownEl.hidden = false;
      if (formWrap) formWrap.hidden = true;
    }
  }

  function boot() {
    bootLang();
    bootPlan();
    initContractForm();
    setTimeout(tryInitStripeFromMeta, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("sportfit:i18n", function () {
    var params = new URLSearchParams(location.search);
    var plan = params.get("plan");
    if (plan === "monthly" || plan === "annual") syncExternalPay(plan);
  });

  window.SPORTFIT_getLang = getLang;
  window.SPORTFIT_applyLang = applyLang;
})();

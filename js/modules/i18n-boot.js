/** RU/EN: читает window.SPORTFIT_T из js/i18n.js, вешает переключатель и applyLang. */
const STORAGE_KEY = "sportfit-lang";

function getLang() {
  return document.documentElement.getAttribute("lang") === "en" ? "en" : "ru";
}

function txt(key, lang) {
  const T = window.SPORTFIT_T;
  if (!T || !T[key]) return "";
  const o = T[key];
  return o[lang] || o.ru || "";
}

function pageMetaKey(attrName, fallback) {
  const body = document.body;
  if (!body) return fallback;
  return body.getAttribute(attrName) || fallback;
}

export function applyLang(lang) {
  const T = window.SPORTFIT_T;
  if (!T) return;

  if (lang !== "en" && lang !== "ru") lang = "ru";
  document.documentElement.setAttribute("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (!k || !T[k]) return;
    el.textContent = txt(k, lang);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const k = el.getAttribute("data-i18n-html");
    if (!k || !T[k]) return;
    el.innerHTML = txt(k, lang);
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const k = el.getAttribute("data-i18n-alt");
    if (!k || !T[k]) return;
    el.setAttribute("alt", txt(k, lang));
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const k = el.getAttribute("data-i18n-aria");
    if (!k || !T[k]) return;
    el.setAttribute("aria-label", txt(k, lang));
  });

  document.querySelectorAll("[data-i18n-aria-group]").forEach((el) => {
    const k = el.getAttribute("data-i18n-aria-group");
    if (!k || !T[k]) return;
    el.setAttribute("aria-label", txt(k, lang));
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const k = el.getAttribute("data-i18n-placeholder");
    if (!k || !T[k]) return;
    el.setAttribute("placeholder", txt(k, lang));
  });

  const titleKey = pageMetaKey("data-meta-title-key", "metaTitle");
  const descKey = pageMetaKey("data-meta-desc-key", "metaDesc");
  const ogTitleKey = pageMetaKey("data-og-title-key", titleKey);
  const ogDescKey = pageMetaKey("data-og-desc-key", descKey);

  document.title = txt(titleKey, lang) || txt("metaTitle", lang);

  const md = document.getElementById("meta-desc");
  if (md) md.setAttribute("content", txt(descKey, lang) || txt("metaDesc", lang));
  const ogd = document.getElementById("og-desc");
  if (ogd) ogd.setAttribute("content", txt(ogDescKey, lang) || txt(descKey, lang) || txt("metaDesc", lang));
  const ogt = document.getElementById("og-title");
  if (ogt) ogt.setAttribute("content", txt(ogTitleKey, lang) || txt(titleKey, lang) || txt("metaTitle", lang));

  document.querySelectorAll(".lang-switch-btn").forEach((btn) => {
    const isRu = btn.getAttribute("data-lang") === "ru";
    const active = (isRu && lang === "ru") || (!isRu && lang === "en");
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  const toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    const open = toggle.getAttribute("aria-expanded") === "true";
    const openKey = toggle.getAttribute("data-i18n-aria-open") || "navClose";
    const closedKey = toggle.getAttribute("data-i18n-aria-closed") || "navOpen";
    toggle.setAttribute("aria-label", txt(open ? openKey : closedKey, lang));
  }

  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {}

  window.SPORTFIT_LANG = lang;
  document.dispatchEvent(new CustomEvent("sportfit:i18n"));
}

export function initI18n() {
  window.SPORTFIT_applyLang = applyLang;
  window.SPORTFIT_getLang = getLang;

  document.querySelectorAll(".lang-switch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const l = btn.getAttribute("data-lang");
      applyLang(l === "en" ? "en" : "ru");
    });
  });

  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {}
  if (saved === "en") {
    applyLang("en");
    return;
  }

  // Для RU текст уже встроен в HTML. Пропускаем массовый проход по DOM,
  // чтобы снизить работу на главном потоке при первом рендере.
  document.documentElement.setAttribute("lang", "ru");
  window.SPORTFIT_LANG = "ru";
}

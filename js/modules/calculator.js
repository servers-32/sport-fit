import { debounce, i18nText, prefersReducedMotion } from "./utils.js";

export function initCalorieCalculator() {
  const submit = document.getElementById("calc-submit");
  const wrap = document.getElementById("calc-result-wrap");
  const errEl = document.getElementById("calc-error");
  const kcalSpan = document.getElementById("calc-kcal-value");
  const wEl = document.getElementById("calc-weight");
  const metEl = document.getElementById("calc-activity");
  const durEl = document.getElementById("calc-duration");
  if (!submit || !wrap || !errEl || !kcalSpan || !wEl || !metEl || !durEl) return;

  /** @type {"empty" | "invalid" | null} */
  let lastErr = null;

  function parseNum(el) {
    const v = parseFloat(String(el.value).replace(",", "."), 10);
    return Number.isNaN(v) ? NaN : v;
  }

  function showError(code) {
    lastErr = code;
    const msg =
      code === "empty" ? i18nText("calcErrEmpty") : i18nText("calcErrInvalid");
    errEl.textContent = msg;
    errEl.hidden = false;
    wrap.hidden = true;
    wrap.classList.remove("calc-result-wrap--shown");
  }

  function clearError() {
    lastErr = null;
    errEl.hidden = true;
    errEl.textContent = "";
  }

  function showResult(kcalRounded) {
    clearError();
    kcalSpan.textContent = String(kcalRounded);
    wrap.hidden = false;
    if (prefersReducedMotion()) {
      wrap.classList.add("calc-result-wrap--shown");
      return;
    }
    wrap.classList.remove("calc-result-wrap--shown");
    void wrap.offsetWidth;
    requestAnimationFrame(() => {
      wrap.classList.add("calc-result-wrap--shown");
    });
  }

  function compute() {
    const wStr = String(wEl.value).trim();
    const dStr = String(durEl.value).trim();
    if (!wStr || !dStr) {
      showError("empty");
      return false;
    }
    const w = parseNum(wEl);
    const met = parseNum(metEl);
    const mins = parseNum(durEl);
    if (
      Number.isNaN(w) ||
      Number.isNaN(met) ||
      Number.isNaN(mins) ||
      w < 30 ||
      w > 200 ||
      mins < 10 ||
      mins > 180 ||
      met <= 0
    ) {
      showError("invalid");
      return false;
    }
    const hours = mins / 60;
    const kcal = met * w * hours;
    showResult(Math.round(kcal));
    return true;
  }

  const debouncedCompute = debounce(() => {
    const wStr = String(wEl.value).trim();
    const dStr = String(durEl.value).trim();
    if (!wStr || !dStr) return;
    compute();
  }, 400);

  submit.addEventListener("click", () => {
    compute();
  });

  function onKeyDown(e) {
    if (e.key !== "Enter") return;
    const t = e.target;
    if (t === wEl || t === metEl || t === durEl) {
      e.preventDefault();
      compute();
    }
  }

  [wEl, metEl, durEl].forEach((el) => {
    el.addEventListener("input", debouncedCompute);
    el.addEventListener("change", debouncedCompute);
    el.addEventListener("keydown", onKeyDown);
  });

  document.addEventListener("sportfit:i18n", () => {
    if (lastErr === "empty") showError("empty");
    else if (lastErr === "invalid") showError("invalid");
    else if (!wrap.hidden) compute();
  });
}

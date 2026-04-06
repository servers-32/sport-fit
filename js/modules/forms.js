import { i18nText } from "./utils.js";

export function initForms() {
  function showFieldErr(id, message) {
    const err = document.getElementById(id);
    const inputId = id.replace("-err", "");
    const input = document.getElementById(inputId);
    if (err) {
      err.textContent = message;
      err.hidden = !message;
    }
    if (input) input.classList.toggle("field-invalid", !!message);
  }

  function showSuccess(successEl) {
    if (!successEl) return;
    successEl.hidden = false;
    successEl.focus();
  }

  function hideSuccess(successEl) {
    if (successEl) successEl.hidden = true;
  }

  function clearFieldErrors(ids) {
    ids.forEach((id) => {
      const base = id.replace("-err", "");
      showFieldErr(id, "");
      const el = document.getElementById(base);
      if (el) el.classList.remove("field-invalid");
    });
  }

  function emitTrack(event, payload) {
    try {
      document.dispatchEvent(
        new CustomEvent("sportfit:track", {
          detail: { event, payload },
        })
      );
    } catch (err) {
      /* ignore */
    }
  }

  async function submitNetlifyForm(form) {
    if (!form || form.getAttribute("data-netlify") !== "true") return false;
    const body = new URLSearchParams(new FormData(form)).toString();
    const response = await fetch(form.getAttribute("action") || "/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) throw new Error("submit_failed");
    return true;
  }

  async function finalizeSubmit({ form, successEl, trackEvent, trackPayload }) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    try {
      await submitNetlifyForm(form);
      showSuccess(successEl);
      emitTrack(trackEvent, trackPayload);
      form.reset();
      return true;
    } catch (err) {
      showSuccess(successEl);
      emitTrack(trackEvent, trackPayload);
      form.reset();
      return true;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function clearContactErrors() {
    clearFieldErrors([
      "contact-interest-err",
      "contact-name-err",
      "contact-reach-err",
    ]);
  }

  const trainForm = document.getElementById("training-signup-form");
  if (trainForm) {
    const trainSuccess = document.getElementById("training-form-success");
    function clearTrainErrors() {
      clearFieldErrors([
        "train-name-err",
        "train-goal-err",
        "train-contact-err",
      ]);
    }
    trainForm.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("input", () => {
        hideSuccess(trainSuccess);
        const id = el.id;
        if (id === "train-name") showFieldErr("train-name-err", "");
        if (id === "train-goal") showFieldErr("train-goal-err", "");
        if (id === "train-contact") showFieldErr("train-contact-err", "");
      });
    });
    trainForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideSuccess(trainSuccess);
      clearTrainErrors();
      let name = (trainForm.querySelector("#train-name") || {}).value || "";
      let goal = (trainForm.querySelector("#train-goal") || {}).value || "";
      let contact = (trainForm.querySelector("#train-contact") || {}).value || "";
      name = name.trim();
      goal = goal.trim();
      contact = contact.trim();
      let ok = true;
      if (!name) {
        showFieldErr("train-name-err", i18nText("trainErrEmpty"));
        ok = false;
      }
      if (!goal) {
        showFieldErr("train-goal-err", i18nText("trainErrEmpty"));
        ok = false;
      }
      if (!contact) {
        showFieldErr("train-contact-err", i18nText("trainErrContact"));
        ok = false;
      }
      if (!ok) return;
      await finalizeSubmit({
        form: trainForm,
        successEl: trainSuccess,
        trackEvent: "training_form_submit",
      });
    });
  }

  const pricingQuickForm = document.getElementById("pricing-quick-form");
  if (pricingQuickForm) {
    const pricingSuccess = document.getElementById("pricing-quick-success");
    function clearPricingErrors() {
      clearFieldErrors(["pr-quick-name-err", "pr-quick-contact-err"]);
    }

    pricingQuickForm.querySelectorAll("input").forEach((el) => {
      el.addEventListener("input", () => {
        hideSuccess(pricingSuccess);
        clearPricingErrors();
      });
    });

    pricingQuickForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideSuccess(pricingSuccess);
      clearPricingErrors();
      const nameEl = pricingQuickForm.querySelector("#pr-quick-name");
      const contactEl = pricingQuickForm.querySelector("#pr-quick-contact");
      const timeEl = pricingQuickForm.querySelector("#pr-quick-time");
      const name = ((nameEl && nameEl.value) || "").trim();
      const contact = ((contactEl && contactEl.value) || "").trim();
      const time = ((timeEl && timeEl.value) || "").trim();

      let ok = true;
      if (!name) {
        showFieldErr("pr-quick-name-err", i18nText("formErrName"));
        ok = false;
      }
      if (!contact) {
        showFieldErr("pr-quick-contact-err", i18nText("formErrContact"));
        ok = false;
      }
      if (!ok) return;

      await finalizeSubmit({
        form: pricingQuickForm,
        successEl: pricingSuccess,
        trackEvent: "pricing_quick_form_submit",
        trackPayload: { has_time: !!time },
      });
    });
  }

  const form = document.querySelector(".contact-form");
  if (!form) return;
  const hp = form.querySelector('input[name="company"]');
  const success = document.getElementById("form-success");
  form.querySelectorAll("input, textarea, select").forEach((el) => {
    if (el.getAttribute("name") === "company") return;
    el.addEventListener("focus", () => hideSuccess(success));
    el.addEventListener("input", clearContactErrors);
    el.addEventListener("change", clearContactErrors);
  });
  form.addEventListener("submit", async (e) => {
    if (hp && hp.value) {
      e.preventDefault();
      return;
    }
    clearContactErrors();
    const interest = form.querySelector("#contact-interest");
    const nameEl = form.querySelector("#contact-name");
    const reach = form.querySelector("#contact-reach");
    const interestOk = interest && interest.value;
    const nameOk = nameEl && nameEl.value.trim();
    const reachOk = reach && reach.value.trim();
    let valid = true;
    if (!interestOk) {
      showFieldErr("contact-interest-err", i18nText("formErrInterest"));
      valid = false;
    }
    if (!nameOk) {
      showFieldErr("contact-name-err", i18nText("formErrName"));
      valid = false;
    }
    if (!reachOk) {
      showFieldErr("contact-reach-err", i18nText("formErrContact"));
      valid = false;
    }
    if (!valid) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    await finalizeSubmit({
      form,
      successEl: success,
      trackEvent: "contact_form_submit",
    });
    clearContactErrors();
  });
}

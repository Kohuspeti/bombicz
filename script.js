const FORMSPREE_URL = "https://formspree.io/f/mqerwygp";
const FADE_DURATION_MS = 190;

let currentLanguage = "hu";
let languageChangeInProgress = false;

const languageSwitch = document.querySelector(".language-switch");
const languageButtons = document.querySelectorAll("[data-language]");
const pageContent = document.getElementById("page-content");
const translatableElements = document.querySelectorAll("[data-i18n]");
const placeholderElements =
  document.querySelectorAll("[data-i18n-placeholder]");

const form = document.getElementById("feedback-form");
const submitButton = document.getElementById("submit-button");
const submitButtonText = submitButton.querySelector("span");
const statusMessage = document.getElementById("status-message");

function applyTranslations(language) {
  document.documentElement.lang = language;
  document.title =
    language === "hu"
      ? "Bombicz Katalin | Polgármesterjelölt"
      : "Katarína Bombiczová | Kandidátka na starostku";

  translatableElements.forEach((element) => {
    const translationKey = element.dataset.i18n;
    const translatedText = translations[language][translationKey];

    if (translatedText) {
      element.textContent = translatedText;
    }
  });

  placeholderElements.forEach((element) => {
    const translationKey = element.dataset.i18nPlaceholder;
    const translatedText = translations[language][translationKey];

    if (translatedText) {
      element.placeholder = translatedText;
    }
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.language === language;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  languageSwitch.dataset.activeLanguage = language;
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
}

async function changeLanguage(language) {
  if (
    language === currentLanguage ||
    languageChangeInProgress
  ) {
    return;
  }

  languageChangeInProgress = true;
  pageContent.classList.add("is-fading");

  await new Promise((resolve) => {
    window.setTimeout(resolve, FADE_DURATION_MS);
  });

  currentLanguage = language;
  applyTranslations(language);

  requestAnimationFrame(() => {
    pageContent.classList.remove("is-fading");
  });

  window.setTimeout(() => {
    languageChangeInProgress = false;
  }, FADE_DURATION_MS);
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeLanguage(button.dataset.language);
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  submitButton.disabled = true;
  submitButtonText.textContent =
    translations[currentLanguage].sending;

  statusMessage.textContent = "";
  statusMessage.className = "status-message";

  try {
    const response = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: new FormData(form),
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Form submission failed");
    }

    form.reset();
    statusMessage.textContent =
      translations[currentLanguage].success;
    statusMessage.className = "status-message success";
  } catch (error) {
    statusMessage.textContent =
      translations[currentLanguage].error;
    statusMessage.className = "status-message error";
  } finally {
    submitButton.disabled = false;
    submitButtonText.textContent =
      translations[currentLanguage].submit;
  }
});

function loadPortraitIfAvailable() {
  const portraitImage = document.getElementById("portrait-image");
  const realPortraitSource = portraitImage.dataset.portraitSrc;
  const placeholderSource = portraitImage.dataset.placeholderSrc;

  const testImage = new Image();

  testImage.onload = () => {
    portraitImage.src = realPortraitSource;
  };

  testImage.onerror = () => {
    portraitImage.src = placeholderSource;
  };

  testImage.src = realPortraitSource;
}

document.getElementById("year").textContent =
  new Date().getFullYear();

languageSwitch.dataset.activeLanguage = currentLanguage;
loadPortraitIfAvailable();

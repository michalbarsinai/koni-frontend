import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import he from "./locales/he.json";

export const RTL_LANGUAGES = new Set(["he"]);

export function applyDocumentDirection(lang: string) {
  const dir = RTL_LANGUAGES.has(lang) ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
}

const stored = localStorage.getItem("itamar_lang");
const initialLng = stored === "he" ? "he" : "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    lng: initialLng,
    fallbackLng: "en",
    supportedLngs: ["en", "he"],
    interpolation: { escapeValue: false },
  });

applyDocumentDirection(i18n.resolvedLanguage ?? "en");

i18n.on("languageChanged", (lng) => {
  applyDocumentDirection(lng);
  localStorage.setItem("itamar_lang", lng);
});

export default i18n;

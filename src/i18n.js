import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ta from "./locales/ta.json";
import hi from "./locales/hi.json";

/**
 * App-wide internationalization (English / Tamil / Hindi).
 *
 * Replaces the old Google Website Translate widget: content is translated from
 * local JSON dictionaries (src/locales/*.json), so switching is instant, works
 * offline and on localhost, and never mangles React's DOM. The chosen language
 * is detected from — and cached to — localStorage under "site-lang" (the same
 * key the previous switcher used, so existing visitors keep their choice).
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
      hi: { translation: hi },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ta", "hi"],
    nonExplicitSupportedLngs: true, // treat "en-US" etc. as "en"
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "site-lang",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false }, // React already escapes values
    react: { useSuspense: false },
  });

export default i18n;

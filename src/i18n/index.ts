import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enNavbar from "./locales/en/navbar.json";
import enServices from "./locales/en/services.json";

import arNavbar from "./locales/ar/navbar.json";
import arServices from "./locales/ar/services.json";

const savedLanguage = localStorage.getItem("language") || "ar";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                navbar: enNavbar,
                services: enServices
            },
            ar: {
                navbar: arNavbar,
                services: arServices
            },
        },

        lng: savedLanguage,
        fallbackLng: "en",

        ns: [
            "navbar",
            "services"
        ],

        interpolation: {
            escapeValue: false,
        },
    });

document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";

document.documentElement.lang = savedLanguage;

i18n.on("languageChanged", (lng) => {
    localStorage.setItem("language", lng);

    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";

    document.documentElement.lang = lng;
})

export default i18n;
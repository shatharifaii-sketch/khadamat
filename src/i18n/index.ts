import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enNavbar from "./locales/en/navbar.json";
import enServices from "./locales/en/services.json";
import enChat from "./locales/en/chat.json";
import enAccount from "./locales/en/account.json";

import arNavbar from "./locales/ar/navbar.json";
import arServices from "./locales/ar/services.json";
import arChat from "./locales/ar/chat.json";
import arAccount from "./locales/ar/account.json";

const savedLanguage = localStorage.getItem("language") || "ar";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                navbar: enNavbar,
                services: enServices,
                chat: enChat,
                account: enAccount
            },
            ar: {
                navbar: arNavbar,
                services: arServices,
                chat: arChat,
                account: arAccount
            },
        },

        lng: savedLanguage,
        fallbackLng: "en",

        ns: [
            "navbar",
            "services",
            "chat",
            "account"
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
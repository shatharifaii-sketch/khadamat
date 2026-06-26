import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enNavbar from "./locales/en/navbar.json";
import enServices from "./locales/en/services.json";
import enChat from "./locales/en/chat.json";
import enAccount from "./locales/en/account.json";
import enFooter from "./locales/en/footer.json";
import enHome from "./locales/en/home.json";
import enProfile from "./locales/en/profile.json";
import enContact from "./locales/en/contact.json";
import enAbout from "./locales/en/about.json";
import enFaqs from "./locales/en/faqs.json";
import enAdmin from "./locales/en/admin.json";
import enSubscriptions from "./locales/en/subscriptions.json";
import enAuth from "./locales/en/auth.json";
import enResponses from "./locales/en/responses.json";

import arNavbar from "./locales/ar/navbar.json";
import arServices from "./locales/ar/services.json";
import arChat from "./locales/ar/chat.json";
import arAccount from "./locales/ar/account.json";
import arFooter from "./locales/ar/footer.json";
import arHome from "./locales/ar/home.json";
import arProfile from "./locales/ar/profile.json";
import arContact from "./locales/ar/contact.json";
import arAbout from "./locales/ar/about.json";
import arFaqs from "./locales/ar/faqs.json";
import arAdmin from "./locales/ar/admin.json";
import arSubscriptions from "./locales/ar/subscriptions.json";
import arAuth from "./locales/ar/auth.json";
import arResponses from "./locales/ar/responses.json";

const savedLanguage = localStorage.getItem("language") || "ar";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                navbar: enNavbar,
                services: enServices,
                chat: enChat,
                account: enAccount,
                footer: enFooter,
                home: enHome,
                profile: enProfile,
                contact: enContact,
                about: enAbout,
                faqs: enFaqs,
                admin: enAdmin,
                subscriptions: enSubscriptions,
                auth: enAuth,
                responses: enResponses
            },
            ar: {
                navbar: arNavbar,
                services: arServices,
                chat: arChat,
                account: arAccount,
                footer: arFooter,
                home: arHome,
                profile: arProfile,
                contact: arContact,
                about: arAbout,
                faqs: arFaqs,
                admin: arAdmin,
                subscriptions: arSubscriptions,
                auth: arAuth,
                responses: arResponses
            },
        },

        lng: savedLanguage,
        fallbackLng: "en",

        ns: [
            "navbar",
            "services",
            "chat",
            "account",
            "footer",
            "home",
            "profile",
            "contact",
            "about",
            "faqs",
            "admin",
            "subscriptions",
            "auth",
            "responses"
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
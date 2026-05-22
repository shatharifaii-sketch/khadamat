import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    'nav.home': 'الرئيسية',
    'nav.findService': 'ابحث عن خدمة',
    'nav.postService': 'أضف خدمة',
    'nav.about': 'من نحن',
    'nav.contact': 'تواصل معنا',
    'nav.account': 'حسابي',
    'nav.messages': 'الرسائل',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'hero.title': 'ابحث عن الخدمة المناسبة',
    'hero.subtitle': 'في مكان واحد',
    'hero.description': 'منصة تربط بين مقدمي الخدمات المحترفين والأشخاص الباحثين عن الخدمات بطريقة سهلة وآمنة',
    'button.searchService': 'ابحث عن خدمة',
    'button.postService': 'انشر خدمتك',
    'login.required': 'تسجيل الدخول مطلوب',
    'login.required.message': 'يجب تسجيل الدخول أولاً لتتمكن من إرسال رسالة',
    'contact.sendMessage': 'أرسل رسالة'
  },
  en: {
    'nav.home': 'Home',
    'nav.findService': 'Find Service',
    'nav.postService': 'Post Service',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.account': 'My Account',
    'nav.messages': 'Messages',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'hero.title': 'Find the Right Service',
    'hero.subtitle': 'In One Place',
    'hero.description': 'A platform that connects professional service providers with people looking for services in an easy and secure way',
    'button.searchService': 'Find Service',
    'button.postService': 'Post Your Service',
    'login.required': 'Login Required',
    'login.required.message': 'You must login first to send a message',
    'contact.sendMessage': 'Send Message'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

const setGoogleTranslateCookie = (lang: Language) => {
  // Google Translate reads the `googtrans` cookie to choose target language.
  const value = lang === 'ar' ? '/ar/ar' : '/ar/en';
  const hostname = window.location.hostname;
  const domains = ['', hostname, '.' + hostname];
  // Clear existing cookies first
  domains.forEach((d) => {
    document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${d ? `;domain=${d}` : ''}`;
  });
  document.cookie = `googtrans=${value};path=/`;
  document.cookie = `googtrans=${value};path=/;domain=${hostname}`;
  document.cookie = `googtrans=${value};path=/;domain=.${hostname}`;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'ar';
    const stored = localStorage.getItem('app_language') as Language | null;
    return stored === 'en' || stored === 'ar' ? stored : 'ar';
  });

  const applyLanguage = (lang: Language) => {
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    html.classList.add('translating-lang');
    setGoogleTranslateCookie(lang);
    // Trigger Google Translate to re-evaluate by reloading once cookie is set.
    // A reload is the most reliable way for the widget to pick up the new cookie.
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  // Apply direction on initial mount without reloading.
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', language);
    html.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, []);

  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    localStorage.setItem('app_language', lang);
    setLanguageState(lang);
    applyLanguage(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
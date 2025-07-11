import React, { createContext, useContext, useState, ReactNode } from 'react';

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

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
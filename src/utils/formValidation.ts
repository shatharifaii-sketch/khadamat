import { locations } from "@/components/FindService/ServiceCategories";
import { ServiceLink } from "@/components/PostService/ServiceLinks";

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: 'البريد الإلكتروني مطلوب' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'يرجى إدخال بريد إلكتروني صحيح (مثال: info@khedemtak.com)' };
  }
  
  return { isValid: true, message: '' };
};

export const validateLinks = (links: ServiceLink[]): ValidationResult => {
  if (!links || links.length === 0) {
    return { isValid: true, message: '' };
  }

  const domainMap: Record<string, string[]> = {
    instagram: ["instagram.com"],
    facebook: ["facebook.com"],
    x: ["x.com", "twitter.com"],
    youtube: ["youtube.com", "youtu.be"],
    linkedin: ["linkedin.com"],
    tiktok: ["tiktok.com"]
  };

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const row = i + 1;

    if (!link.type.trim()) {
      return {
        isValid: false,
        message: `يرجى إدخال نوع رابط رقم ${row}`
      }
    }

    if (!link.url.trim()) {
      return {
        isValid: false,
        message: `يرجى إدخال رابط رقم ${row}`
      }
    }

    try {
      const parsedUrl = new URL(link.url);

      const allowedDomains = domainMap[link.type];

      if (allowedDomains) {
        const matches = allowedDomains.some((domain) => parsedUrl.hostname.includes(domain));

        if (!matches) {
          return {
            isValid: false,
            message: `يرجى إدخال رابط صحيح من نوع ${link.type} رقم ${row}`
          }
        }
      }
    } catch (error) {
      return {
        isValid: false,
        message: `يرجى إدخال رابط صحيح من نوع ${link.type} رقم ${row}`
      }
    }
  }

  return { isValid: true, message: '' };
}

const normalizeDigits = (value: string) => {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
};

export const validateWhatsappNumber = ({countryCode, number}: {countryCode: string, number: string}): ValidationResult => {
  if (!number.trim()) {
    return { isValid: false, message: 'رقم الهاتف مطلوب' };
  }

  const cleanPhone = normalizeDigits(number)
    .replace(/[^\d+]/g, '')     // remove spaces, symbols
    .replace(/^\+?970/, '0');   // normalize country code

  const phoneRegex = /^(059|056|057|058|052)\d{7}$/;

  if (!phoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      message: 'يرجى إدخال رقم هاتف صحيح (مثال: 0599123456)'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

export const formatWhatsappNumber = ({countryCode, number}: {countryCode: string, number: string}) => {
  return `${countryCode}${number.replace(/^0+/, "")}`;
}

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: false, message: 'رقم الهاتف مطلوب' };
  }

  const cleanPhone = normalizeDigits(phone)
    .replace(/[\s-]/g, '')
    .replace(/^\+?970/, '0');

  const phoneRegex = /^(059|056|057|058|052)\d{7}$/;

  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, message: 'يرجى إدخال رقم هاتف صحيح (مثال: 0599123456)' };
  }

  return { isValid: true, message: '' };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, message: `${fieldName} مطلوب` };
  }
  return { isValid: true, message: '' };
};

export const validateLocation = (value: string, fieldName: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: true, message: '' }; // Location is optional, so it's valid if empty
  } else {
    const isValid = locations.includes(value);

    return {
      isValid,
      message: isValid ? '' : `يرجى اختيار ${fieldName} من القائمة`
    };
  }

}

export const validateTitle = (title: string): ValidationResult => {
  if (!title.trim()) {
    return { isValid: false, message: 'عنوان الخدمة مطلوب' };
  }
  if (title.length < 5) {
    return { isValid: false, message: 'عنوان الخدمة يجب أن يكون 5 أحرف على الأقل' };
  }
  return { isValid: true, message: '' };
};

export const validateDescription = (description: string): ValidationResult => {
  if (!description.trim()) {
    return { isValid: false, message: 'وصف الخدمة مطلوب' };
  }
  if (description.length < 20) {
    return { isValid: false, message: 'وصف الخدمة يجب أن يكون 20 حرف على الأقل' };
  }
  return { isValid: true, message: '' };
};

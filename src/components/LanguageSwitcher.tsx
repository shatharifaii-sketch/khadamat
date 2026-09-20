import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'ar' ? 'en' : 'ar';

    i18n.changeLanguage(newLanguage);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Change language"
      onClick={toggleLanguage}
      className="gap-1"
    >
      <Globe size={16} />
      <span className="text-xs font-medium">
        {currentLanguage === 'en' && 'EN'}
        {currentLanguage === 'ar' && 'ع'}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Change language"
      onClick={toggleLanguage}
      className="gap-1 notranslate"
      translate="no"
    >
      <Globe size={16} />
      <span className="text-xs font-medium">
        {language === 'ar' ? 'EN' : 'ع'}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
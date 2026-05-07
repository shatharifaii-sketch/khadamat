import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const toggle = () => setLanguage(language === 'ar' ? 'en' : 'ar');

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label="Change language"
      className="gap-1"
    >
      <Globe size={16} />
      <span className="text-xs font-medium">
        {language === 'ar' ? 'EN' : 'ع'}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface ServiceExperienceProps {
  experience: string;
  onExperienceChange: (value: string) => void;
}

const ServiceExperience = ({ experience, onExperienceChange }: ServiceExperienceProps) => {
  const { t } = useTranslation("services");
  return (
    <div className="space-y-2">
      <Label htmlFor="experience" className="text-large font-semibold">{t("post_service.experience")}</Label>
      <Input
        id="experience"
        placeholder={t("post_service.experience_placeholder")}
        value={experience}
        onChange={(e) => onExperienceChange(e.target.value)}
        className="text-large"
      />
    </div>
  );
};

export default ServiceExperience;

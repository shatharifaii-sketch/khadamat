
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ServiceExperienceProps {
  experience: string;
  onExperienceChange: (value: string) => void;
}

const ServiceExperience = ({ experience, onExperienceChange }: ServiceExperienceProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="experience" className="text-large font-semibold">سنوات الخبرة</Label>
      <Input
        id="experience"
        placeholder="مثال: 5 سنوات"
        value={experience}
        onChange={(e) => onExperienceChange(e.target.value)}
        className="text-large"
      />
    </div>
  );
};

export default ServiceExperience;

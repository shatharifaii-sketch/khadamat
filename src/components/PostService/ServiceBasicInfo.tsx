
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { serviceCategories } from './ServiceCategoryData';

interface ServiceBasicInfoProps {
  title: string;
  category: string;
  description: string;
  onTitleChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const ServiceBasicInfo = ({
  title,
  category,
  description,
  onTitleChange,
  onCategoryChange,
  onDescriptionChange
}: ServiceBasicInfoProps) => {
  return (
    <>
      {/* Service Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-large font-semibold">عنوان الخدمة *</Label>
        <Input
          id="title"
          placeholder="مثال: تصوير الأفراح والمناسبات"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-large"
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-large font-semibold">فئة الخدمة *</Label>
        <Select onValueChange={onCategoryChange} required>
          <SelectTrigger className="text-large">
            <SelectValue placeholder="اختر فئة الخدمة" />
          </SelectTrigger>
          <SelectContent>
            {serviceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    <Icon size={18} />
                    <span>{category.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-large font-semibold">وصف تفصيلي للخدمة *</Label>
        <Textarea
          id="description"
          placeholder="اكتب وصفاً مفصلاً عن خدمتك، خبرتك، والمميزات التي تقدمها..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="text-large min-h-32"
          required
        />
      </div>
    </>
  );
};

export default ServiceBasicInfo;

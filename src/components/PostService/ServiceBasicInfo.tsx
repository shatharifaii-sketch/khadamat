
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { serviceCategories } from './ServiceCategoryData';
import FormField from '@/components/ui/form-field';
import { useEffect } from 'react';

interface ServiceBasicInfoProps {
  title: string;
  category: string;
  description: string;
  onTitleChange: (value: string) => void;
  onCategoryChange: (value: string) => void;  
  onDescriptionChange: (value: string) => void;
  onTitleBlur?: () => void;
  onDescriptionBlur?: () => void;
  titleError?: string;
  categoryError?: string;
  descriptionError?: string;
}

const ServiceBasicInfo = ({
  title,
  category,
  description,
  onTitleChange,
  onCategoryChange,
  onDescriptionChange,
  onTitleBlur,
  onDescriptionBlur,
  titleError,
  categoryError,
  descriptionError
}: ServiceBasicInfoProps) => {
  return (
    <>
      {/* Service Title */}
      <FormField
        label="عنوان الخدمة"
        id="title"
        placeholder="مثال: تصوير الأفراح والمناسبات"
        value={title}
        onChange={onTitleChange}
        onBlur={onTitleBlur}
        error={titleError}
        required
      />

      {/* Category */}
      <div className="space-y-2">
        <label className="text-large font-semibold text-foreground">
          فئة الخدمة *
        </label>
        <Select onValueChange={onCategoryChange} value={category} required>
          <SelectTrigger className={`text-large ${categoryError ? 'border-destructive' : ''}`}>
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
        {categoryError && (
          <p className="text-sm text-destructive font-medium" role="alert">
            {categoryError}
          </p>
        )}
      </div>

      {/* Description */}
      <FormField
        label="وصف تفصيلي للخدمة"
        id="description"
        type="textarea"
        placeholder="اكتب وصفاً مفصلاً عن خدمتك، خبرتك، والمميزات التي تقدمها..."
        value={description}
        onChange={onDescriptionChange}
        onBlur={onDescriptionBlur}
        error={descriptionError}
        required
      />
    </>
  );
};

export default ServiceBasicInfo;

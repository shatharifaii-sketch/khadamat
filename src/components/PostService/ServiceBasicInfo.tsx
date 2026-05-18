
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from '@/components/ui/form-field';
import { useEffect } from 'react';
import { categories } from '../FindService/ServiceCategories';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation("services");
  return (
    <>
      {/* Service Title */}
      <FormField
        label={t("post_service.title")}
        id="title"
        placeholder={t("post_service.title_placeholder")}
        value={title}
        onChange={onTitleChange}
        onBlur={onTitleBlur}
        error={titleError}
        required
      />

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          {t("post_service.category")} *
        </label>
        <Select onValueChange={onCategoryChange} value={category} required>
          <SelectTrigger className={`text-large ${categoryError ? 'border-destructive' : ''}`}>
            <SelectValue placeholder={t("post_service.category_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    <Icon size={18} />
                    <span>{t(category.label)}</span>
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
        label={t("post_service.description")}
        id="description"
        type="textarea"
        placeholder={t("post_service.description_placeholder")}
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

import { useTranslation } from "react-i18next";

interface PostServiceHeaderProps {
  children?: React.ReactNode;
  isEditMode?: boolean;
}

const PostServiceHeader = ({ children, isEditMode }: PostServiceHeaderProps) => {
  const { t } = useTranslation("services");
  return (
    <div className="text-center mb-4 md:mb-12">
      <h1 className="text-xl md:text-2xl font-bold text-foreground md:mb-4 mb-2">
        {isEditMode ? t("post_service.edit_service_title") : t("post_service.post_service_title")}
      </h1>
      <p className="text-md md:text-xl text-muted-foreground mb-6">
        {t("post_service.post_service_description")}
      </p>
      {children}
    </div>
  );
};

export default PostServiceHeader;

import { useTranslation } from "react-i18next";

interface PostServiceHeaderProps {
  children?: React.ReactNode;
  isEditMode?: boolean;
}

const PostServiceHeader = ({ children, isEditMode }: PostServiceHeaderProps) => {
  const { t } = useTranslation("services");
  return (
    <div className="text-center mb-12">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        {isEditMode ? t("post_service.edit_service_title") : t("post_service.post_service_title")}
      </h1>
      <p className="text-xl text-muted-foreground mb-6">
        {t("post_service.post_service_description")}
      </p>
      {children}
    </div>
  );
};

export default PostServiceHeader;

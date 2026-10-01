import { useTranslation } from "react-i18next";
import TopCategoriesList from "./components/TopCategoriesList";

const TopCategoriesWrapper = () => {
  const { t } = useTranslation("home");
  const lang = localStorage.getItem("language") || "en";

  return (
    <div className="lg:w-4/6 mx-auto px-10 py-7" dir={lang === "ar" ? "rtl" : "ltr"}>
      <p className="text-lg md:text-2xl font-semibold text-start">
        {t("top_categories.title")}
      </p>
      <p className="text-sm md:text-md text-start text-muted-foreground">
        {t("top_categories.description")}
      </p>
      <div className="my-2 border-t border-muted-foreground/20" />

      <TopCategoriesList />
    </div>
  );
};

export default TopCategoriesWrapper;

import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  review_count: number;
  avg_rating: number;
  className?: string;
}

const ReviewsComponent = ({ review_count, avg_rating, className }: Props) => {
  const { t } = useTranslation("services");
  const lang = localStorage.getItem("language") || "en";

  const avg = useRef(avg_rating);
  const count = useRef(review_count);

  return (
    <div className={cn("flex gap-1 items-center", className)} dir={lang == "ar" ? "rtl" : "ltr"}>
      <StarIcon size={18} stroke="#fbbf24" fill="#fbbf24" />
      <span>{avg.current > 0 ? avg.current : t("find_service.card.be_first_to_review")}</span>
    </div>
  );
};

export default ReviewsComponent;

import { useTranslation } from "react-i18next";
import { ChatServiceProps } from "../ChatLayout";
import { useChatDeals } from "@/hooks/useChatDeals";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import DealCard from "./DealCard";

interface Props {
  service?: ChatServiceProps;
  conversationId: string;
}

const ChatDeals = ({ service, conversationId }: Props) => {
  const { t } = useTranslation("chat");
  const lang = localStorage.getItem("language") || "en";
  const isMobile = useIsMobile();

  const {
    deals,
    deleteDeal,
    isDeletingDealSuccess,

    acceptDeal,
    isAcceptingDeal,
    isAcceptingDealSuccess,

    rejectDeal,
    isRejectingDeal,
    isRejectingDealSuccess,
  } = useChatDeals({
    conversationId,
  });

  if (!deals || deals.length == 0) {
    return;
  }

  return (
    <div
      className={cn(
        "w-full text-start flex flex-col gap-2",
        isMobile ? "mt-5" : "mr-2",
      )}
      dir={lang == "en" ? "ltr" : "rtl"}
    >
      <div>
        <h3 className="text-lg md:text-xl">{t("deals.title")}</h3>
        <p className="text-muted-foreground text-xs md:text-md">
          {t("deals.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            deleteDeal={deleteDeal}
            isDeletingDealSuccess={isDeletingDealSuccess}
            acceptDeal={acceptDeal}
            isAcceptingDeal={isAcceptingDeal}
            isAcceptingDealSuccess={isAcceptingDealSuccess}
            rejectDeal={rejectDeal}
            isRejectingDeal={isRejectingDeal}
            isRejectingDealSuccess={isRejectingDealSuccess}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatDeals;

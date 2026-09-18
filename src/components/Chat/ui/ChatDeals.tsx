import { useTranslation } from "react-i18next"
import { ChatServiceProps } from "../ChatLayout"
import { useChatDeals } from "@/hooks/useChatDeals";

interface Props {
    service?: ChatServiceProps;
    conversationId: string;
}

const ChatDeals = ({
    service,
    conversationId
}: Props) => {
    const { t } = useTranslation("chat");
    const lang = localStorage.getItem("language") || "en";

    const { deals } = useChatDeals({
        conversationId
    });

    if (!deals || deals.length == 0) {
        return;
    }

  return (
    <div className="w-full text-start" dir={lang == "en" ? "ltr" : "rtl"}>
        <h3 className="text-lg md:text-xl">{t("deals.title")}</h3>
        <p className="text-muted-foreground text-xs md:text-md">{t("deals.description")}</p>

        <div>
            {deals.map((deal) => (
                <></>
            ))}
        </div>
    </div>
  )
}

export default ChatDeals
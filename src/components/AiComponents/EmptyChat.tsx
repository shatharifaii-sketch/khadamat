import { ChatSuggestions } from "@/types/ai";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";

interface Props {
    setSuggestion: React.Dispatch<React.SetStateAction<string>>
}

const EmptyChat = ({
    setSuggestion
}: Props) => {
    const { t } = useTranslation("aiChat");

    const suggestions: ChatSuggestions = [
        t("suggestions_list.where_start_subscription"),
        t("suggestions_list.start_without_bank"),
        t("suggestions_list.file_complaint"),
    ]

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-2 mt-2">
        <h1 className="text-2xl font-bold text-center flex items-center gap-1">
            <span className="text-primary text-center">
                <Sparkles />
            </span>
            {t("no_messages")}
            <span className="text-primary text-center">
                <Sparkles />
            </span>
        </h1>

        <div className="flex flex-col gap-2 items-center justify-center">
            <p className="text-muted-foreground">{t("suggestions")}</p>
            <div className="flex flex-wrap gap-1 items-center justify-center">
                {suggestions.map((suggestion, index) => (
                    <Badge 
                    key={index} 
                    onClick={() => setSuggestion(suggestion)}
                    className="cursor-pointer border-primary border-2 hover:bg-primary hover:text-primary-foreground hover:border-transparent py-1 px-2"
                    variant="secondary"
                    >
                        {suggestion}
                    </Badge>
                ))}
            </div>
        </div>
    </div>
  )
}

export default EmptyChat
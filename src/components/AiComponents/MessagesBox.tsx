import { cn } from "@/lib/utils"
import { useAiChatStore } from "@/stores/useAiChatStore"
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
    className?: string
}

const MessagesBox = ({ className }: Props) => {
  const { t } = useTranslation("aiChat");
  const lang = localStorage.getItem("language") || "en";

  const { messages, isLoading } = useAiChatStore();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages]);

  return (
    <div className={cn(
      className,
      "w-full h-full bg-secondary p-4 overflow-y-auto flex flex-col gap-3"
    )}
    dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {messages.length === 0 && (
        <div
          className="text-center text-muted-foreground mt-10"
        >
          {t("no_messages")}
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "max-w-[85%] rounded-lg px-3 py-2",
            msg.role === "user"
              ? "bg-primary text-primary-foreground self-end"
              : "bg-background border self-start"
          )}
        >
          {msg.content}
        </div>
      ))}

      {isLoading && (
        <div
          className="bg-background border rounded-lg px-3 py-2 self-start"
        >
          {t("typing")}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

export default MessagesBox
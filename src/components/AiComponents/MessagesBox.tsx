import { cn } from "@/lib/utils"
import { useAiChatStore } from "@/stores/useAiChatStore"
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EmptyChat from "./EmptyChat";
import { ChatSuggestions } from "@/types/ai";

interface Props {
    className?: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>
}

const MessagesBox = ({ className, setMessage }: Props) => {
  const { t } = useTranslation("aiChat");
  const lang = localStorage.getItem("language") || "en";


  const { messages, isLoading } = useAiChatStore();

  console.log(messages);

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
          <EmptyChat
            setSuggestion={setMessage}
          />
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
          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

export default MessagesBox
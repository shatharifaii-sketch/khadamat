import { SendHorizonal } from "lucide-react"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useAiChatStore } from "@/stores/useAiChatStore"

interface Props {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>
}

const MessageInputField = ({
  message,
  setMessage
}: Props) => {
  const { t } = useTranslation("aiChat");
  const lang = localStorage.getItem("language") || "en";

  const { pathname } = useLocation();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { sendMessage, isLoading } = useAiChatStore();

  const handleChange = (value: string) => {
    setMessage(value);

    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const content = message;
    setMessage('');

    await sendMessage(content, pathname, lang);
  }

  return (
    <div className="w-full grid grid-cols-5 gap-2 items-center px-3 pt-2" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={t("message_placeholder")}
        className="col-span-4 min-h-[40px] max-h-[70px] resize-none overflow-y-auto"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        disabled={isLoading}
      />
      <Button
        disabled={!message.trim() || isLoading}
        onClick={handleSendMessage}
      >
        <SendHorizonal className='w-20 h-20' />
      </Button>
    </div>
  )
}

export default MessageInputField
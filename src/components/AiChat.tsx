import { cn } from "@/lib/utils";
import { BotMessageSquare, X } from "lucide-react";
import { useState } from "react"

const AiChat = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className={cn("border-2 index-0 sticky right-5 bg-white flex items-center justify-center", open ? "bottom-0 w-[400px] h-[500px] rounded-t-lg" : "bottom-5 size-16 cursor-pointer rounded-full hover:shadow-md hover:shadow-primary p-1 hover:text-primary transition-all duration-300")}>
        <div className={cn("flex items-center justify-center size-16", open ? "hidden" : "w-full")} onClick={() => setOpen(true)}>
          <BotMessageSquare className="size-10" />
        </div>

        <div className={cn("flex flex-col items-center justify-start pt-2", open ? "w-full h-full" : "hidden")}>
          <div className="border-b-2 w-full px-3 py-1 flex items-center justify-between" dir="ltr">
            <div>AI CHAT</div>
            <div className="rounded-md p-1 border border-transparent cursor-pointer hover:border-gray-300 group" onClick={() => setOpen(false)}>
              <X className="group-hover:text-red-500" />
            </div>
          </div>
          <p className={cn("text-sm", open ? "" : "hidden")}>AI Chat Coming Soon!</p>
        </div>
    </div>
  )
}

export default AiChat
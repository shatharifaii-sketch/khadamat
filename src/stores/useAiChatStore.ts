import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/ai";

interface AIChatStore {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;

    sendMessage: (content: string, pathName: string, userName?: string, lang?: string) => Promise<void>;
    clearChat: () => void;
}

async function sendAIMessage(
    messages: ChatMessage[],
    userMessage: string,
    pathName: string,
    userName?: string,
    lang?: string
) {
    const response = await supabase.functions.invoke('ai-communicate', {
        body: JSON.stringify({
            messages,
            userPrompt: userMessage,
            currentPage: pathName,
            userName,
            lang
        })
    });

    if (response.error) {
        throw new Error(response.error.message);
    }

    return response.data;
}

export const useAiChatStore = create<AIChatStore>()(
    persist<AIChatStore>(
        (set, get) => ({
            messages: [],
            isLoading: false,
            error: null,

            sendMessage: async (content, pathName, userName, lang) => {
                if (!content.trim()) return;
                if (get().isLoading) return;

                const userMessage: ChatMessage = {
                    id: crypto.randomUUID(),
                    role: "user",
                    content,
                    created_at: new Date().toISOString()
                };

                const updatedMessages = [...get().messages, userMessage];

                set({
                    messages: updatedMessages,
                    isLoading: true,
                    error: null,
                });

                try {
                    const { response } = await sendAIMessage(
                        updatedMessages,
                        content,
                        pathName,
                        userName,
                        lang
                    );

                    const assistantMessage: ChatMessage = {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: response,
                        created_at: new Date().toISOString()
                    };


                    set((state) => ({
                        messages: [...state.messages, assistantMessage],
                        isLoading: false
                    }));
                } catch (error) {
                    console.error(error);

                    set({
                        isLoading: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "network_error",
                    });
                }
            },

            clearChat: () => set({ messages: [], error: null })
        }),
        {
            name: "ai-chat-store",
        }
    )
)
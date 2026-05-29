import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/ai";

interface AIChatStore {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;

    sendMessage: (content: string, pathName: string, userName?: string  ) => Promise<void>;
    clearChat: () => void;
}

async function sendAIMessage(
    messages: ChatMessage[],
    userMessage: string,
    pathName: string,
    userName?: string
) {
    const response = await supabase.functions.invoke('ai-communicate', {
        body: JSON.stringify({
            messages,
            userPrompt: userMessage,
            currentPage: pathName,
            userName
        })
    });

    if (response.error) {
        throw new Error(response.error.message);
    }

    return response.data;
}

export const useAiChatStore = create<AIChatStore>((set, get) => ({
    messages: [],
    isLoading: false,
    error: null,

    sendMessage: async (content, pathName, userName) => {
        if (!content.trim()) return;

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
            const { resposne } = await sendAIMessage(
                [...get().messages],
                content,
                pathName,
                userName
            );

            const assistantMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: resposne,
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
                error: "حدث خطاء في الاتصال بالمحادثة. يرجى المحاولة مرة اخرى."
            })
        }
    },

    clearChat: () => set({ messages: [], error: null })
}))
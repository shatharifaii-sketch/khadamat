import { supabase } from "@/integrations/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!activeConversation) return;

        const loadMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select("*")
                .eq('conversation_id', activeConversation.id)
                .order('created_at');

            if (error) {
                console.error('Error fetching messages:', error);
                setMessages([]);
                return;
            }
            setMessages(data || []);
        }

        loadMessages();
    }, [activeConversation]);

    useEffect(() => {
        if (!activeConversation) return;

        const channel = supabase
            .channel(`messages:${activeConversation.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${activeConversation.id}`,
                },
                (payload) => setMessages((prev) => {
                    if (prev.some((m) => m.id === payload.new.id)) return prev;
                    return [...prev, payload.new];
                })
            )
            .subscribe();

        return () => { channel.unsubscribe() };
    }, [activeConversation]);

    const addLocalMessage = (message: any) => {
        setMessages((prev) => [...prev, message]);
    }

    const replaceLocalMessage = (tempId: string, realMessage: any) => {
        setMessages((prev) => prev.map((msg) => msg.id === tempId ? realMessage : msg))
    }

    const removeLocalMessage = (tempId: string) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }

    const validateFile = (file: File): boolean => {
        // Check file type
        if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
            toast.error('يرجى اختيار صور بصيغة PNG أو JPG فقط');
            return false;
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('حجم الصورة يجب أن يكون أقل من 10 ميجابايت');
            return false;
        }

        return true;
    };

    const sendMessage = async ({ content, file }: { content: string, file?: File | string }) => {
        let imageUrl: string | null = null;

        if (!user) return;
        if (!activeConversation) return;
        if (!content.trim() && !file) return;

        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            id: tempId,
            conversation_id: activeConversation.id,
            content,
            file_url: file ? (typeof file === 'string' ? file : URL.createObjectURL(file)) : null,
            sender_id: user?.id,
            created_at: new Date().toISOString(),
            pending: true
        }

        addLocalMessage(tempMessage);

        try {
            if (file && typeof file === 'string') {
                imageUrl = file;
            }
            if (file && typeof file === 'object') {
                if (!validateFile(file)) {
                    removeLocalMessage(tempId);
                    toast.error('فشل في رفع الصورة');
                    return;
                };

                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${activeConversation.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('messages-images')
                    .upload(fileName, file);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    toast.error('فشل في رفع الصورة');
                    return;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('messages-images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            const { data, error } = await supabase
            .from("messages")
            .insert([{
                conversation_id: activeConversation.id,
                content,
                file_url: imageUrl || null,
                sender_id: user.id
            }]).select("*").maybeSingle();

            if (error) {
                console.error('Error sending message:', error);
                toast.error('حدث خطاء في ارسال الرسالة');
                removeLocalMessage(tempId);
                return;
            }

            replaceLocalMessage(tempId, data);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('حدث خطاء في ارسال الرسالة');
            removeLocalMessage(tempId);
        }
    }

    return (
        <ChatContext.Provider
            value={{
                activeConversation,
                setActiveConversation,
                messages,
                sendMessage
            }}
        >
            {children}
        </ChatContext.Provider>
    )
};

export const useChat = () => useContext(ChatContext);

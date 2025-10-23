import { supabase } from "@/integrations/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface Message {
    id: string;
    sender_id: string;
    conversation_id: string;
    content: string;
    created_at: string;
    file_url: string;
    read_at: string | null;
    pending?: boolean;
}

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
                    event: "*",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${activeConversation.id}`,
                },
                (payload) => {
                    console.log('payload received:', payload);

                    switch (payload.eventType) {
                        case 'INSERT':
                            setMessages((prev) => {
                                // Check if message already exists to prevent duplicates
                                const exists = prev.some(msg => msg.id === payload.new.id);
                                console.log('INSERT - Message exists?', exists, 'Current messages:', prev.length);
                                if (exists) return prev;
                                return [...prev, payload.new];
                            });
                            break;
                        case 'UPDATE':
                            setMessages((prev) => prev.map(
                                (msg) => msg.id === payload.new.id ? payload.new : msg
                            ));
                            break;
                        case 'DELETE':
                            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
                            break;
                        default:
                            break;
                    }

                }
            )
            .subscribe();

        return () => { channel.unsubscribe() };
    }, [activeConversation]);

    const addLocalMessage = (message: any) => {
        setMessages((prev) => [...prev, message]);
    }

    const replaceLocalMessage = (tempId: string, realMessage: any) => {
        setMessages((prev) => {
            console.log('Replacing temp message:', tempId, 'with real message:', realMessage.id);
            console.log('Messages before replace:', prev.map(m => ({ id: m.id, pending: m.pending })));
            const updated = prev.map((msg) => msg.id === tempId ? realMessage : msg);
            console.log('Messages after replace:', updated.map(m => ({ id: m.id, pending: m.pending })));
            return updated;
        });
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

                console.log('Uploading image...', typeof file);
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

    const setReadAt = async (conversationId: string) => {
        if (!user) return;
        const readAt = new Date().toISOString();
        setMessages((prev =>
            prev.map(m =>
                m.sender_id !== user?.id ? { ...m, read_at: readAt } : m
            )
        ))

        const { error } = await supabase
            .from('messages')
            .update({ read_at: readAt })
            .eq('conversation_id', conversationId)
            .neq('sender_id', user?.id)
            .is('read_at', null);

        if (error) {
            console.error('Error setting read_at:', error);
            toast.error('حدث خطأ');
        }
    }

    const deleteMessage = async (messageId: string) => {
        removeLocalMessage(messageId);

        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('conversation_id', activeConversation.id)
            .eq('sender_id', user?.id)
            .eq('id', messageId);

        if (error) {
            console.error('Error deleting message:', error);
            toast.error('حدث خطاء في حذف الرسالة');

            const { data: restored } = await supabase
                .from('messages')
                .select('*')
                .eq('id', messageId)
                .maybeSingle();
            if (restored) setMessages(prev => [...prev, restored]);
        }
    }

    return (
        <ChatContext.Provider
            value={{
                activeConversation,
                setActiveConversation,
                messages: messages as Message[],
                sendMessage,
                setReadAt,
                userId: user?.id
            }}
        >
            {children}
        </ChatContext.Provider>
    )
};

export const useChat = () => useContext(ChatContext);

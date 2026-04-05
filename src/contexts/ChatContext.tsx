import { supabase } from "@/integrations/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export interface Message {
    id: string;
    sender_id: string;
    conversation_id: string;
    content: string;
    created_at: string;
    file_url: string;
    read_at: string | null;
    pending?: boolean;
    reply_to_id: string;
    sender: {
        id: string;
        full_name: string;
        profile_image_url: string;
    };
}

const ChatContext = createContext(null);

const getUserConversationsMessages = async ({ convo }: { convo: any }): Promise<Message[]> => {
    const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
                    *,
                    sender:messages_sender_id_fkey1(
                        id,
                        full_name,
                        profile_image_url
                    )
        `)
        .eq('conversation_id', convo.id)
        .order('created_at', { ascending: false });

    if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return;
    }

    if (!messages || messages.length === 0) return []

    return messages as Message[] | [];
}

const getUserConversations = async ({ userId }: { userId: string }) => {
    const { data: userConvos, error: convosError } = await supabase
        .from('conversations')
        .select('*')
        .or(`client_id.eq.${userId},provider_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (convosError) {
        console.error('Error fetching conversations:', convosError);
        return;
    }

    for (const convo of userConvos) {
        const messages = await getUserConversationsMessages({ convo });
        notifyUser({ messages, userId, convo });
    }
}

const isOlderThan2Hours = (created_at: string | Date) =>
    (Date.now() - new Date(created_at).getTime()) > 2 * 60 * 60 * 1000;

const notifyUser = async ({ messages, userId, convo }: { messages: Message[] | any, userId: string, convo: any }) => {
    for (const message of messages) {
        if (message.sender_id !== userId && !message.read_at) {
            toast("تم استلام رسالة جديدة", {
                description: `رسالة جديدة من ${message.sender.full_name}`,
                duration: 3000,
                action: {
                    label: 'عرض الرسالة',
                    onClick: () => {
                        window.location.href = `/chat/${convo.id}/${convo.client_id}/${convo.service_id}/${convo.provider_id}`
                    }
                }
            });

            const res = await sendEmailNotification({ message, userId });

            if (!res.success) {
                console.error('Error sending email notification:', res.error);
            }

            continue;
        }
    }
}

const sendEmailNotification = async ({ message, userId }: { message: Message | any, userId: string }) => {
    if (!message.read_at && !isOlderThan2Hours(message.created_at)) {
        return { success: true, message: 'Message is not older than 2 hours' }
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-notification-dev`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
            'message': message,
            'user_id': userId
        }),
    })

    if (!response.ok) {
        console.error('Error sending email notification:', response);
        return { success: false, error: 'Error sending email notification' }
    }

    return { success: true }
}

const updateMessageReadAt = async ({ message, userId }: { message: Message | any, userId: string }) => {
    if (message.sender_id !== userId && !message.read_at) {
        const { error } = await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('id', message.id);

        if (error) {
            console.error('Error updating message:', error);
            toast.error('حدث خطاء في تحديث الرسالة');
            return;
        }
    }
}

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [needNotifcations, setNeedNotifications] = useState<boolean>(true);
    const location = useLocation();
    const queryClient = useQueryClient();

    const updateConversationsCache = (message: any) => {
        queryClient.setQueryData(
            ['get-conversations', user?.id],
            (old: any[]) => {
                if (!old) return old;

                return old.map((convo) => {
                    if (convo.id !== message.conversation_id) return convo;

                    return {
                        ...convo,
                        last_message: message.content,
                        last_message_sender_id: message.sender_id,
                        last_message_at: message.created_at,
                        unread_messages_count: message.sender_id !== user.id ? convo.unread_messages_count + 1 : convo.unread_messages_count
                    };
                }).sort(
                    (a, b) =>
                        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
                );
            }
        );
    };

    const handleIncomingMessage = async (rawMessage: any) => {
        const message = await enrichMessage(rawMessage);

        updateConversationsCache(message);
        const isActiveChat = activeConversation?.id === message.conversation_id;

        if (message.sender_id !== user?.id && needNotifcations && !isActiveChat) {
            toast("تم استلام رسالة جديدة", {
                description: `رسالة جديدة من ${message.sender.full_name}`,
                duration: 3000,
                action: {
                    label: 'عرض الرسالة',
                    onClick: () => {
                        window.location.href = `/chat/${message.conversation_id}/${message.sender_id}/${message.file_url}/${message.sender_id}`
                    }
                }
            });
        }

        if (activeConversation?.id === message.conversation_id) {
            setMessages((prev) => {
                const exists = prev.some(m => m.id === message.id);
                if (exists) return prev;
                return [...prev, message];
            });

            if (message.sender_id !== user?.id) {
                updateMessageReadAt({ message, userId: user?.id });
            }
        }
    }

    const enrichMessage = async (message: any) => {
        const { data: sender } = await supabase.from('profiles').select('id, full_name, profile_image_url').eq('id', message.sender_id).single();

        return {
            ...message, sender
        }
    }

    useEffect(() => {
        setNeedNotifications(!location.pathname.startsWith('/chat'))
    }, [location.pathname])

    useEffect(() => {
        if (user) {
            if (!activeConversation && needNotifcations) {
                getUserConversations({ userId: user?.id });
            };
        }
    }, [user, needNotifcations, activeConversation]);

    useEffect(() => {
        if (!activeConversation) return;

        setMessages([])

        const loadMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:messages_sender_id_fkey1(
                        id,
                        full_name,
                        profile_image_url
                    )
                    `)
                .eq('conversation_id', activeConversation.id)
                .order('created_at');

            if (error) {
                console.error('Error fetching messages:', error);
                setMessages([]);
                return;
            }

            const filteredMessagesCount = data.filter((message: any) => message.sender_id !== user?.id && !message.read_at).length;

            for (const message of data) {
                updateMessageReadAt({ message, userId: user?.id });
            }

            setUnreadCount(prev => prev - filteredMessagesCount);

            setMessages(data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) || []);
        }

        loadMessages();
    }, [activeConversation]);

    useEffect(() => {
        if (!activeConversation) return;

        setMessages([]);

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
                    switch (payload.eventType) {
                        case 'INSERT':
                            setMessages((prev) => {
                                const exists = prev.some(msg => msg.id === payload.new.id);
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

    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('messages-global')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    const message = payload.new;

                    handleIncomingMessage(message);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

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
                    toast.error('فشل في رفع الصورة', {
                        description: 'الملف أكبر من 10 ميجابايت أو غير مدعوم'
                    });
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
                    removeLocalMessage(tempId);
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
                userId: user?.id,
                deleteMessage,
                unreadCount
            }}
        >
            {children}
        </ChatContext.Provider>
    )
};

export const useChat = () => useContext(ChatContext);

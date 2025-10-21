import { useConversationData } from '@/hooks/useConversations';
import { useState } from 'react'
import ChatSimpleData from './ui/ChatSimpleData';
import ChatConversationView from './ui/ChatConversationView';
import ChatLayout from './ChatLayout';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import ChatMessageInput from './ui/ChatMessageInput';
import { cn } from '@/lib/utils';
import { useChat } from '@/contexts/ChatContext';

interface ConversationViewProps {
    conversationId: string;
    clientId: string;
    serviceId: string;
    providerId: string;
}

const ChatViewWrapper = ({ conversationId, clientId, serviceId, providerId }: ConversationViewProps) => {
    const { conversation } = useConversationData({ conversationId });
    const [attachment, setAttachment] = useState<string | null>(null);
    const { messages, sendMessage } = useChat();

    return (
        <ChatLayout setAttachment={setAttachment} service={conversation?.service}>
            <Card>
                <CardHeader className='shadow-md z-50 w-full'>
                    <ChatSimpleData provider={conversation.provider} />
                </CardHeader>
                <CardContent className={cn(
                    attachment 
                    ? 'min-h-[350px]' 
                    : 'min-h-[480px] lg:min-h-[600px] max-h-[500px]',
                    'overflow-y-auto')}>
                    <ChatConversationView />
                </CardContent>
                <CardFooter className='border-t-2 py-4'>
                    <ChatMessageInput attachment={attachment} setAttachment={setAttachment} />
                </CardFooter>
            </Card>
        </ChatLayout>
    )
}

export default ChatViewWrapper
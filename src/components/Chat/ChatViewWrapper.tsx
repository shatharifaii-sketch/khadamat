import { useConversationData } from '@/hooks/useConversations';
import { useState } from 'react'
import ChatSimpleData from './ui/ChatSimpleData';
import ChatConversationView from './ui/ChatConversationView';
import ChatLayout from './ChatLayout';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import ChatMessageInput from './ui/ChatMessageInput';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ConversationViewProps {
    conversationId: string;
    clientId: string;
    serviceId: string;
    providerId: string;
}

//TODO: LIMIT MESSAGE MEDIA SIZE, NUMBER AND TYPE

const ChatViewWrapper = ({ conversationId, clientId, serviceId, providerId }: ConversationViewProps) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        navigate('/login');
    }

    const { conversation } = useConversationData({ conversationId });
    const [attachment, setAttachment] = useState<string | null>(null);

    /**TODO: add reply to message */
    //const [ replyToMessage, setReplyToMessage ] = useState<Message | null>(null);

    return (
        <ChatLayout setAttachment={setAttachment} service={conversation?.service}>
            <Card>
                <CardHeader className='rounded-t-md border-b-2'>
                    <ChatSimpleData provider={conversation.provider} />
                </CardHeader>
                <CardContent className={cn(
                    attachment
                        ? 'min-h-[350px] max-h-[400px]'
                        : 'min-h-[480px] lg:min-h-[600px] max-h-[500px]',
                    'overflow-y-auto')}>
                    <ChatConversationView
                    //setReplyToMessage={setReplyToMessage}
                    />
                </CardContent>
                <CardFooter className='border-t-2 py-4'>
                    <ChatMessageInput
                        attachment={attachment}
                        setAttachment={setAttachment}
                    //replyToMessage={replyToMessage}
                    //setReplyToMessage={setReplyToMessage}
                    />
                </CardFooter>
            </Card>
        </ChatLayout>
    )
}

export default ChatViewWrapper
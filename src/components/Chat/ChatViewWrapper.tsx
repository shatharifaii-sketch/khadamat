import { useConversationData } from '@/hooks/useConversations';
import React from 'react'
import ChatView from './ChatView';
import ChatSimpleData from './ui/ChatSimpleData';

interface ConversationViewProps {
    conversationId: string;
    clientId: string;
    serviceId: string;
    providerId: string;
}

const ChatViewWrapper = ({ conversationId, clientId, serviceId, providerId }: ConversationViewProps) => {
    const { conversation, conversationError, conversationLoading } = useConversationData({conversationId});

  return (
    <ChatView conversation={conversation}>
        <ChatSimpleData providerId={providerId} clientId={clientId} serviceId={serviceId} />
    </ChatView>
  )
}

export default ChatViewWrapper
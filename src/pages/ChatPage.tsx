import ChatLoading from '@/components/Chat/ChatLoading';
import ChatViewWrapper from '@/components/Chat/ChatViewWrapper';
import ErrorBoundary from '@/components/ErrorBoundary';
import React, { Suspense } from 'react'
import { useParams } from 'react-router-dom';

interface ChatPageParams {
    service_id: string;
    client_id: string;
    provider_id: string;
    [key: string]: string;
}

const ChatPage = () => {
    const { id, service_id: serviceId, client_id: clientId, provider_id: providerId } = useParams<ChatPageParams>();

  return (
    <div className='max-w-4xl mx-auto py-12 px-4 space-y-10'>
            <Suspense fallback={<ChatLoading />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ChatViewWrapper conversationId={id} serviceId={serviceId} clientId={clientId} providerId={providerId} />
            </ErrorBoundary>
        </Suspense>
    </div>
  )
}

export default ChatPage
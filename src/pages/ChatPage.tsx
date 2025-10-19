import React from 'react'
import { useParams } from 'react-router-dom';

interface ChatPageParams {
    service_id: string;
    client_id: string;
    provider_id: string;
    [key: string]: string;
}

const ChatPage = () => {
    const { service_id: serviceId, client_id: clientId, provider_id: providerId } = useParams<ChatPageParams>();

  return (
    <div>ChatPage</div>
  )
}

export default ChatPage
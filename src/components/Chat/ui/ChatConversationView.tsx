import { useChat } from '@/contexts/ChatContext'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';
import React, { useEffect, useRef } from 'react'

const ChatConversationView = () => {
  const { messages, activeConversation } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  if (!activeConversation) {
    return (
      <div className='flex items-center justify-center h-full text-lg text-muted-foreground'>
        المحادثة غير متوفرة
      </div>
    )
  }
  return (
    <div
      ref={containerRef}
      className='flex flex-col gap-3 overflow-y-auto h-full p-4'
      dir='ltr'
    >
      {messages.map((msg) => (
        <div
        key={msg.id}
          className={cn(
            msg.sender_id === activeConversation.provider_id
              ? 'self-start'
              : 'self-end',
            'flex gap-2 items-start'
          )}
        >
          <div
            className={
              cn(
                'p-2 rounded-lg max-w-[75%] min-w-24',
                msg.sender_id === activeConversation.provider_id ? 'bg-blue-100 ' : 'bg-green-100 ',
                msg.pending ? 'opacity-50 animate-pulse' : ''
              )
            }
          >
            {msg.file_url && (
              <img
                src={msg.file_url}
                alt="attachment"
                className='mb-1 rounded-md max-h-48 w-auto'
              />
            )}
            <p>{msg.content}</p>
            <span className='text-xs text-gray-400 mt-1 flex'>
              {new Date(msg.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',})}
            </span>
          </div>
          {msg.pending && (
              <Loader className='animate-spin size-3 text-muted-foreground' />
            )}
        </div>
      ))}
    </div>
  )
}

export default ChatConversationView
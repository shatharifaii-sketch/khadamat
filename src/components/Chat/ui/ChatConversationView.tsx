import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Message, useChat } from '@/contexts/ChatContext'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils';
import { set } from 'date-fns';
import { ArrowDown, ChevronDown, Circle, CircleCheck, CircleCheckBig, Loader } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'

const ChatConversationView = () => {
  const { messages, activeConversation, userId, deleteMessage } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);
  const [messageHover, setMessageHover] = useState(false);
  const [messageHoverId, setMessageHoverId] = useState<string | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages, activeConversation]);

  if (!activeConversation) {
    return (
      <div className='flex items-center justify-center h-full text-lg text-muted-foreground'>
        المحادثة غير متوفرة
      </div>
    )
  }

  const handleDeleteMessage = (id: string) => {
    deleteMessage(id);
    setOpenPopoverId(null);
    setMessageHover(false);
    setMessageHoverId(null);
  }
  return (
    <div
      ref={containerRef}
      className='flex flex-col gap-3 overflow-y-auto h-full p-4'
      dir='ltr'
    >
      {messages.map((msg: Message) => (
        <div
          key={msg.id}
          className={cn(
            msg.sender_id === userId
              ? 'self-end'
              : 'self-start',
            'flex gap-2 items-start'
          )}
          onMouseEnter={() => {
            setMessageHover(true);
            setMessageHoverId(msg.id);
          }}
          onMouseLeave={() => {
            setMessageHover(false);
            setMessageHoverId(null);
          }}
        >
          {
            msg?.sender_id === userId && (
              <Popover
              open={openPopoverId === msg?.id}
              onOpenChange={(open) => setOpenPopoverId(open ? msg.id : null)}
              >
                <PopoverTrigger asChild>
                  <button className={cn(
                  '',
                  messageHover && messageHoverId === msg?.id ? 'block' : 'hidden',
                )}>
                    <ChevronDown className='size-4 text-muted-foreground' />
                  </button>
                  
                </PopoverTrigger>
                <PopoverContent
                  onMouseEnter={() => setOpenPopoverId(msg.id)}
                  onMouseLeave={() => setOpenPopoverId(null)}
                >
                  <Button variant='ghost' className='w-full flex justify-start' onClick={() => handleDeleteMessage(msg.id)}>
                    احذف الرسالة
                  </Button>
                </PopoverContent>
              </Popover>
            )
          }
          <div
            className={
              cn(
                'p-2 rounded-lg max-w-[400px]',
                msg?.sender_id === userId ? 'bg-muted ' : 'bg-primary ',
              )
            }
          >

            {msg?.file_url && (
              <img
                src={msg.file_url}
                alt="attachment"
                className='mb-1 rounded-md max-h-48 w-auto'
              />
            )}
            <p className='text-wrap'>{msg.content}</p>
            <div className='flex justify-between items-center'>
              <span className='text-xs text-gray-400 mt-1 flex'>
                {new Date(msg.created_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </span>
              {msg.sender_id === userId && (
                <span className='mt-1'>
                  {msg.pending ? (
                    <Circle className='size-4 text-muted-foreground font-semibold' />
                  ) : (
                    <CircleCheckBig className={cn(
                      'size-4 text-muted-foreground',
                      msg.read_at ? 'text-blue-500' : ''
                    )} />
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChatConversationView
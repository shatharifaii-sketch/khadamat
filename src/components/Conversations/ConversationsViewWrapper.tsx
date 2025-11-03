import { useConversations } from '@/hooks/useConversations'
import React from 'react'
import { Card } from '../ui/card';
import ConvoLayout from './ConvoLayout';
import { Separator } from '../ui/separator';
import { ChevronLeft, List, Menu, SendHorizonal } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConvoLink from './ui/ConvoLink';

const ConversationsViewWrapper = () => {
    const { conversations } = useConversations();

    return (
        <ConvoLayout>
            {conversations.length > 0 ? (conversations.map((convo) => (
                <div key={convo.id}>
                    <Link to={`/chat/${convo.id}/${convo.client_id}/${convo.service_id}/${convo.provider_id}`} key={convo.id} className='py-2 flex justify-between items-center hover:bg-muted px-2'>
                        <ConvoLink convo={convo} />
                    </Link>
                    <Separator />
                </div>
            ))) : (
                <div className='flex flex-col items-center justify-center gap-10'>
                    <p className='text-muted-foreground'>لا توجد محادثات</p>
                    <List className='size-32 text-muted-foreground/60 border-4 border-muted-foreground/60 rounded-lg' />
                </div>
            )
            }
        </ConvoLayout>
    )
}

export default ConversationsViewWrapper
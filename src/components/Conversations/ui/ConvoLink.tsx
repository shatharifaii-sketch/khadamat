import { useAuth } from '@/contexts/AuthContext'
import { EnrichedConversation } from '@/hooks/useConversations'
import { cn } from '@/lib/utils'
import { ChevronLeft, SendHorizonal } from 'lucide-react'

interface Props {
    convo: EnrichedConversation
}

const ConvoLink = ({ convo }: Props) => {
    const { user } = useAuth();
    return (
        <>
            <div className='flex gap-4 items-center'>
                <div className='bg-green-900 text-muted p-3 rounded-full items-center'>
                    <SendHorizonal className='text-primary-foreground' />
                </div>
                <div className='flex flex-col flex-start'>
                    <h2
                        className={cn('text-lg font-semibold', convo.unread_messages_count > 0 ? 'font-bold' : 'text-muted-foreground')}>
                        {convo.service.title}
                    </h2>
                    <p className='text-muted-foreground/70'>
                        {convo.last_message_sender_id === user?.id ? 'أنت' : convo.last_message_sender_name }: {convo.last_message || 'الرسائل غير موجودة'}
                    </p>
                </div>
            </div>
            <div className='flex items-center gap-4'>
                {convo.unread_messages_count > 0 && <p className='text-muted rounded-full text-xs bg-red-500/70 p-1 size-5 flex items-center justify-center'>{convo.unread_messages_count}</p>}
                <ChevronLeft className='text-muted-foreground/60' />
            </div>
        </>
    )
}

export default ConvoLink
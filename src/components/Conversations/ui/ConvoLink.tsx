import { useAuth } from '@/contexts/AuthContext'
import { EnrichedConversation } from '@/hooks/useConversations'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, SendHorizonal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Props {
    convo: EnrichedConversation
}

const ConvoLink = ({ convo }: Props) => {
    const { t } = useTranslation("chat");
    const lang = localStorage.getItem("language") || "en";
    const { user } = useAuth();

    const chatTitle = () => {
        if (convo.service) {
            return convo.service.title
        } else if (convo.client_id && convo.provider_id) {
            if (convo.client_id === user?.id) {
                return convo.provider.full_name
            } else {
                return convo.client.full_name
            }
        } else {
            return t("convos_unknown_conversation")
        }
    }
    return (
        <>
            <div className='flex gap-4 items-center'>
                <div className='bg-green-900 text-muted p-3 rounded-full items-center'>
                    <SendHorizonal className='text-primary-foreground' />
                </div>
                <div className='flex flex-col flex-start'>
                    <h2
                        className={cn('text-lg font-semibold', convo.unread_messages_count > 0 ? 'font-bold' : 'text-muted-foreground')}>
                        {chatTitle()}
                    </h2>
                    <p className='text-muted-foreground/70'>
                        {convo.last_message_sender_id === user?.id ? t("convos_your_message") : convo.last_message_sender_name }: {convo.last_message || t("convos_no_messages")}
                    </p>
                </div>
            </div>
            <div className='flex items-center gap-4'>
                {convo.unread_messages_count > 0 && <p className='text-muted rounded-full text-xs bg-red-500/70 p-1 size-5 flex items-center justify-center'>{convo.unread_messages_count}</p>}
                {lang === "ar" ? <ChevronLeft className='text-muted-foreground' /> : <ChevronRight className='text-muted-foreground' />}
            </div>
        </>
    )
}

export default ConvoLink
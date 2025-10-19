import { Conversation } from '@/hooks/useConversations'
import React from 'react'

interface Props {
    conversation: Conversation;
    children?: React.ReactNode
}

const ChatView = ({conversation, children}: Props) => {
  return (
    <div>
        <div>DATA</div>
        <div>
            {children}
        </div>
    </div>
  )
}

export default ChatView
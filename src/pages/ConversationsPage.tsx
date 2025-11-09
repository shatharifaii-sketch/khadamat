import ConversationsViewWrapper from '@/components/Conversations/ConversationsViewWrapper'
import ConvosLoading from '@/components/Conversations/ui/ConvosLoading'
import ErrorBoundary from '@/components/ErrorBoundary'
import React, { Suspense } from 'react'

const ConversationsPage = () => {
  return (
    <Suspense fallback={<ConvosLoading />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <ConversationsViewWrapper />
      </ErrorBoundary>
    </Suspense>
  )
}

export default ConversationsPage
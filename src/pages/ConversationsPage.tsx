import ConversationsViewWrapper from '@/components/Conversations/ConversationsViewWrapper'
import ErrorBoundary from '@/components/ErrorBoundary'
import React, { Suspense } from 'react'

const ConversationsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <ConversationsViewWrapper />
      </ErrorBoundary>
    </Suspense>
  )
}

export default ConversationsPage
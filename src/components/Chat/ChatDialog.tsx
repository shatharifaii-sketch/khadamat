
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useOptimizedMessages } from '@/hooks/useOptimizedMessages';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import DOMPurify from 'dompurify';
import MessageInput from './MessageInput';
import { toast } from 'sonner';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string | null;
  serviceName: string;
  providerName: string;
}

const ChatDialog = ({ open, onOpenChange, conversationId, serviceName, providerName }: ChatDialogProps) => {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, isSending } = useOptimizedMessages(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only log on significant state changes to reduce noise
  useEffect(() => {
    if (open && conversationId) {
      console.log('💬 ChatDialog opened:', {
        conversationId,
        messagesCount: messages.length,
        isLoading,
        hasError: false
      });
    }
  }, [open, conversationId, messages.length, isLoading]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0 && open) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length, open, scrollToBottom]);

  const handleSendMessage = useCallback(async (content: string) => {
    try {
      await sendMessage.mutateAsync({ content });
      scrollToBottom();
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      toast.error('فشل في إرسال الرسالة. حاول مرة أخرى.');
      throw error; // Re-throw to let MessageInput handle it
    }
  }, [sendMessage, scrollToBottom]);

  // Memoize the sanitized message content to prevent unnecessary re-renders
  const MessageContent = useMemo(() => {
    return messages.map((message) => (
      <div
        key={message.id}
        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[80%] rounded-lg px-3 py-2 ${
            message.sender_id === user?.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <div 
            className="text-sm"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(message.content, {
                ALLOWED_TAGS: ['br'],
                ALLOWED_ATTR: []
              })
            }}
          />
          <div className="text-xs opacity-70 mt-1">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: ar
            })}
          </div>
        </div>
      </div>
    ));
  }, [messages, user?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-right">
            محادثة حول: {serviceName}
            <div className="text-sm text-muted-foreground font-normal">
              مع: {providerName}
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 border rounded-md">
          <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="mr-2 text-sm text-muted-foreground">جاري تحميل الرسائل...</span>
            </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                لا توجد رسائل بعد. ابدأ المحادثة!
              </div>
            ) : (
              MessageContent
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <MessageInput
            onSendMessage={handleSendMessage}
            isSending={isSending}
            disabled={!conversationId}
            placeholder="اكتب رسالتك..."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;

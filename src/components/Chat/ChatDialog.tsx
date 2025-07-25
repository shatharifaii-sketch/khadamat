
import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import DOMPurify from 'dompurify';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string | null;
  serviceName: string;
  providerName: string;
}

const ChatDialog = ({ open, onOpenChange, conversationId, serviceName, providerName }: ChatDialogProps) => {
  const [messageText, setMessageText] = useState('');
  const { user } = useAuth();
  const { getMessages, sendMessage, isSending } = useMessages(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => getMessages.data || [], [getMessages.data]);

  console.log('💬 ChatDialog state:', {
    open,
    conversationId,
    messagesCount: messages.length,
    isLoading: getMessages.isLoading,
    error: getMessages.error?.message
  });

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Reset message text when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setMessageText('');
    }
  }, [open]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) {
      console.log('⚠️ Cannot send message:', { 
        hasText: !!messageText.trim(), 
        isSending 
      });
      return;
    }

    console.log('📤 Sending message:', messageText);
    
    try {
      await sendMessage.mutateAsync({ content: messageText });
      setMessageText('');
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('💥 Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
            {getMessages.isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="mr-2 text-sm text-muted-foreground">جاري تحميل الرسائل...</span>
              </div>
            ) : getMessages.error ? (
              <div className="text-center text-red-500 py-8">
                <p>حدث خطأ في تحميل الرسائل</p>
                <p className="text-xs mt-2">{getMessages.error.message}</p>
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

        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="اكتب رسالتك..."
            onKeyPress={handleKeyPress}
            disabled={isSending || !conversationId}
            className="text-right"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending || !conversationId}
            size="icon"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;

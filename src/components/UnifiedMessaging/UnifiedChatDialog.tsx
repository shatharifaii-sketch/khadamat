import { useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useUnifiedMessaging } from '@/hooks/useUnifiedMessaging';
import { useAuth } from '@/contexts/AuthContext';
import MessageInput from '@/components/Chat/MessageInput';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import DOMPurify from 'dompurify';
import type { ConversationDetail } from '@/hooks/useUnifiedMessaging';
import { toast } from 'sonner';
import { useState } from 'react';

interface UnifiedChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: ConversationDetail;
}

const UnifiedChatDialog = ({ open, onOpenChange, conversation }: UnifiedChatDialogProps) => {
  const { user } = useAuth();
  const {
    messages,
    messagesLoading,
    isSending,
    sendMessage,
    getConversationDetails
  } = useUnifiedMessaging();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastMessageStatus, setLastMessageStatus] = useState<'sending' | 'sent' | 'error' | null>(null);

  const scrollToBottom = useMemo(() => {
    return () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setLastMessageStatus('sending');
    
    try {
      await sendMessage({ content });
      setLastMessageStatus('sent');
      toast.success('تم إرسال الرسالة بنجاح');
      
      // Clear status after 2 seconds
      setTimeout(() => setLastMessageStatus(null), 2000);
    } catch (error) {
      setLastMessageStatus('error');
      console.error('Failed to send message:', error);
      
      // Clear error status after 3 seconds
      setTimeout(() => setLastMessageStatus(null), 3000);
    }
  };

  const conversationDetails = getConversationDetails(conversation);

  const MessageContent = useMemo(() => {
    if (messagesLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="mr-2">جاري تحميل الرسائل...</span>
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>لا توجد رسائل في هذه المحادثة</p>
          <p className="text-sm mt-2">ابدأ المحادثة بإرسال رسالة!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.sender_id === user?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <div
                className="text-sm break-words"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(message.content.replace(/\n/g, '<br>'))
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
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  }, [messages, messagesLoading, user?.id]);

  const MessageStatusIndicator = () => {
    if (!lastMessageStatus) return null;

    return (
      <div className="flex items-center justify-center py-2">
        {lastMessageStatus === 'sending' && (
          <div className="flex items-center text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
            جاري الإرسال...
          </div>
        )}
        {lastMessageStatus === 'sent' && (
          <div className="flex items-center text-green-600 text-sm">
            <CheckCircle className="h-4 w-4 ml-2" />
            تم الإرسال
          </div>
        )}
        {lastMessageStatus === 'error' && (
          <div className="flex items-center text-red-600 text-sm">
            <XCircle className="h-4 w-4 ml-2" />
            فشل الإرسال
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            <div className="text-lg font-semibold">
              {conversationDetails.context}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              مع: {conversationDetails.otherPartyName}
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            نافذة المحادثة للتواصل حول الخدمة
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 border rounded-md">
          {MessageContent}
        </ScrollArea>

        <MessageStatusIndicator />

        <div className="p-4 border-t">
          <MessageInput
            onSendMessage={handleSendMessage}
            isSending={isSending}
            placeholder="اكتب رسالتك..."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedChatDialog;

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Mail, MessageCircle, Loader2 } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import ChatDialog from './ChatDialog';
import { toast } from 'sonner';

interface ContactOptionsProps {
  serviceId: string;
  providerId: string;
  serviceName: string;
  providerName: string;
  email: string;
}

const ContactOptions = ({ serviceId, providerId, serviceName, providerName, email }: ContactOptionsProps) => {
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const { createConversation, isCreating } = useConversations();

  const handleEmailContact = () => {
    const subject = encodeURIComponent(`استفسار حول: ${serviceName}`);
    const body = encodeURIComponent(`مرحباً،\n\nأود الاستفسار حول خدمة "${serviceName}".\n\nشكراً لك.`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
    toast.success('تم فتح برنامج البريد الإلكتروني');
  };

  const handleChatContact = async () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    if (user.id === providerId) {
      toast.error('لا يمكنك محادثة نفسك');
      return;
    }

    try {
      const conversation = await createConversation.mutateAsync({
        serviceId,
        providerId
      });
      setConversationId(conversation.id);
      setShowChat(true);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="flex-1">
            أرسل رسالة
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleEmailContact}
            >
              <Mail size={16} />
              إرسال إيميل
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleChatContact}
              disabled={isCreating || !user}
            >
              {isCreating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <MessageCircle size={16} />
              )}
              محادثة داخل الموقع
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <ChatDialog
        open={showChat}
        onOpenChange={setShowChat}
        conversationId={conversationId}
        serviceName={serviceName}
        providerName={providerName}
      />
    </>
  );
};

export default ContactOptions;

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Mail, Phone, Copy, MessageCirclePlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { cn } from '@/lib/utils';
import { useConversations } from '@/hooks/useConversations';
import { start } from 'repl';
import { useEffect } from 'react';

interface ContactOptionsProps {
  serviceId?: string;
  providerId: string;
  serviceName?: string;
  providerName: string;
  email: string;
  phone?: string;
  className?: string;
  isConvo: boolean;
  setIsConvo: (isConvo: boolean) => void;
  convoId: string | null;
  setConvoId: (id: string | null) => void;
}

const ContactOptions = ({ 
  serviceId, 
  serviceName, 
  providerName, 
  email, 
  phone, 
  className, 
  providerId, 
  isConvo, 
  setIsConvo,
  convoId, 
  setConvoId
}: ContactOptionsProps) => {
  const { trackServiceAction } = useAnalyticsTracking();
  const { startConversation, startConversationSuccess } = useConversations();

  useEffect(() => {
    if (startConversationSuccess) {
      setIsConvo(true);
    }
  }, [startConversationSuccess])

  const handleEmailContact = () => {
    console.log('📧 Opening email client for service:', serviceName);
    const subject = encodeURIComponent(`استفسار حول: ${serviceName}`);
    const body = encodeURIComponent(`مرحباً،\n\nأود الاستفسار حول خدمة "${serviceName}".\n\nشكراً لك.`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
    toast.success('تم فتح برنامج البريد الإلكتروني');

    if (serviceId && serviceName) {
      // Track email contact action
      trackServiceAction.mutate({
        serviceId,
        actionType: 'email_click'
      });
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    toast.success('تم نسخ عنوان البريد الإلكتروني');

    if (serviceId && serviceName) {
      // Track email contact action
      trackServiceAction.mutate({
        serviceId,
        actionType: 'contact_click'
      });
    }
  };

  const handlePhoneCall = () => {
    if (phone) {
      window.open(`tel:${phone}`);
      toast.success('تم فتح تطبيق الهاتف');

      // Track phone contact action
      trackServiceAction.mutate({
        serviceId,
        actionType: 'phone_click'
      });
    }
  };

  const handleCopyPhone = () => {
    if (phone) {
      navigator.clipboard.writeText(phone);
      toast.success('تم نسخ رقم الهاتف');

      if (serviceId && serviceName) {
        // Track phone contact action
        trackServiceAction.mutate({
          serviceId,
          actionType: 'contact_click'
        });
      }
    }
  };

  const handleStartChat = () => {
    startConversation.mutateAsync({ 
      serviceId, providerId, providerName 
    },
  ).then((data) => {
    if (!data) return;
    setIsConvo(true);
    setConvoId(data.id);
  });

    trackServiceAction.mutate({
      serviceId: serviceId!,
      actionType: 'chat_start'
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className={className}>
          تواصل معنا
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-2">
          <div className="text-sm font-medium text-center mb-3">
            تواصل مع: {providerName}
          </div>

          <div className="space-y-2">
            {!isConvo && (
              <div className="flex">
                <Button
                  variant="outline"
                  className="flex-1 justify-start gap-2"
                  onClick={handleStartChat}
                >
                  <MessageCirclePlus size={16} />
                  إرسال رسالة خاصة
                </Button>
              </div>
            )}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                className="flex-1 justify-start gap-2"
                onClick={handleEmailContact}
              >
                <Mail size={16} />
                إرسال إيميل
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyEmail}
                title="نسخ البريد الإلكتروني"
              >
                <Copy size={16} />
              </Button>
            </div>

            {phone && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  className="flex-1 justify-start gap-2"
                  onClick={handlePhoneCall}
                >
                  <Phone size={16} />
                  اتصال هاتفي
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyPhone}
                  title="نسخ رقم الهاتف"
                >
                  <Copy size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ContactOptions;
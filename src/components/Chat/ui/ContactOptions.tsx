import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Mail, Phone, Copy, MessageCirclePlus, ArrowLeftToLine } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { cn, isMobile } from '@/lib/utils';
import { useConversations } from '@/hooks/useConversations';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';

interface ContactOptionsProps {
  serviceId?: string;
  providerId: string;
  serviceName?: string;
  providerName: string;
  email: string;
  phone?: string;
  className?: string;
  isConvo?: boolean;
  setIsConvo?: (isConvo: boolean) => void;
  convoId?: string | null;
  setConvoId?: (id: string | null) => void;
  userId?: string;
  publisherId?: string;
  whatsappNumber?: string;
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
  setConvoId,
  userId,
  publisherId,
  whatsappNumber
}: ContactOptionsProps) => {
  const { t } = useTranslation("services");
  const { trackServiceAction } = useAnalyticsTracking();
  const { startConversation, startConversationSuccess } = useConversations();
  const navigate = useNavigate();

  useEffect(() => {
    if (startConversationSuccess) {
      setIsConvo(true);
    }
  }, [setIsConvo, startConversationSuccess])

  const handleEmailContact = () => {
    console.log('📧 Opening email client for service:', serviceName);
    const subject = encodeURIComponent(`${t("find_service.card.inquiry")}: ${serviceName}`);
    const body = encodeURIComponent(t("find_service.card.inquiry_body", { serviceName }));
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
    toast.success(t("find_service.card.inquiry_success_toast"));

    if (serviceId && serviceName) {
      // Track email contact action
      trackServiceAction.mutate({
        serviceId,
        actionType: 'email_click'
      });
    }
  };

  const handleWhatsappContact = () => {
    if (!whatsappNumber) return;

    console.log('📧 Opening whatsapp client for service:', serviceName, whatsappNumber);

    const encodedMessage = encodeURIComponent(
      t("find_service.card.whatsapp_contact_message", { serviceName })
    );

    const url = isMobile
      ? `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
      : `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

    window.open(url, '_blank');
    toast.success(t("find_service.card.whatsapp_contact_success_toast"));
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    toast.success(t("find_service.card.email_copy_toast"));

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
      toast.success(t("find_service.card.phone_success_toast"));

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
      toast.success(t("find_service.card.phone_copy_toast"));

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
    if (!userId) {
      toast.error(t("find_service.card.login_to_chat"), {
        icon: (
          <>
            <ArrowLeftToLine size={16} />
          </>
        ),
        action: {
          label: t("find_service.card.login"),
          onClick: () => {
            navigate('/auth');
          }
        }
      });
      return;
    }
    startConversation.mutateAsync({
      serviceId, providerId, providerName
    },
    ).then((data) => {
      if (!data) return;
      console.log(data)

      setIsConvo(true);
      setConvoId(data.id);
      navigate(`/chat/${data.id}/${userId}${serviceId ? `/${serviceId}` : ''}/${publisherId}`);
    });

    if (serviceId) {
      trackServiceAction.mutate({
        serviceId: serviceId,
        actionType: 'chat_start'
      })
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className={className}>
          {t("find_service.card.contact_us")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-2">
          <div className="text-sm font-medium text-center mb-3">
            {t("find_service.card.contact_provider", { providerName })}
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
                  {t("find_service.card.dm_contact")}
                </Button>
              </div>
            )}
            <div className="flex gap-1">
              <Button
                variant="default"
                className="flex-1 justify-start gap-2 bg-[#25D366] text-white"
                disabled={!whatsappNumber}
                onClick={handleWhatsappContact}
              >
                <FaWhatsapp size={30} />
                {t("find_service.card.whatsapp_contact")}
              </Button>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                className="flex-1 justify-start gap-2"
                onClick={handleEmailContact}
              >
                <Mail size={16} />
                {t("find_service.card.email_contact")}
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
                  {t("find_service.card.phone_contact")}
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
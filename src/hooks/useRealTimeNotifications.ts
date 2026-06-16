import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, MessageCircle, User, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type NotificationType = 'message' | 'service_inquiry' | 'service_approved' | 'payment_success' | 'profile_update';

interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    console.log('🔔 Setting up real-time notifications for user:', user.id);

    // Main notifications channel
    const notificationsChannel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          // Handle new messages
          if (payload.new.sender_id !== user.id) {
            supabase
              .from('conversations')
              .select(`
                id, 
                service_id,
                client_id,
                provider_id,
                services(title)
              `)
              .eq('id', payload.new.conversation_id)
              .or(`client_id.eq.${user.id},provider_id.eq.${user.id}`)
              .single()
              .then(({ data }) => {
                if (data) {
                  const isClientConversation = data.client_id === user.id;
                  const otherParty = isClientConversation ? t("provider") : t("client");

                  toast(t("new_message"), {
                    description: t("new_message_description", { name: otherParty, title: data.services?.title }) || `من ${otherParty} - ${data.services?.title || 'خدمة'}`,
                    action: {
                      label: t("view") || 'عرض',
                      onClick: () => window.location.href = '/messages'
                    },
                    duration: 5000,
                  });
                }
              });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          // Handle new service inquiries for providers
          supabase
            .from('services')
            .select('title')
            .eq('id', payload.new.service_id)
            .single()
            .then(({ data }) => {
              if (data) {
                toast(t("new_service_inquiry") || 'استفسار جديد!', {
                  description: t("new_service_inquiry_description", { title: data.title }) || `استفسار جديد حول خدمة: ${data.title}`,
                  action: {
                    label: t("reply") || 'رد',
                    onClick: () => window.location.href = '/messages'
                  },
                  duration: 8000,
                });
              }
            });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'services',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Handle service status changes
          if (payload.old.status !== payload.new.status) {
            if (payload.new.status === 'published') {
              toast.success(t("service_published") || 'تم نشر خدمتك!', {
                description: t("service_available_now", { title: payload.new.title }) || `خدمة "${payload.new.title}" متاحة الآن للعملاء`,
                action: {
                  label: t("view") || 'عرض',
                  onClick: () => window.location.href = '/account'
                },
                duration: 10000,
              });
            } else if (payload.new.status === 'rejected') {
              toast.error(t("service_rejected") || 'تم رفض الخدمة', {
                description: t("service_needs_review", { title: payload.new.title }) || `خدمة "${payload.new.title}" تحتاج إلى مراجعة`,
                action: {
                  label: t("edit") || 'تعديل',
                  onClick: () => window.location.href = '/post-service'
                }
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Handle payment status changes
          if (payload.old.status !== payload.new.status && payload.new.status === 'completed') {
            toast.success(t("payment_completed") || 'تم الدفع بنجاح!', {
              description: t("payment_completed_description", { amount: payload.new.amount, currency: payload.new.currency }) || `تم تأكيد دفعتك بقيمة ${payload.new.amount} ${payload.new.currency}`,
              action: {
                label: t("view_account") || 'عرض الحساب',
                onClick: () => window.location.href = '/account'
              },
              duration: 10000,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 Notifications subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Invalidate relevant queries when notifications come in
    const invalidateQueries = () => {
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['provider-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    };

    // Set up periodic query invalidation for fresh data
    const interval = setInterval(invalidateQueries, 30000); // Every 30 seconds

    return () => {
      console.log('🔌 Cleaning up notifications subscription');
      clearInterval(interval);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user, queryClient]);

  const showCustomNotification = (data: NotificationData) => {
    const getIcon = (type: NotificationType) => {
      switch (type) {
        case 'message': return MessageCircle;
        case 'service_inquiry': return Bell;
        case 'service_approved': return Star;
        case 'payment_success': return Star;
        case 'profile_update': return User;
        default: return Bell;
      }
    };

    const IconComponent = getIcon(data.type);

    toast(data.title, {
      description: data.message,
      action: data.actionUrl ? {
        label: t("view") || 'عرض',
        onClick: () => window.location.href = data.actionUrl!
      } : undefined,
      duration: 5000,
    });
  };

  return {
    isConnected,
    showCustomNotification
  };
};
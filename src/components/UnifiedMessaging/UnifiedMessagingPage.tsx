import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Loader2, ArrowLeft, MessageCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useUnifiedMessaging } from '@/hooks/useUnifiedMessaging';
import ConversationCard from '@/components/Messages/ConversationCard';
import MessagesLoadingState from '@/components/Messages/MessagesLoadingState';
import UnifiedChatDialog from './UnifiedChatDialog';

const UnifiedMessagingPage = () => {
  const [showChat, setShowChat] = useState(false);
  const { user, loading } = useAuth();
  const {
    conversations,
    conversationsLoading,
    conversationsError,
    selectedConversation,
    selectedConversationData,
    selectConversation,
    getConversationDetails,
    refetchConversations
  } = useUnifiedMessaging();

  if (loading) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <User size={64} className="mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-2xl font-bold mb-2">تسجيل الدخول مطلوب</h2>
                <p className="text-muted-foreground text-large mb-6">
                  يجب تسجيل الدخول لعرض رسائلك
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg">تسجيل الدخول</Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg">العودة للرئيسية</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleOpenChat = (conversationId: string) => {
    selectConversation(conversationId);
    setShowChat(true);
  };

  // Error handling
  if (conversationsError) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <p className="text-destructive mb-4">حدث خطأ في تحميل المحادثات</p>
            <Button onClick={() => refetchConversations()}>إعادة المحاولة</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link to="/account" className="shrink-0">
            <Button variant="ghost" size="sm" className="group">
              <ArrowLeft className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              العودة للحساب
            </Button>
          </Link>
          <div className="text-center sm:text-right flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              الرسائل
            </h1>
            <p className="text-muted-foreground text-lg">
              جميع محادثاتك واستفساراتك في مكان واحد
            </p>
          </div>
        </div>

        {/* Content */}
        {conversationsLoading ? (
          <MessagesLoadingState />
        ) : conversations.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <MessageCircle size={64} className="mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-xl font-semibold mb-2">لا توجد رسائل</h2>
                <p className="text-muted-foreground mb-6">
                  لم تبدأ أي محادثة بعد. ابحث عن خدمة وتواصل مع مقدمي الخدمات!
                </p>
              </div>
              <Link to="/find-service">
                <Button>ابحث عن خدمة</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onOpenChat={handleOpenChat}
                getConversationDetails={getConversationDetails}
              />
            ))}
          </div>
        )}
      </div>

      {selectedConversationData && (
        <UnifiedChatDialog
          open={showChat}
          onOpenChange={setShowChat}
          conversation={selectedConversationData}
        />
      )}
    </div>
  );
};

export default UnifiedMessagingPage;
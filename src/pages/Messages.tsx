
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Loader2, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useOptimizedConversations } from '@/hooks/useOptimizedConversations';
import { useAuth } from '@/contexts/AuthContext';
import ChatDialog from '@/components/Chat/ChatDialog';
import { Link } from 'react-router-dom';
import type { ConversationDetail } from '@/hooks/useOptimizedConversations';
import ConversationCard from '@/components/Messages/ConversationCard';
import MessagesEmptyState from '@/components/Messages/MessagesEmptyState';
import MessagesLoadingState from '@/components/Messages/MessagesLoadingState';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { user, loading } = useAuth();
  const { conversations, isLoading, error, refetch } = useOptimizedConversations();

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

  // Use optimized conversations data
  const allConversations = conversations;

  const handleOpenChat = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowChat(true);
  };

  const selectedConv = allConversations.find(c => c.id === selectedConversation);

  // Helper function to get the other party's name and service context
  const getConversationDetails = (conversation: ConversationDetail) => {
    if (conversation.conversation_type === 'client') {
      // User is the client, show provider name
      return {
        otherPartyName: conversation.other_party_name,
        context: `محادثة حول: ${conversation.service_title || 'خدمة محذوفة'}`,
        roleLabel: 'استفسار أرسلته'
      };
    } else {
      // User is the provider, show client name
      return {
        otherPartyName: conversation.other_party_name,
        context: `استفسار حول: ${conversation.service_title || 'خدمة محذوفة'}`,
        roleLabel: 'استفسار وارد'
      };
    }
  };

  // Error handling
  if (error) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <p className="text-destructive mb-4">حدث خطأ في تحميل المحادثات</p>
            <Button onClick={() => refetch()}>إعادة المحاولة</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with improved mobile layout */}
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
        {isLoading ? (
          <MessagesLoadingState />
        ) : allConversations.length === 0 ? (
          <MessagesEmptyState />
        ) : (
          <div className="space-y-4">
            {allConversations.map((conversation) => (
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

      

      {selectedConv && (
        <ChatDialog
          open={showChat}
          onOpenChange={setShowChat}
          conversationId={selectedConversation}
          serviceName={selectedConv.service_title || 'خدمة محذوفة'}
          providerName={getConversationDetails(selectedConv).otherPartyName}
        />
      )}
    </div>
  );
};

export default Messages;
